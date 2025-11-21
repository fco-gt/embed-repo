import { Schema, model, models, Document } from "mongoose";

export interface Contributor {
  login: string;
  avatar: string;
}

export interface WeebhookConfig {
  theme?: string;
  primaryColor?: string;
  variant?: "compact" | "full";
}

export interface WeebhookDoc extends Document {
  owner: string;
  repo: string;
  name: string;
  description?: string | null;
  image?: string | null;
  language?: string | null;
  stars?: number;
  forks?: number;
  contributors: Contributor[];
  config: WeebhookConfig;
  createdAt: Date;
}

const ContributorSchema = new Schema<Contributor>({
  login: { type: String, required: true },
  avatar: { type: String, required: true },
});

const WeebhookSchema = new Schema<WeebhookDoc>({
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: null },
  image: { type: String, default: null },
  language: { type: String, default: null },
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  contributors: { type: [ContributorSchema], default: [] },
  config: {
    theme: { type: String, default: "light" },
    primaryColor: { type: String, default: "" },
    variant: { type: String, enum: ["compact", "full"], default: "full" },
  },
  createdAt: { type: Date, default: () => new Date() },
});

export default models.Weebhook ||
  model<WeebhookDoc>("Weebhook", WeebhookSchema);
