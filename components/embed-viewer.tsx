"use client";

import { useState } from "react";
import { Check, Copy, Code, FileText, Terminal } from "lucide-react";
import { RepoData } from "@/types/repo";
import { genHTML, genMarkdown, genReact } from "@/lib/generators";
import { EmbedConfig } from "@/types/embed";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmbedViewerProps {
  data: RepoData;
  config: EmbedConfig;
}

export function EmbedViewer({ data, config }: EmbedViewerProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("html");

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
        </div>
      </div>
    </div>
  );
}
