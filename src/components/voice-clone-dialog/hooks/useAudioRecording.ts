import { registerMp3Encoder } from "@mediabunny/mp3-encoder";
import { useEffect, useRef, useState } from "react";
import { AudioRecorder, convertWebMToMP3, formatTime } from "@/lib/audio";
import type { ReadingPrompt } from "../types";

export function useAudioRecording() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [readingPrompt, setReadingPrompt] = useState<ReadingPrompt | null>(
        null,
    );
    const [isConverting, setIsConverting] = useState(false);

    const recorderRef = useRef<AudioRecorder | null>(null);
    const recordingTimerRef = useRef<number | null>(null);

    // Register MP3 encoder once
    useEffect(() => {
        registerMp3Encoder();
    }, []);

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
            Math.floor(Math.random() * 100),
        );

        // Generate random date
        const year = 2020 + Math.floor(Math.random() * 5); // 2020-2024
        const month = 1 + Math.floor(Math.random() * 12); // 1-12
        const day = 1 + Math.floor(Math.random() * 28); // 1-28 (safe for all months)
        const date = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

        // Generate random phone number (format: XXX-XXXX-XXXX)
        const part1 = 130 + Math.floor(Math.random() * 70); // 130-199
        const part2 = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0");
        const part3 = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0");
        const phoneNumber = `${part1}-${part2}-${part3}`;

        setReadingPrompt({ numbers, date, phoneNumber });
    };

    // Start recording
    const startRecording = async () => {
        try {
            recorderRef.current = new AudioRecorder();

            await recorderRef.current.start({
                onStop: async (webmBlob) => {
                    setIsConverting(true);
                    try {
                        const mp3Blob = await convertWebMToMP3(webmBlob);
                        setRecordedBlob(mp3Blob);
                    } catch (error) {
                        console.error("Failed to convert to MP3:", error);
                        setRecordedBlob(webmBlob);
                    } finally {
                        setIsConverting(false);
                    }
                },
            });

            setIsRecording(true);
            setRecordingDuration(0);

            recordingTimerRef.current = window.setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            throw new Error(
                "Cannot access microphone. Please check permissions",
            );
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (recorderRef.current && isRecording) {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }

            recorderRef.current.stop();
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
        isConverting,
        formatTime,
        generateReadingPrompt,
        startRecording,
        stopRecording,
        resetRecording,
    };
}
