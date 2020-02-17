/* eslint-disable no-useless-escape */
/* eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0 */
'use strict'
var express = require('express')
var stringifyObj = require('stringify-object')
var hdbext = require('@sap/hdbext')
var async = require('async')

module.exports = function () {
  var app = express.Router()

  app.get('/GetUserInfo', function (req, res) {
    var outData = {
      firstname: req.authInfo.userInfo.givenName,
      lastname: req.authInfo.userInfo.familyName,
      userId: req.user.id,
      isSupplier: false,
      isBuyer: false
    }

    if (req.authInfo.scopes !== null && req.authInfo.scopes !== undefined && req.authInfo.scopes !== '') {
      req.authInfo.scopes.forEach(element => {
        if (element.includes('Z_RL_SUPPLIER')) {
          outData.isBuyer = true
        }
        if (element.includes('Z_RL_BUYER')) {
          outData.isSupplier = true
        }
      })
    }

    return res.status(200).send(outData)
  })

  // GET PRUCHASE ORGANIZATIONS

  app.get('/GetPurchaseOrganizations', function (req, res) {
    hdbext.createConnection(req.tenantContainer, (err, client) => {
      if (err) {
        return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
      } else {
        hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::GetPurchaseOrganizations', function (_err, sp) {
          sp(req.user.id, (err, parameters, results) => {
            if (err) {
              return res.status(500).send(stringifyObj(err))
            } else {
              // reqStr = stringifyObj(results);
              // var outJson = {"results":reqStr};
              var outArr = []
              results.forEach(element => {
                outArr.push(element)
              })

              return res.status(200).send({
                results: outArr
              })
            }
          })
        })
      }
    })
  })

  // GET USER BU

  app.get('/GetUserBU', function (req, res) {
    hdbext.createConnection(req.tenantContainer, (err, client) => {
      if (err) {
        return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
      } else {
        hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::GetUserBU', function (_err, sp) {
          sp(req.user.id, (err, parameters, results) => {
            if (err) {
              return res.status(500).send(stringifyObj(err))
            } else {
              var outArr = []
              results.forEach(element => {
                outArr.push(element)
              })

              return res.status(200).send({
                results: outArr
              })
            }
          })
        })
      }
    })
  })

  // GET CORRECT SYSID

  app.get('/GetSYSID', function (req, res) {
    const sql = 'SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_BCKND_SYSTEMS\"'

    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error(error)
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
          if (err) {
            return console.error('Done error', err)
          }
        })
      }
    })
  })

  // GET LIST OF METASUPPLIER by userId

  app.get('/GetMetasupplierList', function (req, res) {
    hdbext.createConnection(req.tenantContainer, (err, client) => {
      if (err) {
        return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
      } else {
        hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::GetMetasupplierList', function (_err, sp) {
          sp(req.user.id, (err, parameters, results) => {
            if (err) {
              return res.status(500).send(stringifyObj(err))
            } else {
              var outArr = []
              results.forEach(element => {
                outArr.push(element)
              })
              return res.status(200).send({
                results: outArr
              })
            }
          })
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
