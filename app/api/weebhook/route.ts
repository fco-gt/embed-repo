import { type NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/mongo";
import WeebhookModel, { WeebhookDoc } from "@/models/Weebhook";
import { EmbedConfig } from "@/types/embed";

export interface CreateWeebhookBody {
  repoUrl: string;
  embedConfig: EmbedConfig;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateWeebhookBody;

    if (!body?.repoUrl || !body?.embedConfig) {
      return NextResponse.json(
        { error: "repoUrl and embedConfig are required" },
        { status: 400 }
      );
    }

    // Validate and extract owner/repo from URL
    const match = body.repoUrl.match(
      /^https:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)/
    );

    if (!match) {
      return NextResponse.json(
        { error: "invalid GitHub URL, must use HTTPS" },
        { status: 400 }
      );
    }

    const owner = match[1];
    const repo = match[2];

    await connect();

    const doc = await WeebhookModel.create({
      owner,
      repo,
      repoUrl: body.repoUrl,
      embedConfig: body.embedConfig,
    } as Partial<WeebhookDoc>);

    const webhookUrl = `/api/embed/${doc._id.toString()}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.json(
      {
        id: doc._id.toString(),
        webhookUrl: `${baseUrl}${webhookUrl}`,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "create error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
