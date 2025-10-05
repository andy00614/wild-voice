"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function VoiceModeTabs() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode") || "tts";

    const handleModeChange = (newMode: string) => {
        router.push(`/dashboard?mode=${newMode}`);
    };

    return (
        <div className="flex gap-2 mb-6">
            <Button
                onClick={() => handleModeChange("tts")}
                variant={mode === "tts" ? "default" : "outline"}
            >
                Text to Speech
            </Button>
            <Button
                onClick={() => handleModeChange("stt")}
                variant={mode === "stt" ? "default" : "outline"}
            >
                Speech to Text
            </Button>
        </div>
    );
}
