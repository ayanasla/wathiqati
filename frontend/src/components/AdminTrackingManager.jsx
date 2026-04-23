import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X, Save, Loader } from 'lucide-react';

/**
 * AdminTrackingManager Component
 * Allows admins/employees to update request tracking status
 */
const AdminTrackingManager = ({ requestId, onUpdate, onClose }) => {
  const [trackingStatus, setTrackingStatus] = useState('submitted');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [steps, setSteps] = useState([]);

  // Mapping des statuts de suivi
  const trackingSteps = {
    submitted: '📄 Demande soumise',
    in_processing: '⏳ En traitement',
    under_validation: '🔍 En cours de validation',
    validated: '✅ Validée par l\'administration',
    ready_for_pickup: '📦 Prête à être récupérée',
    rejected: '❌ Rejetée',
  };

  useEffect(() => {
    fetchAvailableSteps();
    fetchCurrentStatus();
  }, [requestId]);

  const fetchAvailableSteps = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:5002/api/requests/tracking/steps/all',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSteps(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching tracking steps:', err);
    }
  };

  const fetchCurrentStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5002/api/requests/${requestId}/tracking`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTrackingStatus(data.data.currentStatus);
        }
      }
    } catch (err) {
      console.error('Error fetching current status:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:5002/api/requests/${requestId}/tracking`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            trackingStatus,
            notes: notes.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update tracking status');
      }

      setSuccess(true);
      if (onUpdate) {
        onUpdate(data.data);
      }

      // Reset form
      setNotes('');
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error('Error updating tracking:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        📍 Gérer le suivi de la demande
      </h3>

      {error && (
        <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium text-sm">Erreur</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-800 font-medium text-sm">
              ✓ Statut de suivi mis à jour avec succès
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nouvelle étape de suivi *
          </label>
          <select
            value={trackingStatus}
            onChange={(e) => setTrackingStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
          >
            {Object.entries(trackingSteps).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes optionnelles
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoutez des notes sur cette mise à jour (optionnel)"
            maxLength={200}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
          />
          <p className="text-xs text-gray-500 mt-1">
            {notes.length}/200 caractères
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={loading || success}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              success
                ? 'bg-green-500 text-white'
                : loading
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Mise à jour en cours...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Mis à jour!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Mettre à jour le suivi
              </>
            )}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Info Box */}
      <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg text-sm text-blue-900">
        <p className="font-medium mb-1">💡 Astuce :</p>
        <p>
          Les clients recevront une notification lorsque le statut de suivi sera
          mis à jour. Soyez clair et précis dans les notes.
        </p>
      </div>
    </div>
  );
};

export default AdminTrackingManager;
