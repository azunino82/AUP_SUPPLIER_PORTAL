var that;
var oDialog;

sap.ui.define([
	"it/aupsup/metasupplier/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (BaseController, MessageBox, JSONModel) {
	"use strict";

	return BaseController.extend("it.aupsup.metasupplier.controller.Suppliers", {
		onInit: function () {
			that = this;

			var filterJSON = {
				"NAME1": "",
				"STCEG": "",
				"EKORG": []
			};

			var oModelFI = new JSONModel();
			oModelFI.setData(filterJSON);
			this.getView().setModel(oModelFI, "filterOrdersJSONModel");

			that.getOwnerComponent().getRouter().getRoute("RouteSuppliers").attachPatternMatched(that.handleRoutePatternMatched,
				this);
			that.getPurchaseOrganizations();
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

		handleRoutePatternMatched: function (oEvent) {
			that = this;
			//MOCK DATA 
			var data = [];

			var jsonModel = new sap.ui.model.json.JSONModel();
			jsonModel.setData(data);
			that.getView().byId("idSuppliersTable").setModel(jsonModel, "tableModelSuppliers");
			that.getView().byId("idSuppliersTable").getModel().refresh();
			//END MOCK DATA
		},

		onSearch: function (oEvent) {

			var RagSocialeMetafornitore = this.getView().byId("InputRagioneSociale").getValue();
			var PivaMetafornitore = this.getView().byId("InputPivaFornitore").getValue();
			var table = this.getView().byId("idSuppliersTable");
			var url = "/backend/Utils/UtilsManagement/GetVendorList?I_NAME1=" + RagSocialeMetafornitore + "&I_STCEG=" +
				PivaMetafornitore;

			var body = {
				"ekorg": []
			};
			that.getModel("PurchaseOrganizationJSONModel")
				.getData().results.forEach(function (ekorg) {
					body.ekorg.push(ekorg);
				});

			that.showBusyDialog();
			that.ajaxPost(url, {}, function (oData) {
				that.hideBusyDialog();
				if (oData && oData.results) {
					var jsonModel = new sap.ui.model.json.JSONModel();
					var arrDistinct = [];
					oData.results.forEach(function (elem) {
						var trovato = arrDistinct.find(x => x.LIFNR === elem.LIFNR);
						if (trovato === undefined) {
							arrDistinct.push(elem);
						}
					});

					jsonModel.setData(arrDistinct);
					table.setModel(jsonModel, "tableModelSuppliers");
					that.getView().setModel(jsonModel, "tableModelSuppliers");

				}
			});


			/*TODO servizio var body = {
				"ekorg": []
			};
			ekorgs.getSelectedKeys().forEach(function (ekorg) {
				body.ekorg.push(ekorg);
			});

			var url = "/SupplierPortal_Utils/xsOdata/GetVendorList.xsjs?I_USERID=" + userId + "&I_NAME1=" + ragioneSociale + "&I_STCEG=" +
				pIvaFornitore;

			that.showBusyDialog();

			that.ajaxPost(url, body, "/SupplierPortal_Utils", function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (oData && oData.results) {
					var jsonModel = new sap.ui.model.json.JSONModel();
					var arrDistinct = [];
					oData.results.forEach(function (elem) {
						var trovato = arrDistinct.find(x => x.LIFNR === elem.LIFNR);
						if(trovato === undefined){
							arrDistinct.push(elem);
						}
					});

					jsonModel.setData(arrDistinct);
					that.getView().byId("idSuppliersTable").setModel(jsonModel, "tableModelSuppliers");
					var list = that.getView().byId("idSuppliersTable");
					var binding = list.getBinding("items");
					binding.filter(filters);
				}
			}); */

		},

		handleCreatePress: function () {
			var selectedItems = that.getView().byId("idSuppliersTable").getSelectedItems();
			var data = [];
			var oModel = that.getView().byId("idSuppliersTable").getModel("tableModelSuppliers");

			if (selectedItems.length > 1) {
				for (var i = 0; i < selectedItems.length; i++) {
					var path = selectedItems[i].getBindingContext("tableModelSuppliers").getPath();
					data.push(oModel.getProperty(path));
				}

				if (!oDialog) {
					// create dialog via fragment factory
					oDialog = sap.ui.xmlfragment(this.getView().getId(), "it.aupsup.metasupplier.fragments.ChooseDefaultSupplier", this);

				}

				var oModeli18n = that.getView().getModel("i18n");
				oDialog.setModel(oModeli18n, "i18n");

				var jsonModel = new sap.ui.model.json.JSONModel();
				jsonModel.setData(data);

				oDialog.setModel(jsonModel);

				oDialog.open();
			} else if (selectedItems.length === 1) {
				var path = selectedItems[0].getBindingContext("tableModelSuppliers").getPath();
				var selectedSuppliers = oModel.getProperty(path).LIFNR + "-" + oModel.getProperty(path).NAME1.replace('/','') + ",";
				that.getOwnerComponent().setModel(oModel.getProperty(path), "defaultSupplier");
				that.getOwnerComponent().getRouter().navTo("RouteCreateMetasuppliers", {
					suppliers: selectedSuppliers
				});
			} else {
				sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("selectAtLeastOneRow"));
			}

		},

		chooseSupplierConfirm: function () {
			var oTableSuppliers = that.getView().byId("ChooseSupplierTable");
			var selectedItems = oTableSuppliers.getSelectedItems();
			var supplierSelected = oTableSuppliers.getModel().getData();
			var selectedSuppliers = "";

			if (selectedItems.length > 0) {
				for (var i = 0; i < supplierSelected.length; i++) {
					selectedSuppliers += supplierSelected[i].LIFNR + ",";
				}
				var path = selectedItems[0].getBindingContext().getPath();
				that.getOwnerComponent().setModel(oTableSuppliers.getModel().getProperty(path), "defaultSupplier");
				that.getOwnerComponent().getRouter().navTo("RouteCreateMetasuppliers", {
					suppliers: selectedSuppliers
				});
			} else {
				sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("selectAtLeastOneRow"));
			}

		},

		closeDialog: function () {
			oDialog.close();
		},

		editSupplier: function () { },

		deleteSupplier: function () { },

		onClearFilters: function () {

			var RagSocialeMetafornitore = that.getView().byId("InputRagioneSociale");
			if (RagSocialeMetafornitore instanceof sap.m.Input)
				RagSocialeMetafornitore.setValue();

			var PivaMetafornitore = that.getView().byId("InputPivaFornitore");
			if (PivaMetafornitore instanceof sap.m.Input)
				PivaMetafornitore.setValue();

			if (that.getModel("PurchaseOrganizationJSONModel") !== undefined && that.getModel("PurchaseOrganizationJSONModel")
				.getData() !== undefined) {
				that.getModel("PurchaseOrganizationJSONModel").setData(null);
			}

		},
	});
});