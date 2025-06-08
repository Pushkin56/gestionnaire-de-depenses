
'use server';
/**
 * @fileOverview A Genkit flow to interpret transcribed voice input for expense tracking.
 *
 * - interpretVoiceExpense - A function that takes transcribed text and attempts to extract expense details.
 * - InterpretVoiceExpenseInput - The input type for the interpretVoiceExpense function.
 * - InterpretVoiceExpenseOutput - The return type for the interpretVoiceExpense function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { InterpretedVoiceExpense, TransactionType } from '@/lib/types'; // Use existing TransactionType

const InterpretVoiceExpenseInputSchema = z.object({
  transcribed_text: z.string().describe("Le texte transcrit à partir de l'entrée vocale de l'utilisateur."),
  user_preferred_currency: z.string().describe("La devise principale de l'utilisateur (code ISO, ex: EUR, USD), pour aider à l'interprétation si la devise n'est pas spécifiée dans le texte."),
  current_date: z.string().describe("La date actuelle au format YYYY-MM-DD, pour aider à interpréter les dates relatives comme 'aujourd'hui' ou 'hier'."),
});
export type InterpretVoiceExpenseInput = z.infer<typeof InterpretVoiceExpenseInputSchema>;

// Output schema should match InterpretedVoiceExpense interface from types.ts
const InterpretVoiceExpenseOutputSchema = z.object({
  amount: z.number().optional().describe("Le montant de la transaction."),
  currency: z.string().optional().describe("Le code de la devise (ex: EUR, USD) de la transaction. Si non spécifié, essayer de déduire ou utiliser la devise préférée de l'utilisateur."),
  category_suggestion: z.string().optional().describe("Une suggestion de catégorie pour la transaction (ex: Alimentation, Transport)."),
  date_suggestion: z.string().optional().describe("La date suggérée pour la transaction au format YYYY-MM-DD."),
  description_suggestion: z.string().optional().describe("Une description pour la transaction."),
  type: z.enum(['recette', 'depense']).default('depense').optional().describe("Le type de transaction. Par défaut à 'dépense' si non spécifié ou ambigu."),
  error: z.string().optional().describe("Un message d'erreur si l'interprétation échoue ou si des informations cruciales manquent."),
  original_text: z.string().optional().describe("Le texte original transcrit, pour référence."),
});
export type InterpretVoiceExpenseOutput = InterpretedVoiceExpense; // Matches the interface

export async function interpretVoiceExpense(input: InterpretVoiceExpenseInput): Promise<InterpretVoiceExpenseOutput> {
  return interpretVoiceExpenseFlow(input);
}

const interpretExpensePrompt = ai.definePrompt({
  name: 'interpretExpensePrompt',
  input: {schema: InterpretVoiceExpenseInputSchema},
  output: {schema: InterpretVoiceExpenseOutputSchema},
  prompt: `Tu es un assistant intelligent d'aide à la saisie de transactions financières.
Interprète le texte suivant fourni par l'utilisateur pour en extraire les détails d'une transaction (montant, devise, catégorie, date, description).
Le type de transaction est par défaut 'dépense' sauf si 'recette', 'revenu', 'salaire' ou un terme similaire est explicitement mentionné.
La date actuelle est {{current_date}}. Utilise cette information pour interpréter des termes comme 'aujourd'hui', 'hier', 'demain'. Si aucune date n'est spécifiée, utilise la date actuelle.
La devise préférée de l'utilisateur est {{user_preferred_currency}}. Si aucune devise n'est mentionnée dans le texte, utilise cette devise préférée.
Si le montant est ambigu ou non numériquement clair, retourne une erreur.
Si une catégorie évidente est mentionnée (ex: restaurant, courses, essence, loyer), suggère-la. Sinon, laisse vide.
Le format de la date de sortie doit être YYYY-MM-DD.
Essaie d'extraire une description concise.

Exemples:
Texte: "courses 50 euros hier" -> amount: 50, currency: "EUR", description_suggestion: "courses", date_suggestion: (date d'hier), type: "depense"
Texte: "salaire 2000 dollars le 1er du mois" -> amount: 2000, currency: "USD", description_suggestion: "salaire", date_suggestion: (1er du mois en cours ou prochain), type: "recette"
Texte: "essence trente euros aujourd'hui pour la voiture" -> amount: 30, currency: "EUR", description_suggestion: "essence pour la voiture", date_suggestion: (date d'aujourd'hui), category_suggestion: "Transport", type: "depense"
Texte: "McDo 15 balles" (si user_preferred_currency='EUR') -> amount: 15, currency: "EUR", description_suggestion: "McDo", category_suggestion: "Restaurant", type: "depense"
Texte: "Netflix" (si user_preferred_currency='EUR') -> error: "Montant manquant ou ambigu."

Texte de l'utilisateur: "{{transcribed_text}}"

Retourne les informations extraites. Si des informations cruciales comme le montant sont manquantes ou ambiguës, renvoie un message dans le champ 'error'. Remplis le champ 'original_text' avec la transcription fournie.
Si aucune devise n'est spécifiée et que 'user_preferred_currency' est EUR, utilise 'EUR'. Si c'est USD, utilise 'USD', etc. pour les devises courantes (EUR, USD, GBP, CAD, CHF, JPY, AUD, CNY). Pour les autres, si non spécifié, laisse vide et indique dans 'error' que la devise doit être précisée.
`,
});

const interpretVoiceExpenseFlow = ai.defineFlow(
  {
    name: 'interpretVoiceExpenseFlow',
    inputSchema: InterpretVoiceExpenseInputSchema,
    outputSchema: InterpretVoiceExpenseOutputSchema,
  },
  async (input) => {
    const {output} = await interpretExpensePrompt(input);
    if (!output) {
        return { 
            error: "L'IA n'a pas pu interpréter la demande.",
            original_text: input.transcribed_text,
            type: 'depense' // default
        };
    }
     // Ensure original_text is passed through
    return { ...output, original_text: input.transcribed_text };
  }
);
