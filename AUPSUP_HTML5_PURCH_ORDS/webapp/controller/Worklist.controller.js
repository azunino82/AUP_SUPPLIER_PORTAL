sap.ui.define([
	"it/aupsup/purchords/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"it/aupsup/purchords/js/Date",
	"it/aupsup/purchords/js/formatter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/Dialog"
], function (BaseController, Filter, FilterOperator, JSONModel, MessageBox, MessageToast, Sorter, DateF, Formatter, Export, ExportTypeCSV, Dialog) {
	"use strict";
	var that;
	return BaseController.extend("it.aupsup.purchords.controller.Worklist", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf it.alteaup.supplier.portal.purchaseorders.PurchaseOrders.view.Worklist
		 */
		pressDialog: null,
		onInit: function () {
			that = this;

			var startupParams = undefined;
			that.onGetOdataColumns();
			that.getCurrentSYSID();

			// questo meccanismo serve per navigare sull'ordine selezionato da RMO. funziona solo sul portale pubblicato non in preview da webide
			if (this.getOwnerComponent().getComponentData() != undefined) {
				startupParams = this.getOwnerComponent().getComponentData().startupParameters;
			}

			if (startupParams != undefined && startupParams.objectId && startupParams.objectId[0]) {

				Promise.all([
					new Promise(function (resolve, reject) {

						var url = "/backend/Utils/UtilsManagement/GetUserPlants";

						that.ajaxGet(url, function (oData) { // funzione generica su BaseController
							if (oData) {
								var oModel = new JSONModel();
								oModel.setData(oData);
								//	that.getView().setModel(oModel, "PlantsJSONModel");
								var oComponent = that.getOwnerComponent();
								oComponent.setModel(oModel, "PlantsJSONModel");
								resolve();
							}
						});

					}),
					new Promise(function (resolve, reject) {

						var url = "/backend/Utils/UtilsManagement/GetPurchaseOrganizations";
						that.ajaxGet(url, function (oData) {
							if (oData) {
								var oModel = new JSONModel();
								oModel.setData(oData);
								// that.getView().setModel(oModel, "PurchaseOrganizationJSONModel");
								var oComponent = that.getOwnerComponent();
								oComponent.setModel(oModel, "PurchaseOrganizationJSONModel");
								resolve();
							}
						});

					}),
				]).then(function (values) {
					var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
					oRouter.navTo("detail", {
						datas: startupParams.objectId[0]
					});
				});

			} else {

				that.getPlants();
				that.getPurchaseOrganizations();
				//that.getUserInfo();
				that.getMetasupplier();
				that.getPurchaseGroup();
				that.getAllProfiliConsegna();

				// Inizio modifiche LS
				var filterOrd = {
					"bstyp": "F",
					"ebeln": "",
					"lifnr": [],
					"matnr": [],
					"MatnrDesc": "",
					"ekorg": [],
					"ekgrp": [],
					"werks": [],
					//	"bstae": "",
					"ebtyp": "",
					"orderType": "ODA"
				};

				// Default LIFNR

				var oModelFI = new JSONModel();
				oModelFI.setData(filterOrd);
				this.getView().setModel(oModelFI, "filterOrdersJSONModel");
				// Fine modifiche LS

				if (!this._oResponsivePopover) {

					var oModelFilters = new JSONModel();
					oModelFilters.setData({
						"element": ""
					});
					// this.getView().setModel(oModelFilters, "filterElementJSONModel");

					this._oResponsivePopover = sap.ui.xmlfragment("it.aupsup.purchords.fragments.FilterSorter", this);
					this._oResponsivePopover.setModel(oModelFilters, "filterElementJSONModel");
				}
				var oTable = this.getView().byId("OrderHeadersTable");
				oTable.addEventDelegate({
					onAfterRendering: function () {
						var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
						for (var i = 0; i < oHeader.length; i++) {
							var oID = oHeader[i].id;
							if (oID !== '__column0') // prima colonna con checkbox
								that.onClick(oID, i + 1);
						}
					}
				}, oTable);

			}

			this.getView().setModel(sap.ui.getCore().getModel("userapi"), "userapi");

		},
		onAfterRendering: function () {
			that.getUserInfo();
		},
		onClick: function (oID) {
			$('#' + oID).click(function (oEvent) { //Attach Table Header Element Event
				var oTarget = oEvent.currentTarget; //Get hold of Header Element
				var oView = that.getView();
				var res = oTarget.id.split("--");
				res = res[1];
				if (res !== undefined) {
					oView.getModel("OrderJSONModel").setProperty("/bindingValue", res); //Save the key value to property
					that._oResponsivePopover.openBy(oTarget);
				}
			});
		},

		onChange: function (oEvent) {
			var oValue = oEvent.getParameter("value");
			var oMultipleValues = oValue.split(",");
			var oTable = this.getView().byId("OrderHeadersTable");
			var oBindingPath = this.getView().getModel("OrderJSONModel").getProperty("/bindingValue"); //Get Hold of Model Key value that was saved
			var aFilters = [];
			for (var i = 0; i < oMultipleValues.length; i++) {
				var oFilter = new Filter(oBindingPath, "Contains", oMultipleValues[i]);
				aFilters.push(oFilter);
			}
			var oItems = oTable.getBinding("items");
			oItems.filter(aFilters, "Application");

			this._oResponsivePopover.setModel(new JSONModel({
				"element": ""
			}), "filterElementJSONModel");
			this.getView().byId("headerFilterButton").setVisible(true);

			this._oResponsivePopover.close();
		},

		onAscending: function () {
			var oTable = this.getView().byId("OrderHeadersTable");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.getView().getModel("OrderJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onDescending: function () {
			var oTable = this.getView().byId("OrderHeadersTable");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.getView().getModel("OrderJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath, true);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onRowSelectionChange: function (oEvent) {

			var oSelectedItem = oEvent.getParameter("listItem");

			var oPath = oSelectedItem.oBindingContexts.OrderJSONModel.sPath;
			var oItem = that.byId("OrderHeadersTable").getModel().getProperty(oPath);

			var data = {
				orderId: oItem.EBELN,
				posNumber: oItem.EBELP
			};

			var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
			oRouter.navTo("detail", {
				datas: JSON.stringify(data)
			});

			// }

		},

		onClearFilter: function () {
			var oTable = this.getView().byId("OrderHeadersTable");
			var aFilters = [];
			var oItems = oTable.getBinding("items");
			oItems.filter(aFilters, "Application");

			this.getView().byId("headerFilterButton").setVisible(false);
		},

		onGlobalFilter: function (oEvent) {

			var aTableSearchState = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				aTableSearchState = [new Filter("TXZ01", FilterOperator.Contains, sQuery)];
			}
			this._applySearch(aTableSearchState);

		},

		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("OrderHeadersTable"),
				oViewModel = this.getModel("OrderJSONModel");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("noData"));
			}
		},

		onSearchOrders: function () {

			var url = "/backend/OrdersManagement/GetOrders";
			var body = that.getModel("filterOrdersJSONModel").getData();
			that.showBusyDialog();
			that.ajaxPost(url, body, function (oData) {
				that.hideBusyDialog();
				if (oData) {
					// Valorizzare OriginalPrice LS
					for (var i = 0; i < oData.results.length; i++) {
						var PEINH = oData.results[i].PEINH;
						var NETPR = oData.results[i].NETPR;
						if (NETPR != undefined && NETPR != "" && PEINH != undefined && PEINH != "") {
							PEINH = parseFloat(PEINH);
							NETPR = parseFloat(NETPR);
							//var prezzoOriginale = NETPR;
							//var unitaPrezzoOriginale = PEINH;
							oData.results[i].RapportoPrezzoUnita = NETPR / PEINH;
							oData.results[i].OriginalPrice = NETPR;
							oData.results[i].OriginalPriceUnit = PEINH;
						}
					}
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "OrderJSONModel");
					that.getView().byId("OrderHeadersTable").setModel(oModel);

					var oSorter = new Sorter({
						path: 'PRIMO_PERIODO',
						ascending: true
					});

					that.getView().byId("OrderHeadersTable").getBinding("items").sort(oSorter);
				}
			})

		},

		getPurchaseOrganizations: function () {

			var url = "/backend/Utils/UtilsManagement/GetPurchaseOrganizations";
			that.ajaxGet(url, function (oData) {
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					var oComponent = that.getOwnerComponent();
					oComponent.setModel(oModel, "PurchaseOrganizationJSONModel");
				}
			});

		},

		getMetasupplier: function () {
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
			})

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

		onChangeMetalifnr: function (oEvent) {
			var selectedKeyArray = oEvent.oSource.getSelectedKeys();
			var lifnrList = that.getModel("lifnrJSONModel").getData();
			var selectedLifnr = "";
			var lifnr = [];
			if (selectedKeyArray != undefined) {
				for (var i = 0; i < selectedKeyArray.length; i++) {
					if (lifnrList != undefined) {
						selectedLifnr = lifnrList.find(x => x.LIFNR === selectedKeyArray[i]);
						if (selectedLifnr !== undefined) {
							if (selectedLifnr.LIFNR != undefined) {
								lifnr.push(selectedLifnr.LIFNR);
							}
						}
					}
				}
			}
			if (selectedKeyArray.length === 0) {
				for (var j = 0; j < lifnrList.length; j++) {
					lifnr.push(lifnrList[j].LIFNR);
				}
			}
			that.getModel("filterOrdersJSONModel").getData().lifnr = lifnr;
		},

		onCreateOrder: function () {
			var oModelData = this.getOwnerComponent().getModel("OrderManagementService");

			var oEntry = {};
			oEntry.ORDERNUMBER = "0000002223";
			oEntry.PAYMENTCONDITION = "1";
			oEntry.SUPPLIERCODE = "2";
			oEntry.SALESGROUP = "3";

			oModelData.create("/OrderHeaders", oEntry, {
				success: function (oData, oResponse) {
					that.getView().getModel("OrderJSONModel").refresh();
				},
				error: function (err) {

				}
			});
		},

		handleSupplier: function () {

			if (!that.oSearchSupplierDialog) {
				that.oSearchSupplierDialog = sap.ui.xmlfragment("it.aupsup.purchords.fragments.SearchSupplier", that);
				that.getView().addDependent(that.oSearchSupplierDialog);
			}
			that.oSearchSupplierDialog.open();
			var oTable = sap.ui.getCore().byId("idSuppliersTable");
			var oItems = oTable.getItems();

			var selectedSupplier = that.getModel("filterOrdersJSONModel").getData().lifnr;
			var supplier = that.getModel("suppliersJSONModel");
			if (supplier !== undefined && supplier.getData() && supplier.getData().results) {
				for (var i = 0; i < supplier.getData().results.length; i++) {
					for (var j = 0; j < selectedSupplier.length; j++) {
						if (selectedSupplier[j].ELIFN === supplier.getData().results[i].LIFNR) {
							oItems[i].setSelected(true);
						}
					}
				}
			}

		},

		onCloseSearchSuppliers: function () {
			if (this.oSearchSupplierDialog) {
				this.oSearchSupplierDialog.close();
				this.oSearchSupplierDialog.destroy();
				this.oSearchSupplierDialog = undefined;
			}
		},

		onConfirmSuppliers: function () {
			var oTable = sap.ui.getCore().byId("idSuppliersTable");
			var aIndices = oTable.indexOfItem(oTable.getSelectedItem());
			var selectedSupplier = [];
			var selectedSupplierDesc = "";
			if (aIndices.length < 1) {
				MessageToast.show(that.getResourceBundle().getText("ERR_Selection_Row"));
				return;
			}
			var oItems = oTable.getSelectedItems();
			//aIndices.forEach(function (indexNumber) {
			for (var i = 0; i < oItems.length; i++) {
				var oPositionModel = that.getModel("suppliersJSONModel").getProperty(oItems[i].getBindingContextPath());
				selectedSupplierDesc = oPositionModel.NAME1 + ";" + selectedSupplierDesc;
				selectedSupplier.push(
					//	"ELIFN": 
					oPositionModel.LIFNR
				);
			}

			that.getModel("filterOrdersJSONModel").getData().lifnr = selectedSupplier;
			that.getModel("filterOrdersJSONModel").getData().lifnrDesc = selectedSupplierDesc;

			this.oSearchSupplierDialog.close();
			this.oSearchSupplierDialog.destroy();
			this.oSearchSupplierDialog = undefined;
			that.getModel("filterOrdersJSONModel").refresh();
		},
		onSearchSupplier: function () {
			// ricerca fornitori da popup

			var filtri =
				sap.ui.getCore().byId("ekorg").getSelectedKeys();

			var filterVar = "";
			var i = 0;

			$.each(filtri, function (key, value) {
				if (value !== "" && value !== undefined) {
					if (i > 0)
						filterVar = filterVar + " and ";
					filterVar = filterVar + "EKORG eq " + "'" + value + "'";
					i++;
				}
			});

			if (filterVar !== "") {
				filtri = {
					"$filter": filterVar
				};
			} else {
				filtri = "";
			}

			var url = "VendorListParameters(I_USERID='" + that.getCurrentUserId() + "',I_NAME1='" + sap.ui.getCore().byId("NAME1").getValue() +
				"',I_STCEG='" + sap.ui.getCore().byId("STCEG").getValue() + "')/Results";

			that.readObject("OrderManagementService", url, filtri, function (oData) {
				that.hideBusyDialog();
				if (oData === null || oData === undefined) {
					MessageBox.error(that.getResourceBundle().getText("noOrderFound"));
				} else {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "suppliersJSONModel");
					that.oSearchSupplierDialog.setModel(that.getView().getModel("suppliersJSONModel"));

				}

			});

		},

		getPurchaseGroup: function () {

			var url = "/backend/Utils/UtilsManagement/GetPurchaseDoc";
			that.ajaxPost(url, {}, function (oData) {
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "PurchaseGroupJSONModel");
				}
			})

		},
		getPlants: function () {
			var url = "/backend/Utils/UtilsManagement/GetUserPlants";
			that.ajaxGet(url, function (oData) {
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					var oComponent = that.getOwnerComponent();
					oComponent.setModel(oModel, "PlantsJSONModel");
				}
			});
		},
		handleMatnr: function () {

			if (!that.oSearchMatnrDialog) {
				that.oSearchMatnrDialog = sap.ui.xmlfragment("it.aupsup.purchords.fragments.SearchMatnr", that);
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

		getAllProfiliConsegna: function () {
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
						if (!trovato)
							outArr.push(oData.results[j]);
					}

					var oModel = new JSONModel();
					oModel.setData({
						"results": outArr
					});
					that.getOwnerComponent().setModel(oModel, "ListProfiliConfermaJSONModel");
				}
			});

		},

		onChangeProfiloConsegna: function (oEvent) {
			var selectedKey = oEvent.getSource().getSelectedItem().getKey();

			var profiliConsegna = that.getModel("ListProfiliConfermaJSONModel").getData().results;
			var profiloSelezionato = [];
			if (profiliConsegna != undefined) {
				profiloSelezionato = profiliConsegna.find(x => x.CAT_CONFERMA === selectedKey);
			}

			//that.getModel("filterOrdersJSONModel").getData().bstae = profiloSelezionato !== undefined ? profiloSelezionato.PROFILO_CONTROLLO :"";
			that.getModel("filterOrdersJSONModel").getData().ebtyp = selectedKey;

			that.onSearchOrders();

		},
		onClearFilters: function () {
			if (that.getModel("filterOrdersJSONModel") !== undefined && that.getModel("filterOrdersJSONModel").getData() !== undefined) {
				that.getModel("filterOrdersJSONModel").getData().MatnrDesc = '';
				that.getModel("filterOrdersJSONModel").getData().ebeln = "";
				that.getModel("filterOrdersJSONModel").getData().lifnr = '';
				that.getModel("filterOrdersJSONModel").getData().ekorg = '';
				that.getModel("filterOrdersJSONModel").getData().ekgrp = '';
				that.getModel("filterOrdersJSONModel").getData().werks = '';
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

		onExport: function (oEvent) {

			var dataS = this.getView().getModel("OrderJSONModel");
			if (dataS === undefined || dataS.getData() === undefined || dataS.getData().results === undefined ||
				dataS.getData().results.length === 0) {
				MessageBox.error(that.getResourceBundle().getText("ERR_Export"));
				return;
			}

			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new ExportTypeCSV({
					separatorChar: ";"
				}),

				// Pass in the model created above
				models: this.getView().getModel("OrderJSONModel"),

				// binding information for the rows aggregation
				rows: {
					path: "/results"
				},

				// column definitions with column name and binding info for the content

				columns: [{
					name: that.getResourceBundle().getText("EBELN"),
					template: {
						content: "{EBELN}"
					}
				}, {
					name: that.getResourceBundle().getText("EBELP"),
					template: {
						content: "{EBELP}"
					}
				}, {
					name: that.getResourceBundle().getText("LIFNR"),
					template: {
						content: "{LIFNR}"
					}
				}, {
					name: that.getResourceBundle().getText("supplierName"),
					template: {
						content: "{NAME1}"
					}
				}, {
					name: that.getResourceBundle().getText("MATNR"),
					template: {
						content: "{MATNR}"
					}
				}, {
					name: that.getResourceBundle().getText("TXZ01"),
					template: {
						content: "{TXZ01}"
					}
				}, {
					name: that.getResourceBundle().getText("IDNLF"),
					template: {
						content: "{IDNLF}"
					}
				}, {
					name: that.getResourceBundle().getText("MENGE"),
					template: {
						content: "{MENGE}"
					}
				}, {
					name: that.getResourceBundle().getText("MEINS"),
					template: {
						content: "{MEINS}"
					}
				}, {
					name: that.getResourceBundle().getText("WAERS"),
					template: {
						content: "{WAERS}"
					}
				}, {
					name: that.getResourceBundle().getText("PRIMO_PERIODO"),
					template: {
						content: "{PRIMO_PERIODO}"
					}
				}, {
					name: that.getResourceBundle().getText("SECONDO_PERIODO"),
					template: {
						content: "{SECONDO_PERIODO}"
					}
				}]
			});

			// download exported file
			oExport.saveFile().catch(function (oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		},

		onConfirmPositions: function () {

			// clear del modello
			if (that.getView().getModel("SelectedPositionsJSONModel") !== undefined)
				that.getView().getModel("SelectedPositionsJSONModel").setData(null);

			var aIndices = 0;
			var positionRows = that.getModel("OrderJSONModel").getData().results;
			if (positionRows !== undefined && positionRows.length > 0) {
				positionRows.forEach(function (elem) {
					if (elem.isSelected)
						aIndices++;
				});
			}

			var selectedContextBinding = [];
			if (aIndices <= 0) {
				MessageToast.show(that.getResourceBundle().getText("ERR_Selection_Row"));
				return;
			}
			//	var oItems = oTable.getSelectedItems();
			var oNotEditPositions = ""; //Elenco delle posizione per le quali è inibita la modifica
			var countNotEditPositions = 0;
			var positionsArray = [];
			// //MODIFICA LS
			positionRows.forEach(function (aData) {
				// 				// distruggo il binding con il modello altrimenti non funziona la cler dei dati
				var oPositionModel = JSON.parse(JSON.stringify(aData));

				if (oPositionModel.isSelected) {
					positionsArray.push(oPositionModel);
				}
			});

			var url = "/backend/SchedulingAgreementManagement/GetSelectedConferme";
			var body = {
				"ordPos": positionsArray
			};
			this.showBusyDialog();
			that.ajaxPost(url, body, function (oData) {
				that.hideBusyDialog();
				if (oData) {
					var oModelSelectedPos = new JSONModel();
					oModelSelectedPos.setData(oData);
					that.getView().setModel(
						oModelSelectedPos,
						"SelectedPositionsJSONModel");
				}
			})
			// fine modifiche LS
			// TODO DA GESTIRE 2020 LS
			// if (countNotEditPositions === positionRows.length) {
			// 	MessageBox.error(that.getResourceBundle().getText("allPositionNotConfirmable"), {
			// 		icon: MessageBox.Icon.ERROR,
			// 		title: "Error",
			// 	});
			// 	return;
			// }

			// var oModelSelectedPos = new JSONModel();
			// oModelSelectedPos.setData(selectedContextBinding);
			// that.getView().setModel(
			// 	oModelSelectedPos,
			// 	"SelectedPositionsJSONModel");

			if (!that.oConfirmPositionsFragment) {
				that.oConfirmPositionsFragment = sap.ui.xmlfragment(
					"it.aupsup.purchords.fragments.ConfirmPositions",
					this);
				that.getView().addDependent(that.oConfirmPositionsFragment);
			}

			that.oConfirmPositionsFragment.open();

			// PROMISE PER avere le RMO di tutte le posizioni selezionate:
			// se promise è RESOLVE allor faccio riga 401 - 407

			if (oNotEditPositions != "") {
				MessageBox.warning(that.getResourceBundle().getText("positionNotConfirmable", oNotEditPositions), {
					icon: MessageBox.Icon.WARNING,
					title: "Warning",
				});
			}
		},

		onChoseType: function (oEvent) {
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				oPath = oEvent.getSource().getSelectedItem().oBindingContexts.SelectedPositionsJSONModel.sPath;
			var mod = that.getModel("SelectedPositionsJSONModel").getProperty(oPath);

			if (mod != undefined && mod.TIPO_CONFERMA === "4") {
				var oIndexs = oEvent.getSource().sId.split("-");
				oIndexs = oIndexs[oIndexs.length - 1];
				if (mod.MODIFICA_PREZZO !== undefined && mod.MODIFICA_PREZZO !== "") {
					if ((that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].KONNR === undefined || (that.getView().getModel(
						"SelectedPositionsJSONModel").getData()[oIndexs].KONNR === "")) || (that.getView().getModel("SelectedPositionsJSONModel").getData()[
							oIndexs].KTPNR === undefined || (that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].KTPNR === "00000")))
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editPrice = true;
				}
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editMode = true;
				// salvo il prezzo calcolato originale di posizione e le percentuali di scostamento prese dalla tabella T_PROFILI_CONFERMA per poi fare i controlli sullo scostamento percentuale
				var PEINH = that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].PEINH;
				var NETPR = that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].NETPR;
				// Creata Funzione dedicata.
				// if (NETPR != undefined && NETPR != "" && PEINH != undefined && PEINH != "") {
				// 	PEINH = parseFloat(PEINH);
				// 	NETPR = parseFloat(NETPR);
				// 	var prezzoOriginale = NETPR / PEINH;
				// 	that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].OriginalPrice = prezzoOriginale;
				// 	that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].OriginalPEINH = PEINH;
				// 	that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].OriginalNETPR = NETPR;
				// }
				if (mod.PERC_INFERIORE !== undefined && mod.PERC_INFERIORE !== "")
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].PricePercDOWN = parseInt(mod.PERC_INFERIORE);
				if (mod.PERC_SUPERIORE !== undefined && mod.PERC_SUPERIORE !== "")
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].PricePercUP = parseInt(mod.PERC_SUPERIORE);
				if (mod.PERC_INFERIORE_QUANT !== undefined && mod.PERC_INFERIORE_QUANT !== "")
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].QuantPercDOWN = parseInt(mod.PERC_INFERIORE_QUANT);
				if (mod.PERC_SUPERIORE_QUANT !== undefined && mod.PERC_SUPERIORE_QUANT !== "")
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].QuantPercUP = parseInt(mod.PERC_SUPERIORE_QUANT);

				that.getView().getModel("SelectedPositionsJSONModel").refresh();
			} else {
				var oIndexs = oEvent.getSource().sId.split("-");
				oIndexs = oIndexs[oIndexs.length - 1];
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editPrice = false;
				//that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editQuantity = true;
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editMode = false;
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].UPDKZ = "";
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].PricePercDOWN = undefined;
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].PricePercUP = undefined;
				if (that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].OriginalPEINH !== undefined)
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].PEINH = that.getView().getModel(
						"SelectedPositionsJSONModel").getData()[oIndexs].OriginalPEINH;
				if (that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].OriginalNETPR !== undefined)
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].NETPR = that.getView().getModel(
						"SelectedPositionsJSONModel").getData()[oIndexs].OriginalNETPR;

				if (mod.PERC_INFERIORE_QUANT !== undefined && mod.PERC_INFERIORE_QUANT !== "")
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].QuantPercDOWN = parseInt(mod.PERC_INFERIORE_QUANT);
				if (mod.PERC_SUPERIORE_QUANT !== undefined && mod.PERC_SUPERIORE_QUANT !== "")
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].QuantPercUP = parseInt(mod.PERC_SUPERIORE_QUANT);

				that.getView().getModel("SelectedPositionsJSONModel").refresh();
			}

			if (mod.MODIFICA_QUANTITA !== undefined && mod.MODIFICA_QUANTITA !== "") {
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editQuantity = true;
			} else {
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editQuantity = false;
			}

			that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].EBTYP = sSelectedKey;
			if (mod !== undefined) {
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].KSCHL = mod.TIPO_COND_PREZZO;
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].UPDKZ = mod.TIPO_CONFERMA;
			} else {
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].KSCHL = "";
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].UPDKZ = "";
			}
		},

		onCloseOrderPositions: function (needReserarch) {
			if (this.oConfirmPositionsFragment) {
				this.oConfirmPositionsFragment.close();
				this.oConfirmPositionsFragment.destroy();
				this.oConfirmPositionsFragment = undefined;
				if (needReserarch === true)
					that.onSearchOrders();
			}
		},

		addSchedulations: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getParent().getBindingContext("SelectedPositionsJSONModel").sPath;
			var mod = that.getModel("SelectedPositionsJSONModel").getProperty(oPath);
			var oIndexs = oEvent.getSource().sId.split("-");
			oIndexs = oIndexs[oIndexs.length - 1];
			// create a Model with this data
			var model = new sap.ui.model.json.JSONModel();
			model.setData(mod);

			var fnDoSearch = function (oEvent, bProductSearch) {
				var aFilters = [],
					sSearchValue = oEvent.getParameter("value"),
					itemsBinding = oEvent.getParameter("itemsBinding");

				// create the local filter to apply
				if (sSearchValue !== undefined && sSearchValue.length > 0) {
					aFilters.push(new sap.ui.model.Filter((bProductSearch ? "CAT_CONFERMA" : "DESCRIZIONE"), sap.ui.model.FilterOperator.Contains,
						sSearchValue));
				}
				// apply the filter to the bound items, and the Select Dialog will update
				itemsBinding.filter(aFilters, "Application");
			};

			var oSelectDialog1 = new sap.m.SelectDialog({
				title: that.getResourceBundle().getText("Title_CatConf"),
				search: fnDoSearch,
				liveChange: fnDoSearch

			});
			var oItemTemplate = new sap.m.StandardListItem({
				title: "{DESCRIZIONE}",
				description: "{CAT_CONFERMA}"
			});

			// set model & bind Aggregation
			oSelectDialog1.setModel(model);
			oSelectDialog1.bindAggregation("items", "/profiliConferma", oItemTemplate);
			// attach close listener
			oSelectDialog1.attachConfirm(function (oEvent) {
				var selectedItem = oEvent.getParameter("selectedItem");
				if (selectedItem) {
					var pos_model = that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs];
					// Prendo i dati della T_PROFILI_CONFERMA e sovrascrivo i valori precedentemente presi da T_PROFILI_CONFERMA_HEADER	
					var selectedProfiloConfermaModel = pos_model !== undefined ? pos_model.profiliConferma.find(x => x.CAT_CONFERMA ===
						selectedItem.getDescription()) : undefined;

					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].KSCHL = "";
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].UPDKZ = "";
					if (selectedProfiloConfermaModel !== undefined && selectedProfiloConfermaModel.PERC_INFERIORE_QUANT !== undefined &&
						selectedProfiloConfermaModel.PERC_INFERIORE_QUANT !== "")
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].QuantPercDOWN = parseInt(selectedProfiloConfermaModel
							.PERC_INFERIORE_QUANT);
					else
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].QuantPercDOWN = "";
					if (selectedProfiloConfermaModel !== undefined && selectedProfiloConfermaModel.PERC_SUPERIORE_QUANT !== undefined &&
						selectedProfiloConfermaModel.PERC_SUPERIORE_QUANT !== "")
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].QuantPercUP = parseInt(selectedProfiloConfermaModel.PERC_SUPERIORE_QUANT);
					else
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].QuantPercUP = "";

					if (selectedProfiloConfermaModel !== undefined && selectedProfiloConfermaModel.TIPO_CONFERMA !== undefined)
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].UPDKZ = selectedProfiloConfermaModel.TIPO_CONFERMA;
					else
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].UPDKZ = "";

					// se il prezzo è già editabile dalla COND_HEADER allora non lo sovrascrivoS
					if (!that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editPrice) {
						if (selectedProfiloConfermaModel !== undefined && selectedProfiloConfermaModel.MODIFICA_PREZZO !== undefined)
							that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editPrice = selectedProfiloConfermaModel.MODIFICA_PREZZO === 'X' ? true : false;
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].KSCHL = selectedProfiloConfermaModel.TIPO_COND_PREZZO;
					}

					if (selectedProfiloConfermaModel !== undefined && selectedProfiloConfermaModel.ZAPPPERINF !== undefined &&
						selectedProfiloConfermaModel.ZAPPPERINF !== "")
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].QuantTollDown = parseInt(selectedProfiloConfermaModel
							.ZAPPPERINF);
					else
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].QuantTollDown = "";
					if (selectedProfiloConfermaModel !== undefined && selectedProfiloConfermaModel.ZAPPPERSUP !== undefined &&
						selectedProfiloConfermaModel.ZAPPPERSUP !== "")
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].QuantTollUp = parseInt(selectedProfiloConfermaModel
							.ZAPPPERSUP);
					else
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].QuantTollUp = "";
					if (selectedProfiloConfermaModel !== undefined && selectedProfiloConfermaModel.ZAPPGGINF !== undefined &&
						selectedProfiloConfermaModel.ZAPPGGINF !== "")
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].ggTollDown = parseInt(selectedProfiloConfermaModel
							.ZAPPGGINF);
					else
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].ggTollDown = "";
					if (selectedProfiloConfermaModel !== undefined && selectedProfiloConfermaModel.ZAPPGGSUP !== undefined &&
						selectedProfiloConfermaModel.ZAPPGGSUP !== "")
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].ggTollUp = parseInt(selectedProfiloConfermaModel
							.ZAPPGGSUP);
					else
						that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].ggTollUp = "";
					// FINE DELLA SOVRASCRITTURA

					// AGGIUNGO LA RIGA NELLE SCHEDULAZIONI

					// CALCOLO SCHEDULAZIONI COLORATE
					that.getSchedulationsStatus(mod, selectedProfiloConfermaModel.CAT_CONFERMA);

				}

			});

			// PER LE CONFERME NON PARZIALI POSSO CONFERMARE SOLO LE CONFERME CHE HANNO DELTA QUANTITA > 0
			if (mod.profiliConferma.length > 1)
				oSelectDialog1.open();
			else {
				mod.UPDKZ = mod.profiliConferma[0].TIPO_CONFERMA;
				if (mod.profiliConferma[0] !== undefined && mod.profiliConferma[0].PERC_INFERIORE_QUANT !== undefined &&
					mod.profiliConferma[0].PERC_INFERIORE_QUANT !== "")
					mod.QuantPercDOWN = parseInt(mod.profiliConferma[0].PERC_INFERIORE_QUANT);
				else
					mod.QuantPercDOWN = "";
				if (mod.profiliConferma[0] !== undefined && mod.profiliConferma[0].PERC_SUPERIORE_QUANT !== undefined &&
					mod.profiliConferma[0].PERC_SUPERIORE_QUANT !== "")
					mod.QuantPercUP = parseInt(mod.profiliConferma[0].PERC_SUPERIORE_QUANT);
				else
					mod.QuantPercUP = "";
				// se il prezzo è già editabile dalla COND_HEADER allora non lo sovrascrivo	
				if (!mod.editPrice) {
					if (mod.profiliConferma[0] !== undefined && mod.profiliConferma[0].MODIFICA_PREZZO !== undefined)
						mod.editPrice = mod.profiliConferma[0].MODIFICA_PREZZO === 'X' ? true : false;
					mod.KSCHL = mod.profiliConferma[0].TIPO_COND_PREZZO;
				}

				if (mod.profiliConferma[0] !== undefined && mod.profiliConferma[0].ZAPPPERSUP !== undefined &&
					mod.profiliConferma[0].ZAPPPERSUP !== "")
					mod.QuantTollUp = parseInt(mod.profiliConferma[0].ZAPPPERSUP);
				else
					mod.QuantTollUp = "";
				if (mod.profiliConferma[0] !== undefined && mod.profiliConferma[0].ZAPPPERINF !== undefined &&
					mod.profiliConferma[0].ZAPPPERINF !== "")
					mod.QuantTollDown = parseInt(mod.profiliConferma[0].ZAPPPERINF);
				else
					mod.QuantTollDown = "";
				if (mod.profiliConferma[0] !== undefined && mod.profiliConferma[0].ZAPPGGSUP !== undefined &&
					mod.profiliConferma[0].ZAPPGGSUP !== "")
					mod.ggTollUp = parseInt(mod.profiliConferma[0].ZAPPGGSUP);
				else
					mod.ggTollUP = "";
				if (mod.profiliConferma[0] !== undefined && mod.profiliConferma[0].ZAPPGGINF !== undefined &&
					mod.profiliConferma[0].ZAPPGGINF !== "")
					mod.ggTollDown = parseInt(mod.profiliConferma[0].ZAPPGGINF);
				else
					mod.ggTollDown = "";

				that.getSchedulationsStatus(mod, mod.profiliConferma[0].CAT_CONFERMA);
			}




			/* var arrETENR = [];
			if (mod.SchedulationsStatus !== undefined) {
				for (var i = 0; i < mod.SchedulationsStatus.length; i++) {
					var deltaMenge = (parseFloat(mod.SchedulationsStatus[i].MENGE) - parseFloat(mod.SchedulationsStatus[i].QTA_CONFERMATA));
					if (deltaMenge > 0) {
						arrETENR.push({
							"ETENR": mod.SchedulationsStatus[i].ETENR
						})
					}
				}
			}


			// Controllo per far apparire la PopUp solo per il primo inserimento
			if (mod.POItemSchedulers.results.length > 0) {
				for (var i = 0; i < mod.POItemSchedulers.results.length; i++) {
					var ciclo = false;
					if (mod.POItemSchedulers.results[i].SYSID === null || mod.POItemSchedulers.results[i].SYSID === undefined) {
						// var selezionato = selectedItem.getDescription();
						var schedulation = {
							"ETENR": '',
							"ETENRenabled": true,
							"EINDT": "",
							"MENGE": "",
							"ETENRS": arrETENR,
							"EBTYP": mod.POItemSchedulers.results[i].CAT_CONFERMA,
						};
						if (mod !== undefined && mod.POItemSchedulers.results !== undefined) {
							mod.POItemSchedulers.results.push(schedulation);
						} else {
							var oSchedulationsArray = [];
							oSchedulationsArray.push(schedulation);
							mod.POItemSchedulers.results = oSchedulationsArray;
						}
						ciclo = true
						that.getModel("SelectedPositionsJSONModel").refresh();
						break;
					}
				}
				if (ciclo === false) {
					if (mod.profiliConferma.length > 1)
						oSelectDialog1.open();
					else {
						var schedulation = {
							"ETENR": '',
							"ETENRenabled": true,
							"EINDT": "",
							"MENGE": "",
							"ETENRS": arrETENR,
							"EBTYP": mod.profiliConferma[0].CAT_CONFERMA,
						};
						if (mod !== undefined && mod.POItemSchedulers.results !== undefined) {
							mod.POItemSchedulers.results.push(schedulation);
						} else {
							var oSchedulationsArray = [];
							oSchedulationsArray.push(schedulation);
							mod.POItemSchedulers.results = oSchedulationsArray;
						}
						//that.getSchedulationsStatus(mod, schedulation.EBTYP);
						that.getModel("SelectedPositionsJSONModel").refresh();
					}

				}
			} else {
				if (mod.profiliConferma.length > 1)
					oSelectDialog1.open();
				else {
					var schedulation = {
						"ETENR": '',
						"ETENRenabled": true,
						"EINDT": "",
						"MENGE": "",
						"ETENRS": arrETENR,
						"EBTYP": mod.profiliConferma[0].CAT_CONFERMA,
					};
					if (mod !== undefined && mod.POItemSchedulers.results !== undefined) {
						mod.POItemSchedulers.results.push(schedulation);
					} else {
						var oSchedulationsArray = [];
						oSchedulationsArray.push(schedulation);
						mod.POItemSchedulers.results = oSchedulationsArray;
					}
					mod.UPDKZ = mod.profiliConferma[0].TIPO_CONFERMA;
					// CALCOLO SCHEDULAZIONI COLORATE
					that.getSchedulationsStatus(mod, schedulation.EBTYP);
					that.getModel("SelectedPositionsJSONModel").refresh();
				}
			}
			*/
		},

		onDeleteSchedulation: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getParent().getBindingContext("SelectedPositionsJSONModel").sPath;
			var mod = that.getModel("SelectedPositionsJSONModel").getProperty(oPath);

			var keys = oEvent.getParameter("id");
			var splits = keys.split("-");
			var rowNumber = splits[splits.length - 1];
			var EBTYP = mod.POItemSchedulers.results[rowNumber].EBTYP;
			if (mod !== undefined && mod.POItemSchedulers.results !== null) {
				mod.POItemSchedulers.results.splice(rowNumber, 1);
			}
			//	that.getSchedulationsStatus(mod, EBTYP);
			this.getModel("SelectedPositionsJSONModel").refresh(true);
		},

		onConfirmPositionsDialog: function () {
			var model = that.getModel("SelectedPositionsJSONModel").oData;
			var err = "";
			var contatoreRighe = 0;
			for (var i = 0; i < model.length; i++) {

				var sommaQuantitaSchedulazioni = 0;
				if (model[i].POItemSchedulers.results && model[i].POItemSchedulers.results.length > 0) {
					for (var j = 0; j < model[i].POItemSchedulers.results.length; j++) {

						model[i].POItemSchedulers.results[j].EINDT = model[i].POItemSchedulers.results[j].EINDT.split('-').join('');

						sommaQuantitaSchedulazioni = sommaQuantitaSchedulazioni + parseInt(model[i].POItemSchedulers.results[j].MENGE);
						if ((model[i].POItemSchedulers.results[j]) && ((model[i].POItemSchedulers.results[j].EINDT == "") || (model[i].POItemSchedulers
							.results[
							j].MENGE == ""))) {
							err = that.getResourceBundle().getText("ERR_Schedulations_Mandatory");
							contatoreRighe = contatoreRighe + 1;

						}
					}
					if (err != "") {
						contatoreRighe = contatoreRighe + 1;
					}
				}
				// Richiamo controlli implementati dal tasto CheckPosition

				if (err !== "") {
					MessageBox.error(err);
					return;
				}

				if (model[i].editPrice === true) {
					var errP = that.onControllPriceOK(model[i]);
					if (errP !== "" && errP !== undefined) {
						MessageBox.error(errP, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
						});
						return;
					}
				}

				var errore = that.onControllPosition(model[i]);
				if (errore !== undefined && errore !== "") {
					// err = err + errore + " ordine: " + model[i].EBELN + " in pos: " + model[i].EBELP;
					err = err + errore;
				}
				contatoreRighe = contatoreRighe + 1;
			}

			if (err !== "") {
				MessageBox.error(err);
				err = "";
			} else {
				that.onConfirmAndClose();
			}

		},

		onConfirmAndClose: function () {

			MessageBox.warning(that.getResourceBundle().getText("MSG_Confirm_Position_Text"), {
				icon: MessageBox.Icon.WARNING,
				title: "Warning",
				actions: [MessageBox.Action.CANCEL, MessageBox.Action.OK],
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.OK) {

						var body = {
							"ekko": [],
							"ekpo": [],
							"ekes": [],
							"skipAppBuyer": [],
							"notaReject": "",
							"confirmType": ""
						};
						var ekpoRow = that.getModel("SelectedPositionsJSONModel").getData();
						if (ekpoRow !== undefined) {
							var lastETENR = '0000';
							for (var i = 0; i < ekpoRow.length; i++) {
								var row = ekpoRow[i];
								if (row.POItemSchedulers.results !== undefined) {

									// AZ prendo l'ultimo ETENR inserito per poi metterlo nelle righe che non ce l'hanno
									row.POItemSchedulers.results.forEach(element => {
										if (element.ETENR !== undefined && element.ETENR !== '')
											lastETENR = element.ETENR;
									});
									var ETENRToInt = parseInt(lastETENR);
									ETENRToInt = ETENRToInt + 1;
									lastETENR = that.pad_with_zeroes(ETENRToInt, 4);

									for (var j = 0; j < row.POItemSchedulers.results.length; j++) {

										// AZ 03/12/2019 non passare a sap le schedulazioni precedentemente inserite
										// Quando si conferma le conferme vecchie NON devono essere passate alla RMO
										if (row.POItemSchedulers.results[j].SYSID !== undefined) {
											continue;
										}
										var singleEkesModel = {};
										singleEkesModel.EBELN = row.EBELN;
										singleEkesModel.EBELP = row.EBELP;
										singleEkesModel.COUNTER = row.POItemSchedulers.results[j].COUNTER;

										if (row.POItemSchedulers.results[j].EBTYP !== undefined) {
											singleEkesModel.EBTYP = row.POItemSchedulers.results[j].EBTYP;
										} else {
											if (row.POItemSchedulers.results[j].EBTYP === undefined && row.EBTYP === undefined)
												singleEkesModel.EBTYP = "";
											else if (row.POItemSchedulers.results[j].EBTYP === undefined)
												singleEkesModel.EBTYP = row.EBTYP;
											else if (row.EBTYP === undefined && row.POItemSchedulers.results[j].EBTYP != undefined)
												singleEkesModel.EBTYP = row.POItemSchedulers.results[j].EBTYP;
										}

										singleEkesModel.EINDT = row.POItemSchedulers.results[j].EINDT;

										if (row.POItemSchedulers.results[j].LPEIN === undefined || row.POItemSchedulers.results[j].LPEIN === "") {
											singleEkesModel.LPEIN = "D";
										} else {
											singleEkesModel.LPEIN = row.POItemSchedulers.results[j].LPEIN;
										}
										singleEkesModel.MENGE = parseInt(row.POItemSchedulers.results[j].MENGE);

										if (row.POItemSchedulers.results[j].UZEIT === undefined) {
											singleEkesModel.UZEIT = "000000";
										} else {
											singleEkesModel.UZEIT = row.POItemSchedulers.results[j].UZEIT;
										}
										if (row.POItemSchedulers.results[j].ETENR === undefined || row.POItemSchedulers.results[j].ETENR === "") {
											singleEkesModel.XBLNR = lastETENR;
										} else {
											singleEkesModel.XBLNR = row.POItemSchedulers.results[j].ETENR;
										}
										body.ekes.push(singleEkesModel);

										// per ogni conferma capire se inviare a buyer o inviarla a sap in base alle percentuali di quant e gg 

										if (row.SchedulationsStatus && row.SchedulationsStatus.length > 0) {
											for (var u = 0; u < row.SchedulationsStatus.length; u++) {
												// prendo la schedulazione dalla lista delle schedulazioni superiore (SCHEDULES)
												if (row.SchedulationsStatus[u].ETENR === singleEkesModel.XBLNR && row.SchedulationsStatus[u].EBELN === singleEkesModel.EBELN && row.SchedulationsStatus[u].EBELP === singleEkesModel.EBELP) {

													var skipToBuyerQua = ''
													var quantSched = row.SchedulationsStatus[u].QTA_CONFERMATA !== undefined && row.SchedulationsStatus[u].QTA_CONFERMATA !== null ? parseFloat(row.SchedulationsStatus[u].QTA_CONFERMATA) : 0
													var mengeCOnf = singleEkesModel.MENGE !== undefined && singleEkesModel.MENGE !== null ? parseFloat(singleEkesModel.MENGE) : 0
													var sum = quantSched + mengeCOnf
													var diff = row.SchedulationsStatus[u].MENGE - sum;
													var perc = (diff / row.SchedulationsStatus[u].MENGE) * 100


													if (row.QuantTollUp > 0 && row.QuantTollDown > 0) {
														if (diff >= 0) {
															if (perc < row.QuantTollUp) {
																// la percentuale di quantità è all'interno dei limiti
																skipToBuyerQua = 'X'
															}
														} else {
															if (diff < 0) {
																if (perc > row.QuantTollDown) {
																	// la percentuale di quantità è all'interno dei limiti
																	skipToBuyerQua = 'X'
																}
															}
														}
													} else {
														if (row.QuantTollUp === 0 && diff === 0 && row.QuantTollDown === 0)
															skipToBuyerQua = 'X'
													}


													var skipToBuyerGG = ''
													var dataSched = row.SchedulationsStatus[u].EINDT
													var year = dataSched.substring(0, 4);
													var month = dataSched.substring(4, 6);
													var day = dataSched.substring(6, 8);

													var dataSched = month + "/" + day + "/" + year
													dataSched = new Date(dataSched)

													var dataConf = singleEkesModel.EINDT
													var year = dataConf.substring(0, 4)
													var month = dataConf.substring(4, 6)
													var day = dataConf.substring(6, 8);
													var dataConf = month + "/" + day + "/" + year
													dataConf = new Date(dataConf)

													var Difference_In_Time = dataConf.getTime() - dataSched.getTime();

													// To calculate the no. of days between two dates 
													var days = Difference_In_Time / (1000 * 3600 * 24);
													if (row.ggTollUp > 0 && row.ggTollDown > 0) {
														if (days >= 0) {
															if (days < row.ggTollUp) {
																// la percentuale di quantità è all'interno dei limiti
																skipToBuyerGG = 'X'
															}
														} else {
															if (days < 0) {
																if (days > row.ggTollDown) {
																	// la percentuale di quantità è all'interno dei limiti
																	skipToBuyerGG = 'X'
																}
															}
														}
													} else {
														if (row.ggTollUp === 0 && days === 0 && row.ggTollDown === 0)
															skipToBuyerGG = 'X'
													}

													var skip = '';
													//if (row.QuantTollUp !== 0 && row.QuantTollDown !== 0 && row.ggTollUp === 0 && row.ggTollDown === 0) {
													//	if (skipToBuyerQua !== '') {
													//		skip = 'X';
													//	}
													//} else {
													//	if (row.QuantTollUp === 0 && row.QuantTollDown === 0 && row.ggTollUp !== 0 && row.ggTollDown !== 0) {
													//		if (skipToBuyerGG !== '') {
													//			skip = 'X';
													//		}
													//	} else {
													//		if (row.QuantTollUp !== 0 && row.QuantTollDown !== 0 && row.ggTollUp !== 0 && row.ggTollDown !== 0) {
													if (skipToBuyerQua !== '' && skipToBuyerGG !== '' && skipToBuyerQua !== undefined && skipToBuyerGG !== undefined) {
														skip = 'X';
													}
													//		}
													//	}
													//}


													body.skipAppBuyer.push({
														"EBELN": row.EBELN,
														"EBELP": row.EBELP,
														"XBLNR": singleEkesModel.XBLNR,
														"SKIP": skip,
														"CONF_TYPE": "QUA",
														"COUNTER": singleEkesModel.COUNTER
													})

													break
												}
											}
										}


									}
								}
								var singleEkpoModel = {};
								singleEkpoModel.EBELN = row.EBELN;
								singleEkpoModel.EBELP = row.EBELP;
								singleEkpoModel.MENGE = row.MENGE;
								singleEkpoModel.MEINS = row.MEINS;
								singleEkpoModel.NETPR = row.NETPR;
								singleEkpoModel.PEINH = row.PEINH;
								if (row.KSCHL === undefined)
									singleEkpoModel.KSCHL = "";
								else
									singleEkpoModel.KSCHL = row.KSCHL;
								singleEkpoModel.BPRME = row.BPRME;
								singleEkpoModel.BPUMZ = row.BPUMZ;
								singleEkpoModel.BPUMN = row.BPUMN;
								singleEkpoModel.UMREZ = row.UMREZ;
								singleEkpoModel.UMREN = row.UMREN;
								singleEkpoModel.LABNR = row.LABNR;
								if (row.UPDKZ === undefined)
									singleEkpoModel.UPDKZ = ""; // TODO Verificarne l'esattezza LS "-> Prima era "L"
								else
									singleEkpoModel.UPDKZ = row.UPDKZ;


								singleEkpoModel.ZINVALIDITA = row.ZINVALIDITA;
								singleEkpoModel.ZFINVALIDATA = row.ZFINVALIDATA;
								//Verifico che il campo testo sia valorizzato


								var nuovoPrezzoPosizione = row.NETPR
								var nuovaUnitaPrezzo = row.PEINH;
								if (parseFloat(nuovoPrezzoPosizione) !== parseFloat(row.OriginalPrice) || parseFloat(nuovaUnitaPrezzo) !== parseFloat(row.OriginalPriceUnit))
									singleEkpoModel.ZMODPREZZO = row.editPrice !== undefined && row.editPrice === true ? 'X' : '';
								else
									singleEkpoModel.ZMODPREZZO = '';
								singleEkpoModel.ZMODSCHED = row.editQuantity === true ? 'X' : ''
								singleEkpoModel.ZINSCONF = 'X';
								singleEkpoModel.ZCONFPARZ = 'X'; // per ordini di tipo F prendere il flag da customizing campo: CONFERMA_PARZIALE altrimenti fisso X
								singleEkpoModel.BSTAE = row.BSTAE;
								body.ekpo.push(singleEkpoModel);

								var singleEkkoModel = {};
								singleEkkoModel.EBELN = row.EBELN;
								singleEkkoModel.LIFNR = row.LIFNR;
								singleEkkoModel.BSTYP = 'F'; // fisso perchè stiamo confermando i piani di consegna
								singleEkkoModel.ZCUSTOM01 = row.ZCUSTOM01;
								singleEkkoModel.ZCUSTOM02 = row.ZCUSTOM02;
								singleEkkoModel.ZCUSTOM03 = row.ZCUSTOM03;
								singleEkkoModel.ZCUSTOM04 = row.ZCUSTOM04;
								singleEkkoModel.ZCUSTOM05 = row.ZCUSTOM05;
								singleEkkoModel.ZCUSTOM06 = row.ZCUSTOM06;
								singleEkkoModel.ZCUSTOM07 = row.ZCUSTOM07;
								singleEkkoModel.ZCUSTOM08 = row.ZCUSTOM08;
								singleEkkoModel.ZCUSTOM09 = row.ZCUSTOM09;
								singleEkkoModel.ZCUSTOM10 = row.ZCUSTOM10;
								body.ekko.push(singleEkkoModel);



							}
						}

						var url = "/backend/OrdersManagement/ConfirmOrders";
						that.showBusyDialog();
						that.ajaxPost(url, body, function (oData) { // funzione generica su BaseController
							that.hideBusyDialog();
							if (oData) {
								if (oData.errLog) {
									MessageBox.error(decodeURI(oData.errLog));
									return;
								}
								if (oData.results && oData.results && oData.results.length > 0) {
									var messageError = "";
									var messageWarning = "";
									$.each(oData.results, function (index, item) {
										if (item.MSGTY !== undefined && item.MSGTY === 'E')
											messageError = item.MESSAGE + " \n " + messageError;
										// Escludo i messaggi di tipo W
										//  if (item.MSGTY !== undefined && (item.MSGTY === 'W' || item.MSGTY === 'I'))
										if (item.MSGTY !== undefined && item.MSGTY === 'I')
											messageWarning = item.MESSAGE + " \n " + messageWarning;
									});
									if (messageError !== "" && messageWarning !== "") {
										MessageBox.error(messageError + "\n" + messageWarning);
									} else {
										if (messageError !== "")
											MessageBox.error(messageError);
										if (messageWarning !== "")
											MessageBox.warning(messageWarning);
										if (messageError === "" && messageWarning === "") {
											MessageBox.success(that.getResourceBundle().getText("correctConfirmPositions"), {
												title: "Success", // default
												onClose: function () {
													that.onCloseOrderPositions(true);
												} // default

											});
										}
									}

								} else {
									MessageBox.success(that.getResourceBundle().getText("correctConfirmPositions"), {
										title: "Success", // default
										onClose: function () {
											that.onCloseOrderPositions(true);
										} // default

									});

								}
							}

						});
					}
				}
			});
		},

		onNavBackToConfirm: function () {
			var navCon = sap.ui.getCore().byId("navCon");
			navCon.to(sap.ui.getCore().byId("p1"), "slide");
		},

		getLastSchedulationPosition: function (modelData) {
			var lastPos = 0;
			// if (tableName === 'Ekes') {
			for (var i = 0; i < modelData.length; i++) {
				if (modelData[i].ETENS != undefined && parseInt(modelData[i].ETENS) > lastPos) {
					lastPos = parseInt(modelData[i].ETENS);
				}
			}
			return "" + (lastPos + 10);
			// }
			// if (tableName === 'Eket') {
			// 	for (var i = 0; i < modelData.length; i++) {
			// 		if (modelData[i].ETENR != undefined && parseInt(modelData[i].ETENR) > lastPos) {
			// 			lastPos = parseInt(modelData[i].ETENR);
			// 		}
			// 	}
			// 	return "" + (lastPos + 10);
			// }
		},

		/*onChangeProfiloConsegna: function (oEvent) {
			var sObjectId = that.getModel("OrderJSONModel").getData().EBELN;
			var selectedKey = oEvent.getSource().getSelectedItem().getKey();
	
			var profiliConsegna = that.getModel("ListProfiliConfermaJSONModel").getData().results;
			var profiloSelezionato = [];
			if (profiliConsegna != undefined) {
				profiloSelezionato = profiliConsegna.find(x => x.CAT_CONFERMA === selectedKey);
			}
	
			that.loadObject(sObjectId, profiloSelezionato !== undefined ? profiloSelezionato.PROFILO_CONTROLLO : "", selectedKey, function (
				oData) {
				that.hideBusyDialog();
				if (oData === null || oData === undefined) {
	
				} else {
					that._completeInit("Display", oData, function () {
	
					});
				}
			});
		},*/
		onPrintPDFOrder: function () {
			var ebeln = that.getView().getModel("OrderJSONModel").getData().EBELN;
			var url = "/SupplierPortal_OrdersManagement/xsOdata/GetOrderPDF.xsjs?I_USERID=" + this.getCurrentUserId() + "&I_EBELN=" + ebeln +
				"&I_BSTYP=F";

			that._pdfViewer = new PDFViewer();
			that._pdfViewer.setShowDownloadButton(false);
			that._pdfViewer.attachSourceValidationFailed(function (oControlEvent) {
				oControlEvent.preventDefault();
			});
			that.getView().addDependent(that._pdfViewer);
			that._pdfViewer.setSource(url);
			that._pdfViewer.open();

		},

		onSelectAll: function (oEvent) {

			var oTable = that.getView().byId("OrderHeadersTable");
			oTable.getItems().forEach(function (r) {
				var oPath = r.oBindingContexts.OrderJSONModel.sPath;
				that.getModel("OrderJSONModel").getProperty(oPath);

				if (that.getModel("OrderJSONModel").getProperty(oPath).SKIP_NO_CONFERME === null) {
					if (oEvent.getParameters().selected)
						that.getModel("OrderJSONModel").getProperty(oPath).isSelected = true;
					else
						that.getModel("OrderJSONModel").getProperty(oPath).isSelected = false;
				}
			});

			that.getModel("OrderJSONModel").refresh();
		},
		_onObjectMatched: function (oControlEvent) {

			var sObjectId = oControlEvent.getParameter("arguments").orderID;
			that.loadObject(sObjectId, "", "", function (oData) {
				that.hideBusyDialog();
				if (oData === null || oData === undefined) {

				} else {
					that._completeInit("Display", oData, function () {
						that.onDisableCheckboxRow();
					});
				}
			});
		},
		onDisableCheckboxRow: function () {

			var oTable = this.getView().byId("OrderJSONModel");
			for (var i = 0; i < oTable.getItems().length; i++) {
				var obj = this.getView().getModel("OrderJSONModel").getProperty(oTable.getItems()[i].oBindingContexts.OrderJSONModel.sPath);
				var canShowPosition = true;
				if (obj.BSTAE === undefined || obj.BSTAE === "") {
					if (obj.LABNR === "" && (obj.KZABS !== undefined && obj.KZABS !== "")) {
						canShowPosition = true;
					} else {
						canShowPosition = false;
					}
				} else {
					canShowPosition = true;
				}

			}

		},
		onCheckPosition: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getParent().getBindingContext("SelectedPositionsJSONModel").sPath;
			var mod = that.getModel("SelectedPositionsJSONModel").getProperty(oPath);

			//Sostituita la chiamata RMO con il ciclo FOR//
			if (mod.editPrice === true) {
				var errP = that.onControllPriceOK(mod);
				if (errP !== "" && errP !== undefined) {
					MessageBox.error(errP, {
						icon: MessageBox.Icon.ERROR,
						title: "Error",
					});
					return;
				}
			}

			var err = that.onControllPosition(mod);
			if (err !== "")
				MessageBox.error(err, {
					icon: MessageBox.Icon.ERROR,
					title: "Error",
				});
			else
				MessageBox.success(that.getResourceBundle().getText("OK_Position_confirm"), {
					icon: MessageBox.Icon.SUCCESS,
				});

		},

		onControllDateOK: function (mod) {
			var err = "";
			var today = new Date();

			var ordine = mod.EBELN + "-" + mod.EBELP;
			if (mod.TimeDependent === true) {
				if (mod.ZINVALIDITA === undefined || mod.ZINVALIDITA === "" || mod.ZINVALIDITA === null) {
					err = err + "\n" + that.getResourceBundle().getText("ERR_Price_DateB", ordine);
				} else {
					var dateString = mod.ZINVALIDITA;
					var year = dateString.substring(0, 4);
					var month = dateString.substring(4, 6);
					var day = dateString.substring(6, 8);
					var date = new Date(year, month - 1, day);
					if (date < today)
						err = err + "\n" + that.getResourceBundle().getText("ERR_Price_valB", ordine);
				}

				if (mod.ZFINVALIDATA === undefined || mod.ZFINVALIDATA === "" || mod.ZFINVALIDATA === null)
					err = err + "\n" + that.getResourceBundle().getText("ERR_Price_DateE", ordine);
			}
			return err;

		},
		onControllPriceOK: function (mod) {
			var err = "";
			// controllo che il prezzo modificato sia all'interno delle percentuali di scostamento se ci sono
			if (mod.PricePercDOWN !== undefined && mod.PricePercDOWN !== null) {
				// TODO OriginalPrice valorizzato solo quando si inserisce una schedulazione e non quello originale!. spostare la valorizzazione
				if (mod.RapportoPrezzoUnita !== undefined) {

					var PEINH = mod.PEINH;
					var NETPR = mod.NETPR;
					if (NETPR != undefined && NETPR != "" && PEINH != undefined && PEINH != "") {
						PEINH = parseFloat(PEINH);
						NETPR = parseFloat(NETPR);
						var nuovoPrezzoPosizione = NETPR / PEINH;
						var differenzaPrezzo = nuovoPrezzoPosizione - mod.RapportoPrezzoUnita;
						if (differenzaPrezzo > 0) {
							// differenza positiva
							var percScostamentoUP = (differenzaPrezzo / mod.RapportoPrezzoUnita) * 100;
							if (percScostamentoUP > mod.PricePercUP) {
								var ordine = mod.EBELN + "-" + mod.EBELP;
								err = err + "\n" + that.getResourceBundle().getText("ERR_Price_Perc_Up", ordine);
							} else {
								var dateErr = that.onControllDateOK(mod);
								if (dateErr !== '') {
									err = err + "\n" + dateErr;
								}
							}
						}
						if (differenzaPrezzo < 0) {
							// differenza positiva
							var percScostamentoDown = ((differenzaPrezzo * -1) / mod.RapportoPrezzoUnita) * 100;
							var ordine = mod.EBELN + "-" + mod.EBELP;
							if (percScostamentoDown > mod.PricePercDOWN) {
								err = err + "\n" + that.getResourceBundle().getText("ERR_Price_Perc_Down", ordine);
							} else {
								var dateErr = that.onControllDateOK(mod);
								if (dateErr !== '') {
									err = err + "\n" + dateErr;
								}
							}
						}
					}
				}
			}

			return err;

		},

		onControllPosition: function (mod) {
			var err = ''

			var sommaQuantitaSchedulazioni = 0;
			var sommaTotalePosizioniNuove = 0;
			if (mod.POItemSchedulers.results && mod.POItemSchedulers.results.length > 0) {
				for (var j = 0; j < mod.POItemSchedulers.results.length; j++) {
					mod.POItemSchedulers.results[j].EINDT = mod.POItemSchedulers.results[j].EINDT.split('-').join('');
					sommaQuantitaSchedulazioni = sommaQuantitaSchedulazioni + parseFloat(mod.POItemSchedulers.results[j].MENGE);
					if ((mod.POItemSchedulers.results[j]) && ((mod.POItemSchedulers.results[j].EINDT === "") || (mod.POItemSchedulers
						.results[
						j].MENGE === ""))) {
						err = err + "\n" + that.getResourceBundle().getText("ERR_Schedulations_Mandatory");
						break;
					}
					if (mod.POItemSchedulers.results[j].MENGE === 0 || mod.POItemSchedulers.results[j].MENGE === "0") {
						err = err + "\n" + that.getResourceBundle().getText("ERR_Schedulations_Menge_0");
						break;
					}
					if (mod.POItemSchedulers.results[j].SYSID === null || mod.POItemSchedulers.results[j].SYSID === undefined) {
						sommaTotalePosizioniNuove = sommaTotalePosizioniNuove + 1;
					}
				}
				if (sommaTotalePosizioniNuove === 0) {
					// Eliminato controllo sulle consegne perchè non gestito quando il prezzo viene modificato
					//err = err + "\n" + that.getResourceBundle().getText("ERR_no_schedulations");
				}

			}

			var profiliConsegna = that.getModel("AllProfiliConfermaJSONModel").getData().results;
			var profiloSelezionato = [];
			if (profiliConsegna != undefined) {

				profiliConsegna.forEach(function (elem) {
					if (elem.TIPO_CONFERMA === mod.UPDKZ && elem.PROFILO_CONTROLLO === mod.BSTAE) {
						profiloSelezionato = elem;
						//	return false;
					}

				});
			}


			//LUVE

			/* 1 -  controllare se c'è il parziale quantità
			se parziale = 'X' allora controllo verificare solo percQuant superiore
				- SE FLAG PROFRESSIVO NON ATTIVO usare la quantità della schedulazione singola e confrontarlo con tutte le conferme (in essere, su backend, in rmo)
				- SE FLAG PROGRESSIVO é ATTIVO usare (NON ORA)
			se parziale = '' allora controllare percQuantSup e Inf 
				- SE FLAG PROFRESSIVO NON ATTIVO usare la quantità della schedulazione singola e confrontarlo con tutte le conferme (in essere, su backend, in rmo) */


			if (mod.QuantPercDOWN !== undefined && mod.QuantPercUP !== undefined) {

				// Aggregazione delle quantita splittate
				var arrConfermeAggregate = []
				mod.POItemSchedulers.results.forEach(conferma => {
					var trovato = false
					arrConfermeAggregate.forEach(element => {
						if (element.ETENR === conferma.ETENR) {
							trovato = true
							element.MENGE = parseFloat(conferma.MENGE) + parseFloat(element.MENGE)
						}
					});
					if (!trovato) {
						var elem = JSON.parse(JSON.stringify(conferma))
						arrConfermeAggregate.push(elem)
					}
				});

				// per ogni conferma 
				arrConfermeAggregate.forEach(conferma => {
					if (mod.SchedulationsStatus && mod.SchedulationsStatus.length > 0 && conferma.SYSID === undefined) {
						mod.SchedulationsStatus.forEach(schedulazione => {
							var mengeSomma = 0
							if (conferma.ETENR === schedulazione.ETENR) {
								mengeSomma = parseFloat(schedulazione.QTA_CONFERMATA) + parseFloat(conferma.MENGE)
								var diff = parseFloat(schedulazione.MENGE) - mengeSomma
								var perc = (Math.abs(diff) / parseFloat(schedulazione.MENGE)) * 100

								var ordine = mod.EBELN + "-" + mod.EBELP + " CONF: " + conferma.ETENR;

								if (profiloSelezionato.PARZIALE_QUANTITA === 'X') {
									if (diff < 0)
										if (perc > mod.QuantPercUP) {
											err = err + "\n" + that.getResourceBundle().getText("ERR_Quant_Perc_Up_Single");
											err = err + "\n" + ordine;
										}
								} else {
									if (diff < 0)
										if (perc > mod.QuantPercUP) {
											err = err + "\n" + that.getResourceBundle().getText("ERR_Quant_Perc_Up_Single");
											err = err + "\n" + ordine;
										}
									if (diff > 0)
										if (perc > mod.QuantPercDOWN) {
											err = err + "\n" + that.getResourceBundle().getText("ERR_Quant_Perc_Down_Single");
											err = err + "\n" + ordine;
										}
								}
							}
						});
					}
				});

			}

			if (mod.UPDKZ === '4') {
				if (profiloSelezionato.CONTROLLO_CORSO_APP !== '') { // DA TENERE PER IL 4

					var trovato = false;
					if (mod.RMOData !== undefined && mod.RMOData.EkkoEkpo !== undefined && mod.RMOData.EkkoEkpo.length > 0) {
						var EkkoEkpo = mod.RMOData.EkkoEkpo.find(x => x.STATUS === 'RC' && x.UPDKZ === '4' && x.EBELN === mod.EBELN && x.EBELP ===
							mod
								.EBELP);
						if (EkkoEkpo !== undefined)
							trovato = true;
					}

					/*Controllo CH già approvato se flagh CONTROLLO_CORSO_APP nella tabella di Customizing è attivo (T_PROFILI_CONFERMA)*/
					var trovato = false;
					if (mod.RMOData !== undefined && mod.RMOData.EketEkes !== undefined && mod.RMOData.EketEkes.length > 0) {
						var EketEkes = mod.RMOData.EketEkes.find(x => x.EBTYP === mod.EBTYP && x.EBELN === mod.EBELN && x.EBELP === mod.EBELP);
						if (EketEkes !== undefined)
							trovato = true;
					}

					// se non ci sono sulla RMO-EKKO-EKPO devo andare a loopare le ekks dell'attuale ordine per cercare se li ci conferme upkz ='4'
					// se le trovo blocco 
					if (!trovato) {
						//var ekesModel = that.getView().getModel("SelectedPositionsJSONModel").getData().POItemSchedulers;
						var ekesModel = mod.POItemSchedulers;
						if (ekesModel !== undefined && ekesModel.results !== undefined) {
							ekesModel.results.forEach(function (r) {
								if (mod.SYSID === undefined && r.EBTYP === mod.EBTYP) {
									trovato = true;
								}
							});
						}
					}
					if (trovato)
						err = err + "\n" + that.getResourceBundle().getText("ERR_Confirmation_In_Corso_Approvazione");

				} else {
					/*Controllo CH in fase di Approvazione*/
					var trovato = false;
					if (mod.RMOData !== undefined && mod.RMOData.EkkoEkpo !== undefined && mod.RMOData.EkkoEkpo.length > 0) {
						var EkkoEkpo = mod.RMOData.EkkoEkpo.find(x => x.STATUS === 'RC' && x.UPDKZ === '4' && x.EBELN === mod.EBELN && x.EBELP ===
							mod
								.EBELP);
						if (EkkoEkpo !== undefined)
							trovato = true;
					}

					if (!trovato) {
						//var ekesModel = that.getView().getModel("SelectedPositionsJSONModel").getData().POItemSchedulers;
						var ekesModel = mod.POItemSchedulers;
						if (ekesModel !== undefined && ekesModel.results !== undefined) {
							ekesModel.results.forEach(function (r) {
								if (r.SYSID !== null && r.SYSID !== undefined && r.EBTYP === mod.EBTYP) {
									trovato = true;
								}
							});
						}
					}
					if (trovato)
						err = err + "\n" + that.getResourceBundle().getText("ERR_Confirmation_In_Corso_Approvazione");
				}
			}


			return err;
		},

		onSetSchedulationStatus: function (oValue) {
			if (oValue === "G") {
				return "Success";
			} else if (oValue === "O") {
				return "Indication03";
			} else {
				if (oValue === "R") {
					return "Indication02";
				} else
					return "None";
			}
		},

		/*onChange: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getParent().getBindingContext("SelectedPositionsJSONModel").sPath;
			var mod = that.getModel("SelectedPositionsJSONModel").getProperty(oPath);
			mod.POItemSchedulers.results.forEach(function (modSelect) {
				//	var modSelect = JSON.parse(JSON.stringify(aData));
				if (modSelect.SYSID === undefined && modSelect.MENGE !== null && modSelect.MENGE !== "" && modSelect.EINDT !== null && modSelect
					.EINDT !== "") {
					that.getSchedulationsStatus(mod, modSelect.EBTYP);
				}
			});
		},*/

		getSchedulationsStatus: function (mod, ebtyp) {
			/*var new_ekes = [];
			mod.POItemSchedulers.results.forEach(function (aData) {
				// 				// distruggo il binding con il modello altrimenti non funziona la cler dei dati
				var oPositionModel = {};
	
				if (aData.SYSID === undefined && aData.MENGE !== null && aData.MENGE !== "" && aData.EINDT !==
					null && aData.EINDT !== "") {
					oPositionModel.EBELN = mod.EBELN;
					oPositionModel.EBELP = mod.EBELP;
					oPositionModel.MENGE = aData.MENGE;
					oPositionModel.EINDT = aData.EINDT;
					new_ekes.push(oPositionModel);
				}
			});
	
			if (new_ekes.length > 0) {
				var body = {
					"newEkes": new_ekes
				}; */
			var url = "/backend/SchedulingAgreementManagement/GetCalculatedSchedulations?I_EBELN=" +
				mod.EBELN +
				"&I_EBELP=" + mod.EBELP + "&I_BSTYP=" + mod.BSTYP + "&I_BSART=" + mod.BSART + "&I_EBTYP=" + ebtyp;
			that.showBusyDialog();
			that.ajaxPost(url, {}, function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (oData) {
					mod.SchedulationsStatus = oData.results;
					var arrETENR = [];
					var counter = 0;
					for (var index = 0; index < mod.SchedulationsStatus.length; index++) {
						var element = mod.SchedulationsStatus[index];


						// Eliminare le schedulazioni che hanno zperiodo <> 1
						if (element.ZPERIODO !== "1")
							continue

						var deltaMenge = (parseFloat(element.MENGE) - parseFloat(element.QTA_CONFERMATA));

						if (deltaMenge > 0) {

							// modello per scelta ETENR di solo le conferme che hanno delta quantità > 0
							arrETENR.push({
								"ETENR": element.ETENR
							})

							var schedulation = {
								"EINDT": element.EINDT,
								"MENGE": deltaMenge,
								"ETENR": element.ETENR,
								"EBTYP": ebtyp,
								"ETENRenabled": false,
								"COUNTER": counter++
							};
							if (mod !== undefined && mod.POItemSchedulers.results !== undefined) {
								// se nelle consegne hp già inserito una riga ETENR non la ri-aggiungo
								var trovato = false
								mod.POItemSchedulers.results.forEach(el => {
									if (element.ETENR === el.ETENR && element.COUNTER === el.COUNTER)
										trovato = true
								});
								if (!trovato)
									mod.POItemSchedulers.results.push(schedulation);
							} else {
								var oSchedulationsArray = [];
								oSchedulationsArray.push(schedulation);
								mod.POItemSchedulers.results = oSchedulationsArray;
							}
						}

					}

					mod.POItemSchedulers.results.forEach(element => {
						element.ETENRS = arrETENR;
					});

					that.getModel("SelectedPositionsJSONModel").refresh();


				}
			});
			//	} 
		},
		onLegend: function (oEvent) {
			var oButton = oEvent.getSource();
			// create popover
			if (!this._oPopover) {
				new sap.ui.core.Fragment.load({
					name: "it.aupsup.purchords.fragments.ColorStatus",
					controller: that
				}).then(function (pPopover) {
					that._oPopover = pPopover;
					that.getView().addDependent(this._oPopover);
					//that._oPopover.bindElement("/ProductCollection/0");
					that._oPopover.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
			}
		},
		onColumnSelection: function (event) {
			var that = this;
			var List = that.byId("List");
			var popOver = this.byId("popOver");
			if (List !== undefined) {
				List.destroy();
			}
			if (popOver !== undefined) {
				popOver.destroy();
			}
			/*----- PopOver on Clicking ------ */
			var popover = new sap.m.Popover(this.createId("popOver"), {
				showHeader: true,
				showFooter: true,
				placement: sap.m.PlacementType.Bottom,
				content: []
			}).addStyleClass("sapMOTAPopover sapTntToolHeaderPopover");

			/*----- Adding List to the PopOver -----*/
			var oList = new sap.m.List(this.createId("List"), {});
			this.byId("popOver").addContent(oList);
			var openAssetTable = this.getView().byId("OrderHeadersTable"),
				columnHeader = openAssetTable.getColumns();
			var openAssetColumns = [];
			for (var i = 0; i < columnHeader.length; i++) {
				var hText = columnHeader[i].getAggregation("header") !== null ? columnHeader[i].getAggregation("header").getProperty("text") : "";
				var columnObject = {};
				columnObject.column = hText;
				openAssetColumns.push(columnObject);
			}
			var oModel1 = new sap.ui.model.json.JSONModel({
				list: openAssetColumns
			});
			var itemTemplate = new sap.m.StandardListItem({
				title: "{oList>column}"
			});
			oList.setMode("MultiSelect");
			oList.setModel(oModel1);
			sap.ui.getCore().setModel(oModel1, "oList");
			var oBindingInfo = {
				path: 'oList>/list',
				template: itemTemplate
			};
			oList.bindItems(oBindingInfo);
			var footer = new sap.m.Bar({
				contentLeft: [],
				contentMiddle: [
					new sap.m.Button({
						text: that.getResourceBundle().getText("Comfirm"),
						press: function () {
							that.onSavePersonalization();
						}
					}), new sap.m.Button({
						text: "Cancel",
						press: function () {
							that.onCancelPersonalization();
						}
					})
				]

			});

			this.byId("popOver").setFooter(footer);
			var oList1 = this.byId("List");
			var table = this.byId("OrderHeadersTable").getColumns();
			/*=== Update finished after list binded for selected visible columns ==*/
			oList1.attachEventOnce("updateFinished", function () {
				var a = [];
				for (var j = 0; j < table.length; j++) {
					var list = oList1.oModels.undefined.oData.list[j].column;
					a.push(list);
					var Text = table[j].getHeader() !== null ? table[j].getHeader().getProperty("text") : "";
					var v = table[j].getProperty("visible");
					if (v === true) {
						if (a.indexOf(Text) > -1) {
							var firstItem = oList1.getItems()[j];
							oList1.setSelectedItem(firstItem, true);
						}
					}
				}
			});
			popover.openBy(event.getSource());
		},
		onCancelPersonalization: function () {
			this.byId("popOver").close();
		},

		onSavePersonalization: function () {
			var that = this;
			var oList = this.byId("List");
			var array = [];
			var items = oList.getSelectedItems();

			// Getting the Selected Columns header Text.
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var context = item.getBindingContext("oList");
				var obj = context.getProperty(null, context);
				var column = obj.column;
				array.push(column);
			}
			/*---- Displaying Columns Based on the selection of List ----*/
			var table = this.byId("OrderHeadersTable").getColumns();
			var columnModel = that.getView().getModel("columnVisibilityModel").getData();
			for (var j = 0; j < table.length; j++) {
				var idColonna = "";
				var Text = table[j].getHeader() !== null ? table[j].getHeader().getProperty("text") : "";
				var Column = table[j].getId();
				if (Column !== null && Column !== undefined) {
					idColonna = Column.split("--");
					if (idColonna !== undefined && idColonna.length > 1) {
						idColonna = idColonna[1];
					}
				}
				var columnId = this.getView().byId(Column);
				if (columnId !== undefined)
					if (array.indexOf(Text) > -1) {
						columnModel[idColonna] = true;
						//	columnId.setVisible(true);
					} else {
						columnModel[idColonna] = false;
						//columnId.setVisible(false);
					}
			}
			that.getView().getModel("columnVisibilityModel").refresh();
			this.byId("popOver").close();

		},

		onGetOdataColumns: function () {
			// Implementare il servizio che in AMA è stato creato come "VariantsService.xsodata", inserire poi il model nel Manifest

			//	var oModelData = that.getOwnerComponent().getModel("VariantsModel");
			//	oModelData.metadataLoaded().then(
			//		that.onMetadataLoaded.bind(that, oModelData));
			var columModel = { "EBELN": true, "EBELP": true, "LIFNR": true, "NAME1": true, "MATNR": true, "TXZ01": true, "IDNLF": true, "MENGE": true, "MEINS": true, "WAERS": true, "PRIMO_PERIODO": true, "SECONDO_PERIODO": false };
			var oModel = new JSONModel();
			oModel.setData(columModel);
			that.getView().setModel(oModel, "columnVisibilityModel");

		},
		onMetadataLoaded: function (myODataModel) {


			var metadata = myODataModel.getServiceMetadata();
			if (metadata.dataServices.schema[0].entityType) {
				var selected = metadata.dataServices.schema[0].entityType.find(x => x.name === "SearchOrderPosStructureType");
				if (selected !== undefined) {
					var str = "";
					selected.property.forEach(function (elem) {
						str = '"' + elem.name + '":true,' + str;
					});
					str = str.slice(0, -1);
					str = '{' + str + '}';
					var oModel = new JSONModel();
					oModel.setData(JSON.parse(str));
					that.getView().setModel(oModel, "columnVisibilityModel");

				}
			}
		},

		onGetTexts: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getBindingContext("OrderJSONModel").sPath;
			var selectedRowdata = that.getModel("OrderJSONModel").getProperty(oPath);

			var currentSYSID = sap.ui.getCore().getModel("sysIdJSONModel") !== undefined && sap.ui.getCore().getModel(
				"sysIdJSONModel").getData() !==
				undefined ? sap.ui.getCore().getModel("sysIdJSONModel").getData().SYSID : "";

			that.showBusyDialog()
			var url = "/backend/Utils/UtilsManagement/GetDocumentTexts?I_EBELN=" + selectedRowdata.EBELN + "&I_BSTYP=" + selectedRowdata.BSTYP + "&I_EBELP=" + selectedRowdata.EBELP + "&I_SYSID=" + currentSYSID

			that.ajaxGet(url, function (oData) {
				that.hideBusyDialog()
				if (oData && (oData.header_texts || oData.pos_texts) && (oData.header_texts.results.length > 0 || oData.pos_texts.results.length > 0)) {

					oData.EBELP = selectedRowdata.EBELP
					oData.EBELN = selectedRowdata.EBELN

					var oModel = new JSONModel();
					oModel.setData(oData);
					var oComponent = that.getOwnerComponent();
					oComponent.setModel(oModel, "TextsJSONModel");

					if (!that.oSearchTextsDialog) {
						that.oSearchTextsDialog = sap.ui.xmlfragment("it.aupsup.purchords.fragments.Texts", that);
						that.getView().addDependent(that.oSearchTextsDialog);
					}
					that.oSearchTextsDialog.open();

				} else {
					MessageBox.error(that.getResourceBundle().getText("noTextsFound"));
				}
			});

		},

		onCloseTexts: function () {
			if (that.oSearchTextsDialog) {
				that.oSearchTextsDialog.close();
				that.oSearchTextsDialog.destroy();
				that.oSearchTextsDialog = undefined;
			}
		},

		onEditTexts: function (oEvent) {
			sap.ui.getCore().byId('saveTextsButton').setVisible(true)
		},

		onSaveTexts: function (oEvent) {
			var oComponent = that.getOwnerComponent();
			var oModel = oComponent.getModel("TextsJSONModel").getData();

			var currentSYSID = sap.ui.getCore().getModel("sysIdJSONModel") !== undefined && sap.ui.getCore().getModel(
				"sysIdJSONModel").getData() !==
				undefined ? sap.ui.getCore().getModel("sysIdJSONModel").getData().SYSID : "";

			var body = {}
			var arrPromise = [];
			if (oModel && oModel.header_texts && oModel.header_texts.results && oModel.header_texts.results.length > 0) {

				var numberOfConfirmable = 0
				if (oModel.header_texts && oModel.header_texts.results.length > 0) {

					oModel.header_texts.results.forEach(element => {
						if (element.COMMENTABLE) {
							numberOfConfirmable++
						}
					})

					if (numberOfConfirmable > 0) {
						oModel.header_texts.results.forEach(element => {
							if (element.COMMENTABLE) {
								body.SYSID = currentSYSID,
									body.EBELN = oModel.EBELN,
									body.EBELP = oModel.EBELP,
									body.BSTYP = 'F',
									body.TABLE = 'EKKO',
									body.ID = element.ID,
									body.COMMENT = element.COMMENT
							}

							var url = "/backend/Utils/UtilsManagement/SaveDocumentTexts";

							arrPromise.push(new Promise(
								function (resolve, reject) {
									setTimeout(
										function () {
											//do something special
										}, 1);
									that.ajaxPost(url, body, function (oData) {
										resolve();
									})
								}));
						});

					}
				}
			}

			var numberOfConfirmablePos = 0
			if (oModel.pos_texts && oModel.pos_texts.results.length > 0) {
				oModel.pos_texts.results.forEach(element => {
					if (element.COMMENTABLE) {
						numberOfConfirmablePos++
					}
				})

				if (numberOfConfirmablePos > 0) {
					oModel.pos_texts.results.forEach(element => {
						if (element.COMMENTABLE) {
							body.SYSID = currentSYSID,
								body.EBELN = oModel.EBELN,
								body.EBELP = oModel.EBELP,
								body.BSTYP = 'F',
								body.TABLE = 'EKPO',
								body.ID = element.ID,
								body.COMMENT = element.COMMENT
						}

						var url = "/backend/Utils/UtilsManagement/SaveDocumentTexts";

						arrPromise.push(new Promise(
							function (resolve, reject) {
								setTimeout(
									function () {
										//do something special
									}, 1);
								that.ajaxPost(url, body, function (oData) {
									resolve();
								})
							}));

					});
				}
			}
			if (arrPromise.length > 0) {
				that.showBusyDialog();
			}
			Promise.all(arrPromise).then(function () {
				that.hideBusyDialog();
				that.onCloseTexts();
			})
		},

		onItemDownload: function (oEvent) {
			var path = oEvent.getSource().getParent().getBindingContext("OrderJSONModel");
			var selctedRowdata = that.byId("OrderHeadersTable").getModel("OrderJSONModel").getProperty(path.sPath);
			//var getTabledata = that.getView().getModel("OrderJSONModel").getData().results;
			//var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
			//var selctedRowdata = getTabledata[itemPosition];
			// Richiamare servizio estrazione Customizing
			var url = "/backend/DocumentManagement/getDocumentTypes?I_APPLICATION=ODA";

			that.ajaxGet(url, function (oData) {
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					var oComponent = that.getOwnerComponent();
					oComponent.setModel(oModel, "CustomDocJSONModel");
					// Creare POP UP selezione tipo doc Dowload

					var fnDoSearch = function (oEvent, bProductSearch) {
						var aFilters = [],
							sSearchValue = oEvent.getParameter("value"),
							itemsBinding = oEvent.getParameter("itemsBinding");

						// create the local filter to apply
						if (sSearchValue !== undefined && sSearchValue.length > 0) {
							aFilters.push(new sap.ui.model.Filter((bProductSearch ? "DMS_DOC_TYPE_OUT" : "DMS_DOC_TYPE_DESCR"), sap.ui.model.FilterOperator.Contains,
								sSearchValue));
						}
						// apply the filter to the bound items, and the Select Dialog will update
						itemsBinding.filter(aFilters, "Application");
					};

					var oSelectDialog1 = new sap.m.SelectDialog({
						title: that.getResourceBundle().getText("Title_TypeDoc"),
						search: fnDoSearch,
						liveChange: fnDoSearch

					});
					var oItemTemp
					var oItemTemplate = new sap.m.StandardListItem({
						title: "{DMS_DOC_TYPE_DESCR}",
						description: "{DMS_DOC_TYPE_OUT}"
					});

					// set model & bind Aggregation
					oSelectDialog1.setModel(oModel);
					oSelectDialog1.bindAggregation("items", "/", oItemTemplate);

					// attach close listener
					oSelectDialog1.attachConfirm(function (oEvent) {
						var selectedItem = oEvent.getParameter("selectedItem");
						if (selectedItem) {
							var path = oEvent.getParameter("selectedItem").getBindingContextPath();
							var pos_model = that.getView().getModel("CustomDocJSONModel").getProperty(path);
							// Chiamata DOC LIST
							var url = "/backend/DocumentManagement/DocList?I_CLASSIFICATION=" + pos_model.CLASSIFICATION + "&I_APPLICATION=" + pos_model.APPLICATION + "&I_OBJECT_CODE=" + (pos_model.DMS_DOC_OBJ === 'EKKO' ? selctedRowdata.EBELN : pos_model.DMS_DOC_OBJ === 'EKPO' ? selctedRowdata.EBELN + selctedRowdata.EBELP : '');
							that.showBusyDialog();
							jQuery.ajax({
								url: url,
								method: 'GET',
								async: false,
								success: function (data) {

									if (data && data.results && data.results.length > 0) {
										var totDoc = data.results.length;
										data.results.forEach(function (elem) {
											url = "/backend/DocumentManagement/DocDownload?I_DOKAR=" + elem.DOKAR + "&I_DOKNR=" + elem.DOKNR + "&I_DOKTL=" + elem.DOKTL + "&I_DOKVR=" + elem.DOKVR +
												"&I_LO_INDEX=" + elem.LO_INDEX + "&I_LO_OBJID=" + elem.LO_OBJID + "&I_OBJKY=" + elem.OBJKY + "&I_DOKOB=" + elem.DOKOB;
											// NB: questa chiamata fetch funziona SOLO su portale non con webide preview
											fetch(url)
												.then(resp => resp.blob())
												.then(blob => {
													const url = window.URL.createObjectURL(blob);
													const a = document.createElement('a');
													a.style.display = 'none';
													a.href = url;
													// the filename you want
													a.download = elem.DESCRIPTION !== undefined && elem.DESCRIPTION !== "" ? elem.DESCRIPTION : "outFile" + elem.EXTENSION;
													document.body.appendChild(a);
													a.click();
													window.URL.revokeObjectURL(url);
													totDoc--;
													if (totDoc <= 0) {
														that.hideBusyDialog();
													}
												})
												.catch(() => console.log("some error during download process"));

										});
									} else {
										that.hideBusyDialog();
										MessageBox.error(that.getResourceBundle().getText("ERR_file_not_found"));
									}
								},
								error: function (e) {
									that.hideBusyDialog();
									MessageBox.error(that.getResourceBundle().getText("ERR_file_not_found"));
								}
							});

						}

					});
					if (oModel.oData.length > 0)
						oSelectDialog1.open();

				}
			});

		},

		onAddSchedulation: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getParent().getBindingContext("SelectedPositionsJSONModel").sPath;
			var mod = that.getModel("SelectedPositionsJSONModel").getProperty(oPath);
			var keys = oEvent.getParameter("id");
			var splits = keys.split("-");
			var rowNumber = splits[splits.length - 1];

			var lastCounter = 0
			if (mod.POItemSchedulers.results && mod.POItemSchedulers.results.length > 0) {
				mod.POItemSchedulers.results.forEach(element => {
					if (parseInt(element.COUNTER) > lastCounter)
						lastCounter = parseInt(element.COUNTER)
				});
			}

			var selectedRow = mod.POItemSchedulers.results[rowNumber];
			mod.POItemSchedulers.results.push({
				'EINDT': selectedRow.EINDT,
				'MENGE': selectedRow.MENGE,
				'ETENR': selectedRow.ETENR,
				'EBTYP': selectedRow.EBTYP,
				'ETENRenabled': selectedRow.ETENRenabled,
				'ETENRS': selectedRow.ETENRS,
				'COUNTER': ++lastCounter
			})

			mod.POItemSchedulers.results.sort(that.sortJSONArrayByProperty('ETENR'))
			that.getView().getModel("SelectedPositionsJSONModel").refresh()


		}
	});

});