"use client"

import { CalendarIcon, BookOpenIcon, TrendingUpIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type Deck } from "@/types/deck"

export type DeckSummaryCardProps = {
  deck: Deck
  onStudy: (deckId: string) => void
  onEdit?: (deckId: string) => void
}

export const DeckSummaryCard = ({ deck, onStudy, onEdit }: DeckSummaryCardProps) => {
  const lastReviewed = deck.cards
    .map((card) => card.lastReviewed)
    .filter(Boolean)
    .sort()
    .at(-1)

  const subtitle = lastReviewed
    ? `Last reviewed ${new Date(lastReviewed).toLocaleDateString()}`
    : "Not reviewed yet"

  const totalInterval = deck.cards.reduce((sum, card) => sum + card.interval, 0)
  const averageInterval = deck.cards.length > 0 ? Math.round(totalInterval / deck.cards.length) : 0

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{deck.name}</CardTitle>
        <CardDescription>{deck.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {deck.tags.length === 0 ? <Badge>No tags</Badge> : deck.tags.map((tag) => <Badge key={tag}>#{tag}</Badge>)}
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 rounded-lg border border-border/60 p-3">
            <BookOpenIcon className="size-4 text-primary" />
            <div>
              <p className="font-semibold text-foreground">{deck.cards.length}</p>
              <p>Cards</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/60 p-3">
            <TrendingUpIcon className="size-4 text-primary" />
            <div>
              <p className="font-semibold text-foreground">{averageInterval}d</p>
              <p>Avg interval</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/60 p-3">
            <CalendarIcon className="size-4 text-primary" />
            <div>
              <p className="font-semibold text-foreground">
                {lastReviewed ? new Date(lastReviewed).toLocaleDateString() : "—"}
              </p>
              <p>Last review</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(deck.id)}>
            Edit deck
          </Button>
        )}
        <Button size="sm" onClick={() => onStudy(deck.id)}>
          Study session
        </Button>
      </CardFooter>
    </Card>
  )
}
