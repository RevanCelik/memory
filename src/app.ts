import { themes } from "./data/themes";
import { MemoryGame } from "./game/memory-game";
import type { BoardSize, GameSettings, PlayerId, Screen, ThemeId } from "./types";

const controllerIcon = `<svg viewBox="0 0 120 82" aria-hidden="true"><path d="M35 23h50c12 0 19 10 23 23l8 24c3 10-8 16-15 9L84 62H36L19 79c-7 7-18 1-15-9l8-24c4-13 11-23 23-23Z" fill="none" stroke="currentColor" stroke-width="7"/><path d="M35 38v17M26 46h18" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><circle cx="87" cy="41" r="4" fill="currentColor"/><circle cx="98" cy="52" r="4" fill="currentColor"/></svg>`;

const buttonAsset = (file: string): string =>
  encodeURI(`${import.meta.env.BASE_URL}assets/icons/button/${file}`);

const startButtonAssets = {
  default: buttonAsset("Property 1=default.svg"),
  hover: buttonAsset("Property 1=hover.svg"),
  disabled: buttonAsset("Property 1=disabled.svg"),
};

const playButtonAssets = {
  default: buttonAsset("play_default.svg"),
  hover: buttonAsset("play_hover.svg"),
};

export class MemoryApp {
  private screen: Screen = "home";
  private settings: GameSettings = { theme: null, startingPlayer: null, boardSize: null };
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
    const { theme, boardSize, startingPlayer } = this.settings;
    if (!theme || !boardSize || !startingPlayer) return;
    this.game = new MemoryGame(themes[theme], boardSize, startingPlayer);
    this.screen = "game";
  }

  private flipCard(cardId: string): void {
    if (!this.game) return;
    const result = this.game.flip(cardId);
    this.syncGameView();
    if (result === "miss") {
      window.setTimeout(() => {
        this.game?.closeMismatch();
        this.syncGameView();
      }, 850);
    }
    if (result === "match" && this.game.isComplete) {
      window.setTimeout(() => {
        this.screen = "game-over";
        this.render();
        this.resultTimer = window.setTimeout(() => {
          this.screen = "result";
          this.render();
        }, 1800);
      }, 520);
    }
  }

  private syncGameView(): void {
    if (!this.game || this.screen !== "game") return;

    this.game.cards.forEach((card) => {
      const element = this.root.querySelector<HTMLButtonElement>(`[data-card-id="${card.id}"]`);
      if (!element) return;
      element.classList.toggle("is-flipped", card.isFlipped);
      element.classList.toggle("is-matched", card.isMatched);
      element.disabled = card.isMatched;
      element.setAttribute("aria-label", card.isFlipped ? "Open card" : "Turn card");
    });

    const blueScore = this.root.querySelector<HTMLElement>("[data-score='blue']");
    const orangeScore = this.root.querySelector<HTMLElement>("[data-score='orange']");
    const currentPlayer = this.root.querySelector<HTMLElement>("[data-current-player]");
    if (blueScore) blueScore.textContent = `◆ Blue ${this.game.scores.blue}`;
    if (orangeScore) orangeScore.textContent = `◆ Orange ${this.game.scores.orange}`;
    if (currentPlayer) {
      currentPlayer.className = `player-marker--${this.game.currentPlayer}`;
      currentPlayer.setAttribute("aria-label", `${this.game.currentPlayer} player`);
    }
  }

  private goHome(): void {
    if (this.resultTimer) window.clearTimeout(this.resultTimer);
    this.screen = "home";
    this.game = null;
    this.exitDialogOpen = false;
  }

  private render(): void {
    const activeTheme = this.settings.theme ?? "code-vibes";
    this.root.innerHTML = `<div class="app-shell theme--${activeTheme}">${this.renderScreen()}${this.renderExitDialog()}</div>`;
  }

  private renderScreen(): string {
    if (this.screen === "home") return this.renderHome();
    if (this.screen === "settings") return this.renderSettings();
    if (this.screen === "game") return this.renderGame();
    if (this.screen === "game-over") return this.renderGameOver();
    return this.renderResult();
  }

  private renderHome(): string {
    return `<section class="home-screen screen"><div class="home-screen__content"><p>It’s play time.</p><h1>Ready to play?</h1><button class="home-play-button" data-action="open-settings" aria-label="Play"><img class="home-play-button__default" src="${playButtonAssets.default}" alt=""><img class="home-play-button__hover" src="${playButtonAssets.hover}" alt=""></button></div><div class="home-screen__controller">${controllerIcon}</div></section>`;
  }

  private renderSettings(): string {
    const theme = themes[this.settings.theme ?? "code-vibes"];
    return `<section class="settings-screen screen"><div class="settings-screen__inner"><h1 class="section-title">Settings</h1><div class="settings-screen__grid"><form class="settings-form">
      <fieldset><legend><b class="legend-icon legend-icon--theme">◉</b>Game themes</legend>${Object.values(themes).map(({ id, label }) => this.radio("theme", id, label, this.settings.theme)).join("")}</fieldset>
      <fieldset><legend><b class="legend-icon legend-icon--player">♙</b>Choose player</legend>${this.radio("player", "blue", "Blue", this.settings.startingPlayer)}${this.radio("player", "orange", "Orange", this.settings.startingPlayer)}</fieldset>
      <fieldset><legend><b class="legend-icon legend-icon--board">◫</b>Board size</legend>${this.radio("board-size", "16", "16 cards", this.settings.boardSize)}${this.radio("board-size", "24", "24 cards", this.settings.boardSize)}${this.radio("board-size", "36", "36 cards", this.settings.boardSize)}</fieldset>
      </form><div class="settings-preview"><img class="settings-preview__visual" src="${theme.themeVisual}" alt="${theme.label} preview">${this.renderSettingsSteps()}</div></div></div></section>`;
  }

  private radio(name: string, value: string, label: string, selected: string | number | null): string {
    const checked = value === String(selected) ? "checked" : "";
    return `<label class="settings-option"><input type="radio" name="${name}" value="${value}" ${checked}><span class="settings-option__label">${label}</span><span class="settings-option__marker" aria-hidden="true"><i></i><b></b></span></label>`;
  }

  private renderSettingsSteps(): string {
    const themeLabel = this.settings.theme ? themes[this.settings.theme].label.replace(" theme", "") : "Theme";
    const playerLabel = this.settings.startingPlayer
      ? `${this.settings.startingPlayer === "blue" ? "Blue" : "Orange"} player`
      : "Player";
    const boardLabel = this.settings.boardSize ? `Board-${this.settings.boardSize} Cards` : "Board size";
    const isComplete = Boolean(this.settings.theme && this.settings.startingPlayer && this.settings.boardSize);
    return `<div class="settings-steps ${isComplete ? "is-complete" : ""}"><span>${themeLabel}</span><i></i><span>${playerLabel}</span><i></i><span>${boardLabel}</span><button class="start-button" data-action="start-game" aria-label="Start game" ${isComplete ? "" : "disabled"}><img class="start-button__default" src="${startButtonAssets.default}" alt=""><img class="start-button__hover" src="${startButtonAssets.hover}" alt=""><img class="start-button__disabled" src="${startButtonAssets.disabled}" alt=""></button></div>`;
  }

  private renderScoreboard(): string {
    const scores = this.game?.scores ?? { blue: 0, orange: 0 };
    const current = this.game?.currentPlayer ?? this.settings.startingPlayer ?? "blue";
    const theme = themes[this.settings.theme ?? "code-vibes"];
    return `<header class="scoreboard"><div class="scoreboard__scores"><span class="player--blue" data-score="blue">◆ Blue ${scores.blue}</span><span class="player--orange" data-score="orange">◆ Orange ${scores.orange}</span></div><div class="scoreboard__current">Current player: <span class="player-marker--${current}" data-current-player aria-label="${current} player">◆</span></div><button class="game-exit-button" data-action="open-exit" aria-label="Exit game"><img class="game-exit-button__default" src="${theme.exitButton.default}" alt=""><img class="game-exit-button__hover" src="${theme.exitButton.hover}" alt=""></button></header>`;
  }

  private renderGame(): string {
    if (!this.game) return "";
    const activeTheme = this.settings.theme ?? "code-vibes";
    const theme = themes[activeTheme];
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
    const theme = themes[this.settings.theme ?? "code-vibes"];
    const resultVisual = theme.resultVisuals?.[winner];
    const visual = resultVisual
      ? `<img class="result-screen__visual" src="${resultVisual}" alt="">`
      : `<div class="result-screen__symbol" aria-hidden="true">${winner === "draw" ? "⚖" : "🏆"}</div>`;
    return `<section class="result-screen screen result-screen--${winner}"><p>${winner === "draw" ? "It’s a" : "The winner is"}</p><h1>${winner === "draw" ? "Draw" : `${winner} player`}</h1>${visual}<button class="button button--outline" data-action="go-home">Back to start</button></section>`;
  }

  private renderExitDialog(): string {
    if (!this.exitDialogOpen) return "";
    return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="exit-title"><h2 id="exit-title">Are you sure you want to quit the game?</h2><div class="modal__actions"><button class="button button--primary" data-action="close-exit">Back to game</button><button class="button button--outline" data-action="exit-game">Exit game</button></div></section></div>`;
  }
}
