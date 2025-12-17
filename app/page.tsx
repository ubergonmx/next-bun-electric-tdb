import { Chat } from "@/components/chat";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-xl flex-col py-8 px-6 bg-white dark:bg-black">
        <header className="mb-8 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <h1 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Chat
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Real-time messaging with TanStack DB &amp; Electric SQL
          </p>
        </header>
        <Chat />
      </main>
    </div>
  );
}
