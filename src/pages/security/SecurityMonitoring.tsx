import { useState, useEffect } from 'react';
import { Camera as CameraIcon, MapPin, Activity, AlertTriangle, PlaySquare, Shield, Info, ArrowLeft, Plus } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { cameraService } from '../../services/cameraService';
import { eventService } from '../../services/eventService';
import { webSocketService } from '../../services/webSocketService';
import type { Camera, SecurityEvent, Detection } from '../../types';

export default function SecurityMonitoring() {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [liveTelemetry, setLiveTelemetry] = useState<any>(null);
  const [isAddCameraModalOpen, setIsAddCameraModalOpen] = useState(false);
  const [newCamera, setNewCamera] = useState({ name: '', source_type: 'SIMULATED', stream_reference: '' });
  
  const handleAddCamera = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      // 1. Create camera
      const res = await fetch('http://127.0.0.1:5000/api/v1/cameras/', {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
         body: JSON.stringify({
             name: newCamera.name || 'New Camera',
             source_type: newCamera.source_type,
             stream_reference: newCamera.stream_reference,
             status: 'OFFLINE',
             enabled: true,
             configuration: { fps: 5, resolution: '1920x1080' }
         })
      });
      if (!res.ok) throw new Error('Failed to create camera');
      const created = await res.json();
      
      // 2. Start session
      const sessRes = await fetch(`http://127.0.0.1:5000/api/v1/cameras/${created.id}/sessions`, {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!sessRes.ok) throw new Error('Failed to start session');
      
      setIsAddCameraModalOpen(false);
      setNewCamera({ name: '', source_type: 'SIMULATED', stream_reference: '' });
      fetchData();
    } catch (err) {
      alert('Failed to add camera');
    }
  };
  
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [allEvents, setAllEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [camerasData, eventsData] = await Promise.all([
        cameraService.getCameras(),
        eventService.getSecurityEvents()
      ]);
      setCameras(camerasData);
      setAllEvents(eventsData);
    } catch (err) {
      setError('Failed to load camera feeds.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    webSocketService.connect();
    
    const unsubTelemetry = webSocketService.subscribe('camera_telemetry', (data: any) => {
      // data contains camera_id, session_id, frame_number, timestamp, detections, severity, event_type
      setCameras(prev => prev.map(c => 
        c.id === data.camera_id 
          ? { ...c, detectionCount: (c.detectionCount || 0) + data.detections.length, lastEventTime: data.timestamp } 
          : c
      ));
      
      setLiveTelemetry((prev: any) => {
        // If we are looking at this camera, update telemetry
        if (data.camera_id) { // In a real app we'd check `selectedCamera?.id === data.camera_id` but we can't capture state easily without refs
           return data; 
        }
        return prev;
      });
    });
    
    const unsubAlert = webSocketService.subscribe('new_alert', (alert: any) => {
      setAllEvents(prev => [{
        id: alert.id,
        type: alert.title,
        severity: alert.severity,
        timestamp: alert.created_at,
        cameraId: alert.camera_id,
        description: alert.description,
        location: 'Detected Location',
        relatedEntitiesCount: 0,
        status: 'active'
      }, ...prev]);
    });

    return () => {
      unsubTelemetry();
      unsubAlert();
      webSocketService.disconnect();
    };
  }, []);

  if (loading) {
    return <LoadingState fullHeight message="Initializing video monitoring..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  if (selectedCamera) {
    const relatedEvents = allEvents.filter(e => e.cameraId === selectedCamera.id);
    
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={() => setSelectedCamera(null)}
          className="flex items-center gap-2 text-sm text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Grid
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <CameraIcon className="text-[var(--color-bhairav-primary)]" />
              {selectedCamera.id} - {selectedCamera.name}
            </h2>
            <p className="text-[var(--color-bhairav-text-muted)] mt-1 flex items-center gap-1">
              <MapPin size={14} /> {selectedCamera.location}
            </p>
          </div>
          <Badge status="info" dot={false} className="px-3 py-1 font-mono tracking-widest text-xs uppercase bg-[var(--color-bhairav-surface)] border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)]">
            {selectedCamera.isSimulated ? 'SIMULATED FEED' : 'LIVE FEED'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <div className="aspect-video bg-[#000] border border-[var(--color-bhairav-border)] rounded-xl overflow-hidden relative group shadow-lg flex items-center justify-center">
              {/* Simulated Video Placeholder */}
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.2)_51%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
              
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-red-500 font-mono text-xs font-bold tracking-widest uppercase">REC</span>
              </div>
              <div className="absolute bottom-4 left-4 font-mono text-xs text-white/70">
                {liveTelemetry && liveTelemetry.camera_id === selectedCamera.id ? new Date(liveTelemetry.timestamp).toISOString().replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19)}
              </div>
              
              {/* Snapshot Display / Placeholder */}
              {liveTelemetry && liveTelemetry.camera_id === selectedCamera.id && liveTelemetry.snapshot_id ? (
                 <img src={`http://localhost:5000/api/v1/evidence/snapshots/${liveTelemetry.snapshot_id}.jpg`} className="absolute inset-0 w-full h-full object-contain opacity-50" onError={(e) => (e.currentTarget.style.display = 'none')} />
              ) : (
                 <PlaySquare size={48} className="text-[var(--color-bhairav-border)]/50 group-hover:text-[var(--color-bhairav-primary)] transition-colors" />
              )}
              
              {/* Overlay elements to simulate AI tracking */}
              {liveTelemetry && liveTelemetry.camera_id === selectedCamera.id && liveTelemetry.detections && liveTelemetry.detections.map((det: Detection, idx: number) => {
                 // Convert normalized coords to percentages if available, or just mock it
                 return (
                   <div key={idx} className="absolute top-1/3 left-1/4 w-32 h-48 border border-[var(--color-bhairav-primary)]/50 bg-[var(--color-bhairav-primary)]/10 animate-pulse">
                      <span className="absolute -top-6 left-0 bg-[var(--color-bhairav-primary)]/80 text-white text-[10px] px-1 font-mono">{det.label.toUpperCase()} {Math.round(det.confidence * 100)}%</span>
                   </div>
                 );
              })}
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-[var(--color-bhairav-surface)] hover:bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)] py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Shield size={16} /> Investigate
              </button>
              <button className="flex-1 bg-[var(--color-bhairav-surface)] hover:bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)] py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <MapPin size={16} /> Open in Map
              </button>
              <button className="flex-1 bg-[var(--color-bhairav-primary)]/20 hover:bg-[var(--color-bhairav-primary)]/30 border border-[var(--color-bhairav-primary)]/50 text-[var(--color-bhairav-primary)] py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Info size={16} /> Ask Bhairav
              </button>
            </div>
          </div>

          <div className="xl:col-span-1 space-y-6">
            <Card title="Camera Telemetry">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--color-bhairav-bg)] p-3 rounded-md border border-[var(--color-bhairav-border)]">
                  <span className="text-xs text-[var(--color-bhairav-text-muted)] block mb-1">Detections</span>
                  <span className="font-mono text-xl">{selectedCamera.detectionCount}</span>
                </div>
                <div className="bg-[var(--color-bhairav-bg)] p-3 rounded-md border border-[var(--color-bhairav-border)]">
                  <span className="text-xs text-[var(--color-bhairav-text-muted)] block mb-1">Status</span>
                  <span className="font-medium text-[var(--color-bhairav-verified)] capitalize">{selectedCamera.status}</span>
                </div>
              </div>
            </Card>

            <Card title="Event Timeline" className="flex-1 min-h-[300px]">
              {relatedEvents.length > 0 ? (
                <div className="space-y-4">
                  {relatedEvents.map(evt => (
                    <div key={evt.id} className="relative pl-6 border-l-2 border-[var(--color-bhairav-border)] pb-2 last:pb-0">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[var(--color-bhairav-primary)]"></div>
                      <div className="flex flex-col">
                        <span className="text-xs text-[var(--color-bhairav-text-muted)] font-mono">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-sm mt-1">{evt.type}</span>
                        {evt.severity === 'critical' && (
                          <span className="text-xs text-[var(--color-bhairav-critical)] flex items-center gap-1 mt-1">
                            <AlertTriangle size={12} /> Alert Generated
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="relative pl-6 border-l-2 border-[var(--color-bhairav-border)]">
                     <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[var(--color-bhairav-neutral)]"></div>
                     <span className="text-xs text-[var(--color-bhairav-text-muted)] font-mono">
                        {new Date(Date.now() - 30 * 60000).toLocaleTimeString()} - Person detected
                     </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-[var(--color-bhairav-text-muted)]">
                  <Activity size={24} className="mb-2 opacity-50" />
                  <p className="text-sm">No recent events</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Monitoring</h2>
          <p className="text-[var(--color-bhairav-text-muted)] mt-1">Live grid of active intelligence feeds</p>
        </div>
        <div className="flex items-center gap-4">
           <Badge status="info" dot={false}>{cameras.length} Active Feeds</Badge>
           <button onClick={() => setIsAddCameraModalOpen(true)} className="flex items-center gap-1 bg-[var(--color-bhairav-primary)] text-[var(--color-bhairav-text)] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[var(--color-bhairav-primary-hover)] transition-colors shadow-lg shadow-[var(--color-bhairav-primary)]/20">
              <Plus size={16} /> Deploy Source
           </button>
        </div>
      </div>
      
      {/* Add Camera Modal */}
      {isAddCameraModalOpen && (
        <div className="fixed inset-0 bg-[#000]/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-primary)]/30 rounded-xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(59,130,246,0.15)] animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 uppercase tracking-tight flex items-center gap-2">
              <CameraIcon className="text-[var(--color-bhairav-primary)]" /> Deploy Video Source
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-bhairav-text-muted)] mb-1.5">Source Name</label>
                <input type="text" value={newCamera.name} onChange={e => setNewCamera({...newCamera, name: e.target.value})} className="w-full bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-md px-3 py-2.5 text-sm focus:border-[var(--color-bhairav-primary)] outline-none transition-colors" placeholder="e.g., Gate 1 RTSP" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-bhairav-text-muted)] mb-1.5">Ingestion Protocol</label>
                <select value={newCamera.source_type} onChange={e => setNewCamera({...newCamera, source_type: e.target.value})} className="w-full bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-md px-3 py-2.5 text-sm focus:border-[var(--color-bhairav-primary)] outline-none transition-colors appearance-none">
                   <option value="SIMULATED">Simulated Engine (Synthetic)</option>
                   <option value="WEBCAM">Local Webcam (USB/PCIe)</option>
                   <option value="VIDEO_FILE">File Ingestion (MP4/AVI)</option>
                   <option value="RTSP">Network Stream (RTSP/HTTP)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-bhairav-text-muted)] mb-1.5">Stream Reference</label>
                <input type="text" value={newCamera.stream_reference} onChange={e => setNewCamera({...newCamera, stream_reference: e.target.value})} className="w-full bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-md px-3 py-2.5 text-sm focus:border-[var(--color-bhairav-primary)] outline-none transition-colors" placeholder="e.g., 0, /path/to/video.mp4, rtsp://..." />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-[var(--color-bhairav-border)]">
              <button onClick={() => setIsAddCameraModalOpen(false)} className="px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors">Cancel</button>
              <button onClick={handleAddCamera} className="bg-[var(--color-bhairav-primary)] text-white px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-bhairav-primary-hover)] transition-colors shadow-lg">Initialize</button>
            </div>
          </div>
        </div>
      )}

      {cameras.length === 0 ? (
        <EmptyState icon={CameraIcon} title="No Cameras Available" description="No security cameras are currently configured or online." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cameras.map((cam) => (
            <Card 
              key={cam.id} 
              className="hover:border-[var(--color-bhairav-primary)]/50 cursor-pointer transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] group"
            >
              <div onClick={() => setSelectedCamera(cam)}>
                <div className="aspect-video bg-[#000] border border-[var(--color-bhairav-border)] rounded-lg mb-4 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.2)_51%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
                  <PlaySquare size={32} className="text-[var(--color-bhairav-border)]/50 group-hover:text-[var(--color-bhairav-primary)]/50 transition-colors" />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono border border-[var(--color-bhairav-border)]">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    {cam.isSimulated ? 'SIM' : 'LIVE'}
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {cam.id}
                    </h3>
                    <p className="text-[var(--color-bhairav-text-muted)] text-sm flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {cam.location}
                    </p>
                  </div>
                  {cam.detectionCount > 10 && (
                    <Badge status="warning" dot={false} className="animate-pulse">Active</Badge>
                  )}
                </div>
                
                <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-bhairav-text-muted)] border-t border-[var(--color-bhairav-border)] pt-3">
                  <span className="flex items-center gap-1">
                    <Activity size={14} /> {cam.detectionCount} Detections
                  </span>
                  <span>
                    {cam.lastEventTime ? new Date(cam.lastEventTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
