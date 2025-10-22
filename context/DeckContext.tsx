"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { type Deck, type Flashcard } from "@/types/deck"

// Defines the quality of a study review session for a flashcard, ranging from 0 (total blackout) to 5 (perfect recall).
export type StudyQuality = 0 | 1 | 2 | 3 | 4 | 5

// Defines the shape of input for creating a new flashcard. Most fields are optional, calculated by the SM-2 algorithm.
export type CreateFlashcardInput = {
  id?: string
  prompt: string
  answer: string
  easiness?: number
  interval?: number
  repetitions?: number
  dueDate?: string
  lastReviewed?: string
}

// Defines the shape of input for creating a new deck.
export type CreateDeckInput = {
  name: string
  description: string
  tags: string[]
  cards?: CreateFlashcardInput[]
  isCommunity?: boolean
  author?: string
  likes?: number
}

// This interface centralises all deck-related CRUD (Create, Read, Update, Delete) and review logging operations.
type DeckContextValue = {
  decks: Deck[] // An array of all current decks.
  addDeck: (payload: CreateDeckInput) => Deck // Function to add a new deck.
  updateDeck: (deckId: string, updater: (draft: Deck) => Deck) => void // Function to update an existing deck.
  removeDeck: (deckId: string) => void // Function to remove a deck.
  logReview: (
    deckId: string,
    cardId: string,
    quality: StudyQuality,
    timestamp?: string
  ) => void // Function to log a card review and update its state based on the SM-2 algorithm.
}

// Creates a React context for the decks, initialised to null. This will be used to provide and consume deck data throughout the app.
const DeckContext = createContext<DeckContextValue | null>(null)

// Creates initial decks for demonstration purposes when the app first loads.
const createInitialDecks = (): Deck[] => {
  const now = new Date().toISOString()
  return [
    {
      id: crypto.randomUUID(),
      name: "React Fundamentals",
      description: "Key concepts for building modern React applications.",
      tags: ["react", "frontend"],
      cards: [
        {
          id: crypto.randomUUID(),
          prompt: "What hook lets you add state to a functional component?",
          answer: "The `useState` hook.",
          easiness: 2.5,
          interval: 0,
          repetitions: 0,
          dueDate: now,
          lastReviewed: undefined,
        },
        {
          id: crypto.randomUUID(),
          prompt: "What problem does React Context solve?",
          answer: "Prop drilling by providing a way to share values between components without passing props explicitly.",
          easiness: 2.5,
          interval: 0,
          repetitions: 0,
          dueDate: now,
          lastReviewed: undefined,
        },
      ],
      createdAt: now,
      updatedAt: now,
      author: "FlashLearn",
    },
  ]
}

// Updates a flashcard's review data based on the SM-2 algorithm.
const updateCardWithSm2 = (card: Flashcard, quality: StudyQuality, timestamp: string): Flashcard => {
  // This implementation follows the SM-2 algorithm with quality adjustments for a 0-5 scale.
  const MIN_EASINESS = 1.3
  const now = new Date(timestamp)
  let { easiness, repetitions, interval } = card

  // If the quality of the review is less than 3, reset the repetitions and interval.
  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    // Otherwise, increment repetitions and calculate the new interval.
    repetitions += 1
    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 6
    } else {
      interval = Math.round(interval * easiness)
    }
  }

  // Update the easiness factor based on the quality of the review.
  easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (easiness < MIN_EASINESS) {
    easiness = MIN_EASINESS
  }

  // Calculate the next due date for the card.
  const dueDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000)

  // Return the updated card data.
  return {
    ...card,
    easiness,
    repetitions,
    interval,
    dueDate: dueDate.toISOString(),
    lastReviewed: timestamp,
  }
}

// The provider component that wraps the application and provides the deck context.
export const DeckProvider = ({ children }: { children: ReactNode }) => {
  const [decks, setDecks] = useState<Deck[]>(() => createInitialDecks())

  // Callback to add a new deck.
  const addDeck: DeckContextValue["addDeck"] = useCallback((payload) => {
    const now = new Date().toISOString()
    const nextDeck: Deck = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      cards: (payload.cards ?? []).map((card) => ({
        id: card.id ?? crypto.randomUUID(),
        prompt: card.prompt,
        answer: card.answer,
        easiness: card.easiness ?? 2.5,
        interval: card.interval ?? 0,
        repetitions: card.repetitions ?? 0,
        dueDate: card.dueDate ?? now,
        lastReviewed: card.lastReviewed,
      })),
    }

    setDecks((prev) => [nextDeck, ...prev])
    return nextDeck
  }, [])

  // Callback to update an existing deck.
  const updateDeck: DeckContextValue["updateDeck"] = useCallback((deckId, updater) => {
    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id !== deckId) return deck
        const updated = updater(deck)
        return {
          ...updated,
          updatedAt: new Date().toISOString(),
        }
      })
    )
  }, [])

  // Callback to remove a deck.
  const removeDeck: DeckContextValue["removeDeck"] = useCallback((deckId) => {
    setDecks((prev) => prev.filter((deck) => deck.id !== deckId))
  }, [])

  // Callback to log a card review and update its state.
  const logReview: DeckContextValue["logReview"] = useCallback((deckId, cardId, quality, timestamp) => {
    const reviewTimestamp = timestamp ?? new Date().toISOString()

    updateDeck(deckId, (draft) => {
      const cards = draft.cards.map((card: Flashcard) =>
        card.id === cardId ? updateCardWithSm2(card, quality, reviewTimestamp) : card
      )

      return {
        ...draft,
        cards,
      }
    })
  }, [updateDeck])

  // Memoised context value to prevent unnecessary re-renders.
  const value = useMemo(
    () => ({ decks, addDeck, updateDeck, removeDeck, logReview }),
    [addDeck, decks, logReview, removeDeck, updateDeck]
  )

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>
}

// Custom hook to easily access the DeckContext.
export const useDecks = () => {
  const ctx = useContext(DeckContext)
  if (!ctx) throw new Error("useDecks must be used within a DeckProvider")
  return ctx
}
