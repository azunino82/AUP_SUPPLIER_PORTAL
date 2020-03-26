/* eslint-disable no-redeclare */
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
    
    // GET PURCHASE ORDS
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
            var bstyp = []
            var userid = req.user.id

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

            if (body.ebeln !== null && body.ebeln !== undefined && body.ebeln !== '') {
                ebeln.push({
                    EBELN: body.ebeln
                })
            }
            if (body.ebelp !== null && body.ebelp !== undefined && body.ebelp !== '') {
                ebelp.push({
                    EBELP: body.ebelp
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
                        if (_err) {
                            console.log('---->>> CLIENT END ERR MM00_SAG_DOC_LIST <<<<<-----')
                        }
                        sp(userid, lifnr, ebeln, ebelp, ekorg, matnr, ekgrp, werks, bstyp, (err, parameters, ET_SAG_EKEH, ET_SAG_EKEK, ET_SAG_EKES, ET_SAG_EKET, ET_SAG_EKKO, ET_SAG_EKPO, OUT_POS_ORDERS) => {
                            console.log('---->>> CLIENT END MM00_SAG_DOC_LIST <<<<<-----')
                            client.close()
                            if (err) {
                                console.error('ERROR: ' + err)
                                return res.status(500).send(stringifyObj(err))
                            } else {
                                var t_ekpo = []
                                var t_ekes = []
                                var t_eket = []
                                var t_ekeh = []
                                var t_ekek = []
                                console.log('OUT_POS_ORDERS: ' + stringifyObj(err))
                                if (OUT_POS_ORDERS !== undefined && OUT_POS_ORDERS !== null && OUT_POS_ORDERS.length > 0) {
                                    for (var i = 0; i < OUT_POS_ORDERS.length; i++) {
                                        var objectCopy = OUT_POS_ORDERS[i]
                                        console.log('SKIP_NO_CONFERME: ' + objectCopy.SKIP_NO_CONFERME)
                                        if (objectCopy.SKIP_NO_CONFERME !== null) {
                                            if (objectCopy.SKIP_NO_CONFERME === 'X') {
                                                objectCopy.SKIP_NO_CONFERME = true
                                            }
                                            objectCopy.PRIMO_PERIODO = 100
                                        } else {
                                            if (objectCopy.P1_PROGR_RIC !== null) {
                                                console.log('LS P1_PROGR_RIC: ' + objectCopy.P1_PROGR_RIC)
                                                objectCopy.PRIMO_PERIODO = parseFloat(objectCopy.P1_PROGR_RIC) > 0 ? ((parseFloat(objectCopy.P1_PROGR_CONF) / parseFloat(objectCopy.P1_PROGR_RIC)) * 100).toFixed(2) : 0
                                            } else {
                                                objectCopy.PRIMO_PERIODO = 0
                                            }
                                        }
                                        if (objectCopy.SKIP_NO_CONFERME !== null) {
                                            objectCopy.SECONDO_PERIODO = 100
                                        } else {
                                            if (objectCopy.P2_PROGR_RIC !== null) {
                                                console.log('LS P1_PROGR_RIC: ' + objectCopy.P2_PROGR_RIC)
                                                objectCopy.SECONDO_PERIODO = parseFloat(objectCopy.P2_PROGR_RIC) > 0 ? ((parseFloat(objectCopy.P2_PROGR_CONF) / parseFloat(objectCopy.P2_PROGR_RIC)) * 100).toFixed(2) : 0
                                            } else {
                                                objectCopy.SECONDO_PERIODO = 0
                                            }
                                        }
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
                                                    objectCopy.WAERS = objectCopyEkko.WAERS
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
                                        t_ekpo[i].POItemSchedulers.results = tEkes

                                        var tEket = []
                                        // eslint-disable-next-line no-redeclare
                                        for (var j = 0; j < t_eket.length; j++) {
                                            if (t_eket[j].EBELN === t_ekpo[i].EBELN && t_eket[j].EBELP === t_ekpo[i].EBELP) {
                                                tEket.push(t_eket[j])
                                            }
                                        }
                                        t_ekpo[i].POItemConfirmations.results = tEket

                                        var tEkeh = []
                                        // eslint-disable-next-line no-redeclare
                                        for (var j = 0; j < t_ekeh.length; j++) {
                                            if (t_ekeh[j].EBELN === t_ekpo[i].EBELN && t_ekeh[j].EBELP === t_ekpo[i].EBELP) {
                                                tEkeh.push(t_ekeh[j])
                                            }
                                        }
                                        t_ekpo[i].POItemEkeh.results = tEkeh

                                        var tEkek = []
                                        // eslint-disable-next-line no-redeclare
                                        for (var j = 0; j < t_ekek.length; j++) {
                                            if (t_ekek[j].EBELN === t_ekpo[i].EBELN && t_ekek[j].EBELP === t_ekpo[i].EBELP) {
                                                tEkek.push(t_ekek[j])
                                            }
                                        }
                                        t_ekpo[i].POItemEkek.results = tEkek
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

     /* GET PURCHASE ORDERS
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

    */

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
