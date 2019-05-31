
function aset(a=[]) {
    this.a=[...a];
}

aset.prototype.add = function(interval) {
    for (var i of this.a) {
        if (i.cmp(interval) == 0)
            return;
    }
    this.a.push(interval);
};

function Set(a=[]) {
    return new aset(a);
}

exports.Set = Set;
