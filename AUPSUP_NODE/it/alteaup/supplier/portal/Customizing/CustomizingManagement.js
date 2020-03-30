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

  app.post('/SaveTProfiliConfermaHeader', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_PROFILI_CONFERMA_HEADER\" VALUES (\'' + body.SYSID + '\',\'' + body.PROFILO_CONTROLLO + '\',\'' + body.MODIFICA_PREZZO + '\',\'' + body.PERC_INFERIORE + '\',\'' + body.PERC_SUPERIORE + '\',\'' + body.TIPO_COND_PREZZO + '\',\'' + body.CONFERMA_MANDATORY + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_PROFILI_CONFERMA_HEADER :' + stringifyObj(error))
        return res.status(500).send('T_PROFILI_CONFERMA_HEADER CONNECTION ERROR: ' + stringifyObj(error))
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

  app.post('/SaveTAvvisiQualita', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_AVVISI_QUALITA\" VALUES (\'' + body.SYSID + '\',\'' + body.TIPO_AVVISO + '\',\'' + body.IN_PROCESS + '\',\'' + body.COMPLETED + '\',\'' + body.TIPO_MSG + '\',\'' + body.APPLICAZIONE + '\',\'' + body.T_DIFETTI + '\',\'' + body.T_CAUSE + '\',\'' + body.T_MISURE + '\',\'' + body.T_INTERVENTI + '\',\'' + body.P_DIFETTI + '\',\'' + body.P_CAUSE + '\',\'' + body.P_MISURE + '\',\'' + body.P_INTERVENTI + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_AVVISI_QUALITA :' + stringifyObj(error))
        return res.status(500).send('T_AVVISI_QUALITA CONNECTION ERROR: ' + stringifyObj(error))
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

  app.post('/SaveTMatriceCriticita', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_MATRICE_CRITICITA\" VALUES (\'' + body.RANGE_PERC + '\',\'' + body.SCOSTAMENTO_GG + '\',\'' + body.CRITICITA + '\',\'' + body.DESCRIZIONE + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_MATRICE_CRITICITA :' + stringifyObj(error))
        return res.status(500).send('T_MATRICE_CRITICITA CONNECTION ERROR: ' + stringifyObj(error))
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

  app.post('/SaveTOrdersTypes', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_ORDERS_TYPES\" VALUES (\'' + body.SYSID + '\',\'' + body.BSTYP + '\',\'' + body.BSART + '\',\'' + body.LISTA_ODA + '\',\'' + body.LISTA_RESI + '\',\'' + body.LISTA_RFQ + '\',\'' + body.PLANNING + '\',\'' + body.MESSAGE_TYPE + '\',\'' + body.APPLICATION + '\',\'' + body.TIME_DEPENDENT + '\',\'' + body.GG_ESTRAZIONE + '\',\'' + body.PROGRESSIVI + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_ORDERS_TYPES :' + stringifyObj(error))
        return res.status(500).send('T_ORDERS_TYPES CONNECTION ERROR: ' + stringifyObj(error))
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

  app.post('/SaveTNotifMaster', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_NOTIF_MASTER\" VALUES (\'' + body.FLUSSO + '\',\'' + body.TIPO_STRUTTURA + '\',\'' + body.APPLICAZIONE + '\',\'' + body.EVENTO + '\',\'' + body.DIREZIONE + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_NOTIF_MASTER :' + stringifyObj(error))
        return res.status(500).send('T_NOTIF_MASTER CONNECTION ERROR: ' + stringifyObj(error))
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

  app.post('/SaveTDocumentManagement', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_DOCUMENT_MANAGEMENT\" VALUES (\'' + body.SYSID + '\',\'' + body.APPLICATION + '\',\'' + body.CLASSIFICATION + '\',\'' + body.PROGRESSIVE + '\',\'' + body.DOC_IN + '\',\'' + body.DOC_OUT + '\',\'' + body.ARCHIVE_LINK_ACTIVE + '\',\'' + body.DMS_ACTIVE + '\',\'' + body.DMS_DOC_TYPE_IN + '\',\'' + body.DMS_VERSION_IN + '\',\'' + body.DMS_STATUS_IN + '\',\'' + body.DMS_DOC_TYPE_OUT + '\',\'' + body.DMS_VERSION_OUT + '\',\'' + body.DMS_STATUS_OUT + '\',\'' + body.DMS_DOC_OBJ + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_DOCUMENT_MANAGEMENT :' + stringifyObj(error))
        return res.status(500).send('T_DOCUMENT_MANAGEMENT CONNECTION ERROR: ' + stringifyObj(error))
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

  app.post('/SaveTDocumentManagementTypes', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_DOCUMENT_TYPES\" VALUES (\'' + body.APPLICATION + '\',\'' + body.CLASSIFICATION + '\',\'' + body.DMS_DOC_TYPE + '\',\'' + body.DMS_DOC_TYPE_DESCR + '\',\'' + body.LANGUAGE + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_DOCUMENT_TYPES :' + stringifyObj(error))
        return res.status(500).send('T_DOCUMENT_TYPES CONNECTION ERROR: ' + stringifyObj(error))
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

  app.post('/SaveTGestioneEtichette', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_GESTIONE_ETICHETTE\" VALUES (\'' + body.SYSID + '\',\'' + body.PLANT + '\',\'' + body.MATERIALE_IMBALLO + '\',\'' + body.TIPO_MSG_HU + '\',\'' + body.APPLICAZIONE + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_GESTIONE_ETICHETTE :' + stringifyObj(error))
        return res.status(500).send('T_GESTIONE_ETICHETTE CONNECTION ERROR: ' + stringifyObj(error))
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

  app.post('/SaveTNotifContacts', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_NOTIF_CONTACTS\" VALUES (\'' + body.STRUTTURA + '\',\'' + body.TIPO_STRUTTURA + '\',\'' + body.FLUSSO + '\',\'' + body.CONT + '\',\'' + body.EMAIL + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_NOTIF_CONTACTS :' + stringifyObj(error))
        return res.status(500).send('T_NOTIF_CONTACTS CONNECTION ERROR: ' + stringifyObj(error))
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

  app.post('/SaveTTexts', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_TEXTS\" VALUES (\'' + body.SYSID + '\',\'' + body.BSTYP + '\',\'' + body.TABLE + '\',\'' + body.ID + '\',\'' + body.DESCRIPTION + '\',\'' + body.COMMENTABLE + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_TEXTS :' + stringifyObj(error))
        return res.status(500).send('T_TEXTS CONNECTION ERROR: ' + stringifyObj(error))
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
          console.log('---->>> CLIENT END T_TEXS <<<<<-----')
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

  app.delete('/TUserIdMetaId', function (req, res) {
    var userid = req.query.I_USERID !== undefined && req.query.I_USERID !== null && req.query.I_USERID !== '' ? req.query.I_USERID : ''
    if (userid === '') {
      return res.status(500).send('I_USERID are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_USERID_METAID\" WHERE USERID=\'' + userid + '\''

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

  app.delete('/TMetaIdForn', function (req, res) {
    var METAID = req.query.I_METAID !== undefined && req.query.I_METAID !== null && req.query.I_METAID !== '' ? req.query.I_METAID : ''
    var LIFNR = req.query.I_LIFNR !== undefined && req.query.I_LIFNR !== null && req.query.I_LIFNR !== '' ? req.query.I_LIFNR : ''
    var SYSID = req.query.I_SYSID !== undefined && req.query.I_SYSID !== null && req.query.I_SYSID !== '' ? req.query.I_SYSID : ''
    if (METAID === '' || LIFNR === '' || SYSID === '') {
      return res.status(500).send('I_METAID and I_LIFNR and I_SYSID are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_METAID_FORN\" WHERE METAID=\'' + METAID + '\' AND LIFNR = \'' + LIFNR + '\'  AND SYSID = \'' + SYSID + '\''

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

  app.delete('/TBuPlant', function (req, res) {
    var BU = req.query.I_BU !== undefined && req.query.I_BU !== null && req.query.I_BU !== '' ? req.query.I_BU : ''
    var SYSID = req.query.I_SYSID !== undefined && req.query.I_SYSID !== null && req.query.I_SYSID !== '' ? req.query.I_SYSID : ''
    var PLANT = req.query.I_PLANT !== undefined && req.query.I_PLANT !== null && req.query.I_PLANT !== '' ? req.query.I_PLANT : ''
    if (BU === '' || SYSID === '' || PLANT === '') {
      return res.status(500).send('I_BU and I_SYSID and I_PLANT are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_BU_PLANT\" WHERE BU=\'' + BU + '\' AND SYSID = \'' + SYSID + '\'  AND PLANT = \'' + PLANT + '\''

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

  app.delete('/TBuPurchOrg', function (req, res) {
    var BU = req.query.I_BU !== undefined && req.query.I_BU !== null && req.query.I_BU !== '' ? req.query.I_BU : ''
    var SYSID = req.query.I_SYSID !== undefined && req.query.I_SYSID !== null && req.query.I_SYSID !== '' ? req.query.I_SYSID : ''
    var PURCH_ORG = req.query.I_PURCH_ORG !== undefined && req.query.I_PURCH_ORG !== null && req.query.I_PURCH_ORG !== '' ? req.query.I_PURCH_ORG : ''
    if (BU === '' || SYSID === '' || PURCH_ORG === '') {
      return res.status(500).send('I_BU and I_SYSID and I_PURCH_ORG are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_BU_PURCH_ORG\" WHERE BU=\'' + BU + '\' AND SYSID = \'' + SYSID + '\'  AND PURCH_ORG = \'' + PURCH_ORG + '\''

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

  app.delete('/TProfiliConferma', function (req, res) {
    var SYSID = req.query.I_SYSID !== undefined && req.query.I_SYSID !== null && req.query.I_SYSID !== '' ? req.query.I_SYSID : ''
    var PROFILO_CONTROLLO = req.query.I_PROFILO_CONTROLLO !== undefined && req.query.I_PROFILO_CONTROLLO !== null && req.query.I_PROFILO_CONTROLLO !== '' ? req.query.I_PROFILO_CONTROLLO : ''
    var CAT_CONFERMA = req.query.I_CAT_CONFERMA !== undefined && req.query.I_CAT_CONFERMA !== null && req.query.I_CAT_CONFERMA !== '' ? req.query.I_CAT_CONFERMA : ''
    if (SYSID === '' || PROFILO_CONTROLLO === '' || CAT_CONFERMA === '') {
      return res.status(500).send('I_SYSID and I_PROFILO_CONTROLLO and I_CAT_CONFERMA are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_PROFILI_CONFERMA\" WHERE SYSID=\'' + SYSID + '\' AND PROFILO_CONTROLLO = \'' + PROFILO_CONTROLLO + '\'  AND CAT_CONFERMA = \'' + CAT_CONFERMA + '\''

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

  app.delete('/TProfiliConfermaHeader', function (req, res) {
    var SYSID = req.query.I_SYSID !== undefined && req.query.I_SYSID !== null && req.query.I_SYSID !== '' ? req.query.I_SYSID : ''
    var PROFILO_CONTROLLO = req.query.I_PROFILO_CONTROLLO !== undefined && req.query.I_PROFILO_CONTROLLO !== null && req.query.I_PROFILO_CONTROLLO !== '' ? req.query.I_PROFILO_CONTROLLO : ''
    if (SYSID === '' || PROFILO_CONTROLLO === '') {
      return res.status(500).send('I_SYSID and I_PROFILO_CONTROLLO are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_PROFILI_CONFERMA_HEADER\" WHERE SYSID=\'' + SYSID + '\' AND PROFILO_CONTROLLO = \'' + PROFILO_CONTROLLO + '\''

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

  app.delete('/TAvvisiQualita', function (req, res) {
    var SYSID = req.query.I_SYSID !== undefined && req.query.I_SYSID !== null && req.query.I_SYSID !== '' ? req.query.I_SYSID : ''
    var TIPO_AVVISO = req.query.I_TIPO_AVVISO !== undefined && req.query.I_TIPO_AVVISO !== null && req.query.I_TIPO_AVVISO !== '' ? req.query.I_TIPO_AVVISO : ''
    if (SYSID === '' || TIPO_AVVISO === '') {
      return res.status(500).send('I_SYSID and I_TIPO_AVVISO are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_AVVISI_QUALITA\" WHERE SYSID=\'' + SYSID + '\' AND TIPO_AVVISO = \'' + TIPO_AVVISO + '\''

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

  app.delete('/TMatriceCriticita', function (req, res) {
    var RANGE_PERC = req.query.I_RANGE_PERC !== undefined && req.query.I_RANGE_PERC !== null && req.query.I_RANGE_PERC !== '' ? req.query.I_RANGE_PERC : ''
    var SCOSTAMENTO_GG = req.query.I_SCOSTAMENTO_GG !== undefined && req.query.I_SCOSTAMENTO_GG !== null && req.query.I_SCOSTAMENTO_GG !== '' ? req.query.I_SCOSTAMENTO_GG : ''
    if (RANGE_PERC === '' || SCOSTAMENTO_GG === '') {
      return res.status(500).send('I_RANGE_PERC and I_SCOSTAMENTO_GG are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_MATRICE_CRITICITA\" WHERE RANGE_PERC=\'' + RANGE_PERC + '\' AND SCOSTAMENTO_GG = \'' + SCOSTAMENTO_GG + '\''

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

  app.delete('/TOrdersTypes', function (req, res) {
    var SYSID = req.query.I_SYSID !== undefined && req.query.I_SYSID !== null && req.query.I_SYSID !== '' ? req.query.I_SYSID : ''
    var BSTYP = req.query.I_BSTYP !== undefined && req.query.I_BSTYP !== null && req.query.I_BSTYP !== '' ? req.query.I_BSTYP : ''
    var BSART = req.query.I_BSART !== undefined && req.query.I_BSART !== null && req.query.I_BSART !== '' ? req.query.I_BSART : ''
    if (SYSID === '' || BSTYP === '' || BSART === '') {
      return res.status(500).send('I_SYSID and I_BSTYP AND I_BSART are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_ORDERS_TYPES\" WHERE SYSID=\'' + SYSID + '\' AND BSTYP = \'' + BSTYP + '\' AND BSART = \'' + BSART + '\''

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

  app.delete('/TNotifMaster', function (req, res) {
    var FLUSSO = req.query.I_FLUSSO !== undefined && req.query.I_FLUSSO !== null && req.query.I_FLUSSO !== '' ? req.query.I_FLUSSO : ''
    var TIPO_STRUTTURA = req.query.I_TIPO_STRUTTURA !== undefined && req.query.I_TIPO_STRUTTURA !== null && req.query.I_TIPO_STRUTTURA !== '' ? req.query.I_TIPO_STRUTTURA : ''
    var APPLICAZIONE = req.query.I_APPLICAZIONE !== undefined && req.query.I_APPLICAZIONE !== null && req.query.I_APPLICAZIONE !== '' ? req.query.I_APPLICAZIONE : ''
    var EVENTO = req.query.I_EVENTO !== undefined && req.query.I_EVENTO !== null && req.query.I_EVENTO !== '' ? req.query.I_EVENTO : ''
    var DIREZIONE = req.query.I_DIREZIONE !== undefined && req.query.I_DIREZIONE !== null && req.query.I_DIREZIONE !== '' ? req.query.I_DIREZIONE : ''
    if (FLUSSO === '' || TIPO_STRUTTURA === '' || APPLICAZIONE === '' || EVENTO === '' || DIREZIONE === '') {
      return res.status(500).send('I_FLUSSO and I_TIPO_STRUTTURA and I_APPLICAZIONE and I_EVENTO and I_DIREZIONE are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_NOTIF_MASTER\" WHERE FLUSSO=\'' + FLUSSO + '\' AND TIPO_STRUTTURA = \'' + TIPO_STRUTTURA + '\' AND APPLICAZIONE = \'' + APPLICAZIONE + '\' AND EVENTO = \'' + EVENTO + '\' AND DIREZIONE = \'' + DIREZIONE + '\''

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

  app.delete('/TDocumentManagement', function (req, res) {
    var SYSID = req.query.I_SYSID !== undefined && req.query.I_SYSID !== null && req.query.I_SYSID !== '' ? req.query.I_SYSID : ''
    var APPLICATION = req.query.I_APPLICATION !== undefined && req.query.I_APPLICATION !== null && req.query.I_APPLICATION !== '' ? req.query.I_APPLICATION : ''
    var CLASSIFICATION = req.query.I_CLASSIFICATION !== undefined && req.query.I_CLASSIFICATION !== null && req.query.I_CLASSIFICATION !== '' ? req.query.I_CLASSIFICATION : ''
    var PROGRESSIVE = req.query.I_PROGRESSIVE !== undefined && req.query.I_PROGRESSIVE !== null && req.query.I_PROGRESSIVE !== '' ? req.query.I_PROGRESSIVE : ''
    if (SYSID === '' || APPLICATION === '' || CLASSIFICATION === '' || PROGRESSIVE === '') {
      return res.status(500).send('I_SYSID and I_APPLICATION AND I_CLASSIFICATION I_PROGRESSIVE are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_DOCUMENT_MANAGEMENT\" WHERE SYSID=\'' + SYSID + '\' AND APPLICATION = \'' + APPLICATION + '\' AND CLASSIFICATION = \'' + CLASSIFICATION + '\'  AND PROGRESSIVE = \'' + PROGRESSIVE + '\''

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

  app.delete('/TDocumentManagementTypes', function (req, res) {
    var APPLICATION = req.query.I_APPLICATION !== undefined && req.query.I_APPLICATION !== null && req.query.I_APPLICATION !== '' ? req.query.I_APPLICATION : ''
    var CLASSIFICATION = req.query.I_CLASSIFICATION !== undefined && req.query.I_CLASSIFICATION !== null && req.query.I_CLASSIFICATION !== '' ? req.query.I_CLASSIFICATION : ''
    var DOC_TYPE = req.query.I_DOC_TYPE !== undefined && req.query.I_DOC_TYPE !== null && req.query.I_DOC_TYPE !== '' ? req.query.I_DOC_TYPE : ''
    if (APPLICATION === '' || CLASSIFICATION === '' || DOC_TYPE === '') {
      return res.status(500).send('I_APPLICATION I_CLASSIFICATION I_DOC_TYPE are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_DOCUMENT_TYPES\" WHERE APPLICATION = \'' + APPLICATION + '\' AND CLASSIFICATION = \'' + CLASSIFICATION + '\'  AND DMS_DOC_TYPE = \'' + DOC_TYPE + '\''

    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR :' + stringifyObj(error))
        return res.status(500).send('TDocumentManagementTypes CONNECTION ERROR: ' + stringifyObj(error))
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
          console.log('---->>> CLIENT END TDocumentManagementTypes <<<<<-----')
          client.close()
          if (err) {
            return console.error('Done error', err)
          }
        })
      }
    })
  })

  app.delete('/TGestioneEtichette', function (req, res) {
    var SYSID = req.query.I_SYSID !== undefined && req.query.I_SYSID !== null && req.query.I_SYSID !== '' ? req.query.I_SYSID : ''
    var PLANT = req.query.I_PLANT !== undefined && req.query.I_PLANT !== null && req.query.I_PLANT !== '' ? req.query.I_PLANT : ''
    if (SYSID === '' || PLANT === '') {
      return res.status(500).send('I_SYSID and I_PLANT are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_GESTIONE_ETICHETTE\" WHERE SYSID=\'' + SYSID + '\' AND PLANT = \'' + PLANT + '\''

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

  app.delete('/TNotifContacts', function (req, res) {
    var STRUTTURA = req.query.I_STRUTTURA !== undefined && req.query.I_STRUTTURA !== null && req.query.I_STRUTTURA !== '' ? req.query.I_STRUTTURA : ''
    var TIPO_STRUTTURA = req.query.I_TIPO_STRUTTURA !== undefined && req.query.I_TIPO_STRUTTURA !== null && req.query.I_TIPO_STRUTTURA !== '' ? req.query.I_TIPO_STRUTTURA : ''
    var FLUSSO = req.query.I_FLUSSO !== undefined && req.query.I_FLUSSO !== null && req.query.I_FLUSSO !== '' ? req.query.I_FLUSSO : ''
    var CONT = req.query.I_CONT !== undefined && req.query.I_CONT !== null && req.query.I_CONT !== '' ? req.query.I_CONT : ''
    if (STRUTTURA === '' || TIPO_STRUTTURA === '' || FLUSSO === '' || CONT === '') {
      return res.status(500).send('I_STRUTTURA and I_TIPO_STRUTTURA AND I_FLUSSO and I_CONT are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_NOTIF_CONTACTS\" WHERE STRUTTURA=\'' + STRUTTURA + '\' AND TIPO_STRUTTURA = \'' + TIPO_STRUTTURA + '\' AND FLUSSO = \'' + FLUSSO + '\' AND CONT = \'' + CONT + '\''

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

  app.delete('/TTexts', function (req, res) {
    var SYSID = req.query.I_SYSID !== undefined && req.query.I_SYSID !== null && req.query.I_SYSID !== '' ? req.query.I_SYSID : ''
    var BSTYP = req.query.I_BSTYP !== undefined && req.query.I_BSTYP !== null && req.query.I_BSTYP !== '' ? req.query.I_BSTYP : ''
    var TABLE = req.query.I_TABLE !== undefined && req.query.I_TABLE !== null && req.query.I_TABLE !== '' ? req.query.I_TABLE : ''
    var ID = req.query.I_ID !== undefined && req.query.I_ID !== null && req.query.I_ID !== '' ? req.query.I_ID : ''
    if (SYSID === '' || BSTYP === '' || TABLE === '' || ID === '') {
      return res.status(500).send('I_SYSID and I_BSTYP AND I_TABLE and I_ID are Mandatory')
    }
    const sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_TEXTS\" WHERE SYSID=\'' + SYSID + '\' AND BSTYP = \'' + BSTYP + '\' AND TABLE = \'' + TABLE + '\' AND ID = \'' + ID + '\''

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
          console.log('---->>> CLIENT END T_TEXTS <<<<<-----')
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
