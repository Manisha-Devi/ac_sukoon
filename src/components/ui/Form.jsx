
import React from 'react';

function Form({ fields, formData, setFormData, onSubmit, buttonText }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={onSubmit} className="entry-form">
      <div className="form-grid">
        {fields.map((field, index) => (
          <div 
            key={index} 
            className={`form-group ${field.width === 'full' ? 'full-width' : ''}`}
          >
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                required={field.required}
              >
                <option value="">Select {field.label}</option>
                {field.options.map((option, optionIndex) => (
                  <option key={optionIndex} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                required={field.required}
                rows="4"
              />
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                required={field.required}
              />
            )}
          </div>
        ))}
      </div>
      
      <button type="submit" className="submit-btn">
        {buttonText || 'Submit'}
      </button>
    </form>
  );
}

export default Form;
