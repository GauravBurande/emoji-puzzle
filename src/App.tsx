import { useState } from "react";
import { WalletContextProvider } from "./components/WalletProvider";
import { MainMenu } from "./components/MainMenu";
import { GameScreen } from "./components/GameScreen";
import { Leaderboard } from "./components/Leaderboard";
import { GameMode, Screen } from "./types/game";
import "@solana/wallet-adapter-react-ui/styles.css";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("menu");
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>("mixed");

  const handleStartGame = (mode: GameMode) => {
    setSelectedGameMode(mode);
    setCurrentScreen("game");
  };

  const handleBackToMenu = () => {
    setCurrentScreen("menu");
  };

  const handleShowLeaderboard = () => {
    setCurrentScreen("leaderboard");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "menu":
        return (
          <MainMenu
            onStartGame={handleStartGame}
            onShowLeaderboard={handleShowLeaderboard}
          />
        );
      case "game":
        return (
          <GameScreen
            onBackToMenu={handleBackToMenu}
            gameMode={selectedGameMode}
          />
        );
      case "leaderboard":
        return <Leaderboard onBack={handleBackToMenu} />;
      default:
        return (
          <MainMenu
            onStartGame={handleStartGame}
            onShowLeaderboard={handleShowLeaderboard}
          />
        );
    }
  };

  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-gray-900">{renderScreen()}</div>
    </WalletContextProvider>
  );
}

export default App;
