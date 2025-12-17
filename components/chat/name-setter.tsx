"use client";

import { useState, type FormEvent } from "react";
import { useChatContext } from "./chat-context";

export function NameSetter() {
  const { setUserName } = useChatContext();
  const [name, setName] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setUserName(name.trim());
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Welcome
        </h2>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          Enter your name to start chatting
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name..."
            autoFocus
            className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-black placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="h-12 w-full rounded-xl bg-black font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

