import { UserMenu } from "@/app/components/layout/UserMenu";
import { RootClientProviders } from "@/app/components/providers/RootClientProviders";
import { getServerSession } from "@/lib/server-auth";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forms Dashboard",
  description: "Mini-app to manage forms with role-based access.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <RootClientProviders initialSession={session}>
          <div className="flex min-h-screen flex-col">
            <header className="border-b bg-white/80 backdrop-blur dark:bg-black/60">
              <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:flex-nowrap sm:gap-4">
                <a
                  href="/"
                  className="text-sm font-semibold tracking-tight"
                >
                  Forms Dashboard
                </a>
                <UserMenu />
              </div>
            </header>
            <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-8">
              {children}
            </main>
          </div>
        </RootClientProviders>
        <SpeedInsights />
      </body>
    </html>
  );
}
