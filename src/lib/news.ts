export interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  description: string;
}

const FEEDS: { url: string; source: string }[] = [
  {
    url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    source: "The Economic Times",
  },
  { url: "https://www.livemint.com/rss/markets", source: "Mint" },
  { url: "https://www.business-standard.com/rss/markets-106.rss", source: "Business Standard" },
];

function decodeEntities(str: string): string {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function extractTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeEntities(match[1]) : "";
}

function parseRss(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  for (const block of itemBlocks) {
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDateRaw = extractTag(block, "pubDate");
    const description = extractTag(block, "description");
    if (!title || !link) continue;

    const parsedDate = pubDateRaw ? new Date(pubDateRaw) : new Date();
    const pubDate = Number.isNaN(parsedDate.getTime())
      ? new Date().toISOString()
      : parsedDate.toISOString();

    items.push({ title, link, source, pubDate, description: description.slice(0, 220) });
  }

  return items;
}

export async function getNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; NeevNewsBot/1.0)" },
        next: { revalidate: 300 },
      });
      if (!res.ok) throw new Error(`${feed.source} responded ${res.status}`);
      const xml = await res.text();
      return parseRss(xml, feed.source);
    })
  );

  const items = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const seen = new Set<string>();
  const deduped = items.filter((item) => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });

  return deduped.slice(0, 60);
}
