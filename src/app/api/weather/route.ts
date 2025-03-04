import { NextResponse } from 'next/server';

// You would store this in environment variables
const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY';

export const dynamic = 'force-dynamic'; // Don't cache this route

export async function GET(request: Request) {
  try {
    // Get the URL parameters
    const { searchParams } = new URL(request.url);
    let lat = searchParams.get('lat');
    let lon = searchParams.get('lon');
    
    // If no coordinates provided, try to fetch from our location API
    if (!lat || !lon) {
      const locationResponse = await fetch(`${request.headers.get('origin')}/api/location`);
      if (locationResponse.ok) {
        const locationData = await locationResponse.json();
        lat = locationData.latitude.toString();
        lon = locationData.longitude.toString();
      } else {
        // Default to Philadelphia if location API fails
        lat = '39.9526';
        lon = '-75.1652';
      }
    }
    
    // Call OpenWeatherMap API
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${OPENWEATHER_API_KEY}`,
      { cache: 'no-store' }
    );
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API returned ${weatherResponse.status}`);
    }
    
    const weatherData = await weatherResponse.json();
    
    // Transform the weather data into a more usable format
    const transformedData = {
      location: {
        city: weatherData.name,
        country: weatherData.sys.country,
      },
      temperature: {
        current: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        min: Math.round(weatherData.main.temp_min),
        max: Math.round(weatherData.main.temp_max),
      },
      weather: {
        main: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
      },
      wind: {
        speed: Math.round(weatherData.wind.speed),
        deg: weatherData.wind.deg,
      },
      humidity: weatherData.main.humidity,
      timestamp: new Date().toISOString(),
    };
    
    // Set cache-control header for 15 minutes
    return NextResponse.json(transformedData, {
      headers: {
        'Cache-Control': 'public, max-age=900, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Error fetching weather data' },
      { status: 500 }
    );
  }
}