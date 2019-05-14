
function IntervalTree(intervals=undefined) {
    this.all_intervals = Set();
    this.top_node = from_intervals(this.all_intervals)
}


IntervalTree.prototype.add = function(interval) {
    if (this.top_node == undefined) {
        this.top_node = from_interval(interval);
    } else {
        this.top_node = this.top_node.add(interval);
    }
}
