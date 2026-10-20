export type Player = "X" | "O";
export type Cell = Player | null;

export interface GameState {
  readonly board: readonly Cell[];
  readonly currentPlayer: Player;
  readonly winner: Player | null;
}

export type MoveErrorCode = "invalid-cell" | "occupied-cell" | "game-over";

export class InvalidMoveError extends Error {
  readonly code: MoveErrorCode;

  constructor(code: MoveErrorCode, message: string) {
    super(message);
    this.name = "InvalidMoveError";
    this.code = code;
  }
}

const WINNING_LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

/** Returns the winning cell indexes, or null when the board has no winning line. */
export function getWinningLine(board: readonly Cell[]): readonly [number, number, number] | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
      return line;
    }
  }
  return null;
}

export function createGame(): GameState {
  return { board: Array<Cell>(9).fill(null), currentPlayer: "X", winner: null };
}

export function getWinner(board: readonly Cell[]): Player | null {
  const line = getWinningLine(board);
  return line ? board[line[0]] : null;
}

export function isDraw(state: GameState): boolean {
  return state.winner === null && state.board.every((cell) => cell !== null);
}

/** Places the current player's mark in a zero-based board cell (0 through 8). */
export function applyMove(state: GameState, cell: number): GameState {
  if (state.winner !== null || isDraw(state)) {
    throw new InvalidMoveError("game-over", "The game is already over.");
  }
  if (!Number.isInteger(cell) || cell < 0 || cell > 8) {
    throw new InvalidMoveError("invalid-cell", "Cell must be an integer from 0 through 8.");
  }
  if (state.board[cell] !== null) {
    throw new InvalidMoveError("occupied-cell", "That cell is already occupied.");
  }

  const board = state.board.slice();
  board[cell] = state.currentPlayer;
  const winner = getWinner(board);
  return {
    board,
    currentPlayer: state.currentPlayer === "X" ? "O" : "X",
    winner,
  };
}

export function resetGame(): GameState {
  return createGame();
}
