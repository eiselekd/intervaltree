
function aset(a=[]) {
    if (a instanceof aset) {
        this.a = [...a.a];
    } else {
        this.a = [];
        for (var i of a) {
            this.add(i);
        }
    }
}

aset.prototype.add = function(interval) {
    for (var i of this.a) {
        if (i.cmp(interval) == 0)
            return;
    }
    this.a.push(interval);
};

Object.defineProperty(aset.prototype, 'length', {get: function() {
    return this.a.length;
}});

function Set(a=[]) {
    return new aset(a);
}

exports.Set = Set;
