"use client"

import { useEffect, useState } from "react"
import { PlusIcon, Trash2Icon, UploadIcon } from "lucide-react"

import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { type CreateDeckInput, type CreateFlashcardInput } from "@/context/DeckContext"
import { type Deck } from "@/types/deck"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formDefaults = {
  name: "",
  description: "",
  tags: "",
}

const cardDefaults: Pick<CreateFlashcardInput, "prompt" | "answer"> = {
  prompt: "",
  answer: "",
}

export type DeckFormModalProps = {
  open: boolean
  mode: "create" | "edit"
  onOpenChange: (open: boolean) => void
  onCreate: (payload: CreateDeckInput) => void
  onUpdate?: (deckId: string, payload: CreateDeckInput) => void
  initialDeck?: Deck | null
}

export const DeckFormModal = ({
  open,
  mode,
  onOpenChange,
  onCreate,
  onUpdate,
  initialDeck,
}: DeckFormModalProps) => {
  const [formState, setFormState] = useState(formDefaults)
  const [cards, setCards] = useState<CreateFlashcardInput[]>([])
  const [cardDraft, setCardDraft] = useState(cardDefaults)
  const [cardError, setCardError] = useState<string | null>(null)
  const [jsonInput, setJsonInput] = useState("")
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState<"manual" | "json">("manual")

  const resetState = () => {
    setFormState(formDefaults)
    setCards([])
    setCardDraft(cardDefaults)
    setCardError(null)
    setJsonInput("")
    setJsonError(null)
    setTabValue("manual")
  }

  useEffect(() => {
    if (!open) return

    if (mode === "edit" && initialDeck) {
      setFormState({
        name: initialDeck.name,
        description: initialDeck.description,
        tags: initialDeck.tags.join(", "),
      })
      setCards(
        initialDeck.cards.map((card) => ({
          id: card.id,
          prompt: card.prompt,
          answer: card.answer,
          easiness: card.easiness,
          interval: card.interval,
          repetitions: card.repetitions,
          dueDate: card.dueDate,
          lastReviewed: card.lastReviewed,
        })),
      )
      setCardDraft(cardDefaults)
      setCardError(null)
      setJsonInput("")
      setJsonError(null)
      setTabValue("manual")
    } else {
      resetState()
    }
  }, [open, mode, initialDeck?.id])

  const handleClose = () => {
    resetState()
    onOpenChange(false)
  }

  const handleAddCard = () => {
    const prompt = cardDraft.prompt.trim()
    const answer = cardDraft.answer.trim()
    if (!prompt || !answer) return

    setCards((prev) => [
      ...prev,
      {
        prompt,
        answer,
      },
    ])
    setCardDraft(cardDefaults)
    setCardError(null)
    setJsonError(null)
  }

  const handleRemoveCard = (index: number) => {
    setCards((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleJsonFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setJsonInput(text)
    setJsonError(null)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formState.name.trim()) {
      return
    }

    let cardsToSubmit: CreateFlashcardInput[] = []

    if (tabValue === "manual") {
      const draftPrompt = cardDraft.prompt.trim()
      const draftAnswer = cardDraft.answer.trim()

      cardsToSubmit = [...cards]
      if (draftPrompt && draftAnswer) {
        cardsToSubmit.push({ prompt: draftPrompt, answer: draftAnswer })
      }

      if (cardsToSubmit.length === 0) {
        setCardError("Add at least one card before creating a deck.")
        return
      }
      setJsonError(null)
    } else {
      try {
        const parsed = JSON.parse(jsonInput || "[]")
        const payloadCards = Array.isArray(parsed) ? parsed : parsed?.cards
        if (!Array.isArray(payloadCards)) {
          throw new Error("JSON must be an array of cards or an object with a 'cards' array.")
        }

        cardsToSubmit = payloadCards
          .map((item, index) => {
            const prompt = typeof item.prompt === "string" ? item.prompt.trim() : ""
            const answer = typeof item.answer === "string" ? item.answer.trim() : ""
            if (!prompt || !answer) {
              throw new Error(`Card at position ${index + 1} is missing a prompt or answer.`)
            }
            return {
              prompt,
              answer,
              easiness: typeof item.easiness === "number" ? item.easiness : undefined,
              interval: typeof item.interval === "number" ? item.interval : undefined,
              repetitions: typeof item.repetitions === "number" ? item.repetitions : undefined,
              dueDate: typeof item.dueDate === "string" ? item.dueDate : undefined,
              lastReviewed: typeof item.lastReviewed === "string" ? item.lastReviewed : undefined,
            }
          })

        if (cardsToSubmit.length === 0) {
          setJsonError("Your JSON is valid but contains no cards.")
          return
        }
        setJsonError(null)
        setCardError(null)
      } catch (error) {
        setJsonError(error instanceof Error ? error.message : "Unable to parse JSON file.")
        return
      }
    }

    const tags = formState.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    const payload: CreateDeckInput = {
      name: formState.name.trim(),
      description: formState.description.trim(),
      tags,
      cards: cardsToSubmit,
      isCommunity: false,
      author: "You",
      likes: 0,
    }

    if (mode === "edit" && initialDeck && onUpdate) {
      onUpdate(initialDeck.id, payload)
    } else {
      onCreate(payload)
    }
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={mode === "edit" ? "Edit deck" : "Create a deck"}
      description={
        mode === "edit"
          ? "Update the deck details or curate the cards you want to keep practicing."
          : "Name your deck, tag it for search, and add cards. You can always update it later."
      }
    >
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Deck name *</span>
              <Input
                required
                placeholder="Frontend Frameworks"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Tags</span>
              <Input
                placeholder="react, spaced repetition"
                value={formState.tags}
                onChange={(event) => setFormState((prev) => ({ ...prev, tags: event.target.value }))}
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Description</span>
            <Textarea
              rows={3}
              placeholder="Key principles, concepts, and interview trivia for React."
              value={formState.description}
              onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
            />
          </label>

          <Tabs
            value={tabValue}
            defaultValue="manual"
            onValueChange={(value) => setTabValue(value as "manual" | "json")}
          >
            <TabsList className="w-full flex justify-center">
              <TabsTrigger className="w-full" value="manual">Add cards manually</TabsTrigger>
              <TabsTrigger className="w-full" value="json">Import from JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-3 rounded-xl border border-dashed border-muted bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Card builder</p>
                  <p className="text-xs text-muted-foreground">
                    Add prompt & answer pairs. Cards saved here appear immediately in your deck.
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={handleAddCard}>
                  <PlusIcon className="mr-2 size-4" /> Add card
                </Button>
              </div>

              <div className="grid gap-3">
                <Input
                  placeholder="Prompt"
                  value={cardDraft.prompt}
                  onChange={(event) => setCardDraft((prev) => ({ ...prev, prompt: event.target.value }))}
                />
                <Textarea
                  rows={3}
                  placeholder="Answer"
                  value={cardDraft.answer}
                  onChange={(event) => setCardDraft((prev) => ({ ...prev, answer: event.target.value }))}
                />
              </div>

              {cards.length > 0 && (
                <div className="max-h-44 space-y-3 overflow-y-auto rounded-lg border border-muted bg-background p-3">
                  {cards.map((card, index) => (
                    <div key={`${card.prompt}-${index}`} className="space-y-2 rounded-md border border-muted/60 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">Prompt</p>
                          <p className="text-sm text-foreground">{card.prompt}</p>
                        </div>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveCard(index)}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Answer</p>
                        <p className="text-sm text-muted-foreground">{card.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {cardError && <p className="text-sm text-destructive">{cardError}</p>}
            </TabsContent>

            <TabsContent value="json" className="space-y-3 rounded-xl border border-dashed border-muted bg-muted/30 p-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold">Import from JSON</p>
                <p className="text-xs text-muted-foreground">
                  Upload a `.json` file or paste an array of cards with `prompt` and `answer` fields.
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <UploadIcon className="size-4" />
                <span>Upload JSON file</span>
              </label>
              <Input type="file" accept="application/json" onChange={handleJsonFileUpload} />
              <Textarea
                rows={8}
                placeholder='[\n  { "prompt": "Question", "answer": "Answer" }\n]'
                value={jsonInput}
                onChange={(event) => setJsonInput(event.target.value)}
              />
              {jsonError && <p className="text-sm text-destructive">{jsonError}</p>}
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">{mode === "edit" ? "Save changes" : "Create deck"}</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
