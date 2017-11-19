#!/usr/bin/env node

/**
 * Script calculant le croisement des revues présentes dans ISTEX
 * et celles présentes dans l'API de crossref.
 * Ceci permet de mesurer la pertinance d'avoir ou pas des enrichissement
 * en passant par cette API (ex: les catégories ASJC)
 *   cf http://api.crossref.org/journals/1047-7047
 *   cf https://github.com/plreyes/Scopus
 */

var request = require('request');
var async = require('async');

module.exports = function(options, cb) {

  options = options || {
    stdout: true,
    fileout: false
  };


  var issnCounter = {
    nbDocAnalyzed: 0,
    nbDocWithoutISSN: 0,
    found_issn: 0,
    not_found_issn: 0,
    empty_subject: 0,
    more_than_0_subject: 0,
    more_than_1_subject: 0,
    more_than_2_subject: 0,
    more_than_3_subject: 0,
    subject_0_with_asjc: 0,
    more_issn_found_in_crossref: 0,
  }
  
  var istexApiRequest = 'https://api.istex.fr/document/?q=*&output=host&size=5000&rankBy=random&sid=istex-api-tools';
  console.log('start', istexApiRequest);
  request(istexApiRequest, function (err, response, body) {
    if (err) return console.error(err);
    body = JSON.parse(body);

    //console.log(body)
    async.mapLimit(body.hits, 1 /*nb req // */, function (hit, cb) {
      var issn = hit.host.issn ? hit.host.issn[0] : '';
      if (!issn) issn = hit.host.eissn ? hit.host.eissn[0] : '';
      if (issn) {
        request('http://api.crossref.org/journals/' + issn, function (err, response, issnBody) {
          if (err) return cb(err);
          try {
            issnBody = JSON.parse(issnBody);
            issnCounter.found_issn++;
            
            // search if crossref has more issn than into istex
            if (issnBody.message.ISSN && issnBody.message.ISSN[0]) {
              //console.log(issnBody.message.ISSN[0], )
              if (issnBody.message.ISSN[0] !== hit.host.issn[0] && issnBody.message.ISSN[0] !== hit.host.eissn[0]) {
                issnCounter.more_issn_found_in_crossref++;
              }
            }
            if (issnBody.message.ISSN && issnBody.message.ISSN[1]) {
              if (issnBody.message.ISSN[1] !== hit.host.issn[0] && issnBody.message.ISSN[1] !== hit.host.eissn[0]) {
                issnCounter.more_issn_found_in_crossref++;
              }
            }
            
            if (!issnBody.message.subjects || issnBody.message.subjects.length === 0) {
              issnCounter.empty_subject++;
            } else {
              if (issnBody.message.subjects.length > 0) {
                issnCounter.more_than_0_subject++;
                //console.log(issnBody.message.subjects[0], issnBody.message.subjects[0].ASJC);
                if (issnBody.message.subjects[0].ASJC > 0) {
                  issnCounter.subject_0_with_asjc++;
                }
              } 
              if (issnBody.message.subjects.length > 1) {
                issnCounter.more_than_1_subject++;
              } 
              if (issnBody.message.subjects.length > 2) {
                issnCounter.more_than_2_subject++;
              } 
              if (issnBody.message.subjects.length > 3) {
                issnCounter.more_than_3_subject++;
              } 
            }
            //console.log(issnBody)
            //console.log('ISSN found: ' + issn);
          } catch (err) {
            issnCounter.not_found_issn++;
            //console.log('ISSN not found: ' + issn, issnBody);
          }
          issnCounter.nbDocAnalyzed++;
          cb(null);
        });
      } else {
        issnCounter.nbDocWithoutISSN++;
        issnCounter.nbDocAnalyzed++;
        //console.error('Skipping, ISSN not existing in ISTEX for ' + hit.id);
        cb(null);
      }
      console.log(JSON.stringify(issnCounter));
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
