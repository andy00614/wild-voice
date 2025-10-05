"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Download, Loader2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import type { Output } from "@/modules/outputs/schemas/output.schema";

interface OutputWithVoice extends Output {
    voice: {
        name: string;
    } | null;
}

interface RecentOutputsProps {
    outputs: OutputWithVoice[];
    isLoading?: boolean;
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

async function downloadAudio(url: string, filename: string) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);
        toast.success("Download started");
    } catch (error) {
        toast.error("Download failed");
        console.error("Download error:", error);
    }
}

export function RecentOutputs({ outputs, isLoading = false }: RecentOutputsProps) {
    const [playingId, setPlayingId] = useState<number | null>(null);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    const handleDownload = async (outputId: number, audioUrl: string, text: string) => {
        setDownloadingId(outputId);
        const filename = `tts-${text.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.mp3`;
        await downloadAudio(audioUrl, filename);
        setDownloadingId(null);
    };

    return (
        <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Outputs</h2>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>

            <div className="space-y-3">
                {outputs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        {isLoading ? "Loading..." : "No outputs yet"}
                    </p>
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
                                <div className="space-y-2">
                                    {playingId === output.id ? (
                                        <div className="space-y-2">
                                            <AudioPlayer
                                                src={output.audioUrl}
                                                autoPlay
                                                onEnded={() => setPlayingId(null)}
                                                showJumpControls={false}
                                                customAdditionalControls={[]}
                                                layout="horizontal-reverse"
                                            />
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => setPlayingId(null)}
                                            >
                                                <X className="w-3 h-3 mr-1" />
                                                Close
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setPlayingId(output.id)}
                                            >
                                                <Play className="w-3 h-3 mr-1" />
                                                Play
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={downloadingId === output.id}
                                                onClick={() => handleDownload(output.id, output.audioUrl!, output.inputText || "audio")}
                                            >
                                                {downloadingId === output.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Download className="w-3 h-3" />
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}
