export type Flashcard = {
  id: string
  prompt: string
  answer: string
  /** ISO timestamp for the last time this card was reviewed */
  lastReviewed?: string
  /** SM-2 easiness factor. Defaults to 2.5 for new cards */
  easiness: number
  /** Spaced repetition interval in days */
  interval: number
  /** Number of successful reviews in a row */
  repetitions: number
  /** ISO date string indicating when the card becomes due */
  dueDate: string
}

export type Deck = {
  id: string
  name: string
  description: string
  tags: string[]
  cards: Flashcard[]
  createdAt: string
  updatedAt: string
  /** Flag that marks whether the deck comes from the community explore feed */
  isCommunity?: boolean
  author?: string
  likes?: number
}
