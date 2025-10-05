"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Download } from "lucide-react";
import type { Output } from "@/modules/outputs/schemas/output.schema";

interface OutputWithVoice extends Output {
    voice: {
        name: string;
    } | null;
}

interface RecentOutputsProps {
    outputs: OutputWithVoice[];
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMins = Math.floor(diffInMs / 60000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins} min ago`;
    if (diffInMins < 1440) return `${Math.floor(diffInMins / 60)} hour ago`;
    return `${Math.floor(diffInMins / 1440)} day ago`;
}

export function RecentOutputs({ outputs }: RecentOutputsProps) {
    return (
        <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Recent Outputs</h2>

            <div className="space-y-3">
                {outputs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No outputs yet</p>
                ) : (
                    outputs.map((output) => (
                        <div key={output.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant={output.type === "TTS" ? "default" : "secondary"}>
                                    {output.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {formatTimeAgo(output.createdAt)}
                                </span>
                            </div>

                            <p className="text-sm mb-2 line-clamp-2">
                                {output.inputText || "No text"}
                            </p>

                            {output.voice && (
                                <p className="text-xs text-muted-foreground mb-2">
                                    Voice: {output.voice.name}
                                    {output.duration && ` • Duration: ${output.duration}s`}
                                </p>
                            )}

                            {output.audioUrl && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            const audio = new Audio(output.audioUrl!);
                                            audio.play();
                                        }}
                                    >
                                        <Play className="w-3 h-3 mr-1" />
                                        Play
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            window.open(output.audioUrl!, "_blank");
                                        }}
                                    >
                                        <Download className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}
