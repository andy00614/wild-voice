"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
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
    const [mode, setMode] = useState("tts");

    useEffect(() => {
        setMode(searchParams.get("mode") || "tts");
    }, [searchParams]);
    const [selectedVoiceId, setSelectedVoiceId] = useState<number | null>(
        voices.length > 0 ? voices[0].id : null,
    );
    const [outputs, setOutputs] = useState(initialOutputs);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const selectedVoice = voices.find((v) => v.id === selectedVoiceId) || null;

    const handleGenerateSuccess = async () => {
        // Refresh outputs list using Server Action
        setIsRefreshing(true);
        try {
            const refreshedOutputs = await getRecentOutputs();
            setOutputs(refreshedOutputs);
        } catch (error) {
            console.error("Failed to refresh outputs:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12">
            {/* Voice Library - Mobile: horizontal scroll, Tablet+: sidebar */}
            <div className="lg:col-span-3">
                <VoiceLibrary
                    voices={voices}
                    selectedVoiceId={selectedVoiceId}
                    onVoiceSelect={setSelectedVoiceId}
                />
            </div>

            {/* TTS/STT Panel - Always full width in its context */}
            <div className="lg:col-span-6">
                {mode === "tts" ? (
                    <TTSPanel
                        selectedVoice={selectedVoice}
                        onGenerateSuccess={handleGenerateSuccess}
                    />
                ) : (
                    <STTPanel />
                )}
            </div>

            {/* Recent Outputs - Mobile: collapsible, Tablet+: sidebar */}
            <div className="lg:col-span-3">
                <RecentOutputs outputs={outputs} isLoading={isRefreshing} />
            </div>
        </div>
    );
}
