import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

const DELHI_CENTER = [28.6139, 77.2090];

const DISTRICT_COORDS = {
  'Central Delhi': [28.6465, 77.2088],
  'East Delhi': [28.6360, 77.3020],
  'West Delhi': [28.6500, 77.0833],
  'North Delhi': [28.7500, 77.1500],
  'South Delhi': [28.5200, 77.2000],
  'North East Delhi': [28.7000, 77.2667],
  'North West Delhi': [28.7333, 77.1167],
  'South East Delhi': [28.5667, 77.2500],
  'South West Delhi': [28.5833, 77.0500],
  'Shahdara': [28.6800, 77.3000], // slightly adjusted to separate from East
  'New Delhi': [28.6139, 77.2090]
};

// Component to handle dynamic map resizing
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
};

const getColorByVolume = (total) => {
  if (total > 3000) return '#ef4444'; // Red (Critical)
  if (total > 2000) return '#f97316'; // Orange (High)
  if (total > 1000) return '#eab308'; // Yellow (Moderate)
  return '#10b981'; // Green (Low)
};

const getRadiusByVolume = (total) => {
  if (total > 3000) return 30;
  if (total > 2000) return 25;
  if (total > 1000) return 20;
  return 15;
};

const DelhiHeatmap = ({ districtData }) => {
  const navigate = useNavigate();

  const handleDistrictClick = (districtName) => {
    // Navigate to district analytics, potentially passing district name in state
    navigate('/cm/district-analytics', { state: { selectedDistrict: districtName } });
  };

  return (
    <div className="absolute inset-0 rounded-b-lg overflow-hidden bg-slate-50 z-0 border border-slate-200">
      <MapContainer 
        center={DELHI_CENTER} 
        zoom={11} 
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ background: '#f8fafc', zIndex: 0 }} // Tailwind slate-50
        minZoom={10}
        maxZoom={14}
        maxBounds={[
          [28.40, 76.83], // South West
          [28.88, 77.34]  // North East
        ]}
        maxBoundsViscosity={1.0}
      >
        <MapResizer />
        
        {/* CartoDB Positron TileLayer for Light Theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {districtData.map((d, i) => {
          const coords = DISTRICT_COORDS[d.name];
          if (!coords) return null; // Skip if no coords mapped
          
          const color = getColorByVolume(d.total);
          
          return (
            <React.Fragment key={i}>
              <CircleMarker
                center={coords}
                radius={getRadiusByVolume(d.total)}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.6,
                  weight: 2
                }}
                eventHandlers={{
                  click: () => handleDistrictClick(d.name),
                }}
              >
                <Tooltip 
                  className="custom-tooltip border-0 p-0 rounded-lg shadow-xl overflow-hidden"
                  direction="top"
                  offset={[0, -10]}
                  opacity={1}
                >
                  <div className="min-w-[200px] bg-white rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-sm tracking-wide text-slate-800 text-center">
                      {d.name}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-xs uppercase font-bold">Total Complaints</span>
                        <span className="text-slate-900 font-black">{d.total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-xs uppercase font-bold">Pending</span>
                        <span className="text-amber-500 font-black">{d.total - d.resolved}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-xs uppercase font-bold">Resolved</span>
                        <span className="text-emerald-500 font-black">{d.resolved}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <span className="text-slate-500 text-xs uppercase font-bold">Resolution Rate</span>
                        <span className="text-blue-500 font-black">{d.resolutionRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-xs uppercase font-bold">Critical Issues</span>
                        <span className="text-red-500 font-black">{d.critical}</span>
                      </div>
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
              
              {/* Permanent Text Label below the bubble */}
              <Marker 
                position={coords} 
                interactive={false}
                icon={L.divIcon({
                  className: 'district-label-icon',
                  html: `<div style="font-weight: 800; color: #1e293b; font-size: 11px; text-shadow: 2px 2px 0px #fff, -2px -2px 0px #fff, 2px -2px 0px #fff, -2px 2px 0px #fff; white-space: nowrap; text-align: center;">${d.name}</div>`,
                  iconSize: [100, 20],
                  iconAnchor: [50, -18] // Offset downward
                })}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-sm border border-slate-200 p-3 rounded-lg shadow-lg">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Complaint Volume</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-xs text-slate-700 font-medium">Critical</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span><span className="text-xs text-slate-700 font-medium">High</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span><span className="text-xs text-slate-700 font-medium">Moderate</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-xs text-slate-700 font-medium">Low</span></div>
        </div>
      </div>
      
      {/* Interaction Hint Overlay */}
      <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Interactive: Click district to analyze</p>
      </div>
    </div>
  );
};

export default DelhiHeatmap;
