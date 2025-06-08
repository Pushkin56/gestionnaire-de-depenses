
"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Category, Currency, Transaction, TransactionType, InterpretedVoiceExpense } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";

// Mock data (replace with API calls)
const mockCategories: Category[] = [
  { id: 'cat1', name: 'Alimentation', type: 'depense', color: '#ef4444', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat2', name: 'Salaire', type: 'recette', color: '#22c55e', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat3', name: 'Transport', type: 'depense', color: '#3b82f6', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat4', name: 'Freelance', type: 'recette', color: '#06b6d4', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat-loisirs', name: 'Loisirs', type: 'depense', color: '#f59e0b', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat-restaurant', name: 'Restaurants', type: 'depense', color: '#8b5cf6', user_id: '1', created_at: '', updated_at: '' },
];
const mockCurrencies: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', created_at: '' },
  { code: 'USD', name: 'US Dollar', symbol: '$', created_at: '' },
  { code: 'GBP', name: 'British Pound', symbol: '£', created_at: '' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', created_at: '' },
  { code: 'XOF', name: 'Franc CFA (UEMOA)', symbol: 'FCFA', created_at: '' },
  { code: 'XAF', name: 'Franc CFA (CEMAC)', symbol: 'FCFA', created_at: '' },
];

const transactionFormSchema = z.object({
  type: z.enum(['recette', 'depense'], { required_error: "Le type est requis." }),
  amount: z.coerce.number().positive("Le montant doit être positif."),
  currency: z.string().min(1, "La devise est requise."),
  category_id: z.string().optional(),
  date: z.date({ required_error: "La date est requise." }),
  description: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionAdded: (transaction: Transaction) => void;
  transactionToEdit?: Transaction | null;
  initialData?: InterpretedVoiceExpense | null; // For pre-filling from voice input
}

export default function AddTransactionDialog({ open, onOpenChange, onTransactionAdded, transactionToEdit, initialData }: AddTransactionDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const preferredCurrency = user?.primary_currency || 'EUR';

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: 'depense',
      amount: 0,
      currency: preferredCurrency,
      date: new Date(),
      description: '',
    },
  });

  const transactionType = form.watch("type");

  const availableCategories = useMemo(() => {
    return mockCategories.filter(cat => cat.type === transactionType);
  }, [transactionType, mockCategories]); // Added mockCategories dependency

  useEffect(() => {
    if (open) {
      if (initialData && !transactionToEdit) { // Pre-fill from voice data if no explicit edit
        let finalCurrency = preferredCurrency;
        if (initialData.currency) {
            const foundCurrency = mockCurrencies.find(c => c.code.toUpperCase() === initialData.currency?.toUpperCase());
            if (foundCurrency) {
                finalCurrency = foundCurrency.code;
            }
        }
        
        let finalCategoryId: string | undefined = undefined;
        if (initialData.category_suggestion) {
            const foundCategory = mockCategories.find(cat => 
                cat.name.toLowerCase() === initialData.category_suggestion?.toLowerCase() &&
                cat.type === (initialData.type || 'depense') // Ensure category type matches
            );
            if (foundCategory) {
                finalCategoryId = foundCategory.id;
            }
        }

        form.reset({
          type: initialData.type || 'depense',
          amount: initialData.amount || 0,
          currency: finalCurrency,
          category_id: finalCategoryId,
          date: initialData.date_suggestion ? parseISO(initialData.date_suggestion) : new Date(),
          description: initialData.description_suggestion || '',
        });
      } else if (transactionToEdit) {
        form.reset({
          type: transactionToEdit.type,
          amount: transactionToEdit.amount,
          currency: transactionToEdit.currency,
          category_id: transactionToEdit.category_id,
          date: new Date(transactionToEdit.date),
          description: transactionToEdit.description || '',
        });
      } else {
        form.reset({
          type: 'depense',
          amount: 0,
          currency: preferredCurrency,
          date: new Date(),
          description: '',
          category_id: undefined,
        });
      }
    }
  }, [initialData, transactionToEdit, form, open, preferredCurrency, mockCategories]); // Added mockCategories

  const onSubmit = async (data: TransactionFormValues) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      const newTransaction: Transaction = {
        id: transactionToEdit?.id || `tx-${Date.now()}`,
        user_id: user?.id || 'mock-user-id',
        ...data,
        date: format(data.date, "yyyy-MM-dd"),
        created_at: transactionToEdit?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onTransactionAdded(newTransaction);
      toast({ title: transactionToEdit ? "Transaction modifiée" : "Transaction ajoutée", description: "Votre transaction a été enregistrée." });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'enregistrer la transaction.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isLoading) onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{transactionToEdit ? "Modifier la transaction" : "Ajouter une transaction"}</DialogTitle>
          <DialogDescription>
            {transactionToEdit ? "Modifiez les détails de votre transaction." : "Entrez les détails de votre nouvelle recette ou dépense."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Type de transaction</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('category_id', undefined);
                      }}
                      value={field.value} // Use value instead of defaultValue here
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="depense" />
                        </FormControl>
                        <FormLabel className="font-normal">Dépense</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="recette" />
                        </FormControl>
                        <FormLabel className="font-normal">Recette</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
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
                    <Select onValueChange={field.onChange} value={field.value || preferredCurrency} >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisissez une devise" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockCurrencies.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.code} - {c.name} ({c.symbol})</SelectItem>
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
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ""} 
                    disabled={availableCategories.length === 0 && transactionType !== 'recette'} // Also allow if type is recette as categories might be different
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={availableCategories.length === 0 && transactionType === 'depense' ? "Aucune catégorie de dépense" : "Choisissez une catégorie"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
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
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optionnel)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Courses hebdomadaires" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Annuler</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (transactionToEdit || initialData ? "Modification..." : "Ajout...") : (transactionToEdit || initialData ? "Modifier" : "Ajouter")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

