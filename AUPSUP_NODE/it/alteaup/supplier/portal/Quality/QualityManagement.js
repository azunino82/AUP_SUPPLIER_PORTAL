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
    app.post('/GetNotificationList', function (req, res) {
        const body = req.body

        console.log('INPUT BODY ==========> ' + JSON.stringify(body))

        if (body !== undefined && body !== '' && body !== null) {
        var qmart = []
        var mawerk = []
        var lifnum = []
        var matnr = []
        var idnlf = []
        var ernam = []
        var stat = []
        var spras = 'I'
        var qmnum = []
        var userid = req.user.id
        
        if (body.spras != null && body.spras !== undefined && body.spras !== '') {
            spras = body.spras
        }
        if (body.qmnum != null && body.qmnum !== undefined && body.qmnum !== '') {
            qmnum.push({ QMNUM: body.qmnum })
        }
       if (body.idnlf != null && body.idnlf !== undefined && body.idnlf !== '') {
           idnlf.push({ IDNLF: body.idnlf })
       }
       if (body.ernam != null && body.ernam !== undefined && body.ernam !== '') {
           ernam.push({ ERNAM: body.ernam })
       }
       if (body.status !== null && body.status !== undefined && body.status.length > 0) {
            var oStat = [] 
            for (var i = 0; i < body.status.length; i++) {
                oStat.push({ STAT: body.status[i] })
            }
            stat = oStat
        }  
       if (body.mawerk !== null && body.mawerk !== undefined && body.mawerk.length > 0) {
           var oMawerk = [] 
           for (var i = 0; i < body.mawerk.length; i++) {
               oMawerk.push({ MAWERK: body.mawerk[i] })
           }
           mawerk = oMawerk
       }
       if (body.lifnum !== null && body.lifnum !== undefined && body.lifnum.length > 0) {
           var oLifnum = [] 
           // eslint-disable-next-line no-redeclare
           for (var i = 0; i < body.lifnum.length; i++) {
               oLifnum.push({ LIFNUM: body.lifnum[i] })
           }
           lifnum = oLifnum
       }
       if (body.matnr !== null && body.matnr !== undefined && body.matnr.length > 0) {
           var oMatnr = [] 
           // eslint-disable-next-line no-redeclare
           for (var i = 0; i < body.matnr.length; i++) {
               oMatnr.push({ MATNR: body.matnr[i] })
           }
           matnr = oMatnr
       }

        hdbext.createConnection(req.tenantContainer, (err, client) => {
            if (err) {
            return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
            } else {
            hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Quality::MM00_NOTIFICATION_LIST', function (_err, sp) {
                sp(userid, qmnum, qmart, mawerk, lifnum, matnr, idnlf, spras, ernam, stat, (err, parameters, ET_NOTIF_VIQMEL, ET_NOTIF_VIQMFE, ET_NOTIF_VIQMUR, ET_NOTIF_VIQMSM, ET_NOTIF_VIQMMA) => {
                if (err) {
                    console.error('ERROR: ' + err)
                    return res.status(500).send(stringifyObj(err))
                } else {
                    var t_VIQMEL = []
                    var t_VIQMFE = []
                    var t_VIQMUR = []
                    var t_VIQMSM = []
                    var t_VIQMMA = []
                
                    if (ET_NOTIF_VIQMEL !== null && ET_NOTIF_VIQMEL !== undefined && ET_NOTIF_VIQMEL.length > 0) {
                        for (var i = 0; i < ET_NOTIF_VIQMEL.length; i++) {
                            var objectCopy = ET_NOTIF_VIQMEL[i]
                            objectCopy.t_VIQMFE = { results: [] }
                            objectCopy.t_VIQMUR = { results: [] }
                            objectCopy.t_VIQMSM = { results: [] }
                            objectCopy.t_VIQMMA = { results: [] }
                    
                            t_VIQMEL.push(objectCopy)
                        }
                    }
    
                    if (ET_NOTIF_VIQMFE !== null && ET_NOTIF_VIQMFE !== undefined && ET_NOTIF_VIQMFE.length > 0) {
                        // eslint-disable-next-line no-redeclare
                        for (var i = 0; i < ET_NOTIF_VIQMFE.length; i++) {
                            t_VIQMFE.push(ET_NOTIF_VIQMFE[i])
                        }
                    }
    
                    if (ET_NOTIF_VIQMSM !== null && ET_NOTIF_VIQMSM !== undefined && ET_NOTIF_VIQMSM.length > 0) {
                        // eslint-disable-next-line no-redeclare
                        for (var i = 0; i < ET_NOTIF_VIQMSM.length; i++) {
                            t_VIQMSM.push(ET_NOTIF_VIQMSM[i])
                        }
                    }
    
                    if (ET_NOTIF_VIQMMA !== null && ET_NOTIF_VIQMMA !== undefined && ET_NOTIF_VIQMMA.length > 0) {
                        // eslint-disable-next-line no-redeclare
                        for (var i = 0; i < ET_NOTIF_VIQMMA.length; i++) {
                            t_VIQMMA.push(ET_NOTIF_VIQMMA[i])
                        }
                    }
    
                    if (ET_NOTIF_VIQMUR !== null && ET_NOTIF_VIQMUR !== undefined && ET_NOTIF_VIQMUR.length > 0) {
                        // eslint-disable-next-line no-redeclare
                        for (var i = 0; i < ET_NOTIF_VIQMUR.length; i++) {
                            t_VIQMUR.push(ET_NOTIF_VIQMUR[i])
                        }
                    }

                    // eslint-disable-next-line no-redeclare
                    for (var i = 0; i < t_VIQMEL.length; i++) {
                        var tVIQMFE = []
                        for (var j = 0; j < t_VIQMFE.length; j++) {
                            if (t_VIQMFE[j].QMNUM === t_VIQMEL[i].QMNUM) { tVIQMFE.push(t_VIQMFE[j]) }
                        }
                        t_VIQMEL[i].t_VIQMFE.results = tVIQMFE
                        
                        var tVIQMSM = []
                        // eslint-disable-next-line no-redeclare
                        for (var j = 0; j < t_VIQMSM.length; j++) {
                            if (t_VIQMSM[j].QMNUM === t_VIQMEL[i].QMNUM) { tVIQMSM.push(t_VIQMSM[j]) }
                        }
                        t_VIQMEL[i].t_VIQMSM.results = tVIQMSM

                        var tVIQMMA = []
                        // eslint-disable-next-line no-redeclare
                        for (var j = 0; j < t_VIQMMA.length; j++) {
                            if (t_VIQMMA[j].QMNUM === t_VIQMEL[i].QMNUM) { tVIQMMA.push(t_VIQMMA[j]) }
                        }
                        t_VIQMEL[i].t_VIQMMA.results = tVIQMMA

                        var tVIQMUR = []
                        // eslint-disable-next-line no-redeclare
                        for (var j = 0; j < t_VIQMUR.length; j++) {
                            if (t_VIQMUR[j].QMNUM === t_VIQMEL[i].QMNUM) { tVIQMUR.push(t_VIQMUR[j]) }
                        }
                        t_VIQMEL[i].t_VIQMUR.results = tVIQMUR
                    }

                    return res.status(200).send({
                        results: t_VIQMEL
                    })
                }
                })
            })
            }
        })
        }
    })

    // NOTIFICATION CHANGE
    app.post('/NotifChange', function (req, res) {
        const body = req.body

        console.log('INPUT BODY ==========> ' + JSON.stringify(body))

        if (body !== undefined && body !== '' && body !== null) {
        var it_viqmfe = []
        var it_viqmma = []
        var it_viqmsm = []
        var it_viqmur = []
        var i_notif = ''
        var userid = req.user.id
        
        if (body.it_viqmfe != null && body.it_viqmfe !== undefined && body.it_viqmfe !== '') {
            it_viqmfe = body.it_viqmfe
        }
        if (body.it_viqmma != null && body.it_viqmma !== undefined && body.it_viqmma !== '') {
            it_viqmma = body.it_viqmma
        }
        if (body.it_viqmsm != null && body.it_viqmsm !== undefined && body.it_viqmsm !== '') {
            it_viqmsm = body.it_viqmsm
        }
        if (body.it_viqmur != null && body.it_viqmur !== undefined && body.it_viqmur !== '') {
            it_viqmur = body.it_viqmur
        }
        if (body.i_notif != null && body.i_notif !== undefined && body.i_notif !== '') {
            i_notif = body.i_notif
        }                               

        hdbext.createConnection(req.tenantContainer, (err, client) => {
            if (err) {
            return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
            } else {
            hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Quality::MM00_NOTIF_CHANGE', function (_err, sp) {
                sp(userid, i_notif, it_viqmfe, it_viqmma, it_viqmsm, it_viqmur, (err, parameters, results) => {
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

    // NOTIFICATION DETAIL
    app.get('/GetNotificationDetail', function (req, res) {
        const sql = 'SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_AVVISI_QUALITA\"'
        var qmart = []
        var mawerk = []
        var lifnum = []
        var matnr = []
        var idnlf = []
        var ernam = []
        var spras = 'I'
        var qmnum = []
        var stat = []
        var userid = req.user.id

        if (req.query.I_QMNUM !== null && req.query.I_QMNUM !== '') {
            qmnum.push({
                QMNUM: req.query.I_QMNUM
            })
        }

        if (req.query.I_SPRAS !== null && req.query.I_SPRAS !== undefined && req.query.I_SPRAS !== '') {
            spras = req.query.I_SPRAS
        }

        if (req.query.I_QMNUM === null || req.query.I_QMNUM === undefined || req.query.I_QMNUM === '') {
            return res.status(500).send(JSON.stringify("{'Error':'QMNUM field is mandatory'}"))
        }        

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
                            // HO TROVATO RECORD IN T_AVVISI_QUALITA
                            var resultAvvisi = results !== undefined && results.length > 0 ? results[0] : null
                            hdbext.createConnection(req.tenantContainer, (err, client) => {
                                if (err) {
                                    return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
                                } else {
                                hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Quality::MM00_NOTIFICATION_LIST', function (_err, sp) {
                                    sp(userid, qmnum, qmart, mawerk, lifnum, matnr, idnlf, spras, ernam, stat, (err, parameters, ET_NOTIF_VIQMEL, ET_NOTIF_VIQMFE, ET_NOTIF_VIQMUR, ET_NOTIF_VIQMSM, ET_NOTIF_VIQMMA) => {
                                        if (err) {
                                            console.error('ERROR: ' + err)
                                            return res.status(500).send(stringifyObj(err))
                                        } else {
                                            var t_VIQMEL = {}
                                            var t_VIQMFE = []
                                            var t_VIQMUR = []
                                            var t_VIQMSM = []
                                            var t_VIQMMA = []
                                            var singleObj = {}
                                    
                                            if (ET_NOTIF_VIQMFE !== undefined && ET_NOTIF_VIQMFE !== null && ET_NOTIF_VIQMFE.length > 0) {
                                                for (var i = 0; i < ET_NOTIF_VIQMFE.length; i++) {
                                                    t_VIQMFE.push(ET_NOTIF_VIQMFE[i])
                                                }
                                            }
                                    
                                            if (ET_NOTIF_VIQMSM !== undefined && ET_NOTIF_VIQMSM !== null) {
                                                // eslint-disable-next-line no-redeclare
                                                for (var i = 0; i < ET_NOTIF_VIQMSM.length; i++) {
                                                    t_VIQMSM.push(ET_NOTIF_VIQMSM[i])
                                                }
                                            }
                                    
                                            if (ET_NOTIF_VIQMMA !== undefined && ET_NOTIF_VIQMMA !== null && ET_NOTIF_VIQMMA.length > 0) {
                                                // eslint-disable-next-line no-redeclare
                                                for (var i = 0; i < ET_NOTIF_VIQMMA.length; i++) {
                                                    t_VIQMMA.push(ET_NOTIF_VIQMMA[i])
                                                }
                                            }

                                            if (ET_NOTIF_VIQMUR !== null && ET_NOTIF_VIQMUR !== undefined && ET_NOTIF_VIQMUR.length > 0) {
                                                // eslint-disable-next-line no-redeclare
                                                for (var i = 0; i < ET_NOTIF_VIQMUR.length; i++) {
                                                    t_VIQMUR.push(ET_NOTIF_VIQMUR[i])
                                                }
                                            }
                                    
                                            var POSITIONS = []
                                            for (var j = 0; j < t_VIQMFE.length; j++) {
                                                if (t_VIQMFE[j].FENUM !== '0000' && t_VIQMFE[j].FENUM !== '') {
                                                    var singlePos = t_VIQMFE[j]
                                                    singlePos.AKTYP = resultAvvisi.P_DIFETTI // sovrascrivo quello che torna la bapi in base al customizing
                                                    if (resultAvvisi.P_DIFETTI !== null && resultAvvisi.P_DIFETTI !== undefined && resultAvvisi.P_DIFETTI === 'D') {
                                                        singlePos.visible = true
                                                        singlePos.enabled = false
                                                    } else {
                                                        if (resultAvvisi.P_DIFETTI !== null && resultAvvisi.P_DIFETTI !== undefined && resultAvvisi.P_DIFETTI === 'E') {
                                                            singlePos.visible = true
                                                            singlePos.enabled = true
                                                        } else {
                                                            singlePos.visible = false
                                                            singlePos.enabled = false
                                                        }
                                                    }
                                    
                                                    singlePos.CMI = {
                                                        results: []
                                                    }
                                    
                                                    for (var b = 0; b < t_VIQMUR.length; b++) {
                                                        if (t_VIQMUR[b].QMNUM === singlePos.QMNUM && t_VIQMUR[b].FENUM !== '0000' && t_VIQMUR[b].FENUM !== '' && t_VIQMUR[b].FENUM === singlePos.FENUM) {
                                                            var singleVIQMUR = t_VIQMUR[b]
                                                            singleVIQMUR.AKTYP = resultAvvisi.P_CAUSE // sovrascrivo quello che torna la bapi in base al customizing
                                                            singleObj = {}
                                                            singleObj.FENUM = singleVIQMUR.FENUM
                                                            singleObj.QMNUM = singleVIQMUR.QMNUM
                                                            singleObj.PROGRESSIVO = singleVIQMUR.URNUM
                                                            singleObj.TEXT = singleVIQMUR.URTXT
                                                            singleObj.LONG_TEXT = singleVIQMUR.URTXT_LONG
                                                            singleObj.AKTYP = singleVIQMUR.AKTYP
                                                            singleObj.TYPE = 'VIQMUR'
                                                            if (resultAvvisi.P_CAUSE !== null && resultAvvisi.P_CAUSE !== undefined && resultAvvisi.P_CAUSE === 'D') {
                                                                singleObj.visible = true
                                                                singleObj.enabled = false
                                                            } else {
                                                                if (resultAvvisi.P_CAUSE !== null && resultAvvisi.P_CAUSE !== undefined && resultAvvisi.P_CAUSE === 'E') {
                                                                    singleObj.visible = true
                                                                    singleObj.enabled = true
                                                                } else {
                                                                    singleObj.visible = false
                                                                    singleObj.enabled = false
                                                                }
                                                            }
                                    
                                                            if (resultAvvisi.P_CAUSE !== null && resultAvvisi.P_CAUSE !== undefined && resultAvvisi.P_CAUSE !== 'H') {
                                                                singlePos.CMI.results.push(singleObj)
                                                            }
                                                        }
                                                    }
                                    
                                                    for (var c = 0; c < t_VIQMSM.length; c++) {
                                                        if (t_VIQMSM[c].QMNUM === singlePos.QMNUM && t_VIQMSM[c].FENUM !== '0000' && t_VIQMSM[c].FENUM !== '' && t_VIQMSM[c].FENUM === singlePos.FENUM) {
                                                            var singleVIQMSM = t_VIQMSM[c]
                                                            singleVIQMSM.AKTYP = resultAvvisi.P_MISURE // sovrascrivo quello che torna la bapi in base al customizing
                                                            singleObj = {}
                                                            singleObj.FENUM = singleVIQMSM.FENUM
                                                            singleObj.QMNUM = singleVIQMSM.QMNUM
                                                            singleObj.PROGRESSIVO = singleVIQMSM.MANUM 
                                                            singleObj.TEXT = singleVIQMSM.MATXT
                                                            singleObj.LONG_TEXT = singleVIQMSM.MATXT_LONG
                                                            singleObj.AKTYP = singleVIQMSM.AKTYP
                                                            singleObj.TYPE = 'VIQMSM'
                                                            if (resultAvvisi.P_MISURE !== null && resultAvvisi.P_MISURE !== undefined && resultAvvisi.P_MISURE === 'D') {
                                                                singleObj.visible = true
                                                                singleObj.enabled = false
                                                            } else {
                                                                if (resultAvvisi.P_MISURE !== null && resultAvvisi.P_MISURE !== undefined && resultAvvisi.P_MISURE === 'E') {
                                                                    singleObj.visible = true
                                                                    singleObj.enabled = true
                                                                } else {
                                                                    singleObj.visible = false
                                                                    singleObj.enabled = false
                                                                }
                                                            }
                                    
                                                            if (resultAvvisi.P_MISURE !== null && resultAvvisi.P_MISURE !== undefined && resultAvvisi.P_MISURE !== 'H') {
                                                                singlePos.CMI.results.push(singleObj)
                                                            }
                                                        }
                                                    }
                                    
                                                    // eslint-disable-next-line no-redeclare
                                                    for (var c = 0; c < t_VIQMMA.length; c++) {
                                                        if (t_VIQMMA[c].QMNUM === singlePos.QMNUM && t_VIQMMA[c].FENUM !== '0000' && t_VIQMMA[c].FENUM !== '' && t_VIQMMA[c].FENUM === singlePos.FENUM) {
                                                            var singleVIQMMA = t_VIQMMA[c]
                                                            singleVIQMMA.AKTYP = resultAvvisi.P_INTERVENTI // sovrascrivo quello che torna la bapi in base al customizing
                                                            singleObj = {}
                                                            singleObj.FENUM = singleVIQMMA.FENUM
                                                            singleObj.QMNUM = singleVIQMMA.QMNUM
                                                            singleObj.PROGRESSIVO = singleVIQMMA.MANUM
                                                            singleObj.TEXT = singleVIQMMA.MATXT
                                                            singleObj.LONG_TEXT = singleVIQMMA.MATXT_LONG
                                                            singleObj.AKTYP = singleVIQMMA.AKTYP
                                                            singleObj.TYPE = 'VIQMMA'
                                                            if (resultAvvisi.P_INTERVENTI !== null && resultAvvisi.P_INTERVENTI !== undefined && resultAvvisi.P_INTERVENTI === 'D') {
                                                                singleObj.visible = true
                                                                singleObj.enabled = false
                                                            } else {
                                                                if (resultAvvisi.P_INTERVENTI !== null && resultAvvisi.P_INTERVENTI !== undefined && resultAvvisi.P_INTERVENTI === 'E') {
                                                                    singleObj.visible = true
                                                                    singleObj.enabled = true
                                                                } else {
                                                                    singleObj.visible = false
                                                                    singleObj.enabled = false
                                                                }
                                                            }
                                    
                                                            if (resultAvvisi.P_INTERVENTI !== null && resultAvvisi.P_INTERVENTI !== undefined && resultAvvisi.P_INTERVENTI !== 'H') {
                                                                singlePos.CMI.results.push(singleObj)
                                                            }
                                                        }
                                                    }
                                    
                                                    POSITIONS.push(singlePos)
                                                }
                                            }
                                    
                                            // GESTIONE TESTATA
                                            if (ET_NOTIF_VIQMEL !== null && ET_NOTIF_VIQMEL !== undefined && ET_NOTIF_VIQMEL.length > 0) {
                                                    // eslint-disable-next-line no-redeclare
                                                    for (var i = 0; i < ET_NOTIF_VIQMEL.length; i++) {
                                                        var objectCopy = ET_NOTIF_VIQMEL[i]
                                                        objectCopy.P_DEFECTS = {
                                                            results: POSITIONS
                                                        }
                                    
                                                        objectCopy.T_VIQMFE = {}
                                                        objectCopy.T_VIQMSM = {}
                                                        objectCopy.T_VIQMMA = {}
                                                        objectCopy.T_VIQMUR = {}
                                    
                                                        var tVIQMFE = []
                                                        // eslint-disable-next-line no-redeclare
                                                        for (var j = 0; j < t_VIQMFE.length; j++) {
                                                            if (objectCopy.QMNUM === t_VIQMFE[j].QMNUM && (t_VIQMFE[j].FENUM === '0000' || t_VIQMFE[j].FENUM === '')) {
                                                                singleObj = t_VIQMFE[j]
                                                                singleObj.AKTYP = resultAvvisi.T_DIFETTI // sovrascrivo quello che torna la bapi in base al customizing
                                                                if (resultAvvisi.T_DIFETTI !== null && resultAvvisi.T_DIFETTI !== undefined && resultAvvisi.T_DIFETTI === 'D') {
                                                                    singleObj.visible = true
                                                                    singleObj.enabled = false
                                                                } else {
                                                                    if (resultAvvisi.T_DIFETTI !== null && resultAvvisi.T_DIFETTI !== undefined && resultAvvisi.T_DIFETTI === 'E') {
                                                                        singleObj.visible = true
                                                                        singleObj.enabled = true
                                                                    } else {
                                                                        singleObj.visible = false
                                                                        singleObj.enabled = false
                                                                    }
                                                                }
                                    
                                                                tVIQMFE.push(singleObj)
                                                            }
                                                        }
                                                        objectCopy.T_VIQMFE[results] = tVIQMFE
                                    
                                                        var tVIQMSM = []
                                                        // eslint-disable-next-line no-redeclare
                                                        for (var j = 0; j < t_VIQMSM.length; j++) {
                                                            if (objectCopy.QMNUM === t_VIQMSM[j].QMNUM && (t_VIQMSM[j].FENUM === '0000' || t_VIQMSM[j].FENUM === '')) {
                                                                singleObj = t_VIQMSM[j]
                                                                singleObj.AKTYP = resultAvvisi.T_MISURE // sovrascrivo quello che torna la bapi in base al customizing
                                                                if (resultAvvisi.T_MISURE !== null && resultAvvisi.T_MISURE !== undefined && resultAvvisi.T_MISURE === 'D') {
                                                                    singleObj.visible = true
                                                                    singleObj.enabled = false
                                                                } else {
                                                                    if (resultAvvisi.T_MISURE !== null && resultAvvisi.T_MISURE !== undefined && resultAvvisi.T_MISURE === 'E') {
                                                                        singleObj.visible = true
                                                                        singleObj.enabled = true
                                                                    } else {
                                                                        singleObj.visible = false
                                                                        singleObj.enabled = false
                                                                    }
                                                                }
                                    
                                                                tVIQMSM.push(singleObj)
                                                            }
                                                        }
                                                        objectCopy.T_VIQMSM[results] = tVIQMSM
                                    
                                                        var tVIQMMA = []
                                                        // eslint-disable-next-line no-redeclare
                                                        for (var j = 0; j < t_VIQMMA.length; j++) {
                                                            if (objectCopy.QMNUM === t_VIQMMA[j].QMNUM && (t_VIQMMA[j].FENUM === '0000' || t_VIQMMA[j].FENUM === '')) {
                                                                singleObj = t_VIQMMA[j]
                                                                singleObj.AKTYP = resultAvvisi.T_INTERVENTI // sovrascrivo quello che torna la bapi in base al customizing
                                                                if (resultAvvisi.T_INTERVENTI !== null && resultAvvisi.T_INTERVENTI !== undefined && resultAvvisi.T_INTERVENTI === 'D') {
                                                                    singleObj.visible = true
                                                                    singleObj.enabled = false
                                                                } else {
                                                                    if (resultAvvisi.T_INTERVENTI !== null && resultAvvisi.T_INTERVENTI !== undefined && resultAvvisi.T_INTERVENTI === 'E') {
                                                                        singleObj.visible = true
                                                                        singleObj.enabled = true
                                                                    } else {
                                                                        singleObj.visible = false
                                                                        singleObj.enabled = false
                                                                    }
                                                                }
                                    
                                                                tVIQMMA.push(singleObj)
                                                            }
                                                        }
                                                        objectCopy.T_VIQMMA[results] = tVIQMMA
                                    
                                                        var tVIQMUR = []
                                                        // eslint-disable-next-line no-redeclare
                                                        for (var j = 0; j < t_VIQMUR.length; j++) {
                                                            if (objectCopy.QMNUM === t_VIQMUR[j].QMNUM && (t_VIQMUR[j].FENUM === '0000' || t_VIQMUR[j].FENUM === '')) {
                                                                singleObj = t_VIQMUR[j]
                                                                singleObj.AKTYP = resultAvvisi.T_CAUSE // sovrascrivo quello che torna la bapi in base al customizing
                                                                if (resultAvvisi.T_CAUSE !== null && resultAvvisi.T_CAUSE !== undefined && resultAvvisi.T_CAUSE === 'D') {
                                                                    singleObj.visible = true
                                                                    singleObj.enabled = false
                                                                } else {
                                                                    if (resultAvvisi.T_CAUSE !== null && resultAvvisi.T_CAUSE !== undefined && resultAvvisi.T_CAUSE === 'E') {
                                                                        singleObj.visible = true
                                                                        singleObj.enabled = true
                                                                    } else {
                                                                        singleObj.visible = false
                                                                        singleObj.enabled = false
                                                                    }
                                                                }
                                    
                                                                tVIQMUR.push(singleObj)
                                                            }
                                                        }
                                                        objectCopy.T_VIQMUR[results] = tVIQMUR
                                    
                                                        t_VIQMEL = objectCopy
                                                    }
                                            }
                                    
                                            return res.status(200).send(t_VIQMEL)
                                        }
                                    })
                                })
                                }
                            })
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

    // Parse URL-encoded bodies (as sent by HTML forms)
    // app.use(express.urlencoded());

    // Parse JSON bodies (as sent by API clients)
    app.use(express.json())

    return app
}
