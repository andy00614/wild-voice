import { eq, or } from "drizzle-orm";
import { getDb, voicesSchema } from "@/db";
import handleApiError from "@/lib/api-error";
import { successResponse, unauthorizedResponse } from "@/lib/api-response";
import { getSession } from "@/modules/auth/utils/auth-utils";
import { insertVoiceSchema } from "@/modules/voices/schemas/voice.schema";

export const GET = async () => {
    try {
        const session = await getSession();
        if (!session?.user) {
            return unauthorizedResponse();
        }
        const db = await getDb();
        const voices = await db
            .select()
            .from(voicesSchema)
            .where(
                or(
                    eq(voicesSchema.userId, session.user.id),
                    eq(voicesSchema.isPublic, true),
                ),
            )
            .orderBy(voicesSchema.createdAt);
        return successResponse(voices, "Voices fetched successfully"); // ✨ 简洁！
    } catch (error) {
        return handleApiError(error);
    }
};

export const POST = async (request: Request) => {
    try {
        const session = await getSession();
        if (!session?.user) {
            return unauthorizedResponse();
        }
        const body = await request.json();
        const validated = insertVoiceSchema.parse(body);

        const db = await getDb();
        const [newVoice] = await db
            .insert(voicesSchema)
            .values({
                ...validated,
                userId: validated.isPublic ? null : session.user.id,
            })
            .returning();
        return successResponse(newVoice, "Voice created successfully", 201);
    } catch (error) {
        return handleApiError(error);
    }
};
