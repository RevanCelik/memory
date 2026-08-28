import { themes } from "./data/themes";
import { MemoryGame } from "./game/memory-game";
import type { BoardSize, GameSettings, PlayerId, Screen, ThemeId } from "./types";

const controllerIcon = `<svg viewBox="0 0 120 82" aria-hidden="true"><path d="M35 23h50c12 0 19 10 23 23l8 24c3 10-8 16-15 9L84 62H36L19 79c-7 7-18 1-15-9l8-24c4-13 11-23 23-23Z" fill="none" stroke="currentColor" stroke-width="7"/><path d="M35 38v17M26 46h18" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><circle cx="87" cy="41" r="4" fill="currentColor"/><circle cx="98" cy="52" r="4" fill="currentColor"/></svg>`;

export class MemoryApp {
  private screen: Screen = "home";
  private settings: GameSettings = { theme: "code-vibes", startingPlayer: "blue", boardSize: 16 };
  private game: MemoryGame | null = null;
  private exitDialogOpen = false;
  private resultTimer: number | undefined;

  constructor(private readonly root: HTMLElement) {}

  start(): void {
    this.root.addEventListener("click", (event) => this.handleClick(event));
    this.root.addEventListener("change", (event) => this.handleChange(event));
    this.render();
  }

  private handleClick(event: Event): void {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    if (action === "open-settings") this.screen = "settings";
    if (action === "start-game") this.startGame();
    if (action === "open-exit") this.exitDialogOpen = true;
    if (action === "close-exit") this.exitDialogOpen = false;
    if (action === "exit-game" || action === "go-home") this.goHome();
    if (action === "flip-card" && target.dataset.cardId) {
      this.flipCard(target.dataset.cardId);
      return;
    }
    this.render();
  }

  private handleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.matches("input[type='radio']")) return;
    if (input.name === "theme") this.settings.theme = input.value as ThemeId;
    if (input.name === "player") this.settings.startingPlayer = input.value as PlayerId;
    if (input.name === "board-size") this.settings.boardSize = Number(input.value) as BoardSize;
    this.render();
  }

  private startGame(): void {
    this.game = new MemoryGame(themes[this.settings.theme], this.settings.boardSize, this.settings.startingPlayer);
    this.screen = "game";
  }

  private flipCard(cardId: string): void {
    if (!this.game) return;
    const result = this.game.flip(cardId);
    this.render();
    if (result === "miss") {
      window.setTimeout(() => {
        this.game?.closeMismatch();
        this.render();
      }, 850);
    }
    if (result === "match" && this.game.isComplete) {
      this.screen = "game-over";
      this.render();
      this.resultTimer = window.setTimeout(() => {
        this.screen = "result";
        this.render();
      }, 1800);
    }
  }

  private goHome(): void {
    if (this.resultTimer) window.clearTimeout(this.resultTimer);
    this.screen = "home";
    this.game = null;
    this.exitDialogOpen = false;
  }

  private render(): void {
    this.root.innerHTML = `<div class="app-shell theme--${this.settings.theme}">${this.renderScreen()}${this.renderExitDialog()}</div>`;
  }

  private renderScreen(): string {
    if (this.screen === "home") return this.renderHome();
    if (this.screen === "settings") return this.renderSettings();
    if (this.screen === "game") return this.renderGame();
    if (this.screen === "game-over") return this.renderGameOver();
    return this.renderResult();
  }

  private renderHome(): string {
    return `<section class="home-screen screen"><div class="home-screen__content"><p>It’s play time.</p><h1>Ready to play?</h1><button class="button button--primary home-screen__button" data-action="open-settings"><span class="button__icon">${controllerIcon}</span><span>Play</span><span aria-hidden="true">→</span></button></div><div class="home-screen__controller">${controllerIcon}</div></section>`;
  }

  private renderSettings(): string {
    const theme = themes[this.settings.theme];
    return `<section class="settings-screen screen"><div class="settings-screen__inner"><h1 class="section-title">Settings</h1><div class="settings-screen__grid"><form class="settings-form">
      <fieldset><legend><b class="legend-icon legend-icon--theme">◉</b>Game themes</legend>${Object.values(themes).map(({ id, label }) => this.radio("theme", id, label, this.settings.theme)).join("")}</fieldset>
      <fieldset><legend><b class="legend-icon legend-icon--player">♙</b>Choose player</legend>${this.radio("player", "blue", "Blue", this.settings.startingPlayer)}${this.radio("player", "orange", "Orange", this.settings.startingPlayer)}</fieldset>
      <fieldset><legend><b class="legend-icon legend-icon--board">◫</b>Board size</legend>${this.radio("board-size", "16", "16 cards", this.settings.boardSize)}${this.radio("board-size", "24", "24 cards", this.settings.boardSize)}${this.radio("board-size", "36", "36 cards", this.settings.boardSize)}</fieldset>
      </form><div class="settings-preview"><div class="settings-preview__panel">${this.renderScoreboard(true)}<div class="settings-preview__cards"><img class="settings-preview__card-back" src="${theme.settingsCard}" alt="Closed memory card"><img class="settings-preview__card-face" src="${theme.previewCard}" alt="Open memory card"></div></div><div class="settings-steps"><span>Game theme</span><i></i><span>Player</span><i></i><span>Board size</span><button class="button button--primary button--start" data-action="start-game">▣&nbsp; Start</button></div></div></div></div></section>`;
  }

  private radio(name: string, value: string, label: string, selected: string | number): string {
    const checked = value === String(selected) ? "checked" : "";
    return `<label class="settings-option"><input type="radio" name="${name}" value="${value}" ${checked}><span>${label}</span></label>`;
  }

  private renderScoreboard(compact = false): string {
    const scores = this.game?.scores ?? { blue: 0, orange: 0 };
    const current = this.game?.currentPlayer ?? this.settings.startingPlayer;
    return `<header class="scoreboard ${compact ? "scoreboard--compact" : ""}"><div class="scoreboard__scores"><span class="player--blue">◆ Blue ${scores.blue}</span><span class="player--orange">◆ Orange ${scores.orange}</span></div><div class="scoreboard__current">Current player: <span class="player-marker--${current}" aria-label="${current} player">◆</span></div>${compact ? "" : `<button class="button button--outline" data-action="open-exit">⇥&nbsp; Exit game</button>`}</header>`;
  }

  private renderGame(): string {
    if (!this.game) return "";
    const theme = themes[this.settings.theme];
    const columns = this.settings.boardSize === 16 ? 4 : 6;
    return `<section class="game-screen screen game-screen--${this.settings.boardSize}">${this.renderScoreboard()}<div class="game-board" style="--columns:${columns}" aria-label="Memory game board">${this.game.cards.map((card) => `<button class="memory-card ${card.isFlipped ? "is-flipped" : ""} ${card.isMatched ? "is-matched" : ""}" data-action="flip-card" data-card-id="${card.id}" aria-label="${card.isFlipped ? "Open card" : "Turn card"}" ${card.isMatched ? "disabled" : ""}><span class="memory-card__inner"><span class="memory-card__side memory-card__back"><img src="${theme.cardBack}" alt=""></span><span class="memory-card__side memory-card__front"><img src="${card.icon}" alt=""></span></span></button>`).join("")}</div></section>`;
  }

  private renderGameOver(): string {
    return `<section class="end-screen screen"><h1>Game over</h1><p>Final score</p>${this.scorePill()}</section>`;
  }

  private scorePill(): string {
    const scores = this.game?.scores ?? { blue: 0, orange: 0 };
    return `<div class="score-pill"><span class="player--blue">♟ ${scores.blue}</span><span class="player--orange">♟ ${scores.orange}</span></div>`;
  }

  private renderResult(): string {
    const scores = this.game?.scores ?? { blue: 0, orange: 0 };
    const winner = scores.blue === scores.orange ? "draw" : scores.blue > scores.orange ? "blue" : "orange";
    return `<section class="result-screen screen result-screen--${winner}"><p>${winner === "draw" ? "It’s a" : "The winner is"}</p><h1>${winner === "draw" ? "Draw" : `${winner} player`}</h1><div class="result-screen__symbol" aria-hidden="true">${winner === "draw" ? "⚖" : "🏆"}</div><button class="button button--outline" data-action="go-home">Back to start</button></section>`;
  }

  private renderExitDialog(): string {
    if (!this.exitDialogOpen) return "";
    return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="exit-title"><h2 id="exit-title">Are you sure you want to quit the game?</h2><div class="modal__actions"><button class="button button--primary" data-action="close-exit">Back to game</button><button class="button button--outline" data-action="exit-game">Exit game</button></div></section></div>`;
  }
}
