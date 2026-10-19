import { mountGame } from "./App";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App root is missing.");
mountGame(app);
