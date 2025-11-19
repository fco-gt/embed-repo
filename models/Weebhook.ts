import { Schema, model, models } from "mongoose";

const WeebhookSchema = new Schema(
  {
    owner: String,
    repo: String,
    name: String,
    description: String,
    image: String,
    language: String,
    stars: Number,
    forks: Number,
    contributors: [{ login: String, avatar: String }],
    config: { theme: String, primaryColor: String, variant: String },
    createdAt: { type: Date, default: Date.now },
  },
  { minimize: false }
);

export default models.Weebhook || model("Weebhook", WeebhookSchema);
