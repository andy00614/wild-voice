"use server";

import { fal } from "@fal-ai/client";
import { registerMp3Encoder } from "@mediabunny/mp3-encoder";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
    ALL_FORMATS,
    BlobSource,
    BufferTarget,
    Conversion,
    canEncodeAudio,
    Input,
    Mp3OutputFormat,
    Output,
} from "mediabunny";
import { getDb } from "@/db";
import { uploadToR2 } from "@/lib/r2";
import { getSession } from "@/modules/auth/utils/auth-utils";
import { voicesSchema } from "@/modules/voices/schemas/voice.schema";

const MP3_MIME_TYPES = new Set(["audio/mpeg", "audio/mp3"]);

function ensureMp3Metadata(file: File): File {
    const hasMp3Mime = MP3_MIME_TYPES.has(file.type);
    const hasMp3Extension = /\.mp3$/i.test(file.name);

    if (hasMp3Mime && hasMp3Extension) {
        return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "");
    const normalizedName = `${baseName}.mp3`;

    return new File([file], normalizedName, { type: "audio/mpeg" });
}

// Convert any audio format to MP3 (server-side, may fail with unsupported codecs like Opus)
async function convertToMP3(audioFile: File): Promise<File | null> {
    try {
        // Register MP3 encoder if not natively supported
        if (!(await canEncodeAudio("mp3"))) {
            registerMp3Encoder();
        }

        const input = new Input({
            source: new BlobSource(audioFile),
            formats: ALL_FORMATS,
        });

        const bufferTarget = new BufferTarget();
        const output = new Output({
            format: new Mp3OutputFormat(),
            target: bufferTarget,
        });

        const conversion = await Conversion.init({ input, output });

        // Check if conversion is valid (codec support, etc.)
        if (!conversion.isValid) {
            console.warn(
                "Conversion is invalid, discarded tracks:",
                conversion.discardedTracks,
            );
            return null;
        }

        await conversion.execute();

        const arrayBuffer = bufferTarget.buffer;
        if (!arrayBuffer) {
            throw new Error("MP3 conversion failed: no output buffer");
        }

        // Create a new File object with MP3 type
        const mp3Blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
        const baseName = audioFile.name.replace(/\.[^.]+$/, "");
        return new File([mp3Blob], `${baseName}.mp3`, {
            type: "audio/mpeg",
        });
    } catch (error) {
        console.error("Server-side MP3 conversion error:", error);
        return null;
    }
}

interface VoiceCloneResult {
    success: boolean;
    data?: {
        id: number;
        name: string;
        falVoiceId: string;
        sampleAudioUrl: string;
    };
    error?: string;
}

export async function cloneVoice(
    formData: FormData,
): Promise<VoiceCloneResult> {
    try {
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }
        const audioFile = formData.get("audio") as File;
        const name = formData.get("name") as string;
        const category = formData.get("category") as string | null;

        // 验证
        if (!audioFile || !name) {
            return { success: false, error: "Missing required fields" };
        }

        console.log("Original audio file details:", {
            name: audioFile.name,
            type: audioFile.type,
            size: audioFile.size,
        });

        // Convert to MP3 (FAL Voice Clone API requires MP3 or FLAC)
        console.log("Converting audio to MP3...");
        let processedAudioFile = audioFile;

        const isMp3 =
            MP3_MIME_TYPES.has(audioFile.type) || /\.mp3$/i.test(audioFile.name);

        console.log("Is original file MP3?", isMp3);

        if (!isMp3) {
            const convertedFile = await convertToMP3(audioFile);
            console.log("MP3 conversion result:", convertedFile);
            if (!convertedFile) {
                console.error("Failed to convert audio to MP3");
                return {
                    success: false,
                    error: "Audio conversion to MP3 failed. Please upload an MP3 file.",
                };
            }

            processedAudioFile = convertedFile;
            console.log("Successfully converted to MP3:", {
                name: processedAudioFile.name,
                type: processedAudioFile.type,
                size: processedAudioFile.size,
            });
        } else {
            processedAudioFile = ensureMp3Metadata(audioFile);
        }

        console.log("Processed audio file for upload:", {
            name: processedAudioFile.name,
            type: processedAudioFile.type,
            size: processedAudioFile.size,
        });
        const { env } = await getCloudflareContext();

        // Configure FAL client
        fal.config({
            credentials: env.FAL_KEY,
        });

        console.log("Starting voice cloning with FAL SDK...");
        console.log("Using direct file upload (FAL SDK will auto-upload)");

        // Call FAL voice clone API using SDK with direct File upload
        // FAL SDK will automatically upload the file
        const result = await fal.subscribe("fal-ai/minimax/voice-clone", {
            input: {
                audio_url: processedAudioFile, // SDK accepts File/Blob directly and auto-uploads
            },
            logs: true,
            onQueueUpdate: (update: any) => {
                console.log("Queue update:", update.status);
            },
        });

        console.log("Voice clone result:", result);

        // Upload to R2 for storage (to save sample audio URL in database)
        const uploadResult = await uploadToR2(
            processedAudioFile,
            "voice-samples",
        );
        if (!uploadResult.success || !uploadResult.url) {
            console.warn(
                "Failed to upload audio to R2, but voice cloning succeeded",
            );
        }

        const customVoiceId =
            (result as any).custom_voice_id ||
            (result as any).data?.custom_voice_id;

        if (!customVoiceId) {
            console.error("No custom_voice_id found in result:", result);
            return {
                success: false,
                error: "Failed to extract voice ID from response",
            };
        }

        console.log("Custom voice ID:", customVoiceId);
        const db = await getDb();

        const [voice] = await db
            .insert(voicesSchema)
            .values({
                name: name,
                category: category,
                falVoiceId: customVoiceId,
                sampleAudioUrl: uploadResult.url,
                userId: session.user.id,
                isPublic: false,
                rating: 0,
            })
            .returning();

        return {
            success: true,
            data: {
                id: voice.id,
                name: voice.name,
                falVoiceId: voice.falVoiceId!,
                sampleAudioUrl: voice.sampleAudioUrl!,
            },
        };
    } catch (error) {
        console.error("cloneVoice error:", error);

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
                    : "An unexpected error occurred",
        };
    }
}
