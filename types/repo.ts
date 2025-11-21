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
}

export interface CacheEntry {
  _t: number;
  data: RepoData;
}
