import {genkit, type GenkitPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config();

const plugins: GenkitPlugin[] = [];

if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
  plugins.push(googleAI());
} else {
  console.warn(
    '\n********************************************************************\n' +
    'Missing GEMINI_API_KEY or GOOGLE_API_KEY environment variable.\n' +
    'AI features will be disabled.\n' +
    'To get a key, visit https://ai.google.dev/gemini-api/docs/api-key\n' +
    '********************************************************************\n'
  )
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.0-flash',
});
