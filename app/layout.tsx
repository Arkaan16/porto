import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import SplashScreen from "@/components/ui/SplashScreen";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio | Arkaan",
  description: "Personal portfolio website built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem("theme");
                  if (t === "light") document.documentElement.classList.remove("dark");
                  else if (t === "dark") document.documentElement.classList.add("dark");
                  else if (window.matchMedia("(prefers-color-scheme: light)").matches) document.documentElement.classList.remove("dark");
                } catch(e) {}
                try {
                  if (sessionStorage.getItem("porto:splash-seen") === "1") {
                    document.documentElement.setAttribute("data-splash", "skip");
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <SplashScreen />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
