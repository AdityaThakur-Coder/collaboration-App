import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/api';

function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    handleAcceptInvite();
  }, [token]);

  const handleAcceptInvite = async () => {
    try {
      const response = await api.post(`/invites/accept/${token}`);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Processing invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {success ? (
          <div>
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Invitation Accepted!
            </h2>
            <p className="text-gray-600 mb-4">
              You have successfully joined the project.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard in a few seconds...
            </p>
          </div>
        ) : (
          <div>
            <XCircle size={64} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Invitation Failed
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InviteAccept;