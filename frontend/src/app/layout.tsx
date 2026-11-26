import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StrategyLab AI | The Strategy Workbench",
  description:
    "Design, backtest and paper-trade crypto strategies with transparent analytics. StrategyLab AI is an independent strategy research workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
