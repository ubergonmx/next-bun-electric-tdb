import { db } from "./index";
import { chatMessages } from "./schema";

const thread1Id = "550e8400-e29b-41d4-a716-446655440001";
const thread2Id = "550e8400-e29b-41d4-a716-446655440002";

const sampleMessages = [
  // Thread 1: Project Discussion
  {
    threadId: thread1Id,
    senderName: "Alice Chen",
    messageContent: "Hey team, have we finalized the database schema for the new feature?",
    isPinned: true,
    readAt: new Date(),
  },
  {
    threadId: thread1Id,
    senderName: "Bob Martinez",
    messageContent: "Not yet, I'm still working on the ERD. Should have it ready by EOD.",
    readAt: new Date(),
  },
  {
    threadId: thread1Id,
    senderName: "Alice Chen",
    messageContent: "Perfect! Let me know if you need any help with the relationships.",
    readAt: new Date(),
  },
  {
    threadId: thread1Id,
    senderName: "Carol Johnson",
    messageContent: "I can review it once you're done. Also, should we add soft deletes?",
    isEdited: true,
    readAt: new Date(),
  },
  {
    threadId: thread1Id,
    senderName: "Bob Martinez",
    messageContent: "Good idea! I'll add an is_deleted column with a timestamp.",
    readAt: null, // Unread
  },

  // Thread 2: Code Review
  {
    threadId: thread2Id,
    senderName: "David Kim",
    messageContent: "Just pushed the PR for the authentication flow. Can someone review?",
    isPinned: true,
    readAt: new Date(),
  },
  {
    threadId: thread2Id,
    senderName: "Emma Wilson",
    messageContent: "I'll take a look! Is it using the new JWT library?",
    readAt: new Date(),
  },
  {
    threadId: thread2Id,
    senderName: "David Kim",
    messageContent: "Yes, migrated from the old one. Much cleaner API now.",
    isEdited: true,
    readAt: new Date(),
  },
  {
    threadId: thread2Id,
    senderName: "Emma Wilson",
    messageContent: "LGTM! Just left a minor comment about error handling. Otherwise good to merge.",
    readAt: null, // Unread
  },
];

async function seed() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  console.log("Clearing existing data...");
  await db.delete(chatMessages);

  // Insert messages
  console.log("Inserting sample messages...");
  for (const msg of sampleMessages) {
    await db.insert(chatMessages).values(msg);
  }

  console.log("✅ Seed completed successfully!");
  console.log(`Created ${sampleMessages.length} messages across 2 threads.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
