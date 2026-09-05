import { useState, useEffect, useRef } from 'react';
import { Camera as CameraIcon, MapPin, Activity, AlertTriangle, PlaySquare, Shield, Info, ArrowLeft, User, Car, Clock, Zap } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { cameraService } from '../../services/cameraService';
import { eventService } from '../../services/eventService';
import { aiService } from '../../services/aiService';
import type { Camera, SecurityEvent, CameraSession, InferenceResult, WebSocketMessage } from '../../types';

export default function SecurityMonitoring() {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [allEvents, setAllEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // AI-specific state
  const [activeSession, setActiveSession] = useState<CameraSession | null>(null);
  const [inferenceResult, setInferenceResult] = useState<InferenceResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

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
      
      // Get AI status
      try {
        const status = await aiService.getAIStatus();
        setAiStatus(status);
      } catch (e) {
        console.warn('AI status not available:', e);
      }
    } catch (err) {
      setError('Failed to load camera feeds.');
    } finally {
      setLoading(false);
    }
  };

  const startAISession = async (cameraId: string) => {
    try {
      setIsProcessing(true);
      const session = await aiService.createCameraSession(
        cameraId,
        'VIDEO_FILE',
        'demo_video.mp4', // Placeholder for demo
        {
          processing_enabled: true,
          fps_limit: 15
        }
      );
      setActiveSession(session);
      
      // Connect WebSocket for real-time updates
      const ws = aiService.createWebSocketConnection(
        (message: WebSocketMessage) => {
          if (message.type === 'detection.created' || message.type === 'track.updated') {
            console.log('AI Event:', message);
          }
        },
        cameraId,
        (error) => console.error('WebSocket error:', error),
        () => console.log('WebSocket closed')
      );
      wsRef.current = ws;
      
    } catch (e) {
      console.error('Failed to start AI session:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const stopAISession = async () => {
    if (activeSession) {
      await aiService.stopCameraSession(activeSession.session_id);
      setActiveSession(null);
      setInferenceResult(null);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const processFrame = async () => {
    if (!activeSession) return;
    
    try {
      setIsProcessing(true);
      const result = await aiService.processSessionFrame(activeSession.session_id);
      setInferenceResult(result);
    } catch (e) {
      console.error('Failed to process frame:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    return () => {
      stopAISession();
    };
  }, []);

  useEffect(() => {
    if (selectedCamera) {
      startAISession(selectedCamera.id);
    } else {
      stopAISession();
    }
  }, [selectedCamera]);

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
          <div className="flex items-center gap-2">
            {activeSession && (
              <Badge status="verified" dot={false} className="px-3 py-1 font-mono tracking-widest text-xs uppercase">
                AI ACTIVE
              </Badge>
            )}
            <Badge status="info" dot={false} className="px-3 py-1 font-mono tracking-widest text-xs uppercase bg-[var(--color-bhairav-surface)] border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)]">
              {selectedCamera.isSimulated ? 'SIMULATED FEED' : 'LIVE FEED'}
            </Badge>
          </div>
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
                {new Date().toISOString().replace('T', ' ').substring(0, 19)}
              </div>
              
              {/* AI Detection Overlays */}
              {inferenceResult && inferenceResult.detections.length > 0 && (
                inferenceResult.detections.map((detection, idx) => (
                  <div
                    key={idx}
                    className="absolute border-2 border-[var(--color-bhairav-primary)] bg-[var(--color-bhairav-primary)]/10"
                    style={{
                      left: `${(detection.bbox.x1 / 640) * 100}%`,
                      top: `${(detection.bbox.y1 / 480) * 100}%`,
                      width: `${((detection.bbox.x2 - detection.bbox.x1) / 640) * 100}%`,
                      height: `${((detection.bbox.y2 - detection.bbox.y1) / 480) * 100}%`
                    }}
                  >
                    <span className="absolute -top-6 left-0 bg-[var(--color-bhairav-primary)]/90 text-white text-[10px] px-1 font-mono">
                      {detection.label.toUpperCase()} {(detection.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))
              )}
              
              <PlaySquare size={48} className="text-[var(--color-bhairav-border)]/50 group-hover:text-[var(--color-bhairav-primary)] transition-colors" />
            </div>

            {/* AI Metrics Bar */}
            {activeSession && (
              <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Zap size={16} className="text-[var(--color-bhairav-primary)]" />
                    AI Metrics
                  </span>
                  <button
                    onClick={processFrame}
                    disabled={isProcessing}
                    className="text-xs bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary)]/80 px-3 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Process Frame'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-[var(--color-bhairav-text-muted)] block">Detections</span>
                    <span className="font-mono text-lg">{inferenceResult?.detections.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-bhairav-text-muted)] block">Tracks</span>
                    <span className="font-mono text-lg">{inferenceResult?.tracks.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-bhairav-text-muted)] block">Inference</span>
                    <span className="font-mono text-lg">{inferenceResult?.metrics.inference_time_ms.toFixed(0)}ms</span>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-bhairav-text-muted)] block">FPS</span>
                    <span className="font-mono text-lg">{activeSession.ai_metrics?.fps.toFixed(1) || '--'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button className="flex-1 bg-[var(--color-bhairav-surface)] hover:bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Shield size={16} /> Investigate
              </button>
              <button className="flex-1 bg-[var(--color-bhairav-surface)] hover:bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
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
              
              {/* AI Detection Breakdown */}
              {inferenceResult && (
                <div className="mt-4 pt-4 border-t border-[var(--color-bhairav-border)]">
                  <span className="text-xs text-[var(--color-bhairav-text-muted)] block mb-2">AI Detection Breakdown</span>
                  <div className="space-y-2">
                    {inferenceResult.detections.map((detection, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          {detection.label === 'person' ? <User size={14} /> : <Car size={14} />}
                          {detection.label}
                        </span>
                        <span className="font-mono text-xs">{(detection.confidence * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
        <div className="flex items-center gap-2">
           <Badge status="info" dot={false}>{cameras.length} Active Feeds</Badge>
        </div>
      </div>

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
