/* eslint-disable camelcase */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-useless-escape */
/* eslint-disable indent */

'use strict'
var express = require('express')
var stringifyObj = require('stringify-object')
var hdbext = require('@sap/hdbext')
var async = require('async')

module.exports = function () {
    var app = express.Router()

    const bodyParser = require('body-parser')

    app.use(
        bodyParser.urlencoded({
            extended: true
        })
    )

    app.use(bodyParser.json())

    // GET PLANNING LIST
    app.post('/GetPianiConsegna', function (req, res) {
        const body = req.body

        console.log('INPUT BODY ==========> ' + JSON.stringify(body))

        if (body !== undefined && body !== '' && body !== null) {
            var results
            var lifnr = []
            var ebeln = []
            var ebelp = []
            var ekorg = []
            var ekgrp = []
            var matnr = []
            var werks = []
            var userid = req.user.id

            if (body.lifnr !== null && body.lifnr !== undefined && body.lifnr !== '') {
                var oLifnr = []
                for (var i = 0; i < body.lifnr.length; i++) {
                    oLifnr.push({
                        ELIFN: body.lifnr[i]
                    })
                }
                lifnr = oLifnr
            }

            if (body.ebeln !== null && body.ebeln !== undefined && body.ebeln !== '') {
                ebeln.push({
                    ebeln: body.ebeln
                })
            }
            if (body.ebelp !== null && body.ebelp !== undefined && body.ebelp !== '') {
                ebelp.push({
                    ebelp: body.ebelp
                })
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
                    hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.SchedulingAgreement::MM00_SAG_DOC_LIST', function (_err, sp) {
                        sp(userid, lifnr, ebeln, ebelp, ekorg, matnr, ekgrp, werks, (err, parameters, ET_SAG_EKEH, ET_SAG_EKEK, ET_SAG_EKES, ET_SAG_EKET, ET_SAG_EKKO, ET_SAG_EKPO, OUT_POS_PIANI_CONS) => {
                            if (err) {
                                console.error('ERROR: ' + err)
                                return res.status(500).send(stringifyObj(err))
                            } else {
                                var t_ekpo = []
                                var t_ekes = []
                                var t_eket = []
                                var t_ekeh = []
                                var t_ekek = []

                                if (OUT_POS_PIANI_CONS !== undefined && OUT_POS_PIANI_CONS !== null && OUT_POS_PIANI_CONS.length > 0) {
                                    for (var i = 0; i < OUT_POS_PIANI_CONS.length; i++) {
                                        var objectCopy = OUT_POS_PIANI_CONS[i]

                                        objectCopy.PRIMO_PERIODO = objectCopy.P1_PROGR_RIC !== '0' ? ((parseFloat(objectCopy.P1_PROGR_CONF) / parseFloat(objectCopy.P1_PROGR_RIC)) * 100).toFixed(2) : 0
                                        objectCopy.SECONDO_PERIODO = objectCopy.P2_PROGR_RIC !== '0' ? ((parseFloat(objectCopy.P2_PROGR_CONF) / parseFloat(objectCopy.P2_PROGR_RIC)) * 100).toFixed(2) : 0

                                        objectCopy.POItemSchedulers = {
                                            results: []
                                        }
                                        objectCopy.POItemConfirmations = {
                                            results: []
                                        }
                                        objectCopy.POItemEkeh = {
                                            results: []
                                        }
                                        objectCopy.POItemEkek = {
                                            results: []
                                        }

                                        if (ET_SAG_EKKO != null && ET_SAG_EKKO !== undefined && ET_SAG_EKKO.length > 0) {
                                            for (var j = 0; j < ET_SAG_EKKO.length; j++) {
                                                var objectCopyEkko = ET_SAG_EKKO[j]
                                                if (objectCopyEkko.EBELN === objectCopy.EBELN) {
                                                    objectCopy.VTEXT = objectCopyEkko.VTEXT
                                                    objectCopy.LIFNR = objectCopyEkko.LIFNR
                                                    objectCopy.NAME1 = objectCopyEkko.NAME1
                                                    objectCopy.EKNAM = objectCopyEkko.EKNAM
                                                    objectCopy.KDATB = objectCopyEkko.KDATB
                                                    objectCopy.KDATE = objectCopyEkko.KDATE
                                                    objectCopy.BSART = objectCopyEkko.BSART
                                                }
                                            }
                                        }

                                        t_ekpo.push(objectCopy)
                                    }
                                }
                                if (ET_SAG_EKES !== null && ET_SAG_EKES !== undefined && ET_SAG_EKES.length > 0) {
                                    // eslint-disable-next-line no-redeclare
                                    for (var i = 0; i < ET_SAG_EKES.length; i++) {
                                        t_ekes.push(ET_SAG_EKES[i])
                                    }
                                }

                                if (ET_SAG_EKET != null && ET_SAG_EKET !== undefined && ET_SAG_EKET.length > 0) {
                                    // eslint-disable-next-line no-redeclare
                                    for (var i = 0; i < ET_SAG_EKET.length; i++) {
                                        t_eket.push(ET_SAG_EKET[i])
                                    }
                                }

                                if (ET_SAG_EKEH != null && ET_SAG_EKEH !== undefined && ET_SAG_EKEH.length > 0) {
                                    // eslint-disable-next-line no-redeclare
                                    for (var i = 0; i < ET_SAG_EKEH.length; i++) {
                                        t_ekeh.push(ET_SAG_EKEH[i])
                                    }
                                }

                                if (ET_SAG_EKEK != null && ET_SAG_EKEK !== undefined && ET_SAG_EKEK.length > 0) {
                                    // eslint-disable-next-line no-redeclare
                                    for (var i = 0; i < ET_SAG_EKEK.length; i++) {
                                        t_ekek.push(ET_SAG_EKEK[i])
                                    }
                                }

                                if (t_ekpo.length > 0) {
                                    // eslint-disable-next-line no-redeclare
                                    for (var i = 0; i < t_ekpo.length; i++) {
                                        var tEkes = []
                                        // eslint-disable-next-line no-redeclare
                                        for (var j = 0; j < t_ekes.length; j++) {
                                            if (t_ekes[j].EBELN === t_ekpo[i].EBELN && t_ekes[j].EBELP === t_ekpo[i].EBELP && t_ekes[j].EBTYP !== 'LA') {
                                                tEkes.push(t_ekes[j])
                                            }
                                        }
                                        t_ekpo[i].POItemSchedulers[results] = tEkes

                                        var tEket = []
                                        // eslint-disable-next-line no-redeclare
                                        for (var j = 0; j < t_eket.length; j++) {
                                            if (t_eket[j].EBELN === t_ekpo[i].EBELN && t_eket[j].EBELP === t_ekpo[i].EBELP) {
                                                tEket.push(t_eket[j])
                                            }
                                        }
                                        t_ekpo[i].POItemConfirmations[results] = tEket

                                        var tEkeh = []
                                        // eslint-disable-next-line no-redeclare
                                        for (var j = 0; j < t_ekeh.length; j++) {
                                            if (t_ekeh[j].EBELN === t_ekpo[i].EBELN && t_ekeh[j].EBELP === t_ekpo[i].EBELP) {
                                                tEkeh.push(t_ekeh[j])
                                            }
                                        }
                                        t_ekpo[i].POItemEkeh[results] = tEkeh

                                        var tEkek = []
                                        // eslint-disable-next-line no-redeclare
                                        for (var j = 0; j < t_ekek.length; j++) {
                                            if (t_ekek[j].EBELN === t_ekpo[i].EBELN && t_ekek[j].EBELP === t_ekpo[i].EBELP) {
                                                tEkek.push(t_ekek[j])
                                            }
                                        }
                                        t_ekpo[i].POItemEkek[results] = tEkek
                                    }
                                }

                                return res.status(200).send({
                                    results: t_ekpo
                                })
                            }
                        })
                    })
                }
            })
        }
    })

    // GET SELECTED CONFERME PIANI CONSEGNA
    app.post('/GetSelectedConferme', function (req, res) {
        const body = req.body

        console.log('INPUT BODY ==========> ' + JSON.stringify(body))

        if (body !== undefined && body !== '' && body !== null) {
            var ordPos = body.ordPos !== undefined && body.ordPos !== null ? body.ordPos : []
            var ekorg = []
            var lifnr = []
            var matnr = []
            var werks = []
            var ekgrp = []
            var megaResults = []
            var userid = req.user.id

            for (var j = 0; j < ordPos.length; j++) {
                var objectCopy = ordPos[j]

                hdbext.createConnection(req.tenantContainer, (err, client) => {
                    if (err) {
                        return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
                    } else {
                        hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.SchedulingAgreement::SchedulationsCalculator', function (_err, sp) {
                            sp(userid, objectCopy.EBELN, objectCopy.EBELP, objectCopy.BSTYP, objectCopy.BSART, objectCopy.EBTYP !== undefined && objectCopy.EBTYP !== null ? objectCopy.EBTYP : '', [], (err, parameters, results) => {
                                if (err) {
                                    console.error('ERROR: ' + err)
                                    return res.status(500).send(stringifyObj(err))
                                } else {
                                    var objToJsonList = []

                                    if (results !== null && results !== undefined && results.length > 0) {
                                        for (var i = 0; i < results.length; i++) {
                                            var elem = results[i]
                                            objToJsonList.push(elem)
                                        }
                                    }
                                    // eslint-disable-next-line no-redeclare
                                    for (var i = 0; i < objToJsonList.length; i++) {
                                        // eslint-disable-next-line no-redeclare
                                        var elem = objToJsonList[i]
                                        if (i > 0) {
                                            var recordPrecedente = objToJsonList[i - 1]
                                            elem.PROG_RICHIESTO = parseFloat(elem.MENGE) + parseFloat(recordPrecedente.PROG_RICHIESTO)
                                            elem.PROG_CONFERMA = parseFloat(elem.MENGE_PROG_CONF) + parseFloat(recordPrecedente.MENGE_PROG_CONF)
                                            objToJsonList[i] = elem
                                        }
                                    }

                                    objectCopy.SchedulationsStatus = objToJsonList

                                    hdbext.createConnection(req.tenantContainer, (err, client) => {
                                        if (err) {
                                            return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
                                        } else {
                                            hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.SchedulingAgreement::GetConfirms', function (_err, sp) {
                                                sp(userid, objectCopy.EBELN, objectCopy.EBELP, lifnr, ekorg, matnr, ekgrp, werks, (err, parameters, ET_RETURN_EKKO_EKPO, ET_RETURN_EKES_EKET, ET_RETURN_EKEH_EKEK) => {
                                                    if (err) {
                                                        console.error('ERROR: ' + err)
                                                        return res.status(500).send(stringifyObj(err))
                                                    } else {
                                                        var outEkkoEkpo = []

                                                        if (ET_RETURN_EKKO_EKPO !== null && ET_RETURN_EKKO_EKPO !== undefined && ET_RETURN_EKKO_EKPO.length > 0) {
                                                            for (var i = 0; i < ET_RETURN_EKKO_EKPO.length; i++) {
                                                                var elem = ET_RETURN_EKKO_EKPO[i]
                                                                if (elem.EBELP === objectCopy.EBELP) {
                                                                    outEkkoEkpo.push(elem)
                                                                }
                                                            }
                                                        }
                                                        var outEketEkes = []

                                                        if (ET_RETURN_EKES_EKET !== null && ET_RETURN_EKES_EKET !== undefined && ET_RETURN_EKES_EKET.length > 0) {
                                                            // eslint-disable-next-line no-redeclare
                                                            for (var i = 0; i < ET_RETURN_EKES_EKET.length; i++) {
                                                                // eslint-disable-next-line no-redeclare
                                                                var elem = ET_RETURN_EKES_EKET[i]
                                                                if (elem.EBELP === objectCopy.EBELP) {
                                                                    outEketEkes.push(ET_RETURN_EKES_EKET[i])
                                                                }
                                                            }
                                                        }
                                                        var outEkehEkek = []

                                                        if (ET_RETURN_EKEH_EKEK !== null && ET_RETURN_EKEH_EKEK !== undefined && ET_RETURN_EKEH_EKEK.length > 0) {
                                                            // eslint-disable-next-line no-redeclare
                                                            for (var i = 0; i < ET_RETURN_EKEH_EKEK.length; i++) {
                                                                // eslint-disable-next-line no-redeclare
                                                                var elem = ET_RETURN_EKEH_EKEK[i]
                                                                if (elem.EBELP === objectCopy.EBELP) {
                                                                    outEkehEkek.push(ET_RETURN_EKEH_EKEK[i])
                                                                }
                                                            }
                                                        }

                                                        objectCopy.RMOData = {
                                                            EkkoEkpo: outEkkoEkpo,
                                                            EketEkes: outEketEkes,
                                                            EkehEkek: outEkehEkek
                                                        }

                                                        hdbext.createConnection(req.tenantContainer, (err, client) => {
                                                            if (err) {
                                                                return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
                                                            } else {
                                                                hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::GetProfiliConferma', function (_err, sp) {
                                                                    sp(userid, objectCopy.BSTAE, (err, parameters, results) => {
                                                                        if (err) {
                                                                            console.error('ERROR: ' + err)
                                                                            return res.status(500).send(stringifyObj(err))
                                                                        } else {
                                                                            var outProfiles = []
                                                                            if (results != null && results !== undefined && results.length > 0) {
                                                                                for (var i = 0; i < results.length; i++) {
                                                                                    var singleProf = results[i]
                                                                                    if (singleProf.TIPO_CONFERMA !== '2') {
                                                                                        outProfiles.push(singleProf)
                                                                                    }
                                                                                }
                                                                            }

                                                                            objectCopy.profiliConferma = outProfiles
                                                                            objectCopy.editPrice = false

                                                                            var sql = "SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_PROFILI_CONFERMA_HEADER\" WHERE PROFILO_CONTROLLO = \'" + objectCopy.BSTAE + "\'"

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
                                                                                        if (results !== null && results.length > 0) {
                                                                                            var guid = results[0]
                                                                                            if (guid !== null && guid.MODIFICA_PREZZO !== null && guid.MODIFICA_PREZZO === 'X') {
                                                                                                objectCopy.editPrice = true
                                                                                                objectCopy.PricePercDOWN = guid.PERC_INFERIORE
                                                                                                objectCopy.PricePercUP = guid.PERC_SUPERIORE
                                                                                                objectCopy.KSCHL = guid.TIPO_COND_PREZZO
                                                                                            } else {
                                                                                                objectCopy.editPrice = false
                                                                                            }
                                                                                        }
                                                                                    }

                                                                                    objectCopy.TimeDependent = false
                                                                                    objectCopy.GGEstrazione = 0
                                                                                    
                                                                                    sql = "SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_ORDERS_TYPES\" WHERE BSTYP = \'" + objectCopy.BSTYP + "\' AND BSART = \'" + objectCopy.BSART + "\'"
        
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
                                                                                                if (results !== null && results.length > 0) {
                                                                                                    var guid = results[0]
                                                                                                    if (guid !== null) {
                                                                                                        if (guid !== null && guid.TIME_DEPENDENT !== null && guid.TIME_DEPENDENT === 'X') {
                                                                                                            objectCopy.TimeDependent = true
                                                                                                        }
                                                                                                        objectCopy.GGEstrazione = guid.GG_ESTRAZIONE
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                            megaResults.push(objectCopy)
                                                                                            callback()
                                                                                          }
                                                                                        ], function done (err, parameters, rows) {
                                                                                          if (err) {
                                                                                            return console.error('Done error', err)
                                                                                          }
                                                                                        })
                                                                                      }
                                                                                    })
                                                                                    callback()
                                                                                  }
                                                                                ], function done (err, parameters, rows) {
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
                                                    }
                                                })
                                            })
                                        }
                                    })
                                }
                            })
                        })
                    }
                })
            }
        }
    })

    // GET PIANI CONSEGNA DETAIL
    app.get('/GetPianoConfermaDetail', function (req, res) {
        var ebeln = req.query.I_EBELN !== undefined && req.query.I_EBELN !== null && req.query.I_EBELN !== '' ? req.query.I_EBELN : ''
        var ebelp = req.query.I_EBELP !== undefined && req.query.I_EBELP !== null && req.query.I_EBELP !== '' ? req.query.I_EBELP : ''

        hdbext.createConnection(req.tenantContainer, (err, client) => {
          if (err) {
            return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
          } else {
            hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.SchedulingAgreement::GetPianiConsegnaDetail', function (_err, sp) {
              sp(req.user.id, ebeln, ebelp, (err, parameters, ET_HEADER, ET_SAG_EKEH, ET_SAG_EKES, ET_SAG_EKET) => {
                if (err) {
                  return res.status(500).send(stringifyObj(err))
                } else {
                    var outET_SAG_EKEH_EKET = []

                    if (ET_SAG_EKEH !== null && ET_SAG_EKEH !== undefined && ET_SAG_EKEH.length > 0) {
                        for (var i = 0; i < ET_SAG_EKEH.length; i++) {
                            outET_SAG_EKEH_EKET.push(ET_SAG_EKEH[i])
                        }
                    }
            
                    if (ET_SAG_EKET !== null && ET_SAG_EKET !== undefined && ET_SAG_EKET.length > 0) {
                        // eslint-disable-next-line no-redeclare
                        for (var i = 0; i < ET_SAG_EKET.length; i++) {
                            outET_SAG_EKEH_EKET.push(ET_SAG_EKET[i])
                        }
                    }
            
                    var outET_SAG_EKES = []
            
                    if (ET_SAG_EKES !== null && ET_SAG_EKES !== undefined && ET_SAG_EKES.length > 0) {
                        // eslint-disable-next-line no-redeclare
                        for (var i = 0; i < ET_SAG_EKES.length; i++) {
                            outET_SAG_EKES.push(ET_SAG_EKES[i])
                        }
                    }
            
                    var header = {}
            
                    if (ET_HEADER !== null && ET_HEADER !== undefined && ET_HEADER.length > 0) {
                        // eslint-disable-next-line no-redeclare
                        for (var i = 0; i < ET_HEADER.length; i++) {
                            header = ET_HEADER[i]
                        }
                    }
            
                    var results = {
                        results: {
                            Schedulations: outET_SAG_EKEH_EKET,
                            Confirms: outET_SAG_EKES
                        },
                        EBELN: header.EBELN,
                        EBELP: header.EBELP,
                        MATNR: header.MATNR,
                        TXZ01: header.TXZ01,
                        IDNLF: header.IDNLF,
                        MENGE: header.MENGE,
                        PEINH: header.PEINH
                    }
            
                  return res.status(200).send({
                    results: results
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

    return app
}
