'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeatherData } from "@/lib/weather";
import { getWeatherInfo } from "@/lib/weather";
import { Droplets, Wind, BrainCircuit } from "lucide-react";

interface WeatherCardProps {
  weather: WeatherData | null;
  locationName: string | null;
  personalizedReport: string | null;
  loadingReport: boolean;
}

export function WeatherCard({ weather, locationName, personalizedReport, loadingReport }: WeatherCardProps) {
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    setDateString(new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }));
  }, []);

  if (!weather || !locationName) {
    return null;
  }

  const { text: weatherText, emoji } = getWeatherInfo(weather.weatherCode);

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg bg-card/80 backdrop-blur-sm border">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold font-headline">{locationName}</CardTitle>
        <CardDescription>{dateString}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-8xl" role="img" aria-label={weatherText}>{emoji}</span>
          <p className="text-7xl font-bold font-headline">{weather.temperature}°C</p>
          <p className="text-xl text-muted-foreground">{weatherText}</p>
        </div>
        <div className="flex justify-around items-center pt-4">
          <div className="flex items-center space-x-2">
            <Droplets className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold">{weather.humidity}%</p>
              <p className="text-sm text-muted-foreground">Humidity</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Wind className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold">{weather.windSpeed} km/h</p>
              <p className="text-sm text-muted-foreground">Wind</p>
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center font-headline">
            <BrainCircuit className="w-5 h-5 mr-2 text-primary" /> 
            Personal Report
          </h3>
          {loadingReport ? (
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p className="text-sm text-foreground/80 leading-relaxed">{personalizedReport}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
