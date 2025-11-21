import { RepoData } from "../types/repo";
import { EmbedConfig } from "../types/embed";

function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

interface Theme {
  bg: string;
  border: string;
  text: string;
  textMuted: string;
  backdropFilter?: string;
}

const THEMES: Record<EmbedConfig["theme"], Theme> = {
  light: {
    bg: "#ffffff",
    border: "#e4e4e7",
    text: "#09090b",
    textMuted: "#71717a",
  },
  dark: {
    bg: "#09090b",
    border: "#27272a",
    text: "#fafafa",
    textMuted: "#a1a1aa",
  },
  glass: {
    bg: "rgba(255, 255, 255, 0.1)",
    border: "rgba(255, 255, 255, 0.2)",
    text: "#ffffff",
    textMuted: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(12px)",
  },
};

export function genHTML(data: RepoData, cfg: EmbedConfig) {
  const theme = THEMES[cfg.theme];
  const isGlass = cfg.theme === "glass";

  const styles = `
    .er-card {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      border-radius: 12px;
      padding: 20px;
      background: ${theme.bg};
      border: 1px solid ${theme.border};
      color: ${theme.text};
      text-decoration: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: transform 0.2s, box-shadow 0.2s;
      max-width: 400px;
      ${isGlass ? `backdrop-filter: ${theme.backdropFilter};` : ""}
    }
    .er-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1);
    }
    .er-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .er-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
    .er-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: ${cfg.primaryColor};
    }
    .er-desc {
      font-size: 14px;
      color: ${theme.textMuted};
      margin: 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .er-footer {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: ${theme.textMuted};
      margin-top: auto;
    }
    .er-stat {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `;

  return `
<a href="${esc(
    data.html_url
  )}" target="_blank" rel="noopener noreferrer" class="er-card">
  <style>${styles.replace(/\s+/g, " ")}</style>
  <div class="er-header">
    ${
      cfg.showAvatar
        ? `<img src="${esc(data.owner.avatar)}" class="er-avatar" alt="${esc(
            data.owner.username
          )}" />`
        : ""
    }
    <h3 class="er-title">${esc(data.name)}</h3>
  </div>
  <p class="er-desc">${esc(data.description || "No description provided.")}</p>
  <div class="er-footer">
    ${
      cfg.showStars
        ? `<span class="er-stat">⭐ ${data.stars.toLocaleString()}</span>`
        : ""
    }
    ${
      cfg.showForks
        ? `<span class="er-stat">🔱 ${data.forks.toLocaleString()}</span>`
        : ""
    }
    ${
      cfg.showLanguage && data.language
        ? `<span class="er-stat">💻 ${esc(data.language)}</span>`
        : ""
    }
  </div>
</a>`;
}

export function genMarkdown(data: RepoData, cfg: EmbedConfig) {
  const parts = [];
  if (cfg.showAvatar)
    parts.push(`![${data.owner.username}](${data.owner.avatar})`);
  parts.push(`## [${data.name}](${data.html_url})`);
  parts.push(data.description || "");

  const stats = [];
  if (cfg.showStars) stats.push(`⭐ ${data.stars}`);
  if (cfg.showForks) stats.push(`🔱 ${data.forks}`);
  if (cfg.showLanguage && data.language) stats.push(`💻 ${data.language}`);

  if (stats.length > 0) parts.push(stats.join(" • "));

  return parts.join("\n\n");
}

export function genReact(data: RepoData, cfg: EmbedConfig) {
  return `export default function RepoCard() {
  return (
    <div dangerouslySetInnerHTML={{ __html: \`${genHTML(data, cfg).replace(
      /`/g,
      "\\`"
    )}\` }} />
  );
}`;
}
