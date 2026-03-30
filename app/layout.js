import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider, GoogleOneTap } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react"
import TopLoader from "./_components/TopLoader";
import PageTransition from "./_components/PageTransition";
import { Suspense } from "react";

const inter = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "CourseConnect – AI Course Generator",
  description: "Generate engaging courses in seconds with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          <GoogleOneTap />
          <Suspense fallback={null}>
            <TopLoader />
          </Suspense>
          <PageTransition>
            {children}
          </PageTransition>
        </ClerkProvider>
      </body>
    </html>
  );
}