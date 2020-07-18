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
    console.log('USERINFO: ' + stringifyObj(req.authInfo.userInfo))
    console.log('IDENTITY ZONE: ' + stringifyObj(req.authInfo.identityZone))
    var outData = {
      firstname: req.authInfo.userInfo.givenName,
      lastname: req.authInfo.userInfo.familyName,
      userId: req.user.id,
      isSupplier: false,
      isBuyer: false,
      isSupplierD: false,
      isAdministrator: false,
      isPlanner: false

    }

    if (req.authInfo.scopes !== null && req.authInfo.scopes !== undefined && req.authInfo.scopes !== '') {
      req.authInfo.scopes.forEach(element => {
        console.log('ELEMENT: ' + element)
        if (element.includes('Z_RL_BUYER')) {
          outData.isBuyer = true
        }
        if (element.includes('Z_RL_SUPPLIER_D')) {
          outData.isSupplierD = true
        } else {
          if (element.includes('Z_RL_SUPPLIER')) {
            outData.isSupplier = true
          }
        }

        if (element.includes('Z_RL_ADMINISTRATOR')) {
          outData.isAdministrator = true
        }
        if (element.includes('Z_RL_PLANNER')) {
          outData.isPlanner = true
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
                const sql = 'SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_TEXTS\" WHERE BSTYP = \'' + bstyp + '\' AND COMMENTABLE = \'X\''

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
                        } else {
                          console.log('T_TEXTS FOUND :' + stringifyObj(results))
                          // eslint-disable-next-line camelcase
                          if (t_header !== undefined && t_header.length > 0) {
                            t_header.forEach(element => {
                              if (element.COMMENTABLE === 'X') {
                                element.COMMENTABLE = true
                              } else {
                                element.COMMENTABLE = false
                              }
                              element.TABLE = 'EKKO'
                              element.EBELP = ebelp

                              if (results && results.length > 0) {
                                for (let index = 0; index < results.length; index++) {
                                  const testo = results[index]
                                  if (element.ID !== testo.ID && testo.TABLE === 'EKKO') {
                                    t_header.push({ EBELN: element.EBELN, EBELP: element.EBELP, ID: testo.ID, DESCRIPTION: testo.DESCRIPTION, TESTO: '', COMMENTABLE: testo.COMMENTABLE === 'X' })
                                  }
                                }
                              }
                            })
                          } else {
                            for (let index = 0; index < results.length; index++) {
                              const testo = results[index]
                              if (testo.TABLE === 'EKKO') {
                                t_header.push({ EBELN: ebeln, EBELP: ebelp, ID: testo.ID, DESCRIPTION: testo.DESCRIPTION, TESTO: '', COMMENTABLE: testo.COMMENTABLE === 'X', TABLE: 'EKKO', COMMENT: '' })
                              }
                            }
                          }
                          // eslint-disable-next-line camelcase
                          if (t_pos !== undefined && t_pos.length > 0) {
                            t_pos.forEach(element => {
                              if (element.COMMENTABLE === 'X') {
                                element.COMMENTABLE = true
                              } else {
                                element.COMMENTABLE = false
                              }

                              element.TABLE = 'EKPO'
                              element.EBELP = ebelp

                              if (results && results.length > 0) {
                                for (let index = 0; index < results.length; index++) {
                                  const testo = results[index]
                                  if (element.ID !== testo.ID && testo.TABLE === 'EKPO') {
                                    t_pos.push({ EBELN: element.EBELN, EBELP: element.EBELP, ID: testo.ID, DESCRIPTION: testo.DESCRIPTION, TESTO: '', COMMENTABLE: testo.COMMENTABLE === 'X' })
                                  }
                                }
                              }
                            })
                          } else {
                            if (results && results.length > 0) {
                              for (let index = 0; index < results.length; index++) {
                                const testo = results[index]
                                if (testo.TABLE === 'EKPO') {
                                  t_pos.push({ EBELN: ebeln, EBELP: ebelp, ID: testo.ID, DESCRIPTION: testo.DESCRIPTION, TESTO: '', COMMENTABLE: testo.COMMENTABLE === 'X', TABLE: 'EKPO', COMMENT: '' })
                                }
                              }
                            }
                          }

                          const sql = 'SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_TEXTS_COMMENT\" WHERE EBELN = \'' + ebeln + '\' AND EBELP = \'' + ebelp + '\''

                          hdbext.createConnection(req.tenantContainer, function (error, client) {
                            if (error) {
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

                                function response (err, listaCommentiPrecedenti, callback) {
                                  if (err) {
                                    res.type('application/json').status(500).send({ ERROR: err })
                                    return
                                  } else {
                                    for (let index = 0; index < listaCommentiPrecedenti.length; index++) {
                                      const commento = listaCommentiPrecedenti[index]
                                      for (let i = 0; i < t_header.length; i++) {
                                        const testata = t_header[i]
                                        if (testata.EBELN === commento.EBELN && testata.EBELP === commento.EBELP && testata.ID === commento.ID && testata.TABLE === commento.TABLE) {
                                          testata.COMMENT = commento.COMMENT
                                        }
                                      }
                                      for (let i = 0; i < t_pos.length; i++) {
                                        const pos = t_pos[i]
                                        if (pos.EBELN === commento.EBELN && pos.EBELP === commento.EBELP && pos.ID === commento.ID && pos.TABLE === commento.TABLE) {
                                          pos.COMMENT = commento.COMMENT
                                        }
                                      }
                                    }
                                  }

                                  return res.status(200).send({
                                    header_texts: { results: t_header },
                                    pos_texts: { results: t_pos }
                                  })
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

    body.COMMENT = body.COMMENT === undefined ? '' : body.COMMENT
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

      if (body.matnr !== null && body.matnr !== undefined) {
        // var oMatnr = []
        // for (var i = 0; i < body.matnr.length; i++) {
        matnr.push({ CODE: body.matnr })
        // }
        // matnr = oMatnr
      }

      if (body.maktx !== null && body.maktx !== undefined && body.maktx.length > 0) {
        // var oMaktx = []
        // eslint-disable-next-line no-redeclare
        // for (var i = 0; i < body.maktx.length; i++) {
        maktx.push({ DESCR: body.maktx })
        // }
        //  maktx = oMaktx
      }

      hdbext.createConnection(req.tenantContainer, (err, client) => {
        if (err) {
          return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
        } else {
          hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::GetSearchHelp', function (_err, sp) {
            if (_err) {
              console.error('ERROR CONNECTION GetSearchHelp: ' + stringifyObj(_err))
              return res.status(500).send('GetVendorList CONNECTION ERROR: ' + stringifyObj(_err))
            }
            sp(userId, matnr, maktx, filter, 'MATNR', (err, parameters, results) => {
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

  // GET VENDOR LIST

  app.post('/GetVendorList', function (req, res) {
    const body = req.body

    console.log('INPUT BODY ==========> ' + JSON.stringify(body))

    if (body !== undefined && body !== '' && body !== null) {
      var userid = req.user.id
      var name1 = req.query.I_NAME1 !== undefined && req.query.I_NAME1 !== '' ? req.query.I_NAME1 : ''
      var stceg = req.query.I_STCEG !== undefined && req.query.I_STCEG !== '' ? req.query.I_STCEG : ''
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
            console.log('name1: ' + name1 + ' stceg: ' + stceg)
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

  // GET CONFIRMATION STATUS (ORDER and SCHED AGREE)
  app.post('/GetConfirmStatus', function (req, res) {
    const body = req.body

    console.log('INPUT BODY ==========> ' + JSON.stringify(body))

    if (body !== undefined && body !== '' && body !== null) {
      var lifnr = []
      var ebeln = ''
      var ebelp = ''
      var ekorg = []
      var ekgrp = []
      var matnr = []
      var werks = []
      var bstyp = []
      var spras = 'I'
      var userid = req.user.id
      var ebtyp = 'AB'
      var schedEindtFrom = ''
      var schedEindtTo = ''
      var createEindtFrom = ''
      var createEindtTo = ''
      var isPrezzo = 'X'
      var isQuantita = 'X'
      var etenr = ''

      if (body.bstyp !== null && body.bstyp !== undefined && body.bstyp !== '') {
        var oBstyp = []
        for (var i = 0; i < body.bstyp.length; i++) {
          oBstyp.push({
            BSTYP: body.bstyp[i]
          })
        }
        bstyp = oBstyp
      }

      if (bstyp.length === 0) {
        return res.status(500).send('bstyp is mandatory')
      }

      if (body.lifnr !== null && body.lifnr !== undefined && body.lifnr !== '') {
        var oLifnr = []
        for (var i = 0; i < body.lifnr.length; i++) {
          oLifnr.push({
            ELIFN: body.lifnr[i]
          })
        }
        lifnr = oLifnr
      }

      if (body.etenr !== null && body.etenr !== undefined && body.etenr !== '') {
        etenr = body.etenr
      }

      if (body.isPrezzo !== null && body.isPrezzo === true) {
        isPrezzo = 'X'
      } else {
        isPrezzo = ''
      }

      if (body.isQuantita !== null && body.isQuantita === true) {
        isQuantita = 'X'
      } else {
        isQuantita = ''
      }

      if (body.schedEindtFrom !== null && body.schedEindtFrom !== undefined && body.schedEindtFrom !== '') {
        schedEindtFrom = body.schedEindtFrom
      }

      if (body.schedEindtTo !== null && body.schedEindtTo !== undefined && body.schedEindtTo !== '') {
        schedEindtTo = body.schedEindtTo
      }

      if (body.createEindtFrom !== null && body.createEindtFrom !== undefined && body.createEindtFrom !== '') {
        createEindtFrom = body.createEindtFrom
      }

      if (body.createEindtTo !== null && body.createEindtTo !== undefined && body.createEindtTo !== '') {
        createEindtTo = body.createEindtTo
      }

      if (body.spras !== null && body.spras !== undefined && body.spras !== '') {
        spras = body.spras
      }

      if (body.ebtyp !== null && body.ebtyp !== undefined && body.ebtyp !== '') {
        ebtyp = body.ebtyp
      }

      if (body.ebeln !== null && body.ebeln !== undefined && body.ebeln !== '') {
        ebeln = body.ebeln
      }

      if (body.ebelp !== null && body.ebelp !== undefined && body.ebelp !== '') {
        ebelp = body.ebelp
      }

      if (body.ekorg !== null && body.ekorg !== undefined && body.ekorg.length > 0) {
        var oEkorg = []
        // eslint-disable-next-line no-redeclare
        for (var i = 0; i < body.ekorg.length; i++) {
          oEkorg.push({
            EKORG: body.ekorg[i]
          })
        }
        ekorg = oEkorg
      }

      if (body.ekgrp !== null && body.ekgrp !== undefined && body.ekgrp.length > 0) {
        var oEkgrp = []
        // eslint-disable-next-line no-redeclare
        for (var i = 0; i < body.ekgrp.length; i++) {
          oEkgrp.push({
            EKGRP: body.ekgrp[i]
          })
        }
        ekgrp = oEkgrp
      }
      if (body.matnr !== null && body.matnr !== undefined && body.matnr.length > 0) {
        var oMatnr = []
        // eslint-disable-next-line no-redeclare
        for (var i = 0; i < body.matnr.length; i++) {
          oMatnr.push({
            MATNR: body.matnr[i]
          })
        }
        matnr = oMatnr
      }
      if (body.werks !== null && body.werks !== undefined && body.werks.length > 0) {
        var oWerks = []
        // eslint-disable-next-line no-redeclare
        for (var i = 0; i < body.werks.length; i++) {
          oWerks.push({
            EWERK: body.werks[i],
            DESCR: ''
          })
        }
        werks = oWerks
      }

      hdbext.createConnection(req.tenantContainer, (err, client) => {
        if (err) {
          return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
        } else {
          hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::GetConfirmStatus', function (_err, sp) {
            if (_err) {
              console.log('---->>> CLIENT END ERR GetConfirmStatus <<<<<-----')
            }
            sp(userid, lifnr, ebeln, ebelp, ekorg, matnr, ekgrp, werks, bstyp, spras, schedEindtFrom, schedEindtTo, createEindtFrom, createEindtTo,
              isPrezzo, isQuantita, etenr, (err, parameters, ET_APPROVE_EKKO_EKPO, ET_APPROVE_EKES_EKET) => {
                console.log('---->>> CLIENT END GetConfirmStatus <<<<<-----')
                client.close()
                if (err) {
                  console.error('ERROR: ' + err)
                  return res.status(500).send(stringifyObj(err))
                } else {
                  var results = { results: [] }
                  for (let index = 0; index < ET_APPROVE_EKKO_EKPO.length; index++) {
                    var obj = {}
                    var element = ET_APPROVE_EKKO_EKPO[index]
                    obj.EBELN = element.EBELN
                    obj.visibility = false
                    obj.IcoArrow = 'sap-icon://navigation-right-arrow'

                    obj.positions = []

                    for (let i = 0; i < ET_APPROVE_EKKO_EKPO.length; i++) {
                      var el = ET_APPROVE_EKKO_EKPO[i]
                      if (element.EBELN === el.EBELN) {
                        var trovato = false
                        obj.positions.forEach(pos => {
                          if (pos.EBELP === el.EBELP) {
                            trovato = true
                          }
                        })

                        if (!trovato) {
                          obj.positions.push({
                            EBELP: el.EBELP,
                            ConfermePrezzoVisibility: false,
                            ConfermeQuantitaVisibility: false,
                            IcoArrowQuantita: 'sap-icon://navigation-right-arrow',
                            IcoArrowPrezzo: 'sap-icon://navigation-right-arrow',
                            ConfermeQuantita: [],
                            ConfermePrezzo: []
                          })
                        }
                      }
                    }

                    var trovato = false
                    results.results.forEach(el => {
                      if (el.EBELN === element.EBELN) {
                        trovato = true
                      }
                    })

                    if (!trovato) {
                      results.results.push(obj)
                    }
                  }

                  for (let index = 0; index < results.results.length; index++) {
                    const element = results.results[index]
                    element.positions.forEach(position => {
                      for (let i = 0; i < ET_APPROVE_EKKO_EKPO.length; i++) {
                        const ekkoekpo = ET_APPROVE_EKKO_EKPO[i]
                        if (ekkoekpo.EBELP === position.EBELP && element.EBELN === ekkoekpo.EBELN) {
                          if (ekkoekpo.CONF_TYPE === 'PRZ') {
                            position.ConfermePrezzo.push({
                              actual_price: ekkoekpo.NETPR_ORIGINAL,
                              actual_UDP: ekkoekpo.PEINH_ORIGINAL,
                              date_start: '',
                              date_end: '',
                              new_price: ekkoekpo.NETPR,
                              new_udp: ekkoekpo.PEINH,
                              new_start_date: ekkoekpo.ZINVALIDITA,
                              new_end_date: ekkoekpo.ZFINVALIDATA,
                              insert_date: ekkoekpo.CREATION_DATE,
                              approve_date: ekkoekpo.MODIFY_STATUS_DATE,
                              status: ekkoekpo.STATUS,
                              comment: ekkoekpo.COMMENT,
                              confirmDirectToSap: ekkoekpo.CONF_DIRECT_TO_SAP
                            })
                          } else {
                            for (let j = 0; j < ET_APPROVE_EKES_EKET.length; j++) {
                              var sched = ET_APPROVE_EKES_EKET[j]
                              if (sched.EBELP === position.EBELP && ekkoekpo.EBELN === sched.EBELN) {
                                position.ConfermeQuantita.push({
                                  sched_numb: sched.ETENS,
                                  sched_date: sched.EINDT,
                                  sched_quant: sched.MENGE,
                                  conf_date: sched.MODIFY_STATUS_DATE,
                                  conf_quant: ekkoekpo.MENGE,
                                  insert_date: ekkoekpo.CREATION_DATE,
                                  approve_date: sched.MODIFY_STATUS_DATE,
                                  status: sched.STATUS,
                                  comment: sched.COMMENT,
                                  confirmDirectToSap: sched.CONF_DIRECT_TO_SAP
                                })
                              }
                            }
                          }
                        }
                      }
                    })
                  }

                  return res.status(200).send(results)
                }
              })
          })
        }
      })
    }
  })

  // CONTATORE TILES

  app.get('/GetCounter', function (req, res) {
    res.type('application/json').status(200).send({
      d: {
        icon: 'sap-icon://travel-expense',
        info: 'Quarter Ends!',
        infoState: 'Critical',
        number: 43.333,
        numberDigits: 1,
        numberFactor: 'k',
        numberState: 'Positive',
        numberUnit: 'EUR',
        stateArrow: 'Up',
        subtitle: 'Quarterly overview',
        title: 'Travel Expenses',
        count: 100
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
