import MinimalTemplate from "./Minimal";
import ModernTemplate from "./Modern";
import SmartProTemplate from "./SmartPro";

export const RESUME_TEMPLATES = {
  minimal: {
    id: "minimal",
    name: "Minimal (ATS-Friendly)",
    component: MinimalTemplate,
    description: "Classic single-column layout optimized for machine readers.",
    badge: null,
  },
  modern: {
    id: "modern",
    name: "Modern (2-Column)",
    component: ModernTemplate,
    description: "Elegant layout with a sidebar for skills and contact info.",
    badge: null,
  },
  smartpro: {
    id: "smartpro",
    name: "Smart Pro",
    component: SmartProTemplate,
    description: "Premium dark-header layout. Stands out from the crowd.",
  },
};
