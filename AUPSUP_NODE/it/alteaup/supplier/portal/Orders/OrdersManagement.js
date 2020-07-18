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
            var spras = 'I'
            var userid = req.user.id
            var ebtyp = 'AB'
            var eindtFrom = ''
            var eindtTo = ''

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

            if (body.eindtFrom !== null && body.eindtFrom !== undefined && body.eindtFrom !== '') {
                eindtFrom = body.eindtFrom
            }

            if (body.eindtTo !== null && body.eindtTo !== undefined && body.eindtTo !== '') {
                eindtTo = body.eindtTo
            }            

            if (body.spras !== null && body.spras !== undefined && body.spras !== '') {
                spras = body.spras
            }

            if (body.ebtyp !== null && body.ebtyp !== undefined && body.ebtyp !== '') {
                ebtyp = body.ebtyp
            }

            if (body.ebeln !== null && body.ebeln !== undefined && body.ebeln !== '') {
                ebeln.push({
                    EBELN: body.ebeln.trim()
                })
            }
            if (body.ebelp !== null && body.ebelp !== undefined && body.ebelp !== '') {
                ebelp.push({
                    EBELP: body.ebelp.trim()
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
                        sp(userid, lifnr, ebeln, ebelp, ekorg, matnr, ekgrp, werks, bstyp, spras, ebtyp, 'ODA', eindtFrom, eindtTo, (err, parameters, ET_SAG_EKEH, ET_SAG_EKEK, ET_SAG_EKES, ET_SAG_EKET, ET_SAG_EKKO, ET_SAG_EKPO, OUT_POS_ORDERS) => {
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

                                        switch (objectCopy.STATUS) {
                                            case 'H':
                                                objectCopy.STATUS_PRIORITY = 0
                                                break

                                            case 'MH':
                                                objectCopy.STATUS_PRIORITY = 1
                                                break

                                            case 'M':
                                                objectCopy.STATUS_PRIORITY = 2
                                                break

                                            case 'ML':
                                                objectCopy.STATUS_PRIORITY = 3
                                                break

                                            case 'L':
                                                objectCopy.STATUS_PRIORITY = 4
                                                break

                                            default:
                                                objectCopy.STATUS_PRIORITY = 999
                                                break
                                        }

                                        if (objectCopy.BSTAE === '' || objectCopy.BSTAE === null) {
                                            objectCopy.STATUS_PRIORITY = null
                                            objectCopy.STATUS = ''
                                        }

                                        //        console.log('SKIP_NO_CONFERME: ' + objectCopy.SKIP_NO_CONFERME)
                                        if (objectCopy.SKIP_NO_CONFERME !== null) {
                                            if (objectCopy.SKIP_NO_CONFERME === 'X') {
                                                objectCopy.SKIP_NO_CONFERME = true
                                            }
                                            objectCopy.PRIMO_PERIODO = '?'
                                        } else {
                                            if (objectCopy.P1_PROGR_RIC !== null) {
                                                //              console.log('LS P1_PROGR_RIC: ' + objectCopy.P1_PROGR_RIC)
                                                objectCopy.PRIMO_PERIODO = parseFloat(objectCopy.P1_PROGR_RIC) > 0 ? ((parseFloat(objectCopy.P1_PROGR_CONF) / parseFloat(objectCopy.P1_PROGR_RIC)) * 100).toFixed(2) : 0
                                            } else {
                                                objectCopy.PRIMO_PERIODO = 0
                                            }
                                        }
                                        if (objectCopy.SKIP_NO_CONFERME !== null) {
                                            objectCopy.SECONDO_PERIODO = '?'
                                        } else {
                                            if (objectCopy.P2_PROGR_RIC !== null) {
                                                //            console.log('LS P1_PROGR_RIC: ' + objectCopy.P2_PROGR_RIC)
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
            var t_herder_comment = []
            var t_position_comment = []
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
            if (body.t_herder_comment !== null && body.t_herder_comment !== undefined && body.t_herder_comment.length > 0) {
                t_herder_comment = body.t_herder_comment
            }
            if (body.t_position_comment !== null && body.t_position_comment !== undefined && body.t_position_comment.length > 0) {
                t_position_comment = body.t_position_comment
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
                        sp(userid, ekko, ekpo, ekes, skipAppBuyer, t_herder_comment, t_position_comment, (err, parameters, results) => {
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
        var tipoOperazione = '' // -- QUA o PRZ

        var mailArr = []

        if (body !== undefined && body !== '' && body !== null) {
            if (body.notaReject !== null && body.notaReject !== undefined && body.notaReject !== '') {
                notaReject = body.notaReject
            }

            if (body.tipoOperazione !== null && body.tipoOperazione !== undefined && body.tipoOperazione !== '') {
                tipoOperazione = body.tipoOperazione
            }

            if (body.confirmType !== null && body.confirmType !== undefined && body.confirmType !== '') {
                var oConfType = []
                for (var i = 0; i < body.confirmType.length; i++) {
                    oConfType.push({
                        EBELN: body.confirmType[i].EBELN,
                        EBELP: body.confirmType[i].EBELP,
                        XBLNR: body.confirmType[i].XBLNR,
                        CONF_TYPE: body.confirmType[i].CONF_TYPE,
                        BSTYP: body.confirmType[i].BSTYP,
                        COUNTER: body.confirmType[i].COUNTER
                    })
                }
                confirmTypes = oConfType

                // generazione per mail price
                for (var i = 0; i < body.confirmType.length; i++) {
                    var EVENT = body.confirmType[i].CONF_TYPE === 'A' ? 'CAC' : body.confirmType[i].CONF_TYPE === 'R' ? 'CRI' : ''
                    var APPLICAZIONE = body.confirmType[i].BSTYP === 'F' ? tipoOperazione === 'PRZ' ? 'RMO_PRZ' : tipoOperazione === 'QUA' ? 'RMO_QUA' : '' : body.confirmType[i].BSTYP === 'L' ? tipoOperazione === 'PRZ' ? 'P_CONS_PRZ' : tipoOperazione === 'QUA' ? 'P_CONS_QUA' : '' : ''

                    var trovato = false
                    for (let index = 0; index < mailArr.length; index++) {
                        var element = mailArr[index]
                        if (element.EBELN === body.confirmType[i].EBELN && element.EBELP === body.confirmType[i].EBELP && element.EVENT === EVENT && element.APPLICAZIONE === APPLICAZIONE && body.confirmType[i].LIFNR === element.LIFNR) {
                            trovato = true
                            var trovatoInList = false
                            for (let j = 0; j < element.LIST_XBLNR.length; j++) {
                                var el = element.LIST_XBLNR[j]
                                if (el.XBLNR === body.confirmType[i].XBLNR && el.COUNTER === body.confirmType[i].COUNTER) {
                                    trovatoInList = true
                                    break
                                }
                            }
                            if (!trovatoInList) {
                                if (element.LIST_XBLNR === undefined) {
                                    element.LIST_XBLNR = []
                                }
                                element.LIST_XBLNR.push({ XBLNR: body.confirmType[i].XBLNR, EINDT: body.confirmType[i].EINDT, MENGE: body.confirmType[i].MENGE, COUNTER: body.confirmType[i].COUNTER })
                            }
                            break
                        }
                    }

                    if (!trovato) {
                        var listaXBLNR = [{ XBLNR: body.confirmType[i].XBLNR, EINDT: body.confirmType[i].EINDT, MENGE: body.confirmType[i].MENGE, COUNTER: body.confirmType[i].COUNTER }]
                        mailArr.push({
                            EBELN: body.confirmType[i].EBELN,
                            EBELP: body.confirmType[i].EBELP,
                            LIST_XBLNR: listaXBLNR,
                            BSTYP: body.confirmType[i].BSTYP,
                            LIFNR: body.confirmType[i].LIFNR,
                            MATNR: body.confirmType[i].MATNR,
                            NETPR: body.confirmType[i].NETPR,
                            PEINH: body.confirmType[i].PEINH,
                            MENGE: body.confirmType[i].MENGE,
                            ZINVALIDITA: body.confirmType[i].ZINVALIDITA,
                            ZFINVALIDATA: body.confirmType[i].ZFINVALIDATA,
                            EVENT: EVENT,
                            APPLICAZIONE: APPLICAZIONE,
                            CONF_TYPE: body.confirmType[i].CONF_TYPE
                        })
                    }
                }

                /* return res.status(200).send({
                    mailArr: mailArr
                }) */

                console.log('mailArr ' + stringifyObj(mailArr))
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
                                    var trovatoErrore = false
                                    if (results && results.length > 0) {
                                        results.forEach(element => {
                                            if (element.MSGTY === 'E') {
                                                trovatoErrore = true
                                            }
                                        })
                                    }
                                    if (!trovatoErrore) {
                                        sendMail(req, res, mailArr, notaReject)
                                    }

                                    return res.status(200).send({
                                        results: results
                                    })
                                }
                            })
                        })
                    }
                })
            }
        }
    })

    function sendMail (req, res, confirms, notaReject) {
        var lifnrs = '('
        for (let index = 0; index < confirms.length; index++) {
            var element = confirms[index]
            if (lifnrs.indexOf(element.LIFNR) < 0) {
                lifnrs = lifnrs + '\'' + element.LIFNR + '\','
            }
        }
        lifnrs = lifnrs + ')'
        lifnrs = lifnrs.replace(',)', ')')
        console.log('LIFNR ' + lifnrs)

        confirms.forEach(element => {
            var sql = 'SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_NOTIF_MASTER\" WHERE APPLICAZIONE = \'' + element.APPLICAZIONE + '\' and EVENTO = \'' + element.EVENT + '\''
            console.log('sql T_NOTIF_MASTER' + sql)
            hdbext.createConnection(req.tenantContainer, function (error, client) {
                if (error) {
                    console.error('ERROR T_NOTIF_MASTER :' + stringifyObj(error))
                    client.close()
                    //   return res.status(500).send('T_NOTIF_MASTER CONNECTION 1 ERROR: ' + stringifyObj(error))
                } else {
                    client.exec(sql, function (error, results) {
                        console.log('RESULTS T_NOTIF_MASTER: ' + stringifyObj(results))
                        if (error) {
                            console.err('Error during direct statement execution T_NOTIF_MASTER: ' + error)
                            client.close()
                            //   return res.status(500).send('T_NOTIF_MASTER CONNECTION 2 ERROR: ' + stringifyObj(error))
                        } else {
                            /* if (results && results[0]) {
                                 var flusso = results[0].FLUSSO
                                 var tipoStruttura = results[0].TIPO_STRUTTURA
                                 var applicazione = results[0].APPLICAZIONE
                                 var evento = results[0].EVENTO
                                 var direzione = results[0].DIREZIONE
                             } */

                            sql = 'SELECT METAID FROM \"AUPSUP_DATABASE.data.tables::T_METAID_FORN\" WHERE LIFNR IN ' + lifnrs
                            console.log('sql lista metafornitori: ' + sql)
                            client.exec(sql, function (error, results) {
                                if (error) {
                                    console.error('Error during direct statement execution T_METAID_FORN: ' + stringifyObj(error))
                                    client.close()
                                    //  return res.status(500).send('T_NOTIF_MASTER T_METAID_FORN 2 ERROR: ' + stringifyObj(error))
                                } else {
                                    console.log('RESULTS T_METAID_FORN: ' + stringifyObj(results))
                                    var listMETAIDS = '('
                                    for (let index = 0; index < results.length; index++) {
                                        var elemMETAID = results[index]
                                        if (listMETAIDS.indexOf(elemMETAID.METAID) < 0) {
                                            listMETAIDS = listMETAIDS + '\'' + elemMETAID.METAID + '\','
                                        }
                                    }
                                    listMETAIDS = listMETAIDS + ')'
                                    listMETAIDS = listMETAIDS.replace(',)', ')')
                                    console.log('listMETAIDS: ' + listMETAIDS)
                                    // FLUSSO PROC
                                    sql = 'SELECT MAIL AS RECEIVER,\'U\' as REC_TYPE,null as REC_ID,null as REPLY_DOC,null as REC_DATE,null as PROXY_ID,null as RETRN_CODE,null as EXPRESS,null as COPY,null as BLIND_COPY,null as NO_FORWARD,null as NO_PRINT,null as TO_ANSWER,null as TO_DO_EXPL,null as TO_DO_GRP,null as COM_TYPE,null as LFDNR,null as FAX,null as COUNTRY,null as SPOOL_ID,null as NOTIF_DEL,null as NOTIF_READ,null as NOTIF_NDEL,null as SAP_BODY FROM "AUPSUP_DATABASE.data.tables::T_METASUPPLIER_CONTACTS" WHERE METAID IN ' + listMETAIDS + ' AND TIPOLOGIA = \'02\''
                                    console.log('sql MAIL: ' + sql)
                                    client.exec(sql, function (error, results) {
                                        console.log('LISTA MAIL: ' + stringifyObj(results))
                                        if (error) {
                                            console.error('Error during direct statement execution T_METASUPPLIER_CONTACTS: ' + error)
                                            client.close()
                                            //  return res.status(500).send('T_NOTIF_MASTER T_METASUPPLIER_CONTACTS ERROR: ' + stringifyObj(error))
                                        } else {
                                            var emailList = results

                                            var cc = {
                                                RECEIVER: req.user.id,
                                                REC_TYPE: 'U',
                                                REC_ID: null,
                                                REPLY_DOC: null,
                                                REC_DATE: null,
                                                PROXY_ID: null,
                                                RETRN_CODE: null,
                                                EXPRESS: null,
                                                COPY: 'X', // CC
                                                BLIND_COPY: null,
                                                NO_FORWARD: null,
                                                NO_PRINT: null,
                                                TO_ANSWER: null,
                                                TO_DO_EXPL: null,
                                                TO_DO_GRP: null,
                                                COM_TYPE: null,
                                                LFDNR: null,
                                                FAX: null,
                                                COUNTRY: null,
                                                SPOOL_ID: null,
                                                NOTIF_DEL: null,
                                                NOTIF_READ: null,
                                                NOTIF_NDEL: null,
                                                SAP_BODY: null
                                            }

                                            emailList.push(cc)

                                            sql = 'SELECT (SELECT TEXT FROM \"AUPSUP_DATABASE.data.tables::T_NOTIF_TEXT\" WHERE TEXT_TYPE = \'MAIL_BODY\' AND' +
                                                ' EVENT = \'' + element.EVENT + '\' AND APP = \'' + element.APPLICAZIONE + '\') AS BODY, (SELECT TEXT FROM \"AUPSUP_DATABASE.data.tables::T_NOTIF_TEXT\" WHERE ' +
                                                'TEXT_TYPE = \'MAIL_SUBJ\' AND EVENT = \'' + element.EVENT + '\' AND APP = \'' + element.APPLICAZIONE + '\') AS SUBJ FROM \"AUPSUP_DATABASE.data.synonyms::DUMMY\"'
                                            console.log('sql T_NOTIF_TEXT: ' + sql)
                                            client.exec(sql, function (error, results) {
                                                console.log('RESULTS T_NOTIF_TEXT: ' + stringifyObj(results))
                                                if (error) {
                                                    console.error('Error during direct statement execution T_NOTIF_TEXT: ' + error)
                                                    client.close()
                                                    //  return res.status(500).send('T_NOTIF_TEXT ERROR: ' + stringifyObj(error))
                                                } else {
                                                    if (results && results.length > 0) {
                                                        var subject = results[0].SUBJ
                                                        var body = results[0].BODY
                                                        var bodyLines = []
                                                        if (body !== undefined) {
                                                            body = body.replace('EBELN', element.EBELN)
                                                            body = body.replace('EBELP', element.EBELP)
                                                            body = body.replace('MATNR', element.MATNR)
                                                            bodyLines.push({ LINE: body })
                                                        }

                                                        if (element.LIST_XBLNR !== undefined) {
                                                            // SPAZIO VUOTO
                                                            bodyLines.push({ LINE: '' })
                                                            element.LIST_XBLNR.forEach(single => {
                                                                if (single.XBLNR !== undefined && single.XBLNR !== '' && single.EINDT !== undefined && single.EINDT !== '') { bodyLines.push({ LINE: 'Data ' + single.EINDT + ' Schedulazione: ' + single.XBLNR + ' Quantita: ' + single.MENGE }) }
                                                            })
                                                        }

                                                        if (element.APPLICAZIONE.indexOf('PRZ') > 0) {
                                                            var line = 'Prezzo ' + element.NETPR + ' Unità di Prezzo ' + element.PEINH
                                                            if (element.BSTYP === 'L') { line = line + ' Inizio Validità: ' + element.ZINVALIDITA + ' Fine Validità: ' + element.ZFINVALIDATA }
                                                            bodyLines.push({ LINE: line })
                                                        }

                                                        var sql = 'SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_NOTIF_PORTAL_LINKS\" WHERE APP = \'' + element.APPLICAZIONE + '\' and EVENT = \'' + element.EVENT + '\''
                                                        console.log('sql T_NOTIF_PORTAL_LINKS' + sql)
                                                        client.exec(sql, function (error, results) {
                                                            if (error) {
                                                                console.error('Error during direct statement execution T_NOTIF_PORTAL_LINKS: ' + stringifyObj(error))
                                                                client.close()
                                                                //  return res.status(500).send('T_NOTIF_PORTAL_LINKS ERROR: ' + stringifyObj(error))
                                                            } else {
                                                                if (results && results[0]) {
                                                                    // SPAZIO VUOTO
                                                                    bodyLines.push({ LINE: '' })
                                                                    var link = results[0].LINK
                                                                    link = link.replace('EBELN', element.EBELN)
                                                                    link = link.replace('EBELP', element.EBELP)
                                                                    bodyLines.push({ LINE: link })
                                                                }
                                                            }

                                                            if (notaReject !== undefined && notaReject !== '' && element.CONF_TYPE === 'R') {
                                                                bodyLines.push({ LINE: '' })
                                                                bodyLines.push({ LINE: 'Note: ' + notaReject })
                                                            }

                                                            hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::SendMail', function (_err, sp) {
                                                                sp(req.user.id, subject, bodyLines, emailList, (err) => {
                                                                    if (err) {
                                                                        console.error('ERROR: ' + stringifyObj(err))
                                                                        // return res.status(500).send(stringifyObj(err))
                                                                    } else {
                                                                        // return res.status(200).send('OK')
                                                                    }
                                                                })
                                                            })
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        })
    }

    // Parse URL-encoded bodies (as sent by HTML forms)
    // app.use(express.urlencoded());

    // Parse JSON bodies (as sent by API clients)
    app.use(express.json())

    return app
}
