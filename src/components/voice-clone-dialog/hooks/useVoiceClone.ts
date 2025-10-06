import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cloneVoice } from "@/app/actions/voice-clone";
import { validateAudioFile } from "../utils/file-validation";

export function useVoiceClone(onSuccess: () => void) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (audioPreview) {
                URL.revokeObjectURL(audioPreview);
            }
        };
    }, [audioPreview]);

    // Handle file upload
    const handleFileChange = (file: File | null) => {
        if (!file) return;

        const validationError = validateAudioFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setAudioFile(file);
        setError(null);
        setAudioPreview(URL.createObjectURL(file));
    };

    // Set recorded audio preview (cleans up old preview first)
    const setRecordedPreview = useCallback((blob: Blob | null) => {
        setAudioPreview((prevPreview) => {
            // Clean up old preview URL
            if (prevPreview) {
                URL.revokeObjectURL(prevPreview);
            }

            if (blob) {
                return URL.createObjectURL(blob);
            }
            return null;
        });
    }, []);

    // Form submission
    const handleSubmit = async (recordedBlob: Blob | null) => {
        if (!name.trim()) {
            setError("Please enter voice name");
            return false;
        }

        if (!audioFile && !recordedBlob) {
            setError("Please upload an audio file or record voice");
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("name", name);
            if (category) formData.append("category", category);

            if (recordedBlob) {
                // recordedBlob is already MP3 (converted on client-side)
                const recordedFile = new File(
                    [recordedBlob],
                    `recording-${Date.now()}.mp3`,
                    { type: "audio/mp3" }
                );
                formData.append("audio", recordedFile);
            } else if (audioFile) {
                formData.append("audio", audioFile);
            }

            const result = await cloneVoice(formData);

            if (result?.success) {
                onSuccess();
                router.refresh();
                resetForm();
                return true;
            } else {
                setError(result?.error || "Voice cloning failed");
                return false;
            }
        } catch (err) {
            setError("An error occurred. Please try again");
            console.error("Clone error:", err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setName("");
        setCategory("");
        setAudioFile(null);
        setAudioPreview(null);
    };

    return {
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
        resetForm,
    };
}
