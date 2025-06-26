
'use server';
/**
 * @fileOverview Provides autocomplete suggestions for job searches.
 *
 * - getAutocompleteSuggestions - A function that returns search suggestions.
 * - AutocompleteInput - The input type for the function.
 * - AutocompleteOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutocompleteInputSchema = z.object({
  query: z.string().describe('The partial search query entered by the user.'),
});
export type AutocompleteInput = z.infer<typeof AutocompleteInputSchema>;

const AutocompleteOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of up to 5 autocomplete suggestions for job search queries.'),
});
export type AutocompleteOutput = z.infer<typeof AutocompleteOutputSchema>;

export async function getAutocompleteSuggestions(input: AutocompleteInput): Promise<AutocompleteOutput> {
  return autocompleteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autocompletePrompt',
  input: {schema: AutocompleteInputSchema},
  output: {schema: AutocompleteOutputSchema},
  prompt: `You are an autocomplete API for a job search engine. Your ONLY function is to return a JSON object with a "suggestions" array.
Given the user's partial query, return up to 5 relevant and common job search strings.
The suggestions should be realistic queries a user might type.

User query: {{{query}}}
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const autocompleteFlow = ai.defineFlow(
  {
    name: 'autocompleteFlow',
    inputSchema: AutocompleteInputSchema,
    outputSchema: AutocompleteOutputSchema,
  },
  async (input) => {
    if (input.query.length < 3) {
      return { suggestions: [] };
    }
    
    try {
      const { output } = await prompt(input);
      if (!output) {
        return { suggestions: [] };
      }
      return output;
    } catch (e: any) {
      // Check for specific Genkit error indicating misconfiguration
      if (e.status === 'FAILED_PRECONDITION' || e.message?.includes('not found')) {
        // This is the expected error when the API key is missing or invalid.
        // We don't need to log a scary error. The warning at startup is enough.
        return { suggestions: [] };
      }
      console.error("Error during autocomplete flow execution:", e);
    }
    
    // If anything fails, return empty suggestions.
    return { suggestions: [] };
  }
);
