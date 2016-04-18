#!/usr/bin/env node

'use strict'

const _ = require('lodash'),
      fs = require('fs'),
      input = process.argv[2] || false

let dataToCsv = (target) => {
  let output = [],
      csv = '',
      delimeter = ',',
      newValue = ''

  let traverseAndFlat = (obj, pre) => {
    _.forEach(obj, (value, index, array) => {
      // Extraction des données
      if (_.has(value, 'key')) {
        newValue = pre ? pre + delimeter + "\"" + value['key'] + "\""  : "\"" + value['key'] + "\""
        if (output.indexOf(pre) !== -1) {
          output.splice(output.indexOf(pre), 1)
        }
        output.push(newValue)
      }
      if ((_.isArray(value) || _.isObject(value)) && value.length !== 0) {
        traverseAndFlat(value, newValue)
      }
    })
  }
  traverseAndFlat(target)
  _.forEach(output, (value) => {
    csv += value + "\n"
  })
  return csv
}

if (input) {
  fs.stat(input, (error, stats) => {
    if (error) {
      console.log(error)
      return
    } else {
      const file = JSON.parse(fs.readFileSync(input, "utf-8"))
      process.stdout.write(dataToCsv(file))
    }
  })
}
