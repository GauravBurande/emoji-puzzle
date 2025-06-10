import { useState, useEffect } from "react";
import { useGame } from "../hooks/useGame";
import { useStorageProgram } from "../hooks/useStorageProgram";
import { useSolanaWallet } from "../hooks/useWallet";
import { Heart, Trophy, Zap, Clock } from "lucide-react";

interface GameScreenProps {
  onBackToMenu: () => void;
  gameMode: "movie" | "song" | "mixed";
}

export const GameScreen = ({ onBackToMenu, gameMode }: GameScreenProps) => {
  const { gameState, startGame, submitAnswer, resetGame } = useGame();
  const storage = useStorageProgram();
  const saveScore = storage?.saveScore;
  const loading = storage?.loading;
  const { isConnected } = useSolanaWallet();
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    startGame(gameMode);
  }, [startGame, gameMode]);

  useEffect(() => {
    if (gameState.isGameActive && gameState.startTime) {
      const interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - gameState.startTime) / 1000));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gameState.isGameActive, gameState.startTime]);

  useEffect(() => {
    if (!gameState.isGameActive && gameState.score > 0 && isConnected) {
      if (saveScore) {
        saveScore(gameState.score);
      }
    }
  }, [
    gameState.isGameActive,
    gameState.score,
    isConnected,
    saveScore,
    gameMode,
  ]);

  const handleAnswerSelect = async (answer: string) => {
    if (showResult) return;

    setSelectedAnswer(answer);
    const correct = submitAnswer(answer);
    setIsCorrect(correct);
    setShowResult(true);
    setTimer(0);

    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer("");
    }, 1500);
  };

  const handleRestart = () => {
    resetGame();
    startGame(gameMode);
  };

  if (!gameState.currentPuzzle) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-xl">Loading puzzle...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBackToMenu}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div className="text-lg font-bold text-purple-400">
            {gameMode.toUpperCase()} MODE
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
            <div className="text-sm text-gray-400">Score</div>
            <div className="font-bold">{gameState.score}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <Zap className="w-5 h-5 mx-auto mb-1 text-orange-400" />
            <div className="text-sm text-gray-400">Streak</div>
            <div className="font-bold">{gameState.streak}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="flex justify-center mb-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${
                    i < gameState.lives
                      ? "text-red-500 fill-current"
                      : "text-gray-600"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-400">Lives</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <div className="text-sm text-gray-400">Time</div>
            <div className="font-bold">{timer}s</div>
          </div>
        </div>

        {/* Game Over Screen */}
        {!gameState.isGameActive && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6 text-center">
            <div className="text-2xl font-bold mb-2">Game Over!</div>
            <div className="text-lg text-purple-400 mb-4">
              Final Score: {gameState.score}
            </div>
            {isConnected && (
              <div className="text-sm text-green-400 mb-4">
                {loading ? "Saving score..." : "Score saved to blockchain!"}
              </div>
            )}
            <button
              onClick={handleRestart}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Current Puzzle */}
        {gameState.isGameActive && (
          <>
            <div className="bg-gray-800 rounded-xl p-8 mb-6 text-center">
              <div className="text-6xl mb-4">
                {gameState.currentPuzzle.emoji}
              </div>
              <div className="text-sm text-gray-400 mb-2">
                Guess the {gameState.currentPuzzle.type}:
              </div>
              {gameState.timeBonus > 0 && (
                <div className="text-sm text-green-400">
                  +{gameState.timeBonus} time bonus!
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {gameState.currentPuzzle.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-lg font-medium transition-all ${
                    showResult
                      ? option === gameState.currentPuzzle?.answer
                        ? "bg-green-600 text-white"
                        : option === selectedAnswer
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-400"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Result Feedback */}
            {showResult && (
              <div
                className={`text-center p-4 rounded-lg mb-4 ${
                  isCorrect ? "bg-green-600" : "bg-red-600"
                }`}
              >
                <div className="text-xl font-bold">
                  {isCorrect ? "🎉 Correct!" : "❌ Wrong!"}
                </div>
                {!isCorrect && (
                  <div className="text-sm mt-1">
                    Answer: {gameState.currentPuzzle.answer}
                  </div>
                )}
              </div>
            )}

            {/* Hints */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Hints:</div>
              <ul className="text-sm space-y-1">
                {gameState.currentPuzzle.hints.map((hint, index) => (
                  <li key={index} className="text-gray-300">
                    • {hint}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
