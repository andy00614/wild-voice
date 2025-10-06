import { Mic, Square, Calendar, Phone, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReadingPrompt } from "./types";

interface RecordingTabProps {
    isRecording: boolean;
    recordedBlob: Blob | null;
    recordingDuration: number;
    readingPrompt: ReadingPrompt | null;
    formatTime: (seconds: number) => string;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onResetRecording: () => void;
    disabled?: boolean;
}

export function RecordingTab({
    isRecording,
    recordedBlob,
    recordingDuration,
    readingPrompt,
    formatTime,
    onStartRecording,
    onStopRecording,
    onResetRecording,
    disabled,
}: RecordingTabProps) {
    return (
        <div className="space-y-4">
            <div className="border-2 rounded-lg p-6 text-center">
                {/* Initial state */}
                {!isRecording && !recordedBlob && (
                    <div>
                        <Mic className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-4">
                            Click to start recording (at least 10 seconds
                            recommended)
                        </p>
                        <Button
                            type="button"
                            onClick={onStartRecording}
                            disabled={disabled}
                        >
                            <Mic className="mr-2 h-4 w-4" />
                            Start Recording
                        </Button>
                    </div>
                )}

                {/* Recording state */}
                {isRecording && (
                    <div>
                        {/* Reading prompt */}
                        {readingPrompt && (
                            <div className="bg-primary/10 rounded-lg p-4 mb-4 space-y-3">
                                <p className="text-xs text-muted-foreground mb-3">
                                    Read the following slowly and clearly:
                                </p>

                                {/* Numbers */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                        <Hash className="w-3 h-3" />
                                        <span>Numbers:</span>
                                    </div>
                                    <div className="flex gap-2 justify-center items-center flex-wrap">
                                        {readingPrompt.numbers.map((num, idx) => (
                                            <span
                                                key={idx}
                                                className="text-2xl font-bold text-primary"
                                            >
                                                {num}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        <span>Date:</span>
                                    </div>
                                    <div className="text-xl font-semibold text-primary">
                                        {readingPrompt.date}
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                        <Phone className="w-3 h-3" />
                                        <span>Phone:</span>
                                    </div>
                                    <div className="text-xl font-semibold text-primary font-mono">
                                        {readingPrompt.phoneNumber}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-center mb-4">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2" />
                            <span className="text-sm font-medium">
                                Recording...
                            </span>
                        </div>
                        <p className="text-2xl font-bold mb-4">
                            {formatTime(recordingDuration)}
                        </p>
                        <Button
                            type="button"
                            onClick={onStopRecording}
                            variant="destructive"
                        >
                            <Square className="mr-2 h-4 w-4" />
                            Stop Recording
                        </Button>
                    </div>
                )}

                {/* Recorded state */}
                {!isRecording && recordedBlob && (
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">
                            Duration: {formatTime(recordingDuration)}
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={onResetRecording}
                            >
                                Re-record
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
