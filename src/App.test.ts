import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { mountGame } from "./App.ts";

function setup() {
  const dom = new JSDOM("<div id='app'></div>");
  const app = dom.window.document.querySelector<HTMLElement>("#app")!;
  mountGame(app);
  const cells = Array.from(app.querySelectorAll<HTMLButtonElement>(".cell"));
  const status = app.querySelector<HTMLElement>("#status-text")!;
  const click = (index: number) => cells[index].dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  return { dom, app, cells, status, click };
}

test("renders a complete win path and highlights the winning line", () => {
  const { cells, status, click } = setup();
  [0, 3, 1, 4, 2].forEach(click);

  assert.equal(status.textContent, "X wins!");
  assert.deepEqual(cells.map((cell) => cell.textContent), ["X", "X", "X", "O", "O", "", "", "", ""]);
  assert.deepEqual(cells.map((cell, index) => cell.classList.contains("winning-cell") ? index : -1).filter((index) => index >= 0), [0, 1, 2]);
  assert.ok(cells.every((cell) => cell.disabled));
});

test("renders a complete draw path and disables the board", () => {
  const { cells, status, click } = setup();
  [0, 1, 2, 4, 3, 5, 7, 6, 8].forEach(click);

  assert.equal(status.textContent, "It's a draw!");
  assert.deepEqual(cells.map((cell) => cell.textContent), ["X", "O", "X", "X", "O", "O", "O", "X", "X"]);
  assert.ok(cells.every((cell) => cell.disabled));
});

test("restart clears a finished game and focuses the first cell", () => {
  const { app, cells, click } = setup();
  [0, 3, 1, 4, 2].forEach(click);
  app.querySelector<HTMLButtonElement>(".restart-button")!.click();

  assert.equal(app.querySelector("#status-text")!.textContent, "X's turn");
  assert.ok(cells.every((cell) => cell.textContent === "" && !cell.disabled));
  assert.equal(app.ownerDocument.activeElement, cells[0]);
});

test("clicking a filled cell does not consume another turn", () => {
  const { cells, status, click } = setup();
  click(0);
  click(0);

  assert.equal(status.textContent, "O's turn");
  assert.deepEqual(cells.map((cell) => cell.textContent), ["X", "", "", "", "", "", "", "", ""]);
});

test("direct post-win events cannot change the board or result", () => {
  const { cells, status, click } = setup();
  [0, 3, 1, 4, 2].forEach(click);
  const finishedBoard = cells.map((cell) => cell.textContent);

  cells[5].dispatchEvent(new cells[5].ownerDocument.defaultView!.MouseEvent("click", { bubbles: true }));

  assert.deepEqual(cells.map((cell) => cell.textContent), finishedBoard);
  assert.equal(status.textContent, "X wins!");
});

test("rapid repeated clicks on one cell place only one mark", () => {
  const { cells, status, click } = setup();
  click(4);
  click(4);
  click(4);

  assert.equal(cells[4].textContent, "X");
  assert.equal(status.textContent, "O's turn");
  assert.equal(cells.filter((cell) => cell.textContent !== "").length, 1);
});
