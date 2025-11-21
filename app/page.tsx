"use client";

import { useState } from "react";
import { Github } from "lucide-react";
import { RepoForm } from "@/components/repo-form";
import { EmbedViewer } from "@/components/embed-viewer";
import { RepoData } from "@/types/repo";
import { EmbedConfig, defaultConfig } from "@/types/embed";

export default function Home() {
  const [data, setData] = useState<RepoData | null>(null);
  const [config, setConfig] = useState<EmbedConfig>(defaultConfig);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-24 sm:px-8">
      <div className="flex w-full max-w-5xl flex-col items-center gap-12">
        {/* Header */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card shadow-sm ring-1 ring-border">
            <Github className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              EmbedRepo
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Turn any GitHub repository into a beautiful, embeddable card for your
              website or documentation.
            </p>
          </div>
        </div>

        {/* Form */}
        <RepoForm onData={setData} onConfigChange={setConfig} />

        {/* Result */}
        {data && <EmbedViewer data={data} config={config} />}
      </div>
    </main>
  );
}
