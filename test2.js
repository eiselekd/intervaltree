
var iv = require("./intervaltree.js");

var tree0 = iv.IntervalTree([iv.Interval(-10, 10),      iv.Interval(-20.0, -10.0)]);
var tree1 = iv.IntervalTree([iv.Interval(-20.0, -10.0), iv.Interval(-10, 10)]);

for (var i = 0; i < 1000; i += 5) {
    var i0 = iv.Interval(i-1,i+5+1);
    console.log("Add: "+i0.str());
    tree0.add(i0);

    tree0.top_node.print_structure();

}
