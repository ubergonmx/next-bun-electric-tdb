import { createCollection } from "@tanstack/react-db";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { chatMessagesSelectSchema } from "@/lib/db/schema";
import {
  createChatMessageAction,
  updateChatMessageAction,
  deleteChatMessageAction,
} from "@/lib/actions";
import { snakeCamelMapper } from "@electric-sql/client";

export { type ChatMessage } from "@/lib/db/schema";

export const chatMessagesCollection = createCollection(
  electricCollectionOptions({
    id: "chat_messages",
    shapeOptions: {
      url: new URL(
        `/api/messages`,
        typeof window !== `undefined`
          ? window.location.origin
          : `http://localhost:3000`,
      ).toString(),
      columnMapper: snakeCamelMapper(),
      liveSse: true,
    },
    // for some reason, if syncMode is set to "on-demand", no threads will be shown
    syncMode: "on-demand",
    schema: chatMessagesSelectSchema,
    getKey: (item) => item.id,

    onInsert: async ({ transaction }) => {
      const newItem = transaction.mutations[0].modified;
      const { txid } = await createChatMessageAction(newItem);
      if (!txid) {
        throw new Error("Failed to create chat message");
      }
      return { txid };
    },

    onUpdate: async ({ transaction }) => {
      const { original, changes } = transaction.mutations[0];
      const { txid } = await updateChatMessageAction(original.id, changes);
      if (!txid) {
        throw new Error("Failed to update chat message");
      }
      return { txid };
    },

    onDelete: async ({ transaction }) => {
      const deletedItem = transaction.mutations[0].original;
      const { txid } = await deleteChatMessageAction(deletedItem.id);
      if (!txid) {
        throw new Error("Failed to delete chat message");
      }
      return { txid };
    },
  }),
);