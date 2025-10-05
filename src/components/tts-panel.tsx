"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { generateTTS } from "@/app/actions/tts";
import type { Voice } from "@/modules/voices/schemas/voice.schema";

interface TTSPanelProps {
    selectedVoice: Voice | null;
    onGenerateSuccess: () => void;
}

export function TTSPanel({ selectedVoice, onGenerateSuccess }: TTSPanelProps) {
    const [text, setText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!selectedVoice) {
            toast.error("Please select a voice first");
            return;
        }

        if (!text.trim()) {
            toast.error("Please enter some text");
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateTTS(text.trim(), selectedVoice.id);

            if (result.success && result.data) {
                setAudioUrl(result.data.audioUrl);
                toast.success("Speech generated successfully!");
                onGenerateSuccess();
            } else {
                toast.error(result.error || "Failed to generate speech");
            }
        } catch (error) {
            toast.error("An error occurred");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="p-6">
            <div className="flex flex-col items-center mb-6">
                <Volume2 className="w-12 h-12 mb-2" />
                <h2 className="text-2xl font-semibold">Text to Speech</h2>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Your Text</label>
                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the text you want to convert to speech..."
                    className="min-h-[150px]"
                />
            </div>

            <div className="mb-4 p-3 bg-muted rounded-lg flex items-center gap-2">
                <span className="text-sm">Selected Voice:</span>
                <span className="text-sm font-medium">
                    {selectedVoice ? selectedVoice.name : "None"}
                </span>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating || !selectedVoice} className="w-full">
                {isGenerating ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Generate Speech
                    </>
                )}
            </Button>

            {audioUrl && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm mb-2">Audio generated successfully!</p>
                    <audio controls className="w-full">
                        <source src={audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
        </Card>
    );
}
