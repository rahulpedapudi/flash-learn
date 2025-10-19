import { type Deck } from "@/types/deck"

/**
 * Seed community decks that would normally come from an API.
 * These help us render the Explore page in the MVP.
 */
export const communityDecks: Deck[] = [
  {
    id: "web-accessibility",
    name: "Web Accessibility Essentials",
    description: "Ensure that your interfaces work for everyone with these quick checks.",
    tags: ["accessibility", "frontend", "ux"],
    cards: [],
    createdAt: "2024-12-01T09:00:00.000Z",
    updatedAt: "2024-12-05T09:00:00.000Z",
    isCommunity: true,
    author: "Inclusive Devs",
    likes: 92,
  },
  {
    id: "javascript-pitfalls",
    name: "JavaScript Pitfalls",
    description: "Common mistakes that catch developers off guard and how to avoid them.",
    tags: ["javascript", "fundamentals"],
    cards: [],
    createdAt: "2025-01-10T14:30:00.000Z",
    updatedAt: "2025-01-12T08:20:00.000Z",
    isCommunity: true,
    author: "CodeClinic",
    likes: 138,
  },
  {
    id: "productivity-habits",
    name: "Productivity Habits",
    description: "Daily routines to keep your learning momentum high.",
    tags: ["productivity", "habits"],
    cards: [],
    createdAt: "2025-02-01T06:45:00.000Z",
    updatedAt: "2025-02-01T06:45:00.000Z",
    isCommunity: true,
    author: "GrowthLab",
    likes: 64,
  },
]
