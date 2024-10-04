// src/utils/helpers.js
import L from 'leaflet';
import proj4 from 'proj4';

// Helper function to parse coordinates from string
export const parseCoordinates = (node) => {
  if (node && node.x !== undefined && node.y !== undefined) {
    return [node.y, node.x]; // Leaflet expects [latitude, longitude]
  }
  return null;
};

// Function to create a new icon
export const createIcon = (iconUrl) => {
  return new L.Icon({
    iconUrl: iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
};

// Define the projection for your coordinates
proj4.defs("EPSG:25833", "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs");
