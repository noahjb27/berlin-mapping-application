// src/components/NetworkOverlay.js
import { Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useMemo } from 'react';
import L from 'leaflet';
import { parseCoordinates } from "../utils/helpers"

const getLinkColor = (sourceNode, targetNode) => {
  // Assign link color based on the type of the source or target node
  if (sourceNode.type === targetNode.type) {
    return getColorByType(sourceNode.type); // If source and target have the same type
  }
  return '#7C7C7C'; // Default color for mixed types
};

const getColorByType = (type) => {
  switch (type) {
    case 'u-bahn':
      return '#003688';
    case 's-bahn':
      return '#006F35';
    case 'bus':
      return '#FF4900';
    case 'strassenbahn':
      return '#D82020';
    default:
      return '#7C7C7C';
  }
};

function NetworkOverlay({ graphData }) {
  const map = useMap();

  const nodeMap = useMemo(() => {
    const map = {};
    graphData.nodes.forEach(node => {
      map[node.id] = node;
    });
    return map;
  }, [graphData.nodes]);

  return (
    <>
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
          <Polyline key={index} positions={[sourceCoords, targetCoords]} color={getLinkColor(sourceNode, targetNode)} weight={2} opacity={0.6} />
        );
      })}
      {graphData.nodes && graphData.nodes.map((node, index) => {
        const coords = parseCoordinates(node);
        if (!coords) {
          console.warn('Skipping node due to invalid coordinates:', node);
          return null;
        }

        return (
          <Marker
            key={index}
            position={coords}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: ${getColorByType(node.type)}; width: 10px; height: 10px; border-radius: 50%;"></div>`,
              iconSize: [10, 10],
              iconAnchor: [5, 5]
            })}
          >
            <Popup>
              {node.node_label || `Node ${node.id}`}
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default NetworkOverlay;
