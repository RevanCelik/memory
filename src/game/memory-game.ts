import type { BoardSize, CardState, PlayerId, ThemeDefinition } from "../types";

const shuffle = <T>(items: T[]): T[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
};

export class MemoryGame {
  cards: CardState[];
  currentPlayer: PlayerId;
  scores: Record<PlayerId, number> = { blue: 0, orange: 0 };
  isLocked = false;

  constructor(theme: ThemeDefinition, boardSize: BoardSize, startingPlayer: PlayerId) {
    this.currentPlayer = startingPlayer;
    const selectedIcons = shuffle(theme.icons).slice(0, boardSize / 2);
    this.cards = shuffle(selectedIcons.flatMap((icon, pairIndex) => [
      { id: `${pairIndex}-a`, pairId: String(pairIndex), icon, isFlipped: false, isMatched: false },
      { id: `${pairIndex}-b`, pairId: String(pairIndex), icon, isFlipped: false, isMatched: false },
    ]));
  }

  flip(cardId: string): "ignored" | "first" | "match" | "miss" {
    const card = this.cards.find(({ id }) => id === cardId);
    if (!card || card.isFlipped || card.isMatched || this.isLocked) return "ignored";
    card.isFlipped = true;
    const openCards = this.cards.filter(({ isFlipped, isMatched }) => isFlipped && !isMatched);
    if (openCards.length < 2) return "first";
    this.isLocked = true;
    if (openCards[0].pairId === openCards[1].pairId) {
      openCards.forEach((openCard) => { openCard.isMatched = true; });
      this.scores[this.currentPlayer] += 1;
      this.isLocked = false;
      return "match";
    }
    return "miss";
  }

  closeMismatch(): void {
    this.cards.forEach((card) => { if (!card.isMatched) card.isFlipped = false; });
    this.currentPlayer = this.currentPlayer === "blue" ? "orange" : "blue";
    this.isLocked = false;
  }

  get isComplete(): boolean {
    return this.cards.every(({ isMatched }) => isMatched);
  }
}
