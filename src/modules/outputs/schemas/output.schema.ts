import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "@/modules/auth/schemas/auth.schema";
import { voicesSchema } from "@/modules/voices/schemas/voice.schema";

export const outputsSchema = sqliteTable("outputs", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'TTS' | 'STT'
    voiceId: integer("voice_id").references(() => voicesSchema.id),
    inputText: text("input_text"),
    audioUrl: text("audio_url"),
    duration: integer("duration"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .$defaultFn(() => new Date())
        .notNull(),
});

// Zod schemas
export const insertOutputSchema = createInsertSchema(outputsSchema, {
    type: z.enum(["TTS", "STT"]),
    inputText: z.string().min(1),
});

export const selectOutputSchema = createSelectSchema(outputsSchema);

export type Output = typeof outputsSchema.$inferSelect;
export type NewOutput = typeof outputsSchema.$inferInsert;
