#!/usr/bin/env node

//
// Generates a CSV file
// containing number of document for 
// each document publication year
// 

var request = require('request');
var oboe    = require('oboe');
var CSV     = require('csv-string');
var fs      = require('fs');

var csvLine = null;
var csvData = [ ['Année', 'Nombre de document' ] ];

// Get data from the ISTEX API.
// Result example:
// {
//   "total": 16728882,
//   "hits": [],
//   "aggregations": {
//     "publicationDate": {
//       "buckets": [
//         {
//           "keyAsString": "0000",
//           "key": -62167219200000,
//           "docCount": 1
//         },
//         {
//           "keyAsString": "0016",
//           "key": -61662297600000,
//           "docCount": 3
//         },
var apiRes = request('https://api.istex.fr/document/?q=*&facet=publicationDate[perYear]&size=0');

// split each JSON "buckets" items one by one
oboe(apiRes)
   .node('aggregations.publicationDate.buckets.*', function (data) {
      csvLine = [ data.keyAsString, data.docCount ];
      csvData.push(csvLine);
   })
   .done(function () {
      // write the final data as CSV to stdout
      // Output example:
      //   year,nbDocument
      //   0000,2
      //   0016,3
      //   0168,1
      //   0209,6
      //   1000,39
      //   1019,4
      var output = CSV.stringify(csvData);
      process.stdout.write(output);
      fs.writeFile('nbdocument-per-year-istex.csv', output, 'utf8');
   });