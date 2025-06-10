import * as anchor from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(
  "6ytMmvJR2YYsuPR7FSQUQnb7UGi1rf36BrXzZUNvKsnj"
);

import idl from "../idl.json";
import { useCallback } from "react";
import { useState } from "react";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";

const connection = new Connection("https://api.devnet.solana.com");

export function useStorageProgram() {
  const [loading, setLoading] = useState(false);
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();

  const domain = 1001;
  const key = publicKey?.toBuffer().readBigUInt64LE(0);

  const provider = new anchor.AnchorProvider(connection, anchorWallet!, {
    commitment: "processed",
  });
  const program = new anchor.Program(idl as anchor.Idl, PROGRAM_ID, provider);
  const saveScore = useCallback(async (score: number) => {
    setLoading(true);
    try {
      const [pda] = PublicKey.findProgramAddressSync(
        [
          new anchor.BN(domain).toArrayLike(Buffer, "le", 8),
          Buffer.from(new anchor.BN(key).toArray("le", 8)),
        ],
        PROGRAM_ID
      );

      let accountExists = true;
      try {
        await program.account.val.fetch(pda);
      } catch (e) {
        accountExists = false;
      }

      if (!accountExists) {
        await program.methods
          .initialize(new anchor.BN(domain), new anchor.BN(key))
          .accounts({
            val: pda,
            authority: publicKey!,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
      }

      await program.methods
        .set(new anchor.BN(domain), new anchor.BN(key), new anchor.BN(score))
        .accounts({
          val: pda,
        })
        .rpc();

      alert("Score saved successfully!");
    } catch (err: any) {
      console.error("Error saving score", err);
      alert("Failed to save score: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  }, []);

  const getScore = useCallback(async (): Promise<number | null> => {
    setLoading(true);
    try {
      const program = new anchor.Program(
        idl as anchor.Idl,
        PROGRAM_ID,
        provider
      );

      const [pda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(new anchor.BN(domain).toArray("le", 8)),
          Buffer.from(new anchor.BN(key).toArray("le", 8)),
        ],
        PROGRAM_ID
      );

      const account = await program.account.val.fetch(pda);
      return account.value.toNumber();
    } catch (err: any) {
      console.error("Error getting score", err);
      alert("Failed to get score: " + (err?.message || err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { saveScore, getScore, loading };
}
