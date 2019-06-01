
var iv = require("./intervaltree.js");

var tree0 = iv.IntervalTree([]);

for (var i = 0; i < 20; i += 5) {
    var i0 = iv.Interval(i-1,i+5+1);
    console.log("Add: "+i0.str());
    tree0.add(i0);
}

console.log(tree0.str());

for (var i = 5; i < (20-5); i += 5) {
    var i0 = iv.Interval(i-5-1,i+1)
    var i1 = iv.Interval(i-1,i+5+1)
    var a = tree0.at(i);
    console.log(i+":");
    console.log(a);
    //.equal(Set(a));
}

