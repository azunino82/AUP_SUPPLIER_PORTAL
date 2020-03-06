/* eslint-disable no-useless-escape */
/* eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0 */
'use strict'
var express = require('express')
var stringifyObj = require('stringify-object')
var hdbext = require('@sap/hdbext')
var async = require('async')

module.exports = function () {
  var app = express.Router()

 
 // GET CORRECT SYSID

 app.get('/GetVariants', function (req, res) {
    const sql = 'SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_BCKND_SYSTEMS\"'

    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_BCKND_SYSTEMS :' + stringifyObj(error))
        return res.status(500).send('GetUserBU CONNECTION ERROR: ' + stringifyObj(error))
      }
      if (client) {
        async.waterfall([

          function prepare (callback) {
            client.prepare(sql,
              function (err, statement) {
                callback(null, err, statement)
              })
          },

          function execute (_err, statement, callback) {
            statement.exec([], function (execErr, results) {
              callback(null, execErr, results)
            })
          },

          function response (err, results, callback) {
            if (err) {
              res.type('application/json').status(500).send({ ERROR: err })
              return
            } else {
              res.type('application/json').status(200).send({ results: results })
            }
            callback()
          }
        ], function done (err, parameters, rows) {
          console.log('---->>> CLIENT END T_BCKND_SYSTEMS <<<<<-----')
          client.close()
          if (err) {
            return console.error('Done error', err)
          }
        })
      }
    })
  })



  // Parse URL-encoded bodies (as sent by HTML forms)
  // app.use(express.urlencoded());

  // Parse JSON bodies (as sent by API clients)
  app.use(express.json())

  app.post('/', function (req, res) {
    return res.status(200).send({ POST: true })
  })

  return app
}
