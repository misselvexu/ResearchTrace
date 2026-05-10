import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4, Noto_Serif_SC } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LangThemeBridge } from "@/components/providers/lang-theme-bridge";
import { ToastHost } from "@/components/providers/toast";
import { MswProvider } from "@/components/providers/msw-provider";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "研迹 ResearchTrace · A Paper for One Reader. You.",
  description:
    "ResearchTrace 研迹 — a personal research digest. Topics, briefs, claims, evidence — curated by your AI agents, editorialized for one reader: you.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-theme="light"
      data-lang={locale}
      suppressHydrationWarning
      className={`${sourceSerif.variable} ${inter.variable} ${jetbrainsMono.variable} ${notoSerifSC.variable}`}
    >
      <head>
        {/* Pre-paint: hydrate sidebar collapsed state from localStorage so the
            workspace shell does not flicker between expanded/collapsed on
            first render. */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html:
              "try{var v=localStorage.getItem('rt.sidebar.collapsed');if(v==='1'||v==='0'){document.documentElement.setAttribute('data-sidebar-collapsed',v);}}catch(_){}",
          }}
        />
      </head>
      <body className="min-h-screen bg-bg-paper text-ink-primary antialiased">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <LangThemeBridge />
            <MswProvider>{children}</MswProvider>
            <ToastHost />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
