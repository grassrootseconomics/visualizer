/**
 * Individual field report card with animations
 */

import React, { useState } from "react";
import { CloseIcon } from "@components/icons";
import type { VisibleReport } from "@/types";

export interface FieldReportCardProps {
  report: VisibleReport;
  onDismiss: () => void;
}

export function FieldReportCard({ report, onDismiss }: FieldReportCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDismiss();
  };

  return (
    <a
      href={`https://sarafu.network/reports/${report.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-72 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer"
    >
      {/* Image */}
      {report.image_url && !imgError && (
        <div className="relative h-32 w-full">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            src={report.image_url}
            alt={report.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          >
            <CloseIcon
              onClick={onDismiss}
              className="w-4 h-4 text-white"
            />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Title with dismiss if no image */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1">
            {report.title}
          </h3>
          {!report.image_url && (
            <button
              onClick={handleDismiss}
              className="p-0.5 hover:bg-gray-100 rounded transition-colors"
            >
              <CloseIcon
                onClick={onDismiss}
                className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              />
            </button>
          )}
        </div>

        {/* Tags */}
        {report.tags && report.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {report.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {report.tags.length > 4 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{report.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom accent bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 to-green-600" />
    </a>
  );
}
