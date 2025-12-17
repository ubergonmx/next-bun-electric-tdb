import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import * as z from "zod";

const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({ zodInstance: z });

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    uid: uuid("uid").notNull().unique().defaultRandom(),
    senderName: text("sender_name").notNull(),
    messageContent: text("message_content").notNull(),
    threadId: uuid("thread_id").notNull().defaultRandom(),
    replyToId: integer("reply_to_id"),
    isEdited: boolean("is_edited").notNull().default(false),
    isPinned: boolean("is_pinned").notNull().default(false),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("chat_messages_thread_id_idx").on(table.threadId),
    index("chat_messages_sender_name_idx").on(table.senderName),
    index("chat_messages_created_at_idx").on(table.createdAt),
  ]
);

// ---------------- drizzle-zod ----------------

export const chatMessagesInsertSchema = createInsertSchema(chatMessages).omit({
  uid: true,
  createdAt: true,
  updatedAt: true,
});
export const chatMessagesSelectSchema = createSelectSchema(chatMessages)
  .omit({
    uid: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    // Coerce timestamp strings from database to Date objects
    readAt: z.coerce.date().nullable(),
  });
export const chatMessagesUpdateSchema = createUpdateSchema(chatMessages)
  .omit({
    uid: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    // Coerce timestamp strings from database to Date objects
    readAt: z.coerce.date().nullable().optional(),
  });

export type ChatMessage = z.infer<typeof chatMessagesSelectSchema>;
export type CreateChatMessage = z.infer<typeof chatMessagesInsertSchema>;
export type UpdateChatMessage = z.infer<typeof chatMessagesUpdateSchema>;
