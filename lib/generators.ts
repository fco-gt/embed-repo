import { RepoData } from "../types/repo";
import { EmbedConfig } from "../types/embed";

function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function formatTimeAgo(isoDate: string): string {
  const now = new Date();
  const past = new Date(isoDate);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
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
      overflow: hidden;
      background: ${theme.bg};
      border: 1px solid ${theme.border};
      color: ${theme.text};
      text-decoration: none;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
      max-width: 400px;
      ${isGlass ? `backdrop-filter: ${theme.backdropFilter};` : ""}
    }
    .er-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1);
    }
    .er-featured {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .er-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
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
    .er-contributors {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
    }
    .er-contributor-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid ${theme.bg};
      margin-left: -8px;
    }
    .er-contributor-avatar:first-child {
      margin-left: 0;
    }
    .er-footer {
      display: flex;
      flex-wrap: wrap;
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
  ${
    cfg.showFeaturedImage && data.og_image
      ? `<img src="${esc(data.og_image)}" class="er-featured" alt="${esc(
          data.name
        )}" />`
      : ""
  }
  <div class="er-content">
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
    <p class="er-desc">${esc(
      data.description || "No description provided."
    )}</p>
    ${
      cfg.showContributors && data.contributors.length > 0
        ? `<div class="er-contributors">
        ${data.contributors
          .map(
            (c) =>
              `<img src="${esc(
                c.avatar
              )}" class="er-contributor-avatar" alt="${esc(
                c.username
              )}" title="${esc(c.username)}" />`
          )
          .join("")}
      </div>`
        : ""
    }
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
      ${
        cfg.showIssues
          ? `<span class="er-stat">🐛 ${data.open_issues.toLocaleString()}</span>`
          : ""
      }
      ${
        cfg.showLastUpdated
          ? `<span class="er-stat">🕒 ${formatTimeAgo(data.pushed_at)}</span>`
          : ""
      }
    </div>
  </div>
</a>`;
}

export function genMarkdown(data: RepoData, cfg: EmbedConfig) {
  const parts = [];

  if (cfg.showFeaturedImage && data.og_image) {
    parts.push(`![${data.name}](${data.og_image})`);
  }

  if (cfg.showAvatar)
    parts.push(`![${data.owner.username}](${data.owner.avatar})`);
  parts.push(`## [${data.name}](${data.html_url})`);
  parts.push(data.description || "");

  if (cfg.showContributors && data.contributors.length > 0) {
    const contributorImages = data.contributors
      .map((c) => `![${c.username}](${c.avatar})`)
      .join(" ");
    parts.push(`**Contributors:** ${contributorImages}`);
  }

  const stats = [];
  if (cfg.showStars) stats.push(`⭐ ${data.stars}`);
  if (cfg.showForks) stats.push(`🔱 ${data.forks}`);
  if (cfg.showLanguage && data.language) stats.push(`💻 ${data.language}`);
  if (cfg.showIssues) stats.push(`🐛 ${data.open_issues}`);
  if (cfg.showLastUpdated) stats.push(`🕒 ${formatTimeAgo(data.pushed_at)}`);

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
