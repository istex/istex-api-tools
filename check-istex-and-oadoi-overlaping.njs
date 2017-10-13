#!/usr/bin/env node

/**
 * Script calculant le taux d'OpenAccess dans ISTEX
 * en se basant sur l'API de oaDOI
 *   cf https://oadoi.org/api
 *   cf http://carnetist.hypotheses.org/835
 */

var request = require('request');
var async = require('async');

module.exports = function(options, cb) {

  options = options || {
    stdout: true,
    fileout: false
  };


  var oaCounter = {
    perCentISTEXOA: 0,
    nbDocAnalyzed: 0,
    found_green: 0,
    found_hybrid: 0,
    is_free_to_read: 0,
    is_boai_license: 0,
    is_subscription_journal: 0,
  }

  request('https://api.istex.fr/document/?q=*&output=doi&size=5000&rankBy=random&sid=istex-api-tools', function (error, response, body) {
    body = JSON.parse(body);
    

    async.mapLimit(body.hits, 50, function (hit, cb) {
      
      var doi = hit.doi && hit.doi.length ? hit.doi[0] : '';
      if (doi) {
        request('https://api.oadoi.org/' + encodeURIComponent(doi) + '?email=api-users@listes.istex.fr', function (err, response, oadoiBody) {
          if (err) return cb(err);
          oadoiBody = JSON.parse(oadoiBody);
          oadoiBody = oadoiBody.results && oadoiBody.results.length ? oadoiBody.results[0] : {};
          
          oaCounter.nbDocAnalyzed++;
          oaCounter.found_green             += oadoiBody.found_green ? 1 : 0;
          oaCounter.found_hybrid            += oadoiBody.found_hybrid ? 1 : 0;
          oaCounter.is_free_to_read         += oadoiBody.is_free_to_read ? 1 : 0;
          oaCounter.is_boai_license         += oadoiBody.is_boai_license ? 1 : 0;
          oaCounter.is_subscription_journal += oadoiBody.is_subscription_journal ? 1 : 0;
          oaCounter.perCentISTEXOA = Math.round((oaCounter.found_green + oaCounter.is_free_to_read)/ oaCounter.nbDocAnalyzed * 100);

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
