// -*- Mode: typescript; typescript-indent-level: 3; indent-tabs-mode: nil -*-
/*=====================================================================*/
/*    serrano/diffusion/article/icfp2024-sudoku/utils.mjs              */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano & Robby Findler                    */
/*    Creation    :  Sat Dec 23 07:22:03 2023                          */
/*    Last change :  Wed May 29 11:01:18 2024 (serrano)                */
/*    Copyright   :  2023-24 Manuel Serrano & Robby Findler            */
/*    -------------------------------------------------------------    */
/*    Utilities for building and displaying SUDOKU boards.             */
/*=====================================================================*/
import "./set.mjs";

/*---------------------------------------------------------------------*/
/*    SIZE ...                                                         */
/*---------------------------------------------------------------------*/
export const BOARD_SIZE = 9;
export
const iota = Array.from({length: BOARD_SIZE}, (_, i) => i);
export
const digits = new Set(iota.map(v => v + 1));

export let margins = [];

/*---------------------------------------------------------------------*/
/*    initMargins ...                                                  */
/*---------------------------------------------------------------------*/
export function initMargins() {
   margins = new Array(iota.length * iota.length);
   for (let i = 0; i < iota.length * iota.length; i++) {
      margins[i]= new Array(i).fill(".").join("");
   }
}

/*---------------------------------------------------------------------*/
/*    initGameSafe ...                                                 */
/*---------------------------------------------------------------------*/
export function initGameSafe(board) {
   const rows = board.split("\n")
      .filter(l => !l.match(/^[ \t]*$/))
      .map(s => s.trim());

   if (BOARD_SIZE !== rows[0].length) {
      throw `wrong board size ${rows[0].length} vs ${BOARD_SIZE}`;
   }

   margins = new Array(iota.length * iota.length);
   for (let i = 0; i < iota.length * iota.length; i++) {
      margins[i]= new Array(i).fill(".").join("");
   }

   if (!rows.every(r => r.length === BOARD_SIZE)) {
      throw `Wrong board: ${board}`;
   } else {
      const givens = {};
      iota.forEach(i => iota.forEach(j => {
         if (rows[j][i] !== ".") {
            givens[`must${i}${j}`] = new Set([parseInt(rows[j][i])]);
         }
      }))
      return givens;
   }
}

/*---------------------------------------------------------------------*/
/*    parseBoard ...                                                   */
/*---------------------------------------------------------------------*/
export
function parseBoard(board) {
   const rows = board.split("\n")
                     .filter(l => !l.match(/^[ \t]*$/))
                     .map(s => s.trim());
   const givens = {};
   
   iota.forEach(i => iota.forEach(j => {
      if (rows[j][i] !== ".") {
         givens[`must${i}${j}`] = new Set([parseInt(rows[j][i])]);
      }}));
   
   return givens;
}

/*---------------------------------------------------------------------*/
/*    displayBoard ...                                                 */
/*---------------------------------------------------------------------*/
export function displayBoard(signals) {
  // something is wierd about the way `i` and `j` are swapped here
  const board = iota.map(j => iota.map(i => cell_number(signals,i,j) || "."));
  board.forEach((row, j) => console.log("|" + row.join("") + "|"));
}

function cell_number(signals,i,j) {
  let s = signals[`must${i}${j}`]
  if (!s || s.size == 0)
    return false;
  return s.first();
}

/*---------------------------------------------------------------------*/
/*    checkSolution ...                                                */
/*---------------------------------------------------------------------*/
export function checkSolution(signals) {
   const tab = Math.sqrt(BOARD_SIZE);

   function checkBlock(cells) {
      const set = new Set(iota.map(v => v + 1));
      cells.forEach(v => set.delete(v));
      return set.size === 0;
   }
   
   const board = iota.map(i => iota.map(j => -1));
   iota.forEach(i => iota.forEach(j => board[j][i] = cell_number(signals,i,j)));

   if (iota.every(i => checkBlock(iota.map(j => board[i][j])))) {
      if (iota.every(j => checkBlock(iota.map(i => board[i][j])))) {
	 return iota.every(i => {
	    const x0 = i * tab % iota.length;
	    const y0 = Math.floor(i * tab / iota.length) * tab;
	    return checkBlock(iota.map(j => {
	       const x = (j % tab);
	       const y = Math.floor(j * tab / iota.length);
	       return board[x + x0][y + y0];
	    }));
	 });
      } else {
	 return false;
      }
   } else {
      return false;
   }
}
