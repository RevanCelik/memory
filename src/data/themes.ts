import type { ThemeDefinition, ThemeId } from "../types";

const assetUrl = (folder: string, file: string): string =>
  `${import.meta.env.BASE_URL}assets/icons/${folder}/${encodeURIComponent(file)}`;

const codeVibesFiles = [
  "giticon.svg", "typescript.svg", "javascript.svg", "html.svg", "vscode.svg", "css.svg",
  "django.svg", "angular.svg", "terminal.svg", "python.svg", "githublogo.svg", "node.js.svg",
  "bootstrap.svg", "vuejs.svg", "react.svg", "sass.svg", "sql.svg", "firebase.svg",
];

const gamingFiles = [
  "Asset 9@2x 1.svg", "Asset 8@2x 2.svg", "Asset 10@2x 1.svg", "Asset 11@2x 1.svg",
  "Asset 12@2x 1.svg", "Asset 13@2x 1.svg", "Asset 14@2x 1.svg", "Asset 15@2x 1.svg",
  "Asset 16@2x 1.svg", "Asset 17@2x 1.svg", "Asset 18@2x 1.svg", "Asset 19@2x 1.svg",
  "Asset 3@2x 1.svg", "Asset 4@2x 1.svg", "Asset 5@2x 1.svg", "Asset 6@2x 1.svg",
  "Asset 8@2x 1.svg", "play button@2x 1.svg",
];

export const themes: Record<ThemeId, ThemeDefinition> = {
  "code-vibes": {
    id: "code-vibes", label: "Code vibes theme", folder: "code-vibes",
    cardBack: assetUrl("code-vibes", "greencardfront.svg"),
    icons: codeVibesFiles.map((file) => assetUrl("code-vibes", file)),
  },
  gaming: {
    id: "gaming", label: "Gaming theme", folder: "game-theme",
    cardBack: assetUrl("game-theme", "redcardfront.svg"),
    icons: gamingFiles.map((file) => assetUrl("game-theme", file)),
  },
};
