"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import handleApiError from "@/lib/api-error";
import { uploadToR2 } from "@/lib/r2";
import { getSession } from "@/modules/auth/utils/auth-utils";
import { voicesSchema } from "@/modules/voices/schemas/voice.schema";

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

        // 验证音频文件类型
        const validTypes = [
            "audio/mp3",
            "audio/mpeg",
            "audio/wav",
            "audio/ogg",
            "audio/m4a",
            "audio/webm",
        ];

        console.log("Audio file details:", {
            name: audioFile.name,
            type: audioFile.type,
            size: audioFile.size,
        });

        if (!validTypes.includes(audioFile.type)) {
            return { success: false, error: "Invalid audio format" };
        }
        const uploadResult = await uploadToR2(audioFile, "voice-samples");
        if (!uploadResult.success || !uploadResult.url) {
            return { success: false, error: "Failed to upload audio" };
        }

        console.log("Uploaded audio URL:", uploadResult.url);
        const { env } = await getCloudflareContext();

        console.log("uploadResult.url", uploadResult.url);

        const response = await fetch(
            "https://fal.run/fal-ai/minimax/voice-clone",
            {
                method: "POST",
                headers: {
                    Authorization: `Key ${env.FAL_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    audio_url: uploadResult.url,
                    // 可选：生成预览
                    // text: "这是一个语音克隆的测试"
                }),
            },
        );

        if (!response.ok) {
            const error = await response.text();
            console.error("FAL API error:", error);
            return { success: false, error: "Voice cloning failed" };
        }

        const result = (await response.json()) as {
            custom_voice_id: string;
            sample_audio_url: string;
        };
        const customVoiceId = result.custom_voice_id; // 重要！这是返回的 voice_id
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
        handleApiError(error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
