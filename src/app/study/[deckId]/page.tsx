"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CheckCircle2Icon,
  Loader2Icon,
  RepeatIcon,
  SparklesIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDecks, type StudyQuality } from "@/context/DeckContext";
import { type Deck, type Flashcard } from "@/types/deck";

const ratingScale: { value: StudyQuality; label: string; hint: string }[] = [
  { value: 5, label: "Easy", hint: "I knew it instantly" },
  { value: 4, label: "Good", hint: "Minor recall effort" },
  { value: 3, label: "OK", hint: "Needed some thought" },
  { value: 2, label: "Hard", hint: "Barely remembered" },
  { value: 1, label: "Miss", hint: "Couldn't recall" },
  { value: 0, label: "Again", hint: "Total blackout" },
];

const sortCardsByDueDate = (cards: Flashcard[]) =>
  [...cards].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

const buildInitialQueue = (deck: Deck) => {
  const now = Date.now();
  const sorted = sortCardsByDueDate(deck.cards);
  const dueCards = sorted.filter((card) => new Date(card.dueDate).getTime() <= now);
  const baseQueue = dueCards.length > 0 ? dueCards : sorted.slice(0, 10);
  return baseQueue.map((card) => card.id);
};

const StudySessionPage = () => {
  const params = useParams<{ deckId: string }>();
  const router = useRouter();
  const deckId = params.deckId;

  const { decks, logReview } = useDecks();
  const selectedDeck = useMemo(() => decks.find((deck) => deck.id === deckId), [decks, deckId]);

  const [queue, setQueue] = useState<string[]>([]);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!selectedDeck) return;

    if (selectedDeck.cards.length === 0) {
      setQueue([]);
      return;
    }

    setQueue(buildInitialQueue(selectedDeck));
    setIsAnswerVisible(false);
    setCompletedCount(0);
  }, [selectedDeck?.id]);

  useEffect(() => {
    if (!selectedDeck) return;
    if (selectedDeck.cards.length === 0) return;
    if (queue.length === 0) return;

    const firstCard = selectedDeck.cards.find((card) => card.id === queue[0]);
    if (!firstCard) {
      setQueue(buildInitialQueue(selectedDeck));
      setIsAnswerVisible(false);
    }
  }, [queue, selectedDeck]);

  if (!deckId) {
    router.replace("/study");
    return null;
  }

  if (!selectedDeck) {
    notFound();
  }

  const handleBackToDecks = () => {
    router.push("/study");
  };

  if (selectedDeck.cards.length === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" onClick={handleBackToDecks} className="gap-2">
          <ArrowLeftIcon className="size-4" /> All decks
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>No cards in this deck</CardTitle>
            <CardDescription>
              Add at least one flashcard to start studying. You can manage cards from the dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentCard = useMemo(() => {
    if (queue.length === 0) return undefined;
    const cardId = queue[0];
    return selectedDeck.cards.find((card) => card.id === cardId);
  }, [queue, selectedDeck]);

  const handleRevealAnswer = () => {
    setIsAnswerVisible(true);
  };

  const handleRateCard = (quality: StudyQuality) => {
    if (!currentCard) return;

    logReview(selectedDeck.id, currentCard.id, quality);
    setQueue((prev) => {
      const [, ...rest] = prev;
      if (quality < 3) {
        return [...rest, currentCard.id];
      }
      return rest;
    });
    setCompletedCount((count) => count + 1);
    setIsAnswerVisible(false);
  };

  if (!currentCard) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" onClick={handleBackToDecks} className="gap-2">
          <ArrowLeftIcon className="size-4" /> All decks
        </Button>
        <Card className="border-primary/40">
          <CardHeader className="flex items-start gap-3">
            <CheckCircle2Icon className="size-6 text-primary" />
            <div>
              <CardTitle>All caught up!</CardTitle>
              <CardDescription>
                You have reviewed every due card in {selectedDeck.name}. Come back when FlashLearn notifies you about
                the next review.
              </CardDescription>
            </div>
          </CardHeader>
          <CardFooter className="justify-between">
            <div className="text-sm text-muted-foreground">
              Session completed with {completedCount} review{completedCount === 1 ? "" : "s"}.
            </div>
            <Button variant="outline" onClick={handleBackToDecks}>
              View other decks
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" className="mb-2 gap-2 px-0 text-sm" onClick={handleBackToDecks}>
            <ArrowLeftIcon className="size-4" /> All decks
          </Button>
          <h1 className="text-2xl font-semibold">{selectedDeck.name}</h1>
          <p className="text-sm text-muted-foreground">{selectedDeck.description}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="border-primary/50 text-primary">
            {queue.length} card{queue.length === 1 ? "" : "s"} remaining
          </Badge>
          <Badge variant="outline" className="border-muted/50">
            {completedCount} reviewed
          </Badge>
        </div>
      </header>

      <Card className="border-primary/30 shadow-sm">
        <CardHeader>
          <CardTitle>Prompt</CardTitle>
          <CardDescription>Think about the answer before revealing it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-dashed border-muted bg-muted/40 p-6 text-lg font-medium">
            {currentCard.prompt}
          </div>

          <div>
            <Button onClick={handleRevealAnswer} disabled={isAnswerVisible}>
              {isAnswerVisible ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
              {isAnswerVisible ? "Answer visible" : "Reveal answer"}
            </Button>
          </div>

          {isAnswerVisible && (
            <div className="rounded-lg border border-muted/60 bg-background p-6">
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">Answer</h3>
              <p className="text-base leading-relaxed text-foreground">{currentCard.answer}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Rate how well you remembered this card. SM-2 will adapt the next review based on your feedback.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {ratingScale.map((item) => (
              <Button
                key={item.value}
                variant={item.value >= 3 ? "default" : "outline"}
                className="justify-start gap-3"
                onClick={() => handleRateCard(item.value)}
                disabled={!isAnswerVisible}
              >
                <span className="inline-flex size-6 items-center justify-center rounded-full border text-xs font-semibold">
                  {item.value}
                </span>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.hint}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardFooter>
      </Card>

      <div className="flex items-center justify-between rounded-lg border border-muted/60 bg-muted/40 p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <RepeatIcon className="size-4" />
          <span>Low scores repeat in-session to reinforce weak points.</span>
        </div>
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-primary" />
          <span>SM-2 keeps easy cards away until you need them again.</span>
        </div>
      </div>
    </div>
  );
};

export default StudySessionPage;
