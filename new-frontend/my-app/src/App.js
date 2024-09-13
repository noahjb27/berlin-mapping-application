import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Define marker icons for different node types
const busIcon = new L.Icon({
  iconUrl: '/assets/bus.png', 
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const tramIcon = new L.Icon({
  iconUrl: '/assets/tram.png', 
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const ubahnIcon = new L.Icon({
  iconUrl: '/assets/u-bahn.png', 
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const sbahnIcon = new L.Icon({
  iconUrl: '/assets/s-bahn.png', 
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const defaultIcon = new L.Icon({
  iconUrl: '/assets/location-pin.png', 
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

// Helper function to parse coordinates from string
const parseCoordinates = (coordString) => {
  const coords = coordString.replace(/[()]/g, '').split(',');
  const [lng, lat] = coords.map(Number);
  return [lat, lng]; // Return in Leaflet's [lat, lng] order
};

// Function to determine the correct icon based on node type
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

function App() {
  const [graphData, setGraphData] = useState(null); // Graph data state
  const [year, setYear] = useState(1980); // Year state
  const [inputYear, setInputYear] = useState(''); // Input field state

 // Fetch data based on the selected year
 useEffect(() => {
  if (year) {
    axios.get(`https://berlin-mapping-application.onrender.com/graph?year=${year}`)
      .then(response => {
        setGraphData(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the graph data!", error);
      });
  }
}, [year]); // This effect runs whenever the year changes

const availableYears = [1946, 1951, 1956, 1960, 1961, 1964, 1967, 1971, 1976, 1980, 1982, 1984, 1989];

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputYear) {
      setYear(inputYear); // Set the year from input
    }
  };


  if (!graphData) return <div>Loading...</div>;

  return (
    <div>
      <h1>Graph Visualization on Map</h1>

      {/* Buttons for selecting the year */}
      <div>
        {availableYears.map((availableYear) => (
          <button 
            key={availableYear} 
            onClick={() => setYear(availableYear)}
          >
            {availableYear}
          </button>
        ))}
      </div>

      {year && <p>Selected Year: {year}</p>}


      <MapContainer center={[52.52, 13.405]} zoom={12} style={{ height: "100vh", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render Nodes with Dynamic Icons and Custom Popup */}
        {graphData.nodes.map((node, index) => {
          console.log(node);
          const nodeType = node.type; // Get the node type from the data
          const icon = getIconByType(nodeType); // Determine the correct icon
          const popupContent = node.node_labels; // Get the value of attvalue "d3"
          
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
        {graphData.links.map((edge, index) => {
          const sourceCoords = parseCoordinates(edge.source);
          const targetCoords = parseCoordinates(edge.target);

          return (
            <Polyline 
              key={index} 
              positions={[sourceCoords, targetCoords]} 
              color="blue" 
              weight={3} 
            />
          );
        })}
      </MapContainer>
    </div>
  );
}

export default App;
