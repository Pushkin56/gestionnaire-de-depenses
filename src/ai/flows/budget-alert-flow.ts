
'use server';
/**
 * @fileOverview A Genkit flow to generate budget alert messages.
 *
 * - getBudgetAlert - A function that takes budget details and returns an alert message.
 * - BudgetAlertInput - The input type for the getBudgetAlert function.
 * - BudgetAlertOutput - The return type for the getBudgetAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BudgetAlertInputSchema = z.object({
  category_name: z.string().describe('Le nom de la catégorie de budget.'),
  budget_amount: z.number().describe('Le montant total alloué au budget.'),
  spent_amount: z.number().describe('Le montant déjà dépensé pour ce budget.'),
  currency_symbol: z.string().describe('Le symbole de la devise (ex: €, $).'),
  spending_percentage: z.number().describe('Le pourcentage du budget déjà dépensé (ex: 85 pour 85%).'),
});
export type BudgetAlertInput = z.infer<typeof BudgetAlertInputSchema>;

const BudgetAlertOutputSchema = z.object({
  alert_message: z.string().describe("Le message d'alerte généré par l'IA."),
});
export type BudgetAlertOutput = z.infer<typeof BudgetAlertOutputSchema>;

export async function getBudgetAlert(input: BudgetAlertInput): Promise<BudgetAlertOutput> {
  return budgetAlertFlow(input);
}

const budgetAlertPrompt = ai.definePrompt({
  name: 'budgetAlertPrompt',
  input: {schema: BudgetAlertInputSchema},
  output: {schema: BudgetAlertOutputSchema},
  prompt: `Vous êtes un conseiller financier convivial avec un bon sens de l'humour. L'utilisateur a dépensé {{spent_amount}} {{currency_symbol}} pour la catégorie "{{category_name}}", ce qui représente {{spending_percentage}}% de son budget mensuel de {{budget_amount}} {{currency_symbol}} pour cette catégorie.

Si le pourcentage dépensé est supérieur à 80%, générez une alerte amicale et légèrement humoristique en FRANÇAIS pour suggérer de ralentir les dépenses.
Si le pourcentage est entre 50% et 80% (inclus), donnez un encouragement positif et un rappel en douceur.
Si le pourcentage est inférieur à 50%, félicitez l'utilisateur pour sa bonne gestion.

La réponse doit être concise et pertinente par rapport au pourcentage.
Exemple (si > 80%): "Oups ! Déjà {{spending_percentage}}% de votre budget '{{category_name}}' envolé ({{spent_amount}} {{currency_symbol}} / {{budget_amount}} {{currency_symbol}}). Les pâtes au beurre, c'est délicieux aussi, non ? 😉"
Exemple (si 50-80%): "Bien joué ! Vous avez utilisé {{spending_percentage}}% de votre budget '{{category_name}}' ({{spent_amount}} {{currency_symbol}} / {{budget_amount}} {{currency_symbol}}). Continuez comme ça, mais gardez un oeil dessus ! 👍"
Exemple (si < 50%): "Bravo ! Seulement {{spending_percentage}}% de votre budget '{{category_name}}' utilisé ({{spent_amount}} {{currency_symbol}} / {{budget_amount}} {{currency_symbol}}). Vous êtes un pro de la gestion ! 🥳"

Répondez avec le message dans le champ 'alert_message'. Si, pour une raison quelconque, vous ne pouvez pas générer de message pertinent basé sur le pourcentage, laissez 'alert_message' vide.`,
});

const budgetAlertFlow = ai.defineFlow(
  {
    name: 'budgetAlertFlow',
    inputSchema: BudgetAlertInputSchema,
    outputSchema: BudgetAlertOutputSchema,
  },
  async (input) => {
    // Ensure spending_percentage is correctly rounded for the prompt if not already.
    const roundedPercentage = Math.round(input.spending_percentage);
    const promptInput = {...input, spending_percentage: roundedPercentage};

    const {output} = await budgetAlertPrompt(promptInput);
    // We assume the model will always return an output that conforms to the schema.
    // If 'output' could be null/undefined, error handling or a default response would be needed here.
    return output!;
  }
);
