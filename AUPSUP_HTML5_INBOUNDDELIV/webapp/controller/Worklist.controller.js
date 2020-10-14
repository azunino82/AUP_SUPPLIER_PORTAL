sap.ui.define([
	"it/aupsup/inboundDelivery/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"it/aupsup/inboundDelivery/js/Date",
	"it/aupsup/inboundDelivery/js/formatter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/PDFViewer",
	"it/aupsup/inboundDelivery/js/jszip",
], function (BaseController, Filter, FilterOperator, JSONModel, MessageBox, MessageToast, Sorter, DateF, Formatter, Export, ExportTypeCSV,
	PDFViewer, JSZIP) {
	"use strict";
	var that;
	Date.prototype.addDays = function (days) {
		var date = new Date(this.valueOf());
		date.setDate(date.getDate() + days);
		return date;
	};
	Date.prototype.subDays = function (days) {
		var date = new Date(this.valueOf());
		date.setDate(date.getDate() - days);
		return date;
	};
	return BaseController.extend("it.aupsup.inboundDelivery.controller.Worklist", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf it.alteaup.supplier.portal.inboundDelivery.inboundDelivery.view.Worklist
		 */
		onInit: function () {
			that = this;

			that.getUserInfo();
			that.getPurchaseOrganizations();
			that.getMetasupplier();
			that.getPurchaseGroup();
			that.getPlants();
			that.getAllProfiliConsegna();
			that.getGestioneEtichette();

			var startupParams = undefined;
			// questo meccanismo serve le chiamate che arrivano dalle email
			if (this.getOwnerComponent().getComponentData() != undefined) {
				startupParams = this.getOwnerComponent().getComponentData().startupParameters;
			}
			// Calcolo valori dafault settimane
			var myDate = new Date();
			var fromD = myDate.subDays(14);
			var toD = myDate.addDays(7);

			if (startupParams != undefined && startupParams.objectId && startupParams.objectId[0]) {

				var url = "/backend/InboundDeliveryManagement/GetSchedulations";
				var body = {
					"ekorg": [],
					"ebeln": startupParams.objectId[0],
					"lifnr": [],
					"werks": [],
					"matnr": [],
					"dateFrom": fromD,
					"dateTo": toD
				};
				this.showBusyDialog();
				that.ajaxPost(url, body, function (oData) { // funzione generica su BaseController
					that.hideBusyDialog();
					if (oData) {
						var oModel = new JSONModel();
						oModel.setData(oData);
						that.getView().setModel(oModel, "InboundDelJSONModel");
						that.getView().byId("InboundDelivHeadersTable").setModel(oModel);
					}
				});

			} else {

				// Inizio modifiche LS
				var filterInboundDeliv = {
					"ekorg": [],
					"ebeln": "",
					"lifnr": [],
					"werks": [],
					"matnr": [],
					"dateFrom": fromD,
					"dateTo": toD
				};

				var oModelFI = new JSONModel();
				oModelFI.setData(filterInboundDeliv);
				this.getView().setModel(oModelFI, "filterInboundDelivJSONModel");

				if (!this._oResponsivePopover) {

					var oModelFilters = new JSONModel();
					oModelFilters.setData({
						"element": ""
					});

					this._oResponsivePopover = sap.ui.xmlfragment("it.aupsup.inboundDelivery.fragments.FilterSorter", this);
					this._oResponsivePopover.setModel(oModelFilters, "filterInboundDelivJSONModel");
				}
				var oTable = this.getView().byId("InboundDelivHeadersTable");
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

				oView.getModel("InboundDelJSONModel").setProperty("/bindingValue", res); //Save the key value to property
				that._oResponsivePopover.openBy(oTarget);
			});
		},

		onChange: function (oEvent) {
			var oValue = oEvent.getParameter("value");
			var oMultipleValues = oValue.split(",");
			var oTable = this.getView().byId("InboundDelivHeadersTable");
			var oBindingPath = this.getView().getModel("InboundDelJSONModel").getProperty("/bindingValue"); //Get Hold of Model Key value that was saved
			var aFilters = [];
			for (var i = 0; i < oMultipleValues.length; i++) {
				var oFilter = new Filter(oBindingPath, "Contains", oMultipleValues[i]);
				aFilters.push(oFilter);
			}
			var oItems = oTable.getBinding("items");
			oItems.filter(aFilters, "Application");

			this._oResponsivePopover.setModel(new JSONModel({
				"element": ""
			}), "filterInboundDelivJSONModel");
			this.getView().byId("headerFilterButton").setVisible(true);

			this._oResponsivePopover.close();
		},

		onAscending: function () {
			var oTable = this.getView().byId("InboundDelivHeadersTable");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.getView().getModel("InboundDelJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onDescending: function () {
			var oTable = this.getView().byId("InboundDelivHeadersTable");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.getView().getModel("InboundDelJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath, true);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onRowSelectionChange: function (oEvent) {

			var oSelectedItem = oEvent.getParameter("listItem");

			var oPath = oSelectedItem.oBindingContexts.InboundDelJSONModel.sPath;
			var oItem = that.byId("InboundDelivHeadersTable").getModel().getProperty(oPath);
			// var idx = spath.slice(-1);
			// if (idx !== -1) {

			// 	var m = this.byId("OrderTable").getModel();
			// 	var data = m.getData();
			// 	var oItem = data.POItem.results[idx];
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
			var oTable = this.getView().byId("InboundDelivHeadersTable");
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
			var oTable = this.byId("InboundDelivHeadersTable"),
				oViewModel = this.getModel("InboundDelJSONModel");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("noData"));
			}
		},

		onSearch: function () {

			// SupplierPortal_OrdersManagement è una destination che ho creato su SCP la trovi sotto DESTINATION
			// inoltre ho aggiunto un pezzo al neo-app.json

			var url = "/backend/InboundDeliveryManagement/GetSchedulations";
			var body = that.getModel("filterInboundDelivJSONModel").getData();

			var jsonBody = JSON.parse(JSON.stringify(body));


			if (body !== undefined && body.dateFrom !== undefined && body.dateFrom !== null) {
				var year = body.dateFrom.getFullYear();
				var month = (1 + body.dateFrom.getMonth()).toString();
				month = month.length > 1 ? month : '0' + month;
				var day = body.dateFrom.getDate().toString();
				day = day.length > 1 ? day : '0' + day;
				jsonBody.dateFrom = year + month + day;
			}
			if (body !== undefined && body.dateFrom !== undefined && body.dateFrom !== null) {
				var year = body.dateTo.getFullYear();
				var month = (1 + body.dateTo.getMonth()).toString();
				month = month.length > 1 ? month : '0' + month;
				var day = body.dateTo.getDate().toString();
				day = day.length > 1 ? day : '0' + day;
				jsonBody.dateTo = year + month + day;
			}
			this.showBusyDialog();
			that.ajaxPost(url, jsonBody, function (oData) {
				that.hideBusyDialog();
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "InboundDelJSONModel");
					that.getView().byId("InboundDelivHeadersTable").setModel(oModel);
				}
			})
		},

		getPurchaseOrganizations: function () {

			var url = "/backend/Utils/UtilsManagement/GetPurchaseOrganizations";
			this.showBusyDialog();
			that.ajaxGet(url, function (oData) {
				that.hideBusyDialog();
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
					var oLifnr = that.getModel("filterInboundDelivJSONModel");
					oLifnr = oData.results;
					var oModelLF = new JSONModel();
					oModelLF.setData(oLifnr);
					that.getView().setModel(oModelLF, "filterInboundDelivJSONModel");
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
			that.getModel("filterInboundDelivJSONModel").getData().lifnr = slifnr;

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
			that.getModel("filterInboundDelivJSONModel").getData().lifnr = lifnr;
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
					that.getView().getModel("InboundDelJSONModel").refresh();
				},
				error: function (err) {

				}
			});
		},

		handleSupplier: function () {

			if (!that.oSearchSupplierDialog) {
				that.oSearchSupplierDialog = sap.ui.xmlfragment("it.aupsup.inboundDelivery.fragments.SearchSupplier", that);
				that.getView().addDependent(that.oSearchSupplierDialog);
			}
			that.oSearchSupplierDialog.open();
			var oTable = sap.ui.getCore().byId("idSuppliersTable");
			var oItems = oTable.getItems();

			var selectedSupplier = that.getModel("filterInboundDelivJSONModel").getData().lifnr;
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

			that.getModel("filterInboundDelivJSONModel").getData().lifnr = selectedSupplier;
			that.getModel("filterInboundDelivJSONModel").getData().lifnrDesc = selectedSupplierDesc;

			this.oSearchSupplierDialog.close();
			this.oSearchSupplierDialog.destroy();
			this.oSearchSupplierDialog = undefined;
			that.getModel("filterInboundDelivJSONModel").refresh();
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
				that.oSearchMatnrDialog = sap.ui.xmlfragment("it.aupsup.inboundDelivery.SearchMatnr", that);
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

			// var selectedMatnr = that.getModel("filterInboundDelivJSONModel").getData().matnr;
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

			that.getModel("filterInboundDelivJSONModel").getData().matnr = selectedMatnr;
			that.getModel("filterInboundDelivJSONModel").getData().MatnrDesc = selectedMatnrDesc;

			this.oSearchMatnrDialog.close();
			this.oSearchMatnrDialog.destroy();
			this.oSearchMatnrDialog = undefined;
			that.getModel("filterInboundDelivJSONModel").refresh();
		},

		getAllProfiliConsegna: function () {
			var url = "/backend/Utils/UtilsManagement/GetProfiliConferma";
			that.ajaxGet(url, function (oData) {
				if (oData && oData.results) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getOwnerComponent().setModel(oModel, "AllProfiliConfermaJSONModel");
				}
			});
		},
		onCreateDelivery: function () {
			var oTable = this.getView().byId("InboundDelivHeadersTable");
			var itemIndex = oTable.indexOfItem(oTable.getSelectedItem());
			if (itemIndex !== -1) {
				MessageBox.warning((that.getResourceBundle().getText("MessConf")), {
					icon: MessageBox.Icon.WARNING,
					title: "Warning",
					actions: [MessageBox.Action.CANCEL, MessageBox.Action.OK],
					initialFocus: MessageBox.Action.CANCEL,
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.OK) {
							that.onConfirmPositions();
						}
					}
				});
			} else {
				MessageBox.error(that.getResourceBundle().getText("ERR_NoOrderSelect"));
			}
		},

		onConfirmPositions: function () {
			var oTable = that.getView().byId("InboundDelivHeadersTable");
			var aIndices = oTable.indexOfItem(oTable.getSelectedItem());
			var selectedContextBinding = [];
			if (parseInt(aIndices) < 0) {
				MessageToast.show(that.getResourceBundle().getText("ERR_Selection_Row"));
				return;
			}
			var oItems = oTable.getSelectedItems();
			var oNotEditPositions = ""; //Elenco delle posizione per le quali è inibita la modifica
			var countNotEditPositions = 0;
			var promiseArr = []
			for (var i = 0; i < oItems.length; i++) {
				var oRow = that.getModel("InboundDelJSONModel").getProperty(oItems[i].getBindingContextPath());
				var oPositionModel = JSON.parse(JSON.stringify(oRow));
				var trovato = false;
				selectedContextBinding.forEach(function (elem) {
					if (oPositionModel.EBELN === elem.EBELN && oPositionModel.EBELP === elem.EBELP && oPositionModel.ETENR === elem.ETENR) {
						trovato = true;
					}
				});
				if (!trovato) {
					promiseArr.push(new Promise(function (resolve, reject) {
						var url = "/backend/Utils/UtilsManagement/isHuMandatory?I_BSTAE=" + oPositionModel.BSTAE + "&I_PLANT=" + oPositionModel.WERKS + "&I_UPDKZ=2&I_LIFNR=" + oPositionModel.LIFNR
						that.ajaxGet(url, function (oData) {
							if (oData) {
								oPositionModel.isHuMandatory = oData.isMandatory !== undefined && oData.isMandatory === 'X' ? true : false
							}
							selectedContextBinding.push(oPositionModel)
							resolve()
						});
					}))
				}

			}

			Promise.all(promiseArr).then(values => {
				var oModelSelectedPos = new JSONModel();
				oModelSelectedPos.setData(selectedContextBinding);
				this.getView().setModel(oModelSelectedPos,
					"SelectedPositionsJSONModel");

				if (!that.oConfirmPositionsFragment) {
					that.oConfirmPositionsFragment = sap.ui.xmlfragment("it.aupsup.inboundDelivery.fragments.ConfirmPositions", this);
					that.getView().addDependent(that.oConfirmPositionsFragment);
				}

				that.oConfirmPositionsFragment.open();
			});



		},

		onNavBackToConfirm: function () {
			var navCon = sap.ui.getCore().byId("navCon");
			navCon.to(sap.ui.getCore().byId("p1"), "slide");
		},

		getCurrentProfiloConsegna: function (bstae) {
			var profiliConsegna = that.getModel("AllProfiliConfermaJSONModel").getData().results;

			var profiloSelezionato;
			if (profiliConsegna != undefined) {
				$.each(profiliConsegna, function (index, item) {
					if (item.PROFILO_CONTROLLO === bstae && item.TIPO_CONFERMA === "2") {
						profiloSelezionato = item;
					}
				});
			}

			return profiloSelezionato;
		},

		onAddDeliveries: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getParent().getBindingContext("SelectedPositionsJSONModel").sPath;
			var mod = that.getModel("SelectedPositionsJSONModel").getProperty(oPath);

			if (mod.NrColli !== undefined && mod.NrColli !== "" && mod.QuantitaCollo !== undefined && mod.QuantitaCollo !== "") {
				var profiloSelezionato = that.getCurrentProfiloConsegna(mod.BSTAE);

				if ((parseFloat(mod.NrColli) * parseFloat(mod.QuantitaCollo)) > parseFloat(mod.MENGE)) {
					MessageBox.error(that.getResourceBundle().getText("ERR_Quantity", mod.EBELN + "-" + mod.EBELP + " CONF: " + mod.ETENR));
					return;
				}

				var oSchedulationsArray = [];
				if (mod !== undefined && mod.Deliveries !== undefined && mod.Deliveries.results !== undefined) {
					oSchedulationsArray = mod.Deliveries.results;
				} else {
					mod.Deliveries = [];
				}

				var gestioneEtichetteModel = that.getView().getModel("gestioneEtichetteJSONModel");
				var udmPeso = ""
				var udmVolume = ""
				var defaultPeso = ""
				var defaultVolume = ""
				if (gestioneEtichetteModel !== undefined && gestioneEtichetteModel.getData() !== undefined) {
					var selectedEtichetta = gestioneEtichetteModel.getData().find(x => x.PLANT === mod.WERKS);
					if (selectedEtichetta !== undefined) {
						udmPeso = selectedEtichetta.UDM_PESO !== undefined && selectedEtichetta.UDM_PESO !== null ? selectedEtichetta.UDM_PESO : ''
						udmVolume = selectedEtichetta.UDM_VOLUME !== undefined && selectedEtichetta.UDM_VOLUME !== null ? selectedEtichetta.UDM_VOLUME : ''
						defaultPeso = selectedEtichetta.DEFAULT_PESO !== undefined && selectedEtichetta.DEFAULT_PESO !== null ? selectedEtichetta.DEFAULT_PESO : 0
						defaultVolume = selectedEtichetta.DEFAULT_VOLUME !== undefined && selectedEtichetta.DEFAULT_VOLUME !== null ? selectedEtichetta.DEFAULT_VOLUME : 0
					}
				}

				for (var i = 0; i < mod.NrColli; i++) {
					var enabledLotto = false;
					var enabledDataScadenza = false;
					var enabledQuant = true;
					if (profiloSelezionato !== undefined) {
						if (profiloSelezionato.LOTTO_FORNITORE_INB !== undefined && profiloSelezionato.LOTTO_FORNITORE_INB === "X")
							enabledLotto = true;
						if (profiloSelezionato.LOTTO_FORNITORE_INB !== undefined && profiloSelezionato.DATA_SCADENZA_INB === "X")
							enabledDataScadenza = true;
						//NB la quantità non c'è sulla tabella di customizing
					}

					var schedulation = {
						"QUANT": mod.QuantitaCollo,
						"UDM_PESO": udmPeso,
						"UDM_VOLUME": udmVolume,
						"PESO": defaultPeso,
						"VOLUME": defaultVolume,
						"LOTTO": "",
						"SCADENZA": null,
						"editLotto": enabledLotto,
						"editDataScadenza": enabledDataScadenza,
						"editQuant": enabledQuant,
						"editImballo": profiloSelezionato !== undefined && profiloSelezionato.PACK_MAT_DEFAULT === 'X' ? false : true,
						"editPeso": profiloSelezionato !== undefined && profiloSelezionato.IS_PESO === 'X' ? true : false,
						"editVolume": profiloSelezionato !== undefined && profiloSelezionato.IS_VOLUME === 'X' ? true : false,
						"editExtHuNumb": profiloSelezionato !== undefined && profiloSelezionato.NUM_INT_HU === 'X' ? true : false,
						"editContent": profiloSelezionato !== undefined && profiloSelezionato.IS_CONTENT === 'X' ? true : false
					};
					oSchedulationsArray.push(schedulation);
				}

				mod.Deliveries.results = oSchedulationsArray;

				this.getModel("SelectedPositionsJSONModel").refresh();
			} else {
				MessageBox.error(that.getResourceBundle().getText("ERR_quant_colli"));
			}

		},
		onDeleteSchedulation: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getParent().getBindingContext("SelectedPositionsJSONModel").sPath;
			var mod = that.getModel("SelectedPositionsJSONModel").getProperty(oPath);

			var keys = oEvent.getParameter("id");
			var splits = keys.split("-");
			var rowNumber = splits[splits.length - 1];

			if (mod !== undefined && mod.Deliveries.results !== null) {
				mod.Deliveries.results.splice(rowNumber, 1);
			}
			this.getModel("SelectedPositionsJSONModel").refresh(true);
		},

		onDeliveryNexStep: function () {
			var model = that.getModel("SelectedPositionsJSONModel").oData;
			var err = "";
			for (var i = 0; i < model.length; i++) {

				//	var sommaQuantitaSchedulazioni = 0;
				if (model[i].Deliveries !== undefined && model[i].Deliveries.results !== undefined && model[i].Deliveries.results.length > 0) {
					var sumMenge = 0
					for (var j = 0; j < model[i].Deliveries.results.length; j++) {
						var mod = model[i].Deliveries.results[j]
						sumMenge = sumMenge + parseFloat(mod.QUANT)
						//sommaQuantitaSchedulazioni = sommaQuantitaSchedulazioni + parseInt(model[i].POItemSchedulers.results[j].MENGE);
						/*	if (model[i].Deliveries.results[j] && model[i].Deliveries.results[j].editLotto === true && model[i].Deliveries.results[j].LOTTO ==
								"") {
								err = that.getResourceBundle().getText("ERR_Deliveries_Mandatory", [model[i].EBELN + " - " + model[i].EBELP]);
								break;
							}
							if (model[i].Deliveries.results[j] && model[i].Deliveries.results[j].editDataScadenza === true && (model[i].Deliveries.results[j]
									.SCADENZA == "" ||
									model[i].Deliveries.results[j].SCADENZA == null)) {
								err = that.getResourceBundle().getText("ERR_Deliveries_Mandatory", [model[i].EBELN + " - " + model[i].EBELP]);
								break;
							}*/

						// controllo obbligatorietà inserimento hu
						if (model[i].Deliveries.results[j] && model[i].Deliveries.results[j].editQuant === true && model[i].Deliveries.results[j].QUANT === "") {
							err = that.getResourceBundle().getText("ERR_Deliveries_Mandatory_Quant", [model[i].EBELN + " - " + model[i].EBELP]);
							break;
						}
						if (model[i].Deliveries.results[j] && model[i].Deliveries.results[j].editImballo === true && (model[i].Deliveries.results[j].IMBALLO === undefined || model[i].Deliveries.results[j].IMBALLO === "")) {
							err = that.getResourceBundle().getText("ERR_Deliveries_Mandatory_Imballo", [model[i].EBELN + " - " + model[i].EBELP]);
							break;
						}
						if (model[i].Deliveries.results[j] && model[i].Deliveries.results[j].editPeso === true && (model[i].Deliveries.results[j].PESO === undefined || model[i].Deliveries.results[j].PESO === "")) {
							err = that.getResourceBundle().getText("ERR_Deliveries_Mandatory_Peso", [model[i].EBELN + " - " + model[i].EBELP]);
							break;
						}
						if (model[i].Deliveries.results[j] && model[i].Deliveries.results[j].editExtHuNumb === true && (model[i].Deliveries.results[j].EXTHUNUMB === undefined || model[i].Deliveries.results[j].EXTHUNUMB === "")) {
							err = that.getResourceBundle().getText("ERR_Deliveries_Mandatory_ExtHuNumb", [model[i].EBELN + " - " + model[i].EBELP]);
							break;
						}
						if (model[i].Deliveries.results[j] && model[i].Deliveries.results[j].editVolume === true && (model[i].Deliveries.results[j].VOLUME === undefined || model[i].Deliveries.results[j].VOLUME === "")) {
							err = that.getResourceBundle().getText("ERR_Deliveries_Mandatory_Volume", [model[i].EBELN + " - " + model[i].EBELP]);
							break;
						}
						if (model[i].Deliveries.results[j] && model[i].Deliveries.results[j].editContent === true && (model[i].Deliveries.results[j].CONTENT === undefined || model[i].Deliveries.results[j].CONTENT === "")) {
							err = that.getResourceBundle().getText("ERR_Deliveries_Mandatory_Content", [model[i].EBELN + " - " + model[i].EBELP]);
							break;
						}

					}

					var ordine = model[i].EBELN + "-" + model[i].EBELP + " CONF: " + model[i].ETENR;
					if (Math.abs(sumMenge) > parseFloat(model[i].MENGE)) {
						err = err + "\n" + that.getResourceBundle().getText("ERR_Quantity", ordine);
					}

					var profiloSelezionato = that.getCurrentProfiloConsegna(model[i].BSTAE);
					var perc = (Math.abs(sumMenge) / parseFloat(model[i].MENGE)) * 100

					if (parseInt(profiloSelezionato.PERC_SUPERIORE_QUANT) > 0 && parseInt(profiloSelezionato.PERC_INFERIORE_QUANT) > 0) {
						if (perc >= 0) {
							if (perc < parseInt(profiloSelezionato.PERC_SUPERIORE_QUANT)) {
								// la percentuale di quantità è all'interno dei limiti
							} else {
								err = err + "\n" + that.getResourceBundle().getText("ERR_Quant_Perc_Down_Single");
								err = err + "\n" + ordine;
							}
						} else {
							if (perc < 0) {
								if (perc > parseInt(profiloSelezionato.PERC_INFERIORE_QUANT)) {
									// la percentuale di quantità è all'interno dei limiti
								} else {
									err = err + "\n" + that.getResourceBundle().getText("ERR_Quant_Perc_Up_Single");
									err = err + "\n" + ordine;
								}
							}
						}
					} else {
						if (parseInt(profiloSelezionato.PERC_SUPERIORE_QUANT) === 0 && perc === 100 && parseInt(profiloSelezionato.PERC_INFERIORE_QUANT) === 0) {

						} else {
							if (perc >= 100) {
								if (perc < parseInt(profiloSelezionato.PERC_SUPERIORE_QUANT)) {
									// la percentuale di quantità è all'interno dei limiti
								} else {
									err = err + "\n" + that.getResourceBundle().getText("ERR_Quant_Perc_Up_Single");
									err = err + "\n" + ordine;
								}
							} else {
								if (perc < 100) {
									if (perc > parseInt(profiloSelezionato.PERC_INFERIORE_QUANT)) {
										err = err + "\n" + that.getResourceBundle().getText("ERR_Quant_Perc_Down_Single");
										err = err + "\n" + ordine;
									}
								}
							}
						}
					}

					if (err !== '') {
						MessageBox.error(err);
						return
					}

					if (err != "") {
						break;
					}
				} else {
					if (model[i].isHuMandatory) {
						err = that.getResourceBundle().getText("ERR_Deliveries_Mandatory", [model[i].EBELN + " - " + model[i].EBELP]);
						break;
					}
				}

			}
			if (err !== "") {
				MessageBox.error(err);
				err = "";
			} else {
				var navCon = sap.ui.getCore().byId("navCon");
				navCon.to(sap.ui.getCore().byId("p2"), "slide");
			}
		},

		getGestioneEtichette: function () {

			var url = "/backend/Utils/UtilsManagement/GetGestioneEtichette";
			that.ajaxGet(url, function (oData) {
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData.results);
					that.getView().setModel(oModel, "gestioneEtichetteJSONModel");
				}
			});

		},

		onConfirmAndClose: function () {

			if (sap.ui.getCore().byId("XBLNR").getValue() === undefined || sap.ui.getCore().byId("XBLNR").getValue() === "" ||
				sap.ui.getCore().byId("LFDAT").getValue() === undefined || sap.ui.getCore().byId("LFDAT").getValue() === "" ||
				sap.ui.getCore().byId("LFDAT").getValue() === null) {
				MessageBox.error(that.getResourceBundle().getText("ERR_Confirm_Position_Text"));
				return;
			}

			MessageBox.warning(that.getResourceBundle().getText("MSG_Confirm_Position_Text"), {
				icon: MessageBox.Icon.WARNING,
				title: "Warning",
				actions: [MessageBox.Action.CANCEL, MessageBox.Action.OK],
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.OK) {

						var body = {
							"lfart": "",
							"verur": sap.ui.getCore().byId("XBLNR").getValue(),
							"lfdat": sap.ui.getCore().byId("LFDAT").getValue(),
							"wadat": "",
							/*"btgew": sap.ui.getCore().byId("BTGEW").getValue(),
							"gewei": "Kg",
							"volum": sap.ui.getCore().byId("VOLUM").getValue(),
							"voleh": "M3",*/
							"notes": sap.ui.getCore().byId("NOTES").getValue(),
							"lifnr": "",
							/*	"btgew": sap.ui.getCore().byId("BYGEW").getValue(),*/
							"it_hu_detail": [],
							"it_hu_header": [],
							"it_item": [],
							"it_serial_no": [ /*passare vuota per ama*/ ]
						};

						var model = that.getModel("SelectedPositionsJSONModel").getData();
						if (model !== undefined) {
							var gestioneEtichetteModel = that.getView().getModel("gestioneEtichetteJSONModel");
							var numeratoreEsterno = 0;
							var posNumber = 0;
							$.each(model, function (index, item) {

								// AZ 09/12/2019 aggiungo lifnr per invio mail
								body.lifnr = item.LIFNR;

								var profiloConsegna = that.getCurrentProfiloConsegna(item.BSTAE);
								if (profiloConsegna !== undefined) {
									body.lfart = profiloConsegna.TIPO_CONSEGNA_INB;
								}

								// preparazione it_hu_detail

								var currentItemsList = body.it_item;

								if (item.Deliveries !== undefined && item.Deliveries.results !== undefined) {
									var currentDeliveriesList = item.Deliveries.results;

									$.each(currentDeliveriesList, function (index, sDelivery) {
										numeratoreEsterno++;
										posNumber = posNumber + 10;
										var trovato = false;
										var quantTrovato = 0;
										if (currentItemsList !== undefined && currentItemsList.length > 0) {
											$.each(currentItemsList, function (index, sItem) {
												if (sItem.VGBEL === item.EBELN && sItem.VGPOS === item.EBELP && sItem.ETENR === item.ETENR && sItem.LIFEXPOS === item.XBLNR &&
													sItem.MATNR === item.MATNR && sItem.VFDAT === sDelivery.SCADENZA && sItem.LICHN === sDelivery.LOTTO) {
													trovato = true;
													sItem.LFIMG = parseFloat(sItem.LFIMG) + parseFloat(sDelivery.QUANT);
													posNumber = posNumber - 10;
												}
											});
										}
										if (trovato === false) {
											var deliveryItem = {
												"RFPOS": posNumber,
												"VGBEL": item.EBELN,
												"VGPOS": item.EBELP,
												"WERKS": item.WERKS,
												"MATNR": item.MATNR,
												"LFIMG": parseFloat(sDelivery.QUANT),
												"VRKME": item.MEINS,
												"LICHN": sDelivery.LOTTO,
												"VFDAT": sDelivery.SCADENZA,
												"HSDAT": "",
												"LIFEXPOS": item.XBLNR,
												"ETENR": item.ETENR,
												"LGORT": item.LGORT
											};
											body.it_item.push(deliveryItem);
										}

										// preparazione it_hu_detail
										var huDetail = {
											"REFHU": numeratoreEsterno,
											"RFPOS": posNumber,
											"MATNR": item.MATNR,
											"WERKS": item.WERKS,
											"TMENG": sDelivery.QUANT,
											"VRKME": item.MEINS
										};
										body.it_hu_detail.push(huDetail);

										// preparazione it_hu_header
										var elem_it_hu_header = {
											"REFHU": numeratoreEsterno,
											"EXIDV2": sDelivery.EXTHUNUMB,
											"VHILM": sDelivery.IMBALLO,
											"BRGEW": sDelivery.PESO !== undefined ? parseFloat(sDelivery.PESO) : 0,
											"BTVOL": sDelivery.VOLUME !== undefined ? parseFloat(sDelivery.VOLUME) : 0,
											"INHALT": sDelivery.CONTENT
										};

										if (gestioneEtichetteModel !== undefined && gestioneEtichetteModel.getData() !== undefined) {
											var selectedEtichetta = gestioneEtichetteModel.getData().find(x => x.PLANT === item.WERKS);
											if (selectedEtichetta !== undefined) {
												elem_it_hu_header.VHILM = selectedEtichetta.MATERIALE_IMBALLO;
											}
										}
										body.it_hu_header.push(elem_it_hu_header);

									});
								} else {
									posNumber = posNumber + 10;
									var deliveryItem = {
										"RFPOS": posNumber,
										"VGBEL": item.EBELN,
										"VGPOS": item.EBELP,
										"WERKS": item.WERKS,
										"MATNR": item.MATNR,
										"LFIMG": parseFloat(item.MENGE),
										"VRKME": item.MEINS,
										"LICHN": '',
										"VFDAT": '',
										"HSDAT": '',
										"LIFEXPOS": item.XBLNR,
										"ETENR": item.ETENR,
										"LGORT": item.LGORT
									};
									body.it_item.push(deliveryItem);
								}
							});
						}

						body.it_item.forEach(element => {
							delete element['ETENR'];
						});

						// invio i dati a SAP
						var url = "/backend/InboundDeliveryManagement/CreateSchedulations";
						that.showBusyDialog();
						that.ajaxPost(url, body, function (oData) { // funzione generica su BaseController
							that.hideBusyDialog();

							if (oData.error !== undefined) {
								MessageBox.error(decodeURI(oData.error));
								return
							}

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
									}

								} else {
									if (oData.nInbound !== undefined && oData.nInbound !== "") {
										var nInbound = oData.nInbound;
										MessageBox.warning(that.getResourceBundle().getText("correctConfirmDeliveries", nInbound), {
											icon: MessageBox.Icon.SUCCESS,
											actions: [MessageBox.Action.CANCEL, MessageBox.Action.OK],
											initialFocus: MessageBox.Action.CANCEL,
											onClose: function (oAction) {
												if (oAction === MessageBox.Action.OK) {

													var body = {
														"vbeln": ""
													};
													body.vbeln = nInbound;
													var url = "/backend/InboundDeliveryManagement/GetInboundList";
													that.showBusyDialog();
													that.ajaxPost(url, body, function (oData) { // funzione generica su BaseController
														that.hideBusyDialog();
														if (oData) {
															var oModel = new JSONModel();
															oModel.setData(oData);
															that.getView().setModel(oModel, "HUToPrintJSONModel");
															if (!that.oPrintHUDialog) {
																that.oPrintHUDialog = sap.ui.xmlfragment("it.aupsup.inboundDelivery.fragments.PrintHU",
																	that);
																that.getView().addDependent(that.oPrintHUDialog);
															}
															that.oPrintHUDialog.open();
															that.onCloseOrderPositions();
														}
													});

												} else {
													that.onCloseOrderPositions();
												}
											}
										});

									} else {
										that.onCloseOrderPositions();
									}

								}
							}

						});
					}
				}
			});
		},

		onCloseOrderPositions: function () {
			if (this.oConfirmPositionsFragment) {
				this.oConfirmPositionsFragment.close();
				this.oConfirmPositionsFragment.destroy();
				this.oConfirmPositionsFragment = undefined;
			}
			this.getView().setModel(null,
				"SelectedPositionsJSONModel");

			that.onSearch()
		},

		onClosePrintHU: function () {
			if (that.oPrintHUDialog) {
				that.oPrintHUDialog.close();
				that.oPrintHUDialog.destroy();
				that.oPrintHUDialog = undefined;
			}
			that.getView().setModel(null, "HUToPrintJSONModel");
		},

		onDownloadZip: function (oEvent) {

			var oTable = sap.ui.getCore().byId("idHUTable");
			var idx = oTable.indexOfItem(oTable.getSelectedItem());
			if (idx !== -1) {

				var oItems = oTable.getSelectedItems()
				var promiseArr = []
				var zip = new JSZip()
				this.showBusyDialog();
				for (var i = 0; i < oItems.length; i++) {
					var oPositionModel = that.getModel("HUToPrintJSONModel").getProperty(oItems[i].getBindingContextPath());
					promiseArr.push(new Promise(function (resolve, reject) {

						var path = "/backend/InboundDeliveryManagement/GetHUPDF" + "?I_EXIDV=" + oPositionModel.EXIDV + "&I_WERKS=" + oPositionModel.WERKS;
						try {
							var xhr = new window.XMLHttpRequest();
							xhr.EXIDV = oPositionModel.EXIDV;
							xhr.open('GET', path, true);

							// recent browsers
							if ("responseType" in xhr) {
								xhr.responseType = "arraybuffer";
							}

							// older browser
							if (xhr.overrideMimeType) {
								xhr.overrideMimeType("text/plain; charset=x-user-defined");
							}

							xhr.onreadystatechange = function (event) {
								// use `xhr` and not `this`... thanks IE
								if (xhr.readyState === 4) {
									if (xhr.status === 200 || xhr.status === 0) {
										try {
											zip.file("download_hu_" + xhr.EXIDV + ".pdf", xhr.response || xhr.responseText, {
												binary: true
											});
											resolve();
										} catch (err) {
											that.hideBusyDialog();
											reject();
										}
									} else {
										that.hideBusyDialog();
										reject("Ajax error for " + path + " : " + this.status + " " + this.statusText);
									}
								}
							};

							xhr.send();

						} catch (e) {
							that.hideBusyDialog();
							reject(e, null);
						}
					}))

				}

				Promise.all(promiseArr).then(values => {
					that.hideBusyDialog();
					zip.generateAsync({
							type: "blob"
						})
						.then(function (content) {
							// Force down of the Zip file
							that.saveAs(content, "download.zip");
						});
				});

			} else {
				MessageBox.error(that.getResourceBundle().getText("ERR_Select_HU"));
			}


		},

		saveAs: function (blob, filename) {
			if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
				return navigator.msSaveOrOpenBlob(blob, fileName);
			} else if (typeof navigator.msSaveBlob !== 'undefined') {
				return navigator.msSaveBlob(blob, fileName);
			} else {
				var elem = window.document.createElement('a');
				elem.href = window.URL.createObjectURL(blob);
				elem.download = filename;
				elem.style = 'display:none;opacity:0;color:transparent;';
				(document.body || document.documentElement).appendChild(elem);
				if (typeof elem.click === 'function') {
					elem.click();
				} else {
					elem.target = '_blank';
					elem.dispatchEvent(new MouseEvent('click', {
						view: window,
						bubbles: true,
						cancelable: true
					}));
				}
				URL.revokeObjectURL(elem.href);
			}
		},

		onItemPrintHU: function (oEvent) {
			var getTabledata = that.getView().getModel("HUToPrintJSONModel").getData().results;
			var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
			var selctedRowdata = getTabledata[itemPosition];
			//	MessageToast.show("TODO Print " + selctedRowdata.EXIDV);

			var url = "/backend/InboundDeliveryManagement/GetHUPDF?I_EXIDV=" + selctedRowdata.EXIDV + "&I_WERKS=" + selctedRowdata.WERKS;

			that._pdfViewer = new PDFViewer();
			that._pdfViewer.setShowDownloadButton(false);
			that._pdfViewer.attachSourceValidationFailed(function (oControlEvent) {
				oControlEvent.preventDefault();
			});
			that.getView().addDependent(that._pdfViewer);
			that._pdfViewer.setSource(url);
			that._pdfViewer.open();
			that.onCloseOrderPositions();

		},

		onSendData: function () {

			var body = {
				"ekes": [],
				"eket": [],
				"ekko": [],
				"ekpo": [],
				"confirmType": ""
			};
			for (var i = 0; i < that.getView().byId("InboundDelivHeadersTable")._aSelectedPaths.length; i++) {
				var ind = that.getView().byId("InboundDelivHeadersTable")._aSelectedPaths[i].split("/");
				ind = ind[3];
				var ekpoRow = that.getModel("InboundDelJSONModel").getData().results.EkkoEkpo[ind];
				if (ekpoRow !== undefined) {
					var ekesrow = that.getModel("InboundDelJSONModel").getData().results.EketEkes;
					if (ekesrow !== undefined) {}
				}
			}
			//Chiamata al servizio per la conferma
			var url = "/backend/InboundDeliveryManagement/CreateSchedulations";
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
						}

					} else {

						MessageBox.success(that.getResourceBundle().getText("correctConfirmData"), {
							title: "Success", // default
							onClose: function () {
								// aggiorno la lista
								that.onSearch();
							} // default

						});

					}
				}
			});

		},

		onChangeProfiloConsegna: function (oEvent) {
			var selectedKey = oEvent.getSource().getSelectedItem().getKey();

			var profiliConsegna = that.getModel("AllProfiliConfermaJSONModel").getData().results;
			var profiloSelezionato = [];
			if (profiliConsegna != undefined) {
				profiloSelezionato = profiliConsegna.find(x => x.CAT_CONFERMA === selectedKey);
			}

			that.getModel("filterInboundDelivJSONModel").getData().bstae = profiloSelezionato !== undefined ? profiloSelezionato.PROFILO_CONTROLLO :
				"";
			that.getModel("filterInboundDelivJSONModel").getData().ebtyp = selectedKey;

			that.onSearch();

		},
		onClearFilters: function () {
			if (that.getModel("filterInboundDelivJSONModel") !== undefined && that.getModel("filterInboundDelivJSONModel").getData() !==
				undefined) {
				that.getModel("filterInboundDelivJSONModel").getData().MatnrDesc = '';
				that.getModel("filterInboundDelivJSONModel").getData().ebeln = "";
				that.getModel("filterInboundDelivJSONModel").getData().lifnr = '';
				that.getModel("filterInboundDelivJSONModel").getData().ekorg = '';
				that.getModel("filterInboundDelivJSONModel").getData().werks = '';
				that.getModel("filterInboundDelivJSONModel").getData().dateFrom = null;
				that.getModel("filterInboundDelivJSONModel").getData().dateTo = null;
			}
			if (that.getModel("MetasupplierJSONModel") !== undefined && that.getModel("MetasupplierJSONModel").getData() !== undefined) {
				that.getModel("MetasupplierJSONModel").getData().METAID = '';
			}
			if (that.getModel("lifnrJSONModel") !== undefined && that.getModel("lifnrJSONModel").getData() !== undefined) {
				that.getModel("lifnrJSONModel").setData(null);
			}
			if (that.getModel("filterInboundDelivJSONModel") !== undefined)
				that.getModel("filterInboundDelivJSONModel").refresh();
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

			var dataS = this.getView().getModel("InboundDelJSONModel");
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
				models: this.getView().getModel("InboundDelJSONModel"),

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
					name: that.getResourceBundle().getText("ETENR"),
					template: {
						content: "{ETENR}"
					}
				}, {
					name: that.getResourceBundle().getText("TYPE"),
					template: {
						content: "{TYPE}"
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
					name: that.getResourceBundle().getText("WERKS"),
					template: {
						content: "{DESCR_WERKS}"
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
					name: that.getResourceBundle().getText("EINDT"),
					template: {
						content: "{EINDT}"
					}
				}]
			});

			// download exported file
			oExport.saveFile().catch(function (oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		}

	});

});