import React, { useEffect, useState, useMemo } from 'react';
import Layout from './layout/Layout';
import { Map as MapIcon, Filter, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 6px rgba(0,0,0,0.35);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
};

const createHotspotIcon = (severity: string, count: number) => {
  const color = severity === 'HIGH' ? '#ef4444' : severity === 'MEDIUM' ? '#f97316' : '#3b82f6';
  return L.divIcon({
    className: 'custom-hotspot-marker bg-transparent border-none',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div class="hotspot-pulse" style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.4;"></div>
        <div style="position: relative; width: 16px; height: 16px; background-color: ${color}; border-radius: 50%; border: 2px solid white; z-index: 2; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>
        ${count > 0 ? `<div style="position: absolute; top: -8px; right: -12px; background: #1f2937; color: white; border-radius: 10px; padding: 0 5px; font-size: 10px; font-weight: bold; border: 1px solid white; z-index: 3;">${count}</div>` : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const getMarkerColor = (c: any) => {
  if (c.status?.toUpperCase() === 'CLOSED') return '#22C55E';
  if (c.priority?.toUpperCase() === 'HIGH') return '#EF4444';
  if (c.priority?.toUpperCase() === 'MEDIUM') return '#F97316';
  return '#3B82F6';
};

const GeospatialIntelligence: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCrime, setFilterCrime] = useState('All');
  const [hotspots, setHotspots] = useState<any[]>([]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch('/api/cases');
        if (res.ok) {
          const data = await res.json();
          setCases(data);
        }
        const hotRes = await fetch('/api/hotspots');
        if (hotRes.ok) {
           const hotData = await hotRes.json();
           setHotspots(hotData);
        }
      } catch (err) {
        console.error("Failed to load cases for map", err);
      }
    };
    fetchCases();
  }, []);

  const uniqueCrimes = ['All', ...Array.from(new Set(cases.map(c => c.crime_type).filter(Boolean)))];

   const filteredCases = cases.filter(c => {
    if (filterStatus !== 'All' && (c.status || '').toUpperCase() !== filterStatus.toUpperCase()) return false;
    if (filterPriority !== 'All' && (c.priority || '').toUpperCase() !== filterPriority.toUpperCase()) return false;
    if (filterCrime !== 'All' && (c.crime_type || c.crimeType) !== filterCrime) return false;
    return true;
  });

  const validLocations = useMemo(() => filteredCases.filter(c => (c.location?.latitude || c.latitude) && (c.location?.longitude || c.longitude)), [filteredCases]);
  const center: [number, number] = validLocations.length > 0
    ? [validLocations[0].location?.latitude || validLocations[0].latitude, validLocations[0].location?.longitude || validLocations[0].longitude]
    : [20.5937, 78.9629];



  return (
    <Layout>
      <div className="h-full flex flex-col max-w-7xl mx-auto space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <MapIcon className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
              Geospatial Intelligence
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Interactive map for crime hotspots, case locations, and suspect movements.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm rounded-md px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm rounded-md px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={filterCrime}
              onChange={(e) => setFilterCrime(e.target.value)}
              className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm rounded-md px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              {uniqueCrimes.map(c => <option key={c} value={c}>{c === 'All' ? 'All Crimes' : c}</option>)}
            </select>
          </div>

          <div className="flex gap-4 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700">
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-1.5 shadow-sm"></span> HIGH</span>
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-1.5 shadow-sm"></span> MEDIUM</span>
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-1.5 shadow-sm"></span> LOW</span>
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-1.5 shadow-sm"></span> CLOSED</span>
          </div>
        </div>

        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm border border-light-border dark:border-dark-border overflow-hidden relative min-h-[600px] z-0">
          <MapContainer
            center={center}
            zoom={5}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', minHeight: '600px' }}
          >
            {import.meta.env.VITE_MAPTILER_API_KEY ? (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://maptiler.com/">MapTiler</a>'
                url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
              />
            ) : (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}
            <MapUpdater center={center} />
            
            {hotspots.map((h, i) => (
               <Marker 
                 key={'hotspot_'+i}
                 position={[h.lat, h.lng]}
                 icon={createHotspotIcon(h.severity, h.count)}
               >
                 <Popup>
                   <div className="text-sm font-medium dark:text-white">
                     <p className="font-bold text-gray-900 dark:text-white mb-1 pb-1 border-b border-gray-200 dark:border-gray-700">{h.is_manual ? h.name || 'Intelligence Zone' : 'Auto Hotspot'}</p>
                     <p className="text-gray-700 dark:text-gray-300">Severity: <span className="font-bold">{h.severity}</span></p>
                     {!h.is_manual && <p className="text-gray-700 dark:text-gray-300">Cluster size: {h.count} cases</p>}
                   </div>
                 </Popup>
               </Marker>
            ))}

            {filteredCases.map(c => {
              const lat = c.location?.latitude || c.latitude;
              const lng = c.location?.longitude || c.longitude;
              if (!lat || !lng) return null;
              const markerColor = getMarkerColor(c);
              return (
                <Marker
                  key={c._id || c.case_number}
                  position={[lat, lng]}
                  icon={createCustomIcon(markerColor)}
                >
                  <Popup>
                    <div className="min-w-[220px] dark:text-white">
                      <h3 className="font-bold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-gray-900 dark:text-white">{c.case_number}</h3>
                      <p className="text-xs my-0.5 text-gray-700 dark:text-gray-300"><strong>Title:</strong> {c.title}</p>
                      <p className="text-xs my-0.5 text-gray-700 dark:text-gray-300"><strong>Crime:</strong> {c.crime_type}</p>
                      <p className="text-xs my-0.5 text-gray-700 dark:text-gray-300"><strong>Location:</strong> {c.location?.city || c.city || c.location?.district || c.district || c.location?.state || c.state}</p>
                      <p className="text-xs my-0.5 text-gray-700 dark:text-gray-300"><strong>Date:</strong> {new Date(c.filingDate || c.createdAt).toLocaleDateString()}</p>
                      <div className="mt-1.5 flex gap-1">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-[10px]">{c.status}</span>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-[10px]">{c.priority} Priority</span>
                      </div>
                      {c.dataClassification === 'DEMO_SYNTHETIC' && (
                        <div className="mt-2">
                          <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-300 dark:border-yellow-700">DEMO DATA</span>
                        </div>
                      )}
                      <div className="mt-2 flex gap-2">
                        <Link to={`/cases/${c.case_number}`} className="flex-1 block bg-light-accent dark:bg-dark-accent text-white no-underline p-1.5 rounded text-xs text-center">View Case</Link>
                        <Link to={`/cases/${c.case_number}/edit`} className="flex-1 block bg-gray-700 dark:bg-gray-600 text-white no-underline p-1.5 rounded text-xs text-center">Edit Case</Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {hotspots.length > 0 && (
            <div className="absolute bottom-4 left-4 z-10 bg-white/90 dark:bg-dark-card/90 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-xs max-w-xs">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center"><MapPin className="w-3 h-3 mr-1" /> Hotspot Zones</h3>
              {hotspots.slice(0, 5).map((h, idx) => (
                <div key={idx} className="flex items-center justify-between mb-1">
                  <span className="text-gray-700 dark:text-gray-200">{h.lat.toFixed(2)}, {h.lng.toFixed(2)}</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{h.count} case{h.count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GeospatialIntelligence;

