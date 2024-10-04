// src/components/Legend.js
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

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

function Legend() {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      const types = ['u-bahn', 's-bahn', 'bus', 'strassenbahn'];
      const labels = [];

      types.forEach(type => {
        const iconUrl = getColorByType(type);
        labels.push(
          `<i style="background-color: ${iconUrl}; background-size: contain; display: inline-block;"></i> ${type}`
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

export default Legend;
