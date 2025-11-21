import { type NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/mongo";
import WeebhookModel, { WeebhookDoc } from "@/models/Weebhook";
import { isValidObjectId } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop() ?? "";
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }

    await connect();

    const doc = await WeebhookModel.findById(id)
      .lean<WeebhookDoc | null>()
      .exec();

    if (!doc) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // return clean data
    return NextResponse.json(doc, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "fetch error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
