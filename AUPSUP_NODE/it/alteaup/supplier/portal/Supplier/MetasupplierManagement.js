/* eslint-disable no-trailing-spaces */
/* eslint-disable no-useless-escape */
/* eslint-disable indent */

'use strict'
var express = require('express')
var stringifyObj = require('stringify-object')
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

    // LISTA METASUPPLIERS by status e/o by ID
    app.get('/GetMetasupplier', function (req, res) {
        var metasupplierStatus = req.query.I_ATTIVO
        var metaID = req.query.I_METAID
        var sql = ''

        if (metasupplierStatus === undefined && metaID === undefined) {
            return res.status(500).send('I_METAID or I_ATTIVO mandatory')
        }

        if (metaID !== undefined) {
            sql = "SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_METASUPPLIER_DATA\" WHERE METAID = \'" + metaID + "\'"
        } else {
            sql = 'SELECT * FROM "AUPSUP_DATABASE.data.tables::T_METASUPPLIER_DATA" WHERE ATTIVO = ' + parseInt(metasupplierStatus)
        }

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
    })

    // LISTA STATI PER METASUPPLIER
    app.get('/GetSupplierStates', function (req, res) {
        const sql = 'SELECT * FROM "AUPSUP_DATABASE.data.tables::T_SUPPLIER_STATE"'
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
    })

    // LISTA DEI FORNITORI dato METAFORNITORE
    app.get('/GetMetaidSuppliers', function (req, res) {
        var metaID = req.query.I_METAID

        if (metaID !== undefined) {
            const sql = "SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_METAID_FORN\" WHERE METAID = \'" + metaID + "\'"

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
            return res.status(500).send('I_METAID is Mandatory')
        }
    })

    // LISTA DEI FORNITORI dato METAFORNITORE
    app.get('/DeleteMetaid', function (req, res) {
        var metaID = req.query.I_METAID

        if (metaID !== undefined) {
            hdbext.createConnection(req.tenantContainer, (err, client) => {
                if (err) {
                    return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
                } else {
                    hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Metasupplier::DeleteMetasupplier', function (_err, sp) {
                        sp(req.user.id, (err, parameters, results) => {
                            if (err) {
                                return res.status(500).send(stringifyObj(err))
                            } else {
                                return res.status(200).send('OK')
                            }
                        })
                    })
                }
            })
        } else {
            return res.status(500).send('I_METAID is Mandatory')
        }
    })

    // Parse URL-encoded bodies (as sent by HTML forms)
    // app.use(express.urlencoded());

    // Parse JSON bodies (as sent by API clients)
    app.use(express.json())

    // Create Metasupplier
    app.post('/CreateMetasupplier', function (req, res) {
        const body = req.body
        console.log({ body_in: JSON.stringify(body) })

        if (body !== undefined && body !== '' && body !== null && body.METAID !== undefined && body.METAID !== '') {
            const sql = 'INSERT INTO "AUPSUP_DATABASE.data.tables::T_METASUPPLIER_DATA" VALUES (?, ?, ?, ?, ?,?, ?, ?, ?, ?)'

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
                            statement.exec([body.METAID, body.RAG_SOCIALE, body.INDIRIZZO, body.N_CIVICO, body.PAESE, body.LINGUA, body.PIVA, body.STATO_FORNITORE, parseInt(body.ATTIVO), body.BU], function (execErr, results) {
                                callback(null, execErr, results)
                            })
                        },

                        function response (err, results, callback) {
                            if (err) {
                                res.type('application/json').status(500).send({ ERROR: err })
                                return
                            } else {
                                var result = JSON.stringify({
                                    Objects: results
                                })
                                res.type('application/json').status(200).send({ results: result })
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
            return res.status(500).send('BODY is Mandatory')
        }
    })

    return app
}
