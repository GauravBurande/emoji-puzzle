import { useState, useCallback, useEffect } from 'react';
import { GameState, EmojiPuzzle } from '../types/game';
import { getRandomPuzzle } from '../data/puzzles';

const INITIAL_LIVES = 3;
const TIME_BONUS_THRESHOLD = 10; // seconds

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentPuzzle: null,
    score: 0,
    streak: 0,
    lives: INITIAL_LIVES,
    gameMode: 'mixed',
    isGameActive: false,
    timeBonus: 0,
    startTime: 0
  });

  const [usedAnswers, setUsedAnswers] = useState<string[]>([]);

  const startGame = useCallback((mode: 'movie' | 'song' | 'mixed' = 'mixed') => {
    const firstPuzzle = getRandomPuzzle(mode);
    setGameState({
      currentPuzzle: firstPuzzle,
      score: 0,
      streak: 0,
      lives: INITIAL_LIVES,
      gameMode: mode,
      isGameActive: true,
      timeBonus: 0,
      startTime: Date.now()
    });
    setUsedAnswers([firstPuzzle.answer]);
  }, []);

  const nextPuzzle = useCallback(() => {
    if (!gameState.isGameActive) return;
    
    const newPuzzle = getRandomPuzzle(gameState.gameMode, usedAnswers);
    setGameState(prev => ({
      ...prev,
      currentPuzzle: newPuzzle,
      startTime: Date.now()
    }));
    setUsedAnswers(prev => [...prev, newPuzzle.answer]);
  }, [gameState.isGameActive, gameState.gameMode, usedAnswers]);

  const submitAnswer = useCallback((selectedAnswer: string) => {
    if (!gameState.currentPuzzle || !gameState.isGameActive) return false;

    const isCorrect = selectedAnswer === gameState.currentPuzzle.answer;
    const timeTaken = (Date.now() - gameState.startTime) / 1000;
    const timeBonus = timeTaken <= TIME_BONUS_THRESHOLD ? Math.floor((TIME_BONUS_THRESHOLD - timeTaken) * 2) : 0;

    if (isCorrect) {
      const streakMultiplier = Math.floor(gameState.streak / 5) + 1;
      const points = (10 * streakMultiplier) + timeBonus;
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        streak: prev.streak + 1,
        timeBonus
      }));
      
      setTimeout(nextPuzzle, 1500);
    } else {
      const newLives = gameState.lives - 1;
      setGameState(prev => ({
        ...prev,
        lives: newLives,
        streak: 0,
        isGameActive: newLives > 0,
        timeBonus: 0
      }));
    }

    return isCorrect;
  }, [gameState.currentPuzzle, gameState.isGameActive, gameState.startTime, gameState.streak, gameState.lives, nextPuzzle]);

  const resetGame = useCallback(() => {
    setGameState({
      currentPuzzle: null,
      score: 0,
      streak: 0,
      lives: INITIAL_LIVES,
      gameMode: 'mixed',
      isGameActive: false,
      timeBonus: 0,
      startTime: 0
    });
    setUsedAnswers([]);
  }, []);

  return {
    gameState,
    startGame,
    submitAnswer,
    resetGame,
    nextPuzzle
  };
};
