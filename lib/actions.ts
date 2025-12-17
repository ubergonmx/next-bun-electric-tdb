"use server";

import { db, getTxId } from "@/lib/db";
import { chatMessages, CreateChatMessage, UpdateChatMessage } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createChatMessageAction(data: CreateChatMessage) {
  try {
    // Strip id since it's GENERATED ALWAYS AS IDENTITY
    const { id, ...insertData } = data as CreateChatMessage & { id?: number };
    
    const [txid] = await db.transaction(async (tx) => {
      await tx.insert(chatMessages).values(insertData);
      return [await getTxId(tx)];
    });

    return { txid };
  } catch (error) {
    console.error("Error creating chat message:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create chat message",
    };
  }
}

export async function updateChatMessageAction(id: number, data: UpdateChatMessage) {
  try {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const [updated, txid] = await db.transaction(async (tx) => {
      const [updated] = await tx.update(chatMessages).set(updateData).where(eq(chatMessages.id, id)).returning();
      return [updated, await getTxId(tx)];
    });

    if (!updated) {
      return {
        success: false,
        error: "Chat message not found",
      };
    }

    return { txid };
  } catch (error) {
    console.error("Error updating chat message:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update chat message",
    };
  }
}

export async function deleteChatMessageAction(id: number) {
  try {
    const [deleted, txid] = await db.transaction(async (tx) => {
      const [deleted] = await tx.delete(chatMessages).where(eq(chatMessages.id, id)).returning();
      return [deleted, await getTxId(tx)];
    });

    if (!deleted) {
      return { success: false, error: "Chat message not found" };
    };

    return { txid };
  } catch (error) {
    console.error("Error deleting chat message:", error);
    return { success: false, error: "Failed to delete chat message" };
  }
}