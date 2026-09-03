import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Search, MapPin, Camera, Clock, ChevronLeft, ChevronRight, FileText, X } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { eventService } from '../../services/eventService';
import type { SecurityEvent } from '../../types';

export default function SecurityEvents() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getSecurityEvents({
        severity: severityFilter || undefined,
        event_type: typeFilter || undefined,
        status: statusFilter || undefined,
      });
      setEvents(data);
    } catch {
      setError('Failed to fetch security events.');
    } finally {
      setLoading(false);
    }
  }, [severityFilter, typeFilter, statusFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        setLoading(true);
        setError(null);
        try {
          const event = await eventService.getEventById(id);
          setSelectedEvent(event || null);
        } catch {
          setError('Failed to fetch event details.');
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [id]);

  if (loading) {
    return <LoadingState fullHeight message="Loading security events..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (id && selectedEvent) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={() => navigate('/intelligence/events')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-primary)] transition-colors mb-2"
        >
          <ChevronLeft size={14} /> Back to Events List
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[var(--color-bhairav-border)] pb-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Event {selectedEvent.id}</h1>
              <Badge status={selectedEvent.severity}>{selectedEvent.severity}</Badge>
              <Badge status={selectedEvent.status === 'active' ? 'warning' : 'neutral'}>{selectedEvent.status}</Badge>
            </div>
            <p className="text-base text-[var(--color-bhairav-text-muted)]">{selectedEvent.type}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
             <button
               onClick={async () => {
                 try {
                   await eventService.updateEvent(selectedEvent.id, { status: 'investigating' });
                   setSelectedEvent({ ...selectedEvent, status: 'investigating' });
                 } catch (e) {
                   console.error('Failed to update event', e);
                 }
               }}
               className="glass-sm hover:border-[var(--color-bhairav-primary)] px-4 py-2 rounded-md text-sm transition-colors"
             >
               Acknowledge
             </button>
             <button
               onClick={async () => {
                 try {
                   await eventService.updateEvent(selectedEvent.id, { status: 'resolved' });
                   setSelectedEvent({ ...selectedEvent, status: 'resolved' });
                 } catch (e) {
                   console.error('Failed to update event', e);
                 }
               }}
               className="bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
             >
               Mark Resolved
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card title="Event Description">
              <p className="text-[var(--color-bhairav-text)] leading-relaxed text-lg">
                {selectedEvent.description}
              </p>
              
              <div className="mt-6 pt-6 border-t border-[var(--color-bhairav-border)] grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <span className="block text-sm text-[var(--color-bhairav-text-muted)] mb-1 flex items-center gap-1"><Clock size={14} /> Time</span>
                  <span className="font-medium">{new Date(selectedEvent.timestamp).toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-sm text-[var(--color-bhairav-text-muted)] mb-1 flex items-center gap-1"><MapPin size={14} /> Location</span>
                  <span className="font-medium">{selectedEvent.location}</span>
                </div>
                <div>
                  <span className="block text-sm text-[var(--color-bhairav-text-muted)] mb-1 flex items-center gap-1"><Camera size={14} /> Camera</span>
                  <span className="font-medium">{selectedEvent.cameraId || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-sm text-[var(--color-bhairav-text-muted)] mb-1 flex items-center gap-1"><Shield size={14} /> Entities</span>
                  <span className="font-medium">{selectedEvent.relatedEntitiesCount} Identified</span>
                </div>
              </div>
            </Card>
            
            <Card title="Evidence & Media">
               <div className="grid grid-cols-2 gap-4">
                 <div className="aspect-video bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-lg flex items-center justify-center relative group overflow-hidden">
                    <span className="text-[var(--color-bhairav-text-muted)] group-hover:hidden">Primary Feed Capture</span>
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm">
                       <span className="text-white text-sm font-medium border border-white/50 px-4 py-2 rounded-md">View Full Size</span>
                    </div>
                 </div>
                 <div className="aspect-video bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-lg flex items-center justify-center text-[var(--color-bhairav-text-muted)]">
                    Secondary Angle (Unavailable)
                 </div>
               </div>
            </Card>
          </div>

          <div className="xl:col-span-1 space-y-6">
            <Card title="Timeline">
              <div className="space-y-6">
                <div className="relative pl-6 border-l-2 border-[var(--color-bhairav-primary)]">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[var(--color-bhairav-surface)] border-2 border-[var(--color-bhairav-primary)]"></div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[var(--color-bhairav-text-muted)] mb-1">Current</span>
                    <span className="text-sm font-medium">Under Investigation</span>
                    <span className="text-xs text-[var(--color-bhairav-text-muted)] mt-1">Officer Assigned</span>
                  </div>
                </div>
                <div className="relative pl-6 border-l-2 border-[var(--color-bhairav-border)]">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[var(--color-bhairav-neutral)]"></div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[var(--color-bhairav-text-muted)] mb-1">
                      {new Date(selectedEvent.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-sm">Alert Generated</span>
                  </div>
                </div>
                <div className="relative pl-6 border-l-2 border-[var(--color-bhairav-border)]">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[var(--color-bhairav-neutral)]"></div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[var(--color-bhairav-text-muted)] mb-1">
                      {new Date(new Date(selectedEvent.timestamp).getTime() - 60000).toLocaleTimeString()}
                    </span>
                    <span className="text-sm">Anomaly Detected by AI</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Related Intelligence">
               <ul className="space-y-2">
                 <li className="flex items-center justify-between p-3 glass-sm rounded-md hover:border-[var(--color-bhairav-primary)] cursor-pointer transition-colors">
                   <div className="flex items-center gap-3">
                     <FileText className="text-[var(--color-bhairav-primary)]" size={16} />
                     <span className="text-sm">Historical Case #HC-822</span>
                   </div>
                   <ChevronRight size={16} className="text-[var(--color-bhairav-text-muted)]" />
                 </li>
                 <li className="flex items-center justify-between p-3 glass-sm rounded-md hover:border-[var(--color-bhairav-warning)] cursor-pointer transition-colors">
                   <div className="flex items-center gap-3">
                     <FileText className="text-[var(--color-bhairav-warning)]" size={16} />
                     <span className="text-sm">Similar Event (Sector X)</span>
                   </div>
                   <ChevronRight size={16} className="text-[var(--color-bhairav-text-muted)]" />
                 </li>
               </ul>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-bhairav-border)] pb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--color-bhairav-primary)] mb-1">Operations</p>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Security Events</h1>
          <p className="text-[var(--color-bhairav-text-muted)] mt-1 text-sm">Intelligence log of all detected anomalies and incidents</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-sm p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)]" size={16} />
          <input 
            type="text" 
            placeholder="Search events by ID, type, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-md pl-9 pr-9 py-2 text-sm focus:outline-none focus:border-[var(--color-bhairav-primary)] transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <select 
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-bhairav-primary)]"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select 
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-bhairav-primary)]"
        >
          <option value="">All Types</option>
          <option value="PERSON_DETECTED">Person Detected</option>
          <option value="VEHICLE_DETECTED">Vehicle Detected</option>
          <option value="RESTRICTED_ZONE">Restricted Zone</option>
          <option value="SECURITY_ALERT">Security Alert</option>
          <option value="INCIDENT">Incident</option>
        </select>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-bhairav-primary)]"
        >
          <option value="">All Statuses</option>
          <option value="active">New</option>
          <option value="investigating">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>
        <button 
          onClick={fetchEvents}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-md text-sm hover:bg-[var(--color-bhairav-surface-hover)] transition-colors"
        >
          <Search size={14} /> Refresh
        </button>
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-auto">
        <div className="grid gap-4">
          {events.length === 0 ? (
            <EmptyState icon={Shield} title="No Events Found" description="Try adjusting your filters or search terms." className="mt-8" />
          ) : (
            events.filter(e => e.description.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase())).map(evt => (
              <div 
                key={evt.id}
                onClick={() => navigate(`/security/events/${evt.id}`)}
                className="glass-card p-5 cursor-pointer transition-all group flex flex-col md:flex-row md:items-center gap-6 severity-notch-${evt.severity}"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-[var(--color-bhairav-text-muted)] group-hover:text-[var(--color-bhairav-primary)] transition-colors">{evt.id}</span>
                    <Badge status={evt.severity}>{evt.severity}</Badge>
                    <span className="text-xs text-[var(--color-bhairav-text-muted)] ml-auto md:hidden">
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-[var(--color-bhairav-primary)] transition-colors">{evt.type}</h3>
                  <p className="text-sm text-[var(--color-bhairav-text-muted)] line-clamp-1">{evt.description}</p>
                </div>
                
                <div className="flex flex-wrap md:flex-nowrap items-center gap-6 text-sm text-[var(--color-bhairav-text-muted)] border-t border-[var(--color-bhairav-border)] md:border-0 pt-4 md:pt-0">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <MapPin size={14} className="text-[var(--color-bhairav-primary)]/70" />
                    <span className="truncate">{evt.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 w-24 shrink-0">
                    <Camera size={14} className="text-[var(--color-bhairav-primary)]/70" />
                    <span className="truncate">{evt.cameraId || 'N/A'}</span>
                  </div>
                  <div className="hidden md:block text-right w-32 shrink-0 text-xs font-mono">
                    {new Date(evt.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                  <div className="ml-auto md:ml-0 text-right w-24 shrink-0">
                    <Badge status={evt.status === 'active' ? 'warning' : 'neutral'} dot={false}>{evt.status}</Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
