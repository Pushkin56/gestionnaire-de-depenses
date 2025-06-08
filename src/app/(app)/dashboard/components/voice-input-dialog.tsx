
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Mic, MicOff, Loader2, Send, AlertTriangle } from "lucide-react";
import { interpretVoiceExpense, type InterpretVoiceExpenseInput, type InterpretVoiceExpenseOutput } from "@/ai/flows/interpret-voice-expense-flow";
import { useAuth } from "@/contexts/auth-context";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface VoiceInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInterpretationComplete: (data: InterpretVoiceExpenseOutput) => void; // Callback for next step
}

type RecordingState = "idle" | "permission_pending" | "recording" | "processing" | "error" | "success";

export default function VoiceInputDialog({ open, onOpenChange, onInterpretationComplete }: VoiceInputDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [interpretationResult, setInterpretationResult] = useState<InterpretVoiceExpenseOutput | null>(null);
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
      onOpenChange(false); // Close dialog if not supported
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
        if (recordingState === "recording") { // If still recording, means no speech was detected or processed yet
            setRecordingState("processing"); // Move to processing, then handle no result
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
     // Cleanup on unmount or when dialog closes
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
    };
  }, [open, isApiSupported, toast, onOpenChange, recordingState]);


  const requestMicrophonePermission = async () => {
    setRecordingState("permission_pending");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Permission granted, we can close the stream as SpeechRecognition will handle its own
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
      // Catch potential errors if recognition is already started or other issues
      setErrorState("Impossible de démarrer l'enregistrement. Veuillez réessayer.");
      setRecordingState("error");
       console.error("Error starting recognition:", e);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && recordingState === "recording") {
      recognitionRef.current.stop();
    }
    setRecordingState("processing"); // Assume processing will happen or error out
  };
  
  const handleInterpretation = async (text: string) => {
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
        // For now, we just log. Later, this will pre-fill the form.
        console.log("Interpretation result:", result);
        // onInterpretationComplete(result); // This will be used to pass data to next step
      }
    } catch (error) {
      console.error("Error interpreting voice input:", error);
      setErrorState("Erreur lors de l'interprétation de votre demande.");
      setRecordingState("error");
    }
  };

  const handleCloseDialog = () => {
    if (recognitionRef.current && (recordingState === "recording" || recordingState === "permission_pending")) {
      recognitionRef.current.abort(); // Stop any ongoing recognition
    }
    setRecordingState("idle");
    setTranscribedText("");
    setInterpretationResult(null);
    setErrorState(null);
    onOpenChange(false);
  };

  const handleConfirmAndClose = () => {
    if (interpretationResult && !interpretationResult.error) {
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
            <Alert variant="default">
              <AlertTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> Interprétation réussie !</AlertTitle>
              <AlertDescription>
                <p className="font-semibold">Texte original : "{interpretationResult?.original_text}"</p>
                <ul className="mt-2 list-disc list-inside text-sm">
                  {interpretationResult?.amount && <li>Montant : {interpretationResult.amount} {interpretationResult.currency}</li>}
                  {interpretationResult?.type && <li>Type : {interpretationResult.type === 'depense' ? 'Dépense' : 'Recette'}</li>}
                  {interpretationResult?.description_suggestion && <li>Description : {interpretationResult.description_suggestion}</li>}
                  {interpretationResult?.category_suggestion && <li>Catégorie suggérée : {interpretationResult.category_suggestion}</li>}
                  {interpretationResult?.date_suggestion && <li>Date suggérée : {format(new Date(interpretationResult.date_suggestion), "PPP", { locale: fr })}</li>}
                </ul>
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">Cette fonctionnalité est expérimentale. Vérifiez les informations avant d'ajouter la transaction.</p>
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
          <DialogTitle>Ajout vocal de dépense</DialogTitle>
          <DialogDescription>
            Dictez votre dépense (ex: "Courses 50 euros chez Carrefour hier").
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 min-h-[150px] flex items-center justify-center">
            {renderContent()}
        </div>
        <DialogFooter>
          {recordingState === "error" && (
            <Button onClick={startRecording} variant="outline">Réessayer</Button>
          )}
          {recordingState === "success" && (
             <Button onClick={handleConfirmAndClose}>Utiliser ces informations (Bientôt)</Button>
          )}
          <Button type="button" variant="secondary" onClick={handleCloseDialog}>
            {recordingState === "success" || recordingState === "error" ? "Fermer" : "Annuler"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
