
import { defineChain } from "viem";

export const valueChain = defineChain({
  id: 286623,
  name: "ValueChain",
  nativeCurrency: {
    name: "SOSO",
    symbol: "SOSO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.valuechain.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "ValueChain Explorer",
      url: "https://main-scan.valuechain.xyz",
    },
  },
  testnet: false,
});
