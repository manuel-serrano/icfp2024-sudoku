/*=====================================================================*/
/*    serrano/diffusion/article/hiphop-sudoku-pearl/set.mjs            */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sat Dec 23 07:16:57 2023                          */
/*    Last change :  Mon Jan  8 10:38:18 2024 (serrano)                */
/*    Copyright   :  2023-24 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    A tiny compatibility set kit.                                    */
/*=====================================================================*/

if (!("union" in Set.prototype)) {
   Set.prototype.union = function(s) {
      const n = new Set(this);
      for (let v of s) {
	 n.add(v);
      }
      return n;
   }
}

if (!("intersection" in Set.prototype)) {
   Set.prototype.intersection = function(s) {
      const n = new Set();
      for (let v of s) {
	 if (this.has(v)) {
	    n.add(v);
	 }
      }
      return n;
   }
}

if (!("difference" in Set.prototype)) {
   Set.prototype.difference = function(s) {
      const n = new Set();
      for (let v of this) {
	 if (!s.has(v)) {
	    n.add(v);
	 }
      }
      return n;
   }
}

Set.prototype.value = function() {
   return this.values().next().value;
}

Set.prototype.array = function() {
   const a = [];

   this.forEach(v => a.push(v));
   return a;
}

Set.prototype.first = function() {
  if (this.size == 0) {
    return undefined
  } else {
    return this.keys().next().value;
  }
}

Set.prototype.equal = function(s) {
   if (this.size !== s.size) {
      return false;
   } else {
      for (let v of this) {
	 if (!s.has(v)) {
	    return false;
	 }
      }
      return true;
   }
}
	    
