"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Square, Upload, Loader2 } from "lucide-react";
import { transcribeAudio } from "@/app/actions/stt";

export function STTPanel() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);
    const [transcription, setTranscription] = useState("");
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [error, setError] = useState("");
    const [recordingDuration, setRecordingDuration] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Start recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/webm",
                });
                setRecordedBlob(audioBlob);

                // Create preview URL
                if (audioPreview) {
                    URL.revokeObjectURL(audioPreview);
                }
                const url = URL.createObjectURL(audioBlob);
                setAudioPreview(url);

                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingDuration(0);
            setError("");

            recordingTimerRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            setError("Cannot access microphone. Please check permissions");
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        }
    };

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioFile(file);
            setRecordedBlob(null);

            // Create preview URL
            if (audioPreview) {
                URL.revokeObjectURL(audioPreview);
            }
            const url = URL.createObjectURL(file);
            setAudioPreview(url);
            setError("");
        }
    };

    // Handle transcription
    const handleTranscribe = async () => {
        setIsTranscribing(true);
        setError("");
        setTranscription("");

        try {
            const formData = new FormData();

            if (recordedBlob) {
                const file = new File(
                    [recordedBlob],
                    `recording-${Date.now()}.webm`,
                    { type: "audio/webm" }
                );
                formData.append("audio", file);
            } else if (audioFile) {
                formData.append("audio", audioFile);
            } else {
                setError("Please record or upload an audio file first");
                setIsTranscribing(false);
                return;
            }

            const result = await transcribeAudio(formData);

            if (result.success && result.data) {
                setTranscription(result.data.text);
            } else {
                setError(result.error || "Failed to transcribe audio");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setIsTranscribing(false);
        }
    };

    // Reset
    const handleReset = () => {
        setRecordedBlob(null);
        setAudioFile(null);
        if (audioPreview) {
            URL.revokeObjectURL(audioPreview);
        }
        setAudioPreview(null);
        setTranscription("");
        setError("");
        setRecordingDuration(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <Card className="p-6">
            <div className="flex flex-col items-center mb-6">
                <Mic className="w-12 h-12 text-primary mb-2" />
                <h2 className="text-2xl font-semibold">Speech to Text</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Record or upload audio to transcribe
                </p>
            </div>

            <div className="space-y-4">
                {/* Recording/Upload Section */}
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        {!isRecording ? (
                            <Button
                                onClick={startRecording}
                                className="flex-1"
                                variant="default"
                                disabled={isTranscribing}
                            >
                                <Mic className="w-4 h-4 mr-2" />
                                Start Recording
                            </Button>
                        ) : (
                            <Button
                                onClick={stopRecording}
                                className="flex-1"
                                variant="destructive"
                            >
                                <Square className="w-4 h-4 mr-2" />
                                Stop ({formatTime(recordingDuration)})
                            </Button>
                        )}

                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            disabled={isRecording || isTranscribing}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {/* Audio Preview */}
                    {audioPreview && (
                        <div className="space-y-2">
                            <audio
                                src={audioPreview}
                                controls
                                className="w-full"
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleTranscribe}
                                    disabled={isTranscribing}
                                    className="flex-1"
                                >
                                    {isTranscribing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Transcribing...
                                        </>
                                    ) : (
                                        "Transcribe"
                                    )}
                                </Button>
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    disabled={isTranscribing}
                                >
                                    Reset
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                        {error}
                    </div>
                )}

                {/* Transcription Result */}
                {transcription && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Transcription:
                        </label>
                        <Textarea
                            value={transcription}
                            readOnly
                            className="min-h-[120px] resize-none"
                        />
                    </div>
                )}
            </div>
        </Card>
    );
}
