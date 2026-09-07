import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './layout/Layout';
import { FolderPlus, Save, ArrowLeft } from 'lucide-react';

const CaseForm: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!caseId;

  const [formData, setFormData] = useState({
    case_number: '',
    title: '',
    crime_type: '',
    status: 'Open',
    priority: 'Medium',
    officer: '',
    description: '',
    location: {
      city: '',
      district: '',
      state: '',
      address: '',
      latitude: '',
      longitude: ''
    }
  });

  const [isLoading, setIsLoading] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchCase = async () => {
        try {
          const res = await fetch(`/api/cases/${caseId}`);
          if (!res.ok) throw new Error("Failed to load case data");
          const data = await res.json();
          setFormData({
            case_number: data.case_number,
            title: data.title,
            crime_type: data.crime_type,
            status: data.status,
            priority: data.priority,
            officer: data.officer || '',
            description: data.description || '',
            location: {
              city: data.location?.city || '',
              district: data.location?.district || '',
              state: data.location?.state || '',
              address: data.location?.address || '',
              latitude: data.location?.latitude || '',
              longitude: data.location?.longitude || ''
            }
          });
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCase();
    }
  }, [caseId, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('loc_')) {
      const locField = name.replace('loc_', '');
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [locField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Prepare payload
    const payload = {
      ...formData,
      location: {
        ...formData.location,
        latitude: parseFloat(formData.location.latitude as string) || null,
        longitude: parseFloat(formData.location.longitude as string) || null,
      }
    };

    try {
      const url = isEditing 
        ? `/api/cases/${caseId}` 
        : `/api/cases`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to save case");
      }

      const savedCase = await res.json();
      navigate(`/cases/${savedCase.case_number}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) return <Layout><div className="p-8 text-center text-gray-500">Loading form...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-12">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 transition-colors focus:outline-none">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FolderPlus className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
              {isEditing ? `Edit Case: ${caseId}` : 'File New Case'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isEditing ? 'Update the details for the existing case record.' : 'Enter details to file a new case into the Bhairav system.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border overflow-hidden">
          <div className="p-6 space-y-6">
            
            {/* Case Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-light-border dark:border-dark-border pb-2">Case Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Case Number <span className="text-red-500">*</span></label>
                  <input required name="case_number" value={formData.case_number} onChange={handleChange} disabled={isEditing} className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-1 focus:ring-light-accent focus:border-light-accent disabled:opacity-50" placeholder="e.g. CASE-MUM-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Case Title <span className="text-red-500">*</span></label>
                  <input required name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-1 focus:ring-light-accent focus:border-light-accent" placeholder="e.g. Mumbai Vehicle Theft" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crime Type <span className="text-red-500">*</span></label>
                  <input required name="crime_type" value={formData.crime_type} onChange={handleChange} className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-1 focus:ring-light-accent focus:border-light-accent" placeholder="e.g. Vehicle Theft" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-1 focus:ring-light-accent focus:border-light-accent">
                    <option value="Open">Open</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-1 focus:ring-light-accent focus:border-light-accent">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Investigating Officer</label>
                  <input name="officer" value={formData.officer} onChange={handleChange} className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-1 focus:ring-light-accent focus:border-light-accent" />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-light-border dark:border-dark-border pb-2">Location Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <input name="loc_address" value={formData.location.address} onChange={handleChange} className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-1 focus:ring-light-accent focus:border-light-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input name="loc_city" value={formData.location.city} onChange={handleChange} className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-1 focus:ring-light-accent focus:border-light-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                  <input name="loc_district" value={formData.location.district} onChange={handleChange} className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-1 focus:ring-light-accent focus:border-light-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <input name="loc_state" value={formData.location.state} onChange={handleChange} className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-1 focus:ring-light-accent focus:border-light-accent" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                    <input type="number" step="any" name="loc_latitude" value={formData.location.latitude} onChange={handleChange} className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-1 focus:ring-light-accent focus:border-light-accent" placeholder="e.g. 19.0760" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                    <input type="number" step="any" name="loc_longitude" value={formData.location.longitude} onChange={handleChange} className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-1 focus:ring-light-accent focus:border-light-accent" placeholder="e.g. 72.8777" />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-light-border dark:border-dark-border pb-2">Description</h2>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-1 focus:ring-light-accent focus:border-light-accent resize-none"></textarea>
            </div>
            
          </div>
          
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-light-border dark:border-dark-border flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-accent">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CaseForm;

