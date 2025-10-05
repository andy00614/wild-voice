"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Star } from "lucide-react";
import type { Voice } from "@/modules/voices/schemas/voice.schema";

interface VoiceLibraryProps {
    voices: Voice[];
    selectedVoiceId: number | null;
    onVoiceSelect: (voiceId: number) => void;
}

export function VoiceLibrary({ voices, selectedVoiceId, onVoiceSelect }: VoiceLibraryProps) {
    return (
        <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Voice Library</h2>
                <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Create
                </Button>
            </div>

            <div className="space-y-2">
                {voices.map((voice) => (
                    <div
                        key={voice.id}
                        onClick={() => onVoiceSelect(voice.id)}
                        className={`p-3 rounded-lg border cursor-pointer ${
                            selectedVoiceId === voice.id
                                ? "bg-accent"
                                : "hover:bg-accent/50"
                        }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-medium">{voice.name}</h3>
                            <div className="flex items-center gap-1 text-sm">
                                <Star className="w-4 h-4 fill-current" />
                                <span>{voice.rating}</span>
                            </div>
                        </div>
                        {voice.category && (
                            <Badge variant="secondary" className="text-xs">
                                {voice.category}
                            </Badge>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
}
