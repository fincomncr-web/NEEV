import type { Metadata } from "next";
import { getNews } from "@/lib/news";

export const metadata: Metadata = {
  title: "Finance News | Finception",
  description: "A live, continuously updating feed of Indian and global financial news.",
};

export const revalidate = 300;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="font-label text-[11px] text-accent">LIVE FEED</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Finance News</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Live, continuously updating market-moving headlines from across Indian and global
          markets - read right here.
        </p>
      </header>

      {news.length === 0 ? (
        <div className="card p-6 text-sm text-muted">
          Unable to load news right now. Please refresh shortly.
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <a
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noreferrer noopener"
              className="card block p-5 transition-colors hover:border-accent"
            >
              <div className="flex items-center justify-between gap-3 text-xs text-muted">
                <span className="font-medium text-accent">{item.source}</span>
                <span>{timeAgo(item.pubDate)}</span>
              </div>
              <h2 className="mt-2 text-base font-semibold text-foreground">{item.title}</h2>
              {item.description && (
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
