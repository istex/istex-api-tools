#!/usr/bin/env node

'use strict'

const fs = require('fs'),
      input = process.argv[2] || false

var completeElements = function(file){
  // pour chaque corpus
  file.aggregations.corpusName.buckets.forEach(function (element,index,array) {
    // Pour chaque titre
    element.title.buckets.forEach(function(element,index,array) {
      // Pour chaque issn si c'est un array
      if(element.issn.buckets.length > 0){
        element.issn.buckets.forEach(function (element,index,array) {
          if(!element.key){
            element.key = " ";
          }
          // S'il y a des isbn
          if(element.isbn.buckets.length <= 0){    
            element.isbn.buckets.push({ key : ""});
          }
          // S'il y a des eissn
          if(element.eissn.buckets.length <= 0){    
            element.eissn.buckets.push({ key : ""});
          }
        });
      }
    });
  });
  return file;
};

if (input) {
  fs.stat(input, (error, stats) => {
    if (error) {
      console.error(error)
      return
    } else {
      const file = JSON.parse(fs.readFileSync(input, "utf-8"));
      var modifiedFile = completeElements(file);
      fs.writeFileSync(process.argv[3], JSON.stringify(modifiedFile, null, 2));
    }
  })
}
