
function aset(a=[]) {
    this.h = {};
    this.a = [];
    var f = this;
    a.map(function(e) {
        f.add(e);
    });
}

aset.prototype.add = function(interval) {
    var id = interval.id();
    if (id in this.h) {
        return;
    }
    this.h[id] = this.a.length;
    this.a.push(interval);
};

aset.prototype.map = function(f) {
    this.a.map(f);
};

aset.prototype.push = function(e) {
    this.a.push(e);
};

aset.prototype.update = function(a) {
    var f = this;
    a.map(function(e) {
        f.add(e);
    });
};

aset.prototype.has = function(e) {
    var id = e.id();
    return (id in this.h);
}

aset.prototype.filter = function(f) {
    return this.a.filter(f);
};

aset.prototype.remove = function(interval) {
    var id = interval.id();
    var idx = this.h[id];
    delete this.h[id];
    this.a.splice(idx,1);
    for (var k in this.h) {
        if (this.h[k] > idx)
            this.h[k] = this.h[k]-1;
    }
};

aset.prototype.remove_set = function(a) {
    var f = this;
    a.map(function(e) {
        f.remove(e);
    });
}

Object.defineProperty(aset.prototype, 'length', {get: function() {
    return this.a.length;
}});

function Set(a=[]) {
    return new aset(a);
}

exports.Set = Set;
