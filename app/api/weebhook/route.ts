import { type NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/mongo";
import WeebhookModel, { WeebhookDoc } from "@/models/Weebhook";

export interface CreateWeebhookBody {
  owner: string;
  repo: string;
  name: string;
  description?: string | null;
  image?: string | null;
  language?: string | null;
  stars?: number;
  forks?: number;
  contributors?: { login: string; avatar: string }[];
  config?: {
    theme?: string;
    primaryColor?: string;
    variant?: "compact" | "full";
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateWeebhookBody;

    if (!body?.owner || !body?.repo || !body?.name) {
      return NextResponse.json(
        { error: "owner, repo and name are required" },
        { status: 400 }
      );
    }

    await connect();

    const doc = await WeebhookModel.create({
      owner: body.owner,
      repo: body.repo,
      name: body.name,
      description: body.description ?? null,
      image: body.image ?? null,
      language: body.language ?? null,
      stars: body.stars ?? 0,
      forks: body.forks ?? 0,
      contributors: Array.isArray(body.contributors) ? body.contributors : [],
      config: body.config ?? {},
    } as Partial<WeebhookDoc>);

    return NextResponse.json({ id: doc._id.toString() }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "create error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
