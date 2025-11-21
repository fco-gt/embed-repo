export interface EmbedConfig {
  theme: "light" | "dark" | "glass";
  showStars: boolean;
  showForks: boolean;
  showLanguage: boolean;
  showAvatar: boolean;
  primaryColor: string;
  showIssues: boolean;
  showLastUpdated: boolean;
  showContributors: boolean;
  showFeaturedImage: boolean;
}

export const defaultConfig: EmbedConfig = {
  theme: "light",
  showStars: true,
  showForks: true,
  showLanguage: true,
  showAvatar: true,
  primaryColor: "#3b82f6", // blue-500
  showIssues: true,
  showLastUpdated: true,
  showContributors: true,
  showFeaturedImage: true,
};
