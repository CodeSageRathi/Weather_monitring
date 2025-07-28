'use server';

import { personalizedWeatherReport } from '@/ai/flows/personalized-weather-report';
import type { PersonalizedWeatherReportInput } from '@/ai/flows/personalized-weather-report';
import { weatherChat } from '@/ai/flows/weather-chat-flow';
import type { WeatherChatInput, WeatherChatOutput } from '@/ai/flows/weather-chat-flow';


export async function getPersonalizedReport(input: PersonalizedWeatherReportInput): Promise<string> {
  try {
    const result = await personalizedWeatherReport(input);
    return result.report;
  } catch (error) {
    console.error("AI report generation failed:", error);
    return "Could not generate a personalized report at this time. Please try again later.";
  }
}


export async function submitChatMessage(history: WeatherChatInput['history'], weatherContext: WeatherChatInput['weatherContext']): Promise<WeatherChatOutput> {
    try {
        const result = await weatherChat({ history, weatherContext });
        return result;
    } catch (error) {
        console.error("Chatbot request failed:", error);
        return { response: "Sorry, an error occurred while talking to the assistant. Please try again." };
    }
}
