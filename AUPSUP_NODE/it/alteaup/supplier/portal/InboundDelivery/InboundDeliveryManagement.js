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
                // for (var i = 0; i < body.vbeln.length; i++) {
                oVbeln.push({ VBELN: body.vbeln })
                // }
                vbeln = oVbeln
            }
            if (body.verur !== null && body.verur !== undefined && body.verur.length > 0) {
                var oVerur = []
                oVerur.push({ VERUR: body.verur })
                verur = oVerur
            }
            if (body.vgbel !== null && body.vgbel !== undefined && body.vgbel.length > 0) {
                var oVgbel = []
                // eslint-disable-next-line no-redeclare
                for (var i = 0; i < body.vgbel.length; i++) {
                    oVgbel.push({ VGBEL: body.vgbel[i] })
                }
                vgbel = oVgbel
            }
            if (body.exdiv !== null && body.exdiv !== undefined && body.exdiv.length > 0) {
                var oExdiv = []
                // eslint-disable-next-line no-redeclare
                for (var i = 0; i < body.exdiv.length; i++) {
                    oExdiv.push({ EXIDV: body.exdiv[i] })
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
                ebeln.push({ EBELN: body.ebeln.trim() })
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
                    hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.InboundDelivery::MM00_INB_DLV_DOC_LIST', function (_err, sp) {
                        sp(userid, lifnr, ebeln, ekorg, matnr, werks, dateFrom, dateTo, (err, parameters, results) => {
                            if (err) {
                                console.error('ERROR: ' + err)
                                return res.status(500).send(stringifyObj(err))
                            } else {
                                var outArr = []
                                for (let index = 0; index < results.length; index++) {
                                    var element = results[index]
                                    var trovato = false
                                    for (let i = 0; i < outArr.length; i++) {
                                        var outElem = outArr[i]
                                        if (outElem.EBELN === element.EBELN && outElem.EBELP === element.EBELP && outElem.ETENR === element.ETENR && outElem.TYPE === element.TYPE) {
                                            trovato = true
                                            break
                                        }
                                    }
                                    if (!trovato) {
                                        outArr.push(element)
                                    }
                                }

                                var expArray = []
                                for (let index = 0; index < outArr.length; index++) {
                                    const element = outArr[index]
                                    for (let i = 0; i < outArr.length; i++) {
                                        var outElem = outArr[i]
                                        var trovatoC = false
                                        if (element.TYPE === 'S') {
                                            if (outElem.EBELN === element.EBELN && outElem.EBELP === element.EBELP && outElem.TYPE === 'C') {
                                                trovatoC = true
                                                break
                                            }
                                        } else {
                                            expArray.push(element)
                                            break
                                        }
                                    }
                                    if (!trovatoC) {
                                        expArray.push(element)
                                    }
                                }

                                var e = []
                                for (let index = 0; index < expArray.length; index++) {
                                    var element = expArray[index]
                                    var trovato = false
                                    for (let i = 0; i < e.length; i++) {
                                        var outElem = e[i]
                                        if (outElem.EBELN === element.EBELN && outElem.EBELP === element.EBELP && outElem.ETENR === element.ETENR && outElem.TYPE === element.TYPE) {
                                            trovato = true
                                            break
                                        }
                                    }
                                    if (!trovato) {
                                        e.push(element)
                                    }
                                }                                

                                return res.status(200).send({
                                    results: e
                                })
                            }
                        })
                    })
                }
            })
        }
    })

    // CREATE SCHEDULATIONS

    app.post('/CreateSchedulations', function (req, res) {
        const body = req.body

        console.log('INPUT BODY ==========> ' + JSON.stringify(body))

        if (body !== undefined && body !== '' && body !== null) {
            var it_hu_detail = []
            var it_hu_header = []
            var it_item = []
            var it_serial_no = []
            var lfart
            var verur
            var lfdat
            var wadat
            var btgew
            var gewei
            var volum
            var voleh
            var notes
            var lifnr = '' /* per invio mails */
            var userid = req.user.id

            it_hu_detail = body.it_hu_detail
            it_hu_header = body.it_hu_header
            it_item = body.it_item
            it_serial_no = body.it_serial_no

            lfart = body.lfart /* tipo consegna */
            verur = body.verur /* suddivisione consegna */
            lfdat = body.lfdat /* data consegna */
            wadat = body.wadat /* data movimento pianificato */
            btgew = body.btgew /* peso */
            gewei = body.gewei /* unità di misura */
            volum = body.volum /* volume */
            voleh = body.voleh /* unità di misura */
            notes = body.notes /* testo */
            if (body.lifnr !== null) {
                lifnr = body.lifnr /* fornitore */
            }

            hdbext.createConnection(req.tenantContainer, (err, client) => {
                if (err) {
                    return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
                } else {
                    hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.InboundDelivery::MM00_INB_DLV_CREATE', function (_err, sp) {
                        sp(userid, lifnr, lfart, verur, lfdat, wadat, btgew, gewei, volum, voleh, notes, it_hu_detail, it_hu_header, it_item, it_serial_no, (err, parameters, E_RETURN, E_VBELN) => {
                            if (err) {
                                console.error('ERROR: ' + err)
                                return res.status(500).send(stringifyObj(err))
                            } else {
                                if (E_RETURN !== undefined && E_RETURN.length > 0) {
                                    return res.status(200).send({
                                        results: E_RETURN
                                    })
                                } else {
                                    if (parameters.E_VBELN !== undefined && parameters.E_VBELN !== '') {
                                        return res.status(200).send({
                                            nInbound: parameters.E_VBELN
                                        })
                                    } else {
                                        return res.status(500).send({
                                            error: 'HANA - Inbound Delivery number not found'
                                        })
                                    }
                                }
                            }
                        })
                    })
                }
            })
        }
    })

    // GET DETTAGLIO SCHEDULAZIONE
    app.get('/GetSchedAndConf', function (req, res) {
        var ebeln = req.query.I_EBELN !== undefined && req.query.I_EBELN !== null && req.query.I_EBELN !== '' ? req.query.I_EBELN : ''
        var ebelp = req.query.I_EBELP !== undefined && req.query.I_EBELP !== null && req.query.I_EBELP !== '' ? req.query.I_EBELP : ''
        var userid = req.user.id

        hdbext.createConnection(req.tenantContainer, (err, client) => {
            if (err) {
                return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
            } else {
                hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.InboundDelivery::GetSchedAndConf', function (_err, sp) {
                    sp(userid, ebeln, ebelp, (err, parameters, T_EKEH, T_EKEK, T_EKES, T_EKET, T_EKKO, T_EKPO) => {
                        if (err) {
                            console.error('ERROR: ' + err)
                            return res.status(500).send(stringifyObj(err))
                        } else {
                            var results = {}
                            if (T_EKPO.length > 0) {
                                results = {
                                    EBELN: T_EKPO[0].EBELN,
                                    EBELP: T_EKPO[0].EBELP,
                                    MATNR: T_EKPO[0].MATNR,
                                    TXZ01: T_EKPO[0].TXZ01,
                                    IDNLF: T_EKPO[0].IDNLF,
                                    MENGE: T_EKPO[0].MENGE,
                                    PEINH: T_EKPO[0].PEINH,
                                    results: {
                                        POItemSchedulers: T_EKES,
                                        POItemConfirmations: T_EKET
                                    }
                                }
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

    // CREATE SCHEDULATIONS

    app.get('/GetHUPDF', function (req, res) {
        var userid = req.user.id
        var exidv = req.query.I_EXIDV
        var werks = req.query.I_WERKS

        console.log('INPUT exidv ==========> ' + JSON.stringify(exidv))

        hdbext.createConnection(req.tenantContainer, (err, client) => {
            if (err) {
                return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
            } else {
                hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.InboundDelivery::MM00_INB_DLV_GET_PRINT', function (_err, sp) {
                    sp(userid, exidv, werks, (err, parameters, results) => {
                        if (err) {
                            console.error('ERROR: ' + stringifyObj(err))
                            return res.status(500).send(stringifyObj(err))
                        } else {
                            if (parameters.STREAM !== undefined) {
                                res.setHeader('Content-Type', 'application/pdf')
                                res.contentType('application/pdf')
                                return res.status(200).send(parameters.STREAM)
                            } else {
                                return res.status(200).send({})
                            }
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
