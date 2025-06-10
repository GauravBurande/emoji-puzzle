import { useWallet } from "@solana/wallet-adapter-react";

export const useSolanaWallet = () => {
  const wallet = useWallet();

  return {
    ...wallet,
    isConnected: wallet.connected && wallet.publicKey !== null,
    address: wallet.publicKey?.toString() || "",
    shortAddress:
      wallet.publicKey?.toString().slice(0, 4) +
        "..." +
        wallet.publicKey?.toString().slice(-4) || "",
  };
};
