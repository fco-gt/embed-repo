import { type NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/mongo";
import WeebhookModel from "@/models/Weebhook";
import { fetchRepo } from "@/lib/github";
import { genHTML } from "@/lib/generators";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connect();

    const webhook = await WeebhookModel.findById(id);

    if (!webhook) {
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <title>Webhook Not Found</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .error {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 { color: #ef4444; margin: 0 0 16px 0; }
    p { color: #666; margin: 0; }
  </style>
</head>
<body>
  <div class="error">
    <h1>404 - Webhook Not Found</h1>
    <p>The requested embed webhook does not exist.</p>
  </div>
</body>
</html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // Fetch fresh data from GitHub
    const repoData = await fetchRepo(webhook.owner, webhook.repo);

    // Generate HTML with saved config and live data
    const html = genHTML(repoData, webhook.embedConfig);

    // Update lastAccessed timestamp (non-blocking)
    WeebhookModel.findByIdAndUpdate(id, { lastAccessed: new Date() }).catch(
      () => {}
    );

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "server error";
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <title>Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .error {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 { color: #ef4444; margin: 0 0 16px 0; }
    p { color: #666; margin: 0; }
  </style>
</head>
<body>
  <div class="error">
    <h1>Error Loading Embed</h1>
    <p>${message}</p>
  </div>
</body>
</html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
