// src/components/WMSLayer.js
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const WMSLayer = ({ url, layers, format, transparent }) => {
  const map = useMap();

  useEffect(() => {
    // Define the WMS layer parameters
    const wmsLayer = L.tileLayer.wms(url, {
      service: 'WMS',
      request: 'GetMap',
      layers: layers,
      format: format || 'image/png',
      transparent: transparent !== undefined ? transparent : true,
      srs: 'EPSG:4326', // Use geographic coordinates (WGS84)
      attribution: '&copy; <a href="https://fbinter.stadt-berlin.de/">Geoportal Berlin</a>',
    });

    wmsLayer.addTo(map); // Add the WMS layer to the map

    // Cleanup the layer when the component is unmounted
    return () => {
      map.removeLayer(wmsLayer);
    };
  }, [url, layers, format, transparent, map]);

  return null; // This component doesn't render anything directly
};

export default WMSLayer;
