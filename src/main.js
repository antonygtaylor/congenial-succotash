import { GameLoop } from './core/GameLoop.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const container = document.getElementById('game-container');

  if (canvas && container) {
    const game = new GameLoop(canvas, container);
    game.start();
  } else {
    console.error('Failed to initialize game: canvas or container missing.');
  }
});
