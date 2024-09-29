import React, { useState, useEffect } from 'react';
import axios from 'axios';
import proj4 from 'proj4'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Button, Container, Typography, Stack, CircularProgress, Box } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import { fetchBerlinWallFeatures } from './api'; // Adjust the import path as needed

// Import images
import ubahnImage from './assets/u-bahn.png';
import sbahnImage from './assets/s-bahn.png';
import tramImage from './assets/tram.png';
import busImage from './assets/bus.png';
import defaultImage from './assets/location-pin.png';

// Function to create a new icon
function createIcon(iconUrl) {
  return new L.Icon({
    iconUrl: iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
}

// Create icons using the function
const ubahnIcon = createIcon(ubahnImage);
const sbahnIcon = createIcon(sbahnImage);
const tramIcon = createIcon(tramImage);
const busIcon = createIcon(busImage);
const defaultIcon = createIcon(defaultImage);

// Function to get the appropriate icon based on type
const getIconByType = (type) => {
  switch (type) {
    case 'bus':
      return busIcon;
    case 'u-bahn':
      return ubahnIcon;
    case 's-bahn':
      return sbahnIcon;
    case 'strassenbahn':
      return tramIcon;
    default:
      return defaultIcon;
  }
};
// Function to get the icon URL by type
const getIconUrlByType = (type) => {
  const icon = getIconByType(type);
  return icon.options.iconUrl;
};

function Legend() {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      const types = ['u-bahn', 's-bahn', 'bus', 'strassenbahn'];
      const labels = [];

      types.forEach(type => {
        const iconUrl = getIconUrlByType(type);
        labels.push(
          `<i style="background-image: url(${iconUrl}); background-size: contain; display: inline-block;"></i> ${type}`
        );
      });

      div.innerHTML = labels.join('<br>');
      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
}

// Define the projection for your coordinates
proj4.defs("EPSG:25833", "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs"); // Adjust according to your coordinate system

// Helper function to parse coordinates from string
const parseCoordinates = (node) => {
  if (node && node.x !== undefined && node.y !== undefined) {
    return [node.y, node.x]; // Leaflet expects [latitude, longitude]
  }
  return null;
};

const availableYears = [1946, 1951, 1956, 1960, 1961, 1964, 1967, 1971, 1976, 1980, 1982, 1984, 1989];
// Available types for dropdown
const availableTypes = ['All', 'u-bahn', 's-bahn', 'bus', 'strassenbahn'];



function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] }); // Initialize with empty arrays
  const [year, setYear] = useState('1946'); // Year state
  const [type, setType] = useState(''); // Selected type
  const [loading, setLoading] = useState(false); // Loading state
  const [features, setFeatures] = useState([]);

  // Fetch data based on the selected year and type
  useEffect(() => {
    if (year) {
      setLoading(true); // Start loading
      const typeQueryParam = type === 'All' ? '' : type;

      axios.get(`https://berlin-mapping-application.onrender.com/nodes?year=${year}&type=${typeQueryParam}`)
        .then(response => {
          console.log('Nodes returned:', response.data.length); // Log number of nodes returned
          setGraphData(prevData => ({
            ...prevData,
            nodes: response.data
          }));
          setLoading(false); // Stop loading once data is fetched
        })
        .catch(error => {
          console.error("There was an error fetching the nodes data!", error);
          setLoading(false); // Stop loading on error
        });

      axios.get(`https://berlin-mapping-application.onrender.com/edges?year=${year}&type=${typeQueryParam}`)
        .then(response => {
          console.log('Edges returned:', response.data.length); // Log number of edges returned
          setGraphData(prevData => ({
            ...prevData,
            links: response.data
          }));
        })
        .catch(error => {
          console.error("Error fetching the edges data!", error);
        });
    }
  }, [year, type]);

  useEffect(() => {
    const getFeatures = async () => {
      try {
        const fetchedFeatures = await fetchBerlinWallFeatures();
        setFeatures(fetchedFeatures);
      } catch (error) {
        console.error('Failed to fetch features:', error);
      }
    };

    getFeatures();
  }, []);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Map nodes to a dictionary by ID for easy lookup
  const nodeMap = {};
  graphData.nodes.forEach(node => {
    nodeMap[node.id] = node;
  });

  return (
    <Container>
      <Box textAlign="center" mb={4} id="title">
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontFamily: 'Roboto, sans-serif', 
            fontWeight: 'bold', 
            color: '#333' 
          }}
        >
          Berlin's Public Transport Visualised
        </Typography>
      </Box>

      {/* Buttons for selecting the year */}
      <Stack spacing={2} direction="row" mb={3}>
        {availableYears.map((availableYear) => (
          <Button 
            key={availableYear} 
            variant="contained" 
            color="primary" 
            onClick={() => setYear(availableYear)}
          >
            {availableYear}
          </Button>
        ))}
      </Stack>

      {year && (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          mb={3} 
          sx={{
            padding: '16px', 
            borderRadius: '8px',
            maxWidth: '400px',
            margin: '0 auto', // Center the box
          }}
        >
          <Typography 
            variant="h6" 
            component="span" 
            sx={{ 
              fontWeight: 'bold', 
              backgroundColor: '#3f51b5', // Background color for the "Selected Year" label
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px 0 0 4px', // Rounded only on the left side
            }}
          >
            Selected Year:
          </Typography>

          <Typography 
            variant="h6" 
            component="span" 
            sx={{ 
              fontWeight: 'bold', 
              backgroundColor: '#ff9800', // Different background for the year itself
              color: 'white',
              padding: '8px 12px',
              borderRadius: '0 4px 4px 0', // Rounded only on the right side
              marginLeft: '4px' // Small spacing between the two sections
            }}
          >
            {year}
          </Typography>
        </Box>
      )}

<Box display="flex" 
          justifyContent="center" 
          alignItems="center" 
          mb={3} 
          sx={{
            padding: '16px', 
            borderRadius: '8px',
            maxWidth: '400px',
            margin: '0 auto', // Center the box
          }}>
        <Typography             variant="h6" 
            component="span" 
            sx={{ 
              fontWeight: 'bold', 
              backgroundColor: '#3f51b5', // Background color for the "Selected Year" label
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px 0 0 4px', // Rounded only on the left side
            }}>Select Type:</Typography>
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '8px', fontSize: '16px' }}>
          {availableTypes.map((typeOption, index) => (
            <option key={index} value={typeOption}>{typeOption}</option>
          ))}
        </select>
      </Box>

      <Box style={{ 
        height: 'calc(100vh - 80px)', // Adjust height to fit in the viewport minus header/footer height
        width: '100%', 
        marginBottom: '2rem' // Add margin-bottom for spacing under the map
      }}>
        <MapContainer center={[52.52, 13.405]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Render Nodes with Dynamic Icons and Custom Popup */}
          {graphData.nodes && graphData.nodes.map((node, index) => {
            const nodeType = node.type; // Adjust based on the actual data key
            const icon = getIconByType(nodeType); // Determine the correct icon
            const popupContent = node.node_label; // Adjust based on the actual data key
            
            return (
              <Marker 
                key={index} 
                position={[node.y, node.x]} 
                icon={icon} // Use dynamic icon based on type
              >
                <Popup>
                  {popupContent} {/* Display the content from d3 */}
                </Popup>
              </Marker>
            );
          })}

          {/* Render Edges (Polylines) */}
          {graphData.links && graphData.links.map((edge, index) => {
            const sourceNode = nodeMap[edge.source];
            const targetNode = nodeMap[edge.target];

            const sourceCoords = parseCoordinates(sourceNode);
            const targetCoords = parseCoordinates(targetNode);

            if (!sourceCoords || !targetCoords) {
              console.warn('Skipping edge due to invalid coordinates:', edge);
              return null;
            }

            return (
              <Polyline key={index} positions={[sourceCoords, targetCoords]} color="blue" weight={3} />
            );
          })}

   {/* Render Berlin Wall Features */}
   {features && features.map((feature, index) => {
  const coords = feature.geometry.coordinates.map(coord => {
    // Transform from UTM (EPSG:25833) to WGS84 (EPSG:4326)
    const [lon, lat] = proj4("EPSG:25833", "EPSG:4326", coord);
    return [lat, lon]; // Leaflet expects [lat, lon]
  });

  return (
    <Polyline key={index} positions={coords} color="red" weight={5} />
  );
})}

<Legend />
        </MapContainer>
      </Box>
    </Container>
  );
}

export default App;
