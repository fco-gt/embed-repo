import { type NextRequest, NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";

import { fetchRepo } from "@/lib/github";
import type { RepoData, CacheEntry } from "@/types/repo";

const cache = new Map<string, CacheEntry>();

export async function GET(req: NextRequest) {
  const repoUrl = req.nextUrl.searchParams.get("url");

  if (!repoUrl || typeof repoUrl !== "string") {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  // Validate URL
  const match = repoUrl.match(/^https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)/);

  if (!match) {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  const owner = match[1];
  const repo = match[2];
  const key = `${owner}/${repo}`;

  const cached = cache.get(key);
  const ttl = 5 * 60 * 1000;

  if (cached && Date.now() - cached._t < ttl) {
    return NextResponse.json(cached.data, { status: 200 });
  }

  try {
    const repoData = await fetchRepo(owner, repo);
    
    const sanitizedReadme =
      repoData.readme
        ? sanitizeHtml(repoData.readme, {
            allowedTags: [],
            allowedAttributes: {},
          }).slice(0, 2000)
        : null;

    const cleanData: RepoData = {
      ...repoData,
      readme: sanitizedReadme,
    };

    cache.set(key, { _t: Date.now(), data: cleanData });

    return NextResponse.json(cleanData, { status: 200 });
  } catch (_err) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
