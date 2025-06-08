
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Mic, MicOff, Loader2, Send, AlertTriangle, CheckCircle } from "lucide-react"; // Added CheckCircle
import { interpretVoiceExpense, type InterpretVoiceExpenseInput, type InterpretVoiceExpenseOutput } from "@/ai/flows/interpret-voice-expense-flow";
import { useAuth } from "@/contexts/auth-context";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface VoiceInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInterpretationComplete: (data: InterpretedVoiceExpense) => void;
}

type RecordingState = "idle" | "permission_pending" | "recording" | "processing" | "error" | "success";

export default function VoiceInputDialog({ open, onOpenChange, onInterpretationComplete }: VoiceInputDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [interpretationResult, setInterpretationResult] = useState<InterpretedVoiceExpense | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isApiSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (open && !isApiSupported) {
      toast({
        variant: "destructive",
        title: "Fonctionnalité non supportée",
        description: "La reconnaissance vocale n'est pas supportée par votre navigateur.",
      });
      onOpenChange(false);
      return;
    }

    if (open && isApiSupported && !recognitionRef.current) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.lang = 'fr-FR';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setTranscribedText(speechResult);
        setRecordingState("processing");
        handleInterpretation(speechResult);
      };

      recognitionRef.current.onspeechend = () => {
        recognitionRef.current?.stop();
        if (recordingState === "recording") {
            setRecordingState("processing");
        }
      };

      recognitionRef.current.onnomatch = () => {
        setErrorState("Aucune parole n'a été détectée. Veuillez réessayer.");
        setRecordingState("error");
      };

      recognitionRef.current.onerror = (event) => {
        if (event.error === 'no-speech') {
          setErrorState("Aucune parole n'a été détectée. Veuillez réessayer.");
        } else if (event.error === 'audio-capture') {
          setErrorState("Problème de capture audio. Vérifiez votre microphone.");
        } else if (event.error === 'not-allowed') {
          setErrorState("Permission d'utiliser le microphone refusée.");
        } else {
          setErrorState(`Erreur de reconnaissance vocale: ${event.error}`);
        }
        setRecordingState("error");
      };
    }
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
    };
  }, [open, isApiSupported, toast, onOpenChange, recordingState]); // Removed handleInterpretation from deps

  const requestMicrophonePermission = async () => {
    setRecordingState("permission_pending");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      setErrorState("Permission d'utiliser le microphone refusée. Veuillez l'activer dans les paramètres de votre navigateur.");
      setRecordingState("error");
      toast({
        variant: "destructive",
        title: "Accès au microphone refusé",
        description: "Veuillez autoriser l'accès au microphone pour utiliser cette fonctionnalité.",
      });
      return false;
    }
  };

  const startRecording = async () => {
    if (!recognitionRef.current) return;
    setTranscribedText("");
    setInterpretationResult(null);
    setErrorState(null);

    const permissionGranted = await requestMicrophonePermission();
    if (!permissionGranted) return;
    
    setRecordingState("recording");
    try {
      recognitionRef.current.start();
    } catch (e) {
      setErrorState("Impossible de démarrer l'enregistrement. Veuillez réessayer.");
      setRecordingState("error");
       console.error("Error starting recognition:", e);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && recordingState === "recording") {
      recognitionRef.current.stop();
    }
    // State transition to "processing" will be handled by onspeechend or onresult
  };
  
  const handleInterpretation = useCallback(async (text: string) => { // useCallback added
    if (!text.trim()) {
        setErrorState("Aucun texte à interpréter. Veuillez réessayer.");
        setRecordingState("error");
        return;
    }
    setRecordingState("processing");
    try {
      const input: InterpretVoiceExpenseInput = {
        transcribed_text: text,
        user_preferred_currency: user?.primary_currency || "EUR",
        current_date: format(new Date(), "yyyy-MM-dd"),
      };
      const result = await interpretVoiceExpense(input);
      setInterpretationResult(result);
      if (result.error) {
        setErrorState(result.error);
        setRecordingState("error");
      } else if (!result.amount) {
        setErrorState("Le montant n'a pas pu être déterminé. Veuillez être plus précis.");
        setRecordingState("error");
      }
      else {
        setRecordingState("success");
      }
    } catch (error) {
      console.error("Error interpreting voice input:", error);
      setErrorState("Erreur lors de l'interprétation de votre demande.");
      setRecordingState("error");
    }
  }, [user?.primary_currency]); // Dependencies for useCallback

  const handleCloseDialog = () => {
    if (recognitionRef.current && (recordingState === "recording" || recordingState === "permission_pending")) {
      recognitionRef.current.abort();
    }
    setRecordingState("idle");
    setTranscribedText("");
    setInterpretationResult(null);
    setErrorState(null);
    onOpenChange(false);
  };

  const handleConfirmAndProceed = () => {
    if (interpretationResult && !interpretationResult.error && interpretationResult.amount) {
      onInterpretationComplete(interpretationResult);
    }
    handleCloseDialog();
  };


  const renderContent = () => {
    switch (recordingState) {
      case "idle":
        return (
          <Button onClick={startRecording} className="w-full text-lg py-8">
            <Mic className="mr-2 h-6 w-6" /> Commencer l'enregistrement
          </Button>
        );
      case "permission_pending":
        return (
          <div className="text-center space-y-2 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p>Demande d'accès au microphone...</p>
          </div>
        );
      case "recording":
        return (
          <div className="text-center space-y-4 py-8">
            <Mic className="h-16 w-16 text-destructive animate-pulse mx-auto" />
            <p className="text-lg font-medium">Parlez maintenant...</p>
            <Button onClick={stopRecording} variant="outline">Arrêter l'enregistrement</Button>
          </div>
        );
      case "processing":
        return (
          <div className="text-center space-y-2 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p>Traitement de votre demande...</p>
            {transcribedText && <p className="text-sm text-muted-foreground">Texte détecté : "{transcribedText}"</p>}
          </div>
        );
      case "success":
        return (
          <div className="space-y-4">
            <Alert variant="default" className="border-green-500 dark:border-green-600">
              <AlertTitle className="flex items-center gap-2 text-green-700 dark:text-green-400"><CheckCircle className="h-5 w-5" /> Interprétation réussie !</AlertTitle>
              <AlertDescription>
                <p className="font-semibold">Texte original : "{interpretationResult?.original_text}"</p>
                <ul className="mt-2 list-disc list-inside text-sm">
                  {interpretationResult?.amount && <li>Montant : {interpretationResult.amount} {interpretationResult.currency}</li>}
                  {interpretationResult?.type && <li>Type : {interpretationResult.type === 'depense' ? 'Dépense' : 'Recette'}</li>}
                  {interpretationResult?.description_suggestion && <li>Description : {interpretationResult.description_suggestion}</li>}
                  {interpretationResult?.category_suggestion && <li>Catégorie suggérée : {interpretationResult.category_suggestion}</li>}
                  {interpretationResult?.date_suggestion && <li>Date suggérée : {format(parseISO(interpretationResult.date_suggestion), "PPP", { locale: fr })}</li>}
                </ul>
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">Vérifiez les informations. Cliquez sur "Valider" pour pré-remplir le formulaire d'ajout de transaction.</p>
          </div>
        );
      case "error":
        return (
           <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{errorState || "Une erreur inconnue s'est produite."}</AlertDescription>
            {transcribedText && <p className="text-sm mt-2">Texte détecté : "{transcribedText}"</p>}
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajout vocal de transaction</DialogTitle>
          <DialogDescription>
            Dictez votre transaction (ex: "Courses 50 euros chez Carrefour hier").
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 min-h-[150px] flex items-center justify-center">
            {renderContent()}
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <div>
            {recordingState === "error" && (
                <Button onClick={startRecording} variant="outline">Réessayer</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={handleCloseDialog}>
                {recordingState === "success" || recordingState === "error" ? "Fermer" : "Annuler"}
            </Button>
            {recordingState === "success" && interpretationResult && !interpretationResult.error && interpretationResult.amount && (
                <Button onClick={handleConfirmAndProceed}>Valider et pré-remplir</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

