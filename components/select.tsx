interface SelectInterface<T> {
  items: T[];
  onChange: (value: T) => void;
  value: T;
  label: string;
  itemToLabel: (value: T) => string;
  itemToValue: (value: T) => string;
}
export function Select<T>(props: SelectInterface<T>) {
  return (
    <select
      className="appearance-none
      p-2 m-4 border rounded-md dark:text-gray-600
    bg-white bg-clip-padding bg-no-repeat
    transition
    ease-in-out
    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
      aria-label={props.label}
      value={props.itemToValue(props.value)}
      onChange={(e) => {
        props.onChange(props.items[e.target.selectedIndex]);
      }}
    >
      {props.items.map((v) => (
        <option
          key={`select-${props.itemToValue(v)}`}
          value={props.itemToValue(v)}
        >
          {props.itemToLabel(v)}
        </option>
      ))}
    </select>
  );
} // External Dependencies
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
}
export function MultiSelect<T>(props: MultiSelectProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

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
    const key = props.optionToKey(option);
    const isSelected = props.selected.some(
      (s) => props.optionToKey(s) === key
    );
    if (isSelected) {
      props.onChange(props.selected.filter((s) => props.optionToKey(s) !== key));
    } else {
      props.onChange([...props.selected, option]);
    }
  };

  // Check if option is selected
  const isSelected = (option: T) => {
    const key = props.optionToKey(option);
    return props.selected.some((s) => props.optionToKey(s) === key);
  };

  // Filter and sort options based on search query
  const filteredOptions = React.useMemo(() => {
    let filtered = props.options;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = props.options.filter((option) => {
        // Use custom search fields if provided, otherwise fall back to label
        const searchFields = props.optionToSearchFields
          ? props.optionToSearchFields(option)
          : [props.optionToLabel(option)];
        return searchFields.some((field) =>
          field.toLowerCase().includes(query)
        );
      });
    }

    // Sort with priority symbol first (e.g., cUSD)
    if (props.prioritizeSymbol) {
      const prioritySymbol = props.prioritizeSymbol.toLowerCase();
      filtered = [...filtered].sort((a, b) => {
        const aFields = props.optionToSearchFields
          ? props.optionToSearchFields(a)
          : [props.optionToLabel(a)];
        const bFields = props.optionToSearchFields
          ? props.optionToSearchFields(b)
          : [props.optionToLabel(b)];

        const aIsPriority = aFields.some(
          (f) => f.toLowerCase() === prioritySymbol
        );
        const bIsPriority = bFields.some(
          (f) => f.toLowerCase() === prioritySymbol
        );

        if (aIsPriority && !bIsPriority) return -1;
        if (!aIsPriority && bIsPriority) return 1;
        return 0;
      });
    }

    return filtered;
  }, [props.options, searchQuery, props.optionToSearchFields, props.optionToLabel, props.prioritizeSymbol]);

  return (
    <div ref={containerRef} className="relative mt-1">
      <span className="inline-block w-full rounded-md shadow-sm">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-default relative w-full rounded-md border border-gray-300 bg-white pl-3 pr-10 py-2 text-left transition ease-in-out duration-150"
        >
          <span className="block truncate text-black">
            {props.selected.length === props.options.length
              ? "All"
              : `${props.selected.length} Selected`}
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
                  const selected = isSelected(option);
                  return (
                    <li
                      key={props.optionToKey(option)}
                      onClick={() => toggleOption(option)}
                      className="text-gray-900 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:text-white hover:bg-green-600"
                    >
                      <div className="flex items-center">
                        <span
                          className={`${
                            selected ? "font-semibold" : "font-normal"
                          } truncate`}
                        >
                          {props.optionToLabel(option)}
                        </span>
                        {selected && (
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
