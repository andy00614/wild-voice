"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAudioRecording } from "./hooks/useAudioRecording";
import { useVoiceClone } from "./hooks/useVoiceClone";
import type { VoiceCloneDialogProps } from "./types";
import { VoiceCloneForm } from "./voice-clone-form";

export function VoiceCloneDialog({
    open,
    onOpenChange,
}: VoiceCloneDialogProps) {
    const {
        name,
        setName,
        category,
        setCategory,
        audioFile,
        audioPreview,
        isLoading,
        error,
        setError,
        handleFileChange,
        setRecordedPreview,
        handleSubmit,
    } = useVoiceClone(() => onOpenChange(false));

    const {
        isRecording,
        recordedBlob,
        recordingDuration,
        readingPrompt,
        formatTime,
        generateReadingPrompt,
        startRecording,
        stopRecording,
        resetRecording,
    } = useAudioRecording();

    const handleStartRecording = async () => {
        generateReadingPrompt();
        setTimeout(async () => {
            try {
                await startRecording();
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Cannot access microphone",
                );
            }
        }, 100);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSubmit(recordedBlob);
    };

    // Update preview when recording changes
    if (recordedBlob && !audioPreview) {
        setRecordedPreview(recordedBlob);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Clone Voice</DialogTitle>
                    <DialogDescription>
                        Upload or record at least 10 seconds of audio sample to
                        clone
                    </DialogDescription>
                </DialogHeader>

                <VoiceCloneForm
                    name={name}
                    setName={setName}
                    category={category}
                    setCategory={setCategory}
                    audioFile={audioFile}
                    audioPreview={audioPreview}
                    isLoading={isLoading}
                    error={error}
                    onFileChange={handleFileChange}
                    isRecording={isRecording}
                    recordedBlob={recordedBlob}
                    recordingDuration={recordingDuration}
                    readingPrompt={readingPrompt}
                    formatTime={formatTime}
                    onStartRecording={handleStartRecording}
                    onStopRecording={stopRecording}
                    onResetRecording={resetRecording}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
