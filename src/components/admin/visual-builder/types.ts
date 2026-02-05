// Section configuration interface (shared across SiteSettings, useSiteSettings, and VisualPageBuilder)
export interface SectionConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

// Section preview data for visual representation in the builder
export interface SectionPreview {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  previewHeight: string;
}
