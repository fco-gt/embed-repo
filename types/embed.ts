export interface EmbedConfig {
  theme: "light" | "dark" | "glass";
  showStars: boolean;
  showForks: boolean;
  showLanguage: boolean;
  showAvatar: boolean;
  primaryColor: string;
}

export const defaultConfig: EmbedConfig = {
  theme: "light",
  showStars: true,
  showForks: true,
  showLanguage: true,
  showAvatar: true,
  primaryColor: "#3b82f6", // blue-500
};
