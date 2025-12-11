/**
 * Basic select dropdown component
 */

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
}
