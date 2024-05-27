ICFP 2024 Artifact
==================
![branch workflow](https://github.com/manuel-serrano/icfp2024-sudoku/actions/workflows/icfp2024-sudoku.yml/badge.svg)

Name: The Functional, the Imperative, and the Sudoku

## Artifact Instructions


This artifact can be installed and ran either:

  1. using the provided VM;
  2. using the a native installation. 
  
### VM-base artifact

To execute the artifact, install QEMU and run the virtual machine as
instructed in Section [QEMU Instructions] (see below). Once
connected to the VM go into the `icfp-2024` directory and execute:

```
npm run sudoku
```

### Native artifact

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

To run the test:

```
npm run sudoku
```

### Description of the Sudoku solver

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
  
  
The file `board9x9.mjs` exports some Sudoku problems. Each
problem is a JavaScript string of 9 lines or 9 columns.
Each character is either a digit between 1 and 9 or
the character `.`. https://sudoku.com/ is a large Sudoku database
where many puzzle of different difficulties can be found.

The following is a complete example that shows how to use the Sduoku
API and how to create a new board and how to solve it using no
specific strategy (which implies guesses and backtracking):

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

solve([], myBoard);
```

To solve the puzzle using one of the strategies described in the paper, 
for instance, the `SudokuNakedSingle` strategy, involve the `solve`
method with as first argument an array of size 1 containing only
the strategy, as in:

```
solve([SudokuNakedSingle], myBoard);
```

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
|4..6.....|
|..2.3....|
|.....9827|
|8..41....|
|9.......5|
|.6.....7.|
|.3....4.6|
|....962..|
|.9.....5.|
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
6, and eventually `7`.

The trace contains a visualization of the depth of a guess. A series of
"." character in the left margin indicates the number of pending guesses.
For instance:

```
guessing 0x1 val=1/{1,5,6,7} [1:0]
.guessing 0x2 val=3/{3,6} [2:1]
..guessing 1x0 val=7/{7,8} [3:2]
```

means that the digit `7` is explored for the cell `(1, 0)` in a context
where the cell `(0, 2)` is guess to be `3` and the cell `(0, 1)` to be
`1`.

When the solver completes or fails it displays the number of HipHop reactiions
executed. 


### Implementing new Strategies

The web site https://hodoku.sourceforge.net describes a plethora of
known strategies that humans commonly use to solve puzzles. Some are
either to implement than other. The complexity of the implementation
is generally coming from the number of houses or cells that are
involved in a strategy. For instance 
[Locked Candidates Type 1](https://hodoku.sourceforge.net/en/tech_intersections.php) should be relatively simple to implement while [Complex Fish](https://hodoku.sourceforge.net/en/tech_fishc.php) are likely to be much harder.

All HipHop strategies comply with the same protocol:

  1. There are implemented as independent HipHop fragment that run in
  parallel with one another;
  2. They read the `cannot` and `must`;
  3. They either emit new `cannot`, `new `must`, or both.
  
If a strategy has to emit the same sets of signals as the one it reads, 
in order to avoid causality cycles, it has to `yield` for one reaction.
For instance, the `SudokuNakedPair` strategy reads and emits the `cannot`
so before any `sustain`, it yields to wait for the next reaction.

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

