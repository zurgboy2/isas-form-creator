// components/FormBuilder.js
import React from 'react';
import SectionBuilder from './SectionBuilder';

const FormBuilder = ({ formData, onChange }) => {
  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    if (name === 'authorEmail') {
      const isValid = validateEmails(value);
      onChange(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [name]: value,
          isAuthorEmailValid: isValid // Add validation state
        }
      }));
    } else {
      // Original handling for other fields
      onChange(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [name]: value
        }
      }));
    }
  };

  const handleThemeChange = (e) => {
    const { name, value } = e.target;
    
    // Handle special cases for logo and background image URLs
    if (name === 'logoUrl') {
      onChange(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          theme: {
            ...prev.metadata.theme,
            logo: {
              ...prev.metadata.theme.logo,
              url: value
            }
          }
        }
      }));
    } else if (name === 'backgroundImageUrl') {
      onChange(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          theme: {
            ...prev.metadata.theme,
            backgroundImage: {
              ...prev.metadata.theme.backgroundImage,
              url: value
            }
          }
        }
      }));
    } else {
      // Handle other theme properties as before
      onChange(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          theme: {
            ...prev.metadata.theme,
            [name]: value
          }
        }
      }));
    }
  };

  const validateEmails = (emails) => {
    const emailList = emails.split(',').map(email => email.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailList.every(email => emailRegex.test(email));
  };

  const addSection = () => {
    const newSection = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      isVisible: true,
      questions: []
    };

    onChange(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  return (
    <div className="form-builder">
      <div className="metadata-section">
        <h2>Form Metadata</h2>
        <input
          type="text"
          name="title"
          placeholder="Form Title"
          value={formData.metadata.title}
          onChange={handleMetadataChange}
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={formData.metadata.author}
          onChange={handleMetadataChange}
        />

      <div className="author-info">
        <div className="input-group">
          <label>
            Author Email(s)
            <span className="required">*</span>
          </label>
          <input
            type="text" // Changed from "email" to "text"
            name="authorEmail"
            placeholder="Enter emails separated by commas"
            value={formData.metadata.authorEmail}
            onChange={handleMetadataChange}
            required
            className={!formData.metadata.isAuthorEmailValid ? 'invalid' : ''}
          />
          {!formData.metadata.authorEmail && (
            <span className="error-message">Author email is required</span>
          )}
          {formData.metadata.authorEmail && !formData.metadata.isAuthorEmailValid && (
            <span className="error-message">Please enter valid email addresses separated by commas</span>
          )}
          <small className="help-text">Multiple emails can be entered separated by commas (e.g., email1@example.com, email2@example.com)</small>
        </div>
      </div>
        <textarea
          name="description"
          placeholder="Description"
          value={formData.metadata.description}
          onChange={handleMetadataChange}
        />
        <div className="form-activation-period">
          <h3>Form Activation Period</h3>
          <div className="datetime-input">
            <label>Start Date and Time</label>
            <input
              type="datetime-local"
              name="activeFrom"
              value={formData.metadata.activeFrom}
              onChange={handleMetadataChange}
            />
          </div>
          <div className="datetime-input">
            <label>End Date and Time</label>
            <input
              type="datetime-local"
              name="activeTo"
              value={formData.metadata.activeTo}
              onChange={handleMetadataChange}
            />
          </div>
        </div>

        <div className="email-settings">
          <h3>Email Settings</h3>
          <div className="email-required-setting">
            <label>
              <input
                type="checkbox"
                name="requireEmail"
                checked={formData.metadata.requireEmail || formData.metadata.requireHostApproval}
                onChange={(e) => {
                  handleMetadataChange({
                    target: {
                      name: 'requireEmail',
                      value: e.target.checked
                    }
                  });
                }}
                disabled={formData.metadata.requireHostApproval}
              />
              Require Email
            </label>
            {formData.metadata.requireHostApproval && (
              <small>Email is required when host approval is enabled</small>
            )}
          </div>
          
          {formData.metadata.requireEmail && (
            <div className="email-domain-restriction">
              <label>Restrict Email Domain</label>
              <div className="domain-input-group">
                <span>@</span>
                <input
                  type="text"
                  name="allowedEmailDomain"
                  placeholder="example.com"
                  value={formData.metadata.allowedEmailDomain}
                  onChange={handleMetadataChange}
                />
              </div>
              <small>Leave empty to allow any email domain</small>
            </div>
          )}
        </div>
      </div>

      <div className="email-content-settings">
        <h3>Email & Landing Page Content</h3>
        
        <div className="email-message-section">
          <label>Verification Email Message</label>
          <textarea
            name="emailMessage"
            placeholder="Message to include in the verification email (e.g., Thank you for submitting the form. Please verify your email to continue...)"
            value={formData.metadata.emailMessage}
            onChange={handleMetadataChange}
          />
        </div>

        <div className="landing-page-content">
          <label>Landing Page Welcome</label>
          <textarea
            name="landingWelcome"
            placeholder="Welcome message shown after email verification (e.g., Email verified! Welcome to...)"
            value={formData.metadata.landingWelcome}
            onChange={handleMetadataChange}
          />

          <label>Additional Information</label>
          <textarea
            name="landingInstructions"
            placeholder="Additional information or next steps to show on the landing page"
            value={formData.metadata.landingInstructions}
            onChange={handleMetadataChange}
          />
        </div>
      </div>

      <div className="guest-settings">
        <h3>Guest & Host Settings</h3>
        <div className="guest-settings-content">
          <div className="max-guests-section">
            <label>Maximum Number of Guests</label>
            <input
              type="number"
              name="maxGuests"
              min="0"
              placeholder="Enter maximum guests (0 for unlimited)"
              value={formData.metadata.maxGuests}
              onChange={handleMetadataChange}
            />
          </div>

          <div className="host-settings-section">
          <div className="host-approval-setting">
            <label>
              <input
                type="checkbox"
                name="requireHostApproval"
                checked={formData.metadata.requireHostApproval}
                onChange={(e) => {
                  handleMetadataChange({
                    target: {
                      name: 'requireHostApproval',
                      value: e.target.checked
                    }
                  });
                  // If enabling host approval, also require email
                  if (e.target.checked) {
                    handleMetadataChange({
                      target: {
                        name: 'requireEmail',
                        value: true
                      }
                    });
                  }
                }}
              />
              Require Host Approval
            </label>
          </div>
            
            {formData.metadata.requireHostApproval && (
              <div className="host-email-section">
                <label>Host Email</label>
                <input
                  type="email"
                  name="hostEmail"
                  placeholder="Enter host email"
                  value={formData.metadata.hostEmail}
                  onChange={handleMetadataChange}
                />
                <small>Approval requests will be sent to this email</small>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="theme-section">
        <h2>Theme Settings</h2>
        <div className="theme-color-group">
          <div className="color-input">
            <label>Primary Color</label>
            <input
              type="color"
              name="primaryColor"
              value={formData.metadata.theme.primaryColor}
              onChange={handleThemeChange}
            />
          </div>
          <div className="color-input">
            <label>Secondary Color</label>
            <input
              type="color"
              name="secondaryColor"
              value={formData.metadata.theme.secondaryColor}
              onChange={handleThemeChange}
            />
          </div>
          <div className="color-input">
            <label>Background Color</label>
            <input
              type="color"
              name="backgroundColor"
              value={formData.metadata.theme.backgroundColor}
              onChange={handleThemeChange}
            />
          </div>
          <div className="color-input">
            <label>Section Color</label>
            <input
              type="color"
              name="sectionColor"
              value={formData.metadata.theme.sectionColor}
              onChange={handleThemeChange}
            />
          </div>
          <div className="color-input">
            <label>Question Color</label>
            <input
              type="color"
              name="questionColor"
              value={formData.metadata.theme.questionColor}
              onChange={handleThemeChange}
            />
          </div>
        </div>
        <input
          type="text"
          name="fontFamily"
          placeholder="Font Family"
          value={formData.metadata.theme.fontFamily}
          onChange={handleThemeChange}
        />
        <div className="appearance-section">
          <h2>Appearance Settings</h2>
          <div className="image-settings">
          <div className="background-image-setting">
            <label>Background Image URL</label>
            <input
              type="url"
              name="backgroundImageUrl"  // Changed to match handler
              placeholder="https://example.com/background.jpg"
              value={formData.metadata.theme.backgroundImage.url}  // Updated path
              onChange={handleThemeChange}
            />
            <small>Enter a URL for the form background image</small>
          </div>
            
            <div className="logo-setting">
              <label>Logo URL</label>
              <input
                type="url"
                name="logoUrl"  // Changed from logoUrl to match handler
                placeholder="https://example.com/logo.png"
                value={formData.metadata.theme.logo.url}  // Updated path
                onChange={handleThemeChange}
              />
              <small>Enter a URL for the form logo</small>
            </div>
          </div>
        </div>
      </div>

      <div className="sections">
        <h2>Form Sections</h2>
        {formData.sections.map((section, index) => (
          <SectionBuilder
            key={section.id}
            section={section}
            allQuestions={formData.sections.flatMap(s => s.questions)}
            onUpdate={(updatedSection) => {
              const newSections = [...formData.sections];
              newSections[index] = updatedSection;
              onChange(prev => ({
                ...prev,
                sections: newSections
              }));
            }}
            onDelete={() => {
              onChange(prev => ({
                ...prev,
                sections: prev.sections.filter(s => s.id !== section.id)
              }));
            }}
          />
        ))}
        <button onClick={addSection}>Add Section</button>
      </div>
    </div>
  );
};

export default FormBuilder;