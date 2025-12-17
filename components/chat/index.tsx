"use client";

import { ChatProvider, useChatContext } from "./chat-context";
import { NameSetter } from "./name-setter";
import { ThreadSelector } from "./thread-selector";
import { ChatMessages } from "./chat-messages";

function ChatContent() {
  const { userName, threadId } = useChatContext();

  if (!userName) {
    return <NameSetter />;
  }

  if (!threadId) {
    return <ThreadSelector />;
  }

  return <ChatMessages />;
}

export function Chat() {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
}

