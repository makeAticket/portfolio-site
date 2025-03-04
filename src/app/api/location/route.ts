import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const locationFilePath = path.join(process.cwd(), 'location.json');

// Function to get the current location data
async function getLocationData() {
  // Check if the file exists
  if (!fs.existsSync(locationFilePath)) {
    // Create default location file if it doesn't exist
    const defaultData = {
      city: "Philadelphia",
      state: "PA",
      country: "US",
      latitude: 39.9526,
      longitude: -75.1652,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(locationFilePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }

  // Read and parse the location file
  const fileData = fs.readFileSync(locationFilePath, 'utf-8');
  return JSON.parse(fileData);
}

// GET endpoint to retrieve the current location
export async function GET() {
  try {
    const locationData = await getLocationData();
    
    // Set cache control headers
    const headers = {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
    };
    
    return NextResponse.json(locationData, { headers });
  } catch (error) {
    console.error('Error fetching location data:', error);
    return NextResponse.json(
      { error: 'Error fetching location data' },
      { status: 500 }
    );
  }
}

// POST endpoint to update location (would be protected in production)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.city || !data.latitude || !data.longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Update the timestamp
    const locationData = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    // Write to the file
    fs.writeFileSync(locationFilePath, JSON.stringify(locationData, null, 2));
    
    return NextResponse.json(locationData);
  } catch (error) {
    console.error('Error updating location data:', error);
    return NextResponse.json(
      { error: 'Error updating location data' },
      { status: 500 }
    );
  }
}