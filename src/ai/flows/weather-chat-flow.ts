'use server';

/**
 * @fileOverview A weather chatbot that answers user questions based on weather context.
 *
 * - weatherChat - A function that handles the chatbot conversation.
 * - WeatherChatInput - The input type for the weatherChat function.
 * - WeatherChatOutput - The return type for the weatherChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const WeatherContextSchema = z.object({
  temperature: z.number(),
  weatherConditions: z.string(),
  humidity: z.number(),
  windSpeed: z.number(),
  locationName: z.string(),
});

const WeatherChatInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  weatherContext: WeatherContextSchema.describe('The current weather conditions.'),
});
export type WeatherChatInput = z.infer<typeof WeatherChatInputSchema>;

const WeatherChatOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response.'),
});
export type WeatherChatOutput = z.infer<typeof WeatherChatOutputSchema>;

export async function weatherChat(input: WeatherChatInput): Promise<WeatherChatOutput> {
  return weatherChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'weatherChatPrompt',
  input: {schema: WeatherChatInputSchema},
  output: {schema: WeatherChatOutputSchema},
  prompt: `You are a friendly and helpful weather assistant chatbot. Your goal is to answer the user's questions based on the provided weather context and the conversation history. Be conversational and concise.

Current Weather Context:
- Location: {{weatherContext.locationName}}
- Temperature: {{weatherContext.temperature}}°C
- Conditions: {{weatherContext.weatherConditions}}
- Humidity: {{weatherContext.humidity}}%
- Wind Speed: {{weatherContext.windSpeed}} km/h

Conversation History:
{{#each history}}
- {{role}}: {{content}}
{{/each}}

Based on the context and history, provide a helpful response to the last user message.`,
});

const weatherChatFlow = ai.defineFlow(
  {
    name: 'weatherChatFlow',
    inputSchema: WeatherChatInputSchema,
    outputSchema: WeatherChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
