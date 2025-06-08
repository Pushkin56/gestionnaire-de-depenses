
'use server';
/**
 * @fileOverview A basic financial assistant AI flow.
 *
 * - askFinancialAssistant - A function that takes a user's question and returns an answer.
 * - FinancialAssistantInput - The input type for the askFinancialAssistant function.
 * - FinancialAssistantOutput - The return type for the askFinancialAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialAssistantInputSchema = z.object({
  question: z.string().describe('La question de l\'utilisateur concernant ses finances.'),
});
export type FinancialAssistantInput = z.infer<typeof FinancialAssistantInputSchema>;

const FinancialAssistantOutputSchema = z.object({
  answer: z.string().describe('La réponse de l\'IA à la question financière.'),
});
export type FinancialAssistantOutput = z.infer<typeof FinancialAssistantOutputSchema>;

export async function askFinancialAssistant(input: FinancialAssistantInput): Promise<FinancialAssistantOutput> {
  return financialAssistantFlow(input);
}

const financialAssistantPrompt = ai.definePrompt({
  name: 'financialAssistantPrompt',
  input: {schema: FinancialAssistantInputSchema},
  output: {schema: FinancialAssistantOutputSchema},
  prompt: `Vous êtes un assistant financier amical et serviable.
L'utilisateur a une question concernant ses finances. Veuillez fournir une réponse concise et informative en français.

Question de l'utilisateur : {{{question}}}

Répondez avec la réponse dans le champ 'answer' de la sortie.`,
});

const financialAssistantFlow = ai.defineFlow(
  {
    name: 'financialAssistantFlow',
    inputSchema: FinancialAssistantInputSchema,
    outputSchema: FinancialAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await financialAssistantPrompt(input);
    // We assume the model will always return an output that conforms to the schema.
    // If 'output' could be null/undefined, error handling or a default response would be needed here.
    return output!;
  }
);
