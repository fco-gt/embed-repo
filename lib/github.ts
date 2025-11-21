import axios from "axios";

const GH = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: process.env.GITHUB_TOKEN
      ? `token ${process.env.GITHUB_TOKEN}`
      : undefined,
  },
});

export async function fetchRepo(owner: string, repo: string) {
  const [repoRes, readmeRes, contributorsRes] = await Promise.all([
    GH.get(`/repos/${owner}/${repo}`),
    GH.get(`/repos/${owner}/${repo}/readme`, {
      headers: { Accept: "application/vnd.github.v3.raw" },
    }).catch(() => ({ data: null })),
    GH.get(`/repos/${owner}/${repo}/contributors?per_page=5`).catch(() => ({
      data: [],
    })),
  ]);

  const r = repoRes.data;
  const contributors = Array.isArray(contributorsRes.data)
    ? contributorsRes.data.map((c: { login: string; avatar_url: string }) => ({
        username: c.login,
        avatar: c.avatar_url,
      }))
    : [];

  return {
    name: r.name,
    owner: {
      username: r.owner.login,
      avatar: r.owner.avatar_url,
    },
    description: r.description,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    html_url: r.html_url,
    readme: readmeRes.data,
    open_issues: r.open_issues_count,
    pushed_at: r.pushed_at,
    contributors,
    og_image: `https://opengraph.githubassets.com/1/${owner}/${repo}`,
  };
}
