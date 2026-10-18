import { applyMove, createGame, getWinningLine, isDraw, resetGame, type GameState } from "./engine.ts";

export function mountApp(app: HTMLElement, doc: Document): void {
  let game: GameState = createGame();
  app.innerHTML = `
    <section class="game" aria-labelledby="game-title">
      <header class="heading"><p class="eyebrow">Same device · Two players</p><h1 id="game-title">Tic-Tac-Toe</h1><p class="intro">A little strategy, one square at a time.</p></header>
      <p class="status" id="game-status" role="status" aria-live="polite"></p>
      <div class="board" role="group" aria-label="Tic-Tac-Toe board"></div>
      <button class="restart" type="button">Start a new game</button>
      <p class="hint">Take turns choosing an empty square.</p>
    </section>`;
  const board = app.querySelector<HTMLElement>(".board")!;
  const status = app.querySelector<HTMLElement>("#game-status")!;
  const restart = app.querySelector<HTMLButtonElement>(".restart")!;
  const cells = Array.from({ length: 9 }, (_, index) => {
    const button = doc.createElement("button");
    button.type = "button";
    button.className = "cell";
    button.dataset.cell = String(index);
    button.setAttribute("aria-label", `Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}, empty`);
    board.append(button);
    return button;
  });

  function render() {
    const draw = isDraw(game);
    const winningLine = getWinningLine(game.board);
    status.textContent = game.winner ? `${game.winner} wins!` : draw ? "It's a draw!" : `${game.currentPlayer}'s turn`;
    status.classList.toggle("finished", game.winner !== null || draw);
    cells.forEach((cell, index) => {
      const value = game.board[index];
      cell.textContent = value ?? "";
      cell.disabled = value !== null || game.winner !== null || draw;
      cell.classList.toggle("mark-x", value === "X");
      cell.classList.toggle("mark-o", value === "O");
      cell.classList.toggle("winning-cell", winningLine?.includes(index) ?? false);
      cell.setAttribute("aria-label", `Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}, ${value ?? "empty"}`);
    });
  }

  board.addEventListener("click", (event) => {
    const target = event.target;
    if (!target || typeof (target as Element).closest !== "function") return;
    const button = (target as Element).closest<HTMLButtonElement>("button[data-cell]");
    if (!button || button.disabled || game.winner !== null || isDraw(game)) return;
    game = applyMove(game, Number(button.dataset.cell));
    render();
  });
  restart.addEventListener("click", () => {
    game = resetGame();
    render();
    cells[0].focus();
  });
  render();
}
