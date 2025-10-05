import { desc, eq, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { VoiceDashboard } from "@/components/voice-dashboard";
import { VoiceModeTabs } from "@/components/voice-mode-tabs";
import { getDb } from "@/db";
import { getSession } from "@/modules/auth/utils/auth-utils";
import { outputsSchema } from "@/modules/outputs/schemas/output.schema";
import { voicesSchema } from "@/modules/voices/schemas/voice.schema";

export default async function Page() {
    const session = await getSession();

    if (!session?.user) {
        redirect("/");
    }

    const db = await getDb();

    // Fetch voices (public + user's private voices)
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

    // Fetch recent outputs with voice info
    const outputsWithVoice = await db
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

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2">WildVoice</h1>
                <p className="text-muted-foreground">Talk. Transform. Clone.</p>
            </div>

            {/* Mode Tabs */}
            <div className="flex justify-center">
                <Suspense fallback={<div>Loading...</div>}>
                    <VoiceModeTabs />
                </Suspense>
            </div>

            {/* Main Dashboard */}
            <Suspense fallback={<div>Loading dashboard...</div>}>
                <VoiceDashboard voices={voices} outputs={outputsWithVoice} />
            </Suspense>
        </div>
    );
}
