
// This is a placeholder for the User Preferences page.
// Full implementation would involve forms to update preferences.
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Currency, UserPreferences } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";


// Mock Data
const mockCurrencies: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', created_at: '' },
  { code: 'USD', name: 'US Dollar', symbol: '$', created_at: '' },
  { code: 'GBP', name: 'British Pound', symbol: '£', created_at: '' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', created_at: '' },
  { code: 'XOF', name: 'Franc CFA (UEMOA)', symbol: 'FCFA', created_at: '' },
  { code: 'XAF', name: 'Franc CFA (CEMAC)', symbol: 'FCFA', created_at: '' },
];

const mockUserPreferences: UserPreferences = {
    id: 'pref1',
    user_id: 'user1',
    primary_currency: 'EUR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

const preferencesSchema = z.object({
  primary_currency: z.string().min(1, "La devise principale est requise."),
  // Add other preferences here, e.g., theme, notifications
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;


export default function PreferencesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // In a real app, fetch current preferences
  const [currentPreferences, setCurrentPreferences] = useState<UserPreferences>(mockUserPreferences);

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      primary_currency: currentPreferences.primary_currency,
    },
  });

  const onSubmit = async (data: PreferencesFormValues) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      // Update preferences logic here
      setCurrentPreferences(prev => ({ ...prev, ...data, updated_at: new Date().toISOString() }));
      toast({ title: "Préférences enregistrées", description: "Vos préférences ont été mises à jour." });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'enregistrer les préférences.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Préférences Utilisateur</h2>
        <p className="text-muted-foreground">
          Gérez vos paramètres personnels pour l'application.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Généraux</CardTitle>
              <CardDescription>Personnalisez votre expérience BudgetBento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="primary_currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Devise Principale</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full sm:w-[280px]">
                          <SelectValue placeholder="Choisissez votre devise principale" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockCurrencies.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.code} - {c.name} ({c.symbol})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Cette devise sera utilisée par défaut pour les nouveaux enregistrements et les rapports.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Add more preference fields here, e.g.,
              <FormField name="theme" ... />
              <FormField name="notifications_enabled" ... />
              */}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Enregistrer les préférences"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}

// Re-export Form components to avoid direct import in page
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

