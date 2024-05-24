The Functional, the Imperative, and the Sudoku (ICFP 2024 artifact)
===================================================================
![branch workflow](https://github.com/manuel-serrano/icfp2024-sudoku/actions/workflows/icfp2024-sudoku.yml/badge.svg)


The files composing the artifact are:

  - `sudoku.hh.mjs`: the Sudoku implementation;
  - `boards9x9.mjs`: a collection of Sudoku boards;
  - `utils.mjs`: various utility functions;
  - `set.mjs`: a compatibility kit for JS implementations lacking set support;
  - `test.hh.mjs`: the test driver;
  - `package.json`: the NPM metadata.

To run the artifact:

```
npm run sudoku
```

The HipHop implementation of the Sudoku solver sits in the file
`sudoku.hh.mjs`. Its public API is as follows:

  - `Sudoku`: `HipHopFragment[] -> HipHopFragment`.
  This is the builder that constructs a HipHop 
  program that implements a sudoku solver. It takes as input
  an array of `strategies` and its returns a HipHop fragment
  that is to be installed in a HipHop machine for reactions.
  - `SudokuNakedSingle`: `HipHopFragment`
  - `SudokuHiddenSingle`: `HipHopFragment`
  - `SudokuNakedPair`: `HipHopFragment`
  These are the three Sudoku strategies described in the
  ICFP paper.
  - `solve`: `HipHopFragment[] x board -> void`
  Create a HipHop machine and apply it to the board.
  - `step`: `HipHopFragment[] x board -> void`
  As `solve` but only execute one resolution step.
  
  
The file 'board9x9.mjs` exports some Sudoku problems. Each
problem is a JavaScript string of 9 lines or 9 columns.
Each character is either a digit between 1 and 9 or
the character `.`.

The following is a complete example that shows how to
use the Sduoku API and how to create a new board and how
to solve it using only the `SudokuNakedSingle` strategy.

```
import { solve, SudokuNakedSingle } as s from "./sudoku.hh.mjs";

const myBoard = `
3..6.2..4
....798.3
.1....7..
....6...2
.417.8...
7.6...4..
9.728534.
.8....29.
123.4756.`

solve([SudokuNakedSingle], myBoard);
```


Running the artifact without a VM
=================================

Install the artifact:

```
npm install https://github.com/manuel-serrano/icfp2024-sudoku.git
```

To run it:

```
(cd node_modules/icfp2024-sudoku; npm run sudoku)
```
