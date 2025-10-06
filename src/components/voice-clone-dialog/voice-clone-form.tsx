import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AudioSourceTabs } from "./audio-source-tabs";
import { AudioPreview } from "./audio-preview";
import type { ReadingPrompt } from "./types";

interface VoiceCloneFormProps {
    name: string;
    setName: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
    audioFile: File | null;
    audioPreview: string | null;
    isLoading: boolean;
    error: string | null;
    onFileChange: (file: File | null) => void;
    isRecording: boolean;
    recordedBlob: Blob | null;
    recordingDuration: number;
    readingPrompt: ReadingPrompt | null;
    formatTime: (seconds: number) => string;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onResetRecording: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

export function VoiceCloneForm({
    name,
    setName,
    category,
    setCategory,
    audioFile,
    audioPreview,
    isLoading,
    error,
    onFileChange,
    isRecording,
    recordedBlob,
    recordingDuration,
    readingPrompt,
    formatTime,
    onStartRecording,
    onStopRecording,
    onResetRecording,
    onSubmit,
    onCancel,
}: VoiceCloneFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Voice Name *</Label>
                <Input
                    id="name"
                    placeholder="e.g., My Voice"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                    id="category"
                    placeholder="e.g., Male, Female"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            <AudioSourceTabs
                audioFile={audioFile}
                onFileChange={onFileChange}
                isRecording={isRecording}
                recordedBlob={recordedBlob}
                recordingDuration={recordingDuration}
                readingPrompt={readingPrompt}
                formatTime={formatTime}
                onStartRecording={onStartRecording}
                onStopRecording={onStopRecording}
                onResetRecording={onResetRecording}
                disabled={isLoading}
            />

            {audioPreview && <AudioPreview audioUrl={audioPreview} />}

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="bg-muted text-muted-foreground text-xs p-3 rounded-md">
                💡 Tip: Cloned voices must be used at least once with TTS within
                7 days, or they will be automatically deleted
            </div>

            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isLoading ? "Cloning..." : "Clone Voice"}
                </Button>
            </div>
        </form>
    );
}
