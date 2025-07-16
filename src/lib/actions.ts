'use server';

import { personalizedWeatherReport } from '@/ai/flows/personalized-weather-report';
import type { PersonalizedWeatherReportInput } from '@/ai/flows/personalized-weather-report';

export async function getPersonalizedReport(input: PersonalizedWeatherReportInput): Promise<string> {
  try {
    const result = await personalizedWeatherReport(input);
    return result.report;
  } catch (error) {
    console.error("AI report generation failed:", error);
    return "Could not generate a personalized report at this time. Please try again later.";
  }
}
