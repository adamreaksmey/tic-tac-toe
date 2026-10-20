import { applyMove, getWinningLine, isDraw, resetGame, type GameState } from "./engine.ts";

export function mountGame(app: HTMLElement): void {
  let game: GameState = resetGame();

  app.innerHTML = `
    <main class="page-shell">
      <section class="game-card" aria-labelledby="game-title">
        <header class="game-header">
          <p class="eyebrow">Two players · one device</p>
          <h1 id="game-title">Tic-Tac-Toe</h1>
          <p class="intro">Take turns, make a line, and claim the board.</p>
        </header>
        <div class="game-status" aria-live="polite" aria-atomic="true">
          <span class="status-mark" aria-hidden="true"></span>
          <p id="status-text"></p>
        </div>
        <div class="board" role="group" aria-label="Tic-Tac-Toe board"></div>
        <footer class="game-footer">
          <span class="turn-hint">Choose an empty square to play.</span>
          <button class="restart-button" type="button">New game <span aria-hidden="true">↻</span></button>
        </footer>
      </section>
      <p class="page-note">A little friendly competition.</p>
    </main>
  `;

  const board = app.querySelector<HTMLDivElement>(".board")!;
  const statusText = app.querySelector<HTMLParagraphElement>("#status-text")!;
  const statusMark = app.querySelector<HTMLSpanElement>(".status-mark")!;
  const restartButton = app.querySelector<HTMLButtonElement>(".restart-button")!;

  const cells = Array.from({ length: 9 }, (_, index) => {
    const button = app.ownerDocument.createElement("button");
    button.type = "button";
    button.className = "cell";
    button.addEventListener("click", () => play(index));
    board.append(button);
    return button;
  });

  restartButton.addEventListener("click", () => {
    game = resetGame();
    render();
    cells[0].focus();
  });

  function play(index: number): void {
    if (game.winner !== null || isDraw(game) || game.board[index] !== null) return;
    game = applyMove(game, index);
    render();
  }

  function render(): void {
    const winningLine = getWinningLine(game.board);
    const draw = isDraw(game);

    cells.forEach((cell, index) => {
      const mark = game.board[index];
      cell.textContent = mark ?? "";
      cell.classList.toggle("mark-x", mark === "X");
      cell.classList.toggle("mark-o", mark === "O");
      cell.classList.toggle("winning-cell", winningLine?.includes(index) ?? false);
      cell.disabled = mark !== null || game.winner !== null || draw;
      cell.setAttribute("aria-label", mark
        ? `Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}: ${mark}${winningLine?.includes(index) ? ", part of winning line" : ""}`
        : `Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}: empty`);
    });

    if (game.winner) {
      statusText.textContent = `${game.winner} wins!`;
      statusMark.textContent = game.winner;
      statusMark.className = `status-mark mark-${game.winner.toLowerCase()}`;
    } else if (draw) {
      statusText.textContent = "It's a draw!";
      statusMark.textContent = "=";
      statusMark.className = "status-mark mark-draw";
    } else {
      statusText.textContent = `${game.currentPlayer}'s turn`;
      statusMark.textContent = game.currentPlayer;
      statusMark.className = `status-mark mark-${game.currentPlayer.toLowerCase()}`;
    }
  }

  render();
}
