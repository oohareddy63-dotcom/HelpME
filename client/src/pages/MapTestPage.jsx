import React from 'react';
import SimpleMapTest from '../components/SimpleMapTest';

const MapTestPage = () => {
  return (
    <div style={{ padding: '2rem', background: '#1a1a1a', minHeight: '100vh' }}>
      <h1 style={{ color: '#00bcd4', marginBottom: '2rem' }}>Mapbox Test Page</h1>
      <div style={{ 
        background: '#2d2d2d', 
        borderRadius: '15px', 
        overflow: 'hidden',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)'
      }}>
        <SimpleMapTest />
      </div>
      <div style={{ marginTop: '2rem', color: 'white' }}>
        <h3>Debug Info:</h3>
        <p>Mapbox Token: {import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ? 'Available' : 'Not available'}</p>
        <p>Check browser console for detailed logs.</p>
      </div>
    </div>
  );
};

export default MapTestPage;