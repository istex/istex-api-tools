/*jshint node:true,laxcomma:true*/
/* global describe, it */
'use strict';
var assert = require('chai').assert;
var gnpai  = require('../generer-nbdocument-par-annee-istex.njs');

describe('Le CSV du nombre documents par années de publication', function () {

  it('est bien un CSV', function (next) {
    gnpai({ stdout: false, fileout: false }, function (csv) {
      var lines = csv.split("\r\n");
      var firstLine = lines[0];
      assert.equal(firstLine, 'year,nbDocument');
      var secondLine = lines[1].split(',');
      assert.equal(secondLine.length, 2);
      next();
    });
  });

});