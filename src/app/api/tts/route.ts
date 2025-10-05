import { createFal } from "@ai-sdk/fal";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { experimental_generateSpeech as generateSpeech } from "ai";
import { eq } from "drizzle-orm";
import { getDb, outputsSchema, voicesSchema } from "@/db";
import handleApiError from "@/lib/api-error";
import {
    errorResponse,
    notFoundResponse,
    successResponse,
    unauthorizedResponse,
} from "@/lib/api-response";
import { uploadToR2 } from "@/lib/r2";
import { getSession } from "@/modules/auth/utils/auth-utils";

export const POST = async (request: Request) => {
    try {
        // 1. 认证检查
        const session = await getSession();
        if (!session?.user) {
            return unauthorizedResponse();
        }

        // 2. 获取环境变量
        const { env } = await getCloudflareContext();

        // 3. 解析请求
        const body = await request.json();
        const { text, voiceId, speed = 1.0, pitch = 0, emotion } = body as any;

        if (!text || !voiceId) {
            return errorResponse("text 和 voiceId 是必填字段", 400);
        }

        // 4. 从数据库获取 voice 信息
        const db = await getDb();
        const [voice] = await db
            .select()
            .from(voicesSchema)
            .where(eq(voicesSchema.id, voiceId))
            .limit(1);

        if (!voice) {
            return notFoundResponse("Voice not found");
        }

        // 检查权限：用户只能使用公共声音或自己的私有声音
        if (!voice.isPublic && voice.userId !== session.user.id) {
            return errorResponse("You don't have access to this voice", 403);
        }

        // 5. 创建带有 API Key 的 FAL provider
        const fal = createFal({
            apiKey: env.FAL_KEY,
        });

        console.log("Calling FAL TTS with:", {
            text: text.substring(0, 50),
            voiceId: voice.falVoiceId,
            speed,
            pitch,
            emotion,
        });

        // 6. 使用 AI SDK 调用 FAL TTS
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

        console.log("Audio generated successfully");

        // 7. 将音频上传到 R2
        const audioBuffer = Buffer.from(audio.uint8Array);
        const audioFile = new File([audioBuffer], `tts-${Date.now()}.mp3`, {
            type: "audio/mpeg",
        });

        const uploadResult = await uploadToR2(audioFile, "tts-outputs");

        if (!uploadResult.success) {
            return errorResponse("Failed to upload audio to storage", 500);
        }

        // 8. 保存记录到 outputs 表
        const [output] = await db
            .insert(outputsSchema)
            .values({
                userId: session.user.id,
                type: "TTS",
                voiceId: voice.id,
                inputText: text,
                audioUrl: uploadResult.url,
                duration: 0, // TODO: 计算实际时长
            })
            .returning();

        // 9. 返回结果
        return successResponse(
            {
                id: output.id,
                audioUrl: uploadResult.url,
                voice: voice.name,
                text: text,
                createdAt: output.createdAt,
            },
            "Speech generated successfully",
            201,
        );
    } catch (error) {
        console.error("TTS Error:", error);
        return handleApiError(error);
    }
};
