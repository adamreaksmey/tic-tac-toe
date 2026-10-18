import assert from "node:assert/strict";
import test from "node:test";
import { mountApp } from "./App.ts";

class FakeElement {
  private selectors: Record<string, FakeElement>;
  innerHTML = "";
  textContent = "";
  className = "";
  type = "";
  disabled = false;
  dataset: Record<string, string> = {};
  attributes: Record<string, string> = {};
  children: FakeElement[] = [];
  handlers: Record<string, (event: { target: FakeElement }) => void> = {};
  classes = new Set<string>();
  focused = false;
  constructor(selectors: Record<string, FakeElement> = {}) { this.selectors = selectors; }
  append(child: FakeElement) { this.children.push(child); }
  querySelector<T extends FakeElement>(selector: string): T | null { return (this.selectors[selector] as T) ?? null; }
  addEventListener(name: string, handler: (event: { target: FakeElement }) => void) { this.handlers[name] = handler; }
  setAttribute(name: string, value: string) { this.attributes[name] = value; }
  closest<T extends FakeElement>(selector: string): T | null { return selector === "button[data-cell]" && "cell" in this.dataset ? this as T : null; }
  focus() { this.focused = true; }
  classList = { toggle: (name: string, force: boolean) => force ? this.classes.add(name) : this.classes.delete(name) };
  click() { if (!this.disabled) this.handlers.click?.({ target: this }); }
}

function setup() {
  const board = new FakeElement();
  const status = new FakeElement();
  const restart = new FakeElement();
  const app = new FakeElement({ ".board": board, "#game-status": status, ".restart": restart });
  const doc = { createElement: () => new FakeElement() };
  mountApp(app as unknown as HTMLElement, doc as unknown as Document);
  const cells = board.children;
  const clickCell = (index: number) => board.handlers.click({ target: cells[index] });
  return { board, status, restart, cells, clickCell };
}

test("renders a full win path and prevents every post-game move", () => {
  const { status, cells, clickCell } = setup();
  for (const index of [0, 3, 1, 4, 2]) clickCell(index);
  assert.equal(status.textContent, "X wins!");
  assert.deepEqual(cells.map((cell) => cell.textContent), ["X", "X", "X", "O", "O", "", "", "", ""]);
  assert.deepEqual([0, 1, 2].map((i) => cells[i].classes.has("winning-cell")), [true, true, true]);
  const before = cells.map((cell) => cell.textContent);
  clickCell(5);
  clickCell(8);
  assert.deepEqual(cells.map((cell) => cell.textContent), before);
  assert.ok(cells.every((cell) => cell.disabled));
});

test("shows a draw and prevents further input", () => {
  const { status, cells, clickCell } = setup();
  for (const index of [0, 1, 2, 4, 3, 5, 7, 6, 8]) clickCell(index);
  assert.equal(status.textContent, "It's a draw!");
  assert.ok(cells.every((cell) => cell.disabled));
  assert.deepEqual(cells.map((cell) => cell.textContent), ["X", "O", "X", "X", "O", "O", "O", "X", "X"]);
});

test("ignores an occupied cell, serializes rapid repeated clicks, and restarts", () => {
  const { status, restart, cells, clickCell } = setup();
  clickCell(0);
  clickCell(0);
  assert.equal(cells[0].textContent, "X");
  assert.equal(status.textContent, "O's turn");
  clickCell(1);
  clickCell(1);
  assert.deepEqual(cells.slice(0, 2).map((cell) => cell.textContent), ["X", "O"]);
  assert.equal(status.textContent, "X's turn");
  restart.click();
  assert.equal(status.textContent, "X's turn");
  assert.ok(cells.every((cell) => cell.textContent === "" && !cell.disabled));
  assert.equal(cells[0].focused, true);
});
