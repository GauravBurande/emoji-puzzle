import { useState } from "react";
import { useSolanaWallet } from "../hooks/useWallet";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { GameMode } from "../types/game";
import { Play, Trophy, Gamepad2, Music, Film, Shuffle } from "lucide-react";

interface MainMenuProps {
  onStartGame: (mode: GameMode) => void;
  onShowLeaderboard: () => void;
}

export const MainMenu = ({ onStartGame, onShowLeaderboard }: MainMenuProps) => {
  const { isConnected } = useSolanaWallet();
  const [selectedMode, setSelectedMode] = useState<GameMode>("mixed");

  const gameModes = [
    {
      id: "movie" as GameMode,
      title: "Movies Only",
      description: "Guess movie titles from emojis",
      icon: Film,
      color: "from-red-500 to-pink-500",
    },
    {
      id: "song" as GameMode,
      title: "Songs Only",
      description: "Guess song titles from emojis",
      icon: Music,
      color: "from-green-500 to-blue-500",
    },
    {
      id: "mixed" as GameMode,
      title: "Mixed Mode",
      description: "Movies and songs combined",
      icon: Shuffle,
      color: "from-purple-500 to-indigo-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎮🎭🎵</div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Emoji Puzzle
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Guess movies and songs from emoji clues!
          </p>

          {/* Wallet Connection */}
          <div className="mb-8">
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700" />
            {isConnected && (
              <p className="text-green-400 text-sm mt-2">
                ✅ Connected! Your scores will be saved on-chain
              </p>
            )}
          </div>
        </div>

        {/* Game Mode Selection */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Choose Your Game Mode
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {gameModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`
                    p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                    ${
                      isSelected
                        ? "border-white bg-white/10 shadow-2xl"
                        : "border-white/20 bg-white/5 hover:border-white/40"
                    }
                  `}
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${mode.color} flex items-center justify-center`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{mode.title}</h3>
                  <p className="text-gray-300 text-sm">{mode.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-md mx-auto space-y-4">
          <button
            disabled={!isConnected}
            onClick={() => onStartGame(selectedMode)}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Play className="w-6 h-6" />
            {isConnected ? "Start Game" : "Connect Wallet Above"}
          </button>

          <button
            onClick={onShowLeaderboard}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Trophy className="w-6 h-6" />
            Leaderboard
          </button>
        </div>

        {/* Game Features */}
        <div className="max-w-2xl mx-auto mt-16">
          <h3 className="text-xl font-bold text-center mb-8">Game Features</h3>
          <div className="grid md:grid-cols-2 gap-6 text-center">
            <div className="bg-white/5 rounded-lg p-6">
              <Gamepad2 className="w-8 h-8 mx-auto mb-3 text-blue-400" />
              <h4 className="font-semibold mb-2">Multiple Lives</h4>
              <p className="text-sm text-gray-300">
                3 lives per game with streak bonuses
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <Trophy className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
              <h4 className="font-semibold mb-2">On-Chain Scores</h4>
              <p className="text-sm text-gray-300">
                Leaderboard stored on Solana blockchain
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
