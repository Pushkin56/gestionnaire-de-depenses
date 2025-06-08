
'use server';
/**
 * @fileOverview A Genkit flow to generate a financial forecast message for the end of the month.
 *
 * - getMonthlyForecast - A function that takes financial details and returns a forecast message.
 * - MonthlyForecastInput - The input type for the getMonthlyForecast function.
 * - MonthlyForecastOutput - The return type for the getMonthlyForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MonthlyForecastInputSchema = z.object({
  current_balance: z.number().describe('Le solde actuel de l\'utilisateur.'),
  average_monthly_income: z.number().describe('Le revenu mensuel moyen de l\'utilisateur.'),
  average_monthly_expenses: z.number().describe('Les dépenses mensuelles moyennes de l\'utilisateur.'),
  days_remaining_in_month: z.number().describe('Le nombre de jours restants dans le mois en cours.'),
  currency_symbol: z.string().describe('Le symbole de la devise (ex: €, $).'),
});
export type MonthlyForecastInput = z.infer<typeof MonthlyForecastInputSchema>;

const MonthlyForecastOutputSchema = z.object({
  forecast_message: z.string().describe("Le message de prévision généré par l'IA."),
});
export type MonthlyForecastOutput = z.infer<typeof MonthlyForecastOutputSchema>;

export async function getMonthlyForecast(input: MonthlyForecastInput): Promise<MonthlyForecastOutput> {
  return monthlyForecastFlow(input);
}

const monthlyForecastPrompt = ai.definePrompt({
  name: 'monthlyForecastPrompt',
  input: {schema: MonthlyForecastInputSchema},
  output: {schema: MonthlyForecastOutputSchema},
  prompt: `Vous êtes un conseiller financier expert, amical et un peu direct.
L'utilisateur a un solde actuel de {{current_balance}} {{currency_symbol}}.
Son revenu mensuel moyen est de {{average_monthly_income}} {{currency_symbol}}.
Ses dépenses mensuelles moyennes sont de {{average_monthly_expenses}} {{currency_symbol}}.
Il reste {{days_remaining_in_month}} jours dans le mois.

Calculez une estimation du solde de fin de mois. Pour cela, considérez le prorata des revenus et dépenses pour les jours restants.
Solde estimé = Solde Actuel + (Revenu Moyen Mensuel / 30 * Jours Restants) - (Dépenses Moyennes Mensuelles / 30 * Jours Restants).

Générez un message de prévision en FRANÇAIS.
Si le solde estimé est dangereusement bas (proche de zéro ou négatif), le message doit être une alerte sérieuse mais encourageante.
Exemple (solde bas): "Attention ! D'après mes calculs, si vous continuez comme ça, vous pourriez finir le mois avec environ [SOLDE_ESTIMÉ] {{currency_symbol}}. Il serait sage de surveiller vos dépenses de près pour les {{days_remaining_in_month}} prochains jours. Courage !"
Si le solde estimé est correct mais sans plus, donnez un conseil neutre.
Exemple (solde moyen): "Projection pour la fin du mois : environ [SOLDE_ESTIMÉ] {{currency_symbol}}. C'est correct, mais gardez un oeil sur vos dépenses pour maintenir le cap !"
Si le solde estimé est confortable, félicitez l'utilisateur.
Exemple (solde élevé): "Excellente nouvelle ! En continuant ainsi, vous devriez terminer le mois avec environ [SOLDE_ESTIMÉ] {{currency_symbol}} sur votre compte. Super gestion ! 🎉"

Personnalisez le [SOLDE_ESTIMÉ] avec le montant calculé, arrondi à l'euro près.
La réponse doit être concise et pertinente. Répondez avec le message dans le champ 'forecast_message'.
Si les données d'entrée ne permettent pas une prévision pertinente (par exemple, revenus ou dépenses à zéro alors qu'il reste des jours), répondez par un message indiquant qu'une prévision n'est pas possible actuellement.
Exemple (données insuffisantes): "Je n'ai pas assez d'informations (revenus/dépenses moyens nuls) pour faire une prévision fiable pour la fin du mois avec {{days_remaining_in_month}} jours restants."
`,
});

const monthlyForecastFlow = ai.defineFlow(
  {
    name: 'monthlyForecastFlow',
    inputSchema: MonthlyForecastInputSchema,
    outputSchema: MonthlyForecastOutputSchema,
  },
  async (input) => {
    // Basic check for insufficient data leading to trivial forecast
    if (input.days_remaining_in_month > 0 && input.average_monthly_income === 0 && input.average_monthly_expenses === 0) {
        return { forecast_message: `Je n'ai pas assez d'informations (revenus/dépenses moyens nuls) pour faire une prévision fiable pour la fin du mois avec ${input.days_remaining_in_month} jours restants.` };
    }
    if (input.days_remaining_in_month === 0) {
        return { forecast_message: `Le mois est terminé ! Votre solde actuel est de ${input.current_balance.toLocaleString('fr-FR')} ${input.currency_symbol}. Bientôt le bilan du mois prochain !`};
    }

    const {output} = await monthlyForecastPrompt(input);
    return output!;
  }
);
