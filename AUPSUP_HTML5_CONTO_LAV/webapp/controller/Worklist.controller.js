sap.ui.define([
    "it/aupsup/conto_lav/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Sorter",
    "it/aupsup/conto_lav/js/Date",
    "it/aupsup/conto_lav/js/TimestampFormatter",
    "it/aupsup/conto_lav/js/formatter",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/m/Dialog",
    "sap/ui/core/Fragment",
    "sap/ui/table/RowSettings",
], function (BaseController, Filter, FilterOperator, JSONModel, MessageBox, MessageToast, Sorter, DateF, TimestampFormatter, Formatter, Export, ExportTypeCSV, Dialog,Fragment,RowSettings) {
    "use strict";
    var that;

    Number.prototype.pad = function(n) {
        return new Array(n).join('0').slice((n || 2) * -1) + this;
    }

    return BaseController.extend("it.aupsup.conto_lav.controller.Worklist", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf it.alteaup.supplier.portal.purchaseorders.PurchaseOrders.view.Worklist
		 */
        pressDialog: null,
        onInit: function () {
            that = this;

            var promiseArr = []
            promiseArr.push(new Promise(function (resolve, reject) {
                that.onGetOdataColumns(function () {
                    resolve()
                })
            }))
            promiseArr.push(new Promise(function (resolve, reject) {
                that.getCurrentSYSID(function () {
                    resolve()
                })
            }))
            promiseArr.push(new Promise(function (resolve, reject) {
                that.getPlants(function () {
                    resolve()
                })
            }))
            promiseArr.push(new Promise(function (resolve, reject) {
                that.getPurchaseOrganizations(function () {
                    resolve()
                })
            }))
            promiseArr.push(new Promise(function (resolve, reject) {
                that.getMetasupplier(function () {
                    resolve()
                })
            }))
            promiseArr.push(new Promise(function (resolve, reject) {
                that.getPurchaseGroup(function () {
                    resolve()
                })
            }))
            promiseArr.push(new Promise(function (resolve, reject) {
                that.getAllProfiliConsegna(function () {
                    resolve()
                })
            }))
            Promise.all(promiseArr).then(values => {

            });

            var filterOrd = {
                "ebeln": "",
                "ebelp": "",
                "lifnr": [],
                "matnr": [],
                "MatnrDesc": "",
                "werks": [],
                "orderType": "ODA",
                "spras": that.getLanguage(),
                "days": null
            };

            var oModelFI = new JSONModel();
            oModelFI.setData(filterOrd);
            this.getView().setModel(oModelFI, "filterOrdersJSONModel");

        },

        onChangeMetasupplier: function (oEvent) {

			var selectedKeyArray = oEvent.oSource.getSelectedKeys();
			var metaIdlist = that.getModel("MetasupplierJSONModel").getData().results;
			var selectedMetaid = "";
			var lifnr = [];
			var slifnr = [];
			if (selectedKeyArray != undefined) {
				for (var i = 0; i < selectedKeyArray.length; i++) {
					if (metaIdlist != undefined) {
						selectedMetaid = metaIdlist.find(x => x.METAID === selectedKeyArray[i]);
						if (selectedMetaid !== undefined) {
							if (selectedMetaid.LIFNR != undefined) {
								for (var j = 0; j < selectedMetaid.LIFNR.length; j++) {
									lifnr.push(selectedMetaid.LIFNR[j]);
									slifnr.push(selectedMetaid.LIFNR[j].LIFNR);
								}
							}
						}
					}
				}
			}

			var oModelLF = new JSONModel();
			oModelLF.setData(lifnr);
			that.getView().setModel(oModelLF, "lifnrJSONModel");
			that.getModel("filterOrdersJSONModel").getData().lifnr = slifnr;

		},

        onOrderPress: function (oEvent) {
            var oPath = oEvent.getSource().getParent().getParent().getBindingContext("DocumentsJSONModel").sPath;
            var mod = this.getView().getModel("DocumentsJSONModel").getProperty(oPath);
            mod.visibility = !mod.visibility;
            if (mod.visibility)
                mod.IcoArrow = "sap-icon://navigation-down-arrow"
            else
                mod.IcoArrow = "sap-icon://navigation-right-arrow"

            this.getView().getModel("DocumentsJSONModel").refresh();
        },

        onPositionPress: function (oEvent) {
            var oPath = oEvent.getSource().getParent().getParent().getBindingContext("DocumentsJSONModel").sPath;
            var mod = this.getView().getModel("DocumentsJSONModel").getProperty(oPath);
            mod.ConfermePrezzoVisibility = !mod.ConfermePrezzoVisibility;
            mod.ConfermeQuantitaVisibility = !mod.ConfermeQuantitaVisibility;
            if (mod.ConfermePrezzoVisibility) {
                mod.IcoArrowQuantita = "sap-icon://navigation-down-arrow"
                mod.IcoArrowPrezzo = "sap-icon://navigation-down-arrow"
            } else {
                mod.IcoArrowQuantita = "sap-icon://navigation-right-arrow"
                mod.IcoArrowPrezzo = "sap-icon://navigation-down-arrow"
            }
            this.getView().getModel("DocumentsJSONModel").refresh();
        },

        onSearchOrders: function () {

            var url = "/backend/ContoLavManagement/GetContoLav";
            var body = that.getModel("filterOrdersJSONModel").getData();

            var jsonBody = JSON.parse(JSON.stringify(body));

            // add 0 before ebelp
            //if(jsonBody.ebelp !== undefined && jsonBody.ebelp !== ''){
            //    if(jsonBody.ebelp.length !== 5){
            //    	while(jsonBody.ebelp.length < 5){
			//		  jsonBody.ebelp = '0' + jsonBody.ebelp
			//		}
            //    }
            //}

            that.showBusyDialog();
            that.ajaxPost(url, jsonBody, function (oData) {
                that.hideBusyDialog();
                if (oData) {

                    var oModel = new JSONModel();
                    oModel.setData(oData);
                    that.getView().setModel(oModel, "DocumentsJSONModel");

                }
            })

        },

        onAfterRendering: function () {
            that.getUserInfo();
        },

        onClearFilters: function () {

			if (that.getModel("filterOrdersJSONModel") !== undefined && that.getModel("filterOrdersJSONModel").getData() !== undefined) {
				that.getModel("filterOrdersJSONModel").getData().MatnrDesc = '';
				that.getModel("filterOrdersJSONModel").getData().matnr = [];
                that.getModel("filterOrdersJSONModel").getData().ebeln = '';
                that.getModel("filterOrdersJSONModel").getData().ebelp = '';                
				that.getModel("filterOrdersJSONModel").getData().lifnr = [];
				that.getModel("filterOrdersJSONModel").getData().ekorg = [];
				that.getModel("filterOrdersJSONModel").getData().ekgrp = [];
				that.getModel("filterOrdersJSONModel").getData().werks = [];
				that.getModel("filterOrdersJSONModel").getData().spras = that.getLanguage();
			}
			if (that.getModel("MetasupplierJSONModel") !== undefined && that.getModel("MetasupplierJSONModel").getData() !== undefined) {
				that.getModel("MetasupplierJSONModel").getData().METAID = '';
			}
			if (that.getModel("lifnrJSONModel") !== undefined && that.getModel("lifnrJSONModel").getData() !== undefined) {
				that.getModel("lifnrJSONModel").setData(null);
			}
			if (that.getModel("filterOrdersJSONModel") !== undefined)
				that.getModel("filterOrdersJSONModel").refresh();
			if (that.getModel("MetasupplierJSONModel") !== undefined)
				that.getModel("MetasupplierJSONModel").refresh();
			if (that.getModel("lifnrJSONModel") !== undefined)
				that.getModel("lifnrJSONModel").refresh();
        },
        
		onClearMaterialSearchFilters: function () {
			this.getView().getModel("MatnrSearchJSONModel").getData().matnr = "";
			this.getView().getModel("MatnrSearchJSONModel").getData().maktx = "";
			that.getView().getModel("MatnrJSONModel").setData(null);
			this.getView().getModel("MatnrSearchJSONModel").refresh();
		},        

        handleMatnr: function () {

            if (!that.oSearchMatnrDialog) {
                that.oSearchMatnrDialog = sap.ui.xmlfragment("it.aupsup.conto_lav.fragments.SearchMatnr", that);
                that.getView().addDependent(that.oSearchMatnrDialog);
            }
            that.oSearchMatnrDialog.open();
            var oTable = sap.ui.getCore().byId("idMatnrTable");
            var oItems = oTable.getItems();

            var body = {
                "matnr": "",
                "maktx": ""
            };
            var oModelMT = new JSONModel();
            oModelMT.setData(body);
            this.getView().setModel(oModelMT, "MatnrSearchJSONModel");
            this.getView().getModel("MatnrJSONModel").setData(null);
            // var selectedMatnr = that.getModel("filterOrdersJSONModel").getData().matnr;
            // var matnr = that.getModel("MatnrJSONModel");
            // if (matnr !== undefined && matnr.getData() && matnr.getData().results) {
            // 	for (var i = 0; i < matnr.getData().results.length; i++) {
            // 		for (var j = 0; j < selectedSupplier.length; j++) {
            // 			if (selectedSupplier[j].ELIFN === matnr.getData().results[i].LIFNR) {
            // 				oItems[i].setSelected(true);
            // 			}
            // 		}
            // 	}
            // }
        },
        onCloseSearchMatnr: function () {
            if (this.oSearchMatnrDialog) {
                this.oSearchMatnrDialog.close();
                this.oSearchMatnrDialog.destroy();
                this.oSearchMatnrDialog = undefined;
            }
        },
        onSearchMatnr: function () {
            // ricerca materiali da popup
            var url = "/backend/Utils/UtilsManagement/SearchMaterial";
            var body = this.getView().getModel("MatnrSearchJSONModel").getData();
            this.showBusyDialog();
            that.ajaxPost(url, body, function (oData) {
                that.hideBusyDialog();
                if (oData) {
                    var oModel = new JSONModel();
                    oModel.setData(oData);
                    that.getView().setModel(oModel, "MatnrJSONModel");
                }
            })
        },

        onConfirmMatnr: function () {
            var oTable = sap.ui.getCore().byId("idMatnrTable");
            var aIndices = oTable.indexOfItem(oTable.getSelectedItem());
            var selectedMatnr = [];
            var selectedMatnrDesc = "";
            if (aIndices.length < 1) {
                MessageToast.show(that.getResourceBundle().getText("ERR_Selection_Row"));
                return;
            }
            var oItems = oTable.getSelectedItems();
            //aIndices.forEach(function (indexNumber) {
            for (var i = 0; i < oItems.length; i++) {
                var oPositionModel = that.getModel("MatnrJSONModel").getProperty(oItems[i].getBindingContextPath());
                selectedMatnrDesc = oPositionModel.DESCR + ";" + selectedMatnrDesc;
                selectedMatnr.push(
                    //	"ELIFN": 
                    oPositionModel.CODE
                );
            }

            that.getModel("filterOrdersJSONModel").getData().matnr = selectedMatnr;
            that.getModel("filterOrdersJSONModel").getData().MatnrDesc = selectedMatnrDesc;

            this.oSearchMatnrDialog.close();
            this.oSearchMatnrDialog.destroy();
            this.oSearchMatnrDialog = undefined;
            that.getModel("filterOrdersJSONModel").refresh();
        },

        onGetOdataColumns: function (fCompletion) {
            // Implementare il servizio che in AMA è stato creato come "VariantsService.xsodata", inserire poi il model nel Manifest

            //	var oModelData = that.getOwnerComponent().getModel("VariantsModel");
            //	oModelData.metadataLoaded().then(
            //		that.onMetadataLoaded.bind(that, oModelData));
            var columModel = { "EBELN": true, "EBELP": true, "LIFNR": true, "NAME1": true, "MATNR": true, "TXZ01": true, "IDNLF": true, "MENGE": true, "MEINS": true, "WAERS": true, "PRIMO_PERIODO": true, "SECONDO_PERIODO": false };
            var oModel = new JSONModel();
            oModel.setData(columModel);
            that.getView().setModel(oModel, "columnVisibilityModel");
            fCompletion()
        },

        getPlants: function (fCompletion) {
            var url = "/backend/Utils/UtilsManagement/GetUserPlants";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    oModel.setData(oData);
                    var oComponent = that.getOwnerComponent();
                    oComponent.setModel(oModel, "PlantsJSONModel");
                }
                fCompletion()
            });
        },

        getPurchaseOrganizations: function (fCompletion) {

            var url = "/backend/Utils/UtilsManagement/GetPurchaseOrganizations";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    oModel.setData(oData);
                    var oComponent = that.getOwnerComponent();
                    oComponent.setModel(oModel, "PurchaseOrganizationJSONModel");
                }
                fCompletion()
            });

        },

        getMetasupplier: function (fCompletion) {
            var url = "/backend/Utils/UtilsManagement/GetMetasupplierList";
            that.ajaxGet(url, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    oModel.setData(oData);
                    that.getView().setModel(oModel, "MetasupplierJSONModel");
                    //Valorizzazione Campo Lifnr per Servizio
                    var oLifnr = that.getModel("filterOrdersJSONModel");
                    oLifnr = oData.results;
                    var oModelLF = new JSONModel();
                    oModelLF.setData(oLifnr);
                    that.getView().setModel(oModelLF, "filterOrdersJSONModel");
                }
                fCompletion()
            })

        },


        getPurchaseGroup: function (fCompletion) {

            var url = "/backend/Utils/UtilsManagement/GetPurchaseDoc";
            that.ajaxPost(url, {}, function (oData) {
                if (oData) {
                    var oModel = new JSONModel();
                    oModel.setData(oData);
                    that.getView().setModel(oModel, "PurchaseGroupJSONModel");
                }
                fCompletion()
            })

        },

        getAllProfiliConsegna: function (fCompletion) {
            var url = "/backend/Utils/UtilsManagement/GetProfiliConferma";
            that.ajaxGet(url, function (oData) {
                if (oData && oData.results) {
                    var outArr = [];

                    /*questo modello viene usato per fare i controlli sulle posizioni in fase di conferma*/
                    var oModel = new JSONModel();
                    oModel.setData(oData);
                    that.getOwnerComponent().setModel(oModel, "AllProfiliConfermaJSONModel");

                    for (var j = 0; j < oData.results.length; j++) {
                        var trovato = false;
                        if (outArr.length > 0) {
                            var length = outArr.length;
                            for (var i = 0; i < length; i++) {
                                if (outArr[i].CAT_CONFERMA === oData.results[j].CAT_CONFERMA) {
                                    trovato = true;
                                    break;
                                }
                            }
                        }
                        if (!trovato) {
                            if (oData.results[j].TIPO_CONFERMA === "1")
                                outArr.push(oData.results[j]);
                        }
                    }

                    // metto nei parametri di filtro il 1° elemento della lista dei profili (come default generico)
                    if (outArr.length > 0) {
                        that.getModel("filterOrdersJSONModel").getData().ebtyp = outArr[0].CAT_CONFERMA;
                    }
                    // se ho 1 solo profilo conferma metto invisibile la combobox della worklist
                  /*  if (outArr.length <= 1) {
                        that.getView().byId("comboProfiliConferma").setVisible(false);
                    }*/

                    var oModel = new JSONModel();
                    oModel.setData({
                        "results": outArr
                    });
                    that.getOwnerComponent().setModel(oModel, "ListProfiliConfermaJSONModel");
                }
                fCompletion()
            });

        },

		handleTextPopoverPress: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getBindingContext("DocumentsJSONModel").sPath;

			var oButton = oEvent.getSource();

			if (this._oPopover !== undefined) {
				this._oPopover = undefined;
			}

			// create popover
			if (!this._oPopover) {
				Fragment.load({
					name: "it.aupsup.conto_lav.fragments.TextPopOver",
					controller: this
				}).then(function (pPopover) {
					this._oPopover = pPopover;
					this.getView().addDependent(this._oPopover);
					this._oPopover.bindElement({ path: oPath, model: "DocumentsJSONModel" });
					this._oPopover.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
			}
		}
    });

});