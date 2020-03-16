sap.ui.define([
	"it/alteaup/supplier/portal/metasupplier/AUPSUP_HTML5_METASUPPLIER_BM/controller/BaseController",
], function (BaseController) {
	"use strict";
	var that
	return BaseController.extend("it.alteaup.supplier.portal.metasupplier.AUPSUP_HTML5_METASUPPLIER_BM.controller.App", {

		onInit: function () {
			that = this;

			that.getOwnerComponent().getRouter().getRoute("TargetApp").attachPatternMatched(
				that.handleRoutePatternMatched,
				that);

			that.handleRoutePatternMatched();
		},

		handleRoutePatternMatched: function (oEvent) {
			var sValue = null;
			var metaid = "";

			if (that.getOwnerComponent().getComponentData() !== undefined)
				if (that.getOwnerComponent().getComponentData().startupParameters.mode !== undefined)
					sValue = that.getOwnerComponent().getComponentData().startupParameters.mode[0];

			if (sValue === null)
				sValue = jQuery.sap.getUriParameters().get("mode");

			var metaIDs = [];

			var jsonModel = new sap.ui.model.json.JSONModel();

			jsonModel.setData([{
				"userType": sValue,
				"metaIDs": metaIDs
			}]);

			that.getOwnerComponent().setModel(jsonModel, "user");
			that.getOwnerComponent().getRouter().navTo("RouteMetasuppliers");

		},

		setModel: function (sMetaid, arrIDs, sUserType, oDataMetasupplier) {
			var jsonModel = new sap.ui.model.json.JSONModel();
			if (sMetaid !== "") {
				jsonModel.setData([{
					"userType": sUserType,
					"metaIDs": arrIDs
				}]);

				that.getOwnerComponent().setModel(jsonModel, "user");

				that.getOwnerComponent().getRouter().navTo("RouteMetasupplierContacts", {
					metaid: sMetaid
				});
			}

		},

		getDataFromXS: function () {

			//var user =  this.getCurrentUserId();

			jQuery.ajax({
				type: "GET",
				contentType: "application/json",
				url: "/backend/callProcedure",
				async: false,
				success: function (oData, textStatus, jqXHR) {

					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "OutJSONModel");

				},
				error: function (err) {
					alert("ERRORE: " + err);
				}

			});

		}
	});
});