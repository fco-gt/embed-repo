export interface RepoData {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  owner: {
    username: string;
    avatar: string;
  };
  readme?: string | null;
  language?: string | null;
  homepage?: string | null;
  html_url: string;
  open_issues: number;
  pushed_at: string;
  contributors: Array<{
    username: string;
    avatar: string;
  }>;
  og_image?: string;
}

export interface CacheEntry {
  _t: number;
  data: RepoData;
}
