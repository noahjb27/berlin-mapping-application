// api.js
import axios from 'axios';

const BASE_URL = 'https://gdi.berlin.de/services/wfs/berlinermauer';

export const fetchBerlinWallFeatures = async () => {
  try {
    const response = await axios.get(`${BASE_URL}?service=WFS&version=2.0.0&request=GetFeature&typeNames=berlinermauer:a_grenzmauer&outputFormat=application/json`);
    return response.data.features; // Return the features array
  } catch (error) {
    console.error('Error fetching Berlin Wall features:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
};
