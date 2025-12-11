/**
 * Dashboard components barrel export
 */

export { Dashboard } from "./Dashboard";

export { StatsBar } from "./StatsBar";
export type { StatsBarProps } from "./StatsBar";

export { SettingsPanel } from "./SettingsPanel";
export type { SettingsPanelProps, ExpandedSections } from "./SettingsPanel";

export { InfoPanel } from "./InfoPanel";
export type {
  InfoPanelProps,
  SelectedInfo,
  NodeInfo,
  LinkInfo,
} from "./InfoPanel";

export { TimelineBar } from "./TimelineBar";
export type { TimelineBarProps } from "./TimelineBar";

// Re-export section components
export * from "./sections";
