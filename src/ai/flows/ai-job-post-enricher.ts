'use server';
/**
 * @fileOverview Enriches ambiguous job postings with suggested missing information.
 *
 * - enrichJobPost - A function that enriches a job posting.
 * - EnrichJobPostInput - The input type for the enrichJobPost function.
 * - EnrichJobPostOutput - The return type for the enrichJobPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnrichJobPostInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job posting.'),
  companyName: z.string().describe('The name of the company offering the job.'),
  location: z.string().describe('The location of the job.'),
  description: z.string().describe('The description of the job posting.'),
});
export type EnrichJobPostInput = z.infer<typeof EnrichJobPostInputSchema>;

const EnrichJobPostOutputSchema = z.object({
  suggestedSalaryRange: z.string().describe('A suggested salary range for the job.'),
  suggestedCompanyRating: z.string().describe('A suggested company rating (e.g., out of 5 stars).'),
  additionalPerks: z.string().describe('Possible additional perks or benefits not mentioned in the original posting.'),
});
export type EnrichJobPostOutput = z.infer<typeof EnrichJobPostOutputSchema>;

export async function enrichJobPost(input: EnrichJobPostInput): Promise<EnrichJobPostOutput> {
  return enrichJobPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enrichJobPostPrompt',
  input: {schema: EnrichJobPostInputSchema},
  output: {schema: EnrichJobPostOutputSchema},
  prompt: `You are an AI job posting enrichment assistant. Based on the job title, company name, location, and description, you will suggest missing information such as salary range, company rating and additional perks.

Job Title: {{{jobTitle}}}
Company Name: {{{companyName}}}
Location: {{{location}}}
Description: {{{description}}}

Provide your suggestions for the following:

Suggested Salary Range:
Suggested Company Rating:
Additional Perks:
`,
});

const enrichJobPostFlow = ai.defineFlow(
  {
    name: 'enrichJobPostFlow',
    inputSchema: EnrichJobPostInputSchema,
    outputSchema: EnrichJobPostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
