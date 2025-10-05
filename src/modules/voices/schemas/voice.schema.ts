import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "@/modules/auth/schemas/auth.schema";

export const voicesSchema = sqliteTable("voices", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    category: text("category"),
    rating: integer("rating").notNull().default(0),
    isPublic: integer("is_public", { mode: "boolean" })
        .notNull()
        .default(false),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    falVoiceId: text("fal_voice_id"),
    sampleAudioUrl: text("sample_audio_url"),
    createdAt: integer("created_at", { mode: "timestamp" })
        .defaultNow()
        .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const insertVoiceSchema = createInsertSchema(voicesSchema, {
    name: z.string().min(1, "声音名称不能为空").max(100, "名称过长"),
    rating: z.number().min(0).max(5).optional(),
    isPublic: z.boolean().optional(),
    sampleAudioUrl: z
        .string()
        .url("无效的音频URL")
        .optional()
        .or(z.literal("")),
});

export const selectVoiceSchema = createSelectSchema(voicesSchema);

export const updateVoiceSchema = insertVoiceSchema.partial().omit({
    id: true,
    userId: true,
    createdAt: true,
});

export type Voice = typeof voicesSchema.$inferSelect;
export type NewVoice = typeof voicesSchema.$inferInsert;
