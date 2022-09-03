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
import { Listbox, Transition } from "@headlessui/react";
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
}
export function MultiSelect<T>(props: MultiSelectProps<T>) {
  return (
    <Listbox
      as="div"
      multiple
      //className={className}
      value={props.selected}
      onChange={(event) => {
        props.onChange(event)
      }}
    >
      {({ open }) => (
        <>
          {/*label && (
            <Listbox.Label className="mb-1 text-sm font-medium text-blue-gray-500">
              {label}
            </Listbox.Label>
          )*/}
          <div className="relative mt-1">
            <span className="inline-block w-full rounded-md shadow-sm">
              <Listbox.Button className="cursor-default relative w-full rounded-md border border-gray-300 bg-white pl-3 pr-10 py-2 text-left  transition ease-in-out duration-150">
                {Array.isArray(props.selected) ? (
                    <span className="block truncate text-black">
                      Selected {props.selected.length == props.options.length ? 'All' : props.selected.length}
                    </span>
                ) : (
                  <span className="block truncate">
                    {props.optionToLabel(props.selected)}
                  </span>
                )}

                <span className="absolute inset-y-0 right-0 flex items-center pr-2 ml-3 pointer-events-none">
                  <Selector />
                </span>
              </Listbox.Button>
            </span>
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg mb-11">
              {/* bottom-0 will open the select menu up & mb-11 will put the dropup above the select option */}
              <Transition
                show={open}
                leave="transition duration-100 ease-in"
                leaveFrom="transform opacity-100"
                leaveTo="transform opacity-0"
              >
                <Listbox.Options
                  static
                  className="py-1 overflow-auto text-base rounded-md max-h-56 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                >
                  {props.options.map((option) => {
                    return (
                      <Listbox.Option
                        as={React.Fragment}
                        key={props.optionToKey(option)}
                        value={option}
                      >
                        {({ active, selected }) => {
                          return (
                            <li
                              className={`${
                                active
                                  ? "text-white bg-indigo-600"
                                  : "text-gray-900"
                              } cursor-default select-none relative py-2 pl-3 pr-9`}
                            >
                              <div className="flex items-center">
                                <span
                                  className={`${
                                    selected ? "font-semibold" : "font-normal"
                                  } flex items-center block truncate`}
                                >
                                  {props.optionToLabel(option)}
                                </span>
                                {selected && (
                                  <span
                                    className={`${
                                      active ? "text-white" : "text-indigo-600"
                                    } absolute inset-y-0 right-0 flex items-center mr-3 pl-1.5`}
                                  >
                                    <Selected />
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        }}
                      </Listbox.Option>
                    );
                  })}
                </Listbox.Options>
              </Transition>
            </div>
          </div>
        </>
      )}
    </Listbox>
  );
}
