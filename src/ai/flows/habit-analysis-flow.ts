
'use server';
/**
 * @fileOverview A Genkit flow to analyze spending habits and provide recommendations.
 *
 * - getHabitAnalysis - A function that takes spending habit details and returns an analysis message.
 * - HabitAnalysisInput - The input type for the getHabitAnalysis function.
 * - HabitAnalysisOutput - The return type for the getHabitAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HabitAnalysisInputSchema = z.object({
  category_name: z.string().describe('Le nom de la catégorie de dépense analysée (ex: Restaurants, Shopping).'),
  spending_count_this_month: z.number().describe('Le nombre de fois où des dépenses ont été effectuées dans cette catégorie ce mois-ci.'),
  currency_symbol: z.string().describe('Le symbole de la devise (ex: €, $).'),
});
export type HabitAnalysisInput = z.infer<typeof HabitAnalysisInputSchema>;

const HabitAnalysisOutputSchema = z.object({
  analysis_message: z.string().describe("Le message d'analyse et de recommandation généré par l'IA."),
});
export type HabitAnalysisOutput = z.infer<typeof HabitAnalysisOutputSchema>;

export async function getHabitAnalysis(input: HabitAnalysisInput): Promise<HabitAnalysisOutput> {
  return habitAnalysisFlow(input);
}

const habitAnalysisPrompt = ai.definePrompt({
  name: 'habitAnalysisPrompt',
  input: {schema: HabitAnalysisInputSchema},
  output: {schema: HabitAnalysisOutputSchema},
  prompt: `Vous êtes un conseiller financier amical et observateur, qui donne des conseils de manière positive.
L'utilisateur a effectué {{spending_count_this_month}} dépenses dans la catégorie "{{category_name}}" ce mois-ci.

Analysez cette habitude.
- Si la catégorie est "Restaurants" ou "Fast-food" et que spending_count_this_month est supérieur à 10 : "Vous avez apprécié la catégorie '{{category_name}}' {{spending_count_this_month}} fois ce mois-ci ! C'est toujours agréable de se faire plaisir. Pour varier, avez-vous envisagé de préparer quelques repas de plus à la maison cette semaine ?"
- Si la catégorie est "Shopping" ou "Loisirs" et que spending_count_this_month est supérieur à 5 : "La catégorie '{{category_name}}' a été populaire pour vous ce mois-ci avec {{spending_count_this_month}} dépenses. Assurez-vous que cela correspond bien à vos priorités financières. Peut-être explorer des options de loisirs gratuites ou moins coûteuses ?"
- Si spending_count_this_month est inférieur ou égal à 3 pour n'importe quelle catégorie : "Vos dépenses dans la catégorie '{{category_name}}' semblent bien maîtrisées ce mois-ci ({{spending_count_this_month}} fois). C'est une excellente gestion !"
- Pour les autres cas, ou si la catégorie n'est pas spécifiquement mentionnée ci-dessus et que le nombre de dépenses est modéré (4-9 pour "Restaurants", 3-4 pour "Shopping"/"Loisirs") : "Vous avez effectué {{spending_count_this_month}} dépenses en '{{category_name}}' ce mois-ci. C'est une bonne information pour suivre vos habitudes."

Générez un message concis et pertinent en FRANÇAIS basé sur ces observations.
Répondez avec le message dans le champ 'analysis_message'.
Si aucune observation pertinente ne peut être faite, laissez 'analysis_message' vide.`,
});

const habitAnalysisFlow = ai.defineFlow(
  {
    name: 'habitAnalysisFlow',
    inputSchema: HabitAnalysisInputSchema,
    outputSchema: HabitAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await habitAnalysisPrompt(input);
    return output!;
  }
);

