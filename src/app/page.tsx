import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/20 px-6 text-center">
      <div className="flex max-w-2xl flex-col gap-4">
        <span className="mx-auto rounded-full border border-border/60 bg-background px-4 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Welcome to FlashLearn
        </span>
        <h1 className="text-balance text-4xl font-semibold sm:text-5xl">
          Master concepts faster with spaced repetition.
        </h1>
        <p className="text-balance text-sm text-muted-foreground sm:text-base">
          Organise your knowledge into decks, study with the proven SM-2 algorithm, and explore curated content from the community. Start from the dashboard to create your first deck.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {/* <Link
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          href="/dashboard"
        >
          Go to dashboard
        </Link> */}
        <SignedOut>
          <SignInButton mode="modal" forceRedirectUrl={"/dashboard"} >
            <Button className="rounded-full border border-border px-12 py-6 text-md   font-semibold text-white transition hover:bg-primary hover:text-background">
              Get Started
            </Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <Link
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-background"
            href="/dashboard"
          >
            Go to dashboard
          </Link>
        </SignedIn>
        {/* <Link
          className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-background"
          href="/explore"
        >
          Browse community decks
        </Link> */}
      </div>
    </div>
  );
};

export default HomePage;
