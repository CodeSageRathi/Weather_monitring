'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WeatherData } from '@/lib/weather';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ChatbotProps {
  weather: WeatherData;
  locationName: string;
  className?: string;
  handleChatSubmit: (history: Message[], weatherContext: any) => Promise<{ response: string }>;
}

export function Chatbot({ weather, locationName, className, handleChatSubmit }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const weatherContext = {
        temperature: weather.temperature,
        weatherConditions: weather.weatherCode.toString(), // Simplified for context
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        locationName: locationName,
      };

      const result = await handleChatSubmit(newMessages, weatherContext);
      
      const botMessage: Message = { role: 'model', content: result.response };
      setMessages([...newMessages, botMessage]);

    } catch (error) {
      console.error("Chatbot submission error:", error);
      const errorMessage: Message = { role: 'model', content: "Sorry, I'm having trouble connecting right now." };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn("bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot />
          Weather Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-[400px]">
        <ScrollArea className="flex-grow pr-4 -mr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'model' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20} /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {message.content}
                </div>
                 {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-muted-foreground"><User size={20} /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {loading && (
              <div className="flex items-start gap-3">
                 <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20} /></AvatarFallback>
                  </Avatar>
                  <div className="max-w-xs rounded-lg px-4 py-2 text-sm bg-secondary text-secondary-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 border-t border-white/20 pt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the weather..."
            className="flex-grow bg-white/20 border-white/30 placeholder:text-white/70 focus:bg-white/30 focus:ring-white/50"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
