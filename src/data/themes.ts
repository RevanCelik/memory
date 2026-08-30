import type { ThemeDefinition, ThemeId } from "../types";

const assetUrl = (folder: string, file: string): string =>
  encodeURI(`${import.meta.env.BASE_URL}assets/icons/${folder}/${file}`);

const codeVibesFiles = [
  "Front.svg",
  "Front (1).svg", "Front (2).svg", "Front (3).svg", "Front (4).svg", "Front (5).svg",
  "Front (6).svg", "Front (7).svg", "Front (8).svg", "Front (9).svg", "Front (10).svg",
  "Front (11).svg", "Front (12).svg", "Front (13).svg", "Front (14).svg",
  "Front (15).svg", "Front (16).svg", "Front (17).svg",
];

const gamingFiles = [
  "Front.svg",
  "Front (1).svg", "Front (2).svg", "Front (3).svg", "Front (4).svg", "Front (5).svg",
  "Front (6).svg", "Front (7).svg", "Front (8).svg", "Front (9).svg", "Front (10).svg",
  "Front (11).svg", "Front (12).svg", "Front (13).svg", "Front (14).svg",
  "Front (15).svg", "Front (16).svg", "Front (17).svg",
];

export const themes: Record<ThemeId, ThemeDefinition> = {
  "code-vibes": {
    id: "code-vibes", label: "Code vibes theme",
    cardBack: assetUrl("code-vibes", "greencardfront.svg"),
    themeVisual: assetUrl("themevisual", "codevibesvisual.svg"),
    icons: codeVibesFiles.map((file) => assetUrl("code-vibes", file)),
    resultVisuals: {
      blue: assetUrl("winnerscreen/codevibes", "blueplayer_code.svg"),
      orange: assetUrl("winnerscreen/codevibes", "orangeplayer_code.svg"),
      draw: assetUrl("winnerscreen/codevibes", "Scale_Icon.svg"),
    },
  },
  gaming: {
    id: "gaming", label: "Gaming theme",
    cardBack: assetUrl("game-theme", "redcard.svg"),
    themeVisual: assetUrl("themevisual", "gamethemevisual.svg"),
    icons: gamingFiles.map((file) => assetUrl("game-theme", file)),
  },
};
