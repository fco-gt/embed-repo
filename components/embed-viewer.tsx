"use client";

import { useState } from "react";
import { Check, Copy, Code, FileText, Terminal, Link2, Loader2 } from "lucide-react";
import { RepoData } from "@/types/repo";
import { genHTML, genMarkdown, genReact } from "@/lib/generators";
import { EmbedConfig, WebhookResponse } from "@/types/embed";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface EmbedViewerProps {
  data: RepoData;
  config: EmbedConfig;
}

export function EmbedViewer({ data, config }: EmbedViewerProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("html");
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [webhookCopied, setWebhookCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const content = {
    html: genHTML(data, config),
    markdown: genMarkdown(data, config),
    react: genReact(data, config),
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content[activeTab as keyof typeof content]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyWebhookUrl = async () => {
    if (webhookUrl) {
      await navigator.clipboard.writeText(webhookUrl);
      setWebhookCopied(true);
      setTimeout(() => setWebhookCopied(false), 2000);
    }
  };

  const createWebhook = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/weebhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: data.html_url,
          embedConfig: config,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create webhook");
      }

      const result = (await response.json()) as WebhookResponse;
      setWebhookUrl(result.webhookUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Preview</h3>
          <div
            className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm"
            dangerouslySetInnerHTML={{ __html: content.html }}
          />
        </div>

        {/* Code */}
        <div className="space-y-4">
          <Tabs defaultValue="html" onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between pb-2">
              <TabsList>
                <TabsTrigger value="html" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  HTML
                </TabsTrigger>
                <TabsTrigger value="markdown" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Markdown
                </TabsTrigger>
                <TabsTrigger value="react" className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  React
                </TabsTrigger>
              </TabsList>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="h-8"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-3 w-3 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="relative max-h-[300px] overflow-auto bg-muted/50 p-4">
                  <TabsContent value="html" className="mt-0">
                    <pre className="text-sm font-mono">
                      <code>{content.html}</code>
                    </pre>
                  </TabsContent>
                  <TabsContent value="markdown" className="mt-0">
                    <pre className="text-sm font-mono">
                      <code>{content.markdown}</code>
                    </pre>
                  </TabsContent>
                  <TabsContent value="react" className="mt-0">
                    <pre className="text-sm font-mono">
                      <code>{content.react}</code>
                    </pre>
                  </TabsContent>
                </div>
              </CardContent>
            </Card>
          </Tabs>

          {/* Webhook Section */}
          <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Dynamic Webhook</h4>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowDialog(true)}
                disabled={loading || !!webhookUrl}
              >
                <Link2 className="mr-2 h-3 w-3" />
                {webhookUrl ? "Created" : "Create Webhook"}
              </Button>
            </div>
            
            {webhookUrl && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Share this URL to display always-updated repo data:
                </p>
                <div className="flex gap-2">
                  <Input
                    value={webhookUrl}
                    readOnly
                    className="flex-1 font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyWebhookUrl}
                  >
                    {webhookCopied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Dynamic Webhook</DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>
                This will create a unique webhook URL that always serves fresh,
                real-time data from GitHub.
              </p>
              <p className="text-xs">
                <strong>Benefits:</strong>
              </p>
              <ul className="list-disc space-y-1 pl-5 text-xs">
                <li>Always shows current stars, forks, and issues</li>
                <li>No need to regenerate the embed code</li>
                <li>Can be embedded anywhere (HTML, iframes, etc.)</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                <strong>Privacy:</strong> Your repo URL and display preferences
                will be stored in our database.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={createWebhook} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Confirm & Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
