
// This is a placeholder for the User Preferences page.
// Full implementation would involve forms to update preferences.
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import type { Currency } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";


// Mock Data
const mockCurrencies: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', created_at: '' },
  { code: 'USD', name: 'US Dollar', symbol: '$', created_at: '' },
  { code: 'GBP', name: 'British Pound', symbol: '£', created_at: '' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', created_at: '' },
  { code: 'XOF', name: 'Franc CFA (UEMOA)', symbol: 'FCFA', created_at: '' },
  { code: 'XAF', name: 'Franc CFA (CEMAC)', symbol: 'FCFA', created_at: '' },
];

const preferencesSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis.").max(50, "Le nom d'utilisateur ne doit pas dépasser 50 caractères."),
  primary_currency: z.string().min(1, "La devise principale est requise."),
  aiBudgetAlertsEnabled: z.boolean().optional(),
  aiForecastEnabled: z.boolean().optional(),
  aiTrendAnalysisEnabled: z.boolean().optional(),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;


export default function PreferencesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUserPreferences } = useAuth();

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      username: user?.username || '',
      primary_currency: user?.primary_currency || 'EUR',
      aiBudgetAlertsEnabled: user?.aiBudgetAlertsEnabled ?? true,
      aiForecastEnabled: user?.aiForecastEnabled ?? true,
      aiTrendAnalysisEnabled: user?.aiTrendAnalysisEnabled ?? true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username || '',
        primary_currency: user.primary_currency || 'EUR',
        aiBudgetAlertsEnabled: user.aiBudgetAlertsEnabled ?? true,
        aiForecastEnabled: user.aiForecastEnabled ?? true,
        aiTrendAnalysisEnabled: user.aiTrendAnalysisEnabled ?? true,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: PreferencesFormValues) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      updateUserPreferences({ 
        username: data.username, 
        primary_currency: data.primary_currency,
        aiBudgetAlertsEnabled: data.aiBudgetAlertsEnabled,
        aiForecastEnabled: data.aiForecastEnabled,
        aiTrendAnalysisEnabled: data.aiTrendAnalysisEnabled,
      });
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
          Gérez vos paramètres personnels et les fonctionnalités IA de l'application.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du Profil et Généraux</CardTitle>
              <CardDescription>Personnalisez votre expérience et vos informations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom d'utilisateur" {...field} />
                    </FormControl>
                    <FormDescription>
                      Ce nom sera affiché dans l'application.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="primary_currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Devise Principale</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || user?.primary_currency || 'EUR'}>
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
                      Cette devise sera utilisée par défaut pour certains affichages et rapports.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
                <CardTitle>Fonctionnalités d'Intelligence Artificielle</CardTitle>
                <CardDescription>Activez ou désactivez les assistants IA pour vous aider à gérer vos finances.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="aiBudgetAlertsEnabled"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Conseiller Budgétaire IA</FormLabel>
                                <FormDescription>
                                Recevez des alertes et conseils lorsque vous approchez des limites de votre budget.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="aiForecastEnabled"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Prévisionnel de Fin de Mois IA</FormLabel>
                                <FormDescription>
                                Obtenez une estimation de votre solde en fin de mois basée sur vos habitudes.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="aiTrendAnalysisEnabled"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Analyse des Tendances IA</FormLabel>
                                <FormDescription>
                                Laissez l'IA identifier des tendances notables dans vos dépenses mensuelles.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
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
