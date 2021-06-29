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
        var ebeln = ''
        var werks = []
        var matnr = []
        var lifnr = []
        var days = ''
        var langu = ''
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

        hdbext.createConnection(req.tenantContainer, (err, client) => {
            if (err) {
            return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
            } else {
            hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Planning::MM00_PLANNING_DOC_LIST', function (_err, sp) {
                sp(userid, werks, matnr, ebeln, lifnr, langu, days, (err, parameters, results) => {
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
