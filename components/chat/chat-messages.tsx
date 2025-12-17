"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useLiveQuery } from "@tanstack/react-db";
import { chatMessagesCollection, type ChatMessage } from "@/lib/collections";
import { useChatContext } from "./chat-context";

export function ChatMessages() {
  const { userName, threadId, setThreadId, resetChat } = useChatContext();
  const [newMessage, setNewMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: allMessages, collection, isLoading } = useLiveQuery(chatMessagesCollection);

  // Filter messages for current thread
  const messages = allMessages?.filter((m) => m.threadId === threadId) ?? [];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userName || !threadId) return;

    const maxId = allMessages?.reduce((max, m) => Math.max(max, m.id), 0) ?? 0;

    collection.insert({
      id: maxId + 1,
      senderName: userName,
      messageContent: newMessage.trim(),
      threadId: threadId,
      replyToId: null,
      isEdited: false,
      isPinned: false,
      readAt: null,
    });

    setNewMessage("");
  };

  const handleEditMessage = (msg: ChatMessage) => {
    setEditingId(msg.id);
    setEditContent(msg.messageContent);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editContent.trim()) return;

    collection.update(id, (draft) => {
      draft.messageContent = editContent.trim();
      draft.isEdited = true;
    });

    setEditingId(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleDeleteMessage = async (id: number) => {
    collection.delete(id);
  };

  const handleTogglePin = async (msg: ChatMessage) => {
    collection.update(msg.id, (draft) => {
      draft.isPinned = !draft.isPinned;
    });
  };

  const handleBackToThreads = () => {
    setThreadId(null);
  };

  // Sort messages by id (creation order)
  const sortedMessages = [...messages].sort((a, b) => a.id - b.id);
  const pinnedMessages = sortedMessages.filter((m) => m.isPinned);

  return (
    <div className="flex h-[70vh] flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToThreads}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="font-medium text-black dark:text-zinc-50">Thread</p>
            <p className="text-xs text-zinc-500">{messages.length} messages</p>
          </div>
        </div>
        <button
          onClick={resetChat}
          className="text-sm text-zinc-500 transition-colors hover:text-black dark:hover:text-white"
        >
          Exit
        </button>
      </div>

      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Pinned
          </p>
          {pinnedMessages.map((msg) => (
            <div key={msg.id} className="text-sm text-amber-900 dark:text-amber-100">
              <span className="font-medium">{msg.senderName}:</span> {msg.messageContent}
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-zinc-500">Loading messages...</div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          sortedMessages.map((msg) => {
            const isOwnMessage = msg.senderName === userName;

            return (
              <div
                key={msg.id}
                className={`group flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white"
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="mb-1 text-xs font-medium opacity-70">{msg.senderName}</p>
                  )}

                  {editingId === msg.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoFocus
                        className="rounded-lg bg-white/20 px-2 py-1 text-sm focus:outline-none dark:bg-black/20"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(msg.id);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(msg.id)}
                          className="text-xs opacity-70 hover:opacity-100"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-xs opacity-70 hover:opacity-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">{msg.messageContent}</p>
                      {msg.isEdited && <span className="text-xs opacity-50">(edited)</span>}
                    </>
                  )}

                  {/* Actions */}
                  {editingId !== msg.id && (
                    <div className="mt-1 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleTogglePin(msg)}
                        className={`text-xs ${msg.isPinned ? "opacity-100" : "opacity-50"} hover:opacity-100`}
                        title={msg.isPinned ? "Unpin" : "Pin"}
                      >
                        📌
                      </button>
                      {isOwnMessage && (
                        <>
                          <button
                            onClick={() => handleEditMessage(msg)}
                            className="text-xs opacity-50 hover:opacity-100"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-xs opacity-50 hover:opacity-100"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="h-12 flex-1 rounded-xl border border-zinc-200 bg-white px-4 text-black placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}

