"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

interface ChatContextType {
  userName: string | null;
  setUserName: (name: string) => void;
  threadId: string | null;
  setThreadId: (id: string | null) => void;
  resetChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [userName, setUserNameState] = useState<string | null>(null);
  const [threadId, setThreadIdState] = useState<string | null>(null);

  // Restore name from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("chat_user_name");
    if (savedName) {
      setUserNameState(savedName);
    }
  }, []);

  const setUserName = useCallback((name: string) => {
    setUserNameState(name);
    localStorage.setItem("chat_user_name", name);
  }, []);

  const setThreadId = useCallback((id: string | null) => {
    setThreadIdState(id);
  }, []);

  const resetChat = useCallback(() => {
    setUserNameState(null);
    setThreadIdState(null);
    localStorage.removeItem("chat_user_name");
  }, []);

  return (
    <ChatContext.Provider
      value={{ userName, setUserName, threadId, setThreadId, resetChat }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}

