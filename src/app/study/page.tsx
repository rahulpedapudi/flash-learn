"use client"

import Link from "next/link"
import { useMemo } from "react"
import { SparklesIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useDecks } from "@/context/DeckContext"

const StudyPage = () => {
  const { decks } = useDecks()

  const deckSummaries = useMemo(
    () =>
      decks.map((deck) => {
        const dueCount = deck.cards.filter((card) => new Date(card.dueDate).getTime() <= Date.now()).length
        return {
          ...deck,
          dueCount,
        }
      }),
    [decks],
  )

  if (decks.length === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>No decks yet</CardTitle>
            <CardDescription>Create a deck from the dashboard to get started with spaced repetition.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Start a study session</h1>
          <p className="text-sm text-muted-foreground">
            Choose a deck to review cards that are due right now. FlashLearn prioritises cards that are ready.
          </p>
        </div>
        <Badge className="flex items-center gap-1 bg-primary text-primary-foreground">
          <SparklesIcon className="size-4" /> SM-2 Scheduler
        </Badge>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {deckSummaries.map((deck) => (
          <Card key={deck.id} className="flex flex-col justify-between border-muted">
            <CardHeader>
              <CardTitle>{deck.name}</CardTitle>
              <CardDescription>{deck.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{deck.cards.length} cards</p>
              <p>
                {deck.dueCount} card{deck.dueCount === 1 ? "" : "s"} due now
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href={`/study/${deck.id}`}>Start session</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default StudyPage

