import { getServerSession } from "@/lib/server-auth";
import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Forms Dashboard – Landing',
  description: 'Manage forms with role-based access, validation, and a clean dashboard UI.',
  openGraph: {
    title: 'Forms Dashboard',
    description: 'Mini-app to manage forms with role-based access and validation.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forms Dashboard',
    description: 'Mini-app to manage forms with role-based access and validation.'
  }
};

export default async function Home() {
  const session = await getServerSession();

  if (session) {
    redirect('/forms');
  }

  return (
    <div className="flex w-full flex-1 items-center justify-center">
      <section className="grid w-full gap-10 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
            Simple <span className="underline decoration-emerald-500">Forms Dashboard</span> for small teams
          </h1>
          <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Create, edit, and manage forms with server-side rendering, strict validation, and role-based access control.
            Built with Next.js App Router.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-zinc-50 shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Get started – login
            </a>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="relative h-64 w-64">
            <Image
              src="/window.svg"
              alt="Dashboard preview"
              fill
              priority
              className="rounded-2xl border border-zinc-200 bg-zinc-50 object-contain p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
