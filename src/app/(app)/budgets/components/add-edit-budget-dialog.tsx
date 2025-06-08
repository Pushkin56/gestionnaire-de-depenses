
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Budget, Category, Currency } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";

// Mock data (replace with API calls or context/props)
const mockCategories: Category[] = [
  { id: 'cat1', name: 'Alimentation', type: 'depense', color: '#ef4444', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat2', name: 'Salaire', type: 'recette', color: '#22c55e', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat3', name: 'Transport', type: 'depense', color: '#3b82f6', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat4', name: 'Loisirs', type: 'depense', color: '#f59e0b', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat5', name: 'Freelance', type: 'recette', color: '#06b6d4', user_id: '1', created_at: '', updated_at: '' },
];
const mockCurrencies: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', created_at: '' },
  { code: 'USD', name: 'US Dollar', symbol: '$', created_at: '' },
  { code: 'GBP', name: 'British Pound', symbol: '£', created_at: '' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', created_at: '' },
  { code: 'XOF', name: 'Franc CFA (UEMOA)', symbol: 'FCFA', created_at: '' },
  { code: 'XAF', name: 'Franc CFA (CEMAC)', symbol: 'FCFA', created_at: '' },
];

const periodOptions: { value: Budget['period']; label: string }[] = [
    { value: 'monthly', label: 'Mensuel' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'yearly', label: 'Annuel' },
];

const budgetFormSchema = z.object({
  category_id: z.string().min(1, "La catégorie est requise."),
  amount: z.coerce.number().positive("Le montant doit être un nombre positif."),
  currency: z.string().min(1, "La devise est requise."),
  period: z.enum(['monthly', 'weekly', 'yearly'], { required_error: "La période est requise." }),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface AddEditBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBudgetSaved: (budget: Budget) => void;
  budgetToEdit?: Budget | null;
}

export default function AddEditBudgetDialog({ open, onOpenChange, onBudgetSaved, budgetToEdit }: AddEditBudgetDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const preferredCurrency = user?.primary_currency || 'EUR';

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category_id: '',
      amount: 0,
      currency: preferredCurrency,
      period: 'monthly',
    },
  });

  useEffect(() => {
    if (open) {
      if (budgetToEdit) {
        form.reset({
          category_id: budgetToEdit.category_id,
          amount: budgetToEdit.amount,
          currency: budgetToEdit.currency,
          period: budgetToEdit.period,
        });
      } else {
        form.reset({
          category_id: '',
          amount: 0,
          currency: preferredCurrency,
          period: 'monthly',
        });
      }
    }
  }, [budgetToEdit, form, open, preferredCurrency]);

  const onSubmit = async (data: BudgetFormValues) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    try {
      const selectedCategory = mockCategories.find(cat => cat.id === data.category_id);
      const selectedCurrency = mockCurrencies.find(curr => curr.code === data.currency);

      if (!selectedCategory || !selectedCurrency) {
        toast({ title: "Erreur de données", description: "Catégorie ou devise invalide.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      
      const newOrUpdatedBudget: Budget = {
        id: budgetToEdit?.id || `bud-${Date.now()}`,
        user_id: user?.id || 'mock-user-id',
        category_id: data.category_id,
        category_name: selectedCategory.name,
        amount: data.amount,
        currency: data.currency,
        currency_symbol: selectedCurrency.symbol,
        period: data.period,
        created_at: budgetToEdit?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onBudgetSaved(newOrUpdatedBudget);
      toast({ title: budgetToEdit ? "Budget modifié" : "Budget ajouté", description: "Votre budget a été enregistré." });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving budget:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer le budget.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isLoading) onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{budgetToEdit ? "Modifier le budget" : "Ajouter un budget"}</DialogTitle>
          <DialogDescription>
            {budgetToEdit ? "Modifiez les détails de votre budget." : "Définissez un nouveau budget pour une catégorie."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""} >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name} ({cat.type === 'recette' ? 'Recette' : 'Dépense'})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        {mockCurrencies.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Période</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'monthly'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez une période" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {periodOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Annuler</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (budgetToEdit ? "Modification..." : "Ajout...") : (budgetToEdit ? "Modifier" : "Ajouter")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    