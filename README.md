ICFP 2024 Artifact
==================
![branch workflow](https://github.com/manuel-serrano/icfp2024-sudoku/actions/workflows/icfp2024-sudoku.yml/badge.svg)

Name: The Functional, the Imperative, and the Sudoku

## Artifact Instructions

This artifact can be installed and ran either:

  1. using the VM availabe at http://xxx.org;
  2. using the a native installation. 
  
The VM provides a complete Linux image where a native version
of the artifact has been pre-installed. 

### Alternative 1: VM-base artifact

To execute the artifact via the VM distribution, install QEMU and run
the virtual machine as instructed in Section [QEMU Instructions] (see
below). Once connected to the VM go into the `icfp-2024`
directory. It contains a pre-installed native version of
the artifact (as documented in Section [Native arifact]). To execute it:

```
npm run sudoku
```

### Alternative 2: Native artifact

In order to install the version of the ICFP artifact the following
packages are required:

  - `git`
  - `nodejs`
  - `npm`

Then, to install the artifact:

```
git clone https://github.com/manuel-serrano/icfp2024-sudoku.git
cd icfp2024-sudoku
npm install
```

To test that the installation worked correctly:

```
npm run sudoku
```

## The Artifact

This artifact will let you run the HipHop solver and conduct some
experiments with new puzzles and solver extensions. The objective is
to help you taste the HipHop programming flavor. For that, first, we
briefly present the structure and organization of the solver and then
we suggest three assignments to get you familiar with HipHop.

### Description of the Sudoku solver

The files composing the HipHop Sudoku solver are:

  - `sudoku.hh.mjs`: the Sudoku implementation;
  - `boards9x9.mjs`: a collection of Sudoku boards;
  - `utils.mjs`: various utility functions;
  - `set.mjs`: a compatibility kit for JS implementations lacking set support;
  - `test.hh.mjs`: the test driver;
  - `package.json`: the NPM metadata.

To run the artifact via `npm`:

```
npm run sudoku
```

Alternatively, you can invoke `nodejs` directly without `npm` as follows:

```
node --enable-source-maps --no-warnings --loader ./node_modules/@hop/hiphop/lib/hiphop-loader.mjs test.hh.mjs
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
  As `solve`, but execute only one resolution step.
  
  
The file `board9x9.mjs` exports some Sudoku problems. Each
problem is a JavaScript string of 9 lines and 9 columns.
Each character is either a digit between 1 and 9 or
the character `.`. https://sudoku.com/ is a large Sudoku database
where many puzzle of different difficulties can be found.

### Assignment 1, Solving another puzzle

In this section we show how to use the solver API to create new
boards and how to solve them using different strategies. 

In the directory containing `sudoku.hh.mjs, open a file named
`mypuzzle.mjs` and cut-and-paste the following:

```
import { solve, SudokuNakedSingle } from "./sudoku.hh.mjs";

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

solve([], myBoard);
```

Run that program with to solve the puzzle with only guessing, no stratgies:

```
node --enable-source-maps --no-warnings --loader ./node_modules/@hop/hiphop/lib/hiphop-loader.mjs mypuzzle.mjs
```

To solve the puzzle using one of the strategies described in the
paper, for instance, the `SudokuNakedSingle` strategy, change the
invokation of `solve` method with as first argument an array of size 1
containing only the strategy, as in:

```
solve([SudokuNakedSingle], myBoard);
```

Run again the program. Depending on the puzzle you chose, the
execution should require a smaller number of reactions, which is
visible in the logs the solver generate.

The Sudoku solver logs information on the standard output port. 
First, when `solve` is called, it displays the strategies it has
received as parameter as a array of integers, which stand for the
first character number of each strategy implementation. For instance:

```
strategies [ 6871, 7615 ]
```

Where 6871 and 7615 are the character locations of the stategies 
`SudokuNakedSingle`, and `SudokuHiddenSingle`.


Second, it displays the puzzle to be solved. For instance:

```
|3..6.2..4|
|....798.3|
|.1....7..|
|....6...2|
|.417.8...|
|7.6...4..|
|9.728534.|
|.8....29.|
|123.4756.|
```

Then, it displays information about each guess and backtracking. When the
solver cannot make any new deduction, it picks the first unknown cell
and try in sequence all the possibilities for that cell. The trace displayed
contained the cell coordinate of the guess, the digit selected for that
cell, and the set of possibilities for that cell. For instance:

```
guessing 0x1 val=1/{1,5,6,7} [1:0]
```

The solver guesses the digit `1` for the cell `(0,1)`. The possible digits
for that cell are `1, 5, 6, 7`. If selecting `1` does not yield to a 
puzzle complete resolution, the solver will then try the digit `5`, then
`6`, and eventually `7`.

The trace contains a visualization of the depth of a guess. A series of
`.` characters in the left margin indicate the number of pending guesses.
For instance:

```
guessing 0x1 val=1/{1,5,6,7} [1:0]
.guessing 0x2 val=3/{3,6} [2:1]
..guessing 1x0 val=7/{7,8} [3:2]
```

means that the digit `7` is explored for the cell `(1, 0)` in a context
where the cell `(0, 2)` is guess to be `3` and the cell `(0, 1)` to be
`1`.

When the solver completes or fails it displays the number of HipHop reactions
executed. 

### Assignment 2, Adding a new observer

To start a simple modification to the code, we suggest addding a new
observer to the Sudoku solver. The `Sudoku` JavaScript constructor in
sudoku.hh.mjs generates a HipHop solver by running in parallel
builtins components and the strategies.  For this assigment, you
should add a new `par` construct to the `fork` inside the `abort
immediate` (line 56) of the `Sudoku` machine that would implement your
observer.

For debugging and developping, if you need to generate a trace 
you can use the Hiphop `pragma` statement as in the following
example:

```
pragma {
   console.log("in my Observer");
}
```

If you run the solver on the same example as in the end of the first
assignment above, and add that `pragma` in a new `par` branch as
suggested above, you will see one printout each time the solver
discovers a bad guess and restarts the solving process, because this
`par` arm terminates right after printing.

If you wrap it in a `loop` and add a `yield`, like so:
```
loop {
   pragma {
      console.log("in my Observer");
   }
   yield;
}
```
you will see many more printouts, one for each instant that is run.

The content of the `pragma` can be arbitrary JavaScript code, and we
can use it to access the state of the signals. So we could print out a
string that is slightly different each time, e.g. telling us the state
of some specific cells, e.g.
```
console.log(this["must33"].nowval, this["must88"].nowval);
```

With this line, you can see that the bottom-right cell (8,8), is
determined quickly, but the cell (3,3) is not known quickly and,
indeed, there are incorrect guesses made about it.

Using these ideas, try to print out the percentage of resolution,
_i.e._, the percentage of cells that emit a `must` signal with exactly
one value. JavaScript's string interpolation will be helpful; it lets
you write ``this[`must${i}${j}`].nowval`` to get a set that is the value
of the must signal for the cell whose coordinates are determined by
the JavaScript variables `i` and `j`.

Staging might yield to programmer errors sometime difficult to interpret.
For instance, let us consider the following JavaScript function that
builds a single HipHop statement:

```
const myObserver = () => {
   return hiphop {
      pragma {
         let i = 0;
         console.log(this[`must${i}${i}`].nowval.size);
      }
   }
}
```

Inserting the generated `pragma` form would trigger the following error:

```
/home/serrano/diffusion/article/icfp2024-sudoku/bug.hh.mjs:44
         console.log(this[`must${i}${i}`].nowval.size);
                                 ^
ReferenceError: i is not defined
    at myObserver (/home/serrano/diffusion/article/icfp2024-sudoku/bug.hh.mjs:44:34)
```

This is because the variable `i` is only known when the `pragma` form
executes but to decide when executing that form the HipHop compiler
needs to compute the complete list of signal dependencies. For that
it collects all the signals _syntactically_ mentioned in the
expression and generates a code that check them, before the reaction
starts. This is when the error above is triggered.

In short, all HipHop signals used inside a JavaScript statement or expression
must have named that can be resolved with the HipHop program is compiled.
For instance, we have to transformed `myObserver` into:

```
const myObserver = () => {
   let i = 0;
   return hiphop {
      pragma {
         console.log(this[`must${i}${i}`].nowval.size);
      }
   }
}
```

Of course, this transformation is not always possible as the two
versions do not have the same semantics.

In some situations, it might be useful to use local variables
in HipHop fragments, for instance to accumulate values. If a variable
is assigned in a reaction, the effect of this assignment should not
be observed from within HipHop during that same reaction. 

Let us imagine that we need to sum all the sizes of the `nowval` of
cells belonging to the same raw. This can be accomplished by using
a JavaScript variable bound in a `let` construct and by adding all
the successive values. For instance:

```
const sumRaw = (j) => {
   return hiphop {
      let sum = 0;
      pragma { sum += this[`must0${j}`].nowval.size; }
      pragma { sum += this[`must1${j}`].nowval.size; }
      pragma { sum += this[`must2${j}`].nowval.size; }
      pragma { sum += this[`must3${j}`].nowval.size; }
      pragma { sum += this[`must4${j}`].nowval.size; }
      pragma { sum += this[`must5${j}`].nowval.size; }
      pragma { sum += this[`must6${j}`].nowval.size; }
      pragma { sum += this[`must7${j}`].nowval.size; }
      pragma { sum += this[`must8${j}`].nowval.size; }
      pragma { console.log("SUM=", sum); }
   }
}
```

Using staging we can write a more compact version:

```
const sumRaw = (j) => {
   return hiphop {
      let sum = 0;
	  ${[0,1,2,3,4,5,6,7,8].map(i => {
	     return pragma { sum += this[`must${i}${j}`].nowval.size; }
	  });
      pragma { console.log("SUM=", sum); }
   }
}
```

As you can notice the `[0,1,2,3,4,5,6,7,8].map(i => { ... })` expression
constructs an array of HipHop fragments. Such an array is flattened by
the HipHop compiler when elaborating the complete AST of the program
to be compiled.


### Assignment 3, Implementing a new Strategy

The web site https://hodoku.sourceforge.net describes a plethora of
known strategies that humans commonly use to solve puzzles. Some are
either to implement than other. The complexity of the implementation
is generally coming from the number of houses or cells that are
involved in a strategy. For instance 
[Locked Candidates Type 1](https://hodoku.sourceforge.net/en/tech_intersections.php) should be relatively simple to implement while [Complex Fish](https://hodoku.sourceforge.net/en/tech_fishc.php) are likely to be much harder.

All HipHop strategies comply with the same protocol:

  1. They are implemented as independent HipHop fragment that run in
  parallel with one another;
  2. They read the `must.nowval` and `cannot.preval`;
  3. They either emit new `cannot`, new `must`, or both;
  4. Reading a `must` and emitting a `cannot` can be done in the same
  reaction;
  5. Other emissions should use the value of the previous instant. See 
  for instance the `SudokuNakedSingle` implementation
  that uses the expression ``this[`cannot${i]${j}].preval`` for this very
  reason.
  
  
## QEMU Instructions

The ICFP 2024 Artifact Evaluation Process is using a Debian QEMU image as a
base for artifacts. The Artifact Evaluation Committee (AEC) will verify that
this image works on their own machines before distributing it to authors.
Authors are encouraged to extend the provided image instead of creating their
own. If it is not practical for authors to use the provided image then please
contact the AEC co-chairs before submission.

QEMU is a hosted virtual machine monitor that can emulate a host processor
via dynamic binary translation. On common host platforms QEMU can also use
a host provided virtualization layer, which is faster than dynamic binary
translation.

QEMU homepage: https://www.qemu.org/

### Installation

#### OSX
``brew install qemu``

#### Debian and Ubuntu Linux
``apt-get install qemu-kvm``

On x86 laptops and server machines you may need to enable the
"Intel Virtualization Technology" setting in your BIOS, as some manufacturers
leave this disabled by default. See Debugging.md for details.


#### Arch Linux

``pacman -Sy qemu``

See the [Arch wiki](https://wiki.archlinux.org/title/QEMU) for more info.

See Debugging.md if you have problems logging into the artifact via SSH.


#### Windows 10

Download and install QEMU via the links at

https://www.qemu.org/download/#windows.

Ensure that `qemu-system-x86_64.exe` is in your path.

Start Bar -> Search -> "Windows Features"
          -> enable "Hyper-V" and "Windows Hypervisor Platform".

Restart your computer.

#### Windows 8

See Debugging.md for Windows 8 install instructions.

### Startup

The base artifact provides a `start.sh` script to start the VM on unix-like
systems and `start.bat` for Windows. Running this script will open a graphical
console on the host machine, and create a virtualized network interface.
On Linux you may need to run with `sudo` to start the VM. If the VM does not
start then check `Debugging.md`

Once the VM has started you can login to the guest system from the host.
Whenever you are asked for a password, the answer is `password`. The default
username is `artifact`.

```
$ ssh -p 5555 artifact@localhost
```

You can also copy files to and from the host using scp.

```
$ scp -P 5555 artifact@localhost:somefile .
```

### Shutdown

To shutdown the guest system cleanly, login to it via ssh and use

```
$ sudo shutdown now
```

