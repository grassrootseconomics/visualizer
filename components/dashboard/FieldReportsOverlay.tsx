/**
 * Overlay container for field report cards with animations
 */

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FieldReportCard } from "./FieldReportCard";
import type { VisibleReport } from "@/types";

export interface FieldReportsOverlayProps {
  visibleReports: VisibleReport[];
  onDismiss: (reportId: number) => void;
}

const cardVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

export function FieldReportsOverlay({
  visibleReports,
  onDismiss,
}: FieldReportsOverlayProps) {
  if (visibleReports.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-24 left-0 right-0 z-10 flex justify-center gap-3 px-4 overflow-x-auto pointer-events-none overflow-y-hidden">
      <AnimatePresence mode="popLayout">
        {visibleReports.map((report) => (
          <motion.div
            key={report.id}
            layout
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="pointer-events-auto flex-shrink-0"
          >
            <FieldReportCard
              report={report}
              onDismiss={() => onDismiss(report.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
