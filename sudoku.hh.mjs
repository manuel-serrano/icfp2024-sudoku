// -*- Mode: typescript; typescript-indent-level: 3; indent-tabs-mode: nil -*-
/*=====================================================================*/
/*    serrano/diffusion/article/icfp2024-sudoku/sudoku.hh.mjs          */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano & Robby Findler                    */
/*    Creation    :  Sat Dec 23 07:16:35 2023                          */
/*    Last change :  Thu May 30 16:27:04 2024 (serrano)                */
/*    Copyright   :  2023-24 Manuel Serrano & Robby Findler            */
/*    -------------------------------------------------------------    */
/*    Sudoku resolver that can make several guesses when stuck using   */
/*    a JS function.                                                   */
/*=====================================================================*/

/*---------------------------------------------------------------------*/
/*    The module                                                       */
/*---------------------------------------------------------------------*/
import * as hh from "@hop/hiphop";
import * as boards9x9 from "./boards9x9.mjs";
import "./set.mjs";
import {
   BOARD_SIZE, iota, digits, margins,
   initMargins, parseBoard, displayBoard, checkSolution } from "./utils.mjs";

export {
   Sudoku, SudokuNakedSingle, SudokuHiddenSingle, SudokuNakedPair, solve, step
}

/*---------------------------------------------------------------------*/
/*    verbose                                                          */
/*---------------------------------------------------------------------*/
let verbose = 1;

/*---------------------------------------------------------------------*/
/*    Interfaces ...                                                   */
/*---------------------------------------------------------------------*/
const inconsistent = (must, cannot) => {
   return must.size > 1 || must.intersection(cannot).size > 0;
}

/*---------------------------------------------------------------------*/
/*    Sudoku ...                                                       */
/*    -------------------------------------------------------------    */
/*    The Sudoku main program generator.                               */
/*---------------------------------------------------------------------*/
const Sudoku = strategies => hiphop module() {
   inout ... ${iota.flatMap(i => iota.map(j => `must${i}${j}`))} =
      new Set() combine (x, y) => x.union(y);
   inout ... ${iota.flatMap(i => iota.map(j => `cannot${i}${j}`))} =
      new Set() combine (x, y) => x.union(y);
   inout reset = false combine (x, y) => x || y;
   inout status;
   inout unsolved = new Set() combine (x, y) => x.union(y);

   loop {
      abort immediate (reset.nowval) {
         fork {
            ${MustThisCannot()}
         } par {
            ${ForkHouseMap(MustOtherCannot)}
         } par {
            ${SudokuObserver()};
         } par {
            fork ${strategies}
         }
      }

      ${iota.map(i => hiphop ${iota.map(j => hiphop {
         emit ${`must${i}${j}`}(new Set());
         emit ${`cannot${i}${j}`}(new Set());
      })})}

      yield;
      emit reset(false);
   }
}

/*---------------------------------------------------------------------*/
/*    SudokuObserver                                                   */
/*    -------------------------------------------------------------    */
/*    The observer that decides when the game is solved.               */
/*---------------------------------------------------------------------*/
const SudokuObserver = () => hiphop {
   signal progress = false combine (x, y) => x || y;

   loop {
      emit unsolved(new Set());
      emit progress(false);
      cont: {
         ${iota.map(i => hiphop ${iota.map(j => hiphop {
            if (inconsistent(this[`must${i}${j}`].nowval,
                             this[`cannot${i}${j}`].nowval)) {
               emit status("reject");
               break cont;
            }
            if (this[`must${i}${j}`].nowval.size === 0) {
               emit unsolved(new Set([{
                  i: i, j: j,
                  digits: digits.difference(
                     this[`cannot${i}${j}`].nowval)}]));
            }
            if ((this[`must${i}${j}`].nowval.size >
                 this[`must${i}${j}`].preval.size) ||
                (this[`cannot${i}${j}`].nowval.size >
                 this[`cannot${i}${j}`].preval.size)) {
               emit progress(true);
            }
         })})};
         if (unsolved.nowval.size === 0) {
            emit status("solved");
         } else if (progress.nowval) {
            emit status("progress");
         } else {
            emit status("stall");
         }
      } // end cont:
      yield;
   } // end loop
}

/*---------------------------------------------------------------------*/
/*    ForkHouseMap ...                                                 */
/*---------------------------------------------------------------------*/
const ForkHouseMap = proc => hiphop {
   fork {
      fork ${iota.map(i => proc(iota.map(j => { return {i, j} })))}
   } par {
      fork ${iota.map(j => proc(iota.map(i => { return {i, j} })))}
   } par {
      fork ${iota.map(i => {
         const chute_len = Math.sqrt(iota.length);
         const i0 = chute_len * (i % chute_len);
         const j0 = chute_len * Math.floor(i / chute_len);
         return proc(iota.map(j => {
            return {
               i : i0 + j % chute_len,
               j : j0 + Math.floor(j * chute_len / iota.length)};
         }))})}
   }
}

/*---------------------------------------------------------------------*/
/*    House ...                                                        */
/*---------------------------------------------------------------------*/
const MustOtherCannot = coords => hiphop {
   fork ${coords.map(c => hiphop loop {
      let c_must = this[`must${c.i}${c.j}`].nowval;
      ${coords
         .filter(d => c.i !== d.i || c.j !== d.j)
         .map(d => hiphop {
              emit ${`cannot${d.i}${d.j}`}(c_must);})}
      yield;
   })}
}

/*---------------------------------------------------------------------*/
/*    MustThisCannot ...                                               */
/*---------------------------------------------------------------------*/
const MustThisCannot = () => hiphop {
   fork ${iota.map(i => hiphop fork ${iota.map (j => hiphop {
      loop {
         let m = this[`must${i}${j}`].nowval;
         if (m.size === 1) {
            emit ${`cannot${i}${j}`}(digits.difference(m))
         }
         yield;
      }
   })})}
}

/*---------------------------------------------------------------------*/
/*    SudokuNakedSingle ...                                            */
/*    -------------------------------------------------------------    */
/*    https://hodoku.sourceforge.net/en/tech_singles.php               */
/*---------------------------------------------------------------------*/
const SudokuNakedSingle = hiphop {
   fork ${iota.map(i => hiphop fork ${iota.map(j => hiphop {
      done: {
         loop {
            if (this[`cannot${i}${j}`].preval.size === digits.size - 1)
               break done
            yield;}}
      let must = digits.difference(this[`cannot${i}${j}`].preval);
      sustain ${`must${i}${j}`}(must);
   })})}};


/*---------------------------------------------------------------------*/
/*    SudokuHiddenSingle ...                                           */
/*    -------------------------------------------------------------    */
/*    https://hodoku.sourceforge.net/en/tech_singles.php               */
/*---------------------------------------------------------------------*/
const SudokuHiddenSingle = hiphop ${ForkHouseMap(coords => hiphop {
   loop {
      ${coords.map(ignored => hiphop {
         signal cans = digits combine (x, y) => x.intersection(y);

         ${coords
            .filter(c => ignored.i !== c.i || ignored.j !== c.j)
            .map(c => hiphop {
               emit cans(this[`cannot${c.i}${c.j}`].preval)
            })};

         if (cans.nowval.size === 1) {
            emit ${`must${ignored.i}${ignored.j}`}(cans.nowval)
         }
      })};
      yield;
   }})};

/*---------------------------------------------------------------------*/
/*    SudokuNakedPair ...                                              */
/*    -------------------------------------------------------------    */
/*    https://hodoku.sourceforge.net/en/tech_naked.php                 */
/*---------------------------------------------------------------------*/
const SudokuNakedPair = hiphop ${ForkHouseMap(coords => hiphop {
   fork ${coords.map(c => hiphop {
      loop {
         let c_cannot = this[`cannot${c.i}${c.j}`].preval;
         if (c_cannot.size === digits.size - 2) {
            ${coords
               .filter(d => c.i !== d.i || c.j !== d.j)
               .map(d => hiphop {
                  let d_cannot = this[`cannot${d.i}${d.j}`].preval;
                  if (c_cannot.equal(d_cannot)) {
                     fork ${coords
                        .filter(e => (e.i !== c.i || e.j !== c.j)
                                  && (e.i !== d.i || e.j !== d.j))
                        .map(e => hiphop {
                           sustain ${`cannot${e.i}${e.j}`}(
                              digits.difference(c_cannot));
                        })}}})}}
         yield;
      }})}})};

/*---------------------------------------------------------------------*/
/*    driver ...                                                       */
/*---------------------------------------------------------------------*/
const driver = (mach, givens) => {
   while (true) {
      // run one HipHop reaction and...
      const signals = mach.react(givens);

      // ... check the resolution status
      switch (signals.status) {
         case "progress":
            break;
         case "stall":
            const { i, j, digits } = signals.unsolved.first();
            const newGivens = Object.assign({}, givens);

            for (let guess of digits) {
               newGivens[`must${i}${j}`] = new Set([guess]);
               mach.guessNum++; if (verbose > 0) { console.log(margins[depth] + `guessing ${i}x${j} val=${guess}/{${digits.array()}} [${mach.guessNum}:${depth}]`); depth+=1; }
               const newSignals = driver(mach, newGivens);
               
               mach.depth-=1;
               if (newSignals.status === "solved") {
                  return newSignals;
               } else {
                  mach.react({reset: true});
               }
            }
            if (verbose > 0) {
               console.log(margins[mach.depth] +`guess ${i}x${j} REJECT ${signals.unsolved.size}/${iota.length * iota.length}`);
            }
            return {status: "reject"};

         case "solved":
         case "reject":
            return signals;
      }
   }
}

/*---------------------------------------------------------------------*/
/*    solve ...                                                        */
/*    -------------------------------------------------------------    */
/*    Try to solve the whole board, that is run until either           */
/*    completion or an error.                                          */
/*---------------------------------------------------------------------*/
const solve = (strategies, board) => {
   console.log("----------------------");
   console.log("strategies", strategies.map(x => x.loc.pos));
   const sweep = false;
   const mach = new hh.ReactiveMachine(Sudoku(strategies), { sweep, verbose: parseInt(process.env?.VERBOSE ?? "1") });
   mach.depth = 0;
   mach.guessNum = 0;

   initMargins(board);
   const givens = parseBoard(board);
   displayBoard(givens);
   initMargins();
   
   let signals = driver(mach, givens);

   if (signals.status === "solved") {
      const check = checkSolution(signals);
      console.log("");
      displayBoard(signals);
      console.log("");
      console.log("# reactions: ", mach.age());
      console.log("check:", check);
      if (process.env.SUDOKU_TEST && !check) {
         console.error("test failed.");
         process.exit(1);
      }
   } else {
      console.log("no solution!");
   }
   mach.react({reset: true});
}

/*---------------------------------------------------------------------*/
/*    step                                                             */
/*    -------------------------------------------------------------    */
/*    Run one step and stop.                                           */
/*---------------------------------------------------------------------*/
const step = (mach, board, verbose) => {
   const givens = parseBoard(board);
   if (verbose) {
      displayBoard(givens);
   }
   initMargins();
   
   mach.guessNum = 0;
   mach.depth=0;
   
   let signals = mach.react(givens);
   let initsize = signals.unsolved.size;
   let res = 0;

   while (signals.status === "progress") {
      res = initsize - signals.unsolved.size;
      if (verbose) {
         console.log(signals.status, res, initsize, signals.unsolved.size);
         displayBoard(signals);
      }
      signals = mach.react(givens);
   }
   return res;
}
