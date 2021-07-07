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

    // GET CONTO LAV
    app.post('/GetContoLav', function (req, res) {
        const body = req.body

        console.log('INPUT BODY ==========> ' + JSON.stringify(body))

        if (body !== undefined && body !== '' && body !== null) {
        var ebeln = []
        var werks = []
        var matnr = []
        var lifnr = []
        var ekorg = []
        var days = ''
        var langu = body.spras
        var userid = req.user.id

        if (body.werks !== null && body.werks !== undefined && body.werks.length > 0) {
            var oWerks = [] 
            // eslint-disable-next-line no-redeclare
            for (var i = 0; i < body.werks.length; i++) {
                oWerks.push({ EWERK: body.werks[i] })
            }
            werks = oWerks
        }

        if (body.matnr !== null && body.matnr !== undefined && body.matnr.length > 0) {
            var oMatnr = [] 
            // eslint-disable-next-line no-redeclare
            for (var i = 0; i < body.matnr.length; i++) {
                oMatnr.push({ MATNR: body.matnr[i] })
            }
            matnr = oMatnr
        }
        if (body.lifnr !== null && body.lifnr !== undefined && body.lifnr.length > 0) {
            var oLifnr = [] 
            // eslint-disable-next-line no-redeclare
            for (var i = 0; i < body.lifnr.length; i++) {
                oLifnr.push({ ELIFN: body.lifnr[i] })
            }
            lifnr = oLifnr
        }
        if (body.ebeln !== null && body.ebeln !== undefined && body.ebeln !== '') {
            ebeln = body.ebeln
        }
        if (body.langu !== null && body.langu !== undefined && body.langu !== '') {
            langu = body.langu
        }
        if (body.days !== null && body.days !== undefined && body.days !== '') {
            days = body.days
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
        hdbext.createConnection(req.tenantContainer, (err, client) => {
            if (err) {
            return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
            } else {
            hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.ContoLav::MM00_CONTO_LAV', function (_err, sp) {
                sp(userid, days, ebeln, lifnr, matnr, langu, werks, ekorg, (err, parameters, ET_MATERIAL) => {
                if (err) {
                    console.error('ERROR: ' + err)
                    return res.status(500).send(stringifyObj(err))
                } else {
                    var outArrayDoc = {
                        results: {
                            riga: []
                        }
                    }
                    if (ET_MATERIAL !== undefined && ET_MATERIAL !== null && ET_MATERIAL.length > 0) {
                        for (var i = 0; i < ET_MATERIAL.length; i++) {
                            var SEMA;
                            if (ET_MATERIAL[i].TOT_GIAC < 0) {
                             SEMA = 'Error';
                            }
                            else if (ET_MATERIAL[i].TOT_GIAC = 0) {
                             SEMA ='Warning';
                            }
                            else {
                             SEMA = 'Success';
                            }
                            var strutHeader = {
                                        "METAID": ET_MATERIAL[i].METAID,
                                        "DESC_METAID": ET_MATERIAL[i].DESC_METAID,
                                        "LIFNR": ET_MATERIAL[i].LIFNR,
                                        "NAME_LIFNR": ET_MATERIAL[i].NAME_LIFNR,
                                        "WERKS": ET_MATERIAL[i].WERKS,
                                        "WERKS_DESCR": ET_MATERIAL[i].WERKS_DESCR,
                                        "MATNR": ET_MATERIAL[i].MATNR,
                                        "DESC_MATNR": ET_MATERIAL[i].DESC_MATNR,
                                        "COMP_MATNR": ET_MATERIAL[i].COMP_MATNR,
                                        "DESC_COMP": ET_MATERIAL[i].DESC_COMP,
                                        "LBLAB": ET_MATERIAL[i].LBLAB,
                                        "LBINS": ET_MATERIAL[i].LBINS,
                                        "TOT_GIAC": ET_MATERIAL[i].TOT_GIAC,
                                        "EBELN": '',
                                        "EBELP": '',
                                        "FIRST": '',
                                        "SEMA" : SEMA,
                                            "riga":[{
                                                "LIFNR": '',
                                                "NAME_LIFNR": '',
                                                "WERKS": '',
                                                "MATNR": '',
                                                "DESC_MATNR": '',
                                                "COMP_MATNR": '',
                                                "DESC_COMP": '',
                                                "LBLAB": '',
                                                "LBINS": '',
                                                "TOT_GIAC": '',
                                                "EBELN": ET_MATERIAL[i].EBELN,
                                                "EBELP": ET_MATERIAL[i].EBELP,
                                                "FIRST": ET_MATERIAL[i].FIRST,
                                                "SEMA" : SEMA
                                            }]
                           
                            }
                                                                            
                            outArrayDoc.results.riga.push(strutHeader);
                            //outArrayDoc.push(strutDoc);
                        }
                    }

                    //var outArr = []
                    //results.forEach(element => {
                    //    outArr.push(element)
                    //})
                    return res.status(200).send(outArrayDoc)
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
