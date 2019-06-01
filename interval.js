
function _Interval(begin, end, data=undefined) {
    this.begin = begin;
    this.end = end;
    this.data = data;
}

_Interval.prototype.cmp = function(a) {
    if (this.begin != a.begin) {
        return ((this.begin - a.begin) < 0) ? -1 : 1;
    } else if (this.end != a.end) {
        return ((this.end - a.end) < 0) ? -1 : 1;
    }
    return ((this.data - a.data))<0 ? -1 : 1;
};

function Interval(begin, end, data=undefined) {
    return new _Interval(begin, end, data);
}

exports.Interval = Interval;
