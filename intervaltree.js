var node = require("./node.js");
var interval = require("./interval.js");

function _IntervalTree(intervals=undefined)
{
    this.all_intervals = intervals;
    this.top_node = node.from_intervals(this.all_intervals);
}

_IntervalTree.prototype.add = function(interval)
{
    if (this.top_node == undefined) {
        this.top_node = node.from_interval(interval);
    } else {
        this.top_node = this.top_node.add(interval);
    }
}

function IntervalTree(intervals=undefined)
{
    return new _IntervalTree(intervals);
}

exports.IntervalTree = IntervalTree;
exports.Interval = interval.Interval;
