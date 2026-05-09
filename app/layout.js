// import { Inter } from "next/font/google";
// import "./globals.css";
// import { ThemeProvider } from "@/components/theme-provider";
// import Header from "@/components/Header";
// import { Toaster } from "@/components/ui/sonner";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { SessionProvider } from "next-auth/react";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "CareerForge — Powered by AI",
//   description: "Advanced AI-powered career guidance, resume building, and interview preparation.",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en" suppressHydrationWarning={true}>
//       <body className={`${inter.className}`}>
//         <SessionProvider>
//           <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
//             <Header />
//             <main className="min-h-screen">{children}</main>
//             <Toaster richColors />

//             {/* ── Premium Light Footer ──────────────────────── */}
//             <footer className="w-full bg-white border-t border-border/60">
//               <div className="container mx-auto px-4 max-w-7xl">
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pt-16 pb-12">
//                   {/* Brand Column */}
//                   <div className="space-y-5 lg:col-span-1">
//                     <Link href="/" className="text-2xl font-extrabold tracking-tight gradient-title">
//                       CareerForge
//                     </Link>
//                     <p className="text-muted-foreground leading-relaxed text-sm max-w-[280px]">
//                       Empowering professionals to achieve their true potential through advanced AI guidance, skill building, and interview intelligence.
//                     </p>
//                   </div>

//                   {/* Explore Column */}
//                   <div>
//                     <h4 className="font-bold text-foreground text-sm uppercase tracking-wider mb-5">Explore</h4>
//                     <ul className="space-y-3.5 text-muted-foreground text-sm">
//                       {[["Dashboard","/dashboard"],["Resume Builder","/resume"],["Interview Prep","/interviewprep"],["Job Search","/job-finding"]].map(([label, href]) => (
//                         <li key={href}><Link href={href} className="hover:text-primary transition-colors duration-200">{label}</Link></li>
//                       ))}
//                     </ul>
//                   </div>

//                   {/* Company Column */}
//                   <div>
//                     <h4 className="font-bold text-foreground text-sm uppercase tracking-wider mb-5">Company</h4>
//                     <ul className="space-y-3.5 text-muted-foreground text-sm">
//                       {["About Us","Privacy Policy","Terms of Service"].map(label => (
//                         <li key={label}><Link href="#" className="hover:text-primary transition-colors duration-200">{label}</Link></li>
//                       ))}
//                     </ul>
//                   </div>

//                   {/* Support Column */}
//                   <div className="space-y-5">
//                     <h4 className="font-bold text-foreground text-sm uppercase tracking-wider mb-5">Support</h4>
//                     <p className="text-muted-foreground text-sm leading-relaxed">Need help with our platform? Our team is here to guide you.</p>
//                     <Button variant="outline" className="w-full rounded-xl border-border hover:bg-accent hover:text-accent-foreground transition-all">
//                       Contact Support
//                     </Button>
//                   </div>
//                 </div>

//                 <div className="py-6 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
//                   <p>© 2026 CareerForge. All rights reserved.</p>
//                 </div>
//               </div>
//             </footer>
//           </ThemeProvider>
//         </SessionProvider>
//       </body>
//     </html>
//   );
// }


import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SessionProvider } from "next-auth/react";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CareerForge — Powered by AI",
  description: "Advanced AI-powered career guidance, resume building, and interview preparation.",
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
                          actionMessage: "CareerForge AI would like to send you career updates and alerts.",
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
            <footer className="w-full bg-white border-t border-border/60">
              <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pt-16 pb-12">
                  {/* Brand Column */}
                  <div className="space-y-5 lg:col-span-1">
                    <Link href="/" className="text-2xl font-extrabold tracking-tight gradient-title">
                      CareerForge
                    </Link>
                    <p className="text-muted-foreground leading-relaxed text-sm max-w-[280px]">
                      Empowering professionals to achieve their true potential through advanced AI guidance, skill building, and interview intelligence.
                    </p>
                  </div>

                  {/* Explore Column */}
                  <div>
                    <h4 className="font-bold text-foreground text-sm uppercase tracking-wider mb-5">Explore</h4>
                    <ul className="space-y-3.5 text-muted-foreground text-sm">
                      {[["Dashboard", "/dashboard"], ["Resume Builder", "/resume"], ["Interview Prep", "/interviewprep"], ["Job Search", "/job-finding"]].map(([label, href]) => (
                        <li key={href}><Link href={href} className="hover:text-primary transition-colors duration-200">{label}</Link></li>
                      ))}
                    </ul>
                  </div>

                  {/* Company Column */}
                  <div>
                    <h4 className="font-bold text-foreground text-sm uppercase tracking-wider mb-5">Company</h4>
                    <ul className="space-y-3.5 text-muted-foreground text-sm">
                      {["About Us", "Privacy Policy", "Terms of Service"].map(label => (
                        <li key={label}><Link href="#" className="hover:text-primary transition-colors duration-200">{label}</Link></li>
                      ))}
                    </ul>
                  </div>

                  {/* Support Column */}
                  <div className="space-y-5">
                    <h4 className="font-bold text-foreground text-sm uppercase tracking-wider mb-5">Support</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">Need help with our platform? Our team is here to guide you.</p>
                    <Button variant="outline" className="w-full rounded-xl border-border hover:bg-accent hover:text-accent-foreground transition-all">
                      Contact Support
                    </Button>
                  </div>
                </div>

                <div className="py-6 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                  <p>© 2026 CareerForge. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}