
import React, { useState, useRef, useEffect } from 'react';
import '../css/SearchableSelect.css';

const SearchableSelect = ({ 
  options = [], 
  value = '', 
  onChange, 
  placeholder = "Type to search...",
  allowCustom = true,
  disabled = false,
  className = "",
  name = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const filtered = options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    
    if (onChange) {
      onChange(value);
    }
  };

  const handleOptionClick = (option) => {
    setSearchTerm(option);
    setIsOpen(false);
    
    if (onChange) {
      onChange(option);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`searchable-select ${className}`} ref={dropdownRef}>
      <div className="search-input-container">
        <input
          ref={inputRef}
          type="text"
          className="form-control search-input"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          name={name}
          autoComplete="off"
        />
        <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'} dropdown-arrow`}></i>
      </div>

      {isOpen && (
        <div className="dropdown-menu show">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                className="dropdown-item"
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </div>
            ))
          ) : (
            <div className="dropdown-item disabled">
              {allowCustom ? 
                `"${searchTerm}" will be used as custom value` : 
                'No options found'
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
