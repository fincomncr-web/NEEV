import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "NEEV | New-age Equity Evaluation & Valuation",
    template: "%s | NEEV",
  },
  description:
    "NEEV is a student-managed Indian equity investment initiative by Finception at Great Lakes Institute of Management, Gurgaon.",
  applicationName: "NEEV",
  keywords: [
    "NEEV",
    "Finception",
    "Great Lakes Institute of Management",
    "Indian equity research",
    "student managed investment fund",
    "portfolio research",
    "fundamental equity research",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable + " " + ibmPlexMono.variable + " h-full antialiased"}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
