import "./globals.css";
import NavBar from "@/components/NavBar";
import NetworkBackground from "@/components/NetworkBackground";

export const metadata = {
  title: "GenLayer Community Quiz",
  description:
    "Test your knowledge of GenLayer, AI, and Web3 — then climb the community leaderboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NetworkBackground />
        <NavBar />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
      </body>
    </html>
  );
}
