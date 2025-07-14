
import React, { useState, useRef, useEffect } from 'react';
import '../css/SearchableSelect.css';

const SearchableSelect = ({ 
  options = [], 
  value = '', 
  onChange, 
  placeholder = 'Type to search...', 
  allowCustom = false,
  name,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Update search term when value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Filter options based on search term - exact starting match
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option => 
        option.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
    setFocusedIndex(-1);
  }, [searchTerm, options]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    // Only show dropdown if user has typed at least 1 character
    if (newValue.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    
    if (allowCustom) {
      onChange(newValue);
    }
  };

  const handleOptionClick = (option) => {
    setSearchTerm(option);
    setIsOpen(false);
    onChange(option);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    // Only open dropdown if there's already some text
    if (searchTerm.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = (e) => {
    // Check if the click is on an option - if so, don't close
    const clickedElement = e.relatedTarget;
    if (clickedElement && clickedElement.closest('.searchable-dropdown')) {
      return;
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if ((e.key === 'ArrowDown' || e.key === 'Enter') && searchTerm.trim().length > 0) {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleOptionClick(filteredOptions[focusedIndex]);
        } else if (allowCustom && searchTerm.trim()) {
          setIsOpen(false);
          onChange(searchTerm);
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      
      default:
        break;
    }
  };

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex];
      if (focusedElement) {
        focusedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [focusedIndex]);

  return (
    <div className={`searchable-select ${className}`}>
      <input
        ref={inputRef}
        type="text"
        className="form-control searchable-input"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        name={name}
        autoComplete="off"
      />
      
      {isOpen && (
        <div className="searchable-dropdown">
          <ul ref={listRef} className="searchable-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option}
                  className={`searchable-option ${
                    index === focusedIndex ? 'focused' : ''
                  } ${option === value ? 'selected' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleOptionClick(option);
                  }}
                  onClick={() => handleOptionClick(option)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  {option}
                </li>
              ))
            ) : (
              <li className="searchable-option no-results">
                {allowCustom ? (
                  <span>
                    Press Enter to add "{searchTerm}"
                  </span>
                ) : (
                  <span>No matches found</span>
                )}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
