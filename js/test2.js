
var i = require("./intervaltree.js");

var tree0 = i.IntervalTree([i.Interval(-10, 10),      i.Interval(-20.0, -10.0)]);
var tree1 = i.IntervalTree([i.Interval(-20.0, -10.0), i.Interval(-10, 10)]);
