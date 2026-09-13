import React, { useState, useEffect, useRef } from 'react';
import Layout from './layout/Layout';
import { trackingApi, type VehicleIntelligence, type VehicleDetection, type VehicleEntities } from '../api/trackingApi';
import { Search, Car, Navigation, MapPin, Clock, Play, Pause, RotateCcw, AlertTriangle, Shield, SearchX, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const calculateHeading = (p1: [number, number], p2: [number, number]) => {
  const dLng = (p2[1] - p1[1]) * Math.PI / 180;
  const lat1 = p1[0] * Math.PI / 180;
  const lat2 = p2[0] * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
};

// Custom Node Markers
const createNodeIcon = (color: string, label: string) => L.divIcon({
  className: 'custom-node-marker',
  html: `<div style="display:flex; flex-direction:column; align-items:center;">
           <div style="background-color:${color}; width:16px; height:16px; border-radius:50%; border:3px solid #13151c; box-shadow:0 0 10px ${color};"></div>
           <div style="background-color:rgba(0,0,0,0.8); color:white; font-size:10px; padding:2px 6px; border-radius:4px; margin-top:4px; white-space:nowrap; border: 1px solid ${color}; font-weight:bold;">${label}</div>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Auto-centering hook
const MapCenterer = ({ center, autoFollow, isPlaying }: { center: [number, number], autoFollow: boolean, isPlaying: boolean }) => {
  const map = useMap();
  useEffect(() => {
    if (!isPlaying) {
      map.flyTo(center, 12, { animate: true, duration: 1 });
    } else if (autoFollow) {
      map.setView(center, map.getZoom(), { animate: false });
    }
  }, [center, map, autoFollow, isPlaying]);
  return null;
};

const BhairavTracking: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [vehicle, setVehicle] = useState<VehicleIntelligence | null>(null);
  const [detections, setDetections] = useState<VehicleDetection[]>([]);
  const [entities, setEntities] = useState<VehicleEntities | null>(null);
  
  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  const [routeFailed, setRouteFailed] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);

  const [mapCenter, setMapCenter] = useState<[number, number]>([26.8467, 80.9462]);
  
  // Animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [autoFollow, setAutoFollow] = useState(true);
  
  const [carPosition, setCarPosition] = useState<[number, number] | null>(null);
  const [carHeading, setCarHeading] = useState(0);
  
  // Progress along the entire route (0 to 1)
  const progressRef = useRef(0);
  const reqRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  // To sync timeline
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Enter a valid vehicle registration number.");
      return;
    }

    setLoading(true);
    setError(null);
    setVehicle(null);
    setDetections([]);
    setEntities(null);
    setIsPlaying(false);
    setRouteGeometry([]);
    progressRef.current = 0;
    setActiveSegmentIndex(0);

    try {
      const vData = await trackingApi.getVehicleIntelligence(searchQuery);
      const mData = await trackingApi.getVehicleMovement(searchQuery);
      const eData = await trackingApi.getVehicleEntities(searchQuery);
      
      setVehicle(vData);
      setDetections(mData);
      setEntities(eData);
      
      if (mData.length > 0) {
        setMapCenter([mData[0].latitude, mData[0].longitude]);
        setCarPosition([mData[0].latitude, mData[0].longitude]);
        
        // Fetch OSRM Route
        if (mData.length > 1) {
          const coords = mData.map(d => `${d.longitude},${d.latitude}`).join(';');
          try {
            const res = await axios.get(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
            if (res.data.routes && res.data.routes.length > 0) {
              const geom = res.data.routes[0].geometry.coordinates; // [lon, lat]
              const latLngs = geom.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
              setRouteGeometry(latLngs);
              setRouteFailed(false);
              setTotalDistance(res.data.routes[0].distance);
            }
          } catch (routeErr) {
            console.error("OSRM Routing failed", routeErr);
            setRouteFailed(true);
            setRouteGeometry(mData.map(d => [d.latitude, d.longitude]));
          }
        }
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("No vehicle records found.");
      } else {
        setError("Unable to retrieve vehicle intelligence.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(reqRef.current);
      lastTimeRef.current = 0;
      return;
    }

    if (routeGeometry.length < 2) {
      setIsPlaying(false);
      return;
    }

    const totalDurationMs = 15000 / playbackSpeed; // Base duration 15s for the whole route

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      progressRef.current += deltaTime / totalDurationMs;
      
      if (progressRef.current >= 1) {
        progressRef.current = 1;
        setIsPlaying(false);
      }

      const exactIndex = progressRef.current * (routeGeometry.length - 1);
      const index1 = Math.floor(exactIndex);
      const index2 = Math.min(index1 + 1, routeGeometry.length - 1);
      const segmentProgress = exactIndex - index1;

      const p1 = routeGeometry[index1];
      const p2 = routeGeometry[index2];

      const lat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
      const lng = p1[1] + (p2[1] - p1[1]) * segmentProgress;
      
      // Calculate heading
      if (index1 !== index2) {
        setCarHeading(calculateHeading(p1, p2));
      }

      setCarPosition([lat, lng]);
      if (autoFollow) {
        setMapCenter([lat, lng]);
      }
      
      // Estimate active segment for timeline (rough division based on progress)
      // Since we have 3 points, progress 0-0.5 is segment 1 (Lucknow-Basti), 0.5-1.0 is segment 2 (Basti-Ayodhya)
      if (detections.length === 3) {
        if (progressRef.current < 0.5) setActiveSegmentIndex(0); // Lucknow
        else if (progressRef.current < 0.99) setActiveSegmentIndex(1); // Basti
        else setActiveSegmentIndex(2); // Ayodhya
      }

      if (progressRef.current < 1) {
        reqRef.current = requestAnimationFrame(animate);
      }
    };

    reqRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqRef.current);
  }, [isPlaying, playbackSpeed, routeGeometry, autoFollow, detections.length]);

  const togglePlay = () => {
    if (progressRef.current >= 1) {
      progressRef.current = 0; // Restart
      setActiveSegmentIndex(0);
      if (routeGeometry.length > 0) {
        setCarPosition(routeGeometry[0]);
        setMapCenter(routeGeometry[0]);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const restartAnimation = () => {
    setIsPlaying(false);
    progressRef.current = 0;
    setActiveSegmentIndex(0);
    if (routeGeometry.length > 0) {
      setCarPosition(routeGeometry[0]);
      setMapCenter(routeGeometry[0]);
      setCarHeading(calculateHeading(routeGeometry[0], routeGeometry[1] || routeGeometry[0]));
    }
  };
  
  const handleLocationClick = (idx: number, det: VehicleDetection) => {
    setIsPlaying(false);
    setActiveSegmentIndex(idx);
    setMapCenter([det.latitude, det.longitude]);
    // Snap progress for simple 3 point demo
    if (detections.length === 3) {
      if (idx === 0) progressRef.current = 0;
      if (idx === 1) progressRef.current = 0.5;
      if (idx === 2) progressRef.current = 1;
    }
    
    // Calculate precise node index in routeGeometry if possible
    // For now we just snap car to the node directly
    setCarPosition([det.latitude, det.longitude]);
  };

  const getNodeStyle = (idx: number, length: number) => {
    if (idx === 0) return { color: '#22c55e', label: 'START' }; // Green
    if (idx === length - 1) return { color: '#3b82f6', label: 'LAST SEEN' }; // Blue
    return { color: '#a855f7', label: 'INTERMEDIATE' }; // Purple
  };

  return (
    <Layout>
      <div className="flex flex-col h-full bg-[#0a0c10] text-gray-200">
        
        {/* Top Header & Search */}
        <div className="flex-none p-6 border-b border-gray-800/80 bg-[#13151c]/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Navigation className="w-6 h-6 text-blue-500" />
                Bhairav Tracking
              </h1>
              <p className="text-sm text-gray-400 mt-1">Real road routing and movement visualization</p>
            </div>
            
            <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-3">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter vehicle number (e.g. UP32 AB 1234)"
                  className="w-full bg-[#0f111a] border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder-gray-600 uppercase"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT: Map Area */}
          <div className="flex-1 relative bg-[#0f111a] border-r border-gray-800/80 flex flex-col z-10">
            {detections.length > 0 ? (
              <>
                {routeFailed && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-900/90 text-white text-xs px-4 py-2 rounded-lg border border-red-500 flex items-center gap-2 shadow-lg backdrop-blur-sm">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Road route unavailable for this segment.
                    <button onClick={() => handleSearch()} className="ml-2 bg-red-800 hover:bg-red-700 px-2 py-1 rounded transition-colors">Retry Route</button>
                  </div>
                )}

                <MapContainer center={mapCenter} zoom={12} className="flex-1 z-0" zoomControl={false}>
                  {import.meta.env.VITE_MAPTILER_API_KEY ? (
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://maptiler.com/">MapTiler</a>'
                      url={`https://api.maptiler.com/maps/basic-v2-dark/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
                    />
                  ) : (
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
                    />
                  )}
                  <MapCenterer center={mapCenter} autoFollow={autoFollow} isPlaying={isPlaying} />
                  
                  {/* Observation Path (Real Road Geometry) */}
                  {routeGeometry.length > 0 && (
                    <Polyline 
                      positions={routeGeometry} 
                      pathOptions={{ 
                        color: '#3b82f6', 
                        weight: 4, 
                        opacity: 0.8,
                        lineCap: 'round',
                        lineJoin: 'round'
                      }} 
                    />
                  )}
                  
                  {/* Observation Nodes */}
                  {detections.map((det, idx) => {
                    const style = getNodeStyle(idx, detections.length);
                    return (
                      <Marker 
                        key={det.id} 
                        position={[det.latitude, det.longitude]} 
                        icon={createNodeIcon(style.color, style.label)}
                        eventHandlers={{
                          click: () => handleLocationClick(idx, det)
                        }}
                      >
                        <Popup className="custom-popup">
                          <div className="p-1 bg-[#13151c] text-white rounded shadow-lg min-w-[200px]">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-2 border-b border-gray-700 pb-1">LOCATION</div>
                            <div className="font-semibold text-lg text-blue-400 mb-1">{det.locationName}</div>
                            <div className="text-sm flex justify-between mb-1"><span className="text-gray-500">Time:</span> <span>12 Sept • {new Date(det.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                            <div className="text-sm flex justify-between mb-1"><span className="text-gray-500">Status:</span> <span>{idx === 0 ? 'Oldest Recorded Location' : idx === detections.length - 1 ? 'Last Seen' : 'Second Last Seen'}</span></div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {/* Single Animated Car */}
                  {carPosition && (
                    <Marker
                      position={carPosition}
                      zIndexOffset={1000}
                      icon={L.divIcon({
                        className: 'animated-car-icon',
                        html: `<div style="
                                 transform: rotate(${carHeading}deg);
                                 transition: transform 0.1s linear;
                                 width: 32px; height: 32px;
                                 background-color: white;
                                 border-radius: 50%;
                                 display: flex; align-items: center; justify-content: center;
                                 box-shadow: 0 0 15px rgba(255,255,255,0.6);
                               ">
                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-90)">
                                   <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                                   <circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
                                 </svg>
                               </div>`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                      })}
                    />
                  )}
                </MapContainer>
                
                {/* Auto Follow Toggle Overlay */}
                <div className="absolute bottom-24 right-4 z-[1000]">
                  <button 
                    onClick={() => setAutoFollow(!autoFollow)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold shadow-lg transition-colors border ${autoFollow ? 'bg-blue-600/90 text-white border-blue-500' : 'bg-[#13151c]/90 text-gray-400 border-gray-700 hover:text-white'}`}
                  >
                    <Crosshair className="w-4 h-4" />
                    {autoFollow ? 'Following Vehicle' : 'Follow Vehicle'}
                  </button>
                </div>

                {/* Timeline Panel Overlay (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#13151c]/90 backdrop-blur-md border-t border-gray-800 p-4 z-[1000]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Movement Timeline
                    </h3>
                    <div className="flex items-center gap-2">
                      <select 
                        value={playbackSpeed} 
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-blue-500 mr-2"
                      >
                        <option value={0.5}>0.5×</option>
                        <option value={1}>1×</option>
                        <option value={2}>2×</option>
                        <option value={4}>4×</option>
                      </select>
                      <button onClick={restartAnimation} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors" title="Restart">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button onClick={togglePlay} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] min-w-[140px] justify-center">
                        {isPlaying ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Replay Movement</>}
                      </button>
                    </div>
                  </div>
                  
                  {/* Horizontal Timeline */}
                  <div className="relative flex items-center w-full pb-2 overflow-x-auto custom-scrollbar">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 -translate-y-1/2 z-0"></div>
                    
                    {detections.map((det, idx) => {
                      const isActive = activeSegmentIndex === idx;
                      const isPast = activeSegmentIndex > idx;
                      const style = getNodeStyle(idx, detections.length);
                      
                      return (
                        <div key={det.id} className="relative z-10 flex-1 min-w-[120px] flex flex-col items-center group cursor-pointer" onClick={() => handleLocationClick(idx, det)}>
                          <div className="text-[10px] text-gray-500 mb-2 font-mono">{new Date(det.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${isActive ? 'scale-150 shadow-[0_0_10px_rgba(255,255,255,0.4)]' : ''}`} style={{ backgroundColor: isActive || isPast ? style.color : '#374151', borderColor: '#13151c' }} />
                          <div className={`text-xs mt-2 text-center px-2 truncate w-full transition-colors ${isActive ? 'text-white font-bold' : 'text-gray-500 group-hover:text-gray-300'}`}>
                            {det.locationName.split(' ')[0]}
                          </div>
                          <div className="text-[9px] font-bold mt-0.5 tracking-wider" style={{ color: style.color }}>
                            {style.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]">
                {loading ? (
                  <>
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 font-medium">Searching vehicle intelligence...</p>
                  </>
                ) : error ? (
                  <>
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                      <SearchX className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-white font-medium text-lg mb-1">{error}</p>
                    <p className="text-gray-500 text-sm">Please try another vehicle registration number.</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                      <MapPin className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-white font-medium text-lg mb-1">Search a vehicle number to begin tracking.</p>
                    <p className="text-gray-500 text-sm max-w-sm">Access historical location data, actual road routing, and case associations.</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Info Panel */}
          {vehicle && (
            <div className="w-full lg:w-96 bg-[#13151c] flex flex-col overflow-y-auto custom-scrollbar border-l border-gray-800/50">
              <div className="p-5 space-y-6">
                
                {/* Vehicle Intelligence Summary */}
                <div className="bg-[#0f111a] border border-gray-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Car className="w-24 h-24" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Vehicle Movement Summary</div>
                    <h2 className="text-2xl font-bold text-white tracking-tight mb-2">{vehicle.vehicleNumber}</h2>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-semibold rounded uppercase">
                        Road-based Tracking
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-1">
                      <div className="bg-[#13151c] p-2.5 rounded-lg border border-gray-800/80">
                        <div className="text-xs text-gray-500 mb-1">Stops</div>
                        <div className="text-lg font-bold text-white">{detections.length}</div>
                      </div>
                      <div className="bg-[#13151c] p-2.5 rounded-lg border border-gray-800/80">
                        <div className="text-xs text-gray-500 mb-1">Distance</div>
                        <div className="text-lg font-bold text-white">{totalDistance > 0 ? (totalDistance / 1000).toFixed(1) + ' km' : '--'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Last Seen / Second Last */}
                {detections.length >= 2 && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">Recorded Observations</div>
                    
                    {/* CURRENT (LAST SEEN) */}
                    <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 flex gap-4 cursor-pointer hover:bg-blue-900/20 transition-colors" onClick={() => handleLocationClick(detections.length-1, detections[detections.length-1])}>
                      <div className="mt-1">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-blue-400 mb-1 tracking-wider uppercase">Last Seen</div>
                        <div className="text-sm font-semibold text-white mb-0.5">{detections[detections.length-1].locationName}</div>
                        <div className="text-xs text-gray-400 flex justify-between items-center mt-2">
                          <span>{new Date(detections[detections.length-1].timestamp).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                          <span className="text-blue-500 font-mono text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded">{detections[detections.length-1].sourceType}</span>
                        </div>
                      </div>
                    </div>

                    {/* PREVIOUS (SECOND LAST) */}
                    <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4 flex gap-4 cursor-pointer hover:bg-purple-900/20 transition-colors" onClick={() => handleLocationClick(detections.length-2, detections[detections.length-2])}>
                      <div className="mt-1">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-purple-400 mb-1 tracking-wider uppercase">Second Last Seen</div>
                        <div className="text-sm font-semibold text-white mb-0.5">{detections[detections.length-2].locationName}</div>
                        <div className="text-xs text-gray-400 flex justify-between items-center mt-2">
                          <span>{new Date(detections[detections.length-2].timestamp).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                          <span className="text-purple-400 font-mono text-[10px] bg-purple-500/10 px-1.5 py-0.5 rounded">{detections[detections.length-2].sourceType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Associated Entities */}
                {entities && (entities.cases.length > 0 || entities.persons.length > 0) && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 flex items-center justify-between">
                      Associated Entities
                    </div>
                    
                    <div className="bg-[#0f111a] border border-gray-800 rounded-xl p-2 relative">
                       <div className="absolute left-6 top-6 bottom-6 w-px bg-gray-800 z-0"></div>
                       
                       <div className="relative z-10 flex items-center gap-3 p-2">
                         <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center border border-gray-700">
                           <Car className="w-4 h-4 text-gray-400" />
                         </div>
                         <span className="font-semibold text-sm">{vehicle.vehicleNumber}</span>
                       </div>

                       {entities.cases.map(c => (
                         <div key={c.id} className="relative z-10 flex items-start gap-3 p-2 ml-4">
                           <div className="w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30 mt-0.5 z-10">
                             <AlertTriangle className="w-3 h-3 text-yellow-500" />
                           </div>
                           <div className="flex-1">
                             <a href={`/cases/${c.id}`} className="text-sm font-medium text-yellow-500 hover:underline">{c.id}</a>
                             <p className="text-xs text-gray-500 truncate">{c.title}</p>
                           </div>
                         </div>
                       ))}

                       {entities.persons.map(p => (
                         <div key={p.id} className="relative z-10 flex items-center gap-3 p-2 ml-4">
                           <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30 z-10">
                             <Shield className="w-3 h-3 text-blue-500" />
                           </div>
                           <div className="flex-1 flex justify-between items-center">
                             <a href={`/suspect/${p.id}`} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{p.name}</a>
                             <span className="text-[10px] text-gray-500 uppercase px-1.5 py-0.5 bg-gray-800 rounded">{p.role}</span>
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .leaflet-container {
          background-color: #0a0c10 !important;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          background-color: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip-container {
          display: none;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0 !important;
        }
      `}</style>
    </Layout>
  );
};

export default BhairavTracking;
