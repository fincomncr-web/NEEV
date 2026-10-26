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

export default function RouteWarmup() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin" || pathname.startsWith("/admin/")) return;

    try {
      if (sessionStorage.getItem("neev-routes-warmed") === "1") return;
      sessionStorage.setItem("neev-routes-warmed", "1");
    } catch {
      // If storage is unavailable, still warm the routes for this mount.
    }

    let cancelled = false;
    let index = 0;

    const warmBatch = () => {
      if (cancelled || index >= WARM_ROUTES.length) return;

      const batch = WARM_ROUTES.slice(index, index + 3).filter((route) => route !== pathname);
      index += 3;

      batch.forEach((route) => router.prefetch(route));

      if (index < WARM_ROUTES.length) {
        window.setTimeout(warmBatch, 900);
      }
    };

    const start = () => window.setTimeout(warmBatch, 600);
    const idleHandle =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(start, { timeout: 2000 })
        : start();

    return () => {
      cancelled = true;
      if ("cancelIdleCallback" in window && typeof idleHandle === "number") {
        window.cancelIdleCallback(idleHandle);
      } else if (typeof idleHandle === "number") {
        window.clearTimeout(idleHandle);
      }
    };
  }, [pathname, router]);

  return null;
}
