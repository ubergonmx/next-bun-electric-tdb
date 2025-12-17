"use client";

import { useMemo, type FormEvent } from "react";
import { gt, useLiveQuery } from "@tanstack/react-db";
import { chatMessagesCollection, type ChatMessage } from "@/lib/collections";
import { useChatContext } from "./chat-context";

export function ThreadSelector() {
  const { userName, setThreadId, resetChat } = useChatContext();

  const { data: messages, isLoading } = useLiveQuery(
    // chatMessagesCollection
    q => q.from({cm:chatMessagesCollection})
  );

  // Group messages by threadId to get unique threads
  const threads = useMemo(() => {
    if (!messages) return [];

    const threadMap = new Map<
      string,
      { threadId: string; lastMessage: ChatMessage; messageCount: number }
    >();

    for (const msg of messages) {
      // Skip messages without a valid threadId (optimistic inserts)
      if (!msg.threadId) continue;

      const existing = threadMap.get(msg.threadId);
      if (!existing) {
        threadMap.set(msg.threadId, {
          threadId: msg.threadId,
          lastMessage: msg,
          messageCount: 1,
        });
      } else {
        existing.messageCount++;
        // Keep the most recent message (highest id)
        if (msg.id > existing.lastMessage.id) {
          existing.lastMessage = msg;
        }
      }
    }

    return Array.from(threadMap.values()).sort(
      (a, b) => b.lastMessage.id - a.lastMessage.id
    );
  }, [messages]);

  const handleCreateThread = (e: FormEvent) => {
    e.preventDefault();
    // Generate a new UUID for the thread
    const newThreadId = crypto.randomUUID();
    setThreadId(newThreadId);
  };

  const handleSelectThread = (threadId: string) => {
    setThreadId(threadId);
  };

  return (
    <div className="flex min-h-[60vh] flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Hi, {userName}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Select a thread or start a new one
          </p>
        </div>
        <button
          onClick={resetChat}
          className="text-sm text-zinc-500 transition-colors hover:text-black dark:hover:text-white"
        >
          Change name
        </button>
      </div>

      {/* New Thread Form */}
      <form onSubmit={handleCreateThread} className="mb-6">
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-black dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-white"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Start New Thread
        </button>
      </form>

      {/* Thread List */}
      <div className="flex-1 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-zinc-500">
            Loading threads...
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              No threads yet. Start a new conversation!
            </p>
          </div>
        ) : (
          threads.map((thread, index) => (
            <button
              key={thread.threadId || `thread-${index}`}
              onClick={() => handleSelectThread(thread.threadId)}
              className="group flex w-full flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all hover:border-zinc-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-black dark:text-zinc-50">
                  {thread.lastMessage.senderName}
                </span>
                <span className="text-xs text-zinc-400">
                  {thread.messageCount} message
                  {thread.messageCount !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="line-clamp-1 text-sm text-zinc-600 dark:text-zinc-400">
                {thread.lastMessage.messageContent}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

