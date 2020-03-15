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

    // GET PURCHASE ORDERS
    app.post('/GetOrders', function (req, res) {
        const body = req.body

        console.log('INPUT BODY ==========> ' + JSON.stringify(body))

        if (body !== undefined && body !== '' && body !== null) {
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
                    hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.SchedulingAgreement::MM00_PURDOC_LIST', function (_err, sp) {
                        if (_err) {
                            console.log('---->>> CLIENT END ERR MM00_PURDOC_LIST <<<<<-----')
                        }
                        sp(userid, 'ODA', 'F', lifnr, ebeln, ekorg, matnr, ekgrp, werks, (err, parameters, ET_EKKO) => {
                            console.log('---->>> CLIENT END MM00_PURDOC_LIST <<<<<-----')
                            client.close()
                            if (err) {
                                console.error('ERROR: ' + err)
                                return res.status(500).send(stringifyObj(err))
                            } else {
                                return res.status(200).send({
                                    results: ET_EKKO
                                })
                            }
                        })
                    })
                }
            })
        }
    })

    // CREATE CONFIRM ORD
    app.post('/ConfirmOrders', function (req, res) {
        const body = req.body
        req.setTimeout(60000)
        res.setTimeout(60000)
        console.log('INPUT BODY ==========> ' + JSON.stringify(body))

        if (body !== undefined && body !== '' && body !== null) {
            var ekko = []
            var ekpo = []
            var ekes = []
            var skipAppBuyer = []
            var userid = req.user.id

            if (body.ekko !== null && body.ekko !== undefined && body.ekko.length > 0) {
                ekko = body.ekko
            }
            if (body.ekpo !== null && body.ekpo !== undefined && body.ekpo.length > 0) {
                ekpo = body.ekpo
            }
            if (body.ekes !== null && body.ekes !== undefined && body.ekes.length > 0) {
                ekes = body.ekes
            }
            if (body.skipAppBuyer !== null && body.skipAppBuyer !== undefined && body.skipAppBuyer.length > 0) {
                skipAppBuyer = body.skipAppBuyer
            }
            /* if (body.notaReject !== null && body.notaReject !== undefined && body.notaReject !== '') {
                notaReject = body.notaReject
            }
             if (body.confirmType !== null && body.confirmType !== undefined && body.confirmType !== '') {
                var oConfType = []
                for (var i = 0; i < body.confirmType.length; i++) {
                    oConfType.push({
                        EBELN: body.lifnr[i].EBELN,
                        EBELP: body.lifnr[i].EBELP,
                        CONF_TYPE: body.lifnr[i].CONF_TYPE
                    })
                }
                confirmTypes = oConfType
            } */           

            hdbext.createConnection(req.tenantContainer, (err, client) => {
                if (err) {
                    console.error('ERROR CONNECTION ConfirmOrders:' + stringifyObj(err))
                    return res.status(500).send('CREATE CONNECTION ERROR ConfirmOrders: ' + stringifyObj(err))
                } else {
                    hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Orders::MM00_CONFIRM_ORD', function (_err, sp) {
                        if (_err) {
                            console.error('ERROR loadProcedure ConfirmOrders: ' + stringifyObj(_err))
                            client.close()
                            return res.status(500).send(stringifyObj(_err))
                        }
                        sp(userid, ekko, ekpo, ekes, skipAppBuyer, (err, parameters, results) => {
                            console.log('---->>> CLIENT END ConfirmOrders <<<<<-----')
                            client.close()
                            if (err) {
                                console.error('ERROR ConfirmOrders SP: ' + stringifyObj(err))
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

// APPROVA RIFIUTA IN BASE AL TIPO ORDINE O PIANO CONSEGNA
app.post('/ConfirmReject', function (req, res) {
    const body = req.body
    req.setTimeout(60000)
    res.setTimeout(60000)
    console.log('INPUT BODY ==========> ' + JSON.stringify(body))
    var notaReject = ''
    var userid = req.user.id
    var confirmTypes = []
    var tipoOperazione = ''

    if (body !== undefined && body !== '' && body !== null) {       
        if (body.notaReject !== null && body.notaReject !== undefined && body.notaReject !== '') {
            notaReject = body.notaReject
        }
         if (body.confirmType !== null && body.confirmType !== undefined && body.confirmType !== '') {
            var oConfType = []
            for (var i = 0; i < body.confirmType.length; i++) {
                oConfType.push({
                    EBELN: body.confirmType[i].EBELN,
                    EBELP: body.confirmType[i].EBELP,
                    XBLNR: body.confirmType[i].XBLNR,
                    CONF_TYPE: body.confirmType[i].CONF_TYPE,
                    BSTYP: body.confirmType[i].BSTYP
                })
            }
            confirmTypes = oConfType
        }      
        if (body.tipoOperazione !== null && body.tipoOperazione !== undefined && body.tipoOperazione !== '') {
            tipoOperazione = body.tipoOperazione
        }          

        hdbext.createConnection(req.tenantContainer, (err, client) => {
            if (err) {
                console.error('ERROR CONNECTION ConfirmReject:' + stringifyObj(err))
                return res.status(500).send('CREATE CONNECTION ERROR ConfirmReject: ' + stringifyObj(err))
            } else {
                hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Orders::ConfirmReject', function (_err, sp) {
                    if (_err) {
                        console.error('ERROR loadProcedure ConfirmReject: ' + stringifyObj(_err))
                        client.close()
                        return res.status(500).send(stringifyObj(_err))
                    }
                    sp(userid, confirmTypes, tipoOperazione, notaReject, (err, parameters, results) => {
                        console.log('---->>> CLIENT END ConfirmReject <<<<<-----')
                        client.close()
                        if (err) {
                            console.error('ERROR ConfirmReject SP: ' + stringifyObj(err))
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

    return app
}
