import "./style.css";
import { mountApp } from "./App";

const app = document.querySelector<HTMLElement>("#app");
if (!app) throw new Error("App root is missing");
mountApp(app, document);
