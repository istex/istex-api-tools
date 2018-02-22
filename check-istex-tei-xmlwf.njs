#!/usr/bin/env node

/**
 * Script calculant le % par corpus de TEI syntaxiquement valide au sens XML
 * Ceci permet de mieux cibler les réingestions à réaliser lorsque l'on introduit
 * un bug qui rend les XML invalides. Ex: namespace vide, body inséré brutalement 
 * sans échapements etc ...
 * Exemple d'appel :
 * CORPUS="wiley" JWT="....." ./check-istex-tei-xmlwf.njs
 */

var request = require('request');
var async = require('async');
var child_process = require('child_process');

// JWT token taken from https://api.istex.fr/token/
var JWT = process.env.JWT || '';
var CORPUS = process.env.CORPUS || 'wiley';
var NB_TO_SAMPLE = process.env.NB_TO_SAMPLE || 500;
var DEBUG = process.env.DEBUG || 0;

module.exports = function(options, cb) {

  options = options || {
    stdout: true,
    fileout: false
  };

  var teiCounters = {
    nbTeiAnalyzed: 0,
    corpus: {}
  };
  var teiCounterForOneCorpus = {
    nbTeiAnalyzed: 0,
    nbWfTei: 0,
    percentWfTei: 100
  }
  
  var istexApiRequest = 'https://api.istex.fr/document/?q=corpusName:' + CORPUS + '&output=corpusName,fulltext&size=' + NB_TO_SAMPLE + '&rankBy=random&sid=istex-api-tools';
  console.log('start', istexApiRequest);
  request(istexApiRequest, function (err, response, body) {
    if (err) return console.error(err);
    body = JSON.parse(body);

    //console.log(body)
    async.mapLimit(body.hits, 1 /* nb req */, function (hit, cb) {
      DEBUG && console.log('Handle: ' + hit.id);
      let teiUrl = '';
      hit.fulltext.forEach(function (item) {
        if (item.extension == 'tei') {
          teiUrl = item.uri;
        }
      });
      if (teiUrl) {
        request({
          url: teiUrl,
          followRedirect: false,
          headers: {
            Authorization: 'Bearer ' + JWT
          }
        }, function (err, response, teiBody) {
          if (err) return cb(err);
          if (response.statusCode == 404) {
            return cb(null);
          } else if (response.statusCode != 200) {
            return cb(new Error('Bad statusCode ' + response.statusCode + ' for TEI ' + teiUrl));
          }

          DEBUG && console.log(teiUrl, hit.corpusName, response.statusCode);
          teiCounters.corpus[hit.corpusName] = teiCounters.corpus[hit.corpusName] || JSON.parse(JSON.stringify(teiCounterForOneCorpus));
          var cmdResponse = child_process.execSync('xmlwf -n', { input: teiBody });
          if (cmdResponse == '') {
            DEBUG && console.log('no error');
            teiCounters.corpus[hit.corpusName].nbWfTei++;
          } else {
            DEBUG && console.log('error ' + cmdResponse);
          }
          teiCounters.corpus[hit.corpusName].nbTeiAnalyzed++;
          teiCounters.corpus[hit.corpusName].percentWfTei =
            Math.round(teiCounters.corpus[hit.corpusName].nbWfTei / teiCounters.corpus[hit.corpusName].nbTeiAnalyzed * 100);
          teiCounters.nbTeiAnalyzed++;
          DEBUG && console.log(teiCounters)
          return cb(null);
        });
      } else {
        console.log('Skip this TEI: ' + hit.id);
        cb(null);
      }
    }, function (err) {
      if (err) {
      console.log('Err terminés.');
        console.error(err);
        cb && cb(err);
      }
      console.log('Traitements terminés pour ' + CORPUS + ' :', JSON.stringify(teiCounters));
      cb && cb();    
    });


  });




}

if (!module.parent) {
  module.exports();
}
