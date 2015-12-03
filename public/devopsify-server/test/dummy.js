/*global require, describe, it */
var expect = require('expect.js');

describe("Addition", function () {
    'use strict';
    describe("adding two numbers", function () {
        // verify that the getFlickrJSON method exists
        it("should return 7 when adding 3 + 4", function () {
            expect(3 + 4).to.be.eql(7);
        });
        it("should as well return 7 when adding 4 + 3", function () {
            expect(4 + 3).to.be.eql(7);
        });

    });
});