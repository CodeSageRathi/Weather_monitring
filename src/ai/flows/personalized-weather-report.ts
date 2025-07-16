// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Generates a personalized weather report based on current conditions, including advice on clothing, accessories, and suitable outdoor activities.
 *
 * - personalizedWeatherReport - A function that generates the personalized weather report.
 * - PersonalizedWeatherReportInput - The input type for the personalizedWeatherReport function.
 * - PersonalizedWeatherReportOutput - The return type for the personalizedWeatherReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedWeatherReportInputSchema = z.object({
  temperature: z.number().describe('The current temperature in Celsius.'),
  weatherConditions: z.string().describe('The current weather conditions (e.g., sunny, cloudy, rainy).'),
  humidity: z.number().describe('The current humidity percentage.'),
  windSpeed: z.number().describe('The current wind speed in km/h.'),
  locationName: z.string().describe('The name of the detected location.'),
});
export type PersonalizedWeatherReportInput = z.infer<typeof PersonalizedWeatherReportInputSchema>;

const PersonalizedWeatherReportOutputSchema = z.object({
  report: z.string().describe('A personalized weather report based on the current conditions.'),
});
export type PersonalizedWeatherReportOutput = z.infer<typeof PersonalizedWeatherReportOutputSchema>;

export async function personalizedWeatherReport(input: PersonalizedWeatherReportInput): Promise<PersonalizedWeatherReportOutput> {
  return personalizedWeatherReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedWeatherReportPrompt',
  input: {schema: PersonalizedWeatherReportInputSchema},
  output: {schema: PersonalizedWeatherReportOutputSchema},
  prompt: `You are a helpful weather assistant that provides personalized weather reports and advice.

  Based on the current weather conditions, provide a personalized weather report for the user, including tailored advice on clothing, accessories, and suitable outdoor activities.

Current Conditions:
Location: {{locationName}}
Temperature: {{temperature}}°C
Weather Conditions: {{weatherConditions}}
Humidity: {{humidity}}%
Wind Speed: {{windSpeed}} km/h

Report:`,
});

const personalizedWeatherReportFlow = ai.defineFlow(
  {
    name: 'personalizedWeatherReportFlow',
    inputSchema: PersonalizedWeatherReportInputSchema,
    outputSchema: PersonalizedWeatherReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
