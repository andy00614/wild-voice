"use server";

import { fal } from "@fal-ai/client";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { uploadToR2 } from "@/lib/r2";
import { getSession } from "@/modules/auth/utils/auth-utils";
import { outputsSchema } from "@/modules/outputs/schemas/output.schema";

interface STTResult {
    success: boolean;
    data?: {
        id: number;
        text: string;
        audioUrl: string;
        createdAt: Date;
    };
    error?: string;
}

export async function transcribeAudio(
    formData: FormData,
): Promise<STTResult> {
    console.log("=== transcribeAudio called ===");

    try {
        const session = await getSession();
        console.log("Session check:", session?.user?.id);

        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const audioFile = formData.get("audio") as File;
        console.log("Audio file received:", audioFile?.name, audioFile?.type);

        if (!audioFile) {
            return { success: false, error: "No audio file provided" };
        }

        // Validate audio file type (FAL Wizper supports: mp3, mp4, mpeg, mpga, m4a, wav, webm)
        const validTypes = [
            "audio/mp3",
            "audio/mpeg",
            "audio/wav",
            "audio/webm",
            "audio/m4a",
            "audio/mp4",
        ];

        console.log("STT audio file details:", {
            name: audioFile.name,
            type: audioFile.type,
            size: audioFile.size,
        });

        if (!validTypes.includes(audioFile.type)) {
            return { success: false, error: "Invalid audio format. Supported: MP3, WAV, WebM, M4A" };
        }

        const { env } = await getCloudflareContext();
        const db = await getDb();

        console.log("Starting transcription process...");

        // Check if API key is configured
        if (!env.FAL_KEY) {
            console.error("FAL_KEY not configured");
            return { success: false, error: "FAL API key not configured" };
        }

        console.log("API key check passed");

        // Configure FAL client
        fal.config({
            credentials: env.FAL_KEY,
        });

        // Transcribe using FAL Wizper API with direct file upload
        console.log("Starting FAL transcription...");
        console.log("Using direct file upload (FAL SDK will auto-upload)");

        const result = await fal.subscribe("fal-ai/wizper", {
            input: {
                audio_url: audioFile, // SDK accepts File/Blob directly and auto-uploads
            },
            logs: true,
            onQueueUpdate: (update: any) => {
                console.log("Queue update:", update.status);
            },
        });

        // Upload to R2 for storage (to save audio URL in database)
        console.log("Uploading to R2 for storage...");
        const uploadResult = await uploadToR2(audioFile, "stt-inputs");
        if (!uploadResult.success || !uploadResult.url) {
            console.warn("Failed to upload audio to R2, but transcription succeeded");
        }

        console.log("Transcription result:", result);

        const transcriptionText = (result as any).text || (result as any).data?.text || "";

        if (!transcriptionText) {
            console.error("No transcription text found in result:", result);
            return { success: false, error: "Failed to extract transcription text" };
        }

        // Save to outputs table
        console.log("Saving to database...");
        const [output] = await db
            .insert(outputsSchema)
            .values({
                userId: session.user.id,
                type: "STT",
                voiceId: null,
                inputText: transcriptionText,
                audioUrl: uploadResult.url || null,
                duration: 0,
            })
            .returning();

        console.log("Database save successful, output ID:", output.id);
        console.log("=== transcribeAudio completed successfully ===");

        return {
            success: true,
            data: {
                id: output.id,
                text: transcriptionText,
                audioUrl: (uploadResult.url as string) || "",
                createdAt: output.createdAt,
            },
        };
    } catch (error) {
        console.error("STT transcription error:", error);

        // Log detailed error information
        if (error instanceof Error) {
            console.error("Error name:", error.name);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to transcribe audio",
        };
    }
}
