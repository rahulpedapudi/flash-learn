"use client";

import Image from "next/image";
import { redirect } from "next/navigation";
import { SignOutButton, useAuth, useUser } from "@clerk/nextjs";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  const { userId } = useAuth();

  if (!userId) {
    redirect("/");
  }

  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  const primaryEmail = user.emailAddresses[0]?.emailAddress ?? "Not set";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row">
      <section className="flex-1 space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="items-center space-y-4 text-center">
            <div className="h-24 w-24 overflow-hidden rounded-full border border-border/60">
              <Image src={user.imageUrl} alt="Profile picture" width={96} height={96} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold">{user.fullName ?? "Unnamed user"}</CardTitle>
              <CardDescription>Manage your FlashLearn account details powered by Clerk.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 text-sm">
              <div className="flex justify-between rounded-lg border bg-muted/40 px-4 py-3">
                <span className="text-muted-foreground">Email</span>
                <span>{primaryEmail}</span>
              </div>
              <div className="flex justify-between rounded-lg border bg-muted/40 px-4 py-3">
                <span className="text-muted-foreground">First name</span>
                <span>{user.firstName ?? "—"}</span>
              </div>
              <div className="flex justify-between rounded-lg border bg-muted/40 px-4 py-3">
                <span className="text-muted-foreground">Last name</span>
                <span>{user.lastName ?? "—"}</span>
              </div>
            </div>
            <SignOutButton>
              <Button variant="outline" className="w-full">
                Sign out
              </Button>
            </SignOutButton>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default ProfilePage;
