sap.ui.define([
	"it/alteaup/supplier/portal/schedulingagreement/AUPSUP_HTML5_SCHEDAGREE/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"it/alteaup/supplier/portal/schedulingagreement/AUPSUP_HTML5_SCHEDAGREE/js/Date",
	"it/alteaup/supplier/portal/schedulingagreement/AUPSUP_HTML5_SCHEDAGREE/js/formatter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/Dialog"
], function (BaseController, Filter, FilterOperator, JSONModel, MessageBox, MessageToast, Sorter, Date, Formatter, Export, ExportTypeCSV,
	Dialog) {
	"use strict";
	var that;
	return BaseController.extend("it.alteaup.supplier.portal.schedulingagreement.AUPSUP_HTML5_SCHEDAGREE.controller.Worklist", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf it.alteaup.supplier.portal.purchaseorders.PurchaseOrders.view.Worklist
		 */
		pressDialog: null,
		onInit: function () {
			that = this;

			var startupParams = undefined;
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
					that.getRouter().navTo("object", {
						orderID: startupParams.objectId[0]
					}, true);

				});

			} else {

				that.getPlants();
				that.getPurchaseOrganizations();
				that.getUserInfo();
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

					this._oResponsivePopover = sap.ui.xmlfragment("it.alteaup.supplier.portal.schedulingagreement.AUPSUP_HTML5_SCHEDAGREE.fragments.FilterSorter", this);
					this._oResponsivePopover.setModel(oModelFilters, "filterElementJSONModel");
				}
				var oTable = this.getView().byId("OrderHeadersTable");
				oTable.addEventDelegate({
					onAfterRendering: function () {
						var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
						for (var i = 0; i < oHeader.length; i++) {
							var oID = oHeader[i].id;
							that.onClick(oID, i + 1);
						}
					}
				}, oTable);

			}

			this.getView().setModel(sap.ui.getCore().getModel("userapi"), "userapi");

		},

		onClick: function (oID) {
			$('#' + oID).click(function (oEvent) { //Attach Table Header Element Event
				var oTarget = oEvent.currentTarget; //Get hold of Header Element
				var oView = that.getView();
				var res = oTarget.id.split("--");
				res = res[1];

				oView.getModel("OrderJSONModel").setProperty("/bindingValue", res); //Save the key value to property
				that._oResponsivePopover.openBy(oTarget);
			});
		},

		/* onChange: function (oEvent) {
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
		}, */

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

			// SupplierPortal_OrdersManagement è una destination che ho creato su SCP la trovi sotto DESTINATION
			// inoltre ho aggiunto un pezzo al neo-app.json

			//var url = "/SupplierPortal_OrdersManagement/xsOdata/GetOrders_pos.xsjs";


			var url = "/backend/SchedulingAgreementManagement/GetPianiConsegna";
			var body = that.getModel("filterOrdersJSONModel").getData();
			that.showBusyDialog();
			that.ajaxPost(url, body, function (oData) {
				that.hideBusyDialog();
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					// Valorizzare OriginalPrice LS
					for (var i = 0; i < oModel.oData.results.length; i++) {
						var PEINH = oModel.oData.results[i].PEINH;
						var NETPR = oModel.oData.results[i].NETPR;
						if (NETPR != undefined && NETPR != "" && PEINH != undefined && PEINH != "") {
							PEINH = parseFloat(PEINH);
							NETPR = parseFloat(NETPR);
							var prezzoOriginale = NETPR / PEINH;
							oModel.oData.results[i].OriginalPrice = prezzoOriginale;
						}

					}

					that.getView().setModel(oModel, "OrderJSONModel");
					that.getView().byId("OrderHeadersTable").setModel(oModel);

					var oSorter = new Sorter({
						path: 'Priority',
						descending: true
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
				that.oSearchSupplierDialog = sap.ui.xmlfragment("it.alteaup.supplier.portal.schedulingagreement.AUPSUP_HTML5_SCHEDAGREE.fragments.SearchSupplier", that);
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
				that.oSearchMatnrDialog = sap.ui.xmlfragment("it.alteaup.supplier.portal.schedulingagreement.AUPSUP_HTML5_SCHEDAGREE.fragments.SearchMatnr", that);
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
					"it.alteaup.supplier.portal.schedulingagreement.AUPSUP_HTML5_SCHEDAGREE.fragments.ConfirmPositions",
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
				if (mod.MODIFICA_QUANTITA !== undefined && mod.MODIFICA_QUANTITA !== "") {
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editQuantity = true;
				} else {
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editQuantity = false;
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
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editQuantity = true;
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
			that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].EBTYP = sSelectedKey;
			if (mod !== undefined) {
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].KSCHL = mod.TIPO_COND_PREZZO;
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].UPDKZ = mod.TIPO_CONFERMA;
			} else {
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].KSCHL = "";
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].UPDKZ = "";
			}
		},

		onCloseOrderPositions: function () {
			if (this.oConfirmPositionsFragment) {
				this.oConfirmPositionsFragment.close();
				this.oConfirmPositionsFragment.destroy();
				this.oConfirmPositionsFragment = undefined;
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
					// FINE DELLA SOVRASCRITTURA

					// AGGIUNGO LA RIGA NELLE SCHEDULAZIONI

					// CALCOLO SCHEDULAZIONI COLORATE
					that.getSchedulationsStatus(mod, selectedProfiloConfermaModel.CAT_CONFERMA);

				}

			});

			var arrETENR = [];
			if (mod.SchedulationsStatus !== undefined) {
				for (var i = 0; i < mod.SchedulationsStatus.length; i++) {
					var deltaMenge = (parseFloat(mod.SchedulationsStatus[i].MENGE) - parseFloat(mod.SchedulationsStatus[i].QTA_CONFERMATA));
					if (deltaMenge > 0) {
						arrETENR.push({ "ETENR": mod.SchedulationsStatus[i].ETENR })
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
							"EBTYP": mod.POItemSchedulers.results[i].EBTYP,
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
						"EBTYP": mod.profiliConferma[0].EBTYP,
					};
					if (mod !== undefined && mod.POItemSchedulers.results !== undefined) {
						mod.POItemSchedulers.results.push(schedulation);
					} else {
						var oSchedulationsArray = [];
						oSchedulationsArray.push(schedulation);
						mod.POItemSchedulers.results = oSchedulationsArray;
					}
				}
			}
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

				// //se per la posizione i-esima non ho selezionato il profiliConferma blocco tutto
				// if (model[i].profiliConferma != undefined && model[i].profiliConferma != "") {
				// 	if (model[i].EBTYP === undefined || model[i].EBTYP === "") {
				// 		err = that.getResourceBundle().getText("ERR_Confirmation_Type_Mandatory", model[i].EBELP)
				// 		contatoreRighe = contatoreRighe + 1;
				// 	}
				// }
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
					// } else { tolto obbligo inserimento Schedulazioni
					//var ordine = model[i].EBELN + "-" + model[i].EBELP;
					//err = that.getResourceBundle().getText("ERR_Schedulations_empty", ordine);
					//contatoreRighe = contatoreRighe + 1;

					// var nuovoPrezzoPosizione = model[i].NETPR / model[i].PEINH;
					// var differenzaPrezzo = nuovoPrezzoPosizione - mod.OriginalPrice;
					// var ordine = model[i].EBELN + "-" + model[i].EBELP;
					// if (differenzaPrezzo === 0)
					// 	err = that.getResourceBundle().getText("ERR_empty", ordine);
				}
				// Richiamo controlli implementati dal tasto CheckPosition

				if (err !== "") {
					MessageBox.error(err);
					return;
				}

				// if (model[i].UPDKZ === '1') {  Inserita nella checkPositions
				// var url = "/SupplierPortal_RMO/xsOdata/GetRMO.xsjs";

				// var body = {
				// 	"userid": that.getCurrentUserId(),
				// 	"ebeln": model[i].EBELN
				// };

				//that.showBusyDialog();

				//Sostituita la chiamata RMO con il ciclo FOR//

				// // ESTRAGGO le conferme in corso di approvazione con categoria uguale
				// that.ajaxPost(url, body, "/SupplierPortal_RMO", function (oData) {
				// 	that.hideBusyDialog();
				// 	if (oData && oData.results && oData.results.EkkoEkpo && oData.results.EkkoEkpo.length > 0) {
				// 		var selectEkkoEkpo = oData.results.EkkoEkpo.find(function (element) {
				// 			if (element.EBELN === model[contatoreRighe].EBELN && element.EBELP === model[contatoreRighe].EBELP && element.STATUS ===
				// 				'RC' && element.UPDKZ ===
				// 				model[contatoreRighe].UPDKZ) {
				// 				return element;
				// 			}
				// 		});
				// 		if (selectEkkoEkpo === undefined) {
				// 			oData = undefined;
				// 		}
				// 	}
				// 	var errore = that.onControllPosition(model[contatoreRighe], oData);
				// 	if (errore !== undefined && errore !== "") {
				// 		err = err + errore + " in pos: " + model[contatoreRighe].EBELP;
				// 	}

				// 	contatoreRighe = contatoreRighe + 1;

				// 	if (contatoreRighe >= model.length) {
				// 		if (err !== "") {
				// 			MessageBox.error(err);
				// 			err = "";
				// 		} else {
				// 			var navCon = sap.ui.getCore().byId("navCon");
				// 			navCon.to(sap.ui.getCore().byId("p2"), "slide");
				// 		}
				// 	}

				// });
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
					err = err + errore + " ordine: " + model[i].EBELN + " in pos: " + model[i].EBELP;
				}
				//err = err + that.onControllPosition(model[i], null) + " in pos: " + model[i].EBELP;
				contatoreRighe = contatoreRighe + 1;

				//if (contatoreRighe >= model.length) {
				if (err !== "") {
					MessageBox.error(err);
					err = "";
				} else {
					that.onConfirmAndClose();
				}
				//	}
				//}
			}

		},

		onConfirmAndClose: function () {

			//if (sap.ui.getCore().byId("XBLNR").getValue() === undefined || sap.ui.getCore().byId("XBLNR").getValue() === "") {
			//	MessageBox.error(that.getResourceBundle().getText("ERR_Confirm_Position_Text"));
			//	return;
			//}

			MessageBox.warning(that.getResourceBundle().getText("MSG_Confirm_Position_Text"), {
				icon: MessageBox.Icon.WARNING,
				title: "Warning",
				actions: [MessageBox.Action.CANCEL, MessageBox.Action.OK],
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.OK) {
						var body = {
							"ekes": [],
							"ekko": [],
							"ekpo": []
						};
						var ekpoRow = that.getModel("SelectedPositionsJSONModel").getData();
						if (ekpoRow !== undefined) {
							for (var i = 0; i < ekpoRow.length; i++) {
								var row = ekpoRow[i];
								if (row.POItemSchedulers.results !== undefined) {
									for (var j = 0; j < row.POItemSchedulers.results.length; j++) {

										// AZ 03/12/2019 non passare a sap le schedulazioni precedentemente inserite
										// Quando si conferma le conferme vecchie NON devono essere passate alla RMO
										if (row.POItemSchedulers.results[j].SYSID !== undefined) {
											continue;
										}
										var singleEkesModel = {};
										singleEkesModel.EBELN = row.EBELN;
										singleEkesModel.EBELP = row.EBELP;

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
										singleEkesModel.MENGE = row.POItemSchedulers.results[j].MENGE;

										if (row.POItemSchedulers.results[j].UZEIT === undefined) {
											singleEkesModel.UZEIT = "000000";
										} else {
											singleEkesModel.UZEIT = row.POItemSchedulers.results[j].UZEIT;
										}
										if (row.POItemSchedulers.results[j].XBLNR === undefined || row.POItemSchedulers.results[j].XBLNR === "") {
											singleEkesModel.XBLNR = sap.ui.getCore().byId("XBLNR").getValue();
										} else {
											singleEkesModel.XBLNR = row.POItemSchedulers.results[j].XBLNR;
										}
										body.ekes.push(singleEkesModel);
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
									singleEkpoModel.UPDKZ = "L";
								else
									singleEkpoModel.UPDKZ = row.UPDKZ;

								// TODO FARE logiche save
								singleEkpoModel.ZINVALIDITA = row.ZINVALIDITA;
								singleEkpoModel.ZFINVALIDATA = row.ZFINVALIDATA;
								singleEkpoModel.ZMODPREZZO = row.editPrice !== undefined && row.editPrice === true ? 'X' : '';
								singleEkpoModel.ZMODSCHED = row.editQuantity === true ? 'X' : ''
								singleEkpoModel.ZINSCONF = 'X';
								singleEkpoModel.ZCONFPARZ = 'X'; // per ordini di tipo F prendere il flag da customizing campo: CONFERMA_PARZIALE altrimenti fisso X

								body.ekpo.push(singleEkpoModel);

								var singleEkkoModel = {};
								singleEkkoModel.EBELN = row.EBELN;
								singleEkkoModel.LIFNR = row.LIFNR;
								singleEkkoModel.BSTYP = 'L'; // fisso perchè stiamo confermando i piani di consegna
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
										if (item.MSGTY !== undefined && (item.MSGTY === 'W' || item.MSGTY === 'I'))
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
													that.onCloseOrderPositions();
												} // default

											});
										}
									}

								} else {
									MessageBox.success(that.getResourceBundle().getText("correctConfirmPositions"), {
										title: "Success", // default
										onClose: function () {
											that.onCloseOrderPositions();
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

			var oTable = that.getView().byId("OrderJSONModel");
			oTable.getItems().forEach(function (r) {
				var oPath = r.oBindingContexts.OrderJSONModel.sPath;
				that.getModel("OrderJSONModel").getProperty(oPath);

				if (that.getModel("OrderJSONModel").getProperty(oPath).canEditPosition) {
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

			return err;
		},
		onControllPriceOK: function (mod) {
			var err = "";
			// controllo che il prezzo modificato sia all'interno delle percentuali di scostamento se ci sono
			if (mod.PricePercDOWN !== undefined && mod.PricePercDOWN !== null) {
				// TODO OriginalPrice valorizzato solo quando si inserisce una schedulazione e non quello originale!. spostare la valorizzazione
				if (mod.OriginalPrice !== undefined) {

					var PEINH = mod.PEINH;
					var NETPR = mod.NETPR;
					if (NETPR != undefined && NETPR != "" && PEINH != undefined && PEINH != "") {
						PEINH = parseFloat(PEINH);
						NETPR = parseFloat(NETPR);
						var nuovoPrezzoPosizione = NETPR / PEINH;
						var differenzaPrezzo = nuovoPrezzoPosizione - mod.OriginalPrice;
						if (differenzaPrezzo > 0) {
							// differenza positiva
							var percScostamentoUP = (differenzaPrezzo / mod.OriginalPrice) * 100;
							if (percScostamentoUP > mod.PricePercUP) {
								var ordine = mod.EBELN + "-" + mod.EBELP;
								err = err + "\n" + that.getResourceBundle().getText("ERR_Price_Perc_Up", ordine);
							} else {
								var dateErr = that.onControllDateOK(mod);
								if (dateErr !== '')
									err = err + "\n" + dateErr;
							}
						}
						if (differenzaPrezzo < 0) {
							// differenza positiva
							var percScostamentoDown = ((differenzaPrezzo * -1) / mod.OriginalPrice) * 100;
							var ordine = mod.EBELN + "-" + mod.EBELP;
							if (percScostamentoDown > mod.PricePercDOWN) {
								err = err + "\n" + that.getResourceBundle().getText("ERR_Price_Perc_Down", ordine);
							} else {
								var dateErr = that.onControllDateOK(mod);
								if (dateErr !== '')
									err = err + "\n" + dateErr;
							}
						}
					}
				}
			}

			return err;

		},

		onControllPosition: function (mod) {
			var err = "";

			// //se per la posizione i-esima non ho selezionato il profiliConferma blocco tutto - temporaneamente eliminato!
			// if (mod.profiliConferma != undefined && mod.profiliConferma != "") {
			// 	if (mod.EBTYP === undefined || mod.EBTYP === "") {
			// 		return err = that.getResourceBundle().getText("WRR_No_CatConf"); //Modificato messaggio di errore "ERR_Confirmation_Type_Mandatory_Single"
			// 	}
			// }

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
					// var nuovoPrezzoPosizione = mod.NETPR / mod.PEINH;
					// var differenzaPrezzo = nuovoPrezzoPosizione - mod.OriginalPrice;
					// var ordine = mod.EBELN + "-" + mod.EBELP;
					// if (differenzaPrezzo === 0)
					// 	err = err + "\n" + that.getResourceBundle().getText("ERR_empty", ordine);

					err = err + "\n" + that.getResourceBundle().getText("ERR_no_schedulations");
				}
				// Eliminato messaggio di errore NO SCHEDULAZIONI
				// } else {
				// var nuovoPrezzoPosizione = mod.NETPR / mod.PEINH;
				// var differenzaPrezzo = nuovoPrezzoPosizione - mod.OriginalPrice;
				// var ordine = mod.EBELN + "-" + mod.EBELP;
				// if (differenzaPrezzo === 0)
				// 	err = err + "\n" + that.getResourceBundle().getText("ERR_empty", ordine);

				//err = err + "\n" + that.getResourceBundle().getText("ERR_no_schedulations");
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

				//	profiloSelezionato = profiliConsegna.find(x => x.TIPO_CONFERMA === mod.UPDKZ && x => x.PROFILO_CONTROLLO === mod.BSTAE);
			}

			// nel caso in cui sono in modifica ("TIPO_CONFERMA": "4" ma a sap passiamo EBTYP === "CH") devo controllare che la somma delle quantità sia = alla quantità totale di posizione
			if (mod.UPDKZ === '4') {
				// if (mod.MENGE !== undefined && mod.MENGE != "" && sommaQuantitaSchedulazioni > parseFloat(mod.MENGE)) {
				// 	err = err + "\n" + that.getResourceBundle().getText("ERR_Sum_Schedulations_Single");
				// }

				// Indipendentemente se flag quantità parziale è attivo o no [Simbolo] 
				// verificare se la quantità inserita è all’interno delle % settate su customizing portale Se interno al range OK se fuori dal range KO
				if (mod.QuantPercDOWN !== undefined && mod.QuantPercUP !== undefined) {
					var origQuant = mod.MENGE;
					if (origQuant !== undefined && origQuant !== "" && sommaQuantitaSchedulazioni > 0) {
						origQuant = parseFloat(origQuant);
						var differenzaQuant = sommaQuantitaSchedulazioni - origQuant;
						if (differenzaQuant > 0) {
							// differenza positiva
							var percScostamentoUP = (differenzaQuant / origQuant) * 100;
							if (percScostamentoUP > mod.QuantPercUP) {
								var ordine = mod.EBELN + "-" + mod.EBELP;
								err = err + "\n" + that.getResourceBundle().getText("ERR_Quant_Perc_Up_Single", ordine);
							}
						}
						if (differenzaQuant < 0) {
							// differenza positiva
							var percScostamentoDown = ((differenzaQuant * -1) / origQuant) * 100;
							if (percScostamentoDown > mod.QuantPercDOWN) {
								var ordine = mod.EBELN + "-" + mod.EBELP;
								err = err + "\n" + that.getResourceBundle().getText("ERR_Quant_Perc_Down_Single", ordine);
							}
						}
					}
				}

				// Creata funzione dedicata.
				// // controllo che il prezzo modificato sia all'interno delle percentuali di scostamento se ci sono
				// if (mod.PricePercDOWN !== undefined) {
				// 	if (mod.OriginalPrice !== undefined) {

				// 		var PEINH = mod.PEINH;
				// 		var NETPR = mod.NETPR;
				// 		if (NETPR != undefined && NETPR != "" && PEINH != undefined && PEINH != "") {
				// 			PEINH = parseFloat(PEINH);
				// 			NETPR = parseFloat(NETPR);
				// 			var nuovoPrezzoPosizione = NETPR / PEINH;
				// 			var differenzaPrezzo = nuovoPrezzoPosizione - mod.OriginalPrice;
				// 			if (differenzaPrezzo > 0) {
				// 				// differenza positiva
				// 				var percScostamentoUP = (differenzaPrezzo / mod.OriginalPrice) * 100;
				// 				if (percScostamentoUP > mod.PricePercUP) {
				// 					err = err + "\n" + that.getResourceBundle().getText("ERR_Price_Perc_Up", mod.EBELN, mod.EBELP);
				// 				}
				// 			}
				// 			if (differenzaPrezzo < 0) {
				// 				// differenza positiva
				// 				var percScostamentoDown = ((differenzaPrezzo * -1) / mod.OriginalPrice) * 100;
				// 				if (percScostamentoDown > mod.PricePercDOWN) {
				// 					err = err + "\n" + that.getResourceBundle().getText("ERR_Price_Perc_Down", mod.EBELN, mod.EBELP);
				// 				}
				// 			}
				// 		}
				// 	}
				// }

				if (profiloSelezionato.CONTROLLO_CORSO_APP !== '') {
					// Verificare prima che per l’ordine item non ci siano una conferma ti tipo 4 in corso di approvazione. Se esiste conferma di tipo 4 in corso di approvazione ERRORE su front end. 
					// Promise.all([
					// 	new Promise(function (resolve, reject) {

					// 		var url = "/SupplierPortal_RMO/xsOdata/GetRMO.xsjs";

					// 		if (mod.EBELN !== undefined && mod.EBELN !== "" && mod.EBELP !== undefined && mod.EBELP !== "") {
					// 			url = url + "?$filter=(EBELN='" + mod.EBELN + "' and EBELP='" + mod.EBELP + "')";
					// 		}

					// 		// Inizio modifiche LS
					// 		var body = {
					// 			"userid": that.getCurrentUserId()
					// 		};

					// 		that.showBusyDialog();
					// 		that.ajaxPost(url, body, "/SupplierPortal_RMO", function (oData) {
					// 			that.hideBusyDialog();
					// 			if (oData && oData.results && oData.results.EkkoEkpo && oData.results.EkkoEkpo.length > 0) {
					// 				if (oData.results.EkkoEkpo[0].STATUS === 'RC' && oData.results.EkkoEkpo[0].UPDKZ === '4') {
					// 					resolve();
					// 				}
					// 			}
					var trovato = false;
					if (mod.RMOData !== undefined && mod.RMOData.EkkoEkpo !== undefined && mod.RMOData.EkkoEkpo.length > 0) {
						var EkkoEkpo = mod.RMOData.EkkoEkpo.find(x => x.STATUS === 'RC' && x.UPDKZ === '4' && x.EBELN === mod.EBELN && x.EBELP ===
							mod
							.EBELP);
						if (EkkoEkpo !== undefined)
							trovato = true;
					}
					//mod.RMOData.EkkoEkpo.forEach(function (r) {

					//});

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
					// 			reject();
					// 		});

					// 	})
					// ]).then(function (values) {
					// 	return +"\n" + that.getResourceBundle().getText("ERR_Confirmation_In_Corso_Approvazione");

					// }).catch(function () {
					// 	return err;
					// });

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

			if (mod.UPDKZ === '1') {

				/*10/12/2019 
				ES:: Se stiamo inserendo una AB con conferma parziale (sempre da customzing) usiamo le AB che sono nuove, 
				+ quelle in corso di approvazione di tipo AB + quelle che sono già su back end di tipo AB. 
				se invece AB ha attivo conferma totale, usiamo le conferme nuove che stiamo insrendo più le conferme AB 
				che sono in corso di approvazione*/

				if (profiloSelezionato.PARZIALE_QUANTITA === 'X') {
					mod.PART1 = 'X';
					/*Se flag quantità parziale attivo [Simbolo] verificare solo il superamento della tolleranza superiore. 
					Per capire la quantità confermata usare la quantità della conferma in corso più tutte le conferme già 
					approvate con tipo conferma in oggetto più eventuali conferme in corso di approvazione. 
					Se controllo OK deve essere inviato a backend e creata la conferma */
					// Promise.all([
					// 		new Promise(function (resolve, reject) {

					// var url = "/SupplierPortal_RMO/xsOdata/GetRMO.xsjs";
					// // estrarre dalla RMO solo quelle in stato RC poi sommare le EKES dell'ordine corrente che hanno UPDKZ = a quello selezionato + TIPO CONFERMA selezionato 'AB'
					// if (mod.EBELN !== undefined && mod.EBELN !== "" && mod.EBELP !== undefined && mod.EBELP !== "") {
					// 	url = url + "?$filter=(EBELN='" + mod.EBELN + "' and EBELP='" + mod.EBELP + "' and STATUS = 'RC')";
					// }

					//sommare le EKES dell'ordine corrente che hanno UPDKZ = a quello selezionato + TIPO CONFERMA selezionato 'AB'

					var sommaEkes = 0;
					//	var ekesModel = that.getView().getModel("SelectedPositionsJSONModel").getData().POItemSchedulers;
					var ekesModel = mod.POItemSchedulers;
					if (ekesModel !== undefined && ekesModel.results !== undefined) {
						ekesModel.results.forEach(function (r) {
							if (r.EBTYP === undefined) // ho inserito una nuova riga
								sommaEkes = sommaEkes + parseFloat(r.MENGE);
							else {
								if (r.EBTYP === mod.EBTYP) {
									sommaEkes = sommaEkes + parseFloat(r.MENGE);
								}
							}
						});
					}

					// var body = {
					// 	"userid": that.getCurrentUserId()
					// };

					// 		that.showBusyDialog();
					// 		that.ajaxPost(url, body, "/SupplierPortal_RMO", function (oData) {
					// 			that.hideBusyDialog();

					// 			if (oData && oData.results && oData.results.EkkoEkpo && oData.results.EkkoEkpo.length > 0) {
					var quantDaControllare = 0;
					var trovato = false;
					if (mod.RMOData !== undefined && mod.RMOData.EkkoEkpo !== undefined && mod.RMOData.EkkoEkpo.length > 0) {
						var EkkoEkpo = undefined; // mod.RMOData.EkkoEkpo.find(x => x.STATUS === 'RC');
						mod.RMOData.EkkoEkpo.forEach(function (r) {
							if (r.EBELN === mod.EBELN && r.EBELP === mod.EBELP && r.EBTYP === mod.EBTYP) {
								EkkoEkpo = r;
								return true;
							}
						});
						if (EkkoEkpo !== undefined)
							if (EkkoEkpo.MENGE !== undefined && EkkoEkpo.MENGE !== null) {
								quantDaControllare = parseFloat(EkkoEkpo.MENGE);
							} else {
								if (EkkoEkpo.MENGE_ORIGINAL !== undefined && EkkoEkpo.MENGE_ORIGINAL !== null) {
									quantDaControllare = +parseFloat(EkkoEkpo.MENGE_ORIGINAL);
								}
							}
					}

					var qta = parseFloat(sommaEkes) + parseFloat(quantDaControllare);
					var origQuant = parseFloat(mod.MENGE);
					var differenzaQuant = qta - origQuant;
					if (differenzaQuant > 0) {
						// differenza positiva
						var percScostamentoUP = (differenzaQuant / origQuant) * 100;
						if (percScostamentoUP > mod.QuantPercUP) {
							var ordine = mod.EBELN + "-" + mod.EBELP;
							err = err + "\n" + that.getResourceBundle().getText("ERR_Quant_Perc_Up_Single", ordine);
						}
					}

					// 			}
					// 			resolve();
					// 		});

					// 	})
					// ]).then(function (values) {
					// 	return err;
					// }).catch(function () {
					// 	return err;
					// });

				} else {
					mod.PART1 = '';
					/*Se flag quantità parziale non attivo verificare se la quantità inserita è all’interno delle 
					% settate su customizing portale (utilizzare le quantità della conferma in corso ). 
					Se interno al range OK se fuori dal range KO. Se OK mandare a back end.  Devono essere cancellate le 
					conferme con lo stesso tipo conferma e create nuove. */

					// 10/12/2019 CONFERMA TOTALE: deve tenere in considerazione le conferme nuove che si stanno 
					// inserendo (le righe nuove inserite nella schermata) + conferme in corso di approvazione con categoria uguale

					// Promise.all([
					// 	new Promise(function (resolve, reject) {

					// 		var url = "/SupplierPortal_RMO/xsOdata/GetRMO.xsjs";

					// 		if (mod.EBELN !== undefined && mod.EBELN !== "" && mod.EBELP !== undefined && mod.EBELP !== "") {
					// 			url = url + "?$filter=(EBELN='" + mod.EBELN + "' and EBELP='" + mod.EBELP + "' and STATUS = 'RC' and UPDKZ = '" + mod.UPDKZ +
					// 				"')";
					// 		}

					// 		// Inizio modifiche LS
					// 		var body = {
					// 			"userid": that.getCurrentUserId()
					// 		};

					// 		// sommo solo le quantità delle righe "Nuove"
					sommaQuantitaSchedulazioni = 0;
					for (var j = 0; j < mod.POItemSchedulers.results.length; j++) {
						if (mod.POItemSchedulers.results[j].SYSID === undefined) {
							sommaQuantitaSchedulazioni = sommaQuantitaSchedulazioni + parseFloat(mod.POItemSchedulers.results[j].MENGE);
						}
					}

					// 		that.showBusyDialog();
					// 		// ESTRAGGO le conferme in corso di approvazione con categoria uguale
					// 		that.ajaxPost(url, body, "/SupplierPortal_RMO", function (oData) {
					// 			that.hideBusyDialog();

					if (err !== null && err !== "")
						return err;
					// var oData = confermeInApprovazione;
					if (mod.RMOData.EkkoEkpo && mod.RMOData.EkkoEkpo.length > 0) {
						var quantDaControllare = 0;
						if (mod.RMOData.EkkoEkpo[0].MENGE !== undefined && mod.RMOData.EkkoEkpo[0].MENGE !== null) {
							quantDaControllare = sommaQuantitaSchedulazioni + parseFloat(mod.RMOData.EkkoEkpo[0].MENGE);
						} else {
							if (mod.RMOData.EkkoEkpo[0].MENGE_ORIGINAL !== undefined && mod.RMOData.EkkoEkpo[0].MENGE_ORIGINAL !== null) {
								quantDaControllare = sommaQuantitaSchedulazioni + parseFloat(mod.RMOData.EkkoEkpo[0].MENGE_ORIGINAL);
							}
						}
						sommaQuantitaSchedulazioni = quantDaControllare;
					}
					// 			resolve();
					// 		});

					// 	})
					// ]).then(function (values) {

					var origQuant = parseFloat(mod.MENGE);

					var differenzaQuant = sommaQuantitaSchedulazioni - origQuant;
					if (differenzaQuant > 0) {
						// differenza positiva
						var percScostamentoUP = (differenzaQuant / origQuant) * 100;
						if (percScostamentoUP > mod.QuantPercUP) {
							var ordine = mod.EBELN + "-" + mod.EBELP;
							err = err + "\n" + that.getResourceBundle().getText("ERR_Quant_Perc_Up_Single", ordine);
						}
					}

					if (differenzaQuant < 0) {
						// differenza positiva
						var percScostamentoDown = ((differenzaQuant * -1) / origQuant) * 100;
						if (percScostamentoDown > mod.QuantPercDOWN) {
							var ordine = mod.EBELN + "-" + mod.EBELP;
							err = err + "\n" + that.getResourceBundle().getText("ERR_Quant_Perc_Down_Single", ordine);
						}
					}

					// }).catch(function () {
					// 	if (err !== "")
					// 		MessageBox.error(err, {
					// 			icon: MessageBox.Icon.ERROR,
					// 			title: "Error",
					// 		});
					// 	else
					// 		MessageBox.success(that.getResourceBundle().getText("OK_Position_confirm"), {
					// 			icon: MessageBox.Icon.SUCCESS
					// 		});
					// });
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

		onChange: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getParent().getBindingContext("SelectedPositionsJSONModel").sPath;
			var mod = that.getModel("SelectedPositionsJSONModel").getProperty(oPath);
			mod.POItemSchedulers.results.forEach(function (modSelect) {
				//	var modSelect = JSON.parse(JSON.stringify(aData));
				if (modSelect.SYSID === undefined && modSelect.MENGE !== null && modSelect.MENGE !== "" && modSelect.EINDT !== null && modSelect
					.EINDT !== "") {
					that.getSchedulationsStatus(mod, modSelect.EBTYP);
				}
			});
		},

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
					mod.SchedulationsStatus.forEach(element => {
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
								"ETENRenabled": false
							};
							if (mod !== undefined && mod.POItemSchedulers.results !== undefined) {
								mod.POItemSchedulers.results.push(schedulation);
							} else {
								var oSchedulationsArray = [];
								oSchedulationsArray.push(schedulation);
								mod.POItemSchedulers.results = oSchedulationsArray;
							}
						}
					});

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
					name: "it.alteaup.supplier.portal.schedulingagreement.AUPSUP_HTML5_SCHEDAGREE.fragments.ColorStatus",
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

	});

});