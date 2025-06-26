
import React from 'react';

function Form({ fields, formData, setFormData, onSubmit, buttonText }) {
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderField = (field) => {
    const { name, label, type, options, required } = field;
    
    if (type === 'select') {
      return (
        <select
          value={formData[name] || ''}
          onChange={(e) => handleChange(name, e.target.value)}
          required={required}
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          value={formData[name] || ''}
          onChange={(e) => handleChange(name, e.target.value)}
          rows={3}
          required={required}
        />
      );
    }

    return (
      <input
        type={type}
        value={formData[name] || ''}
        onChange={(e) => handleChange(name, e.target.value)}
        required={required}
        step={type === 'number' ? '0.01' : undefined}
      />
    );
  };

  return (
    <form onSubmit={onSubmit} className="entry-form">
      {fields.map((field, index) => (
        <div key={field.name} className={field.width === 'full' ? 'form-group' : 'form-group'}>
          <label>{field.label}</label>
          {renderField(field)}
        </div>
      ))}
      <button type="submit" className="submit-btn">{buttonText}</button>
    </form>
  );
}

export default Form;
