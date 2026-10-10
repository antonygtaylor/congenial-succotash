/**
 * HUD & UI Overlay Manager
 * Handles score rendering, current Circle indicator, game controls display, and Game Over screen.
 */
export class HUD {
  constructor(container, onRestart) {
    this.container = container;
    this.onRestart = onRestart;

    this._createUIElements();
  }

  _createUIElements() {
    // Top Score Bar Overlay
    this.hudElement = document.createElement('div');
    this.hudElement.id = 'hud';
    this.hudElement.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      pointer-events: none;
      z-index: 10;
    `;

    // Left: Depth / Survival Score Counter
    this.scoreBox = document.createElement('div');
    this.scoreBox.style.cssText = `
      background: rgba(15, 5, 8, 0.85);
      border: 1px solid #7a2222;
      padding: 10px 20px;
      border-radius: 6px;
      box-shadow: 0 0 15px rgba(255, 0, 0, 0.2);
    `;
    this.scoreBox.innerHTML = `
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #a38978;">Descent Depth</div>
      <div id="score-text" style="font-size: 26px; font-weight: bold; color: #f0e6d2; font-family: Georgia, serif;">0m</div>
    `;
    this.hudElement.appendChild(this.scoreBox);

    // Center: Active Circle Banner
    this.circleBox = document.createElement('div');
    this.circleBox.style.cssText = `
      background: rgba(15, 5, 8, 0.85);
      border: 1px solid #8b0000;
      padding: 8px 24px;
      border-radius: 6px;
      text-align: center;
    `;
    this.circleBox.innerHTML = `
      <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #d4af37;">Circle I</div>
      <div style="font-size: 16px; font-weight: bold; color: #e63946; letter-spacing: 1px;">LIMBO</div>
    `;
    this.hudElement.appendChild(this.circleBox);

    // Right: Controls Helper
    this.controlsBox = document.createElement('div');
    this.controlsBox.style.cssText = `
      background: rgba(15, 5, 8, 0.85);
      border: 1px solid #4a151b;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      color: #b0a090;
      text-align: right;
    `;
    this.controlsBox.innerHTML = `
      <div><strong>A / D / ← →</strong> : Switch Lanes</div>
      <div><strong>W / ↑ / Space</strong> : Jump</div>
      <div><strong>S / ↓</strong> : Slide / Duck</div>
    `;
    this.hudElement.appendChild(this.controlsBox);

    this.container.appendChild(this.hudElement);

    // Game Over Overlay
    this.gameOverElement = document.createElement('div');
    this.gameOverElement.id = 'game-over';
    this.gameOverElement.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(8, 2, 4, 0.92);
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 20;
      color: #f0e6d2;
      text-align: center;
      padding: 20px;
    `;
    this.gameOverElement.innerHTML = `
      <h1 style="font-size: 42px; color: #e63946; margin-bottom: 10px; letter-spacing: 3px; font-family: Georgia, serif; text-shadow: 0 0 20px rgba(230,57,70,0.5);">ABANDON ALL HOPE</h1>
      <p style="font-size: 18px; color: #b0a090; margin-bottom: 25px;">Dante perished in the abyss of Hell.</p>
      <div style="background: rgba(25, 10, 12, 0.8); border: 1px solid #7a2222; padding: 15px 35px; border-radius: 8px; margin-bottom: 30px;">
        <span style="font-size: 14px; color: #8a7868; text-transform: uppercase;">Final Descent Depth</span>
        <div id="final-score" style="font-size: 36px; font-weight: bold; color: #d4af37; margin-top: 5px;">0m</div>
      </div>
      <button id="restart-btn" style="
        background: linear-gradient(180deg, #8b0000 0%, #4a0000 100%);
        border: 1px solid #e63946;
        color: #f0e6d2;
        padding: 14px 40px;
        font-size: 18px;
        font-weight: bold;
        letter-spacing: 2px;
        border-radius: 6px;
        cursor: pointer;
        text-transform: uppercase;
        box-shadow: 0 0 20px rgba(139, 0, 0, 0.6);
        transition: transform 0.15s ease, background 0.15s ease;
      ">Try Again</button>
    `;

    this.container.appendChild(this.gameOverElement);

    const restartBtn = this.gameOverElement.querySelector('#restart-btn');
    restartBtn.addEventListener('click', () => {
      this.hideGameOver();
      if (this.onRestart) this.onRestart();
    });
  }

  updateScore(score) {
    const scoreText = this.hudElement.querySelector('#score-text');
    if (scoreText) {
      scoreText.textContent = `${Math.floor(score)}m`;
    }
  }

  showGameOver(finalScore) {
    const finalScoreText = this.gameOverElement.querySelector('#final-score');
    if (finalScoreText) {
      finalScoreText.textContent = `${Math.floor(finalScore)}m`;
    }
    this.gameOverElement.style.display = 'flex';
  }

  hideGameOver() {
    this.gameOverElement.style.display = 'none';
  }
}
