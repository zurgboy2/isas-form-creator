import React from 'react';
import FormBuilder from './FormBuilder';
import FormPreview from './FormPreview';
import apiCall from './api';
import '../styles/base.css';
import '../styles/component.css';
import '../styles/layout.css';
import '../styles/preview.css';
import '../styles/sections.css';
import '../styles/utilities.css';
import '../styles/submit.css';
import '../App.css';

function MainBuilder() {
    const [availableForms, setAvailableForms] = React.useState([]);
    const [showFormsDialog, setShowFormsDialog] = React.useState(false);
    const [isEditingExistingForm, setIsEditingExistingForm] = React.useState(false);
    const [formData, setFormData] = React.useState({
      id: crypto.randomUUID(),
      version: "1.0",
      metadata: {
        title: "",
        author: "",
        description: "",
        authorEmail: "",
        isAuthorEmailValid: true,
        theme: {
          primaryColor: "#000000",
          secondaryColor: "#000000",
          backgroundColor: "#1a1a1a",     // Add this
          sectionColor: "#2d2d2d",        // Add this
          questionColor: "#333333",       // Add this
          fontFamily: "",
          logo: {
            url: "",
            allowedTypes: ["image/jpeg", "image/png"]
          },
          backgroundImage: {
            url: "",
            allowedTypes: ["image/jpeg", "image/png"]
          }
        }
      },
      sections: []
    });
  
    const [authState, setAuthState] = React.useState({
      showAuthDialog: false,
      username: '',
      password: '',
      isAuthenticated: false,
      loading: false  // Add this
    });
    
  
    const [submitStatus, setSubmitStatus] = React.useState({
      loading: false,
      error: null,
      success: false
    });
  
    const handleAuthSubmit = async (e) => {
      e.preventDefault();
      setAuthState(prev => ({ ...prev, loading: true }));
      
      try {
        const scriptId = "auth_script"
        const action = "auth"
        const response = await apiCall(scriptId, action, {
          username: authState.username,
          password: authState.password
        });
    
        if (!response.token) {
          throw new Error('Authentication failed - no token received');
        }
    
        if (authState.isForFetching) {
          const scriptId = "form_script"
          const action = "getForms"
          const result = await apiCall(scriptId, action, {
            finalToken: response.token
          });
          
          if (result.forms) {
            setAvailableForms(result.forms);
            setShowFormsDialog(true);
          } else {
            throw new Error('No forms available to load');
          }
        } else {
          const result = await submitFormToBackend(response.token);
          if (!result.success) {
            throw new Error(result.message || `Form ${isEditingExistingForm ? 'update' : 'submission'} failed`);
          }
          
          // Update success message based on operation
          setSubmitStatus({
            loading: false,
            error: null,
            success: true,
            message: `Form ${isEditingExistingForm ? 'updated' : 'created'} successfully!`
          });
        }
    
        setAuthState(prev => ({ 
          ...prev, 
          isAuthenticated: true, 
          showAuthDialog: false,
          loading: false
        }));
    
      } catch (error) {
        console.error('Error:', error);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false,
          isForFetching: false 
        }));
        setSubmitStatus({ 
          loading: false, 
          error: `${authState.isForFetching ? 'Failed to load forms' : 
            `Failed to ${isEditingExistingForm ? 'update' : 'create'} form`}. ${error.message}`,
          success: false 
        });
      }
    };
  
    // Add handler for form selection
    const handleFormSelect = (selectedForm) => {
      setFormData(selectedForm);
      setShowFormsDialog(false);
      setIsEditingExistingForm(true);
      setSubmitStatus({ 
        loading: false, 
        error: null, 
        success: true,
        message: 'Form loaded successfully!' 
      });
    };
    
    
    const submitFormToBackend = async (token) => {
      const scriptId = "form_script"
      const action = isEditingExistingForm ? "updateForm" : "submitForm"
    
      return await apiCall(scriptId, action, {
        formData: formData,
        finalToken: token,
        'domain': window.location.origin,
      });
    };
    
  
    const fetchExistingForm = async () => {
      setAuthState(prev => ({ 
        ...prev, 
        showAuthDialog: true, 
        isForFetching: true
      }));
    };
  
    
    const FormsDialog = ({ forms, onSelect, onClose }) => (
      <div className="auth-dialog-overlay">
        <div className="forms-dialog">
          <div className="dialog-header">
            <h2>Available Forms</h2>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
          
          <div className="forms-list">
            {forms.length === 0 ? (
              <p className="no-forms">No forms available</p>
            ) : (
              forms.map(form => (
                <div 
                  key={form.id} 
                  className="form-item"
                  onClick={() => onSelect(form)}
                >
                  <h3>{form.metadata.title || 'Untitled Form'}</h3>
                  <p>{form.metadata.description || 'No description'}</p>
                  <div className="form-meta">
                    <span>Author: {form.metadata.author || 'Unknown'}</span>
                    <span>Version: {form.version}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  
    
    const saveFormLocally = () => {
      const formManifest = JSON.stringify(formData, null, 2);
      const blob = new Blob([formManifest], { type: 'application/json' });
      
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `form-${formData.metadata.title || 'untitled'}-${formData.id}.json`;
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      URL.revokeObjectURL(downloadLink.href);
      
      setSubmitStatus({ loading: false, error: null, success: true });
    };
    
    const handleSubmitForm = async () => {
      setSubmitStatus({ 
        loading: false, 
        error: null, 
        success: false 
      });
      
      // Set isForFetching to false since we're submitting/updating
      setAuthState(prev => ({ 
        ...prev, 
        showAuthDialog: true,
        isForFetching: false 
      }));
    };
    
    const ActionPanel = ({ 
      isEditingExistingForm, 
      onLoadOnline,
      onSaveLocal,
      onClear,
      onSubmit,
      loading 
    }) => (
      <div className="action-panel">
        <div className="action-panel-left">
          <h2>{isEditingExistingForm ? 'Editing Form' : 'New Form'}</h2>
        </div>
        
        <div className="action-panel-right">
          <div className="action-group">
            <button 
              onClick={onLoadOnline}
            >
              Open
            </button>
            <button 
              onClick={onSubmit}
              className="primary-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditingExistingForm ? 'Save Changes' : 'Create Form'}
            </button>
            <button 
              onClick={onSaveLocal}
            >
              Export
            </button>
            <button 
              className="clear-button" 
              onClick={onClear}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    );
    

    const Toast = ({ message, type, onClose }) => {
      React.useEffect(() => {
        const timer = setTimeout(() => {
          onClose();
        }, 5000); // Disappear after 5 seconds
    
        return () => clearTimeout(timer);
      }, [onClose]);
    
      return (
        <div className={`toast-message ${type}`}>
          <div className="toast-content">
            <span>{message}</span>
            <button className="toast-close" onClick={onClose}>✕</button>
          </div>
        </div>
      );
    };
    
    // Add this component for the authentication dialog
    const AuthDialog = ({ onSubmit, onCancel, loading, isForFetching }) => {
      const [localUsername, setLocalUsername] = React.useState('');
      const [localPassword, setLocalPassword] = React.useState('');
    
      const handleSubmit = (e) => {
        e.preventDefault();
        setAuthState(prev => ({ 
          ...prev, 
          username: localUsername,
          password: localPassword 
        }));
        onSubmit(e);
      };
    
      return (
        <div className="auth-dialog-overlay">
          <div className="auth-dialog">
            <div className="dialog-header">
              <h2>Authentication Required</h2>
              <button 
                className="close-button"
                onClick={() => setAuthState(prev => ({ ...prev, showAuthDialog: false }))}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Username"
                value={localUsername}
                onChange={e => setLocalUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={localPassword}
                onChange={e => setLocalPassword(e.target.value)}
                required
              />
              <div className="auth-buttons">
                <button type="submit" disabled={loading}>
                  {loading ? 'Authenticating...' : 'Submit'}
                </button>
                <button type="button" onClick={() => {
                  setAuthState(prev => ({ ...prev, showAuthDialog: false }));
                  document.getElementById('file-input').click();
                }}>
                  {authState.isForFetching ? 'Load Local File Instead' : 'Save Locally Instead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    };
  
    const handleClearForm = () => {
      if (window.confirm('Are you sure you want to clear the form? This action cannot be undone.')) {
      setIsEditingExistingForm(false);
      // Reset to initial state
      const newFormData = {
        id: crypto.randomUUID(), // Generate new ID for the fresh form
        version: "1.0",
        metadata: {
          title: "",
          author: "",
          description: "",
          activeFrom: "", 
          activeTo: "",
          requireEmail: false,
          allowedEmailDomain: '',
          emailMessage: '',
          landingWelcome: '',
          landingInstructions: '',
          maxGuests: 0, 
          requireHostApproval: false,
          hostEmail: '',
          theme: {
            primaryColor: "#000000",
            secondaryColor: "#000000",
            backgroundColor: "#1a1a1a",
            sectionColor: "#2d2d2d",
            questionColor: "#333333",
            fontFamily: "",
            logo: {
              url: "",
              allowedTypes: ["image/jpeg", "image/png"]
            },
            backgroundImage: {
              url: "",
              allowedTypes: ["image/jpeg", "image/png"]
            }
          }
        },
        sections: []
      };
      
      setFormData(newFormData);
      setSubmitStatus({ loading: false, error: null, success: false });
      }
    };
  
    const handleImportManifest = (event) => {
      const file = event.target.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedForm = JSON.parse(e.target.result);
          
          // Validate the imported form has the required structure
          if (!importedForm.id || !importedForm.version || !importedForm.metadata) {
            throw new Error('Invalid form manifest structure');
          }
  
          setFormData(importedForm);
          setSubmitStatus({ loading: false, error: null, success: true, imported: true });
        } catch (error) {
          setSubmitStatus({ 
            loading: false, 
            error: 'Failed to import form: Invalid format', 
            success: false 
          });
        }
      };
  
      reader.onerror = () => {
        setSubmitStatus({ 
          loading: false, 
          error: 'Failed to read file', 
          success: false 
        });
      };
  
      reader.readAsText(file);
    };
  
    return (
      <>
        <ActionPanel 
          isEditingExistingForm={isEditingExistingForm}
          onLoadLocal={() => document.getElementById('file-input').click()}
          onLoadOnline={fetchExistingForm}
          onSaveLocal={saveFormLocally}
          onClear={handleClearForm}
          onSubmit={handleSubmitForm}
          loading={submitStatus.loading}
        />
        
        <div className="app-container">
          <input
            id="file-input"
            type="file"
            accept=".json"
            onChange={handleImportManifest}
            style={{ display: 'none' }}
          />
          <div className="builder-container">
            <FormBuilder formData={formData} onChange={setFormData} />
            
            {(submitStatus.error || submitStatus.success) && (
              <Toast 
                message={submitStatus.error || submitStatus.message}
                type={submitStatus.error ? 'error' : 'success'}
                onClose={() => setSubmitStatus({ loading: false, error: null, success: false })}
              />
            )}
          </div>
          <div className="preview-container">
            <h1>Preview</h1>
            <FormPreview formData={formData} />
          </div>
          {showFormsDialog && (
            <FormsDialog
              forms={availableForms}
              onSelect={handleFormSelect}
              onClose={() => setShowFormsDialog(false)}
            />
          )}
          {authState.showAuthDialog && (
            <AuthDialog
              onSubmit={handleAuthSubmit}
              onCancel={() => setAuthState(prev => ({ ...prev, showAuthDialog: false }))}
              loading={authState.loading}
            />
          )}
        </div>
      </>
    );
  }
  
  export default MainBuilder;