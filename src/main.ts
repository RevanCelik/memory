import "./styles/style.scss";
import { MemoryApp } from "./app";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("App root element was not found.");
}

new MemoryApp(root).start();
