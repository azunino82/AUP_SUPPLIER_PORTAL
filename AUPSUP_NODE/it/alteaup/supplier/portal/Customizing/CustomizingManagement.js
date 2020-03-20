/* eslint-disable no-useless-escape */
/* eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0 */
'use strict'
var express = require('express')
var stringifyObj = require('stringify-object')
var hdbext = require('@sap/hdbext')
var async = require('async')

module.exports = function () {
  var app = express.Router()

  app.get('/GetTableData', function (req, res) {
    var tabella = req.query.I_TABLE !== undefined && req.query.I_TABLE !== null && req.query.I_TABLE !== '' ? req.query.I_TABLE : ''
    if (tabella === '') {
      return res.status(500).send('I_TABLE Mandatory')
    }
    const sql = 'SELECT * FROM \"AUPSUP_DATABASE.data.tables::' + tabella + '\"'

    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR :' + stringifyObj(error))
        return res.status(500).send('GetTableData CONNECTION ERROR: ' + stringifyObj(error))
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
          console.log('---->>> CLIENT END T_AVVISI_QUALITA <<<<<-----')
          client.close()
          if (err) {
            return console.error('Done error', err)
          }
        })
      }
    })
  })

  app.post('/SaveTBuyers', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_BUYERS\" VALUES (\'' + body.USERID + '\',\'' + body.BU + '\',\'' + body.SYSID + '\',\'' + body.PURCH_ORG + '\',\'' + body.PLANTS + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_BUYERS :' + stringifyObj(error))
        return res.status(500).send('T_BUYERS CONNECTION ERROR: ' + stringifyObj(error))
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
              res.type('application/json').status(200).send({ results: 'OK' })
            }
            callback()
          }
        ], function done (err, parameters, rows) {
          console.log('---->>> CLIENT END T_BUYERS <<<<<-----')
          client.close()
          if (err) {
            return console.error('Done error', err)
          }
        })
      }
    })
  })

  app.post('/SaveTUserIdMetaId', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_USERID_METAID\" VALUES (\'' + body.USERID + '\',\'' + body.METAID + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_USERID_METAID :' + stringifyObj(error))
        return res.status(500).send('T_USERID_METAID CONNECTION ERROR: ' + stringifyObj(error))
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
              res.type('application/json').status(200).send({ results: 'OK' })
            }
            callback()
          }
        ], function done (err, parameters, rows) {
          console.log('---->>> CLIENT END T_BUYERS <<<<<-----')
          client.close()
          if (err) {
            return console.error('Done error', err)
          }
        })
      }
    })
  })

  app.post('/SaveTMetaIdForn', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_METAID_FORN\" VALUES (\'' + body.METAID + '\',\'' + body.LIFNR + '\',\'' + body.SYSID + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_METAID_FORN :' + stringifyObj(error))
        return res.status(500).send('T_METAID_FORN CONNECTION ERROR: ' + stringifyObj(error))
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
              res.type('application/json').status(200).send({ results: 'OK' })
            }
            callback()
          }
        ], function done (err, parameters, rows) {
          console.log('---->>> CLIENT END T_BUYERS <<<<<-----')
          client.close()
          if (err) {
            return console.error('Done error', err)
          }
        })
      }
    })
  })

  app.post('/SaveTBuPlant', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_BU_PLANT\" VALUES (\'' + body.BU + '\',\'' + body.SYSID + '\',\'' + body.PLANT + '\',\'' + body.PLANT_DESCR + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_BU_PLANT :' + stringifyObj(error))
        return res.status(500).send('T_BU_PLANT CONNECTION ERROR: ' + stringifyObj(error))
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
              res.type('application/json').status(200).send({ results: 'OK' })
            }
            callback()
          }
        ], function done (err, parameters, rows) {
          console.log('---->>> CLIENT END T_BUYERS <<<<<-----')
          client.close()
          if (err) {
            return console.error('Done error', err)
          }
        })
      }
    })
  })

  app.post('/SaveTBuPurchOrg', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_BU_PURCH_ORG\" VALUES (\'' + body.BU + '\',\'' + body.SYSID + '\',\'' + body.PURCH_ORG + '\',\'' + body.PURCH_DESCR + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_BU_PURCH_ORG :' + stringifyObj(error))
        return res.status(500).send('T_BU_PURCH_ORG CONNECTION ERROR: ' + stringifyObj(error))
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
              res.type('application/json').status(200).send({ results: 'OK' })
            }
            callback()
          }
        ], function done (err, parameters, rows) {
          console.log('---->>> CLIENT END T_BUYERS <<<<<-----')
          client.close()
          if (err) {
            return console.error('Done error', err)
          }
        })
      }
    })
  })

  app.post('/SaveTProfiliConferma', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_PROFILI_CONFERMA\" VALUES (\'' + body.SYSID + '\',\'' + body.PROFILO_CONTROLLO + '\',\'' + body.CAT_CONFERMA + '\',\'' + body.DESCRIZIONE + '\',\'' + body.OWNER + '\',\'' + body.TIPO_CONFERMA + '\',\'' + body.MODIFICA_PREZZO + '\',\'' + body.PERC_INFERIORE + '\',\'' + body.PERC_SUPERIORE + '\',\'' + body.PARZIALE_QUANTITA + '\',\'' + body.PERC_INFERIORE_QUANT + '\',\'' + body.PERC_SUPERIORE_QUANT + '\',\'' + body.MODIFICA_QUANTITA + '\',\'' + body.TIPO_COND_PREZZO + '\',\'' + body.TIPO_CONSEGNA_INB + '\',\'' + body.LOTTO_FORNITORE_INB + '\',\'' + body.DATA_SCADENZA_INB + '\',\'' + body.DATA_PRODUZIONE_INB + '\',\'' + body.NUMERO_SERIALE_INB + '\',\'' + body.CONFERMA_MANDATORY + '\',\'' + body.CONTROLLO_CORSO_APP + '\',\'' + body.ZAPPPERSUP + '\',\'' + body.ZAPPPERINF + '\',\'' + body.ZAPPGGSUP + '\',\'' + body.ZAPPGGINF + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_PROFILI_CONFERMA :' + stringifyObj(error))
        return res.status(500).send('T_PROFILI_CONFERMA CONNECTION ERROR: ' + stringifyObj(error))
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
              res.type('application/json').status(200).send({ results: 'OK' })
            }
            callback()
          }
        ], function done (err, parameters, rows) {
          console.log('---->>> CLIENT END T_BUYERS <<<<<-----')
          client.close()
          if (err) {
            return console.error('Done error', err)
          }
        })
      }
    })
  })

  app.delete('/TBuyers', function (req, res) {
    var userid = req.query.I_USERID !== undefined && req.query.I_USERID !== null && req.query.I_USERID !== '' ? req.query.I_USERID : ''
    var BU = req.query.I_BU !== undefined && req.query.I_BU !== null && req.query.I_BU !== '' ? req.query.I_BU : ''
    if (userid === '' || BU === '') {
      return res.status(500).send('I_USERID and I_BU are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_BUYERS\" WHERE USERID=\'' + userid + '\' AND BU = \'' + BU + '\''

    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR :' + stringifyObj(error))
        return res.status(500).send('GetTableData CONNECTION ERROR: ' + stringifyObj(error))
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
          console.log('---->>> CLIENT END T_AVVISI_QUALITA <<<<<-----')
          client.close()
          if (err) {
            return console.error('Done error', err)
          }
        })
      }
    })
  })

  // Parse JSON bodies (as sent by API clients)
  app.use(express.json())

  return app
}
