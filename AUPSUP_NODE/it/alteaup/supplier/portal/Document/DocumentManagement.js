/* eslint-disable no-trailing-spaces */
/* eslint-disable no-useless-escape */
/* eslint-disable indent */

'use strict'
var express = require('express')
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

    // GET DOCUMENT INFO BY CLASSIFICATION

    app.get('/GetDocumentData', function (req, res) {
        var classification = req.query.I_CLASSIFICATION

        if (classification !== undefined) {
            const sql = "SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_DOCUMENT_MANAGEMENT\" WHERE CLASSIFICATION = \'" + classification + "\'"

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
                                res.type('application/json').status(200).send({ results: results })
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
        } else {
            return res.status(500).send('I_CLASSIFICATION is Mandatory')
        }
    })

    // Parse URL-encoded bodies (as sent by HTML forms)
    // app.use(express.urlencoded());

    // Parse JSON bodies (as sent by API clients)
    app.use(express.json())

    return app
}
