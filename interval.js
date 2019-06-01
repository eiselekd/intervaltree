
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

_Interval.prototype.id = function(a) {
    return this.begin + "," + this.end + "," + this.data;
};

_Interval.prototype.str = function(a) {
    if (this.data === undefined) {
        return "Interval("+this.begin+","+this.end+")";
    } else {
        return "Interval("+this.begin+","+this.end+","+this.data+")";
    }
};

_Interval.prototype.contains_point = function(p) {
    return (this.begin <= p) && (p < this.end);
}

function Interval(begin, end, data=undefined) {
    return new _Interval(begin,end,data);
}

exports.Interval = Interval;
