import { applyMove, createGame, getWinningLine, isDraw, resetGame, type GameState } from "./engine";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App root not found");

let game: GameState = createGame();
let winningLine: readonly number[] = [];

function statusText(): string {
  if (game.winner) return `Player ${game.winner} wins!`;
  if (isDraw(game)) return "It’s a draw!";
  return `Player ${game.currentPlayer}’s turn`;
}

function render(): void {
  const finished = game.winner !== null || isDraw(game);
  app!.innerHTML = `
    <main class="game">
      <header class="heading">
        <p class="eyebrow">A little friendly rivalry</p>
        <h1>Tic-Tac-Toe</h1>
        <p class="intro">Take turns. Three in a row wins.</p>
      </header>
      <section class="play-area" aria-label="Tic-Tac-Toe game">
        <p class="status" role="status" aria-live="polite">${statusText()}</p>
        <div class="board" role="group" aria-label="Game board">
          ${game.board.map((mark, index) => `
            <button class="cell${winningLine.includes(index) ? " winning" : ""}" type="button"
              aria-label="${mark ? `Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}: ${mark}` : `Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}: empty` }"
              ${mark || finished ? "disabled" : ""} data-cell="${index}">
              ${mark ? `<span class="mark mark-${mark.toLowerCase()}" aria-hidden="true">${mark}</span>` : ""}
            </button>`).join("")}
        </div>
        <button class="restart" type="button">New game <span aria-hidden="true">↻</span></button>
      </section>
      <footer>Two players · one device</footer>
    </main>`;

  app!.querySelectorAll<HTMLButtonElement>("[data-cell]").forEach((button) => {
    button.addEventListener("click", () => {
      game = applyMove(game, Number(button.dataset.cell));
      winningLine = game.winner ? getWinningLine(game.board) : [];
      render();
      app!.querySelector<HTMLButtonElement>(".restart")?.focus();
    });
  });
  app!.querySelector<HTMLButtonElement>(".restart")?.addEventListener("click", () => {
    game = resetGame();
    winningLine = [];
    render();
    app!.querySelector<HTMLButtonElement>("[data-cell='0']")?.focus();
  });
}

render();
