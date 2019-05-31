var node = require("./node.js");
var Set = require("./set.js").Set;
var interval = require("./interval.js");

function IntervalTree(intervals=undefined) {
    this.all_intervals = Set(intervals);
    this.top_node = node.from_intervals(this.all_intervals);
}

IntervalTree.prototype.add = function(interval) {
    if (this.top_node == undefined) {
        this.top_node = node.from_interval(interval);
    } else {
        this.top_node = this.top_node.add(interval);
    }
}

exports.IntervalTree = IntervalTree;
exports.Interval = interval.Interval;
