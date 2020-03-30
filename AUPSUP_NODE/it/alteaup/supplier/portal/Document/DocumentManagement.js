/* eslint-disable no-trailing-spaces */
/* eslint-disable no-useless-escape */
/* eslint-disable indent */

'use strict'
var express = require('express')
var hdbext = require('@sap/hdbext')
var async = require('async')
var stringifyObj = require('stringify-object')

const fileUpload = require('express-fileupload')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')

module.exports = function () {
    var app = express.Router()

    // enable files upload
    app.use(fileUpload({
        createParentPath: true
    }))

    // add other middleware
    app.use(cors())
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(morgan('dev'))

    app.post('/uploadDocTest', async (req, res) => {
        try {
            if (!req.files) {
                res.send({
                    status: false,
                    message: 'No file uploaded'
                })
            } else {
                // Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
                const avatar = req.files.avatar
                
                // Use the mv() method to place the file in upload directory (i.e. "uploads")
                // avatar.mv('./uploads/' + avatar.name)

                var logMessage = ''
                var userid = req.user.id
                var classification = req.query.I_CLASSIFICATION !== undefined && req.query.I_CLASSIFICATION !== null ? req.query.I_CLASSIFICATION : ''
                var application = req.query.I_APPLICATION !== undefined && req.query.I_APPLICATION !== null ? req.query.I_APPLICATION : ''
                var fileName = req.query.I_FILE_NAME !== undefined && req.query.I_FILE_NAME !== null ? req.query.I_FILE_NAME : ''
                var objectCode = req.query.I_OBJECT_CODE !== undefined && req.query.I_OBJECT_CODE !== null ? req.query.I_OBJECT_CODE : ''
                var data = ''
                var metaId = req.query.I_METAID !== undefined && req.query.I_METAID !== null ? req.query.I_METAID : ''
                var werks = req.query.I_WERKS !== undefined && req.query.I_WERKS !== null ? req.query.I_WERKS : ''
                var lifnr = req.query.I_LIFNR !== undefined && req.query.I_LIFNR !== null ? req.query.I_LIFNR : ''
        
                var canPlay = false
            
                if (classification != null && classification !== '') {
                    canPlay = true
                } else {
                    canPlay = false
                    logMessage = logMessage + ' I_CLASSIFICATION, '
                }
            
                if (fileName != null && fileName !== '') {
                    canPlay = true
                } else {
                    canPlay = false
                    logMessage = logMessage + ' I_FILE_NAME, '
                }
            
                if (objectCode != null && objectCode !== '') {
                    canPlay = true
                } else {
                    canPlay = false
                    logMessage = logMessage + ' I_OBJECT_CODE, '
                }
            
                if (application != null && application !== '') {
                    canPlay = true
                } else {
                    canPlay = false
                    logMessage = logMessage + ' I_APPLICATION, '
                }
        
                if (avatar.data !== undefined && avatar.data !== null) {
                    canPlay = true
                    data = avatar.data
                } else {
                    canPlay = false
                    logMessage = logMessage + ' FILE, '
                }
                console.log('CAN PLAY')
                if (canPlay) {
                    hdbext.createConnection(req.tenantContainer, (err, client) => {
                        if (err) {
                            return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
                        } else {
                            console.log('loadProcedure')
                            hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Documents::MM00_DOC_UPLOAD', function (_err, sp) {
                                console.log('sp')
                                sp(userid, data, fileName, objectCode, classification, application, metaId, werks, lifnr, (err, parameters, O_DOC_NUMBER, O_MESSAGE) => {
                                if (err) {
                                    console.error('ERROR: ' + err)
                                    return res.status(500).send(stringifyObj(err))
                                } else {
                                    var out = ''
                                    var results = ''
        
                                    if (O_MESSAGE !== null && O_MESSAGE !== undefined && O_MESSAGE !== '') {
                                        var message = O_MESSAGE
                                        if (message != null && message !== '') {
                                            out = message
                                            results = {
                                                message: out
                                            }
                                        }
                                    } else {
                                        if (O_DOC_NUMBER !== undefined && O_DOC_NUMBER !== null) {
                                            var docID = O_DOC_NUMBER
                                            if (docID != null && docID !== '') {
                                                out = docID
                                                results = {
                                                    docId: out
                                                }
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
                } else {
                    return res.status(500).send(stringifyObj(logMessage))
                }
            }
        } catch (err) {
            res.status(500).send(err)
        }
    })

    /* const bodyParser = require('body-parser')

    app.use(
        bodyParser.urlencoded({
            extended: true
        })
    )

    app.use(bodyParser.json()) */

    // GET DOCUMENT INFO BY CLASSIFICATION

    app.get('/GetDocumentData', function (req, res) {
        var classification = req.query.I_CLASSIFICATION
        var application = req.query.I_APPLICATION
        var sql = ''
        if (classification !== undefined && application === undefined) {
            sql = "SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_DOCUMENT_MANAGEMENT\" WHERE CLASSIFICATION = \'" + classification + "\'"
        } else {
            if (classification !== undefined && application !== undefined) {
                sql = "SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_DOCUMENT_MANAGEMENT\" WHERE CLASSIFICATION = \'" + classification + "\' AND APPLICATION = \'" + application + "\'" 
            } else {
                if (classification === undefined && application !== undefined) {
                    sql = "SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_DOCUMENT_MANAGEMENT\" WHERE APPLICATION = \'" + application + "\'"
                }
            }
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

    // DOCUMENT PRINT
    app.get('/DocPrint', function (req, res) {
        // eslint-disable-next-line camelcase
        var notif_no = req.query.I_NOTIF_NO
        var qmart = req.query.I_QMART

        // eslint-disable-next-line camelcase
        if (notif_no !== undefined && qmart !== undefined) {
        hdbext.createConnection(req.tenantContainer, (err, client) => {
            if (err) {
                return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
            } else {
            hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Documents::MM00_NOTIF_PRINT', function (_err, sp) {
                sp(notif_no, qmart, (err, parameters, results) => {
                if (err) {
                    console.error('ERROR: ' + err)
                    return res.status(500).send(stringifyObj(err))
                } else {
                    return res.status(200).send({
                        results: results.E_DATA
                    })
                }
                })
            })
            }
        })
        } else {
            return res.status(500).send('I_NOTIF_NO and I_QMART are Mandatory')
        }
    })

    // DOCUMENT UPLOAD
    app.post('/DocUpload', function (req, res) {
        const body = req.body

         console.log('INPUT BODY ==========> ' + body.length)

        var logMessage = ''
        var userid = req.user.id
        var classification = req.query.I_METAID !== undefined && req.query.I_METAID !== null ? req.query.I_METAID : ''
        var application = req.query.I_APPLICATION !== undefined && req.query.I_APPLICATION !== null ? req.query.I_APPLICATION : ''
        var fileName = req.query.I_FILE_NAME !== undefined && req.query.I_FILE_NAME !== null ? req.query.I_FILE_NAME : ''
        var objectCode = req.query.I_OBJECT_CODE !== undefined && req.query.I_OBJECT_CODE !== null ? req.query.I_OBJECT_CODE : ''
        var data = ''
        var metaId = req.query.I_METAID !== undefined && req.query.I_METAID !== null ? req.query.I_METAID : ''
        var werks = req.query.I_WERKS !== undefined && req.query.I_WERKS !== null ? req.query.I_WERKS : ''
        var lifnr = req.query.I_LIFNR !== undefined && req.query.I_LIFNR !== null ? req.query.I_LIFNR : ''

        var canPlay = false
    
        if (classification != null && classification !== '') {
            canPlay = true
        } else {
            canPlay = false
            logMessage = logMessage + ' I_CLASSIFICATION, '
        }
    
        if (fileName != null && fileName !== '') {
            canPlay = true
        } else {
            canPlay = false
            logMessage = logMessage + ' I_FILE_NAME, '
        }
    
        if (objectCode != null && objectCode !== '') {
            canPlay = true
        } else {
            canPlay = false
            logMessage = logMessage + ' I_OBJECT_CODE, '
        }
    
        if (application != null && application !== '') {
            canPlay = true
        } else {
            canPlay = false
            logMessage = logMessage + ' I_APPLICATION, '
        }

        if (body !== undefined && body !== null && body !== '') {
            canPlay = true
            data = body.asString()
        } else {
            canPlay = false
            logMessage = logMessage + ' FILE INTO BODY, '
        }

        if (canPlay) {
            hdbext.createConnection(req.tenantContainer, (err, client) => {
                if (err) {
                    return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
                } else {
                    hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Documents::MM00_DOC_UPLOAD', function (_err, sp) {
                        sp(userid, data, fileName, objectCode, classification, application, metaId, werks, lifnr, (err, parameters, O_DOC_NUMBER, O_MESSAGE) => {
                        if (err) {
                            console.error('ERROR: ' + err)
                            return res.status(500).send(stringifyObj(err))
                        } else {
                            var out = ''
                            var results = ''

                            if (O_MESSAGE !== null && O_MESSAGE !== undefined && O_MESSAGE !== '') {
                                var message = O_MESSAGE
                                if (message != null && message !== '') {
                                    out = message
                                    results = {
                                        message: out
                                    }
                                }
                            } else {
                                if (O_DOC_NUMBER !== undefined && O_DOC_NUMBER !== null) {
                                    var docID = O_DOC_NUMBER
                                    if (docID != null && docID !== '') {
                                        out = docID
                                        results = {
                                            docId: out
                                        }
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
        } else {
            return res.status(500).send(stringifyObj(logMessage))
        }
    })

    // DOCUMENT LIST
    app.get('/DocList', function (req, res) {
        var logMessage = ''
        var userId = req.user.id
        var classification = req.query.I_CLASSIFICATION !== undefined && req.query.I_CLASSIFICATION !== null ? req.query.I_CLASSIFICATION : ''
        var application = req.query.I_APPLICATION !== undefined && req.query.I_APPLICATION !== null ? req.query.I_APPLICATION : ''
        var objKey = []
        var canPlay = false

        if (classification != null && classification !== '') {
            canPlay = true
        } else {
            canPlay = false
            logMessage = 'I_CLASSIFICATION, '
        }
    
        if (req.query.I_OBJECT_CODE !== null && req.query.I_OBJECT_CODE !== undefined && req.query.I_OBJECT_CODE !== '') {
            canPlay = true
            objKey.push({ OBJKY: req.query.I_OBJECT_CODE })
        } else {
            canPlay = false
            logMessage = ' I_OBJECT_CODE '
        }
    
        if (application != null && application !== '') {
            canPlay = true
        } else {
            canPlay = false
            logMessage = logMessage + ' I_APPLICATION, '
        } 

        // eslint-disable-next-line camelcase
        if (canPlay) {
            hdbext.createConnection(req.tenantContainer, (err, client) => {
                if (err) {
                    return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
                } else {
                hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Documents::MM00_DOCUMENT_LIST', function (_err, sp) {
                    sp(userId, objKey, classification, application, (err, parameters, ET_DOCUMENT, O_MESSAGE) => {
                        if (err) {
                            console.error('ERROR: ' + err)
                            return res.status(500).send(stringifyObj(err))
                        } else {
                            var outArrayDoc = []
                            if (ET_DOCUMENT !== undefined && ET_DOCUMENT !== null && ET_DOCUMENT.length > 0) {
                                for (var i = 0; i < ET_DOCUMENT.length; i++) {
                                    outArrayDoc.push(ET_DOCUMENT[i])
                                }
                            }
                            return res.status(200).send({
                                results: outArrayDoc
                            })
                        }
                    })
                })
                }
            })
        } else {
            return res.status(500).send(JSON.stringify("{'Error':'" + logMessage + " mandatory'}"))
        }
    })    

    // DOCUMENT DOWNLOAD
    app.get('/DocDownload', function (req, res) {
        var logMessage = ''
        var userId = req.user.id
        var DOKAR = req.query.I_DOKAR !== undefined && req.query.I_DOKAR !== null ? req.query.I_DOKAR : ''
        var DOKNR = req.query.I_DOKNR !== undefined && req.query.I_DOKNR !== null ? req.query.I_DOKNR : ''
        var DOKOB = req.query.I_DOKOB !== undefined && req.query.I_DOKOB !== null ? req.query.I_DOKOB : ''
        var DOKTL = req.query.I_DOKTL !== undefined && req.query.I_DOKTL !== null ? req.query.I_DOKTL : ''
        var DOKVR = req.query.I_DOKVR !== undefined && req.query.I_DOKVR !== null ? req.query.I_DOKVR : ''
        var LO_INDEX = req.query.I_LO_INDEX !== undefined && req.query.I_LO_INDEX !== null ? req.query.I_LO_INDEX : ''
        var LO_OBJID = req.query.I_LO_OBJID !== undefined && req.query.I_LO_OBJID !== null ? req.query.I_LO_OBJID : ''
        var OBJKY = req.query.I_OBJKY !== undefined && req.query.I_OBJKY !== null ? req.query.I_OBJKY : ''
        var canPlay = false

        if (DOKAR !== null && DOKAR !== '') {
            canPlay = true
        } else {
            canPlay = false
            logMessage = 'I_DOKAR, '
        }
    
        if (DOKNR !== null && DOKNR !== '') {
            canPlay = true
        } else {
            canPlay = false
            logMessage = 'I_DOKNR, '
        }
    
        if (DOKOB !== null && DOKOB !== '') {
            canPlay = true
        } else {
            canPlay = false
            logMessage = 'I_DOKOB, '
        }
    
        if (DOKTL !== null && DOKTL !== '') {
            canPlay = true
        } else {
            canPlay = false
            logMessage = 'I_DOKTL, '
        }
    
        if (DOKVR !== null && DOKVR !== '') {
            canPlay = true
        } else {
            canPlay = false
            logMessage = 'I_DOKVR, '
        }
    
        if (LO_INDEX !== null && LO_INDEX !== '') {
            canPlay = true
        } else {
            canPlay = false
            logMessage = 'I_LO_INDEX, '
        }
    
        if (LO_OBJID !== null && LO_OBJID !== '') {
            canPlay = true
        } else {
            canPlay = false
            logMessage = 'I_LO_OBJID, '
        }
        if (OBJKY !== null && OBJKY !== '') {
            canPlay = true
        } else {
            canPlay = false
            logMessage = 'I_OBJKY, '
        }

        // eslint-disable-next-line camelcase
        if (canPlay) {
            hdbext.createConnection(req.tenantContainer, (err, client) => {
                if (err) {
                    return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
                } else {
                hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Documents::MM00_DOC_DOWNLOAD', function (_err, sp) {
                    sp(userId, DOKAR, DOKNR, DOKOB, DOKTL, DOKVR, LO_INDEX, LO_OBJID, OBJKY, (err, parameters, results) => {
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
        } else {
            return res.status(500).send(JSON.stringify("{'Error':'" + logMessage + " mandatory'}"))
        }
    })    

    app.get('/getDocumentTypes', function (req, res) {
        var application = req.query.I_APPLICATION !== undefined && req.query.I_APPLICATION !== null ? req.query.I_APPLICATION : ''

        if (application === '') {
            return res.status(500).send('I_APPLICATION Mandatory')
        }

        var sql = "SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_DOCUMENT_MANAGEMENT\" AS a INNER JOIN \"AUPSUP_DATABASE.data.tables::T_DOCUMENT_TYPES\" AS b ON a.APPLICATION = b.APPLICATION  WHERE a.APPLICATION = \'" + application + "\'"

        hdbext.createConnection(req.tenantContainer, function (error, client) {
            if (error) {
                console.error('---->>> ERROR T_DOCUMENT_MANAGEMENT <<<<<-----')
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
                            return res.type('application/json').status(500).send({ ERROR: err })
                        } else {
                            return res.status(200).send(results)
                        }
                    }
                ], function done (err, parameters, rows) {
                    console.log('---->>> CLIENT END T_DOCUMENT_MANAGEMENT <<<<<-----')
                    client.close()
                    if (err) {
                        return console.error('Done error', err)
                    }
                })
            }
        })        
    })

    return app
}
