"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { getRecentOutputs } from "@/app/actions/outputs";
import type { Output } from "@/modules/outputs/schemas/output.schema";
import type { Voice } from "@/modules/voices/schemas/voice.schema";
import { RecentOutputs } from "./recent-outputs";
import { STTPanel } from "./stt-panel";
import { TTSPanel } from "./tts-panel";
import { VoiceLibrary } from "./voice-library";

interface OutputWithVoice extends Output {
    voice: {
        name: string;
    } | null;
}

interface VoiceDashboardProps {
    voices: Voice[];
    outputs: OutputWithVoice[];
}

export function VoiceDashboard({
    voices,
    outputs: initialOutputs,
}: VoiceDashboardProps) {
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode") || "tts";
    const [selectedVoiceId, setSelectedVoiceId] = useState<number | null>(
        voices.length > 0 ? voices[0].id : null,
    );
    const [outputs, setOutputs] = useState(initialOutputs);

    const selectedVoice = voices.find((v) => v.id === selectedVoiceId) || null;

    const handleGenerateSuccess = async () => {
        // Refresh outputs list using Server Action
        try {
            const refreshedOutputs = await getRecentOutputs();
            setOutputs(refreshedOutputs);
        } catch (error) {
            console.error("Failed to refresh outputs:", error);
        }
    };

    return (
        <div className="grid grid-cols-12 gap-4">
            {/* Left: Voice Library */}
            <div className="col-span-3">
                <VoiceLibrary
                    voices={voices}
                    selectedVoiceId={selectedVoiceId}
                    onVoiceSelect={setSelectedVoiceId}
                />
            </div>

            {/* Middle: TTS/STT Panel */}
            <div className="col-span-6">
                {mode === "tts" ? (
                    <TTSPanel
                        selectedVoice={selectedVoice}
                        onGenerateSuccess={handleGenerateSuccess}
                    />
                ) : (
                    <STTPanel />
                )}
            </div>

            {/* Right: Recent Outputs */}
            <div className="col-span-3">
                <RecentOutputs outputs={outputs} />
            </div>
        </div>
    );
}
