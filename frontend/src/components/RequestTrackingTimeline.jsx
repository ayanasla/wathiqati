import React, { useEffect, useState } from 'react';
import { Clock, MapPin, AlertCircle } from 'lucide-react';

/**
 * RequestTrackingTimeline Component (Simplified)
 * Displays pickup information and last update for document requests
 */
const RequestTrackingTimeline = ({ requestId, request }) => {
  const [loading, setLoading] = useState(!request);
  const [error, setError] = useState(null);

  // If request data is not provided, we don't need to fetch
  useEffect(() => {
    if (request) {
      setLoading(false);
    }
  }, [request]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <Clock className="w-6 h-6 text-blue-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-800 font-medium">Erreur</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  // Format the last update date
  const lastUpdated = request.updatedAt 
    ? new Date(request.updatedAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Date non disponible';

  // Pickup location - Arrondissement Yaacoub El Mansour, Rabat
  const pickupLocation = request.preparationLocation || 'Arrondissement Yaacoub El Mansour, Rabat';
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickupLocation)}`;

  return (
    <div className="space-y-4">
      {/* Last Update */}
      <div className="flex items-center gap-2 text-gray-700 text-sm">
        <Clock className="w-5 h-5 text-blue-600" />
        <span>
          <strong>Dernière mise à jour :</strong>{' '}
          <span className="text-gray-600">{lastUpdated}</span>
        </span>
      </div>

      {/* Pickup Location Card */}
      <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl">
        <div className="flex items-start gap-3">
          <MapPin className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-700 mb-1">
              Lieu de récupération du document
            </p>
            <p className="text-base font-bold text-emerald-900 mb-3">
              📍 {pickupLocation}
            </p>
            <p className="text-sm text-emerald-700 mb-3">
              Veuillez vous rendre à cet endroit pour récupérer votre document
            </p>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Afficher sur la carte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestTrackingTimeline;
