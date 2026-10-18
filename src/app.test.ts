import assert from "node:assert/strict";
import test from "node:test";
import { mountApp } from "./app.ts";

class TestButton {
  disabled = false;
  dataset: Record<string, string> = {};
  private listeners: Array<() => void> = [];
  focused = false;

  addEventListener(_name: string, listener: () => void): void { this.listeners.push(listener); }
  click(): void { if (!this.disabled) this.dispatchQueuedClick(); }
  dispatchQueuedClick(): void { this.listeners.forEach((listener) => listener()); }
  focus(): void { this.focused = true; }
}

class TestApp {
  html = "";
  buttons: TestButton[] = [];
  restart = new TestButton();
  status = "";

  set innerHTML(html: string) {
    this.html = html;
    this.status = html.match(/class="status"[^>]*>(.*?)<\/p>/)?.[1] ?? "";
    this.buttons = [...html.matchAll(/<button class="cell[^\"]*"([^>]*)data-cell="(\d+)"([^>]*)>/g)].map((match) => {
      const button = new TestButton();
      button.dataset.cell = match[2]!;
      button.disabled = /\bdisabled\b/.test(`${match[1]} ${match[3]}`);
      return button;
    });
    this.restart = new TestButton();
  }
  querySelectorAll<T extends TestButton>(_selector: string): T[] { return this.buttons as T[]; }
  querySelector<T extends TestButton>(selector: string): T | null {
    if (selector === ".restart") return this.restart as T;
    const index = Number(selector.match(/data-cell=['"]?(\d+)/)?.[1]);
    return Number.isInteger(index) ? (this.buttons[index] as T | undefined) ?? null : null;
  }
}

function start() {
  const app = new TestApp();
  mountApp(app as unknown as HTMLDivElement);
  return app;
}

function play(app: TestApp, cells: number[]) {
  for (const cell of cells) app.buttons[cell]!.click();
}

test("renders a full win and locks the board", () => {
  const app = start();
  play(app, [0, 3, 1, 4, 2]);
  assert.match(app.status, /Player X wins/);
  assert.match(app.html, /class="cell winning/);
  assert.equal(app.buttons.every((button) => button.disabled), true);
});

test("renders a draw", () => {
  const app = start();
  play(app, [0, 1, 2, 4, 3, 5, 7, 6, 8]);
  assert.match(app.status, /draw/);
  assert.equal(app.buttons.every((button) => button.disabled), true);
});

test("restart restores an empty X turn", () => {
  const app = start();
  play(app, [0, 3, 1, 4, 2]);
  app.restart.click();
  assert.equal(app.status, "Player X’s turn");
  assert.equal(app.buttons.every((button) => !button.disabled), true);
  assert.doesNotMatch(app.html, /class="mark/);
  assert.equal(app.buttons[0]!.focused, true);
});

test("filled cells and queued repeated clicks do not throw or change a mark", () => {
  const app = start();
  const first = app.buttons[0]!;
  first.click();
  assert.doesNotThrow(() => first.dispatchQueuedClick());
  assert.equal(app.status, "Player O’s turn");
  assert.equal(app.buttons[0]!.disabled, true);
});

test("queued input after game over cannot alter the board", () => {
  const app = start();
  play(app, [0, 3, 1, 4, 2]);
  const staleButton = app.buttons[5]!;
  const finishedHtml = app.html;
  assert.doesNotThrow(() => staleButton.dispatchQueuedClick());
  assert.equal(app.html, finishedHtml);
  assert.match(app.status, /Player X wins/);
});
