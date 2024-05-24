// -*- Mode: typescript; typescript-indent-level: 3; indent-tabs-mode: nil -*-

import * as s from "./sudoku.hh.mjs";
import * as boards9x9 from "./boards9x9.mjs";

s.solve([], boards9x9.veryeasy);
s.solve([s.SudokuNakedSingle], boards9x9.veryeasy);
s.solve([s.SudokuHiddenSingle], boards9x9.veryeasy);
s.solve([s.SudokuNakedPair], boards9x9.veryeasy);
s.solve([s.SudokuNakedSingle, s.SudokuHiddenSingle], boards9x9.easy);
s.solve([s.SudokuNakedSingle, s.SudokuHiddenSingle], boards9x9.medium);
s.solve([s.SudokuNakedSingle, s.SudokuHiddenSingle], boards9x9.hard);
s.solve([s.SudokuNakedSingle, s.SudokuHiddenSingle], boards9x9.expert);
s.solve([s.SudokuNakedSingle, s.SudokuHiddenSingle], boards9x9.blank);
