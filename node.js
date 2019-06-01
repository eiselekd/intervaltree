var interval = require("./interval.js");
var Interval = interval.Interval;
var interval_cmp = interval.interval_cmp;
var Set      = require("./set.js").Set;

function l2(num)
{
    return Math.log2(num);
}

function Node(x_center=undefined, s_center=[],left_node=undefined,right_node=undefined)
{
    this.x_center = x_center;
    this.s_center = Set(s_center);
    this.left_node = left_node;
    this.right_node = right_node;
    this.depth = 0;    // will be set when rotated
    this.balance = 0;  // ditto
    this.rotate();
}

Object.defineProperty(Node.prototype, '0',
{
    set: function(v) {
        this.left_node = v;
    },
    get: function() {
        return this.left_node;
    }
});

Object.defineProperty(Node.prototype, '1',
{
    set: function(v) {
        this.right_node = v;
    },
    get: function() {
        return this.right_node;
    }
});

Node.prototype.init_from_sorted = function(intervals)
{
    // assumes that intervals is a non-empty collection.
    // Else, next line raises IndexError
    var center_iv = intervals[((intervals.length) / 2)>>0];
    this.x_center = center_iv.begin;
    this.s_center = Set([]);
    var s_left = [];
    var s_right = [];
    for (var k of intervals) {
        if (k.end <= this.x_center) {
            s_left.push(k);
        } else if (k.begin > this.x_center) {
            s_right.push(k);
        } else {
            this.s_center.push(k);
        }
    }
    this.left_node = from_intervals(s_left);
    this.right_node = from_intervals(s_right);
    return this.rotate();
}

Node.prototype.center_hit = function(interval)
{
    return interval.contains_point(this.x_center);
}

Node.prototype.hit_branch = function(interval)
{
    return (interval.begin > this.x_center) ? 1 : 0;
}

Node.prototype.refresh_balance = function()
{
    var left_depth = this.left_node ? this.left_node.depth : 0;
    var right_depth = this.right_node ? this.right_node.depth : 0;
    this.depth = 1 + Math.max(left_depth, right_depth);
    this.balance = right_depth - left_depth;
};

Node.prototype.compute_depth = function()
{
    var left_depth = this.left_node ? this.left_node.compute_depth() : 0;
    var right_depth = self.right_node ? this.right_node.compute_depth() : 0;
    return (1 + Math.max(left_depth, right_depth));
};

Node.prototype.rotate = function()
{
    this.refresh_balance();
    if (Math.abs(this.balance) < 2) {
        return this;
    }

    // balance > 0  is the heavy side
    var my_heavy = (this.balance > 0)>>0;
    var child_heavy = (this[my_heavy].balance > 0) >>0;
    if ((my_heavy == child_heavy) || (this[my_heavy].balance == 0)) {
        /*
            ## Heavy sides same
            #    this     save
            #  save   -> 1   this
            # 1
            #
            ## Heavy side balanced
            #    this     save         save
            #  save   -> 1   this  -> 1  this.rot()
            #  1  2         2
        */
        return this.srotate();
    } else {
        return this.drotate();
    }
};

Node.prototype.srotate = function()
{
    /*
      """Single rotation. Assumes that balance is +-2."""
      #     this        save         save
      #   save 3  ->   1   this  -> 1   this.rot()
      #  1   2            2   3
      #
      #  this            save                save
      # 3   save  ->  this  1    -> this.rot()   1
      #    2   1     3   2
    */
    //assert(this.balance != 0)
    var heavy = (this.balance > 0)>>0;
    var light = (! heavy)>>0;

    var save = this[heavy];
    //print("srotate: bal={},{}".format(this.balance, save.balance))
    //this.print_structure()
    this[heavy] = save[light];   // 2
    //assert(save[light])
    save[light] = this.rotate();  // Needed to ensure the 2 and 3 are balanced under new subnode

    // Some intervals may overlap both this.x_center and save.x_center
    // Promote those to the new tip of the tree
    var promotees = save[light].s_center.filter(function(iv) { return save.center_hit(iv) });
    if (promotees) {
        for (var iv of promotees) {
            //console.log(iv);
            save[light] = save[light].remove(iv);  // may trigger pruning
        }

        //# TODO: Use Node.add() here, to simplify future balancing improvements.
        //# For now, this is the same as augmenting save.s_center, but that may
        //# change.
        save.s_center.update(promotees);
        save.refresh_balance();
        return save;
    }
};

Node.prototype.drotate = function()
{
    //# First rotation
    my_heavy = this.balance > 0;
    this[my_heavy] = this[my_heavy].srotate();
    this.refresh_balance();

    //# Second rotation
    result = this.srotate();

    return result;
};

Node.prototype.add = function(interval)
{
    if (this.center_hit(interval)) {
        this.s_center.add(interval);
        return this;
    } else {
        var direction = this.hit_branch(interval);
        if (! this[direction]) {
            this[direction] = from_interval(interval);
            this.refresh_balance();
            return this;
        } else {
            this[direction] = this[direction].add(interval);
            return this.rotate();
        }
    }
};

Node.prototype.remove = function(interval)
{
    //# since this is a list, called methods can set this to [1],
    //# making it true
    done = [];
    return this.remove_interval_helper(interval, done, true);
}

Node.prototype.discard = function(interval)
{
    done = [];
    return self.remove_interval_helper(interval, done, false);
}

Node.prototype.remove_interval_helper = function(interval, done, should_raise_error = false)
{
    /*
      Returns self after removing interval and balancing.
      If interval doesn't exist, raise ValueError.

      This method may set done to [1] to tell all callers that
      rebalancing has completed.

      See Eternally Confuzzled's jsw_remove_r function (lines 1-32)
      in his AVL tree article for reference.
    */
    //trace = interval.begin == 347 and interval.end == 353
    //if trace: print('\nRemoving from {} interval {}'.format(
    //   self.x_center, interval))

    if (this.center_hit(interval)) {
        //if trace: print('Hit at {}'.format(self.x_center))
        if (!should_raise_error && !self.s_center.has(interval)) {
            done.push(1);
            //#if trace: print('Doing nothing.')
            return this;
        }
        try {
            //# raises error if interval not present - this is
            //# desired.
            this.s_center.remove(interval);
        } catch(e) {
            this.print_structure();
            throw (interval);
        }

        if (this.s_center.length) {     //# keep this node
            done.push(1);    //# no rebalancing necessary
            //#if trace: print('Removed, no rebalancing.')
            return this;
        }

        //# If we reach here, no intervals are left in self.s_center.
        //# So, prune self.
        return this.prune()

    } else {  // interval not in s_center
        var direction = this.hit_branch(interval);

        if (!this[direction]) {
            if (should_raise_error) {
                throw false;
            }
            done.push(1);
            return this;
        }

        //#if trace:
        //#   print('Descending to {} branch'.format(
        //#       ['left', 'right'][direction]
        //#       ))
        this[direction] = this[direction].remove_interval_helper(interval, done, should_raise_error);

        //# Clean up
        if (done.length == 0) {
                //#if trace:
                //#    print('Rotating {}'.format(self.x_center))
                //#    self.print_structure()
            return this.rotate();
        }
        return this;
    }
}

Node.prototype.search_overlap = function(point_list)
{
    result = Set();
    for (var _j in point_list) {
        var j = point_list[_j];
        this.search_point(j, result);
    }
    return result;
};

Node.prototype.search_point = function(point, result)
{
    for (k of this.s_center.a) {
        if (k.begin <= point && point < k.end) {
            result.add(k);
        }
    }
    if ((point < this.x_center) && this[0]) {
        return this[0].search_point(point, result);
    } else if ((point > this.x_center) && this[1]) {
        return this[1].search_point(point, result);
    }
    return result;
};

Node.prototype.prune = function()
{
    if ( (! this[0]) ||  !( this[1]) ) {    // if I have an empty branch
        var direction = (!this[0])>>0;       // graft the other branch here
        //if trace:
        //    print('Grafting {} branch'.format(
        //       'right' if direction else 'left'))

        var result = this[direction];
        //if result: result.verify()
        return result;
    } else {
        var heir;
        // Replace the root node with the greatest predecessor.
        [heir, this[0]] = this[0].pop_greatest_child();
        //if trace:
        //    print('Replacing {} with {}.'.format(
        //        this.x_center, heir.x_center
        //        ))
        //    print('Removed greatest predecessor:')
        //    this.print_structure()

        //if this[0]: this[0].verify()
        //if this[1]: this[1].verify()

        // Set up the heir as the new root node
        [heir[0], heir[1]] = [this[0], this[1]];

        //if trace: print('Setting up the heir:')
        //if trace: heir.print_structure()

        // popping the predecessor may have unbalanced this node;
        // fix it
        heir.refresh_balance();
        heir = heir.rotate();
        //heir.verify()
        //if trace: print('Rotated the heir:')
        //if trace: heir.print_structure()
        return heir;
    }
};

Node.prototype.pop_greatest_child = function()
{

    //print('Popping from {}'.format(this.x_center))
    if (! this.right_node) {         // This node is the greatest child.
        // To reduce the chances of an overlap with a parent, return
        // a child node containing the smallest possible number of
        // intervals, as close as possible to the maximum bound.
        var ivs = [...this.s_center.a].sort(function(a,b) { return ((a.end == b.end) ? (a.begin-b.begin) : (a.end-b.end)); } );
        //    sorted(this.s_center, key=attrgetter('end', 'begin'))
        var max_iv = ivs.pop();
        var new_x_center = this.x_center;
        while (ivs.length) {
            var next_max_iv = ivs.pop();
            if (next_max_iv.end == max_iv.end) {
                continue;
            }
            new_x_center = Math.max(new_x_center, next_max_iv.end);
        }
        /*
        function get_new_s_center() {
            for (iv in this.s_center) {
                if iv.contains_point(new_x_center): yield iv
            }
        }*/

        // Create a new node with the largest x_center possible.
        var a = Set();
        for (var iv of this.s_center.a) {
            if (iv.contains_point(new_x_center)) {
                a.add(iv);
            }
        }
        var child = new Node(new_x_center, a);
        this.s_center.remove_set(child.s_center);

        //print('Pop hit! Returning child   = {}'.format(
        //    child.print_structure(tostring=True)
        //    ))
        //assert not child[0]
        //assert not child[1]

        if (this.s_center) {
            //print('     and returning newnode = {}'.format( this ))
            //this.verify()
            return [child, this];
        } else {
            //print('     and returning newnode = {}'.format( this[0] ))
            //if this[0]: this[0].verify()
            return [child, this[0]];  // Rotate left child up
        }
    } else {
        var greatest_child;
        //print('Pop descent to {}'.format(this[1].x_center))
        [greatest_child, this[1]] = this[1].pop_greatest_child();

        // Move any overlaps into greatest_child
        for (var iv of Set(this.s_center).a) {
            if (iv.contains_point(greatest_child.x_center)) {
                this.s_center.remove(iv);
                greatest_child.add(iv);
            }
        }

        //print('Pop Returning child   = {}'.format(
        //    greatest_child.print_structure(tostring=True)
        //    ))
        var new_this;
        if (this.s_center.length) {
            //print('and returning newnode = {}'.format(
            //    new_this.print_structure(tostring=True)
            //    ))
            //new_this.verify()
            this.refresh_balance();
            new_this = this.rotate();
            return [greatest_child, new_this];
        } else {
            new_this = this.prune();
            //print('and returning prune = {}'.format(
            //    new_this.print_structure(tostring=True)
            //    ))
            //if new_this: new_this.verify()
            return [greatest_child, new_this];
        }
    }
};

Node.prototype.contains_point = function(p)
{
    for (var iv of this.s_center.a) {
        if (iv.contains_point(p)) {
            return True;
        }
    }
    var branch = this[(p > this.x_center)>>0];
    return (branch && branch.contains_point(p));
};

Node.prototype.all_children = function()
{
    return this.all_children_helper(Set());
};

Node.prototype.all_children_helper = function(result)
{
    result.update(this.s_center);
    if (this[0]) {
        this[0].all_children_helper(result);
    }
    if (this[1]) {
        this[1].all_children_helper(result);
    }
    return result;
};

function assert(condition, message)
{
    if (!condition) {
        throw message || "Assertion failed";
    }
}

Node.prototype.verify = function(parents=set())
{
    assert(this.s_center instanceof aset);

    var bal = this.balance;
    assert (Math.abs(bal) < 2,  "Error: Rotation should have happened, but didn't! \n" + this.print_structure(tostring=True) );
    this.refresh_balance();
    assert (bal == this.balance,"Error: this.balance not set correctly! \n" + this.print_structure(tostring=True));
    assert (this.s_center, "Error: s_center is empty! \n " + this.print_structure(tostring=True));

    var _iv;
    for (_iv in this.s_center) {
        var iv = this.s_center[_iv];
        assert (hasattr(iv, 'begin'));
        assert (hasattr(iv, 'end'));
        assert (iv.begin < iv.end);
        assert (iv.overlaps(this.x_center));
        var _p = [...parents].sort();
        for (var _parent in _p) {
            var parent = _p[_parent];
            assert(! iv.contains_point(parent), "Error: Overlaps ancestor ("+parent+")! \n"+iv+"\n\n" + this.print_structure(tostring=True))
        }
    }
    if (this[0]) {
        assert (this[0].x_center < this.x_center, "Error: Out-of-order left child! "+this.x_center);
        this[0].verify(parents.union([this.x_center]));
    }
    if (this[1]) {
        assert (this[1].x_center > this.x_center, "Error: Out-of-order right child! "+this.x_center);
        this[1].verify(parents.union([this.x_center]));
    }
};

Node.prototype.count_nodes = function()
{
    count = 1;
    if (this.left_node) {
        count += this.left_node.count_nodes();
    }
    if (this.right_node) {
        count += this.right_node.count_nodes();
    }
    return count;
};

Node.prototype.depth_score = function(n, m)
{
    if (n == 0) {
        return 0.0;
    }
    // dopt is the optimal maximum depth of the tree
    var dopt = 1 + ((Math.floor(l2(m)))>>0);
    var f = 1 / (1 + n - dopt);
    return f * this.depth_score_helper(1, dopt);
};

Node.prototype.depth_score_helper = function(d, dopt)
{
    // di is how may levels deeper than optimal d is
    var di = d - dopt;
    var count = 0;
    if (di > 0) {
        count = di * this.s_center.length;
    } else {
        count = 0;
    }
    if (this.right_node) {
        count += this.right_node.depth_score_helper(d + 1, dopt);
    }
    if (this.left_node) {
        count += this.left_node.depth_score_helper(d + 1, dopt);
    }
    return count;
};

Node.prototype.str = function()
{
    return "Node<" + this.x_center + ",depth=" + this.depth + ", balance=" + this.balance + ">";
}

Node.prototype.print_structure = function(indent=0, tostring=false)
{
    var nl = '\n';
    var sp = '';
    for (var i = 0; i < indent; i ++)
        sp += '    ';
    var rlist = [this.str() + nl];
    if (this.s_center.length) {
        var a = [...this.s_center.a].sort(interval_cmp);
        for (iv of a) {
            rlist.push(sp + ' ' + iv.str() + nl);
        }
    }
    if (this.left_node) {
        rlist.push(sp + '<:  ');  // no CR
        rlist.push(this.left_node.print_structure(indent + 1, true));
    }
    if (this.right_node) {
        rlist.push(sp + '>:  ');  // no CR
        rlist.push(this.right_node.print_structure(indent + 1, true));
    }
    var result = rlist.join('');
    if (tostring) {
        return result;
    } else {
        console.log(result);
    }
};

function from_interval(interval)
{
    var center = interval.begin;
    return new Node(center, [interval]);
}

function from_intervals(intervals)
{
    if (!intervals || !intervals.length) {
        return undefined;
    }
    var node = new Node();
    intervals.sort(interval_cmp);
    node = node.init_from_sorted(intervals);
    return node;
}

exports.from_intervals = from_intervals;
exports.from_interval  = from_interval;
