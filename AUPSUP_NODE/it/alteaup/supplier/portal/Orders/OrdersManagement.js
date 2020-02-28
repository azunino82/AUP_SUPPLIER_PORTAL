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
            var notaReject = ''
            var confirmType = ''
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
            if (body.notaReject !== null && body.notaReject !== undefined && body.notaReject !== '') {
                notaReject = body.notaReject
            }
            if (body.confirmType !== null && body.confirmType !== undefined) {
                confirmType = body.confirmType
            }

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
                        sp(userid, confirmType, ekko, ekpo, ekes, notaReject, (err, parameters, results) => {
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

    // Parse URL-encoded bodies (as sent by HTML forms)
    // app.use(express.urlencoded());

    // Parse JSON bodies (as sent by API clients)
    app.use(express.json())

    return app
}
