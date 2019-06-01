var assert = require('assert');
var mocha = require('mocha');
var chai = require('chai');
var expect = chai.expect;
var intervaltree = require("intervaltree.js");

describe('intervaltree', function () {
    describe('insertions', function () {
	it('Overlap', function () {
            var v = intervaltree.IntervalTree([]);
            for (var i = 0; i < 1000; i += 5) {
                var i0 = intervaltree.Interval(i-1,i+5+1);
                v.add();
            }
            for (var i = 5; i < (1000-5); i += 5) {
                var i0 = intervaltree.Interval(i-5-1,i+1)
                var i1 = intervaltree.Interval(i-1,i+5+1)
                var a = v.at(i);
                //Set(i0,i1).equal(Set(a));
            }
	});
    });
});
