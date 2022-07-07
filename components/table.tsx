import React, { ReactNode } from "react";

type TableHeaderCell<T> = {
  name: string;
  className?: string;
  renderCell: (cell: T) => ReactNode;
};

export interface TableProps<T> {
  headers: TableHeaderCell<T>[];
  rows: T[][];
}
export function Table<T>(props: TableProps<T>) {
  return (
    <table className="table text-gray-400 border-separate space-y-6 text-sm">
      <thead className="bg-gray-800 text-gray-500">
        <tr>
          {props.headers.map((h) => (
            <th className={`p-3 ${h.className}`}>{h.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.rows.map((r) => (
          <tr className="bg-gray-800">
            {r.map((cell, headerIdx) => (
              <td className="p-3">
                {props.headers[headerIdx].renderCell(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
