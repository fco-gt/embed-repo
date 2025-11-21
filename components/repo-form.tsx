"use client";

import { useState, useEffect } from "react";
import { Loader2, Search } from "lucide-react";
import { RepoData } from "@/types/repo";
import { EmbedConfig, defaultConfig } from "@/types/embed";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RepoFormProps {
  onData: (data: RepoData) => void;
  onConfigChange: (config: EmbedConfig) => void;
}

export function RepoForm({ onData, onConfigChange }: RepoFormProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<EmbedConfig>(defaultConfig);

  // Notify parent of initial config
  useEffect(() => {
    onConfigChange(defaultConfig);
  }, [onConfigChange]);

  const updateConfig = (key: keyof EmbedConfig, value: string | boolean) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/repo?url=${encodeURIComponent(url)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch repo");
      }
      const data = await res.json();
      onData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex w-full items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="url"
              placeholder="https://github.com/owner/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-9"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Generate"}
          </Button>
        </div>
        {error && (
          <p className="text-center text-sm text-red-500 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </form>

      <div className="grid gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <h3 className="font-semibold">Customization</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={config.theme}
              onValueChange={(v) => updateConfig("theme", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="glass">Glass</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              {["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6"].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    config.primaryColor === c
                      ? "border-foreground scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => updateConfig("primaryColor", c)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="showStars"
              checked={config.showStars}
              onCheckedChange={(c) => updateConfig("showStars", c)}
            />
            <Label htmlFor="showStars">Stars</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showForks"
              checked={config.showForks}
              onCheckedChange={(c) => updateConfig("showForks", c)}
            />
            <Label htmlFor="showForks">Forks</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showLanguage"
              checked={config.showLanguage}
              onCheckedChange={(c) => updateConfig("showLanguage", c)}
            />
            <Label htmlFor="showLanguage">Lang</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showAvatar"
              checked={config.showAvatar}
              onCheckedChange={(c) => updateConfig("showAvatar", c)}
            />
            <Label htmlFor="showAvatar">Avatar</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showIssues"
              checked={config.showIssues}
              onCheckedChange={(c) => updateConfig("showIssues", c)}
            />
            <Label htmlFor="showIssues">Issues</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showLastUpdated"
              checked={config.showLastUpdated}
              onCheckedChange={(c) => updateConfig("showLastUpdated", c)}
            />
            <Label htmlFor="showLastUpdated">Updated</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showContributors"
              checked={config.showContributors}
              onCheckedChange={(c) => updateConfig("showContributors", c)}
            />
            <Label htmlFor="showContributors">Contributors</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showFeaturedImage"
              checked={config.showFeaturedImage}
              onCheckedChange={(c) => updateConfig("showFeaturedImage", c)}
            />
            <Label htmlFor="showFeaturedImage">Featured Img</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
