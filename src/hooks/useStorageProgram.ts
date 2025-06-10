import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { useCallback, useState, useMemo } from "react";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { idl } from "./idl";

const PROGRAM_ID = new PublicKey(
  "6ytMmvJR2YYsuPR7FSQUQnb7UGi1rf36BrXzZUNvKsnj"
);
const connection = new Connection("https://api.devnet.solana.com");

export function useStorageProgram() {
  const [loading, setLoading] = useState(false);
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const domain = 1001;

  const provider = useMemo(() => {
    if (!anchorWallet) return null;
    return new anchor.AnchorProvider(connection, anchorWallet, {
      commitment: "confirmed",
    });
  }, [anchorWallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new anchor.Program(idl, provider);
  }, [provider]);

  const saveScore = useCallback(
    async (score: number) => {
      if (!publicKey || !program) return;
      setLoading(true);
      try {
        const key = publicKey.toBuffer().readBigUInt64LE(0);
        const [pda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from(new anchor.BN(domain).toArray("le", 8)),
            Buffer.from(new anchor.BN(key).toArray("le", 8)),
          ],
          PROGRAM_ID
        );

        let accountExists = true;
        try {
          await program.provider.connection.getAccountInfo(pda);
        } catch {
          accountExists = false;
        }

        if (!accountExists) {
          await program.methods
            .initialize(new anchor.BN(domain), new anchor.BN(key))
            .accounts({
              val: pda,
              signer: publicKey,
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
    },
    [publicKey, program]
  );

  const getScore = useCallback(async (): Promise<number | null> => {
    if (!publicKey || !program) return null;
    setLoading(true);
    try {
      const key = publicKey.toBuffer().readBigUInt64LE(0);
      const [pda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(new anchor.BN(domain).toArray("le", 8)),
          Buffer.from(new anchor.BN(key).toArray("le", 8)),
        ],
        PROGRAM_ID
      );

      const value = await program.methods
        .get(new anchor.BN(domain), new anchor.BN(key))
        .accounts({
          val: pda,
        })
        .rpc();

      return Number(value);
    } catch (err: any) {
      console.error("Error getting score", err);
      alert("Failed to get score: " + (err?.message || err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [publicKey, program]);

  return { saveScore, getScore, loading };
}
