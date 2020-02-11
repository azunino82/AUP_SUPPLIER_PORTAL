/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var express = require("express");
var stringifyObj = require("stringify-object");
var xsenv = require("@sap/xsenv");
var xssec = require("@sap/xssec");
var hdbext = require("@sap/hdbext");

module.exports = function () {
    var app = express.Router();

    //LISTA METASUPPLIERS by status e/o by ID
    app.get("/GetMetasupplier", function (req, res) {

        var metasupplierStatus = req.query.I_ATTIVO;
        var metaID = req.query.I_METAID;
        var sql = "";

        if (metasupplierStatus === undefined && metaID === undefined) {
            return res.status(500).send("I_METAID or I_ATTIVO mandatory");
        }

        if (metaID !== undefined)
            sql = "SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_METASUPPLIER_DATA\" WHERE METAID = \'" + metaID + "\'";
        else
            sql = 'SELECT * FROM "AUPSUP_DATABASE.data.tables::T_METASUPPLIER_DATA" WHERE ATTIVO = ' + parseInt(metasupplierStatus);
        hdbext.createConnection(req.tenantContainer, (err, client) => {
            if (err) {
                var responseStr = "Error during GetPurchaseOrganizations.js Connection";
                return res.status(500).send(responseStr);
            } else {
                client.exec(sql, (err, results) => {
                    if (err) {
                        return res.status(500).send("Error during SELECT on table T_METASUPPLIER_DATA: " + stringifyObj(err) +
                            " parm ATTIVO = " + metasupplierStatus + " parm METAID = " + metaID);
                    } else {
                        var outArr = [];
                        results.forEach(element => {
                            outArr.push(element);
                        });

                        return res.status(200).send({
                            "results": outArr
                        });
                    }
                });
            }
        });


    });

    // LISTA STATI PER METASUPPLIER
    app.get("/GetSupplierStates", function (req, res) {

        var conn = hdbext.createConnection(req.tenantContainer, (err, client) => {
            if (err) {
                var responseStr = "Error during GetSupplierStates.js Connection";
                return res.status(500).send(responseStr);
            } else {
                client.exec('SELECT * FROM "AUPSUP_DATABASE.data.tables::T_SUPPLIER_STATE"', (err, results) => {
                    if (err) {
                        return res.status(500).send("Error during SELECT on table T_SUPPLIER_STATE: " + stringifyObj(err));
                    } else {
                        var outArr = [];
                        results.forEach(element => {
                            outArr.push(element);
                        });

                        return res.status(200).send({
                            "results": outArr
                        });
                    }
                });
            }
        });


    });

    //LISTA DEI FORNITORI dato METAFORNITORE
    app.get("/GetMetaidSuppliers", function (req, res) {

        var metaID = req.query.I_METAID;
        var sql = "";
        if (metaID !== undefined) {
            sql = "SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_METAID_FORN\" WHERE METAID = \'" + metaID + "\'";
            hdbext.createConnection(req.tenantContainer, (err, client) => {
                if (err) {
                    var responseStr = "Error during GetMetaidSuppliers.js Connection";
                    return res.status(500).send(responseStr);
                } else {
                    client.exec(sql, (err, results) => {
                        if (err) {
                            return res.status(500).send("Error during SELECT on table T_METASUPPLIER_DATA: " + stringifyObj(err) +
                                " parm ATTIVO = " + metasupplierStatus + " parm METAID = " + metaID);
                        } else {
                            var outArr = [];
                            results.forEach(element => {
                                outArr.push(element);
                            });

                            return res.status(200).send({
                                "results": outArr
                            });
                        }
                    });
                }
            });
        } else {
            return res.status(500).send("I_METAID is Mandatory");
        }


    });

    //LISTA DEI FORNITORI dato METAFORNITORE
    app.get("/DeleteMetaid", function (req, res) {

        var metaID = req.query.I_METAID;

        if (metaID !== undefined) {
            hdbext.createConnection(req.tenantContainer, (err, client) => {
                if (err) {
                    return res.status(500).send("CREATE CONNECTION ERROR: " + stringifyObj(err));
                } else {

                    hdbext.loadProcedure(client, null, "AUPSUP_DATABASE.data.procedures.Metasupplier::DeleteMetasupplier", function (err, sp) {

                        sp(req.user.id, (err, parameters, results) => {

                            if (err) {
                                return res.status(500).send(stringifyObj(err));
                            } else {
                                return res.status(200).send("OK");
                            }

                        });
                    });
                }
            });
        } else {
            return res.status(500).send("I_METAID is Mandatory");
        }


    });


    // Parse URL-encoded bodies (as sent by HTML forms)
    //app.use(express.urlencoded());

    // Parse JSON bodies (as sent by API clients)
    app.use(express.json());


    app.post("/", function (req, res) {

        return res.status(200).send({ "POST": true });

    });

    return app;
};
