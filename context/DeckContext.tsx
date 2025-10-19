"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { type Deck, type Flashcard } from "@/types/deck"

export type StudyQuality = 0 | 1 | 2 | 3 | 4 | 5

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

export type CreateDeckInput = {
  name: string
  description: string
  tags: string[]
  cards?: CreateFlashcardInput[]
  isCommunity?: boolean
  author?: string
  likes?: number
}

// Lightweight interface that centralises deck CRUD and review events.
type DeckContextValue = {
  decks: Deck[]
  addDeck: (payload: CreateDeckInput) => Deck
  updateDeck: (deckId: string, updater: (draft: Deck) => Deck) => void
  removeDeck: (deckId: string) => void
  logReview: (
    deckId: string,
    cardId: string,
    quality: StudyQuality,
    timestamp?: string
  ) => void
}

const DeckContext = createContext<DeckContextValue | null>(null)

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

const updateCardWithSm2 = (card: Flashcard, quality: StudyQuality, timestamp: string): Flashcard => {
  // Implementation follows SM-2 with quality adjustments for 0-5 scale.
  const MIN_EASINESS = 1.3
  const now = new Date(timestamp)
  let { easiness, repetitions, interval } = card

  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    repetitions += 1
    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 6
    } else {
      interval = Math.round(interval * easiness)
    }
  }

  easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (easiness < MIN_EASINESS) {
    easiness = MIN_EASINESS
  }

  const dueDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000)

  return {
    ...card,
    easiness,
    repetitions,
    interval,
    dueDate: dueDate.toISOString(),
    lastReviewed: timestamp,
  }
}

export const DeckProvider = ({ children }: { children: ReactNode }) => {
  const [decks, setDecks] = useState<Deck[]>(() => createInitialDecks())

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

  const removeDeck: DeckContextValue["removeDeck"] = useCallback((deckId) => {
    setDecks((prev) => prev.filter((deck) => deck.id !== deckId))
  }, [])

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

  const value = useMemo(
    () => ({ decks, addDeck, updateDeck, removeDeck, logReview }),
    [addDeck, decks, logReview, removeDeck, updateDeck]
  )

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>
}

export const useDecks = () => {
  const ctx = useContext(DeckContext)
  if (!ctx) throw new Error("useDecks must be used within a DeckProvider")
  return ctx
}
