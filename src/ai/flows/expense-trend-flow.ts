
'use server';
/**
 * @fileOverview A Genkit flow to analyze expense trends and generate insights.
 *
 * - getExpenseTrend - A function that takes spending data and returns a trend message.
 * - ExpenseTrendInput - The input type for the getExpenseTrend function.
 * - ExpenseTrendOutput - The return type for the getExpenseTrend function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpenseTrendInputSchema = z.object({
  category_name: z.string().describe('Le nom de la catégorie de dépense analysée.'),
  current_month_spending: z.number().describe('Le montant dépensé dans cette catégorie pour le mois en cours.'),
  previous_month_spending: z.number().describe('Le montant dépensé dans cette catégorie le mois précédent.'),
  currency_symbol: z.string().describe('Le symbole de la devise (ex: €, $).'),
});
export type ExpenseTrendInput = z.infer<typeof ExpenseTrendInputSchema>;

const ExpenseTrendOutputSchema = z.object({
  trend_message: z.string().describe("Le message d'analyse de tendance généré par l'IA."),
});
export type ExpenseTrendOutput = z.infer<typeof ExpenseTrendOutputSchema>;

export async function getExpenseTrend(input: ExpenseTrendInput): Promise<ExpenseTrendOutput> {
  return expenseTrendFlow(input);
}

const expenseTrendPrompt = ai.definePrompt({
  name: 'expenseTrendPrompt',
  input: {schema: ExpenseTrendInputSchema},
  output: {schema: ExpenseTrendOutputSchema},
  prompt: `Vous êtes un conseiller financier perspicace et amical.
L'utilisateur a dépensé {{current_month_spending}}{{currency_symbol}} dans la catégorie "{{category_name}}" ce mois-ci, contre {{previous_month_spending}}{{currency_symbol}} le mois précédent.

Analysez cette tendance.
Si les dépenses actuelles sont supérieures aux dépenses précédentes et que les dépenses précédentes n'étaient pas nulles, calculez le pourcentage d'augmentation.
Si les dépenses actuelles sont inférieures aux dépenses précédentes, calculez le pourcentage de diminution.
Si les dépenses précédentes étaient nulles et les dépenses actuelles sont positives, notez qu'il s'agit de nouvelles dépenses dans cette catégorie.
Si les dépenses actuelles et précédentes sont nulles, ou si les données semblent incohérentes, indiquez qu'aucune tendance notable n'est détectée pour cette catégorie.

Générez un message concis en FRANÇAIS.
- Si augmentation significative (ex: > 20%): "Attention, vos dépenses en '{{category_name}}' ont augmenté de [X]% ce mois-ci ({{current_month_spending}}{{currency_symbol}} contre {{previous_month_spending}}{{currency_symbol}}). Peut-être revoir ce poste ?"
- Si augmentation modérée (ex: 5-20%): "Vos dépenses en '{{category_name}}' sont en légère hausse de [X]% ce mois-ci ({{current_month_spending}}{{currency_symbol}} vs {{previous_month_spending}}{{currency_symbol}}). À surveiller."
- Si diminution: "Bonne nouvelle ! Vos dépenses en '{{category_name}}' ont diminué de [X]% ce mois-ci ({{current_month_spending}}{{currency_symbol}} contre {{previous_month_spending}}{{currency_symbol}}). Continuez comme ça !"
- Si nouvelles dépenses (précédent à 0): "Vous avez commencé à dépenser en '{{category_name}}' ce mois-ci ({{current_month_spending}}{{currency_symbol}}). C'est bon à savoir pour vos futurs budgets !"
- Si pas de changement notable / données insuffisantes: "Pas de changement majeur détecté pour vos dépenses en '{{category_name}}' ce mois-ci."

Remplacez [X] par le pourcentage calculé (arrondi à l'entier le plus proche).
Répondez avec le message dans le champ 'trend_message'.`,
});

const expenseTrendFlow = ai.defineFlow(
  {
    name: 'expenseTrendFlow',
    inputSchema: ExpenseTrendInputSchema,
    outputSchema: ExpenseTrendOutputSchema,
  },
  async (input) => {
    // Basic validation or pre-calculation if needed before sending to prompt.
    // For example, if previous_month_spending is 0, the percentage calculation is tricky.
    // The prompt is designed to handle this, but you could add logic here too.

    const {output} = await expenseTrendPrompt(input);
    return output!;
  }
);
