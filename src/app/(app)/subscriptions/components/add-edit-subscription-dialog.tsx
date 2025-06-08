
"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Subscription, Category, Currency } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";

// Mock data (replace with API calls or context/props)
const mockCategories: Category[] = [
  { id: 'cat1', name: 'Alimentation', type: 'depense', color: '#ef4444', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat3', name: 'Transport', type: 'depense', color: '#3b82f6', user_id: '1', created_at: '', updated_at: '' },
  { id: 'cat4', name: 'Loisirs', type: 'depense', color: '#f59e0b', user_id: '1', created_at: '', updated_at: '' },
  // On ne liste que les catégories de dépenses pour les abonnements
];
const mockCurrencies: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', created_at: '' },
  { code: 'USD', name: 'US Dollar', symbol: '$', created_at: '' },
  { code: 'GBP', name: 'British Pound', symbol: '£', created_at: '' },
];

const billingPeriodOptions: { value: Subscription['billing_period']; label: string }[] = [
    { value: 'monthly', label: 'Mensuel' },
    { value: 'yearly', label: 'Annuel' },
    { value: 'weekly', label: 'Hebdomadaire' },
];

const subscriptionFormSchema = z.object({
  name: z.string().min(1, "Le nom de l'abonnement est requis."),
  amount: z.coerce.number().positive("Le montant doit être un nombre positif."),
  currency: z.string().min(1, "La devise est requise."),
  billing_period: z.enum(['monthly', 'weekly', 'yearly'], { required_error: "La période de facturation est requise." }),
  next_billing_date: z.date({ required_error: "La prochaine date de facturation est requise." }),
  category_id: z.string().optional(),
});

type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;

interface AddEditSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscriptionSaved: (subscription: Subscription) => void;
  subscriptionToEdit?: Subscription | null;
}

export default function AddEditSubscriptionDialog({ open, onOpenChange, onSubscriptionSaved, subscriptionToEdit }: AddEditSubscriptionDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const preferredCurrency = user?.primary_currency || 'EUR';

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: '',
      amount: 0,
      currency: preferredCurrency,
      billing_period: 'monthly',
      next_billing_date: new Date(),
      category_id: undefined,
    },
  });

  const expenseCategories = useMemo(() => {
    return mockCategories.filter(cat => cat.type === 'depense');
  }, []);

  useEffect(() => {
    if (open) {
      if (subscriptionToEdit) {
        form.reset({
          name: subscriptionToEdit.name,
          amount: subscriptionToEdit.amount,
          currency: subscriptionToEdit.currency,
          billing_period: subscriptionToEdit.billing_period,
          next_billing_date: new Date(subscriptionToEdit.next_billing_date),
          category_id: subscriptionToEdit.category_id,
        });
      } else {
        form.reset({
          name: '',
          amount: 0,
          currency: preferredCurrency,
          billing_period: 'monthly',
          next_billing_date: new Date(),
          category_id: undefined,
        });
      }
    }
  }, [subscriptionToEdit, form, open, preferredCurrency]);

  const onSubmit = async (data: SubscriptionFormValues) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    try {
      const selectedCategory = expenseCategories.find(cat => cat.id === data.category_id);
      const selectedCurrency = mockCurrencies.find(curr => curr.code === data.currency);

      if (!selectedCurrency) { // Category is optional
        toast({ title: "Erreur de données", description: "Devise invalide.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      
      const newOrUpdatedSubscription: Subscription = {
        id: subscriptionToEdit?.id || `sub-${Date.now()}`,
        user_id: user?.id || 'mock-user-id',
        name: data.name,
        amount: data.amount,
        currency: data.currency,
        currency_symbol: selectedCurrency.symbol,
        billing_period: data.billing_period,
        next_billing_date: format(data.next_billing_date, "yyyy-MM-dd"),
        category_id: data.category_id,
        category_name: selectedCategory?.name,
        created_at: subscriptionToEdit?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onSubscriptionSaved(newOrUpdatedSubscription);
      toast({ title: subscriptionToEdit ? "Abonnement modifié" : "Abonnement ajouté", description: "Votre abonnement a été enregistré." });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving subscription:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer l'abonnement.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isLoading) onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{subscriptionToEdit ? "Modifier l'abonnement" : "Ajouter un abonnement"}</DialogTitle>
          <DialogDescription>
            {subscriptionToEdit ? "Modifiez les détails de votre abonnement." : "Ajoutez un nouveau paiement récurrent."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'abonnement</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Netflix, Spotify" {...field} />
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billing_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Période de facturation</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'monthly'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Période" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {billingPeriodOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="next_billing_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Prochaine date de facture</FormLabel>
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
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
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
                  <FormLabel>Catégorie (Optionnel)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""} >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Associer à une catégorie de dépense" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Aucune catégorie</SelectItem>
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Lier cet abonnement à une catégorie de dépense pour le suivi budgétaire.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Annuler</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (subscriptionToEdit ? "Modification..." : "Ajout...") : (subscriptionToEdit ? "Modifier" : "Ajouter")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
