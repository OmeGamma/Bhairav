import React, { useState, useRef, useEffect } from 'react';
import Layout from './layout/Layout';
import { Video, Upload, Play, Pause, SkipForward, SkipBack, Search, Clock, PlusCircle, FolderOpen, XCircle } from 'lucide-react';

const VideoIntelligence: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState('');
  const [cases, setCases] = useState<any[]>([]);
  const [existingVideos, setExistingVideos] = useState<any[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    fetchCases();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!selectedCase) return;
      setIsLoadingVideos(true);
      try {
        const res = await fetch(`/api/videos?case_id=${encodeURIComponent(selectedCase)}`);
        if (res.ok) {
          const data = await res.json();
          setExistingVideos(data);
        }
      } catch (err) {
        console.error("Failed to load videos", err);
      } finally {
        setIsLoadingVideos(false);
      }
    };
    fetchVideos();
  }, [selectedCase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
      
      setTimeout(() => {
        setTimelineEvents([
          { time: 14, type: 'Person', description: 'Person detected entering frame', confidence: 0.92 },
          { time: 32, type: 'Vehicle', description: 'White sedan detected', confidence: 0.88 },
          { time: 67, type: 'Alert', description: 'Unusual crowd formation', confidence: 0.75 },
        ]);
      }, 3000);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const jumpToTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      if (!isPlaying) togglePlay();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Video className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
              AI Video Intelligence
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Upload footage for automated event detection and timeline analysis.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm rounded-md px-2 py-1 text-gray-700 dark:text-gray-300"
            >
              {cases.map(c => <option key={c.case_number} value={c.case_number}>{c.case_number} - {c.title}</option>)}
            </select>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="video/mp4,video/webm,video/ogg"
            onChange={handleFileChange}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors flex items-center"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Video
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          {/* Main Video Area */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            <div className="bg-black rounded-lg overflow-hidden flex-1 relative flex items-center justify-center border border-gray-800 shadow-lg min-h-[400px]">
              {!videoFile ? (
                <div className="text-gray-500 text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No video selected. Upload footage to begin analysis.</p>
                </div>
              ) : (
                <video 
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  src={URL.createObjectURL(videoFile)}
                  onEnded={() => setIsPlaying(false)}
                />
              )}
            </div>

            {/* Video Controls & Timeline */}
            <div className="bg-white dark:bg-dark-card rounded-lg p-4 shadow-sm border border-light-border dark:border-dark-border">
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-4 text-gray-700 dark:text-gray-300">
                  <button onClick={() => { if(videoRef.current) videoRef.current.currentTime -= 5; }} className="hover:text-light-accent"><SkipBack className="w-5 h-5" /></button>
                  <button onClick={togglePlay} className="hover:text-light-accent disabled:opacity-50" disabled={!videoFile}>
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button onClick={() => { if(videoRef.current) videoRef.current.currentTime += 5; }} className="hover:text-light-accent"><SkipForward className="w-5 h-5" /></button>
                </div>
                <div className="text-sm font-mono text-gray-500 dark:text-gray-400">
                  Speed: 1x
                </div>
              </div>

              {/* Event Markers (Simulated Timeline) */}
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full">
                {timelineEvents.map((event, idx) => (
                  <div 
                    key={idx}
                    onClick={() => jumpToTime(event.time)}
                    className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full cursor-pointer hover:scale-150 transition-transform ${
                      event.type === 'Alert' ? 'bg-red-500' : 
                      event.type === 'Vehicle' ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ left: `${(event.time / 120) * 100}%` }}
                    title={event.description}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: AI Analysis */}
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border flex flex-col h-[500px] lg:h-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Video Search</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="E.g. 'Show people entering'" 
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Detected Events</h3>
               
              {timelineEvents.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No events detected yet. Upload a video to begin.</p>
              ) : (
                <div className="space-y-3">
                  {timelineEvents.map((event, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => jumpToTime(event.time)}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-light-accent transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          event.type === 'Alert' ? 'bg-red-100 text-red-700' : 
                          event.type === 'Vehicle' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {event.type}
                        </span>
                        <span className="text-xs font-mono text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> {formatTime(event.time)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white mt-2">{event.description}</p>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500">Conf: {(event.confidence * 100).toFixed(0)}%</span>
                        <button className="text-xs text-light-accent hover:underline flex items-center">
                          <PlusCircle className="w-3 h-3 mr-1" /> Evidence
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Existing Videos */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            Existing Videos for {selectedCase}
          </h2>
          {isLoadingVideos ? (
            <div className="p-4 text-center text-gray-500">Loading videos...</div>
          ) : existingVideos.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No videos found for this case.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Video ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {existingVideos.map((vid: any) => (
                    <tr key={vid._id || vid.videoId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-2 text-sm font-medium text-light-accent dark:text-dark-accent">{vid.videoId || vid._id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{vid.fileName || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{vid.mimeType || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{vid.processingStatus || 'PENDING'}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{vid.uploadedAt ? new Date(vid.uploadedAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-2 flex items-center space-x-3">
                        <button onClick={() => setViewingFile(`/api/files/${vid.videoId || vid._id}`)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View</button>
                        <a href={`/api/files/${vid.videoId || vid._id}?download=true`} className="text-xs text-light-accent hover:underline">Download</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Video Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-dark-card w-full max-w-5xl h-[80vh] rounded-lg shadow-xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Video Viewer</h3>
              <button onClick={() => setViewingFile(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 bg-black flex items-center justify-center">
              <video src={viewingFile} controls autoPlay className="max-w-full max-h-full" />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default VideoIntelligence;
