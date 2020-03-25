sap.ui.define([
    "it/alteaup/supplier/portal/customizing/AUPSUP_HTML5_CUSTOMIZING/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, MessageBox) {
    "use strict";
    var oGlobalBusyDialog = new sap.m.BusyDialog();
    var bGlobalBusyDialogIsShown = false;
    var that;
    var originalBuyerList = [];
    var originaUserIDMetadataId = [];
    // var originaPurchaseOrganizations = [];
    var originaMetaIDSupplier = [];
    var originaBUPlant = [];
    var originaBUPurchaseOrg = [];
    var originalProfiliConferma = [];
    var originalProfiliConfermaHeader = [];
    var originalAvvisiQta = [];
    var originalMatriceCriticita = [];
    var originalTipoOrdine = [];
    var originalNotificatioMaster = [];
    var originalDocumentManagement = [];
    var originalGestioneEtichette = [];
    var originalNotificationContacts = [];

    return BaseController.extend("it.alteaup.supplier.portal.customizing.AUPSUP_HTML5_CUSTOMIZING.controller.Worklist", {
        onInit: function () {
            that = this;
            that.getCurrentSYSID()
        },

        onAfterRendering: function () {
            that.getBuyers(function (
                oData) {

                if (oData === null || oData === undefined) {

                } else {
                    that._completeInit("Display", oData, function () {
                        if (that.getView().getModel("BuyersJSONModel").getData().results) {
                            originalBuyerList = [];
                            $.each(that.getView().getModel("BuyersJSONModel").getData().results, function (index, elem) {
                                var s_elem = JSON.stringify(elem);
                                originalBuyerList.push(jQuery.parseJSON(s_elem));
                            });
                        }

                    });
                }
            });
        },

        getBuyers: function (fCompletion) {
            var url = "/backend/CustomizingManagement/GetTableData?I_TABLE=T_BUYERS";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    fCompletion(oData);
                }
            });
        },

        getUserIDMetadataId: function () {

            var url = "/backend/CustomizingManagement/GetTableData?I_TABLE=T_USERID_METAID";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    if (oData.results) {
                        oModel.setData(oData);
                        that.getView().setModel(oModel, "UserIDMetadataIdJSONModel");
                        originaUserIDMetadataId = [];
                        $.each(that.getView().getModel("UserIDMetadataIdJSONModel").getData().results, function (index, elem) {
                            var s_elem = JSON.stringify(elem);
                            originaUserIDMetadataId.push(jQuery.parseJSON(s_elem));
                        });

                    }
                }
            });
        },

        getMetaIDSupplier: function (fCompletion) {

            var url = "/backend/CustomizingManagement/GetTableData?I_TABLE=T_METAID_FORN";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    if (oData.results) {
                        oModel.setData(oData);
                        that.getView().setModel(oModel, "MetaIDSupplierJSONModel");
                        originaMetaIDSupplier = [];
                        $.each(that.getView().getModel("MetaIDSupplierJSONModel").getData().results, function (index, elem) {
                            var s_elem = JSON.stringify(elem);
                            originaMetaIDSupplier.push(jQuery.parseJSON(s_elem));
                        });

                    }
                }
            });
        },

        getBUPlant: function (fCompletion) {

            var url = "/backend/CustomizingManagement/GetTableData?I_TABLE=T_BU_PLANT";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    if (oData.results) {
                        oModel.setData(oData);
                        that.getView().setModel(oModel, "BUPlantJSONModel");
                        originaBUPlant = [];
                        $.each(that.getView().getModel("BUPlantJSONModel").getData().results, function (index, elem) {
                            var s_elem = JSON.stringify(elem);
                            originaBUPlant.push(jQuery.parseJSON(s_elem));
                        });

                    }
                }
            });

        },

        getBUPurchaseOrg: function (fCompletion) {

            var url = "/backend/CustomizingManagement/GetTableData?I_TABLE=T_BU_PURCH_ORG";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    if (oData.results) {
                        oModel.setData(oData);
                        that.getView().setModel(oModel, "BUPurchaseOrgJSONModel");
                        originaBUPurchaseOrg = [];
                        $.each(that.getView().getModel("BUPurchaseOrgJSONModel").getData().results, function (index, elem) {
                            var s_elem = JSON.stringify(elem);
                            originaBUPurchaseOrg.push(jQuery.parseJSON(s_elem));
                        });

                    }
                }
            });

        },

        getProfiliConf: function (fCompletion) {

            var url = "/backend/CustomizingManagement/GetTableData?I_TABLE=T_PROFILI_CONFERMA";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    if (oData.results) {
                        $.each(oData.results, function (index, elem) {

                            if (elem.MODIFICA_PREZZO === "X")
                                elem.MODIFICA_PREZZO = true;
                            else
                                elem.MODIFICA_PREZZO = false;
                            elem.PARZIALE_QUANTITA = elem.PARZIALE_QUANTITA === "X" ? true : false;
                            elem.MODIFICA_QUANTITA = elem.MODIFICA_QUANTITA === "X" ? true : false;
                            elem.LOTTO_FORNITORE_INB = elem.LOTTO_FORNITORE_INB === "X" ? true : false;
                            elem.DATA_SCADENZA_INB = elem.DATA_SCADENZA_INB === "X" ? true : false;
                            elem.DATA_PRODUZIONE_INB = elem.DATA_PRODUZIONE_INB === "X" ? true : false;
                            elem.NUMERO_SERIALE_INB = elem.NUMERO_SERIALE_INB === "X" ? true : false;
                            elem.CONFERMA_MANDATORY = elem.CONFERMA_MANDATORY === "X" ? true : false;
                            elem.CONTROLLO_CORSO_APP = elem.CONTROLLO_CORSO_APP === "X" ? true : false;
                            
                        });

                        oModel.setData(oData);
                        that.getView().setModel(oModel, "ProfiliConfermaJSONModel");
                        originalProfiliConferma = [];
                        $.each(that.getView().getModel("ProfiliConfermaJSONModel").getData().results, function (index, elem) {
                            var s_elem = JSON.stringify(elem);
                            originalProfiliConferma.push(jQuery.parseJSON(s_elem));
                        });

                    }
                }
            });


        },

        getProfiliConfHeader: function (fCompletion) {

            var url = "/backend/CustomizingManagement/GetTableData?I_TABLE=T_PROFILI_CONFERMA_HEADER";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    if (oData.results) {
                        $.each(oData.results, function (index, elem) {

                            if (elem.MODIFICA_PREZZO === "X")
                                elem.MODIFICA_PREZZO = true;
                            else
                                elem.MODIFICA_PREZZO = false;
                            
                            elem.CONFERMA_MANDATORY = elem.CONFERMA_MANDATORY === "X" ? true : false;
                            
                        });

                        oModel.setData(oData);
                        that.getView().setModel(oModel, "ProfiliConfermaHeaderJSONModel");
                        originalProfiliConfermaHeader = [];
                        $.each(that.getView().getModel("ProfiliConfermaHeaderJSONModel").getData().results, function (index, elem) {
                            var s_elem = JSON.stringify(elem);
                            originalProfiliConfermaHeader.push(jQuery.parseJSON(s_elem));
                        });

                    }
                }
            });


        },

        getAvvisiQta: function (fCompletion) {

            var url = "/backend/CustomizingManagement/GetTableData?I_TABLE=T_AVVISI_QUALITA";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    if (oData.results) {
                        oModel.setData(oData);
                        that.getView().setModel(oModel, "AvvisiQtaJSONModel");
                        originalAvvisiQta = [];
                        $.each(that.getView().getModel("AvvisiQtaJSONModel").getData().results, function (index, elem) {
                            var s_elem = JSON.stringify(elem);
                            originalAvvisiQta.push(jQuery.parseJSON(s_elem));
                        });

                    }
                }
            });

        },

        getMatriceCriticita: function (fCompletion) {

            var url = "/backend/CustomizingManagement/GetTableData?I_TABLE=T_MATRICE_CRITICITA";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    if (oData.results) {
                        oModel.setData(oData);
                        that.getView().setModel(oModel, "MatriceCriticitaJSONModel");
                        originalMatriceCriticita = [];
                        $.each(that.getView().getModel("MatriceCriticitaJSONModel").getData().results, function (index, elem) {
                            var s_elem = JSON.stringify(elem);
                            originalMatriceCriticita.push(jQuery.parseJSON(s_elem));
                        });
                        //that.getView().byID("MatriceCriticitaTable").setSizeLimit(200);
                    }
                }
            });

        },

        getTipoOrdine: function (fCompletion) {


            var url = "/backend/CustomizingManagement/GetTableData?I_TABLE=T_ORDERS_TYPES";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    if (oData.results) {
                        oModel.setData(oData);
                        that.getView().setModel(oModel, "TipoOrdineJSONModel");
                        originalTipoOrdine = [];
                        $.each(that.getView().getModel("TipoOrdineJSONModel").getData().results, function (index, elem) {
                            var s_elem = JSON.stringify(elem);
                            originalTipoOrdine.push(jQuery.parseJSON(s_elem));
                        });
                    }
                }
            });

        },

        getNotificationMaster: function (fCompletion) {
            var url = "/backend/CustomizingManagement/GetTableData?I_TABLE=T_NOTIF_MASTER";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    if (oData.results) {
                        oModel.setData(oData);
                        that.getView().setModel(oModel, "NotificationMasterJSONModel");
                        originalNotificatioMaster = [];
                        $.each(that.getView().getModel("NotificationMasterJSONModel").getData().results, function (index, elem) {
                            var s_elem = JSON.stringify(elem);
                            originalNotificatioMaster.push(jQuery.parseJSON(s_elem));
                        });
                    }
                }
            });
        },

        getDocumentManagement: function (fCompletion) {

            var url = "/backend/CustomizingManagement/GetTableData?I_TABLE=T_DOCUMENT_MANAGEMENT";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    if (oData.results) {
                        oModel.setData(oData);
                        that.getView().setModel(oModel, "DocumentManagementJSONModel");
                        originalDocumentManagement = [];
                        $.each(that.getView().getModel("DocumentManagementJSONModel").getData().results, function (index, elem) {
                            var s_elem = JSON.stringify(elem);
                            originalDocumentManagement.push(jQuery.parseJSON(s_elem));
                        });
                    }
                }
            });

        },

        getGestioneEtichette: function (fCompletion) {

            var url = "/backend/CustomizingManagement/GetTableData?I_TABLE=T_GESTIONE_ETICHETTE";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    if (oData.results) {
                        oModel.setData(oData);
                        that.getView().setModel(oModel, "GestioneEtichetteJSONModel");
                        originalGestioneEtichette = [];
                        $.each(that.getView().getModel("GestioneEtichetteJSONModel").getData().results, function (index, elem) {
                            var s_elem = JSON.stringify(elem);
                            originalGestioneEtichette.push(jQuery.parseJSON(s_elem));
                        });
                    }
                }
            });
        },

        getNotificationContacts: function (fCompletion) {


            var url = "/backend/CustomizingManagement/GetTableData?I_TABLE=T_NOTIF_CONTACTS";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    if (oData.results) {
                        oModel.setData(oData);
                        that.getView().setModel(oModel, "NotificationContactsJSONModel");
                        originalNotificationContacts = [];
                        $.each(that.getView().getModel("NotificationContactsJSONModel").getData().results, function (index, elem) {
                            var s_elem = JSON.stringify(elem);
                            originalNotificationContacts.push(jQuery.parseJSON(s_elem));
                        });
                    }
                }
            });
        },

        _completeInit: function (sMode, oData, fCompletion) {

            var oModel = new JSONModel();
            if (oData.results)
                oModel.setData(oData);

            that.getView().setModel(oModel, "BuyersJSONModel");
            fCompletion();
        },

        onAddBuyerRow: function () {
            that.getView().getModel("BuyersJSONModel").getData().results.push({
                "USERID": "",
                "BU": "",
                "SYSID": "",
                "PURCH_ORG": "",
                "PLANTS": ""
            });
            that.getView().getModel("BuyersJSONModel").refresh();
        },

        onAddUserIDMetadataIdRow: function () {
            that.getView().getModel("UserIDMetadataIdJSONModel").getData().results.push({
                "USERID": "",
                "METAID": ""
            });
            that.getView().getModel("UserIDMetadataIdJSONModel").refresh();
        },

        onAddMetaIDSupplierRow: function () {
            that.getView().getModel("MetaIDSupplierJSONModel").getData().results.push({
                "METAID": "",
                "LIFNR": "",
                "SYSID": ""
            });
            that.getView().getModel("MetaIDSupplierJSONModel").refresh();
        },

        onAddBUPlantRow: function () {
            that.getView().getModel("BUPlantJSONModel").getData().results.push({
                "BU": "",
                "SYSID": "",
                "PLANT": "",
                "PLANT_DESCR": ""
            });
            that.getView().getModel("BUPlantJSONModel").refresh();
        },

        onAddBUPurchaseOrgRow: function () {
            that.getView().getModel("BUPurchaseOrgJSONModel").getData().results.push({
                "BU": "",
                "SYSID": "",
                "PURCH_ORG": "",
                "PURCH_DESCR": ""
            });
            that.getView().getModel("BUPurchaseOrgJSONModel").refresh();
        },

        onAddProfiliConfermaHeaderRow: function () {
            that.getView().getModel("ProfiliConfermaHeaderJSONModel").getData().results.push({
                "SYSID": "",
                "PROFILO_CONTROLLO": "",
                "MODIFICA_PREZZO": false,
                "PERC_INFERIORE": "",
                "PERC_SUPERIORE": "",
                "TIPO_COND_PREZZO": "",
                "CONFERMA_MANDATORY": false
            });
            that.getView().getModel("ProfiliConfermaHeaderJSONModel").refresh();
        },

        onAddProfiliConfermaRow: function () {
            that.getView().getModel("ProfiliConfermaJSONModel").getData().results.push({
                "SYSID": "",
                "PROFILO_CONTROLLO": "",
                "CAT_CONFERMA": "",
                "DESCRIZIONE": "",
                "OWNER": "",
                "TIPO_CONFERMA": "",
                "MODIFICA_PREZZO": false,
                "PERC_INFERIORE": "",
                "PERC_SUPERIORE": "",
                "PARZIALE_QUANTITA": false,
                "PERC_INFERIORE_QUANT": "",
                "PERC_SUPERIORE_QUANT": "",
                "MODIFICA_QUANTITA": false,
                "TIPO_COND_PREZZO": "",
                "TIPO_CONSEGNA_INB": "",
                "LOTTO_FORNITORE_INB": false,
                "DATA_SCADENZA_INB": false,
                "DATA_PRODUZIONE_INB": false,
                "NUMERO_SERIALE_INB": false,
                "CONFERMA_MANDATORY": false,
                "CONTROLLO_CORSO_APP": false,
                "ZAPPPERSUP": "",
                "ZAPPPERINF": "",
                "ZAPPGGSUP": "",
                "ZAPPGGINF": "",
            });
            that.getView().getModel("ProfiliConfermaJSONModel").refresh();
        },

        onAddAvvisiQtaRow: function () {
            that.getView().getModel("AvvisiQtaJSONModel").getData().results.push({
                "SYSID": "",
                "TIPO_AVVISO": "",
                "IN_PROCESS": "",
                "COMPLETED": "",
                "DIFETTI": "",
                "CAUSE": "",
                "MISURE": "",
                "INTERVENTI": "",
                "TIPO_MSG": "",
                "APPLICAZIONE": ""
            });
            that.getView().getModel("AvvisiQtaJSONModel").refresh();
        },

        onAddMatriceCriticitaRow: function () {
            that.getView().getModel("MatriceCriticitaJSONModel").getData().results.push({
                "RANGE_PERC": null,
                "SCOSTAMENTO_GG": null,
                "CRITICITA": "",
                "DESCRIZIONE": ""
            });
            that.getView().getModel("MatriceCriticitaJSONModel").refresh();
        },

        onAddTipoOrdineRow: function () {
            that.getView().getModel("TipoOrdineJSONModel").getData().results.push({
                "SYSID": "",
                "BSTYP": "",
                "BSART": "",
                "LISTA_ODA": "",
                "LISTA_RESI": "",
                "LISTA_RFQ": "",
                "PLANNING": "",
                "MESSAGE_TYPE": "",
                "APPLICATION": "",
                "TIME_DEPENDENT" : "",
                "GG_ESTRAZIONE" :"",
                "PROGRESSIVI": ""
            });
            that.getView().getModel("TipoOrdineJSONModel").refresh();
        },

        onAssNotificationMaterRow: function () {
            that.getView().getModel("NotificationMasterJSONModel").getData().results.push({
                "FLUSSO": "",
                "TIPO_STRUTTURA": "",
                "APPLICAZIONE": "",
                "EVENTO": "",
                "DIREZIONE": ""
            });
            that.getView().getModel("NotificationMasterJSONModel").refresh();
        },

        onAssDocumentManagementRow: function () {
            that.getView().getModel("DocumentManagementJSONModel").getData().results.push({
                "SYSID": "",
                "APPLICATION": "",
                "CLASSIFICATION": "",
                "DOC_IN": "",
                "DOC_OUT": "",
                "ARCHIVE_LINK_ACTIVE": "",
                "DMS_ACTIVE": "",
                "DMS_DOC_TYPE_IN": "",
                "DMS_VERSION_IN": "",
                "DMS_DOC_TYPE_OUT": "",
                "DMS_VERSION_OUT": "",
                "DMS_DOC_OBJ": ""
            });
            that.getView().getModel("DocumentManagementJSONModel").refresh();
        },

        onAssGestioneEtichetteRow: function () {
            that.getView().getModel("GestioneEtichetteJSONModel").getData().results.push({
                "SYSID": "",
                "PLANT": "",
                "MATERIALE_IMBALLO": "",
                "TIPO_MSG_HU": "",
                "APPLICAZIONE": ""
            });
            that.getView().getModel("GestioneEtichetteJSONModel").refresh();
        },

        onAssNotificationContactsRow: function () {
            that.getView().getModel("NotificationContactsJSONModel").getData().results.push({
                "STRUTTURA": "",
                "TIPO_STRUTTURA": "",
                "FLUSSO": "",
                "CONT": 0,
                "EMAIL": ""
            });
            that.getView().getModel("NotificationContactsJSONModel").refresh();
        },

        onSaveBuyerList: function () {
            if (that.getView().getModel("BuyersJSONModel").getData().results) {
                var promiseArr = []
                $.each(that.getView().getModel("BuyersJSONModel").getData().results, function (index, elem) {
                    promiseArr.push(new Promise(function (resolve, reject) {
                        that.saveBuyer(elem, function () {
                            resolve()
                        });
                    }))
                });
                Promise.all(promiseArr).then(values => {
                    that.onAfterRendering()
                });
            }
        },

        onSaveUserIDMetadataIdList: function () {

            if (that.getView().getModel("UserIDMetadataIdJSONModel").getData().results) {
                var promiseArr = []
                $.each(that.getView().getModel("UserIDMetadataIdJSONModel").getData().results, function (index, elem) {
                    promiseArr.push(new Promise(function (resolve, reject) {
                        that.saveUserIDMetadataId(elem, function () {
                            resolve()
                        })
                    }))
                })
                Promise.all(promiseArr).then(values => {
                    that.getUserIDMetadataId()
                });
            }
        },

        onSaveMetaIDSupplierList: function () {
            if (that.getView().getModel("MetaIDSupplierJSONModel").getData().results) {
                var promiseArr = []
                $.each(that.getView().getModel("MetaIDSupplierJSONModel").getData().results, function (index, elem) {

                    promiseArr.push(new Promise(function (resolve, reject) {
                        that.onSaveMetaIDSupplier(elem, function () {
                            resolve()
                        })
                    }))
                })
                Promise.all(promiseArr).then(values => {
                    that.getMetaIDSupplier()
                });
            }
        },

        onSaveBUPlantList: function () {
            if (that.getView().getModel("BUPlantJSONModel").getData().results) {
                var promiseArr = []
                $.each(that.getView().getModel("BUPlantJSONModel").getData().results, function (index, elem) {
                    promiseArr.push(new Promise(function (resolve, reject) {
                        that.onSaveBUPlant(elem, function () {
                            resolve()
                        })
                    }))
                })
                Promise.all(promiseArr).then(values => {
                    that.getBUPlant()
                });
            }
        },
        onSaveProfiliConfermaHeaderList: function () {
            if (that.getView().getModel("ProfiliConfermaHeaderJSONModel").getData().results) {
                var promiseArr = []
                $.each(that.getView().getModel("ProfiliConfermaHeaderJSONModel").getData().results, function (index, elem) {

                    if (elem.MODIFICA_PREZZO === true)
                        elem.MODIFICA_PREZZO = "X";
                    else
                        elem.MODIFICA_PREZZO = "";
                    elem.CONFERMA_MANDATORY = elem.CONFERMA_MANDATORY === true ? "X" : "";

                    promiseArr.push(new Promise(function (resolve, reject) {
                        that.onSaveProfiliConfHeader(elem, function () {
                            resolve()
                        })
                    }))
                })
                Promise.all(promiseArr).then(values => {
                    that.getProfiliConfHeader()
                });
            }
        },

        onSaveProfiliConfermaList: function () {
            if (that.getView().getModel("ProfiliConfermaJSONModel").getData().results) {
                var promiseArr = []
                $.each(that.getView().getModel("ProfiliConfermaJSONModel").getData().results, function (index, elem) {

                    if (elem.MODIFICA_PREZZO === true)
                        elem.MODIFICA_PREZZO = "X";
                    else
                        elem.MODIFICA_PREZZO = "";
                    elem.PARZIALE_QUANTITA = elem.PARZIALE_QUANTITA === true ? "X" : "";
                    elem.MODIFICA_QUANTITA = elem.MODIFICA_QUANTITA === true ? "X" : "";
                    elem.LOTTO_FORNITORE_INB = elem.LOTTO_FORNITORE_INB === true ? "X" : "";
                    elem.DATA_SCADENZA_INB = elem.DATA_SCADENZA_INB === true ? "X" : "";
                    elem.DATA_PRODUZIONE_INB = elem.DATA_PRODUZIONE_INB === true ? "X" : "";
                    elem.NUMERO_SERIALE_INB = elem.NUMERO_SERIALE_INB === true ? "X" : "";
                    elem.CONFERMA_MANDATORY = elem.CONFERMA_MANDATORY === true ? "X" : "";
                    elem.CONTROLLO_CORSO_APP = elem.CONTROLLO_CORSO_APP === true ? "X" : "";

                    promiseArr.push(new Promise(function (resolve, reject) {
                        that.onSaveProfiliConf(elem, function () {
                            resolve()
                        })
                    }))
                })
                Promise.all(promiseArr).then(values => {
                    that.getProfiliConf()
                });
            }
        },

        onSaveBUPurchaseOrgList: function () {
            if (that.getView().getModel("BUPurchaseOrgJSONModel").getData().results) {
                var promiseArr = []
                $.each(that.getView().getModel("BUPurchaseOrgJSONModel").getData().results, function (index, elem) {

                    promiseArr.push(new Promise(function (resolve, reject) {
                        that.onSaveBUPurchaseOrg(elem, function () {
                            resolve()
                        })
                    }))
                })
                Promise.all(promiseArr).then(values => {
                    that.getBUPurchaseOrg()
                });
            }
        },

        onSaveAvvisiQtaList: function () {
            if (that.getView().getModel("AvvisiQtaJSONModel").getData().results) {
                var promiseArr = []
                $.each(that.getView().getModel("AvvisiQtaJSONModel").getData().results, function (index, elem) {
                    promiseArr.push(new Promise(function (resolve, reject) {
                        that.onSaveAvvisiQta(elem, function () {
                            resolve()
                        })
                    }))
                })
                Promise.all(promiseArr).then(values => {
                    that.getAvvisiQta()
                });
            }
        },

        onSaveMatriceCriticitaList: function () {
            if (that.getView().getModel("MatriceCriticitaJSONModel").getData().results) {
                var promiseArr = []
                $.each(that.getView().getModel("MatriceCriticitaJSONModel").getData().results, function (index, elem) {

                    promiseArr.push(new Promise(function (resolve, reject) {
                        that.onSaveMatriceCriticita(elem, function () {
                            resolve()
                        })
                    }))

                })
                Promise.all(promiseArr).then(values => {
                    that.getMatriceCriticita()
                });
            }
        },

        onSaveTipoOrdineList: function () {
            if (that.getView().getModel("TipoOrdineJSONModel").getData().results) {
                var promiseArr = []
                $.each(that.getView().getModel("TipoOrdineJSONModel").getData().results, function (index, elem) {
                    promiseArr.push(new Promise(function (resolve, reject) {
                        that.onSaveTipoOrdine(elem, function () {
                            resolve()
                        })
                    }))
                })
                Promise.all(promiseArr).then(values => {
                    that.getTipoOrdine()
                });
            }
        },

        onSaveGestioneEtichetteList: function () {
            if (that.getView().getModel("GestioneEtichetteJSONModel").getData().results) {
                var promiseArr = []
                $.each(that.getView().getModel("GestioneEtichetteJSONModel").getData().results, function (index, elem) {

                    promiseArr.push(new Promise(function (resolve, reject) {
                        that.onSaveGestioneEtichette(elem, function () {
                            resolve()
                        })
                    }))
                })
                Promise.all(promiseArr).then(values => {
                    that.getGestioneEtichette()
                });
            }
        },

        onSaveNotificationContactsList: function () {
            if (that.getView().getModel("NotificationContactsJSONModel").getData().results) {
                var promiseArr = []
                $.each(that.getView().getModel("NotificationContactsJSONModel").getData().results, function (index, elem) {
                    promiseArr.push(new Promise(function (resolve, reject) {
                        that.onSaveNotificationContacts(elem, function () {
                            resolve()
                        })
                    }))
                })
                Promise.all(promiseArr).then(values => {
                    that.getNotificationContacts()
                });
            }
        },

        onNotificationMaterList: function () {
            if (that.getView().getModel("NotificationMasterJSONModel").getData().results) {
                var promiseArr = []
                $.each(that.getView().getModel("NotificationMasterJSONModel").getData().results, function (index, elem) {
                    promiseArr.push(new Promise(function (resolve, reject) {
                        that.onSaveNotificationMaster(elem, function () {
                            resolve()
                        })
                    }))
                })
                Promise.all(promiseArr).then(values => {
                    that.getNotificationMaster()
                });
            }
        },

        onDocumentManagementList: function () {
            if (that.getView().getModel("DocumentManagementJSONModel").getData().results) {
                var promiseArr = []
                $.each(that.getView().getModel("DocumentManagementJSONModel").getData().results, function (index, elem) {
                    promiseArr.push(new Promise(function (resolve, reject) {
                        that.onSaveDocumentManagement(elem, function () {
                            resolve()
                        })
                    }))
                })
                Promise.all(promiseArr).then(values => {
                    that.getDocumentManagement()
                });
            }
        },

        onGestioneEtichetteList: function () {
            if (that.getView().getModel("GestioneEtichetteJSONModel").getData().results) {
                var promiseArr = []
                $.each(that.getView().getModel("GestioneEtichetteJSONModel").getData().results, function (index, elem) {
                    promiseArr.push(new Promise(function (resolve, reject) {
                        that.onSaveGestioneEtichette(elem, function () {
                            resolve()
                        })
                    }))
                })
                Promise.all(promiseArr).then(values => {
                    that.getGestioneEtichette()
                });
            }
        },
        saveBuyer: function (buyer, fCompletion) {
            var url = "/backend/CustomizingManagement/SaveTBuyers";
            that.ajaxPost(url, buyer, function (oData) {
                if (oData) {
                    fCompletion(oData);
                }
            })
        },
        saveUserIDMetadataId: function (elem, fCompletion) {
            var url = "/backend/CustomizingManagement/SaveTUserIdMetaId";
            that.ajaxPost(url, elem, function (oData) {
                if (oData) {
                    fCompletion(oData);
                }
            })
        },
        onSaveMetaIDSupplier: function (elem, fCompletion) {
            var url = "/backend/CustomizingManagement/SaveTMetaIdForn";
            that.ajaxPost(url, elem, function (oData) {
                if (oData) {
                    fCompletion(oData);
                }
            })
        },
        onSaveBUPlant: function (elem, fCompletion) {
            var url = "/backend/CustomizingManagement/SaveTBuPlant";
            that.ajaxPost(url, elem, function (oData) {
                if (oData) {
                    fCompletion(oData);
                }
            })
        },
        onSaveBUPurchaseOrg: function (elem, fCompletion) {
            var url = "/backend/CustomizingManagement/SaveTBuPurchOrg";
            that.ajaxPost(url, elem, function (oData) {
                if (oData) {
                    fCompletion(oData);
                }
            })
        },

        onSaveProfiliConf: function (elem, fCompletion) {
            var url = "/backend/CustomizingManagement/SaveTProfiliConferma";
            that.ajaxPost(url, elem, function (oData) {
                if (oData) {
                    fCompletion(oData);
                }
            })
        },

        onSaveProfiliConfHeader: function (elem, fCompletion) {
            var url = "/backend/CustomizingManagement/SaveTProfiliConfermaHeader";
            that.ajaxPost(url, elem, function (oData) {
                if (oData) {
                    fCompletion(oData);
                }
            })
        },

        onSaveAvvisiQta: function (elem, fCompletion) {
            var url = "/backend/CustomizingManagement/SaveTAvvisiQualita";
            that.ajaxPost(url, elem, function (oData) {
                if (oData) {
                    fCompletion(oData);
                }
            })
        },

        onSaveMatriceCriticita: function (elem, fCompletion) {
            var url = "/backend/CustomizingManagement/SaveTMatriceCriticita";
            that.ajaxPost(url, elem, function (oData) {
                if (oData) {
                    fCompletion(oData);
                }
            })
        },

        onSaveTipoOrdine: function (elem, fCompletion) {
            var url = "/backend/CustomizingManagement/SaveTOrdersTypes";
            that.ajaxPost(url, elem, function (oData) {
                if (oData) {
                    fCompletion(oData);
                }
            })
        },

        onSaveNotificationMaster: function (elem, fCompletion) {
            var url = "/backend/CustomizingManagement/SaveTNotifMaster";
            that.ajaxPost(url, elem, function (oData) {
                if (oData) {
                    fCompletion(oData);
                }
            })
        },
        onSaveDocumentManagement: function (elem, fCompletion) {
            var url = "/backend/CustomizingManagement/SaveTDocumentManagement";
            that.ajaxPost(url, elem, function (oData) {
                if (oData) {
                    fCompletion(oData);
                }
            })
        },
        onSaveGestioneEtichette: function (elem, fCompletion) {
            var url = "/backend/CustomizingManagement/SaveTGestioneEtichette";
            that.ajaxPost(url, elem, function (oData) {
                if (oData) {
                    fCompletion(oData);
                }
            })
        },
        onSaveNotificationContacts: function (elem, status, fCompletion) {
            var url = "/backend/CustomizingManagement/SaveTNotifContacts";
            that.ajaxPost(url, elem, function (oData) {
                if (oData) {
                    fCompletion(oData);
                }
            })
        },

        deleteBuyer: function (id, bu) {
            var url = "/backend/CustomizingManagement/TBuyers?I_USERID=" + id + "&I_BU=" + bu;
            that.ajaxDelete(url, function (oData) {
                if (oData) {
                    that.onAfterRendering();
                }
            })
        },

        deleteUserIDMetadataId: function (id) {
            var url = "/backend/CustomizingManagement/TUserIdMetaId?I_USERID=" + id;
            that.ajaxDelete(url, function (oData) {
                if (oData) {
                    that.getUserIDMetadataId();
                }
            })
        },

        deleteMetaIDSupplier: function (id, lifnr) {
            var currentSYSID = sap.ui.getCore().getModel("sysIdJSONModel") !== undefined && sap.ui.getCore().getModel(
                "sysIdJSONModel").getData() !==
                undefined ? sap.ui.getCore().getModel("sysIdJSONModel").getData().SYSID : "";

            var url = "/backend/CustomizingManagement/TMetaIdForn?I_METAID=" + id + "&I_LIFNR=" + lifnr + "&I_SYSID=" + currentSYSID
            that.ajaxDelete(url, function (oData) {
                if (oData) {
                    that.getMetaIDSupplier();
                }
            })
        },
        deleteBUPlant: function (bu, sysid, plant) {
            var url = "/backend/CustomizingManagement/TBuPlant?I_PLANT=" + plant + "&I_BU=" + bu + "&I_SYSID=" + sysid
            that.ajaxDelete(url, function (oData) {
                if (oData) {
                    that.getBUPlant();
                }
            })
        },
        deleteBUPurchaseOrg: function (bu, sysid, purch) {
            var url = "/backend/CustomizingManagement/TBuPurchOrg?I_BU=" + bu + "&I_PURCH_ORG=" + purch + "&I_SYSID=" + sysid
            that.ajaxDelete(url, function (oData) {
                if (oData) {
                    that.getBUPurchaseOrg();
                }
            })
        },
        deleteProfiliConfermaHeader: function (sysid, pofcont) {
            var url = "/backend/CustomizingManagement/TProfiliConfermaHeader?I_SYSID=" + sysid + "&I_PROFILO_CONTROLLO=" + pofcont
            that.ajaxDelete(url, function (oData) {
                if (oData) {
                    that.getProfiliConfHeader();
                }
            })
        },
        deleteProfiliConferma: function (sysid, pofcont, catconf) {
            var url = "/backend/CustomizingManagement/TProfiliConferma?I_PROFILO_CONTROLLO=" + pofcont + "&I_CAT_CONFERMA=" + catconf + "&I_SYSID=" + sysid
            that.ajaxDelete(url, function (oData) {
                if (oData) {
                    that.getProfiliConf();
                }
            })
        },
        deleteAvvisiQta: function (sysid, tav) {
            var url = "/backend/CustomizingManagement/TAvvisiQualita?I_TIPO_AVVISO=" + tav + "&I_SYSID=" + sysid
            that.ajaxDelete(url, function (oData) {
                if (oData) {
                    that.getAvvisiQta();
                }
            })
        },

        deleteMatriceCriticita: function (renge, scost) {
            var url = "/backend/CustomizingManagement/TMatriceCriticita?I_RANGE_PERC=" + renge + "&I_SCOSTAMENTO_GG=" + scost
            that.ajaxDelete(url, function (oData) {
                if (oData) {
                    that.getMatriceCriticita();
                }
            })
        },

        deleteTipoOrdine: function (sys, bstyp, bsart) {
            var url = "/backend/CustomizingManagement/TOrdersTypes?I_BSTYP=" + bstyp + "&I_BSART=" + bsart + "&I_SYSID=" + sys
            that.ajaxDelete(url, function (oData) {
                if (oData) {
                    that.getTipoOrdine();
                }
            })
        },

        deleteNotificationMaster: function (flusso, tipo_struttura, applicazione, evento, direzione) {
            var url = "/backend/CustomizingManagement/TNotifMaster?I_FLUSSO=" + flusso + "&I_TIPO_STRUTTURA=" + tipo_struttura + "&I_APPLICAZIONE=" + applicazione + "&I_EVENTO=" + evento + "&I_DIREZIONE=" + direzione
            that.ajaxDelete(url, function (oData) {
                if (oData) {
                    that.getNotificationMaster();
                }
            })
        },

        deleteDocumentManagement: function (sysid, application, classification) {
            var url = "/backend/CustomizingManagement/TDocumentManagement?I_SYSID=" + sysid + "&I_APPLICATION=" + application + "&I_CLASSIFICATION=" + classification
            that.ajaxDelete(url, function (oData) {
                if (oData) {
                    that.getDocumentManagement();
                }
            })
        },

        deleteGestioneEtichette: function (sysid, plant) {
            var url = "/backend/CustomizingManagement/TGestioneEtichette?I_SYSID=" + sysid + "&I_PLANT=" + plant
            that.ajaxDelete(url, function (oData) {
                if (oData) {
                    that.getGestioneEtichette();
                }
            })
        },

        deleteNotificationContacts: function (struttura, tipo_struttura, flusso, cont) {
            var url = "/backend/CustomizingManagement/TNotifContacts?I_STRUTTURA=" + struttura + "&I_TIPO_STRUTTURA=" + tipo_struttura + "&I_FLUSSO=" + flusso + "&I_CONT=" + cont
            that.ajaxDelete(url, function (oData) {
                if (oData) {
                    that.getNotificationContacts();
                }
            })
        },
        
        deleteBuyerRow: function (oEvent) {
            var getTabledata = that.getView().getModel("BuyersJSONModel").getData().results;
            var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
            var selctedRowdata = getTabledata[itemPosition];
            that.deleteBuyer(selctedRowdata.USERID, selctedRowdata.BU);
        },

        deleteUserIDMetadataIdRow: function (oEvent) {
            var getTabledata = that.getView().getModel("UserIDMetadataIdJSONModel").getData().results;
            var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
            var selctedRowdata = getTabledata[itemPosition];
            that.deleteUserIDMetadataId(selctedRowdata.USERID);
        },

        deleteMetaIDSupplierRow: function (oEvent) {
            var getTabledata = that.getView().getModel("MetaIDSupplierJSONModel").getData().results;
            var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
            var selctedRowdata = getTabledata[itemPosition];
            that.deleteMetaIDSupplier(selctedRowdata.METAID, selctedRowdata.LIFNR);
        },
        deleteBUPlantRow: function (oEvent) {
            var getTabledata = that.getView().getModel("BUPlantJSONModel").getData().results;
            var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
            var selctedRowdata = getTabledata[itemPosition];
            that.deleteBUPlant(selctedRowdata.BU, selctedRowdata.SYSID, selctedRowdata.PLANT);
        },
        deleteBUPurchaseOrgRow: function (oEvent) {
            var getTabledata = that.getView().getModel("BUPurchaseOrgJSONModel").getData().results;
            var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
            var selctedRowdata = getTabledata[itemPosition];
            that.deleteBUPurchaseOrg(selctedRowdata.BU, selctedRowdata.SYSID, selctedRowdata.PURCH_ORG);
        },
        deleteProfiliConfermaRow: function (oEvent) {
            var keys = oEvent.getParameter("id");
            var splits = keys.split("-");
            var sessionRow = splits[splits.length - 1];
            var getTabledata = that.getView().getModel("ProfiliConfermaJSONModel").getData().results;
            // var itemPosition = oEvent.getSource().getParent().indexOfItem(oEvent.getSource().getParent());
            var selctedRowdata = getTabledata[sessionRow];
            that.deleteProfiliConferma(selctedRowdata.SYSID, selctedRowdata.PROFILO_CONTROLLO, selctedRowdata.CAT_CONFERMA);
        },
        deleteProfiliConfermaHeaderRow: function (oEvent) {
            var keys = oEvent.getParameter("id");
            var splits = keys.split("-");
            var sessionRow = splits[splits.length - 1];
            var getTabledata = that.getView().getModel("ProfiliConfermaHeaderJSONModel").getData().results;
            var selctedRowdata = getTabledata[sessionRow];
            that.deleteProfiliConfermaHeader(selctedRowdata.SYSID, selctedRowdata.PROFILO_CONTROLLO);
        },
        deleteAvvisiQtaRow: function (oEvent) {
            var getTabledata = that.getView().getModel("AvvisiQtaJSONModel").getData().results;
            var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
            var selctedRowdata = getTabledata[itemPosition];
            that.deleteAvvisiQta(selctedRowdata.SYSID, selctedRowdata.TIPO_AVVISO);
        },
        deleteMatriceCriticitaRow: function (oEvent) {
            var getTabledata = that.getView().getModel("MatriceCriticitaJSONModel").getData().results;
            var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
            var selctedRowdata = getTabledata[itemPosition];
            that.deleteMatriceCriticita(selctedRowdata.RANGE_PERC, selctedRowdata.SCOSTAMENTO_GG);
        },

        deleteTipoOrdineRow: function (oEvent) {
            var getTabledata = that.getView().getModel("TipoOrdineJSONModel").getData().results;
            var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
            var selctedRowdata = getTabledata[itemPosition];
            that.deleteTipoOrdine(selctedRowdata.SYSID, selctedRowdata.BSTYP, selctedRowdata.BSART);
        },

        deleteNotificationMaterRow: function (oEvent) {
            var getTabledata = that.getView().getModel("NotificatiobMasterJSONModel").getData().results;
            var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
            var selctedRowdata = getTabledata[itemPosition];
            that.deleteNotificationMaster(selctedRowdata.FLUSSO, selctedRowdata.TIPO_STRUTTURA, selctedRowdata.APPLICAZIONE, selctedRowdata.EVENTO,
                selctedRowdata.DIREZIONE);
        },

        deleteDocumentManagementRow: function (oEvent) {
            var getTabledata = that.getView().getModel("DocumentManagementJSONModel").getData().results;
            var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
            var selctedRowdata = getTabledata[itemPosition];
            that.deleteDocumentManagement(selctedRowdata.SYSID, selctedRowdata.APPLICATION, selctedRowdata.CLASSIFICATION);
        },

        deleteGestioneEtichetteRow: function (oEvent) {
            var getTabledata = that.getView().getModel("GestioneEtichetteJSONModel").getData().results;
            var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
            var selctedRowdata = getTabledata[itemPosition];
            that.deleteGestioneEtichette(selctedRowdata.SYSID, selctedRowdata.PLANT);
        },

        deleteNotificationContactsRow: function (oEvent) {
            var getTabledata = that.getView().getModel("NotificationContactsJSONModel").getData().results;
            var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
            var selctedRowdata = getTabledata[itemPosition];
            that.deleteNotificationContacts(selctedRowdata.STRUTTURA, selctedRowdata.TIPO_STRUTTURA, selctedRowdata.FLUSSO, selctedRowdata.CONT);
        },
        onTabChange: function (oEvent) {
            var key = oEvent.getParameters().key;
            if (key === "1") {
                that.onAfterRendering();
            }
            if (key === "2") {
                that.getUserIDMetadataId();
            }
            // if (key === "3") {
            // 	that.getPurchaseOrganizations();
            // }
            if (key === "3") {
                that.getMetaIDSupplier();
            }
            if (key === "4") {
                that.getBUPlant();
            }
            if (key === "5") {
                that.getBUPurchaseOrg();
            }
            if (key === "6") {
                that.getProfiliConf();
            }
            if (key === "7") {
                that.getAvvisiQta();
            }
            if (key === "8") {
                that.getMatriceCriticita();
            }
            if (key === "9") {
                that.getTipoOrdine();
            }
            if (key === "10") {
                that.getNotificationMaster();
            }
            if (key === "11") {
                that.getDocumentManagement();
            }
            if (key === "12") {
                that.getGestioneEtichette();
            }
            if (key === "13") {
                that.getNotificationContacts();
            }
            if (key === "14") {
                that.getProfiliConfHeader();
            }
        },

        showBusyDialog: function () {
            oGlobalBusyDialog.setText("loading...");
            oGlobalBusyDialog.open();
            bGlobalBusyDialogIsShown = true;
        },

        updateBusyDialog: function (sText) {
            if (bGlobalBusyDialogIsShown) {
                oGlobalBusyDialog.setText(sText);
            }
        },

        hideBusyDialog: function () {
            oGlobalBusyDialog.close();
            bGlobalBusyDialogIsShown = false;
        }

    });
});