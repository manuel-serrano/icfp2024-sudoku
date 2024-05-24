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
