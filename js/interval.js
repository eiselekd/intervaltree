
function _Interval(begin, end, data=undefined) {
    this.begin = begin;
    this.end = end;
    this.data = data;
}

_Interval.prototype.cmp = function(a,b) {
    if (a.begin != b.begin) {
        return ((a.begin - b.begin) < 0) ? -1 : 1;
    } else if (a.end != b.end) {
        return ((a.end - b.end) < 0) ? -1 : 1;
    }
    return ((a.data - b.data))<0 ? -1 : 1;
};

function Interval(begin, end, data=undefined) {
    return new _Interval(begin, end, data);
}

exports.Interval = Interval;
