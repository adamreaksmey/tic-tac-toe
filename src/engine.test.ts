import assert from "node:assert/strict";
import test from "node:test";
import { applyMove, createGame, InvalidMoveError, isDraw, resetGame } from "./engine.ts";

function play(cells: number[]) {
  return cells.reduce((state, cell) => applyMove(state, cell), createGame());
}

test("detects an X win", () => {
  const game = play([0, 3, 1, 4, 2]);
  assert.equal(game.winner, "X");
  assert.equal(isDraw(game), false);
});

test("detects an O win", () => {
  const game = play([0, 3, 1, 4, 8, 5]);
  assert.equal(game.winner, "O");
});

test("detects a draw", () => {
  const game = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);
  assert.equal(game.winner, null);
  assert.equal(isDraw(game), true);
});

test("rejects invalid and occupied moves without changing state", () => {
  const game = applyMove(createGame(), 0);
  assert.throws(() => applyMove(game, 9), (error) => error instanceof InvalidMoveError && error.code === "invalid-cell");
  assert.throws(() => applyMove(game, 0), (error) => error instanceof InvalidMoveError && error.code === "occupied-cell");
  assert.deepEqual(game.board, ["X", null, null, null, null, null, null, null, null]);
});

test("rejects moves after the game ends", () => {
  const game = play([0, 3, 1, 4, 2]);
  assert.throws(() => applyMove(game, 5), (error) => error instanceof InvalidMoveError && error.code === "game-over");
});

test("reset returns a fresh initial game", () => {
  const initial = createGame();
  const reset = resetGame();
  assert.deepEqual(reset, initial);
  assert.notEqual(reset.board, initial.board);
});
