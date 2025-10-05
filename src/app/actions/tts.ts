"use server";

import { getSession } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import { voicesSchema } from "@/modules/voices/schemas/voice.schema";
import { outputsSchema } from "@/modules/outputs/schemas/output.schema";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createFal } from "@ai-sdk/fal";
import { generateSpeech } from "ai";
import { uploadToR2 } from "@/lib/r2";

interface TTSResult {
    success: boolean;
    data?: {
        id: number;
        audioUrl: string;
        voice: string;
        text: string;
        createdAt: Date;
    };
    error?: string;
}

export async function generateTTS(text: string, voiceId: number): Promise<TTSResult> {
    try {
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const { env } = await getCloudflareContext();
        const db = await getDb();

        // Get voice from database
        const [voice] = await db
            .select()
            .from(voicesSchema)
            .where(eq(voicesSchema.id, voiceId))
            .limit(1);

        if (!voice) {
            return { success: false, error: "Voice not found" };
        }

        if (!voice.isPublic && voice.userId !== session.user.id) {
            return { success: false, error: "You don't have access to this voice" };
        }

        // Create FAL provider with env API key
        const fal = createFal({ apiKey: env.FAL_KEY });

        // Generate speech using AI SDK
        const { audio } = await generateSpeech({
            model: fal.speech("fal-ai/minimax/speech-02-hd"),
            text: text,
            providerOptions: {
                fal: {
                    voice_setting: {
                        voice_id: voice.falVoiceId || "Wise_Woman",
                        speed: 1.0,
                        vol: 1.0,
                        pitch: 0,
                    },
                },
            },
        });

        // Upload to R2
        const audioBuffer = Buffer.from(audio.uint8Array);
        const audioFile = new File([audioBuffer], `tts-${Date.now()}.mp3`, {
            type: "audio/mpeg",
        });
        const uploadResult = await uploadToR2(audioFile, "tts-outputs");

        if (!uploadResult.success) {
            return { success: false, error: "Failed to upload audio to storage" };
        }

        // Save to outputs table
        const [output] = await db
            .insert(outputsSchema)
            .values({
                userId: session.user.id,
                type: "TTS",
                voiceId: voice.id,
                inputText: text,
                audioUrl: uploadResult.url,
                duration: 0,
            })
            .returning();

        return {
            success: true,
            data: {
                id: output.id,
                audioUrl: uploadResult.url,
                voice: voice.name,
                text: text,
                createdAt: output.createdAt,
            },
        };
    } catch (error) {
        console.error("TTS generation error:", error);
        return { success: false, error: "Failed to generate speech" };
    }
}
