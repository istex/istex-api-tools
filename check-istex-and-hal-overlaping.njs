#!/usr/bin/env node

/**
 * Script calculant le taux de recouvrement ISTEX et HAL
 * en se basant sur l'API de HAL
 */

var request = require('request');
var async = require('async');

module.exports = function(options, cb) {

  options = options || {
    stdout: true,
    fileout: false
  };


  var oaCounter = {
    perCentIstexHal: 0,
    nbDocAnalyzed: 0,
    found_hal: 0,
  }

  request('https://api.istex.fr/document/?q=*&output=doi&size=5000&rankBy=random&sid=istex-api-tools', function (error, response, body) {
    body = JSON.parse(body);
    

    async.mapLimit(body.hits, 50, function (hit, cb) {
      
      var doi = hit.doi && hit.doi.length ? hit.doi[0] : '';
      if (doi) {
        request('https://api.archives-ouvertes.fr/search/?q=*:*&wt=json&fq=doiId_s:%22' + encodeURIComponent(doi) + '%22&fl=doiId_s', function (err, response, halBody) {
          if (err) return cb(err);
          halBody = JSON.parse(halBody);
          var foundInHal = halBody && halBody.response && halBody.response.numFound && halBody.response.numFound > 0;
          if (!(halBody && halBody.response)) {
            console.error(halBody);
          }

          oaCounter.nbDocAnalyzed++;
          oaCounter.found_hal += foundInHal ? 1 : 0;
          oaCounter.perCentIstexHal = Math.round(oaCounter.found_hal / oaCounter.nbDocAnalyzed * 100);

          console.log(JSON.stringify(oaCounter) + ' <- ' + doi);
          cb(null);
        });
      } else {
        oaCounter.nbDocAnalyzed++;
        console.error('Skipping, DOI not existing in ISTEX for ' + hit.id);
        cb(null);
      }

    }, function (err) {
      if (err) {
      console.log('Err terminés.');
        console.error(err);
        cb && cb(err);
      }
      console.log('Traitements terminés.');
      cb && cb();    
    });


  });




}

if (!module.parent) {
  module.exports();
}
