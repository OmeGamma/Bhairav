import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Shield, Camera as CameraIcon, Filter, LayoutPanelLeft, AlertTriangle, MapPin, X } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { BackButton } from '../../components/common/BackButton';
import { eventService } from '../../services/eventService';
import { cameraService } from '../../services/cameraService';
import type { SecurityEvent, Camera } from '../../types';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Fix leaflet icon issues in React
const iconCamera = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconEvent = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function SecurityMap() {
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsData, camerasData] = await Promise.all([
        eventService.getSecurityEvents(),
        cameraService.getCameras()
      ]);
      setEvents(eventsData);
      setCameras(camerasData);
    } catch (err) {
      setError('Failed to load map data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingState fullHeight message="Loading geospatial intelligence..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <BackButton to="/home" />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Geospatial Intelligence</h2>
          <p className="text-[var(--color-bhairav-text-muted)] mt-1">Live mapping of security assets and events</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-md text-sm hover:bg-[var(--color-bhairav-surface-hover)] transition-colors">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-md text-sm hover:bg-[var(--color-bhairav-surface-hover)] transition-colors">
            <LayoutPanelLeft size={16} /> Layers
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4">
        {/* Map Container */}
        <div className="flex-1 rounded-xl border border-[var(--color-bhairav-border)] overflow-hidden relative shadow-lg">
          <MapContainer 
            center={[mapCenter.lat, mapCenter.lng]} 
            zoom={14} 
            style={{ height: '100%', width: '100%', background: '#121316' }}
            className="z-0"
          >
            {/* Dark mode map tiles (using CartoDB Dark Matter) */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {/* Security Zones (Simulated) */}
            <Circle 
              center={[28.6150, 77.2100]} 
              radius={400} 
              pathOptions={{ color: 'var(--color-bhairav-warning)', fillColor: 'var(--color-bhairav-warning)', fillOpacity: 0.1 }}
            />
            <Circle 
              center={[28.6120, 77.2050]} 
              radius={250} 
              pathOptions={{ color: 'var(--color-bhairav-critical)', fillColor: 'var(--color-bhairav-critical)', fillOpacity: 0.15 }}
            />

            {/* Render Cameras */}
            {cameras.map(cam => (
              <Marker 
                key={cam.id} 
                position={[mapCenter.lat + (Math.random() - 0.5) * 0.02, mapCenter.lng + (Math.random() - 0.5) * 0.02]} 
                icon={iconCamera}
              >
                <Popup className="bg-[var(--color-bhairav-surface)] text-[var(--color-bhairav-text)] border-[var(--color-bhairav-border)]">
                  <div className="p-1">
                    <h4 className="font-bold">{cam.id}</h4>
                    <p className="text-xs">{cam.location}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Render Events */}
            {events.map(evt => evt.coords && (
              <Marker 
                key={evt.id} 
                position={[evt.coords.lat, evt.coords.lng]} 
                icon={iconEvent}
                eventHandlers={{
                  click: () => setSelectedEvent(evt),
                }}
              />
            ))}
          </MapContainer>
          
          {/* Map Legend */}
          <div className="absolute bottom-6 right-6 z-[1000] bg-[var(--color-bhairav-surface)]/90 backdrop-blur border border-[var(--color-bhairav-border)] p-4 rounded-lg shadow-xl">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3">Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span>Camera</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span>Security Event</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--color-bhairav-warning)]/30 border border-[var(--color-bhairav-warning)]"></span>
                <span>Restricted Zone</span>
              </div>
            </div>
          </div>
        </div>

        {/* Context Panel */}
        {selectedEvent ? (
          <div className="w-80 bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl overflow-hidden flex flex-col shadow-lg animate-in fade-in slide-in-from-right-4">
            <div className="p-4 border-b border-[var(--color-bhairav-border)] flex items-center justify-between bg-[var(--color-bhairav-surface)]/50">
              <h3 className="font-semibold">Event Details</h3>
              <button onClick={() => setSelectedEvent(null)} className="flex items-center gap-1 text-[var(--color-bhairav-text-muted)] hover:text-white text-sm transition-colors">
                <X size={14} /> Close
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[var(--color-bhairav-text-muted)]">{selectedEvent.id}</span>
                  <Badge status={selectedEvent.severity}>{selectedEvent.severity}</Badge>
                </div>
                <h4 className="text-lg font-bold">{selectedEvent.type}</h4>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <CameraIcon className="text-[var(--color-bhairav-text-muted)] mt-0.5 shrink-0" size={16} />
                  <div>
                    <span className="block text-xs text-[var(--color-bhairav-text-muted)]">Camera</span>
                    <span>{selectedEvent.cameraId || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-[var(--color-bhairav-text-muted)] mt-0.5 shrink-0" size={16} />
                  <div>
                    <span className="block text-xs text-[var(--color-bhairav-text-muted)]">Location</span>
                    <span>{selectedEvent.location}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-[var(--color-bhairav-text-muted)] mt-0.5 shrink-0" size={16} />
                  <div>
                    <span className="block text-xs text-[var(--color-bhairav-text-muted)]">Description</span>
                    <span className="text-[var(--color-bhairav-text)]">{selectedEvent.description}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-[var(--color-bhairav-border)] space-y-2">
                <button className="w-full bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-white py-2 rounded-md text-sm font-medium transition-colors">
                  Investigate Event
                </button>
                <button className="w-full bg-[var(--color-bhairav-surface)] hover:bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] text-white py-2 rounded-md text-sm transition-colors">
                  Ask Bhairav
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-80 bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl shadow-lg flex flex-col items-center justify-center p-6 text-center">
            <Shield className="text-[var(--color-bhairav-text-muted)] mb-4 opacity-50" size={48} />
            <h3 className="text-lg font-medium mb-2">No Selection</h3>
            <p className="text-sm text-[var(--color-bhairav-text-muted)]">Click on a map marker or zone to view contextual intelligence.</p>
          </div>
        )}
      </div>
    </div>
  );
}
