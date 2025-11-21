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
  const r = await GH.get(`/repos/${owner}/${repo}`);
  const readme = await GH.get(`/repos/${owner}/${repo}/readme`, {
    headers: { Accept: "application/vnd.github.v3.raw" },
  })
    .then((s) => s.data)
    .catch(() => null);
  return {
    name: r.data.name,
    owner: {
      username: r.data.owner.login,
      avatar: r.data.owner.avatar_url,
    },
    description: r.data.description,
    stars: r.data.stargazers_count,
    forks: r.data.forks_count,
    language: r.data.language,
    html_url: r.data.html_url,
    readme,
  };
}
