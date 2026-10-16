import test from 'node:test';
import assert from 'node:assert/strict';
import { applyMove, createGame, resetGame } from './engine.ts';

function play(state: ReturnType<typeof createGame>, moves: number[]) {
  return moves.reduce((current, position) => applyMove(current, position), state);
}

test('detects an X win', () => {
  const state = play(createGame(), [0, 3, 1, 4, 2]);
  assert.equal(state.winner, 'X');
  assert.equal(state.isDraw, false);
});

test('detects an O win', () => {
  const state = play(createGame(), [0, 3, 1, 4, 8, 5]);
  assert.equal(state.winner, 'O');
});

test('detects a draw', () => {
  const state = play(createGame(), [0, 1, 2, 4, 3, 5, 7, 6, 8]);
  assert.equal(state.winner, null);
  assert.equal(state.isDraw, true);
});

test('rejects out-of-range, non-integer, and occupied moves without changing the input', () => {
  const state = play(createGame(), [0]);
  assert.throws(() => applyMove(state, -1), RangeError);
  assert.throws(() => applyMove(state, 9), RangeError);
  assert.throws(() => applyMove(state, 1.5), RangeError);
  assert.throws(() => applyMove(state, 0), /occupied/);
  assert.deepEqual(state.board, ['X', null, null, null, null, null, null, null, null]);
});

test('rejects moves after the game ends', () => {
  const state = play(createGame(), [0, 3, 1, 4, 2]);
  assert.throws(() => applyMove(state, 5), /already over/);
});

test('reset returns a fresh game with X to move', () => {
  const state = resetGame();
  assert.deepEqual(state, {
    board: Array(9).fill(null), currentPlayer: 'X', winner: null, isDraw: false,
  });
  assert.notEqual(state.board, createGame().board);
});
