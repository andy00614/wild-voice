"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Star } from "lucide-react";
import type { Voice } from "@/modules/voices/schemas/voice.schema";
import { VoiceCloneDialog } from "./voice-clone-dialog/index";

interface VoiceLibraryProps {
    voices: Voice[];
    selectedVoiceId: number | null;
    onVoiceSelect: (voiceId: number) => void;
}

export function VoiceLibrary({ voices, selectedVoiceId, onVoiceSelect }: VoiceLibraryProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Voice Library</h2>
                <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Create
                </Button>
            </div>

            {/* Mobile: horizontal scroll, Desktop: vertical list */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:space-y-2 lg:overflow-x-visible lg:pb-0">
                {voices.map((voice) => (
                    <div
                        key={voice.id}
                        onClick={() => onVoiceSelect(voice.id)}
                        className={`p-3 rounded-lg border cursor-pointer flex-shrink-0 w-48 lg:w-auto ${
                            selectedVoiceId === voice.id
                                ? "bg-accent"
                                : "hover:bg-accent/50"
                        }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-medium truncate">{voice.name}</h3>
                            <div className="flex items-center gap-1 text-sm flex-shrink-0 ml-2">
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

            <VoiceCloneDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </Card>
    );
}
