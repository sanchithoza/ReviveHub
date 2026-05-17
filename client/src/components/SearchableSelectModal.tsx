"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectModalProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
}

export default function SearchableSelectModal({
  options,
  value,
  onChange,
  allLabel,
}: SearchableSelectModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption ? selectedOption.label : allLabel;

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <>
      <button type="button" className="modal-select-trigger" onClick={() => setIsOpen(true)}>
        <span className="modal-select-label">{displayLabel}</span>
      </button>

      {isOpen ? (
        <div className="modal-overlay" onClick={() => { setIsOpen(false); setSearchTerm(""); }} role="dialog" aria-modal="true">
          <div className="modal-select-content" ref={modalRef} onClick={(event) => event.stopPropagation()}>
            <div className="modal-select-header">
              <h3>{allLabel}</h3>
              <button type="button" className="modal-select-close" onClick={() => { setIsOpen(false); setSearchTerm(""); }} aria-label="Close"><X size={16} /></button>
            </div>
            <div className="modal-select-search">
              <Search size={14} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Type to search..."
                autoComplete="off"
              />
            </div>
            <ul className="modal-select-list">
              <li
                className={value === "" ? "modal-select-option selected" : "modal-select-option"}
                onClick={() => handleSelect("")}
              >
                All
              </li>
              {filteredOptions.filter((option) => option.value !== "").length === 0 ? (
                <li className="modal-select-empty">No results found</li>
              ) : (
                filteredOptions
                  .filter((option) => option.value !== "")
                  .map((option) => (
                    <li
                      key={option.value}
                      className={option.value === value ? "modal-select-option selected" : "modal-select-option"}
                      onClick={() => handleSelect(option.value)}
                    >
                      {option.label}
                    </li>
                  ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
