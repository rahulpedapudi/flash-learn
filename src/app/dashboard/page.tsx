"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeckSummaryCard } from "@/components/dashboard/DeckSummaryCard";
import { DeckFormModal } from "@/components/dashboard/DeckFormModal";
import { useDecks, type CreateDeckInput } from "@/context/DeckContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { type Deck } from "@/types/deck";

const DashboardPage = () => {
  const { decks, addDeck, updateDeck } = useDecks();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const debouncedSearch = useDebouncedValue(searchTerm);

  const filteredDecks = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return decks;
    return decks.filter((deck) =>
      [deck.name, deck.description, deck.tags.join(" ")].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [decks, debouncedSearch]);

  const handleCreateDeck = (payload: CreateDeckInput) => {
    addDeck(payload);
  };

  const handleEditDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleUpdateDeck = (deckId: string, payload: CreateDeckInput) => {
    updateDeck(deckId, (draft) => ({
      ...draft,
      name: payload.name,
      description: payload.description,
      tags: payload.tags,
      cards: (payload.cards ?? []).map((card) => ({
        ...card,
        id: card.id ?? crypto.randomUUID(),
        easiness: card.easiness ?? 2.5,
        interval: card.interval ?? 0,
        repetitions: card.repetitions ?? 0,
        dueDate: card.dueDate ?? new Date().toISOString(),
      })),
    }));
    setSelectedDeck(null);
    setModalMode("create");
  };

  const handleStudyDeck = (deckId: string) => {
    router.push(`/study/${deckId}`);
  };

  const handleModalChange = (open: boolean) => {
    if (!open) {
      setSelectedDeck(null);
      setModalMode("create");
    }
    setIsModalOpen(open);
  };

  return (
    <div className="relative flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Your decks</h2>
            <p className="text-sm text-muted-foreground">
              Browse and open decks to jump into a study session.
            </p>
          </div>
          <div className="flex w-full items-center gap-2 rounded-full border bg-background px-3 py-2 sm:w-fit">
            <SearchIcon className="size-4 text-muted-foreground" />
            <Input
              className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              placeholder="Search decks..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDecks.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed p-10 text-center text-muted-foreground">
              No decks found. Try a different keyword or create a new deck.
            </div>
          ) : (
            filteredDecks.map((deck) => (
              <DeckSummaryCard
                key={deck.id}
                deck={deck}
                onStudy={handleStudyDeck}
                onEdit={(deckId) => {
                  const deckToEdit = decks.find((item) => item.id === deckId);
                  if (!deckToEdit) return;
                  handleEditDeck(deckToEdit);
                }}
              />
            ))
          )}
        </div>
      </section>

      <Button
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-5 py-6 shadow-lg hover:shadow-xl"
        onClick={() => setIsModalOpen(true)}
      >
        <PlusIcon className="size-5" /> Create deck
      </Button>

      <DeckFormModal
        open={isModalOpen}
        mode={modalMode}
        onOpenChange={handleModalChange}
        onCreate={handleCreateDeck}
        onUpdate={handleUpdateDeck}
        initialDeck={selectedDeck}
      />
    </div>
  );
};

export default DashboardPage;
