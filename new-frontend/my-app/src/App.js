// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Stack, CircularProgress, Box, Button, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

import NetworkOverlay from './components/NetworkOverlay';
import Legend from './components/Legend';
import { fetchBerlinWallFeatures } from './api';

const availableYears = [1946, 1951, 1956, 1960, 1961, 1964, 1967, 1971, 1976, 1980, 1982, 1984, 1989];
const availableTypes = ['All', 'u-bahn', 's-bahn', 'bus', 'strassenbahn'];

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [year, setYear] = useState('1946');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState([]);

  // Fetch data based on year and type
  useEffect(() => {
    if (year) {
      setLoading(true);
      const typeQueryParam = type === 'All' ? '' : type;

      Promise.all([
        axios.get(`https://berlin-mapping-application.onrender.com/nodes?year=${year}&type=${typeQueryParam}`),
        axios.get(`https://berlin-mapping-application.onrender.com/edges?year=${year}&type=${typeQueryParam}`)
      ]).then(([nodesResponse, edgesResponse]) => {
        setGraphData({
          nodes: nodesResponse.data,
          links: edgesResponse.data
        });
        setLoading(false);
      }).catch(error => {
        console.error("There was an error fetching the data!", error);
        setLoading(false);
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

  return (
    <Container>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3">Berlin's Public Transport Visualised</Typography>
      </Box>

      <Stack spacing={2} direction="row" mb={3}>
        {availableYears.map((availableYear) => (
          <Button key={availableYear} variant="contained" color="primary" onClick={() => setYear(availableYear)}>
            {availableYear}
          </Button>
        ))}
      </Stack>
      <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
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
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Add shadow for better elevation
    backgroundColor: '#f5f5f5', // Light background
  }}
>
  <Typography
    variant="h6"
    component="span"
    sx={{
      fontWeight: 'bold',
      backgroundColor: '#3f51b5', // Background color for the label
      color: 'white',
      padding: '8px 12px',
      borderRadius: '4px 0 0 4px', // Rounded only on the left side
    }}
  >
    Select Type:
  </Typography>

  <FormControl
    sx={{
      marginLeft: 1, // Space between label and select
      minWidth: 200, // Minimum width for the select element
      borderRadius: '0 4px 4px 0', // Rounded only on the right side
      backgroundColor: 'white', // White background for the select
    }}
    variant="outlined"
  >
    <Select
      value={type}
      onChange={(e) => setType(e.target.value)}
      sx={{ padding: '8px', fontSize: '16px' }}
    >
      {availableTypes.map((typeOption, index) => (
        <MenuItem key={index} value={typeOption}>
          {typeOption}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>
</Box>
      <Box style={{ height: 'calc(100vh - 80px)', width: '100%', marginBottom: '2rem' }}>
        <MapContainer center={[52.52, 13.405]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Render Berlin Wall Features */}
          {features && features.map((feature, index) => {
            const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

            return <Polyline key={index} positions={coords} color="red" />;
          })}

          {/* Render Nodes and Edges */}
          <NetworkOverlay graphData={graphData} />
          <Legend />
        </MapContainer>
      </Box>
    </Container>
  );
}

export default App;
