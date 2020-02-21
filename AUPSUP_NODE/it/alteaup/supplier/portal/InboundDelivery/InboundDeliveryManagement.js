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
    app.post('/GetInboundList', function (req, res) {
        const body = req.body

        console.log('INPUT BODY ==========> ' + JSON.stringify(body))

        if (body !== undefined && body !== '' && body !== null) {
        var vbeln = []
        var lifnr = []
        var verur = []
        var matnr = []
        var vgbel = []
        var exdiv = []
        var lfDateFrom = ''
        var lfDateTo = ''
        var waDateFrom = ''
        var waDateTo = ''
        var userid = req.user.id
        
        if (body.lfDateFrom != null && body.lfDateFrom !== undefined && body.lfDateFrom !== '') {
            lfDateFrom = body.lfDateFrom
        }
        if (body.lfDateTo != null && body.lfDateTo !== undefined && body.lfDateTo !== '') {
            lfDateTo = body.lfDateTo
        }
        if (body.waDateFrom != null && body.waDateFrom !== undefined && body.waDateFrom !== '') {
            waDateFrom = body.waDateFrom
        }
        if (body.waDateTo != null && body.waDateTo !== undefined && body.waDateTo !== '') {
            waDateTo = body.waDateTo
        }
        if (body.vbeln !== null && body.vbeln !== undefined && body.vbeln.length > 0) {
            var oVbeln = []
            for (var i = 0; i < body.vbeln.length; i++) {
                oVbeln.push({ LIFNR: body.vbeln[i] })
            }
            vbeln = oVbeln
        }      
        if (body.verur !== null && body.verur !== undefined && body.verur.length > 0) {
            var oVerur = []
            // eslint-disable-next-line no-redeclare
            for (var i = 0; i < body.verur.length; i++) {
                oVerur.push({ LIFNR: body.verur[i] })
            }
            verur = oVerur
        }        
        if (body.vgbel !== null && body.vgbel !== undefined && body.vgbel.length > 0) {
            var oVgbel = []
            // eslint-disable-next-line no-redeclare
            for (var i = 0; i < body.vgbel.length; i++) {
                oVgbel.push({ LIFNR: body.vgbel[i] })
            }
            vgbel = oVgbel
        }
        if (body.exdiv !== null && body.exdiv !== undefined && body.exdiv.length > 0) {
            var oExdiv = []
            // eslint-disable-next-line no-redeclare
            for (var i = 0; i < body.exdiv.length; i++) {
                oExdiv.push({ LIFNR: body.exdiv[i] })
            }
            exdiv = oExdiv
        }        
        if (body.lifnr != null && body.lifnr !== undefined && body.lifnr !== '') {
            var oLifnr = []
            // eslint-disable-next-line no-redeclare
            for (var i = 0; i < body.lifnr.length; i++) {
                oLifnr.push({ LIFNR: body.lifnr[i] })
            }
            lifnr = oLifnr
        }
        if (body.matnr != null && body.matnr !== undefined && body.matnr.length > 0) {
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
            hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.InboundDelivery::MM00_INB_DLV_LIST', function (_err, sp) {
                sp(userid, exdiv, lifnr, matnr, vbeln, verur, vgbel, lfDateFrom, lfDateTo, waDateFrom, waDateTo, (err, parameters, results) => {
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

    // GET SCHEDULATIONS

    app.post('/GetSchedulations', function (req, res) {
        const body = req.body

        console.log('INPUT BODY ==========> ' + JSON.stringify(body))

        if (body !== undefined && body !== '' && body !== null) {
        var lifnr = []
        var ebeln = []
        var ekorg = []
        var matnr = []
        var werks = []
        var dateFrom = ''
        var dateTo = ''
        var userid = req.user.id
        
        if (body.dateFrom !== null && body.dateFrom !== undefined && body.dateFrom !== '') {
            dateFrom = body.dateFrom
        }
        
        if (body.dateTo != null && body.dateTo !== undefined && body.dateTo !== '') {
            dateTo = body.dateTo
        }
    
        if (body.lifnr != null && body.lifnr !== undefined && body.lifnr !== '') {
            var oLifnr = []
            for (var i = 0; i < body.lifnr.length; i++) {
                oLifnr.push({ ELIFN: body.lifnr[i] })
            }
            lifnr = oLifnr
        }
        if (body.ebeln !== null && body.ebeln !== '' && body.ebeln !== undefined) {
            ebeln.push({ ebeln: body.ebeln })
        }
        if (body.ekorg !== null && body.ekorg !== undefined && body.ekorg.length > 0) {
            var oEkorg = []
            // eslint-disable-next-line no-redeclare
            for (var i = 0; i < body.ekorg.length; i++) {
                oEkorg.push({ EKORG: body.ekorg[i] })
            }
            ekorg = oEkorg
        }
        if (body.matnr != null && body.matnr.length > 0) {
            var oMatnr = []
            // eslint-disable-next-line no-redeclare
            for (var i = 0; i < body.matnr.length; i++) {
                oMatnr.push({ MATNR: body.matnr[i] })
            }
            matnr = oMatnr
        }
        if (body.werks != null && body.werks.length > 0) {
            var oWerks = []
            // eslint-disable-next-line no-redeclare
            for (var i = 0; i < body.werks.length; i++) {
                oWerks.push({ EWERK: body.werks[i], DESCR: '' })
            }
            werks = oWerks
        }

        hdbext.createConnection(req.tenantContainer, (err, client) => {
            if (err) {
            return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
            } else {
            hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.InboundDelivery::MM00_INB_DLV_LIST', function (_err, sp) {
                sp(userid, lifnr, ebeln, ekorg, matnr, werks, dateFrom, dateTo, (err, parameters, results) => {
                if (err) {
                    console.error('ERROR: ' + err)
                    return res.status(500).send(stringifyObj(err))
                } else {
                    var outResults = []
                    if (results !== null && results !== undefined && results.length > 0) {
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].QUANT_SCHED !== 0) {
                                outResults.push(results[i])
                            }
                        }
                    }
                    return res.status(200).send({
                        results: outResults
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
