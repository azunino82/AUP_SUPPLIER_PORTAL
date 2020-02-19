/* eslint-disable camelcase */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-useless-escape */
/* eslint-disable indent */

'use strict'
var express = require('express')
var stringifyObj = require('stringify-object')
var hdbext = require('@sap/hdbext')

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
                sp(userid, qmnum, qmart, mawerk, lifnum, matnr, idnlf, spras, ernam, (err, parameters, results) => {
                if (err) {
                    console.error('ERROR: ' + err)
                    return res.status(500).send(stringifyObj(err))
                } else {
                    var t_VIQMEL = []
                    var t_VIQMFE = []
                    var t_VIQMUR = []
                    var t_VIQMSM = []
                    var t_VIQMMA = []
                
                    if (results !== null && results !== undefined && results.ET_NOTIF_VIQMEL !== null && results.ET_NOTIF_VIQMEL !== undefined) {
                        var listHeaders = results.ET_NOTIF_VIQMEL
                        if (listHeaders !== null && listHeaders.length > 0) {
                            for (var i = 0; i < listHeaders.length; i++) {
                                var objectCopy = JSON.parse(JSON.stringify(results.ET_NOTIF_VIQMEL[listHeaders[i]]))
                                objectCopy.t_VIQMFE = { results: [] }
                                objectCopy.t_VIQMUR = { results: [] }
                                objectCopy.t_VIQMSM = { results: [] }
                                objectCopy.t_VIQMMA = { results: [] }
                        
                                t_VIQMEL.push(objectCopy)
                            }
                        }
                    }
    
                    if (results !== null && results !== undefined && results.ET_NOTIF_VIQMFE !== null && results.ET_NOTIF_VIQMFE !== undefined) {
                        var listVIQMFE = results.ET_NOTIF_VIQMFE
                        if (listVIQMFE !== null && listVIQMFE.length > 0) {
                            // eslint-disable-next-line no-redeclare
                            for (var i = 0; i < listVIQMFE.length; i++) {
                                t_VIQMFE.push(results.ET_NOTIF_VIQMFE[listVIQMFE[i]])
                            }
                        }
                    }
                    
                    if (results != null && results !== undefined && results.ET_NOTIF_VIQMSM !== null && results.ET_NOTIF_VIQMSM !== undefined) {
                        var listVIQMSM = results.ET_NOTIF_VIQMSM
                        if (listVIQMSM !== null && listVIQMSM.length > 0) {
                            // eslint-disable-next-line no-redeclare
                            for (var i = 0; i < listVIQMSM.length; i++) {
                                t_VIQMSM.push(results.ET_NOTIF_VIQMSM[listVIQMSM[i]])
                            }
                        }
                    }
                    
                    if (results !== null && results !== undefined && results.ET_NOTIF_VIQMMA !== null && results.ET_NOTIF_VIQMMA !== undefined) {
                        var listVIQMMA = results.ET_NOTIF_VIQMMA
                        if (listVIQMMA !== null && listVIQMMA.length > 0) {
                            // eslint-disable-next-line no-redeclare
                            for (var i = 0; i < listVIQMMA.length; i++) {
                                t_VIQMMA.push(results.ET_NOTIF_VIQMMA[listVIQMMA[i]])
                            }
                        }
                    }

                    if (results !== null && results !== undefined && results.ET_NOTIF_VIQMUR !== null && results.ET_NOTIF_VIQMUR !== undefined) {
                        var listVIQMUR = results.ET_NOTIF_VIQMUR
                        if (listVIQMUR !== null && listVIQMUR.length > 0) {
                            // eslint-disable-next-line no-redeclare
                            for (var i = 0; i < listVIQMUR.length; i++) {
                                t_VIQMUR.push(results.ET_NOTIF_VIQMUR[listVIQMUR[i]])
                            }
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

                    results = { results: t_VIQMEL }
                    
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

    // Parse URL-encoded bodies (as sent by HTML forms)
    // app.use(express.urlencoded());

    // Parse JSON bodies (as sent by API clients)
    app.use(express.json())

    return app
}
