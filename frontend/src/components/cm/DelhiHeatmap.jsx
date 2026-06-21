import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { delhiGeojson } from './delhiGeojson';

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
  'Shahdara': [28.6800, 77.3000],
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
  if (total > 10) return '#ef4444'; // Red (above 10)
  if (total > 8) return '#f97316';  // Orange (8 to 10)
  if (total > 5) return '#eab308';  // Yellow (5 to 8)
  return '#10b981';                 // Green (0 to 5)
};

const DelhiHeatmap = ({ districtData }) => {
  const navigate = useNavigate();

  const handleDistrictClick = (districtName) => {
    // Navigate to district analytics, passing district name in state
    navigate('/dashboard/cm/district-analytics', { state: { selectedDistrict: districtName } });
  };

  const geoJsonStyle = (feature) => {
    const districtName = feature.properties.Dist_Name;
    const d = districtData.find(item => item.name === districtName) || { total: 0 };
    const color = getColorByVolume(d.total);
    return {
      fillColor: color,
      fillOpacity: 0.45,
      color: '#475569', // slate-600 border
      weight: 1.5,
      opacity: 0.8
    };
  };

  const onEachFeature = (feature, layer) => {
    const districtName = feature.properties.Dist_Name;
    const d = districtData.find(item => item.name === districtName) || {
      name: districtName,
      total: 0,
      resolved: 0,
      critical: 0,
      resolutionRate: 0
    };

    // Bind clean custom tooltip
    layer.bindTooltip(
      `<div class="min-w-[200px] bg-white rounded-lg overflow-hidden shadow-xl border border-slate-200">
        <div class="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-sm tracking-wide text-slate-800 text-center">
          ${d.name}
        </div>
        <div class="p-4 space-y-2 text-left">
          <div class="flex justify-between items-center">
            <span class="text-slate-500 text-xs uppercase font-bold">Total Complaints</span>
            <span class="text-slate-900 font-black">${d.total}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500 text-xs uppercase font-bold">Pending</span>
            <span class="text-amber-500 font-black">${d.total - d.resolved}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500 text-xs uppercase font-bold">Resolved</span>
            <span class="text-emerald-500 font-black">${d.resolved}</span>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-slate-100">
            <span class="text-slate-500 text-xs uppercase font-bold">Resolution Rate</span>
            <span class="text-blue-500 font-black">${d.resolutionRate}%</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500 text-xs uppercase font-bold">Critical Issues</span>
            <span class="text-red-500 font-black">${d.critical}</span>
          </div>
        </div>
      </div>`,
      {
        direction: 'top',
        sticky: true,
        opacity: 1,
        className: 'custom-geojson-tooltip'
      }
    );

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.7,
          weight: 2.5,
          color: '#0f172a'
        });
        l.bringToFront();
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.45,
          weight: 1.5,
          color: '#475569'
        });
      },
      click: () => {
        handleDistrictClick(d.name);
      }
    });
  };

  // Generate a key based on districtData to force GeoJSON re-render on data updates
  const geojsonKey = districtData.map(d => `${d.name}:${d.total}`).join(',');

  return (
    <div className="absolute inset-0 rounded-b-lg overflow-hidden bg-slate-50 z-0 border border-slate-200">
      <MapContainer 
        center={DELHI_CENTER} 
        zoom={11} 
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ background: '#f8fafc', zIndex: 0 }}
        minZoom={10}
        maxZoom={14}
        maxBounds={[
          [28.40, 76.83],
          [28.88, 77.34]
        ]}
        maxBoundsViscosity={1.0}
      >
        <MapResizer />
        
        {/* CartoDB Positron TileLayer for Light Theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Shaded boundaries of districts */}
        <GeoJSON
          key={geojsonKey}
          data={delhiGeojson}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />

        {/* Permanent Text Labels placed at the center of each district */}
        {districtData.map((d, i) => {
          const coords = DISTRICT_COORDS[d.name];
          if (!coords) return null;
          
          return (
            <Marker 
              key={`label-${i}`}
              position={coords} 
              interactive={false}
              icon={L.divIcon({
                className: 'district-label-icon',
                html: `<div style="font-weight: 800; color: #0f172a; font-size: 11px; text-shadow: 2px 2px 0px #fff, -2px -2px 0px #fff, 2px -2px 0px #fff, -2px 2px 0px #fff; white-space: nowrap; text-align: center;">${d.name}</div>`,
                iconSize: [100, 20],
                iconAnchor: [50, 10]
              })}
            />
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-sm border border-slate-200 p-3 rounded-lg shadow-lg">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Complaint Volume</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
            <span className="text-xs text-slate-700 font-medium">Critical (&gt; 10)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#f97316]"></span>
            <span className="text-xs text-slate-700 font-medium">High (8 - 10)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#eab308]"></span>
            <span className="text-xs text-slate-700 font-medium">Moderate (5 - 8)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
            <span className="text-xs text-slate-700 font-medium">Low (0 - 5)</span>
          </div>
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
