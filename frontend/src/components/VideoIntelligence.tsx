import React, { useState, useRef, useEffect, useCallback } from 'react';
import Layout from './layout/Layout';
import {
  Video, Upload, Play, Pause, AlertTriangle,
  Wifi, WifiOff,
  Camera, Cpu, Activity, FolderOpen, XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const VideoIntelligence: React.FC = () => {
   const [videoFile, setVideoFile] = useState<File | null>(null);
   const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState('');
  const [cases, setCases] = useState<any[]>([]);
  const [existingReports, setExistingReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingInfo, setProcessingInfo] = useState<any>(null);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [analysisPaused, setAnalysisPaused] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const wsUrl = `ws://${window.location.hostname}:8000/ws/video-intelligence`;
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch('/api/cases');
        if (res.ok) {
          const data = await res.json();
          setCases(data);
          if (data.length > 0) setSelectedCase(data[0].case_number);
        }
      } catch (err) {
        console.error("Failed to load cases", err);
      }
    };

    const fetchAiStatus = async () => {
      try {
        const res = await fetch('/api/video-intelligence/status');
        if (res.ok) {
          const data = await res.json();
          setAiStatus(data);
        }
      } catch (err) {
        setAiStatus({ enabled: false, yolo: { initialized: false, error: "Unavailable" } });
      }
    };

    fetchCases();
    fetchAiStatus();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      if (!selectedCase) return;
      setIsLoadingReports(true);
      try {
        const res = await fetch(`/api/video-intelligence/reports/by-case/${encodeURIComponent(selectedCase)}`);
        if (res.ok) {
          const data = await res.json();
          setExistingReports(data);
        }
      } catch (err) {
        console.error("Failed to load video reports", err);
      } finally {
        setIsLoadingReports(false);
      }
    };
    fetchReports();
  }, [selectedCase]);

  useEffect(() => {
    return () => {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (ws) ws.close();
    };
  }, [cameraStream, ws]);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => {
        console.error("Video play failed:", err);
        setCameraError("Camera feed could not be started.");
      });
    }
  }, [cameraStream]);

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
      setCameraStream(stream);
      setCameraActive(true);

      const ws_conn = new WebSocket(wsUrl);
      setWs(ws_conn);

      ws_conn.onopen = () => {
        console.log("WebSocket connected for video intelligence");
      };

      ws_conn.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "detections") {
          setDetections(data.detections || []);
          for (const det of data.detections) {
            if (det.event_type === "PERSON_DETECTED" && det.bounding_box && det.personCropUrl) {
              const exists = timelineEvents.some(e => e.track_id === det.track_id && e.timestamp === det.timestamp);
              if (!exists) {
                setTimelineEvents(prev => [...prev, {
                  timestamp: new Date().toISOString(),
                  eventType: "PERSON_DETECTED",
                  trackId: det.track_id,
                  confidence: det.confidence,
                  frameNumber: data.frame_number,
                  personCropUrl: det.personCropUrl,
                }]);
              }
            }
          }
        } else if (data.type === "pong") {
          ws_conn.send(JSON.stringify({ type: "ping" }));
        }
      };

      ws_conn.onerror = (err) => {
        console.error("WebSocket error:", err);
        setCameraError("WebSocket connection failed.");
      };

      ws_conn.onclose = () => {
        console.log("WebSocket disconnected");
      };
    } catch (err: any) {
      setCameraError(err.name === "NotAllowedError"
        ? "Camera access denied. Please allow camera permission in your browser."
        : "Camera access unavailable. Check browser permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
    setDetections([]);
    if (ws) {
      ws.close();
      setWs(null);
    }
  };

  const pauseAnalysis = () => {
    setAnalysisPaused(true);
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  };

  const resumeAnalysis = () => {
    setAnalysisPaused(false);
    startCameraLoop();
  };

  const startCameraLoop = useCallback(() => {
    if (!cameraActive || analysisPaused || !videoRef.current || !ws) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frameIntervalRef.current = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/jpeg', 70);
        const frameBase64 = imageData.replace(/^data:image\/jpeg;base64,/, '');

        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: "analyze_frame",
            frame: frameBase64,
            sourceName: "Laptop Camera",
            frameNumber: Date.now(),
            videoTimestamp: new Date().toISOString(),
            caseId: selectedCase,
          }));
        }
      }
    }, 100);
  }, [cameraActive, analysisPaused, ws, selectedCase]);

  useEffect(() => {
    if (cameraActive && !analysisPaused) {
      startCameraLoop();
    }
  }, [cameraActive, analysisPaused, startCameraLoop]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
      setVideoUrl(URL.createObjectURL(e.target.files[0]));
      setTimelineEvents([]);
      setDetections([]);
    }
  };

  const processUploadedVideo = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    setProcessingInfo(null);

    try {
      const formData = new FormData();
      formData.append("file", videoFile);
      if (selectedCase) formData.append("case_id", selectedCase);

      const res = await fetch("/api/video-intelligence/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed.");
      }

      const data = await res.json();
      setProcessingInfo({
        status: "processing_started",
        message: data.message,
        videoId: data.videoId,
      });

      pollReports();
    } catch (err: any) {
      setProcessingInfo({
        status: "error",
        message: err.message || "Upload failed.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const prevReportCountRef = useRef(0);
  const timelineEventsRef = useRef(timelineEvents);
  timelineEventsRef.current = timelineEvents;

  const pollReports = useCallback(() => {
    if (!selectedCase) return;
    prevReportCountRef.current = 0;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/video-intelligence/reports/by-case/${encodeURIComponent(selectedCase || '')}`);
        if (res.ok) {
          const data = await res.json();
          setExistingReports(data);
          const prevCount = prevReportCountRef.current;
          if (data.length > prevCount) {
            const newEvents = data.slice(prevCount).map((r: any) => ({
              timestamp: r.timestamp || r.createdAt,
              eventType: r.eventType || "PERSON_DETECTED",
              trackId: r.trackId,
              confidence: r.confidence,
              reportId: r.reportId,
              personCropUrl: r.personCropUrl,
            }));
            setTimelineEvents(prev => [...prev, ...newEvents]);
            prevReportCountRef.current = data.length;
          }
          if (data.length > 0 && processingInfo?.status === "processing_started") {
            setProcessingInfo({
              status: "completed",
              message: "Analysis complete",
              reportCount: data.length,
            });
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000);

    setTimeout(() => clearInterval(interval), 60000);
  }, [selectedCase, processingInfo?.status]);

  const drawDetections = (video: HTMLVideoElement, canvas: HTMLCanvasElement | null) => {
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const det of detections) {
      const bbox = det.bounding_box;
      if (!bbox) continue;
      ctx.strokeStyle = "#EF4444";
      ctx.lineWidth = 2;
      ctx.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);
      ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
      ctx.font = "12px Arial";
      const label = `Person ${det.track_id || ""} ${Math.round(det.confidence * 100)}%`;
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(bbox.x1, bbox.y1 - 16, textWidth + 4, 16);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, bbox.x1 + 2, bbox.y1 - 4);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Video className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
              Video Intelligence
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Real-time AI-powered video analysis and evidence detection.
            </p>
          </div>

          {aiStatus && (
            <div className="flex items-center gap-4 bg-white dark:bg-dark-card px-4 py-2 rounded-md border border-light-border dark:border-dark-border text-sm">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${aiStatus.yolo?.initialized ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-gray-700 dark:text-gray-300">
                  AI Engine: {aiStatus.yolo?.initialized ? 'YOLO' : 'Unavailable'}
                </span>
              </div>
              {aiStatus.yolo?.device && (
                <div className="flex items-center">
                  <Cpu className="w-3 h-3 mr-1 text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400">Device: {aiStatus.yolo.device}</span>
                </div>
              )}
              {!aiStatus.enabled && (
                <span className="text-yellow-600 dark:text-yellow-400 text-xs">⚠ Disabled</span>
              )}
            </div>
          )}
        </div>

        {!aiStatus?.enabled && (
          <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-md border border-yellow-200 dark:border-yellow-800">
            Video Intelligence is disabled. Set VIDEO_INTELLIGENCE_ENABLED=true in backend/.env to enable.
          </div>
        )}

        {!aiStatus?.yolo?.initialized && aiStatus?.enabled && (
          <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800">
            AI video engine unavailable. {aiStatus?.yolo?.error || 'Model not loaded.'}
          </div>
        )}

        <div className="flex items-center gap-2 bg-white dark:bg-dark-card p-2 rounded-md border border-light-border dark:border-dark-border text-sm">
          <FolderOpen className="w-4 h-4 text-gray-500" />
          <select
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-md px-2 py-1 focus:ring-light-accent focus:border-light-accent"
          >
            <option value="">No Case (General)</option>
            {cases.map(c => <option key={c.case_number} value={c.case_number}>{c.case_number} - {c.title}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
          <div className="lg:col-span-3 flex flex-col space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden flex-1 min-h-[500px] flex items-center justify-center border border-gray-800 shadow-lg">
              {(cameraActive && cameraStream) ? (
                <>
                  <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm text-white p-3 rounded-lg border border-white/20 shadow-lg font-mono text-xs w-56">
                    <div className="flex items-center mb-2">
                      <span className="w-2 h-2 rounded-full mr-2 bg-red-500 animate-pulse"></span>
                      <span className="font-bold">LIVE Camera Active</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Detection:</span>
                        <span className={detections.some(d => d.class === 'person') ? "text-red-400 font-bold" : "text-green-400 font-bold"}>
                          {detections.some(d => d.class === 'person') ? "PERSON DETECTED" : "NO PERSON DETECTED"}
                        </span>
                      </div>
                      {detections.length > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Count:</span>
                            <span className="font-bold">{detections.filter(d => d.class === 'person').length} HUMAN(S)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Max Conf:</span>
                            <span className="font-bold">{Math.round(Math.max(...detections.map(d => d.confidence || 0), 0) * 100)}%</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    autoPlay
                    muted
                    playsInline
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
                  />
                </>
              ) : videoFile && videoUrl ? (
                <>
                   <video
                     ref={videoRef}
                     className="w-full h-full object-contain"
                     src={videoUrl}
                     onEnded={() => {}}
                     onPlay={() => {
                       const v = videoRef.current;
                      if (!v) return;
                      const animate = () => {
                        if (v.paused || v.ended) return;
                        const canvas = canvasRef.current;
                        if (canvas) drawDetections(v, canvas);
                        requestAnimationFrame(animate);
                      };
                      animate();
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  />
                  {detections.map((det, idx) => {
                    const bbox = det.bounding_box;
                    if (!bbox) return null;
                    return (
                      <div
                        key={idx}
                        className="absolute border-2 border-red-400 bg-red-500/20 rounded pointer-events-none"
                        style={{
                          left: `${(bbox.x1 / (videoRef.current?.videoWidth || 640)) * 100}%`,
                          top: `${(bbox.y1 / (videoRef.current?.videoHeight || 480)) * 100}%`,
                          width: `${((bbox.x2 - bbox.x1) / (videoRef.current?.videoWidth || 640)) * 100}%`,
                          height: `${((bbox.y2 - bbox.y1) / (videoRef.current?.videoHeight || 480)) * 100}%`,
                        }}
                      >
                        <span className="absolute -top-5 left-0 bg-red-500 text-white text-xs px-1 rounded">
                          Person {det.track_id || ''} {Math.round(det.confidence * 100)}%
                        </span>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="text-gray-500 text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Start camera or upload a video to begin analysis.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-dark-card rounded-lg p-4 shadow-sm border border-light-border dark:border-dark-border">
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-4 text-gray-700 dark:text-gray-300">
                  {!cameraActive && !videoFile ? (
                    <>
                      <button
                        onClick={startCamera}
                        disabled={!aiStatus?.enabled || !aiStatus?.yolo?.initialized}
                        className="px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
                      >
                        <Play className="w-4 h-4 mr-2" /> Start Camera
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center"
                      >
                        <Upload className="w-4 h-4 mr-2" /> Upload Video
                      </button>
                    </>
                  ) : cameraActive ? (
                    <>
                      {analysisPaused ? (
                        <button
                          onClick={resumeAnalysis}
                          className="px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
                        >
                          <Play className="w-4 h-4 mr-2" /> Resume Analysis
                        </button>
                      ) : (
                        <button
                          onClick={pauseAnalysis}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center"
                        >
                          <Pause className="w-4 h-4 mr-2" /> Pause Analysis
                        </button>
                      )}
                      <button
                        onClick={stopCamera}
                        className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Stop Camera
                      </button>
                    </>
                  ) : (
                    <>
                      {videoFile ? (
                        <>
                          <button
                            onClick={processUploadedVideo}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
                          >
                            {isProcessing ? 'Processing...' : 'Analyze Video'}
                          </button>
                          <button
                            onClick={() => { setVideoFile(null); setVideoUrl(null); setTimelineEvents([]); }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            Clear
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center"
                        >
                          <Upload className="w-4 h-4 mr-2" /> Choose Video
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="flex gap-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                  {cameraActive ? (
                    <>
                      <span className="flex items-center"><Wifi className="w-3 h-3 mr-1 text-green-500" /> Camera Connected</span>
                      <span className="flex items-center"><Activity className="w-3 h-3 mr-1 text-blue-500" /> AI Active</span>
                    </>
                  ) : videoUrl ? (
                    <>
                      <span className="flex items-center"><Video className="w-3 h-3 mr-1 text-gray-400" /> {videoFile?.name}</span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center"><WifiOff className="w-3 h-3 mr-1 text-gray-400" /> No Source</span>
                    </>
                  )}
                </div>
              </div>

              {cameraError && (
                <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800 text-sm">
                  {cameraError}
                </div>
              )}

              {isProcessing && processingInfo && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{processingInfo.message}</span>
                    {processingInfo.status === "processing_started" && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                  {processingInfo.videoId && (
                    <p className="text-xs mt-1">Video ID: {processingInfo.videoId}</p>
                  )}
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="video/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-gray-400" />
                Detection Timeline
              </h2>
              {timelineEvents.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-gray-500">
                  <p>No detection events yet. Start camera or process a video.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timelineEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className="flex items-start p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700"
                    >
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-red-600 dark:text-red-400">{event.eventType}</span>
                          {event.trackId && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">Track #{event.trackId}</span>}
                          <span className="text-xs text-gray-500 dark:text-gray-400">Conf: {Math.round((event.confidence || 0) * 100)}%</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'Just now'}
                          {event.frameNumber && ` • Frame ${event.frameNumber}`}
                        </p>
                        {event.reportId && (
                          <Link to={`/video-reports/${event.reportId}`} className="text-xs text-light-accent hover:underline mt-1 block">
                            View Report →
                          </Link>
                        )}
                      </div>
                      {event.personCropUrl && (
                        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded overflow-hidden ml-3 shrink-0">
                          <img src={event.personCropUrl} alt="Evidence crop" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Recent Video Reports
            </h2>
            {isLoadingReports ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : existingReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Video className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No video reports for this case.</p>
              </div>
            ) : (
                <div className="space-y-3">
                {existingReports.map((r) => (
                  <div key={r.reportId || r._id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start gap-3">
                      {r.fullFrameUrl || r.personCropUrl ? (
                        <img src={r.fullFrameUrl || r.personCropUrl} alt="Evidence" className="w-10 h-10 object-cover rounded border-2 border-gray-200 dark:border-gray-700" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center"><Video className="w-4 h-4 text-gray-400" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {r.eventType === "VIDEO_ANALYSIS_SUMMARY" ? "Video Analysis Summary" : (r.eventType || "PERSON_DETECTED")}
                        </p>
                        {r.eventType === "VIDEO_ANALYSIS_SUMMARY" ? (
                           <p className="text-xs text-gray-500 dark:text-gray-400">
                             Total Humans: {r.humanCount || 0} • {r.sourceName || "Uploaded Video"}
                           </p>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Conf: {Math.round((r.confidence || 0) * 100)}% • {r.sourceName || r.sourceType}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {r.timestamp ? new Date(r.timestamp).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <Link
                        to={`/video-reports/${r.reportId || r._id}`}
                        className="text-xs text-light-accent hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VideoIntelligence;
