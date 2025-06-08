
"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { SavingGoal, Currency } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";

const savingGoalFormSchema = z.object({
  name: z.string().min(1, "Le nom de l'objectif est requis.").max(100, "Le nom ne doit pas dépasser 100 caractères."),
  emoji: z.string().max(5, "L'emoji est trop long.").optional(),
  target_amount: z.coerce.number().positive("Le montant cible doit être un nombre positif."),
  current_amount: z.coerce.number().min(0, "Le montant actuel ne peut être négatif.").default(0),
  currency: z.string().min(1, "La devise est requise."),
  target_date: z.date().optional().nullable(),
});

type SavingGoalFormValues = z.infer<typeof savingGoalFormSchema>;

interface AddEditSavingGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalSaved: (goal: SavingGoal) => void;
  goalToEdit?: SavingGoal | null;
  currencies: Currency[]; // Pass currencies as prop
}

export default function AddEditSavingGoalDialog({ open, onOpenChange, onGoalSaved, goalToEdit, currencies }: AddEditSavingGoalDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const preferredCurrency = user?.primary_currency || currencies[0]?.code || 'EUR';

  const form = useForm<SavingGoalFormValues>({
    resolver: zodResolver(savingGoalFormSchema),
    defaultValues: {
      name: '',
      emoji: '',
      target_amount: 0,
      current_amount: 0,
      currency: preferredCurrency,
      target_date: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (goalToEdit) {
        form.reset({
          name: goalToEdit.name,
          emoji: goalToEdit.emoji || '',
          target_amount: goalToEdit.target_amount,
          current_amount: goalToEdit.current_amount,
          currency: goalToEdit.currency,
          target_date: goalToEdit.target_date ? parseISO(goalToEdit.target_date) : null,
        });
      } else {
        form.reset({
          name: '',
          emoji: '',
          target_amount: 0,
          current_amount: 0,
          currency: preferredCurrency,
          target_date: null,
        });
      }
    }
  }, [goalToEdit, form, open, preferredCurrency]);

  const onSubmit = async (data: SavingGoalFormValues) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    try {
      if (data.current_amount > data.target_amount) {
        toast({ title: "Montant invalide", description: "Le montant actuel ne peut pas dépasser le montant cible.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const selectedCurrencyInfo = currencies.find(c => c.code === data.currency);
      if (!selectedCurrencyInfo) {
        toast({ title: "Erreur de devise", description: "Devise sélectionnée non valide.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const newOrUpdatedGoal: SavingGoal = {
        id: goalToEdit?.id || `sg-${Date.now()}`,
        user_id: user?.id || 'mock-user-id',
        name: data.name,
        emoji: data.emoji || undefined,
        target_amount: data.target_amount,
        current_amount: data.current_amount,
        currency: data.currency,
        currency_symbol: selectedCurrencyInfo.symbol,
        target_date: data.target_date ? format(data.target_date, "yyyy-MM-dd") : null,
        created_at: goalToEdit?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onGoalSaved(newOrUpdatedGoal);
      toast({ title: goalToEdit ? "Objectif modifié" : "Objectif ajouté", description: "Votre objectif d'épargne a été enregistré." });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving saving goal:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer l'objectif d'épargne.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isLoading) onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{goalToEdit ? "Modifier l'objectif" : "Ajouter un objectif d'épargne"}</DialogTitle>
          <DialogDescription>
            {goalToEdit ? "Modifiez les détails de votre objectif." : "Définissez un nouvel objectif et commencez à épargner."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-end gap-3">
              <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem className="w-1/5">
                    <FormLabel>Emoji</FormLabel>
                    <FormControl>
                      <Input placeholder="💰" {...field} className="text-center text-2xl p-0 h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Nom de l'objectif</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Vacances, Apport maison" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="current_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant actuel</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="target_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant cible</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Devise</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || preferredCurrency}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Devise" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date cible (Optionnel)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span>Choisissez une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Annuler</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (goalToEdit ? "Modification..." : "Ajout...") : (goalToEdit ? "Modifier l'objectif" : "Ajouter l'objectif")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
