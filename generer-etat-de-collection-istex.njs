#!/usr/bin/env node

var request = require('request');
var oboe    = require('oboe');
var CSV     = require('csv-string');
var fs      = require('fs');

var csvLine = null;
var csvData = [ ['corpus', 'title', 'issn', 'eissn' ] ];

// TODO: adjust the API request
var apiRes = request('https://api.istex.fr/document/?q=*&facet=publicationDate[perYear]&size=0');

oboe(apiRes)
   .node('*', function (data) {
      csvLine = [ 'thecorpus', 'The title', 'AAAA-BBBB', 'XXXX-YYYY' ];
      csvData.push(csvLine);
   })
   .done(function () {
      // write the final data as CSV to stdout
      // Output example:
      //   TODO
      var output = CSV.stringify(csvData);
      process.stdout.write(output);
      fs.writeFile('etat-de-collection-istex.csv', output, 'utf8');
   });