
import React from 'react';

function Form({ fields, formData, onChange, onSubmit, submitText, submitButtonClass = 'btn-primary' }) {
  return (
    <form onSubmit={onSubmit}>
      {fields.map((field) => (
        <div key={field.name} className="form-group">
          <label htmlFor={field.name} className="form-label">
            {field.label}
            {field.required && <span style={{ color: 'red' }}>*</span>}
          </label>
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={field.value}
            onChange={onChange}
            placeholder={field.placeholder}
            required={field.required}
            className="form-control"
          />
        </div>
      ))}
      <button type="submit" className={`btn ${submitButtonClass}`}>
        {submitText}
      </button>
    </form>
  );
}

export default Form;
