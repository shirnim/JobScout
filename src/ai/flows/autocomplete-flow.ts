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
  prompt: `You are an API that provides autocomplete suggestions for a job search engine.
Given the user's partial query, return a JSON object with a 'suggestions' key, which is an array of up to 5 relevant and common job search strings.
Examples:
- If the query is "react", suggestions could include "react developer" and "react native jobs".
- If the query is "mumbai", suggestions could include "jobs in mumbai" and "software engineer mumbai".

User query: {{{query}}}
`,
});

const autocompleteFlow = ai.defineFlow(
  {
    name: 'autocompleteFlow',
    inputSchema: AutocompleteInputSchema,
    outputSchema: AutocompleteOutputSchema,
  },
  async input => {
    if (input.query.length < 3) {
        return { suggestions: [] };
    }
    const {output} = await prompt(input);
    // If the model output doesn't conform to the schema, output can be null.
    // We return an empty list in that case to prevent errors.
    return output || { suggestions: [] };
  }
);
