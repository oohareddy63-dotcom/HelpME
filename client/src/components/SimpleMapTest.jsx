import React, { useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map from 'react-map-gl';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const SimpleMapTest = () => {
  const [viewState, setViewState] = useState({
    longitude: 77.2090,
    latitude: 28.6139,
    zoom: 10
  });

  console.log('SimpleMapTest - Token:', MAPBOX_TOKEN ? 'Available' : 'Missing');

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        onLoad={() => console.log('Map loaded successfully')}
        onError={(error) => console.error('Map error:', error)}
      />
    </div>
  );
};

export default SimpleMapTest;