import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import apiCall from './api';
import '../styles/approval.css';

function ApprovalDashboard() {
  const { formId } = useParams();
  const [searchParams] = useSearchParams();
  const finalToken = searchParams.get('token');
  const [selections, setSelections] = useState({});

  const [state, setState] = useState({
    isAuthenticated: false,
    password: '',
    loading: false,
    error: null,
    guests: [],
    formData: null
  });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiCall('form_script', 'validateApproval', {
        formId,
        finalToken,
        password: state.password
      });

      if (response.success) {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          loading: false,
          guests: response.guests,
          formData: response.formData
        }));
      } else {
        throw new Error('Invalid password');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  const submitUpdates = async () => {
    const updates = Object.entries(selections)
      .filter(([_, status]) => status !== null)
      .map(([guestId, status]) => ({
        guestId,
        isApproved: status === 'approve'
      }));

    if (updates.length === 0) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await apiCall('form_script', 'updateApproval', {
        formId,
        finalToken,
        password: state.password,
        guestUpdates: updates
      });

      if (response.success) {
        setState(prev => ({
          ...prev,
          loading: false,
          guests: prev.guests.map(guest => {
            const update = updates.find(u => u.guestId === guest.id);
            if (update) {
              return {
                ...guest,
                status: update.isApproved ? 'approved' : 'rejected'
              };
            }
            return guest;
          })
        }));
        setSelections({});
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  if (!finalToken) {
    return (
      <div className="approval-dashboard error-state">
        <h2>Invalid Access</h2>
        <p>No access token provided. Please use the link from your email.</p>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return (
      <div className="approval-dashboard auth-state">
        <div className="auth-container">
          <h2>Host Approval Access</h2>
          <p>Please enter the password from your email to view guest submissions.</p>
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="input-group">
              <input
                type="password"
                value={state.password}
                onChange={(e) => setState(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter approval password"
                required
              />
            </div>
            <button type="submit" disabled={state.loading}>
              {state.loading ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>

          {state.error && (
            <div className="error-message">
              {state.error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="approval-dashboard main-state">
      <header>
        <h2>{state.formData?.metadata?.title || 'Guest Approval Dashboard'}</h2>
        <p className="form-description">
          {state.formData?.metadata?.description}
        </p>
      </header>

      <div className="guests-list">
        <h3>Pending Approvals ({state.guests.filter(g => g.status === 'pending').length})</h3>
        
        {state.guests.length === 0 ? (
          <p className="no-guests">No guest submissions yet.</p>
        ) : (
          <div className="guests-grid">
            {state.guests.map(guest => (
              <div key={guest.id} className={`guest-card status-${guest.status}`}>
                <div className="guest-info">
                  <h4>{guest.name}</h4>
                  <p>{guest.email}</p>
                  <div className="submission-time">
                    Submitted: {new Date(guest.submittedAt).toLocaleString()}
                  </div>
                </div>

                <div className="guest-responses">
                  {/* Response fields can be added here */}
                </div>

                {guest.status === 'pending' && (
                  <div className="approval-actions">
                    <button
                      onClick={() => setSelections(prev => ({
                        ...prev,
                        [guest.id]: selections[guest.id] === 'approve' ? null : 'approve'
                      }))}
                      className={`approve-btn ${selections[guest.id] === 'approve' ? 'selected' : ''}`}
                      disabled={state.loading}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSelections(prev => ({
                        ...prev,
                        [guest.id]: selections[guest.id] === 'reject' ? null : 'reject'
                      }))}
                      className={`reject-btn ${selections[guest.id] === 'reject' ? 'selected' : ''}`}
                      disabled={state.loading}
                    >
                      Reject
                    </button>
                  </div>
                )}

                {guest.status !== 'pending' && (
                  <div className="status-badge">
                    {guest.status.charAt(0).toUpperCase() + guest.status.slice(1)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {Object.keys(selections).length > 0 && (
          <div className="pending-updates">
            <button 
              onClick={submitUpdates}
              disabled={state.loading}
              className="submit-updates-btn"
            >
              Submit {Object.keys(selections).length} Updates
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApprovalDashboard;