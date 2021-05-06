var that;
var selectedSuppliers = "";

sap.ui.define([
	"it/aupsup/metasupplier/controller/BaseController",
	"sap/m/MessageBox"
], function (BaseController, MessageBox) {
	"use strict";

	return BaseController.extend("it.aupsup.metasupplier.controller.CreateMetasupplier", {
		onInit: function () {
			that = this;
			that.getRouter().getRoute("RouteCreateMetasuppliers").attachPatternMatched(that.handleRoutePatternMatched, that);
			//	that.getOwnerComponent().getRouter().getRoute("RouteCreateMetasuppliers").attachPatternMatched(
			//		that.handleRoutePatternMatched(),
			//		this);

			var jsonModel = new sap.ui.model.json.JSONModel();
			jsonModel.setData({
				"results": []
			});
			that.getView().setModel(jsonModel, "huMandatoryJSONModel");

			that.getBuyerBu();

			var url = "/backend/MetasupplierManagement/GetSupplierStates";
			that.ajaxGet(url, function (oDataRes) {

				var lang = sap.ui.getCore().getConfiguration().getLanguage();
				var jsonModel = new sap.ui.model.json.JSONModel(); 
				var data = []
				for (var i = 0; i < oDataRes.results.length; i++) {
					data.push({"key": oDataRes.results[i].KEY, "text": (lang === "it-IT") ? oDataRes.results[i].VALUE_IT : oDataRes.results[i].VALUE_EN})
				}

				jsonModel.setData(data);
				that.getView().setModel(jsonModel, "supplierStateJSONModel");

			});	
		},


		saveHUMandatoryForMetaId: function (uuid) {
			if (that.getView().getModel("huMandatoryJSONModel") !== undefined) {
				var mod = that.getView().getModel("huMandatoryJSONModel").getData()
				if (mod.results !== undefined && mod.results.length > 0) {
					var metaid = uuid

					var url = "/backend/MetasupplierManagement/UpdateHUMandatoryForMetaId"
					var body = {
						'metaid': metaid,
						'plants': mod.results
					}

					that.ajaxPost(url, body, function (oData) {

					});
				}
			}
		},

		handleRoutePatternMatched: function (oEvent) {
			that = this;
			selectedSuppliers = oEvent.getParameter("arguments").suppliers;
			var data = that.getOwnerComponent().getModel("defaultSupplier");

			that.getView().byId("ragSocialeMetafornitore").setValue(data.NAME1);
			that.getView().byId("indirizzo").setValue(data.STREET);
			that.getView().byId("nCivico").setValue(data.HOUSE_NUM1);
			that.getView().byId("paeseMetafornitore").setValue(data.LAND1);
			that.getView().byId("lingua").setValue(data.SPRAS);
			that.getView().byId("pivaMetafornitore").setValue(data.STCEG);
			that.getView().byId("sapSorgente").setValue(data.ZSAPSORGENTE);
			that.getView().byId("statoMetafornitore").setSelectedKey("");
			that.getView().byId("active").setSelected(false);

		},

		handleCreatePress: function () {
			var dataMetafornitore = {};
			var oView = that.getView();

			function uuidv4() {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
					var r = Math.random() * 16 | 0,
						v = c === 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			}
			var uuid = uuidv4();
			dataMetafornitore.METAID = uuid;
			dataMetafornitore.RAG_SOCIALE = oView.byId("ragSocialeMetafornitore").getValue();
			dataMetafornitore.INDIRIZZO = oView.byId("indirizzo").getValue();
			dataMetafornitore.N_CIVICO = oView.byId("nCivico").getValue();
			dataMetafornitore.PAESE = oView.byId("paeseMetafornitore").getValue();
			dataMetafornitore.LINGUA = oView.byId("lingua").getValue();
			dataMetafornitore.PIVA = oView.byId("pivaMetafornitore").getValue();
			dataMetafornitore.STATO_FORNITORE = oView.byId("statoMetafornitore").getSelectedKey();
			dataMetafornitore.ATTIVO = (oView.byId("active").getSelected() === true) ? 1 : 0;
			dataMetafornitore.BU = oView.byId("BU").getSelectedKey();

			var dataBu = {};
			dataBu.METAID = uuid;
			dataBu.BU = oView.byId("BU").getSelectedKey();
			dataBu.STATO = oView.byId("statoMetafornitore").getSelectedKey();

			// aggiungo le BU da salvare su T_METAID_BU
			dataMetafornitore.BUDATA = dataBu;

			// AGGIUNGO I SUPPLIER da AGGANCIARE AL METASUPPLIER

			var currentSYSID = sap.ui.getCore().getModel("sysIdJSONModel") !== undefined && sap.ui.getCore().getModel(
					"sysIdJSONModel").getData() !==
				undefined ? sap.ui.getCore().getModel("sysIdJSONModel").getData().SYSID : "";

			var suppliers = selectedSuppliers.split(",");
			var ArrSuppliers = [];
			for (var i = 0; i < suppliers.length - 1; i++) {
				var data = {};
				var [lifnr, desc] = suppliers[i].split("-");
				data.METAID = dataMetafornitore.METAID;
				data.LIFNR = lifnr;
				data.SYSID = currentSYSID;
				ArrSuppliers.push(data);
			}
			dataMetafornitore.SUPPLIERS = ArrSuppliers;

			var url = "/backend/MetasupplierManagement/CreateMetasupplier";

			that.showBusyDialog();

			that.ajaxPost(url, dataMetafornitore, function (oData) {
				that.hideBusyDialog();
				if (oData && oData.results) {
					sap.m.MessageToast.show(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
						"metasupplierCreated"));

					that.saveHUMandatoryForMetaId(uuid);

					setTimeout(function () {
						that.getView().getModel("huMandatoryJSONModel").setData(null)
						that.getOwnerComponent().getRouter().navTo("RouteMetasuppliers");
					}, 1000);

				}
			});


			/*	oModel.create("/MetasupplierDataSet", dataMetafornitore, {
					success: function (oDataRes, oResponse) {
						oModel.create("/MetasupplierBu", dataBu, {
							success: function (oDataRes, oResponse) {
								sap.m.MessageToast.show(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
									"metasupplierCreated"));
	
								setTimeout(function () {
									that.getOwnerComponent().getRouter().navTo("RouteMetasuppliers");
								}, 1000);
	
								var suppliers = selectedSuppliers.split(",");
	
								var currentSYSID = sap.ui.getCore().getModel("sysIdJSONModel") !== undefined && sap.ui.getCore().getModel(
										"sysIdJSONModel").getData() !==
									undefined ? sap.ui.getCore().getModel("sysIdJSONModel").getData().SYSID : "";
	
								for (var i = 0; i < suppliers.length - 1; i++) {
									var data = {};
									var [lifnr, desc] = suppliers[i].split("-");
									data.METAID = dataMetafornitore.METAID;
									data.LIFNR = lifnr;
									data.SYSID = currentSYSID;
	
									oModel.create("/MetasupplierSupplierSet", data, {
										success: function (oDataRes, oResponse) {
	
										},
										error: function (oError) {}
									});
								}
							},
							error: function (oError) {}
						});
					},
					error: function (oError) {
						sap.m.MessageBox.error(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
							"errorCreatingMetasupplier"));
					}
				}) */

		},

		editSupplier: function () {},

		deleteSupplier: function () {},

		contactsSupplier: function () {

		},

		getBuyerBu: function () {

			var url = "/backend/Utils/UtilsManagement/GetUserBU";
			that.ajaxGet(url, function (oData) {
				if (oData) {
					var jsonModel = new sap.ui.model.json.JSONModel();
					jsonModel.setData(oData);
					that.getView().setModel(jsonModel, "buyerBuJSONModel");
				}
			});
		}

	});
});