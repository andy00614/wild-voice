import { useState, useRef, useEffect } from "react";
import type { ReadingPrompt } from "../types";

export function useAudioRecording() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [readingPrompt, setReadingPrompt] = useState<ReadingPrompt | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup recording timer
    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, []);

    // Generate reading prompt with numbers, date, and phone
    const generateReadingPrompt = () => {
        // Generate 5 random numbers (0-99)
        const numbers = Array.from({ length: 5 }, () =>
            Math.floor(Math.random() * 100)
        );

        // Generate random date
        const year = 2020 + Math.floor(Math.random() * 5); // 2020-2024
        const month = 1 + Math.floor(Math.random() * 12); // 1-12
        const day = 1 + Math.floor(Math.random() * 28); // 1-28 (safe for all months)
        const date = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

        // Generate random phone number (format: XXX-XXXX-XXXX)
        const part1 = 130 + Math.floor(Math.random() * 70); // 130-199
        const part2 = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        const part3 = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        const phoneNumber = `${part1}-${part2}-${part3}`;

        setReadingPrompt({ numbers, date, phoneNumber });
    };

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
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingDuration(0);

            recordingTimerRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            throw new Error("Cannot access microphone. Please check permissions");
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            // Stop the timer first
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }

            // Stop the media recorder (this triggers onstop callback)
            mediaRecorderRef.current.stop();

            // Set recording to false
            setIsRecording(false);
        }
    };

    // Reset recording (also triggers preview refresh)
    const resetRecording = () => {
        setRecordedBlob(null);
        setRecordingDuration(0);
        setReadingPrompt(null);
    };

    return {
        isRecording,
        recordedBlob,
        recordingDuration,
        readingPrompt,
        formatTime,
        generateReadingPrompt,
        startRecording,
        stopRecording,
        resetRecording,
    };
}
