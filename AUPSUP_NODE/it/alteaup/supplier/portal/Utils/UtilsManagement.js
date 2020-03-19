/* eslint-disable no-useless-escape */
/* eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0 */
'use strict'
var express = require('express')
var stringifyObj = require('stringify-object')
var hdbext = require('@sap/hdbext')
var async = require('async')

module.exports = function () {
  var app = express.Router()

  app.get('/testTimeout', function (req, res) {
    setTimeout(function () {
      console.log('prova timeout 50 secondi')
      return res.status(200).send()
    }, 50000)
  })

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
        if (element.includes('Z_RL_BUYER')) {
          outData.isBuyer = true
        }
        if (element.includes('Z_RL_SUPPLIER')) {
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
        return res.status(500).send('GetPurchaseOrganizations CONNECTION ERROR: ' + stringifyObj(err))
      } else {
        hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::GetPurchaseOrganizations', function (_err, sp) {
          sp(req.user.id, (err, parameters, results) => {
            console.log('---->>> CLIENT END GetPurchaseOrganizations <<<<<-----')
            client.close()
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
  // GET USER PLANTS

  app.get('/GetUserPlants', function (req, res) {
    hdbext.createConnection(req.tenantContainer, (err, client) => {
      if (err) {
        return res.status(500).send('GetUserPlants CONNECTION ERROR: ' + stringifyObj(err))
      } else {
        hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::GetUserPlants', function (_err, sp) {
          sp(req.user.id, (err, parameters, results) => {
            console.log('---->>> CLIENT END GetUserPlants <<<<<-----')
            client.close()
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
        return res.status(500).send('GetUserBU CONNECTION ERROR: ' + stringifyObj(err))
      } else {
        hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::GetUserBU', function (_err, sp) {
          sp(req.user.id, (err, parameters, results) => {
            console.log('---->>> CLIENT END GetUserBU <<<<<-----')
            client.close()
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

  // GET AVVISI QUALITA LIST

  app.get('/GetAvvisiQualita', function (req, res) {
    const sql = 'SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_AVVISI_QUALITA\"'

    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_AVVISI_QUALITA :' + stringifyObj(error))
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
          console.log('---->>> CLIENT END T_AVVISI_QUALITA <<<<<-----')
          client.close()
          if (err) {
            return console.error('Done error', err)
          }
        })
      }
    })
  })

  // GET CORRECT SYSID

  app.get('/GetSYSID', function (req, res) {
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

  // GET LIST OF METASUPPLIER by userId

  app.get('/GetMetasupplierList', function (req, res) {
    hdbext.createConnection(req.tenantContainer, (err, client) => {
      if (err) {
        return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
      } else {
        hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::GetMetasupplierList', function (_err, sp) {
          if (_err) {
            console.error('ERROR CONNECTION GetMetasupplierList :' + stringifyObj(_err))
            return res.status(500).send('GetMetasupplierList CONNECTION ERROR: ' + stringifyObj(_err))
          }
          try {
            sp(req.user.id, (err, parameters, OUT_ANAGRAFICA, OUT_LIFNR) => {
              console.log('---->>> CLIENT END <<<<<-----')
              client.close()

              if (err) {
                return res.status(500).send(stringifyObj(err))
              } else {
                var outList = []

                var listaLifnr = []
                var listaLifnrOut = []
                var elem = ''

                if (OUT_LIFNR !== undefined && OUT_LIFNR !== null) {
                  listaLifnr = OUT_LIFNR
                }

                if (OUT_ANAGRAFICA !== undefined && OUT_ANAGRAFICA !== null) {
                  var listaAnagrafica = OUT_ANAGRAFICA
                  if (listaAnagrafica != null && listaAnagrafica.length > 0) {
                    for (var i = 0; i < listaAnagrafica.length; i++) {
                      listaLifnrOut = []
                      for (var j = 0; j < listaLifnr.length; j++) {
                        if (listaAnagrafica[i].METAID === listaLifnr[j].METAID) {
                          elem = {
                            LIFNR: listaLifnr[j].LIFNR,
                            DESCR: listaLifnr[j].DESCR
                          }
                          listaLifnrOut.push(elem)
                        }
                      }
                      elem = {
                        METAID: listaAnagrafica[i].METAID,
                        DESCR: listaAnagrafica[i].DESCR,
                        LIFNR: listaLifnrOut
                      }

                      outList.push(elem)
                    }
                  }
                }

                return res.status(200).send({
                  results: outList
                })
              }
            })
          } catch (err) {
            console.error('CATCH ERR: ' + stringifyObj(err))
          }
        })
      }
    })
  })

  // GET LIST PROFILI CONFERMA

  app.get('/GetProfiliConferma', function (req, res) {
    var bstae = req.query.I_BSTAE !== undefined && req.query.I_BSTAE !== null && req.query.I_BSTAE !== '' ? req.query.I_BSTAE : ''

    hdbext.createConnection(req.tenantContainer, (err, client) => {
      if (err) {
        return res.status(500).send('GetProfiliConferma CONNECTION ERROR: ' + stringifyObj(err))
      } else {
        hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::GetProfiliConferma', function (_err, sp) {
          if (_err) {
            console.error('---->>> ERROR GetProfiliConferma <<<<<-----')
            return res.status(500).send('GetProfiliConferma CONNECTION ERROR SP: ' + stringifyObj(_err))
          }
          sp(req.user.id, bstae, (err, parameters, results) => {
            console.log('---->>> CLIENT END GetProfiliConferma <<<<<-----')
            client.close()
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

  // GESTIONE ETICHETTE

  app.get('/GetGestioneEtichette', function (req, res) {
    const sql = 'SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_GESTIONE_ETICHETTE\"'

    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
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
              res.type('application/json').status(200).send({ results: results })
            }
            callback()
          }
        ], function done (err, parameters, rows) {
          console.log('---->>> CLIENT END T_GESTIONE_ETICHETTE <<<<<-----')
          client.close()
          if (err) {
            return console.error('Done error', err)
          }
        })
      }
    })
  })

  // GET TEXTS

  app.get('/GetDocumentTexts', function (req, res) {
    var ebeln = req.query.I_EBELN !== null && req.query.I_EBELN !== undefined ? req.query.I_EBELN : ''
    var ebelp = req.query.I_EBELP !== null && req.query.I_EBELP !== undefined ? req.query.I_EBELP : ''
    var bstyp = req.query.I_BSTYP !== null && req.query.I_BSTYP !== undefined ? req.query.I_BSTYP : ''

    if (ebeln !== '' && bstyp !== '') {
      hdbext.createConnection(req.tenantContainer, (err, client) => {
        if (err) {
          return res.status(500).send('GetDocumentTexts CONNECTION ERROR: ' + stringifyObj(err))
        } else {
          hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::GetDocumentTexts', function (_err, sp) {
            if (_err) {
              console.error('---->>> ERROR GetDocumentTexts <<<<<-----')
              return res.status(500).send('GetDocumentTexts CONNECTION ERROR SP: ' + stringifyObj(_err))
            }
            // eslint-disable-next-line camelcase
            sp(req.user.id, ebeln, ebelp, bstyp, (err, parameters, t_header, t_pos) => {
              console.log('---->>> CLIENT END GetDocumentTexts <<<<<-----')
              client.close()
              if (err) {
                return res.status(500).send(stringifyObj(err))
              } else {
                // eslint-disable-next-line camelcase
                if (t_header !== undefined && t_header.length > 0) {
                  t_header.forEach(element => {
                    if (element.COMMENTABLE === 'X') {
                      element.COMMENTABLE = true
                    } else {
                      element.COMMENTABLE = false
                    }
                  })
                }
                // eslint-disable-next-line camelcase
                if (t_pos !== undefined && t_pos.length > 0) {
                  t_pos.forEach(element => {
                    if (element.COMMENTABLE === 'X') {
                      element.COMMENTABLE = true
                    } else {
                      element.COMMENTABLE = false
                    }
                  })
                }
                return res.status(200).send({
                  header_texts: { results: t_header },
                  pos_texts: { results: t_pos }
                })
              }
            })
          })
        }
      })
    } else {
      return res.status(500).send('I_EBELN and I_BSTYP are mandatory')
    }
  })

  // SAVE TEXTS

  app.post('/SaveDocumentTexts', function (req, res) {
    const body = req.body

    var sql = 'UPSERT \"AUPSUP_DATABASE.data.tables::T_TEXTS_COMMENT\" VALUES (\'' + body.SYSID + '\',\'' + body.BSTYP + '\',\'' + body.TABLE + '\',\'' + body.ID + '\',\'' + body.EBELN + '\',\'' + body.EBELP + '\',\'' + body.COMMENT + '\') WITH PRIMARY KEY'
    console.log('sql: ' + sql)
    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_TEXTS_COMMENTS :' + stringifyObj(error))
        return res.status(500).send('T_TEXTS_COMMENT CONNECTION ERROR: ' + stringifyObj(error))
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
          console.log('---->>> CLIENT END T_TEXTS_COMMENT <<<<<-----')
          client.close()
          if (err) {
            return console.error('Done error', err)
          }
        })
      }
    })
  })

  // GET LIST OF PURCHASE DOC from BACKEND SAP

  app.post('/GetPurchaseDoc', function (req, res) {
    const body = req.body

    console.log('INPUT BODY ==========> ' + JSON.stringify(body))

    var ekgrp = []
    var eknam = []
    var filter = []
    var userId = req.user.id

    if (body.ekgrp !== null && body.ekgrp !== undefined && body.ekgrp.length > 0) {
      var oEkgrp = []
      for (var i = 0; i < body.ekgrp.length; i++) {
        oEkgrp.push({ CODE: body.ekgrp[i] })
      }
      ekgrp = oEkgrp
    }

    if (body.eknam !== null && body.eknam !== undefined && body.eknam.length > 0) {
      var oEknam = []
      // eslint-disable-next-line no-redeclare
      for (var i = 0; i < body.eknam.length; i++) {
        oEknam.push({ DESCR: body.eknam[i] })
      }
      eknam = oEknam
    }

    hdbext.createConnection(req.tenantContainer, (err, client) => {
      if (err) {
        return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
      } else {
        hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::GetSearchHelp', function (_err, sp) {
          if (_err) {
            console.error('ERROR CONNECTION GetSearchHelp: ' + stringifyObj(_err))
            return res.status(500).send('T_GESTIONE_ETICHETTE CONNECTION ERROR: ' + stringifyObj(_err))
          }
          sp(userId, ekgrp, eknam, filter, 'EKGRP', (err, parameters, results) => {
            console.log('---->>> CLIENT END <<<<<-----')
            client.close()
            if (err) {
              console.error('ERROR: ' + err)
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

  // SEARCH MATERIAL MATCHCODE SERVICE

  app.post('/SearchMaterial', function (req, res) {
    const body = req.body

    console.log('INPUT BODY ==========> ' + JSON.stringify(body))

    if (body !== undefined && body !== '' && body !== null) {
      var matnr = []
      var maktx = []
      var filter = []
      var userId = req.user.id

      if (body.matnr !== null && body.matnr !== undefined && body.matnr.length > 0) {
        var oMatnr = []
        for (var i = 0; i < body.matnr.length; i++) {
          oMatnr.push({ CODE: body.matnr[i] })
        }
        matnr = oMatnr
      }

      if (body.maktx !== null && body.maktx !== undefined && body.maktx.length > 0) {
        var oMaktx = []
        // eslint-disable-next-line no-redeclare
        for (var i = 0; i < body.maktx.length; i++) {
          oMaktx.push({ DESCR: body.maktx[i] })
        }
        maktx = oMaktx
      }

      hdbext.createConnection(req.tenantContainer, (err, client) => {
        if (err) {
          return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
        } else {
          hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::GetSearchHelp', function (_err, sp) {
            console.log('---->>> CLIENT END SearchMaterial <<<<<-----')
            client.close()
            sp(userId, matnr, maktx, filter, 'MATNR', (err, parameters, results) => {
              if (err) {
                console.error('ERROR: ' + err)
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
    }
  })

  // GET VENDOR LIST

  app.post('/GetVendorList', function (req, res) {
    const body = req.body

    console.log('INPUT BODY ==========> ' + JSON.stringify(body))

    if (body !== undefined && body !== '' && body !== null) {
      var userid = req.user.id
      var name1 = req.user.I_NAME1 !== undefined && req.user.I_NAME1 !== '' ? req.user.NAME1 : ''
      var stceg = req.user.I_STCEG !== undefined && req.user.I_STCEG !== '' ? req.user.I_STCEG : ''
      var lifnr = []
      var ekorg = []

      if (body.lifnr !== null && body.lifnr !== undefined && body.lifnr !== '') {
        var oLifnr = []
        for (var i = 0; i < body.lifnr.length; i++) {
          oLifnr.push({ LIFNR: body.lifnr[i] })
        }
        lifnr = oLifnr
      }

      if (body.ekorg !== null && body.ekorg !== undefined && body.ekorg !== '') {
        var oEkorg = []
        // eslint-disable-next-line no-redeclare
        for (var i = 0; i < body.ekorg.length; i++) {
          oEkorg.push({ EKORG: body.ekorg[i] })
        }
        ekorg = oEkorg
      }

      hdbext.createConnection(req.tenantContainer, (err, client) => {
        if (err) {
          return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
        } else {
          hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Orders::MM00_VENDOR_LIST', function (_err, sp) {
            if (_err) {
              console.error('ERROR CONNECTION GetSearchHelp: ' + stringifyObj(_err))
              return res.status(500).send('GetVendorList CONNECTION ERROR: ' + stringifyObj(_err))
            }
            sp(userid, name1, stceg, lifnr, ekorg, (err, parameters, results) => {
              console.log('---->>> CLIENT END <<<<<-----')
              client.close()
              if (err) {
                console.error('ERROR: ' + stringifyObj(err))
                return res.status(500).send(stringifyObj(err))
              } else {
                return res.status(200).send({
                  results: results
                })
              }
            })
          })
        }
      })
    }
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
