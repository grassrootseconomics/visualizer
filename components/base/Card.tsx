import React from "react";
export const Card: React.FC<{
  small?: boolean;
  color?: string;
  children?: React.ReactNode;
}> = ({ small, color, children }) => {
  return (
    <div
      className={`m-3 flex-col flex-grow relative flex ${
        small ? "px-1 py-5 m-1 h-" : "p-5 m-5"
      }`}
    >
      {children}
    </div>
  );
};
