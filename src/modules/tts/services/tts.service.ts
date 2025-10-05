/**
 * TTS Service - 共享业务逻辑层
 * 可被 Server Actions 和 API Routes 复用
 */

import { getDb } from "@/db";
import { voicesSchema } from "@/modules/voices/schemas/voice.schema";
import { outputsSchema } from "@/modules/outputs/schemas/output.schema";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createFal } from "@ai-sdk/fal";
import { experimental_generateSpeech as generateSpeech } from "ai";
import { uploadToR2 } from "@/lib/r2";

interface TTSOptions {
    text: string;
    voiceId: number;
    userId: string;
    speed?: number;
    pitch?: number;
    emotion?: string;
}

interface TTSResult {
    id: number;
    audioUrl: string;
    voice: string;
    text: string;
    createdAt: Date;
}

/**
 * 核心 TTS 生成逻辑
 * 被 Server Action 和 API Route 共同调用
 */
export async function generateTTSAudio(options: TTSOptions): Promise<TTSResult> {
    const { text, voiceId, userId, speed = 1.0, pitch = 0, emotion } = options;

    const { env } = await getCloudflareContext();
    const db = await getDb();

    // Get voice from database
    const [voice] = await db
        .select()
        .from(voicesSchema)
        .where(eq(voicesSchema.id, voiceId))
        .limit(1);

    if (!voice) {
        throw new Error("Voice not found");
    }

    // Check access permission
    if (!voice.isPublic && voice.userId !== userId) {
        throw new Error("You don't have access to this voice");
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
                    speed: speed,
                    vol: 1.0,
                    pitch: pitch,
                    ...(emotion && { emotion: emotion }),
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

    if (!uploadResult.success || !uploadResult.url) {
        throw new Error("Failed to upload audio to storage");
    }

    // Save to outputs table
    const [output] = await db
        .insert(outputsSchema)
        .values({
            userId: userId,
            type: "TTS",
            voiceId: voice.id,
            inputText: text,
            audioUrl: uploadResult.url,
            duration: 0,
        })
        .returning();

    return {
        id: output.id,
        audioUrl: uploadResult.url,
        voice: voice.name,
        text: text,
        createdAt: output.createdAt,
    };
}
