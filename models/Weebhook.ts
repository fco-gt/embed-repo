import { Schema, model, models, Document } from "mongoose";
import { EmbedConfig } from "@/types/embed";

export interface WeebhookDoc extends Document {
  owner: string;
  repo: string;
  repoUrl: string;
  embedConfig: EmbedConfig;
  createdAt: Date;
  lastAccessed: Date;
}

const WeebhookSchema = new Schema<WeebhookDoc>({
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  repoUrl: { type: String, required: true },
  embedConfig: {
    theme: { type: String, required: true },
    showStars: { type: Boolean, required: true },
    showForks: { type: Boolean, required: true },
    showLanguage: { type: Boolean, required: true },
    showAvatar: { type: Boolean, required: true },
    primaryColor: { type: String, required: true },
    showIssues: { type: Boolean, required: true },
    showLastUpdated: { type: Boolean, required: true },
    showContributors: { type: Boolean, required: true },
    showFeaturedImage: { type: Boolean, required: true },
    customFeaturedImageUrl: { type: String, required: false },
  },
  createdAt: { type: Date, default: () => new Date() },
  lastAccessed: { type: Date, default: () => new Date() },
});

// Index for faster lookups by owner/repo
WeebhookSchema.index({ owner: 1, repo: 1 });

export default models.Weebhook ||
  model<WeebhookDoc>("Weebhook", WeebhookSchema);
