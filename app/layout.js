import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SessionProvider } from "next-auth/react";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Levora — Level up your career with AI",
  description: "Level up your career with AI — resume building, interview prep, and real-time industry insights.",
  icons: {
    icon: "/logo-image.png",
    shortcut: "/logo-image.png",
    apple: "/logo-image.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className}`}>

        {/* ── OneSignal Scripts ─────────────────────────── */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          defer
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            // OneSignal v16 requires HTTPS — skip on localhost HTTP
            if (window.location.protocol === 'https:') {
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(async function(OneSignal) {
                await OneSignal.init({
                  appId: "5bfc9f11-d3ba-46c3-bb19-e7f461892c4f",
                  promptOptions: {
                    slidedown: {
                      prompts: [{
                        type: "push",
                        autoPrompt: true,
                        text: {
                          actionMessage: "Levora would like to send you career updates and alerts.",
                          acceptButton: "Allow",
                          cancelButton: "No Thanks"
                        }
                      }]
                    }
                  }
                });

                try {
                  const res = await fetch("/api/auth/session");
                  const session = await res.json();
                  if (session?.user?.id) {
                    await OneSignal.login(session.user.id);
                  }
                } catch(e) {
                  console.warn("OneSignal user login skipped:", e.message);
                }
              });
            }
          `}
        </Script>

        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors position="top-center" expand={true} />

            {/* ── Premium Light Footer ──────────────────────── */}
            <Footer />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}