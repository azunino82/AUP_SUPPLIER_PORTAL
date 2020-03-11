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

    // LISTA TIPO CONTRATTO
    app.get('/GetContactTypes', function (req, res) {
        var status = req.query.I_ATTIVO
        const sql = "SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_CONTACT_TYPE\" WHERE ATTIVO = \'" + status + "\'"

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

    // GET METAID
    app.get('/GetMetaID', function (req, res) {
        var userid = req.user.id
        const sql = "SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_USERID_METAID\" WHERE USERID = \'" + userid + "\'"

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

    // LISTA CONTATTI

    app.get('/GetContacts', function (req, res) {
        var metaid = req.query.I_METAID
        const sql = "SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_METASUPPLIER_CONTACTS\" WHERE METAID = \'" + metaid + "\'"

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
        
    // Parse URL-encoded bodies (as sent by HTML forms)
    // app.use(express.urlencoded());

    // Parse JSON bodies (as sent by API clients)
    app.use(express.json())

    // Create Metasupplier
    app.post('/CreateMetasupplier', function (req, res) {
        const body = req.body
        console.log({ body_in: JSON.stringify(body) })

        if (body !== undefined && body !== '' && body !== null && body.METAID !== undefined && body.METAID !== '') {
            var sql = 'INSERT INTO "AUPSUP_DATABASE.data.tables::T_METASUPPLIER_DATA" VALUES (?, ?, ?, ?, ?,?, ?, ?, ?, ?)'

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
                                // IL MEDAID è STATO CREATO ORA SALVO LE BU se ci sono
                                var errBU = ''
                                if (body.BUDATA !== undefined && body.BUDATA !== null && body.BUDATA.METAID !== undefined && body.BUDATA.METAID !== '') {
                                        sql = 'INSERT INTO "AUPSUP_DATABASE.data.tables::T_METAID_BU" VALUES (?, ?, ?)'
                                        async.waterfall([

                                            function prepare (callback) {
                                                client.prepare(sql,
                                                    function (err, statement) {
                                                        callback(null, err, statement)
                                                    })
                                            },
    
                                            function execute (_err, statement, callback) {
                                                statement.exec([body.BUDATA.METAID, body.BUDATA.BU, body.BUDATA.STATO], function (execErr, results) {
                                                    callback(null, execErr, results)
                                                })
                                            },
    
                                            function response (err, results, callback) {
                                                console.error({ erroreBU: err })
                                                if (err) {
                                                    errBU = err
                                                    return
                                                }
                                                callback()
                                            }
                                        ])
                                }

                                // AGGANCIO IL METAFORNITORE al FORNITORE SAP
                                var errSupplier = ''
                                if (body.SUPPLIERS !== undefined && body.SUPPLIERS !== null && body.SUPPLIERS.length > 0) {
                                    sql = 'INSERT INTO "AUPSUP_DATABASE.data.tables::T_METAID_FORN" VALUES (?, ?, ?)'
                                    body.SUPPLIERS.forEach(element => {
                                        async.waterfall([

                                            function prepare (callback) {
                                                client.prepare(sql,
                                                    function (err, statement) {
                                                        callback(null, err, statement)
                                                    })
                                            },
    
                                            function execute (_err, statement, callback) {
                                                statement.exec([element.METAID, element.LIFNR, element.SYSID], function (execErr, results) {
                                                    callback(null, execErr, results)
                                                })
                                            },
    
                                            function response (err, results, callback) {
                                                console.error({ erroreSUPPLIER: err })
                                                if (err) {
                                                    errSupplier += err
                                                    return
                                                }
                                                callback()
                                            }
                                        ])
                                    })
                                }                                

                                if (errBU === '' && errSupplier === '') {
                                    res.type('application/json').status(200).send({ results: results })
                                } else {
                                    res.type('application/json').status(500).send({ ERROR: 'BU or SUPPLIER creation error' })
                                }
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

    // UPDATE METAFORNITORE
    app.put('/UpdateMetasupplier', function (req, res) {
        var metaID = req.query.I_METAID
        const body = req.body
        console.log({ body_in: JSON.stringify(body) })

        if (metaID !== undefined) {
            // eslint-disable-next-line quotes
            var sql = "UPDATE \"AUPSUP_DATABASE.data.tables::T_METASUPPLIER_DATA\" SET RAG_SOCIALE = '" + body.RAG_SOCIALE + "', INDIRIZZO = '" + body.INDIRIZZO + "', N_CIVICO = '" + body.N_CIVICO + "' , PAESE = '" + body.PAESE + "', LINGUA = '" + body.LINGUA + "', PIVA = '" + body.PIVA + "', STATO_FORNITORE = '" + body.STATO_FORNITORE + "', ATTIVO = " + parseInt(body.ATTIVO) + ", BU = '" + body.BU + "' WHERE METAID = \'" + metaID + "\'"
            console.log({ sqlUPDATE: sql })
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
                                // Cancello il legame METAFORNITORE - FORNITORE SAP
                                sql = 'DELETE FROM \"AUPSUP_DATABASE.data.tables::T_METAID_FORN\" WHERE METAID = \'' + metaID + '\''
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
                                        console.error({ erroreSUPPLIER: err })
                                        if (err) {
                                            return
                                        } else {
                                            // RICREO IL LEGAME METAFORNITORE - FORNITORE SAP
                                            if (body.SUPPLIERS !== undefined && body.SUPPLIERS !== null && body.SUPPLIERS.length > 0) {
                                                body.SUPPLIERS.forEach(element => {
                                                    sql = 'INSERT INTO "AUPSUP_DATABASE.data.tables::T_METAID_FORN" VALUES (?, ?, ?)'
                                                    body.SUPPLIERS.forEach(element => {
                                                        async.waterfall([

                                                            function prepare (callback) {
                                                                client.prepare(sql,
                                                                    function (err, statement) {
                                                                        callback(null, err, statement)
                                                                    })
                                                            },
                    
                                                            function execute (_err, statement, callback) {
                                                                statement.exec([element.METAID, element.LIFNR, element.SYSID], function (execErr, results) {
                                                                    callback(null, execErr, results)
                                                                })
                                                            },
                    
                                                            function response (err, results, callback) {
                                                                console.error({ erroreSUPPLIER: err })
                                                                if (err) {
                                                                    return
                                                                }
                                                                callback()
                                                            }
                                                        ])
                                                    })
                                                })
                                            }
                                        }
                                        callback()
                                    }
                                ])
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

    // Create Contact
    app.post('/CreateContact', function (req, res) {
        const body = req.body
        console.log({ body_in: JSON.stringify(body) })

        if (body !== undefined && body !== '' && body !== null && body.METAID !== undefined && body.METAID !== '') {
            var sql = 'INSERT INTO "AUPSUP_DATABASE.data.tables::T_METASUPPLIER_CONTACTS" VALUES (?, ?, ?, ?, ?, ?,?, ?, ?, ?)'

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
                            statement.exec([body.KEY, body.METAID, body.TIPOLOGIA, body.MAIL, body.TEL, body.TITOLO, body.NOME, body.COGNOME, body.FAX, body.TEL1], function (execErr, results) {
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
            return res.status(500).send('BODY is Mandatory')
        }
    })    

    // UPDATE METAFORNITORE
    app.put('/UpdateContact', function (req, res) {
        var key = req.query.KEY
        const body = req.body
        console.log({ body_in: JSON.stringify(body) })

        if (key !== undefined) {
            // eslint-disable-next-line quotes
            var sql = "UPDATE \"AUPSUP_DATABASE.data.tables::T_METASUPPLIER_CONTACTS\" SET METAID = '" + body.METAID + "', TIPOLOGIA = '" + body.TIPOLOGIA + "', MAIL = '" + body.MAIL + "' , TEL = '" + body.TEL + "', TITOLO = '" + body.TITOLO + "', NOME = '" + body.NOME + "', COGNOME = '" + body.COGNOME + "', FAX = '" + body.FAX + "', TEL1 = '" + body.TEL1 + "' WHERE KEY = \'" + key + "\'"
            console.log({ sqlUPDATE: sql })
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
            return res.status(500).send('key is Mandatory')
        }
    })    

    // DELETE CONTACT
    app.get('/DeleteContract', function (req, res) {
        var key = req.query.KEY

        if (key !== undefined) {
            // eslint-disable-next-line quotes
            var sql = "DELETE FROM \"AUPSUP_DATABASE.data.tables::T_METASUPPLIER_CONTACTS\" WHERE KEY = \'" + key + "\'"
            console.log({ sqlUPDATE: sql })
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
            return res.status(500).send('key is Mandatory')
        }
    })

    return app
}
