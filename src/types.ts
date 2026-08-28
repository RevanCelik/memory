export type ThemeId = "code-vibes" | "gaming";
export type PlayerId = "blue" | "orange";
export type BoardSize = 16 | 24 | 36;
export type Screen = "home" | "settings" | "game" | "game-over" | "result";

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  folder: string;
  cardBack: string;
  settingsCard: string;
  previewCard: string;
  icons: string[];
}

export interface CardState {
  id: string;
  pairId: string;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameSettings {
  theme: ThemeId;
  startingPlayer: PlayerId;
  boardSize: BoardSize;
}
