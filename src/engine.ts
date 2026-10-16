export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | null;
  isDraw: boolean;
}

const WINNING_LINES: readonly (readonly number[])[] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function createGame(): GameState {
  return { board: Array<Cell>(9).fill(null), currentPlayer: 'X', winner: null, isDraw: false };
}

/** Applies a move at a zero-based board position and returns a new game state. */
export function applyMove(state: GameState, position: number): GameState {
  if (!Number.isInteger(position) || position < 0 || position >= 9) {
    throw new RangeError('Move position must be an integer from 0 to 8');
  }
  if (state.winner || state.isDraw) throw new Error('The game is already over');
  if (state.board[position] !== null) throw new Error('That position is already occupied');

  const board = state.board.slice();
  board[position] = state.currentPlayer;
  const winner = WINNING_LINES.some(([a, b, c]) =>
    board[a] !== null && board[a] === board[b] && board[a] === board[c]
  ) ? state.currentPlayer : null;
  const isDraw = winner === null && board.every((cell) => cell !== null);

  return {
    board,
    currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
    winner,
    isDraw,
  };
}

export function resetGame(): GameState {
  return createGame();
}
