"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const WARM_ROUTES = [
  "/fund",
  "/portfolio",
  "/portfolio/charter",
  "/performance",
  "/risk",
  "/portfolio/register",
  "/industries",
  "/reports",
  "/markets",
  "/search",
  "/news",
  "/about",
  "/methodology",
  "/disclosures",
];

function scheduleIdle(work: () => void) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(work, { timeout: 2500 });
    return;
  }
  window.setTimeout(work, 1200);
}

export default function RouteWarmup() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin" || pathname.startsWith("/admin/")) return;

    let cancelled = false;
    let index = 0;

    const warmNext = () => {
      if (cancelled || index >= WARM_ROUTES.length) return;

      const route = WARM_ROUTES[index++];
      if (route !== pathname) router.prefetch(route);

      window.setTimeout(
        () => scheduleIdle(warmNext),
        550
      );
    };

    const timer = window.setTimeout(() => scheduleIdle(warmNext), 900);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pathname, router]);

  return null;
}
