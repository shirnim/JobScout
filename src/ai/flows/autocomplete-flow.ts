
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

// We will parse the output manually for more robustness.
const prompt = ai.definePrompt({
  name: 'autocompletePrompt',
  input: {schema: AutocompleteInputSchema},
  prompt: `You are an API that provides autocomplete suggestions for a job search engine.
Given the user's partial query, return a JSON object with a 'suggestions' key, which is an array of up to 5 relevant and common job search strings.
Provide ONLY the JSON object, with no other text, markdown, or commentary.

Examples:
- If the query is "react", return: {"suggestions": ["react developer", "react native jobs", "senior react engineer"]}
- If the query is "mumbai", return: {"suggestions": ["jobs in mumbai", "software engineer mumbai", "frontend developer mumbai"]}

User query: {{{query}}}
`,
});

// Helper function to extract a JSON object from a string.
function extractJson(str: string): any {
    // This regex looks for a JSON object either inside ```json ... ``` or as a standalone object.
    const match = str.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    if (match) {
        const jsonStr = match[1] || match[2];
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            // Fall through if parsing fails
        }
    }
    return null;
}

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
    
    // Call the prompt and get the raw text response
    const response = await prompt(input);
    const text = response.text;

    if (!text) {
      return { suggestions: [] };
    }

    try {
      const parsedJson = extractJson(text);

      // Validate the parsed JSON against our desired schema
      if (parsedJson) {
        const validation = AutocompleteOutputSchema.safeParse(parsedJson);
        if (validation.success) {
          return validation.data;
        }
      }
    } catch (e) {
      console.error("Error processing autocomplete suggestions:", e);
    }
    
    // If anything fails, return empty suggestions.
    return { suggestions: [] };
  }
);
