"use client";

import { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  required = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openDropdown = () => {
    setIsOpen(true);
    setHighlightedIndex(-1);
    setSearchTerm("");
  };

  const selectOption = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOpen) {
      setIsOpen(true);
    }
    setSearchTerm(event.target.value);
    setHighlightedIndex(-1);
    if (event.target.value === "") {
      onChange("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        setIsOpen(true);
        setHighlightedIndex(-1);
        event.preventDefault();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
      event.preventDefault();
    } else if (event.key === "ArrowUp") {
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      event.preventDefault();
    } else if (event.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        selectOption(filteredOptions[highlightedIndex]);
      }
      event.preventDefault();
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
      event.preventDefault();
    }
  };

  const handleOptionClick = (option: Option) => {
    selectOption(option);
  };

  const handleInputFocus = () => {
    openDropdown();
  };

  return (
    <div className="searchable-select" ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        className="searchable-select-input"
        value={isOpen ? searchTerm : selectedOption ? selectedOption.label : ""}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className="searchable-select-dropdown">
          {filteredOptions.map((option, index) => {
            let itemClass = "searchable-select-option";
            if (index === highlightedIndex) {
              itemClass = "searchable-select-option highlighted";
            } else if (option.value === value) {
              itemClass = "searchable-select-option selected";
            }
            return (
              <li
                key={option.value}
                className={itemClass}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
      {isOpen && filteredOptions.length === 0 && (
        <div className="searchable-select-empty">No results found</div>
      )}
    </div>
  );
}
