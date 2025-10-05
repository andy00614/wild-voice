import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import handleApiError from "@/lib/api-error";
import { successResponse, unauthorizedResponse } from "@/lib/api-response";
import { getSession } from "@/modules/auth/utils/auth-utils";
import { outputsSchema } from "@/modules/outputs/schemas/output.schema";
import { voicesSchema } from "@/modules/voices/schemas/voice.schema";

export const GET = async () => {
    try {
        const session = await getSession();
        if (!session?.user) {
            return unauthorizedResponse();
        }

        const db = await getDb();

        // Get recent outputs for current user with voice info
        const outputs = await db
            .select({
                id: outputsSchema.id,
                userId: outputsSchema.userId,
                type: outputsSchema.type,
                voiceId: outputsSchema.voiceId,
                inputText: outputsSchema.inputText,
                audioUrl: outputsSchema.audioUrl,
                duration: outputsSchema.duration,
                createdAt: outputsSchema.createdAt,
                voice: {
                    name: voicesSchema.name,
                },
            })
            .from(outputsSchema)
            .leftJoin(voicesSchema, eq(outputsSchema.voiceId, voicesSchema.id))
            .where(eq(outputsSchema.userId, session.user.id))
            .orderBy(desc(outputsSchema.createdAt))
            .limit(10);

        return successResponse(outputs, "Outputs fetched successfully");
    } catch (error) {
        return handleApiError(error);
    }
};
