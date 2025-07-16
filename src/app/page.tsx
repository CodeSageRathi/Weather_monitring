'use client';

import { useState, useEffect } from 'react';
import { WeatherCard } from '@/components/weather-card';
import { getPersonalizedReport } from '@/lib/actions';
import { fetchWeatherAndLocation, getWeatherInfo, type WeatherData } from '@/lib/weather';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal } from "lucide-react";

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [personalizedReport, setPersonalizedReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Detecting your location...");
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLoadingMessage("Fetching weather data...");
          try {
            const { latitude, longitude } = position.coords;
            const { weather: fetchedWeather, location: fetchedLocation } = await fetchWeatherAndLocation(latitude, longitude);
            setWeather(fetchedWeather);
            setLocationName(fetchedLocation.name);
          } catch (err) {
            setError("Could not fetch weather data. Please try again later.");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError(`Geolocation error: ${err.message}. Please enable location services in your browser.`);
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (weather && locationName) {
      setLoadingReport(true);
      const { text: weatherText } = getWeatherInfo(weather.weatherCode);
      
      const input = {
        temperature: weather.temperature,
        weatherConditions: weatherText,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        locationName: locationName,
      };

      getPersonalizedReport(input)
        .then(setPersonalizedReport)
        .catch(() => {
          setPersonalizedReport("Failed to generate a personalized report at this time.");
        })
        .finally(() => {
          setLoadingReport(false);
        });
    }
  }, [weather, locationName]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background transition-colors duration-500">
      <div className="w-full max-w-md text-center mb-8">
         <h1 className="text-5xl font-bold text-primary flex items-center justify-center font-headline">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
            SkyWatch
        </h1>
        <p className="text-muted-foreground mt-2">Your personal real-time weather companion.</p>
      </div>

      <div className="w-full max-w-md">
        {loading ? (
          <div className="flex items-center justify-center space-x-2 text-muted-foreground p-8">
            <Loader2 className="animate-spin h-5 w-5" />
            <span>{loadingMessage}</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="max-w-md">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <WeatherCard 
              weather={weather}
              locationName={locationName}
              personalizedReport={personalizedReport}
              loadingReport={loadingReport}
            />
          </div>
        )}
      </div>
    </main>
  );
}
