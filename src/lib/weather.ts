export interface WeatherData {
  temperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  uvIndex: number;
  pressure: number;
  dewPoint: number;
  visibility: number;
  sunrise: string;
  sunset: string;
}

export interface LocationData {
  name: string;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  weatherCode: number;
}

export interface WeeklyForecast {
  day: string;
  tempMin: number;
  tempMax: number;
  weatherCode: number;
}


export const getWeatherInfo = (weatherCode: number): { text: string; emoji: string } => {
  const weatherMap: { [key: number]: { text: string; emoji: string } } = {
    0: { text: "Clear sky", emoji: "☀️" },
    1: { text: "Mainly clear", emoji: "🌤️" },
    2: { text: "Partly cloudy", emoji: "⛅️" },
    3: { text: "Overcast", emoji: "☁️" },
    45: { text: "Fog", emoji: "🌫️" },
    48: { text: "Depositing rime fog", emoji: "🌫️" },
    51: { text: "Light drizzle", emoji: "💧" },
    53: { text: "Moderate drizzle", emoji: "💧" },
    55: { text: "Dense drizzle", emoji: "💧" },
    61: { text: "Slight rain", emoji: "🌧️" },
    63: { text: "Moderate rain", emoji: "🌧️" },
    65: { text: "Heavy rain", emoji: "🌧️" },
    66: { text: "Light freezing rain", emoji: "🥶" },
    67: { text: "Heavy freezing rain", emoji: "🥶" },
    71: { text: "Slight snow fall", emoji: "❄️" },
    73: { text: "Moderate snow fall", emoji: "❄️" },
    75: { text: "Heavy snow fall", emoji: "❄️" },
    77: { text: "Snow grains", emoji: "❄️" },
    80: { text: "Slight rain showers", emoji: "🌦️" },
    81: { text: "Moderate rain showers", emoji: "🌦️" },
    82: { text: "Violent rain showers", emoji: "🌦️" },
    85: { text: "Slight snow showers", emoji: "🌨️" },
    86: { text: "Heavy snow showers", emoji: "🌨️" },
    95: { text: "Thunderstorm", emoji: "⛈️" },
    96: { text: "Thunderstorm with hail", emoji: "⛈️" },
    99: { text: "Thunderstorm with heavy hail", emoji: "⛈️" },
  };
  
  return weatherMap[weatherCode] || { text: "Unknown weather", emoji: "🤷" };
};

const processWeatherData = (weatherData: any, locationData: any) => {
    const { current, hourly, daily } = weatherData;
    const cityName = locationData.address.city || locationData.address.town || locationData.address.village || locationData.address.county || "Unknown location";
    
    const now = new Date();
    const currentHour = now.getHours();

    const hourlyForecast: HourlyForecast[] = hourly.time.slice(currentHour, currentHour + 24).map((time: string, index: number) => ({
      time: new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      temp: Math.round(hourly.temperature_2m[currentHour + index]),
      weatherCode: hourly.weather_code[currentHour + index],
    }));

    const weeklyForecast: WeeklyForecast[] = daily.time.map((date: string, index: number) => ({
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
        tempMin: Math.round(daily.temperature_2m_min[index]),
        tempMax: Math.round(daily.temperature_2m_max[index]),
        weatherCode: daily.weather_code[index],
    }));

    return {
        weather: {
            temperature: Math.round(current.temperature_2m),
            weatherCode: current.weather_code,
            humidity: current.relative_humidity_2m,
            windSpeed: Math.round(current.wind_speed_10m),
            feelsLike: Math.round(current.apparent_temperature),
            uvIndex: Math.round(current.uv_index),
            pressure: Math.round(current.surface_pressure),
            dewPoint: Math.round(current.dew_point_2m),
            visibility: Math.round(current.visibility / 1000), // to km
            sunrise: daily.sunrise[0],
            sunset: daily.sunset[0],
        },
        location: { name: cityName },
        hourly: hourlyForecast,
        weekly: weeklyForecast,
    };
};

export const fetchWeatherByCity = async (city: string) => {
    const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?city=${city}&format=json&limit=1`);
    if (!geocodeResponse.ok) {
        throw new Error(`Failed to geocode city: ${city}`);
    }
    const geocodeData = await geocodeResponse.json();
    if (geocodeData.length === 0) {
        throw new Error(`Could not find location for city: ${city}`);
    }
    const { lat, lon } = geocodeData[0];
    const locationResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
    if (!locationResponse.ok) throw new Error("Failed to fetch location data.");
    const locationData = await locationResponse.json();

    const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index,surface_pressure,dew_point_2m,visibility&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
    );
    if (!weatherResponse.ok) throw new Error("Failed to fetch weather data.");
    const weatherData = await weatherResponse.json();

    return processWeatherData(weatherData, locationData);
};


export const fetchWeatherAndLocation = async (latitude: number, longitude: number) => {
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index,surface_pressure,dew_point_2m,visibility&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
  );
  if (!weatherResponse.ok) {
    throw new Error("Failed to fetch weather data.");
  }
  const weatherData = await weatherResponse.json();

  const locationResponse = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
  );
  if (!locationResponse.ok) {
    throw new Error("Failed to fetch location data.");
  }
  const locationData = await locationResponse.json();

  return processWeatherData(weatherData, locationData);
};
