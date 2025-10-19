import "@/app/globals.css";

import { ClerkProvider } from "@clerk/nextjs";

import { AppLayout } from "@/components/layout/AppLayout";
import { DeckProvider } from "@/context/DeckContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <DeckProvider>
            <AppLayout>{children}</AppLayout>
          </DeckProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
