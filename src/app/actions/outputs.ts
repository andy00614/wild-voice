"use server";

import { getSession } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import { outputsSchema } from "@/modules/outputs/schemas/output.schema";
import { voicesSchema } from "@/modules/voices/schemas/voice.schema";
import { eq, desc } from "drizzle-orm";
import type { Output } from "@/modules/outputs/schemas/output.schema";

interface OutputWithVoice extends Output {
    voice: {
        name: string;
    } | null;
}

export async function getRecentOutputs(): Promise<OutputWithVoice[]> {
    const session = await getSession();
    if (!session?.user) {
        return [];
    }

    const db = await getDb();

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

    return outputs;
}
