sap.ui.define([
	"it/alteaup/supplier/portal/aprvschdagr/AUPSUP_HTML5_APR_SCDAGR/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"it/alteaup/supplier/portal/schedAgrQuantConf/js/Date",
	"it/alteaup/supplier/portal/schedAgrQuantConf/js/formatter"
], function (BaseController, JSONModel, MessageBox, MessageToast, Sorter, Filter, FilterOperator, Export, ExportTypeCSV, Date, Formatter) {
	"use strict";
	var that = undefined;
	return BaseController.extend("it.alteaup.supplier.portal.aprvschdagr.AUPSUP_HTML5_APR_SCDAGR.controller.Worklist", {

		onInit: function () {
			that = this;
			that.getUserInfo();
			// questo meccanismo serve per cercare l'ordine dal link della mail. funziona solo sul portale pubblicato non in preview da webide
			var startupParams = undefined;
			if (that.getOwnerComponent().getComponentData() != undefined) {
				startupParams = that.getOwnerComponent().getComponentData().startupParameters;
			}

			if (startupParams != undefined && startupParams.objectId && startupParams.objectId[0]) {
				// cerco l'ordine passato nella url
				var url = "/Scheduling_Agreement/xsOdata/GetConfermeRifiuti.xsjs";

				that.getView().setModel(oModelFI, "filterJSONModel");
				var body = {
					"userid": that.getCurrentUserId(),
					"ebeln": startupParams.objectId[0],
					"lifnr": [],
					"matnr": [],
					"MatnrDesc": "",
					"ekorg": [],
					"ekgrp": [],
					"werks": [],
				};

				that.showBusyDialog();
				that.ajaxPost(url, body, "/Scheduling_Agreement", function (oData) { // funzione generica su BaseController
					that.hideBusyDialog();
					if (oData) {
						var oModel = new JSONModel();
						oModel.setData(oData);
						that.getView().setModel(oModel, "SchedAgreeJSONModel");
						//	that.getView().byId("rowNumber").setText(oData.results.length);
						that.getView().byId("OrderHeadersTable").setModel(oModel);
					}
					var oTable = that.getModel("SchedAgreeJSONModel").getData().results;
				});
			}

			that.getView().setModel(sap.ui.getCore().getModel("userapi"), "userapi");
			that.getCurrentSYSID();
			that.getPurchaseOrganizations();
			that.getMetasupplier();
			that.getPurchaseGroup();
			that.getPlants();
			that.getProfiliConferma();

			var filter = {
				"userid": that.getCurrentUserId(),
				"ebeln": "",
				"lifnr": [],
				"matnr": [],
				"MatnrDesc": "",
				"ekorg": [],
				"ekgrp": [],
				"werks": [],
			};
			var oModelFI = new JSONModel();
			oModelFI.setData(filter);
			that.getView().setModel(oModelFI, "filterJSONModel");

			if (!this._oResponsivePopover) {

				var oModelFilters = new JSONModel();
				oModelFilters.setData({
					"element": ""
				});
				this._oResponsivePopover = sap.ui.xmlfragment("it.alteaup.supplier.portal.schedAgrQuantConf.fragments.FilterSorter", this);
				this._oResponsivePopover.setModel(oModelFilters, "filterJSONModel");
			}

			var oTable = this.getView().byId("OrderHeadersTable");
			oTable.addEventDelegate({
				onAfterRendering: function () {
					var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
					for (var i = 0; i < oHeader.length; i++) {
						var oID = oHeader[i].id;
						that.onClick(oID);
					}
				}
			}, oTable);
			
            this.getView().setModel(sap.ui.getCore().getModel("userapi"), "userapi");			

		},

		getPurchaseOrganizations: function () {
			var filtri = "";
			var url = "PurchaseOrganizationsParameters(I_USERID='" + that.getCurrentUserId() + "')/Results";
			that.readObject("OrderManagementService", url, filtri, function (oData) {
				that.hideBusyDialog();
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					// that.getView().setModel(oModel, "PurchaseOrganizationJSONModel");
					var oComponent = that.getOwnerComponent();
					oComponent.setModel(oModel, "PurchaseOrganizationJSONModel");
				}

			});
		},

		onClick: function (oID) {
			$('#' + oID).click(function (oEvent) { //Attach Table Header Element Event
				var oTarget = oEvent.currentTarget; //Get hold of Header Element
				var oView = that.getView();
				var res = oTarget.id.split("--");
				res = res[1];

				//	var oTable = oView.byId("OrderHeadersTable");
				//	var oModel = oTable.getModel().getProperty("/results"); //Get Hold of Table Model Values
				//	var oKeys = Object.keys(oModel[0]); //Get Hold of Model Keys to filter the value
				oView.getModel("SchedAgreeJSONModel").setProperty("/bindingValue", res); //Save the key value to property
				that._oResponsivePopover.openBy(oTarget);
			});
		},

		onChange: function (oEvent) {
			var oValue = oEvent.getParameter("value");
			var oMultipleValues = oValue.split(",");
			var oTable = this.getView().byId("OrderHeadersTable");
			var oBindingPath = this.getView().getModel("SchedAgreeJSONModel").getProperty("/bindingValue"); //Get Hold of Model Key value that was saved
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
			var oBindingPath = this.getView().getModel("SchedAgreeJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onDescending: function () {
			var oTable = this.getView().byId("OrderHeadersTable");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.getView().getModel("SchedAgreeJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath, true);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
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
				oViewModel = this.getModel("SchedAgreeJSONModel");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("noData"));
			}
		},

		onPressOrder: function (oEvent) {
			var supplierID = oEvent.getSource().getText();
			// get a handle on the global XAppNav service
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.isIntentSupported(["PurchaseOrders-Display"])
				.done(function (aResponses) {

				})
				.fail(function () {
					new sap.m.MessageToast("Provide corresponding intent to navigate");
				});
			// generate the Hash to display a employee Id
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "PurchaseOrders",
					action: "Display"
				},
				params: {
					"objectId": supplierID
				}
			})) || "";
			//Generate a  URL for the second application
			var url = window.location.href.split('#')[0] + hash;
			//Navigate to second app
			sap.m.URLHelper.redirect(url, true);

			// read SupplierID from OData path Product/SupplierID
			// var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			// var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
			// 	target: {
			// 		semanticObject: "PurchaseOrders",
			// 		action: "display"
			// 	},
			// 	params: {
			// 		"object": supplierID
			// 	}
			// })) || "";

			// oCrossAppNavigator.toExternal({
			// 	target: {
			// 		shellHash: hash
			// 	}
			// });
		},

		handleSupplier: function () {

			if (!that.oSearchSupplierDialog) {
				that.oSearchSupplierDialog = sap.ui.xmlfragment("it.alteaup.supplier.portal.schedAgrQuantConf.fragments.SearchSupplier", that);
				that.getView().addDependent(that.oSearchSupplierDialog);
			}
			that.oSearchSupplierDialog.open();
			var oTable = sap.ui.getCore().byId("idSuppliersTable");
			var oItems = oTable.getItems();

			var selectedSupplier = that.getModel("filterJSONModel").getData().lifnr;
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

			that.getModel("filterJSONModel").getData().lifnr = selectedSupplier;
			that.getModel("filterJSONModel").getData().lifnrDesc = selectedSupplierDesc;

			this.oSearchSupplierDialog.close();
			this.oSearchSupplierDialog.destroy();
			this.oSearchSupplierDialog = undefined;
			that.getModel("filterJSONModel").refresh();
		},
		onSearchSupplier: function () {
			// ricerca fornitori da popup

			var filtri =
				sap.ui.getCore().byId("EKORG").getSelectedKeys();

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

		onSearchOrders: function () {

			var url = "/Scheduling_Agreement/xsOdata/GetConfermeRifiuti.xsjs";

			var body = that.getModel("filterJSONModel").getData();

			this.showBusyDialog();
			that.ajaxPost(url, body, "/Scheduling_Agreement", function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "SchedAgreeJSONModel");
					//	that.getView().byId("rowNumber").setText(oData.results.length);
					that.getView().byId("OrderHeadersTable").setModel(oModel);
				}
				var oTable = that.getModel("SchedAgreeJSONModel").getData().results;
			});
		},
		onConfirmPositions: function () {
			var oTable = this.getView().byId("OrderHeadersTable");
			var itemIndex = oTable.indexOfItem(oTable.getSelectedItem());
			if (itemIndex !== -1) {
				MessageBox.warning((that.getResourceBundle().getText("MessConf")), {
					icon: MessageBox.Icon.WARNING,
					title: "Warning",
					actions: [MessageBox.Action.CANCEL, MessageBox.Action.OK],
					initialFocus: MessageBox.Action.CANCEL,
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.OK) {
							that.onSendData('A');
						}
					}
				});
			} else {
				MessageBox.error(that.getResourceBundle().getText("ERR_NoOrderSelect"));
			}
		},
		onRejectPositions: function () {
			var oTable = this.getView().byId("OrderHeadersTable");
			var itemIndex = oTable.indexOfItem(oTable.getSelectedItem());
			if (itemIndex !== -1) {
				MessageBox.warning(that.getResourceBundle().getText("MessReject"), {
					icon: MessageBox.Icon.WARNING,
					title: "Warning",
					actions: [MessageBox.Action.CANCEL, MessageBox.Action.OK],
					initialFocus: MessageBox.Action.CANCEL,
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.OK) {
							that.onSendData('R');
						}
					}
				});
			} else {
				MessageBox.error(that.getResourceBundle().getText("ERR_NoOrderSelect"));
			}
		},

		getProfiliConferma: function (fCompletion) {
			var oModelData = this.getOwnerComponent().getModel("CustomizingModel");

			oModelData.read("/ProfiliConferma", {
				success: function (oData, oResponse) {
					if (oData && oData.results) {
						var oModel = new JSONModel();
						oModel.setData(oData.results);
						that.getView().setModel(oModel, "profiliConfermaJSONModel");
					}
				},
				error: function (err) {

				}
			});

		},

		filterProfiliConferma: function (profiloControllo, tipoConferma) {
			var profiliConfermaModel = this.getView().getModel("profiliConfermaJSONModel");
			var foundProfilo;
			if (profiliConfermaModel !== undefined && profiliConfermaModel.getData() && profiliConfermaModel.getData().length > 0) {
				profiliConfermaModel.getData().forEach(function (elem) {
					if (elem.PROFILO_CONTROLLO === profiloControllo && elem.TIPO_CONFERMA === tipoConferma) {
						foundProfilo = elem;
						return true;
					}
				});
			}
			return foundProfilo;
		},

		onSendData: function (confirmationType) {
			//	singleEkpoModel.BSTAE = ekpoRow.BSTAE;	
			var body = {
				"ekes": [],
				"eket": [],
				"ekko": [],
				"ekpo": [],
				"userid": that.getCurrentUserId(),
				"confirmType": confirmationType
			};
			for (var i = 0; i < that.getView().byId("OrderHeadersTable")._aSelectedPaths.length; i++) {
				var ind = that.getView().byId("OrderHeadersTable")._aSelectedPaths[i].split("/");
				ind = ind[3];
				var ekpoRow = that.getModel("SchedAgreeJSONModel").getData().results.EkkoEkpo[ind];
				if (ekpoRow !== undefined) {
					var ekesrow = that.getModel("SchedAgreeJSONModel").getData().results.EketEkes;
					if (ekesrow !== undefined) {
						for (var j = 0; j < ekesrow.length; j++) {
							if ((ekesrow[j].EBELN === ekpoRow.EBELN) && (ekesrow[j].EBELP === ekpoRow.EBELP)) {
								var singleEkesModel = {};
								var singleEketModel = {};

								singleEkesModel.ETENS = ekesrow[j].ETENS;
								singleEketModel.ETENR = ekesrow[j].ETENS;
								singleEkesModel.EBELN = ekesrow[j].EBELN;
								singleEketModel.EBELN = ekesrow[j].EBELN;
								singleEkesModel.EBELP = ekesrow[j].EBELP;
								singleEketModel.EBELP = ekesrow[j].EBELP;
								singleEkesModel.EBTYP = ekesrow[j].EBTYP;
								singleEkesModel.EINDT = ekesrow[j].EINDT;
								singleEketModel.EINDT = ekesrow[j].EINDT;
								singleEkesModel.LPEIN = ekesrow[j].LPEIN;
								singleEketModel.LPEIN = ekesrow[j].LPEIN;
								singleEkesModel.MENGE = ekesrow[j].MENGE;
								singleEketModel.MENGE = ekesrow[j].MENGE;
								singleEketModel.WEMNG = ekesrow[j].WEMNG;
								singleEketModel.MNG02 = ekesrow[j].MNG02;
								singleEkesModel.UZEIT = ekesrow[j].UZEIT;
								singleEkesModel.XBLNR = ekesrow[j].XBLNR;
								body.ekes.push(singleEkesModel);
								body.eket.push(singleEketModel);
							}
						}
					}
					var singleEkpoModel = {};
					singleEkpoModel.PART1 = "";
					var profiloConferma = that.filterProfiliConferma(ekpoRow.BSTAE, ekpoRow.UPDKZ);
					if (profiloConferma !== undefined && profiloConferma.PARZIALE_QUANTITA !== undefined) {
						singleEkpoModel.PART1 = profiloConferma.PARZIALE_QUANTITA;
					}

					singleEkpoModel.EBELN = ekpoRow.EBELN;
					singleEkpoModel.EBELP = ekpoRow.EBELP;
					if (ekpoRow.MENGE !== undefined && ekpoRow.MENGE !== null) {
						singleEkpoModel.MENGE = ekpoRow.MENGE;
					} else {
						if (ekpoRow.MENGE_ORIGINAL !== undefined && ekpoRow.MENGE_ORIGINAL !== null) {
							singleEkpoModel.MENGE = ekpoRow.MENGE_ORIGINAL;
						}
					}
					singleEkpoModel.MEINS = "";
					singleEkpoModel.NETPR = ekpoRow.NETPR;
					singleEkpoModel.PEINH = ekpoRow.PEINH;
					singleEkpoModel.KSCHL = ekpoRow.KSCHL;
					singleEkpoModel.BPRME = "";
					singleEkpoModel.BPUMZ = "0";
					singleEkpoModel.BPUMN = "0";
					singleEkpoModel.UMREZ = "0";
					singleEkpoModel.UMREN = "0";
					singleEkpoModel.LABNR = "";
					singleEkpoModel.UPDKZ = ekpoRow.UPDKZ;

					singleEkpoModel.ZCUSTOM01 = "";
					singleEkpoModel.ZCUSTOM02 = "";
					singleEkpoModel.ZCUSTOM03 = "";
					singleEkpoModel.ZCUSTOM04 = "";
					singleEkpoModel.ZCUSTOM05 = "";
					singleEkpoModel.ZCUSTOM06 = "";
					singleEkpoModel.ZCUSTOM07 = "";
					singleEkpoModel.ZCUSTOM08 = "";
					singleEkpoModel.ZCUSTOM09 = "";
					singleEkpoModel.ZCUSTOM10 = "";
					body.ekpo.push(singleEkpoModel);

					var singleEkkoModel = {};
					singleEkkoModel.EBELN = ekpoRow.EBELN;
					singleEkkoModel.LIFNR = ekpoRow.LIFNR;
					singleEkkoModel.ZCUSTOM01 = "";
					singleEkkoModel.ZCUSTOM02 = "";
					singleEkkoModel.ZCUSTOM03 = "";
					singleEkkoModel.ZCUSTOM04 = "";
					singleEkkoModel.ZCUSTOM05 = "";
					singleEkkoModel.ZCUSTOM06 = "";
					singleEkkoModel.ZCUSTOM07 = "";
					singleEkkoModel.ZCUSTOM08 = "";
					singleEkkoModel.ZCUSTOM09 = "";
					singleEkkoModel.ZCUSTOM10 = "";
					body.ekko.push(singleEkkoModel);
				}
			}
			//Chiamata al servizio per la conferma
			var url = "/SupplierPortal_OrdersManagement/xsOdata/ConfirmOrders.xsjs";
			that.showBusyDialog();
			that.ajaxPost(url, body, "/SupplierPortal_Utils", function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (oData) {
					if (oData.errLog) {
						MessageBox.error(decodeURI(oData.errLog));
						return;
					}
					if (oData.results && oData.results && oData.results.length > 0) {
						var message = "";
						$.each(oData.results, function (index, item) {
							message = item.MESSAGE + " \n " + message;
						});
						if (message !== "") {
							MessageBox.show(message, {
								onClose: function () {
										// aggiorno la lista
										that.onSearchOrders();
									} // default

							});
						}

					} else {
						MessageBox.success(that.getResourceBundle().getText("correctConfirmData"), {
							title: "Success", // default
							onClose: function () {
									// aggiorno la lista
									that.onSearchOrders();
								} // default

						});

					}
				}
			});

		},

		onClearFilters: function () {
			if (that.getModel("filterJSONModel") !== undefined && that.getModel("filterJSONModel").getData() !== undefined) {
				that.getModel("filterJSONModel").getData().MatnrDesc = '';
				that.getModel("filterJSONModel").getData().ebeln = "";
				that.getModel("filterJSONModel").getData().lifnr = '';
				that.getModel("filterJSONModel").getData().matnr = '';
				that.getModel("filterJSONModel").getData().ekorg = '';
				that.getModel("filterJSONModel").getData().ekgrp = '';
				that.getModel("filterJSONModel").getData().werks = '';
			}
			if (that.getModel("MetasupplierJSONModel") !== undefined && that.getModel("MetasupplierJSONModel").getData() !== undefined) {
				that.getModel("MetasupplierJSONModel").getData().METAID = '';
			}
			if (that.getModel("lifnrJSONModel") !== undefined && that.getModel("lifnrJSONModel").getData() !== undefined) {
				that.getModel("lifnrJSONModel").setData(null);
			}
			if (that.getModel("MatnrJSONModel") !== undefined && that.getModel("MatnrJSONModel").getData() !== undefined) {
				that.getModel("MatnrJSONModel").setData(null);
			}
			if (that.getModel("filterJSONModel") !== undefined)
				that.getModel("filterJSONModel").refresh();
			if (that.getModel("MetasupplierJSONModel") !== undefined)
				that.getModel("MetasupplierJSONModel").refresh();
			if (that.getModel("lifnrJSONModel") !== undefined)
				that.getModel("lifnrJSONModel").refresh();
			if (that.getModel("MatnrJSONModel") !== undefined)
				that.getModel("MatnrJSONModel").refresh();
		},
		getMetasupplier: function () {
			var filtri = "";
			var url = "/SupplierPortal_Utils/xsOdata/GetMetasupplierList.xsjs?I_USERID=" + this.getCurrentUserId();
			this.showBusyDialog();
			that.ajaxGet(url, function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "MetasupplierJSONModel");
					//Valorizzazione Campo Lifnr per Servizio
					var oLifnr = that.getModel("filterJSONModel");
					oLifnr = oData.results;
					var oModelLF = new JSONModel();
					oModelLF.setData(oLifnr);
					that.getView().setModel(oModelLF, "filterJSONModel");
				}
			});
		},
		onClearMaterialSearchFilters: function () {
			this.getView().getModel("MatnrSearchJSONModel").getData().matnr = "";
			this.getView().getModel("MatnrSearchJSONModel").getData().maktx = "";
			that.getView().getModel("MatnrJSONModel").setData(null);
			this.getView().getModel("MatnrSearchJSONModel").refresh();
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
			that.getModel("filterJSONModel").getData().lifnr = slifnr;

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
			that.getModel("filterJSONModel").getData().lifnr = lifnr;
		},
		getPlants: function () {

			var url = "/SupplierPortal_Utils/xsOdata/GetUserPlants.xsjs?I_USERID=" + this.getCurrentUserId();
			this.showBusyDialog();
			that.ajaxGet(url, function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					//	that.getView().setModel(oModel, "PlantsJSONModel");
					var oComponent = that.getOwnerComponent();
					oComponent.setModel(oModel, "PlantsJSONModel");
				}
			});
		},
		handleMatnr: function () {

			if (!that.oSearchMatnrDialog) {
				that.oSearchMatnrDialog = sap.ui.xmlfragment("it.alteaup.supplier.portal.schedAgrQuantConf.fragments.SearchMatnr", that);
				that.getView().addDependent(that.oSearchMatnrDialog);
			}
			that.oSearchMatnrDialog.open();
			var oTable = sap.ui.getCore().byId("idMatnrTable");
			var oItems = oTable.getItems();

			var body = {
				"userid": that.getCurrentUserId(),
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

		// handlePurchOrg: function (oEvent) {
		// /*Valorizzo EKORG per filtro*/
		// 	var selectedKeyArray = oEvent.oSource.getSelectedKeys();
		// 	var purcOrgList = that.getModel("PurchaseOrganizationJSONModel").getData();
		// 	var selectedPurcOrg = "";
		// 	var purcOrg = [];
		// 	if (selectedKeyArray != undefined) {
		// 		for (var i = 0; i < selectedKeyArray.length; i++) {
		// 			if (purcOrgList != undefined) {
		// 				selectedPurcOrg = purcOrgList.find(x => x.PURCH_ORG === selectedKeyArray[i]);
		// 				if (selectedPurcOrg !== undefined) {
		// 					if (selectedPurcOrg.PURCH_ORG != undefined) {
		// 						purcOrg.push(selectedPurcOrg.PURCH_ORG);
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
		// 	if (selectedKeyArray.length === 0) {
		// 		for (var j = 0; j < purcOrgList.length; j++) {
		// 			purcOrg.push(purcOrgList[j].PURCH_ORG);
		// 		}
		// 	}
		// 	that.getModel("filterJSONModel").getData().ekorg = purcOrg;

		// },

		onCloseSearchMatnr: function () {
			if (this.oSearchMatnrDialog) {
				this.oSearchMatnrDialog.close();
				this.oSearchMatnrDialog.destroy();
				this.oSearchMatnrDialog = undefined;
			}
		},
		onSearchMatnr: function () {
			// ricerca materiali da popup

			var url = "/SupplierPortal_Utils/xsOdata/SearchMaterial.xsjs";
			var body = this.getView().getModel("MatnrSearchJSONModel").getData();
			this.showBusyDialog();
			that.ajaxPost(url, body, "/SupplierPortal_Utils", function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "MatnrJSONModel");
				}
			});
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

			that.getModel("filterJSONModel").getData().matnr = selectedMatnr;
			that.getModel("filterJSONModel").getData().MatnrDesc = selectedMatnrDesc;

			this.oSearchMatnrDialog.close();
			this.oSearchMatnrDialog.destroy();
			this.oSearchMatnrDialog = undefined;
			that.getModel("filterJSONModel").refresh();
		},
		getPurchaseGroup: function () {

			var url = "/SupplierPortal_Utils/xsOdata/GetPurchaseDoc.xsjs";
			var body = {
				"userid": that.getCurrentUserId()
			};
			this.showBusyDialog();
			that.ajaxPost(url, body, "/SupplierPortal_Utils", function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "PurchaseGroupJSONModel");
				}
			});
		},

		onExport: function (oEvent) {

			var dataS = this.getView().getModel("SchedAgreeJSONModel");
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
				models: this.getView().getModel("SchedAgreeJSONModel"),

				// binding information for the rows aggregation
				rows: {
					path: "/results/EkkoEkpo"
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
					name: that.getResourceBundle().getText("MENGE"),
					template: {
						content: "{MENGE_ORIGINAL}"
					}
				}, {
					name: that.getResourceBundle().getText("MENGE_NEW"),
					template: {
						content: "{MENGE}"
					}
				}, {
					name: that.getResourceBundle().getText("NETPR"),
					template: {
						content: "{NETPR_ORIGINAL}"
					}
				}, {
					name: that.getResourceBundle().getText("NETPR_NEW"),
					template: {
						content: "{NETPR}"
					}
				}, {
					name: that.getResourceBundle().getText("PEINH"),
					template: {
						content: "{PEINH_ORIGINAL}"
					}
				}, {
					name: that.getResourceBundle().getText("PEINH_NEW"),
					template: {
						content: "{PEINH}"
					}
				}, {
					name: that.getResourceBundle().getText("SchedMod"),
					template: {
						content: "{SCHEDMOD}"
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
		onRowSelectionChange: function (oEvent) {

			var oSelectedItem = oEvent.getParameter("listItem");

			var oPath = oSelectedItem.oBindingContexts.SchedAgreeJSONModel.sPath;
			var oItem = that.byId("OrderHeadersTable").getModel().getProperty(oPath);

			var data = {
				orderId: oItem.EBELN,
				posNumber: oItem.EBELP,
				type: oItem.EBTYP,
			};

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("detail", {
				datas: JSON.stringify(data)
			});

			// }

		},

		onValidate: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getBindingContext("SchedAgreeJSONModel").sPath;
			var mod = that.getModel("SchedAgreeJSONModel").getProperty(oPath);

			var filtri = "";
			var url = "/Scheduling_Agreement/xsOdata/GetConfermeRifiutiByPos.xsjs?I_USERID=" + this.getCurrentUserId() + "&I_EBELN=" + mod.EBELN +
				"&I_EBELP=" + mod.EBELP;
			this.showBusyDialog();
			that.ajaxGet(url, function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "SchedAgrToApproveRejectJSONModel");

					if (!that.approveRejectFragment) {
						that.approveRejectFragment = sap.ui.xmlfragment("it.alteaup.supplier.portal.schedAgrQuantConf.fragments.ApproveReject", that);
						that.getView().addDependent(that.approveRejectFragment);
					}

					that.approveRejectFragment.open();
				}
			});

		},
		onCloseApproveRejectFragment: function () {
			if (this.approveRejectFragment) {
				this.approveRejectFragment.close();
				this.approveRejectFragment.destroy();
				this.approveRejectFragment = undefined;
			}
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
		onLegend: function (oEvent) {
			var oButton = oEvent.getSource();

			// create popover
			if (!this._oPopover) {
				new sap.ui.core.Fragment.load({
					name: "it.alteaup.supplier.portal.schedAgrQuantConf.fragments.ColorStatus",
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
		onConfirmApproveReject: function () {
			MessageToast.show("TODO");

		}

	});

});