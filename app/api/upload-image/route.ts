import { type NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadBody {
  imageData?: string; // base64 data URL
  imageUrl?: string; // URL to image
}

interface UploadResult {
  url: string;
  public_id?: string;
  width?: number;
  height?: number;
}

// Allowed formats and max size
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp", "gif"];
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as UploadBody;

    // Validate input
    if (!body?.imageData && !body?.imageUrl) {
      return NextResponse.json(
        { error: "imageData or imageUrl required" },
        { status: 400 }
      );
    }

    let uploadSource: string;

    if (body.imageData) {
      // Validate base64 data URL format
      const dataUrlMatch = body.imageData.match(
        /^data:image\/(jpeg|jpg|png|webp|gif);base64,/
      );

      if (!dataUrlMatch) {
        return NextResponse.json(
          { error: "Invalid image format. Supported: JPG, PNG, WebP, GIF" },
          { status: 400 }
        );
      }

      // Estimate size from base64 (rough approximation)
      const base64Length = body.imageData.split(",")[1].length;
      const sizeBytes = (base64Length * 3) / 4;

      if (sizeBytes > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { error: `Image too large. Maximum size: ${MAX_SIZE_MB}MB` },
          { status: 400 }
        );
      }

      uploadSource = body.imageData;
    } else {
      uploadSource = body.imageUrl!;
    }

    // Upload to Cloudinary with validation
    const upload = await cloudinary.uploader.upload(uploadSource, {
      folder: "repo-embed/featured-images",
      allowed_formats: ALLOWED_FORMATS,
      max_bytes: MAX_SIZE_BYTES,
      use_filename: true,
      overwrite: false,
      resource_type: "image",
    });

    const result: UploadResult = {
      url: upload.secure_url,
      public_id: upload.public_id,
      width: upload.width,
      height: upload.height,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      // Handle Cloudinary errors
      if (err.message.includes("File size too large")) {
        return NextResponse.json(
          { error: `Image too large. Maximum size: ${MAX_SIZE_MB}MB` },
          { status: 400 }
        );
      }
      if (err.message.includes("Invalid image file")) {
        return NextResponse.json(
          { error: "Invalid image format. Supported: JPG, PNG, WebP, GIF" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "upload error" }, { status: 500 });
  }
}
