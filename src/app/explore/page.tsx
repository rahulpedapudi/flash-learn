"use client";

import { useMemo, useState } from "react";
import {
  HeartIcon,
  SearchIcon,
  Share2Icon,
  TagIcon,
  SparklesIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { communityDecks } from "@/data/communityDecks";
import { useDecks } from "@/context/DeckContext";

const ExplorePage = () => {
  const { addDeck } = useDecks();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    communityDecks.forEach((deck) =>
      deck.tags.forEach((tag) => tagSet.add(tag))
    );
    return Array.from(tagSet).sort();
  }, []);

  const filteredDecks = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return communityDecks.filter((deck) => {
      const matchesText = [deck.name, deck.description, deck.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(term);
      const matchesTag = selectedTag ? deck.tags.includes(selectedTag) : true;
      return matchesText && matchesTag;
    });
  }, [searchTerm, selectedTag]);

  const handleCloneDeck = (deckId: string) => {
    const deckToClone = communityDecks.find((deck) => deck.id === deckId);
    if (!deckToClone) return;

    addDeck({
      name: `${deckToClone.name} (clone)`,
      description: deckToClone.description,
      tags: deckToClone.tags,
      cards: deckToClone.cards,
      isCommunity: false,
      author: "You",
      likes: deckToClone.likes ?? 0,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Community decks</h1>
            <p className="text-sm text-muted-foreground">
              Discover curated decks crafted by FlashLearn community members.
              Clone a deck to customise it for your own study flow.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-2">
            <SearchIcon className="size-4 text-muted-foreground" />
            <Input
              className="h-auto border-0 p-0 text-sm"
              placeholder="Search by topic, author, or tag"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 transition ${
              selectedTag === null
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background"
            }`}>
            <TagIcon className="size-4" /> All topics
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() =>
                setSelectedTag((prev) => (prev === tag ? null : tag))
              }
              className={`rounded-full border px-3 py-1 transition ${
                selectedTag === tag
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background"
              }`}>
              #{tag}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredDecks.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            No decks match your filters yet. Try a different keyword or tag.
          </div>
        ) : (
          filteredDecks.map((deck) => (
            <Card key={deck.id} className="flex flex-col justify-between">
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg">{deck.name}</CardTitle>
                <CardDescription>{deck.description}</CardDescription>
                <div className="flex flex-wrap gap-2">
                  {deck.tags.map((tag) => (
                    <Badge key={tag} variant="subtle">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <HeartIcon className="size-4 text-rose-500" />
                  <span>{deck.likes ?? 0} favourites</span>
                </div>
                <p>Uploaded by {deck.author ?? "Anonymous"}</p>
                <p>
                  Updated{" "}
                  {new Date(
                    deck.updatedAt || deck.createdAt
                  ).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a
                    href={`https://flashlearn.community/decks/${deck.id}`}
                    target="_blank"
                    rel="noreferrer">
                    <Share2Icon className="size-4" /> View details
                  </a>
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => handleCloneDeck(deck.id)}>
                  <SparklesIcon className="size-4" /> Clone deck
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </section>
    </div>
  );
};

export default ExplorePage;
