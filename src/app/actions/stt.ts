"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { experimental_transcribe as transcribe } from "ai";
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

export async function transcribeAudio(formData: FormData): Promise<STTResult> {
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

        // Validate audio file type
        const validTypes = [
            "audio/mp3",
            "audio/mpeg",
            "audio/wav",
            "audio/ogg",
            "audio/m4a",
            "audio/webm",
        ];

        console.log("STT audio file details:", {
            name: audioFile.name,
            type: audioFile.type,
            size: audioFile.size,
        });

        if (!validTypes.includes(audioFile.type)) {
            return { success: false, error: "Invalid audio format" };
        }

        const { env } = await getCloudflareContext();
        const db = await getDb();

        console.log("Starting transcription process...");

        // Check if API key is configured
        if (!env.OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY not configured");
            return { success: false, error: "OpenAI API key not configured" };
        }

        console.log("API key check passed");

        // Upload audio to R2 first
        console.log("Uploading to R2...");
        const uploadResult = await uploadToR2(audioFile, "stt-inputs");
        if (!uploadResult.success || !uploadResult.url) {
            console.error("R2 upload failed:", uploadResult);
            return { success: false, error: "Failed to upload audio" };
        }
        console.log("R2 upload successful:", uploadResult.url);

        // Read audio file as buffer
        const audioBuffer = await audioFile.arrayBuffer();
        console.log("Audio buffer size:", audioBuffer.byteLength);

        // Create OpenAI provider with API key
        const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });

        // Transcribe using AI SDK with OpenAI Whisper
        console.log("Starting OpenAI transcription...");

        const transcriptionPromise = transcribe({
            model: openai.transcription("whisper-1"),
            audio: new Uint8Array(audioBuffer),
        });

        // Add timeout (30 seconds)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(
                () => reject(new Error("Transcription timeout after 30s")),
                30000,
            );
        });

        const result = (await Promise.race([
            transcriptionPromise,
            timeoutPromise,
        ])) as Awaited<ReturnType<typeof transcribe>>;

        console.log("Transcription result:", result);

        // Save to outputs table
        console.log("Saving to database...");
        const [output] = await db
            .insert(outputsSchema)
            .values({
                userId: session.user.id,
                type: "STT",
                voiceId: null,
                inputText: result.text,
                audioUrl: uploadResult.url,
                duration: result.durationInSeconds || 0,
            })
            .returning();

        console.log("Database save successful, output ID:", output.id);
        console.log("=== transcribeAudio completed successfully ===");

        return {
            success: true,
            data: {
                id: output.id,
                text: result.text,
                audioUrl: uploadResult.url as string,
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
