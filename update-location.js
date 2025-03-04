const fs = require('fs');
const path = require('path');
const readline = require('readline');

const locationFilePath = path.join(__dirname, 'location.json');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get coordinates from city name using OpenStreetMap Nominatim API
async function getCoordinates(cityName) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Portfolio Weather Widget'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('No results found for this location');
    }
    
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      city: data[0].name,
      state: data[0].address?.state || '',
      country: data[0].address?.country_code?.toUpperCase() || ''
    };
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
}

// Main function
async function updateLocation() {
  console.log('=== Update Your Location ===');
  
  // Load current location
  let currentLocation;
  try {
    currentLocation = JSON.parse(fs.readFileSync(locationFilePath, 'utf-8'));
    console.log(`Current location: ${currentLocation.city}, ${currentLocation.state || ''} ${currentLocation.country}`);
  } catch (error) {
    console.log('No current location found or error reading file.');
    currentLocation = {};
  }
  
  // Prompt for new location
  rl.question('\nEnter your new location (e.g., "New York, NY" or "Paris, France"): ', async (locationInput) => {
    if (!locationInput.trim()) {
      console.log('No location entered. Exiting...');
      rl.close();
      return;
    }
    
    console.log('Fetching coordinates for', locationInput, '...');
    const locationData = await getCoordinates(locationInput);
    
    if (!locationData) {
      console.log('Failed to get coordinates. Please try again with a different location name.');
      rl.close();
      return;
    }
    
    // Update location file
    const newLocation = {
      ...locationData,
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(locationFilePath, JSON.stringify(newLocation, null, 2));
    
    console.log(`\nLocation updated successfully!`);
    console.log(`New location: ${newLocation.city}, ${newLocation.state || ''} ${newLocation.country}`);
    console.log(`Coordinates: ${newLocation.latitude}, ${newLocation.longitude}`);
    console.log(`\nYour weather widget will update with the new location.`);
    
    rl.close();
  });
}

// Run the update function
updateLocation();