import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { ArrowLeft, Trophy, Medal, Award, Wallpaper } from "lucide-react";
import { LeaderboardEntry } from "../types/game";
import * as anchor from "@project-serum/anchor";

interface LeaderboardProps {
  onBack: () => void;
}

const PROGRAM_ID = new PublicKey(
  "6ytMmvJR2YYsuPR7FSQUQnb7UGi1rf36BrXzZUNvKsnj"
);
const GAME_DOMAIN = 1001;

export function Leaderboard({ onBack }: LeaderboardProps) {
  const { connection } = useConnection();
  const { publicKey: walletPublicKey } = useWallet();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      const accounts = await connection.getProgramAccounts(PROGRAM_ID);

      const leaderboardEntries: LeaderboardEntry[] = [];

      for (const account of accounts) {
        try {
          const data = account.account.data;
          if (data.length >= 16) {
            const score = Number(data.readBigUInt64LE(data.length - 8));
            const publicKeyStr = account.pubkey.toString();

            leaderboardEntries.push({
              publicKey: publicKeyStr,
              score,
              timestamp: Date.now(),
            });
          }
        } catch (error) {
          console.error("Error parsing account:", error);
        }
      }

      // Sort by score descending and remove duplicates (keep highest score per user)
      const uniqueEntries = new Map<string, LeaderboardEntry>();

      leaderboardEntries.forEach((entry) => {
        const existing = uniqueEntries.get(entry.publicKey);
        if (!existing || entry.score > existing.score) {
          uniqueEntries.set(entry.publicKey, entry);
        }
      });

      const sortedEntries = Array.from(uniqueEntries.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      setEntries(sortedEntries);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-400" size={24} />;
      case 2:
        return <Medal className="text-gray-300" size={24} />;
      case 3:
        return <Award className="text-orange-400" size={24} />;
      default:
        return <span className="text-white font-bold text-lg">#{rank}</span>;
    }
  };

  const formatPublicKey = (pubkey: string) => {
    if (walletPublicKey) {
      const [pda] = PublicKey.findProgramAddressSync(
        [
          new anchor.BN(GAME_DOMAIN).toArrayLike(Buffer, "le", 8),
          Buffer.from(
            new anchor.BN(
              walletPublicKey.toBuffer().readBigUInt64LE(0)
            ).toArray("le", 8)
          ),
        ],
        PROGRAM_ID
      );
      console.log(pda.toBase58());
      if (pubkey === pda.toBase58()) {
        return "You";
      }
    }
    return `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Leaderboard</h1>
        </div>

        {/* Leaderboard */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          {loading ? (
            <div className="text-center text-white py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              Loading leaderboard...
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center text-white/80 py-8">
              <Trophy className="mx-auto mb-4 text-white/50" size={48} />
              <p>No scores yet!</p>
              <p className="text-sm mt-2">
                Be the first to play and set a high score!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div
                  key={entry.publicKey}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0
                      ? "bg-yellow-500/20 border border-yellow-500/50"
                      : index === 1
                      ? "bg-gray-500/20 border border-gray-500/50"
                      : index === 2
                      ? "bg-orange-500/20 border border-orange-500/50"
                      : "bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getRankIcon(index + 1)}
                    <div>
                      <div className="text-white font-semibold">
                        {formatPublicKey(entry.publicKey)}
                      </div>
                      <div className="text-white/60 text-sm">
                        Player #{index + 1}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">
                      {entry.score}
                    </div>
                    <div className="text-white/60 text-sm">points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
    </div>
  );
}
