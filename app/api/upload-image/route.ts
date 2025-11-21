import { type NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadBody {
  imageUrl?: string;
}

interface UploadResult {
  url: string;
  public_id?: string;
  width?: number;
  height?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as UploadBody;

    if (!body?.imageUrl || typeof body.imageUrl !== "string") {
      return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
    }
    
    const upload = await cloudinary.uploader.upload(body.imageUrl, {
      folder: "repo-embed",
      use_filename: true,
      overwrite: false,
    });

    const result: UploadResult = {
      url: upload.secure_url,
      public_id: upload.public_id,
      width: upload.width,
      height: upload.height,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "upload error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
