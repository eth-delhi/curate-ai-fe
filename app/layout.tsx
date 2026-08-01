import type { Metadata } from "next";
import { Inter, Source_Serif_4, Geist_Mono } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import { Magic } from "@/context/magic.provider";
import { Wagmi } from "@/context/wagmi.provider";
import { QueryProvider } from "@/context/query.provider";
import { RpcUrlProvider } from "@/context/rpcUrl.provider";
import { ContractAddressesProvider } from "@/context/contractAddresses.provider";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { WalletAutoConnect } from "@/components/wallet/WalletAutoConnect";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Curate AI — Rebuilding Trust in Content",
  description:
    "A fair, transparent content platform where quadratic voting and open AI scoring — not whales or bots — decide what rises.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${sourceSerif.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <RpcUrlProvider>
            <Magic>
              <Wagmi>
                <ContractAddressesProvider>
                  <WalletAutoConnect />
                  <ServiceWorkerRegistration />
                  {children}
                  <ToastContainer />
                </ContractAddressesProvider>
              </Wagmi>
            </Magic>
          </RpcUrlProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
