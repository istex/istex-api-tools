#!/usr/bin/env node

var request = require('request');
var oboe    = require('oboe');
var JBJ     = require('jbj');
var CSV     = require('csv-string');

var apiRes = request('https://api.istex.fr/document/?q=*&facet=publicationDate[perYear]&size=0');

oboe(apiRes)
   .node('aggregations.publicationDate.buckets.*', function (data) {
      console.log(data);
      console.log(JBJ.renderSync({
        "$year": {
          "get" : "keyAsString",
          "cast": "number"
        },
        "$nbDocument": {
          "get" : "docCount",
        },
      }, data));
   })
   .done(function(things){

      //console.log(things); 
   });