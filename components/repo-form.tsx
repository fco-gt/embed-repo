"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, X } from "lucide-react";
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [useCustomImage, setUseCustomImage] = useState(false);

  // Notify parent of initial config
  useEffect(() => {
    onConfigChange(defaultConfig);
  }, [onConfigChange]);

  const updateConfig = (key: keyof EmbedConfig, value: string | boolean | undefined) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setImageError("Invalid format. Supported: JPG, PNG, WebP, GIF");
      return;
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setImageError("Image too large. Maximum size: 2MB");
      return;
    }

    setImageError(null);
    setUploadingImage(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);

        // Upload to Cloudinary
        const response = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: base64 }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const result = await response.json();
        updateConfig("customFeaturedImageUrl", result.url);
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Upload failed");
      setUploadingImage(false);
    }
  };

  const removeCustomImage = () => {
    setPreviewImage(null);
    updateConfig("customFeaturedImageUrl", undefined);
    setUseCustomImage(false);
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

        {/* Featured Image Upload */}
        <div className="space-y-3">
          <Label>Featured Image</Label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="imageSource"
                checked={!useCustomImage}
                onChange={() => {
                  setUseCustomImage(false);
                  removeCustomImage();
                }}
                className="h-4 w-4"
              />
              <span className="text-sm">Default (GitHub OG)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="imageSource"
                checked={useCustomImage}
                onChange={() => setUseCustomImage(true)}
                className="h-4 w-4"
              />
              <span className="text-sm">Custom Upload</span>
            </label>
          </div>

          {useCustomImage && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="text-sm"
                />
                {previewImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeCustomImage}
                    className="h-8"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP, GIF • Max 2MB
              </p>
              {uploadingImage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Uploading...
                </div>
              )}
              {imageError && (
                <p className="text-xs text-red-500">{imageError}</p>
              )}
              {previewImage && !uploadingImage && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                  <img
                    src={previewImage}
                    alt="Custom featured preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}
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
