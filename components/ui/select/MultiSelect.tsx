/**
 * Multi-select dropdown component with search functionality
 */

import React from "react";

const Selector = () => (
  <svg
    className="h-5 w-5 text-gray-400"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const Selected = () => (
  <svg
    className="h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
    />
  </svg>
);

interface MultiSelectProps<T> {
  options: T[];
  onChange: (value: T[]) => void;
  selected: T[];
  label: string;
  optionToLabel: (value: T) => string;
  optionToKey: (value: T) => string;
  optionToSearchFields?: (value: T) => string[];
  prioritizeSymbol?: string;
  disabled?: boolean;
}

export function MultiSelect<T>(props: MultiSelectProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Destructure props for dependency array
  const {
    options,
    selected,
    onChange,
    optionToLabel,
    optionToKey,
    optionToSearchFields,
    prioritizeSymbol,
    disabled,
  } = props;

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opening
  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Toggle option selection
  const toggleOption = (option: T) => {
    const key = optionToKey(option);
    const isOptionSelected = selected.some((s) => optionToKey(s) === key);
    if (isOptionSelected) {
      onChange(selected.filter((s) => optionToKey(s) !== key));
    } else {
      onChange([...selected, option]);
    }
  };

  // Check if option is selected
  const isSelected = (option: T) => {
    const key = optionToKey(option);
    return selected.some((s) => optionToKey(s) === key);
  };

  // Filter and sort options based on search query
  const filteredOptions = React.useMemo(() => {
    let filtered = options;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = options.filter((option) => {
        // Use custom search fields if provided, otherwise fall back to label
        const searchFields = optionToSearchFields
          ? optionToSearchFields(option)
          : [optionToLabel(option)];
        return searchFields.some((field) =>
          field.toLowerCase().includes(query)
        );
      });
    }

    // Sort with priority symbol first (e.g., cUSD)
    if (prioritizeSymbol) {
      const prioritySymbolLower = prioritizeSymbol.toLowerCase();
      filtered = [...filtered].sort((a, b) => {
        const aFields = optionToSearchFields
          ? optionToSearchFields(a)
          : [optionToLabel(a)];
        const bFields = optionToSearchFields
          ? optionToSearchFields(b)
          : [optionToLabel(b)];

        const aIsPriority = aFields.some(
          (f) => f.toLowerCase() === prioritySymbolLower
        );
        const bIsPriority = bFields.some(
          (f) => f.toLowerCase() === prioritySymbolLower
        );

        if (aIsPriority && !bIsPriority) return -1;
        if (!aIsPriority && bIsPriority) return 1;
        return 0;
      });
    }

    return filtered;
  }, [options, searchQuery, optionToSearchFields, optionToLabel, prioritizeSymbol]);

  return (
    <div ref={containerRef} className="relative mt-1">
      <span className="inline-block w-full rounded-md shadow-sm">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`cursor-default relative w-full rounded-md border border-gray-300 bg-white pl-3 pr-10 py-2 text-left transition ease-in-out duration-150 ${
            disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
          }`}
        >
          <span className="block truncate text-black">
            {selected.length === options.length
              ? "All"
              : `${selected.length} Selected`}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 ml-3 pointer-events-none">
            <Selector />
          </span>
        </button>
      </span>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg mb-11">
          <div className="rounded-md ring-1 ring-black ring-opacity-5">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search vouchers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              />
            </div>
            <ul className="py-1 overflow-auto text-base max-h-56 focus:outline-none sm:text-sm">
              {filteredOptions.length === 0 ? (
                <li className="text-gray-500 text-center py-2 px-3">
                  No vouchers found
                </li>
              ) : (
                filteredOptions.map((option) => {
                  const optionSelected = isSelected(option);
                  return (
                    <li
                      key={optionToKey(option)}
                      onClick={() => toggleOption(option)}
                      className="text-gray-900 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:text-white hover:bg-green-600"
                    >
                      <div className="flex items-center">
                        <span
                          className={`${
                            optionSelected ? "font-semibold" : "font-normal"
                          } truncate`}
                        >
                          {optionToLabel(option)}
                        </span>
                        {optionSelected && (
                          <span className="text-green-600 absolute inset-y-0 right-0 flex items-center mr-3 pl-1.5">
                            <Selected />
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
