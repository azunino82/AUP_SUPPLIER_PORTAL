sap.ui.define([
	"it/aupsup/metasupplier_M/controller/BaseController"
], function (BaseController) {
	"use strict";
	var that;
	return BaseController.extend("it.aupsup.metasupplier_M.controller.App", {
		onInit: function () {
			that = this;

			that.getOwnerComponent().getRouter().getRoute("TargetApp").attachPatternMatched(
				that.handleRoutePatternMatched,
				that);

			that.handleRoutePatternMatched();
		},

		handleRoutePatternMatched: function (oEvent) {
			var url = "/backend/MetasupplierManagement/GetMetaID";
			that.ajaxGet(url, function (oDataRes) {
				if (oDataRes && oDataRes.results && oDataRes.results.length > 0) {
					var metaid = oDataRes.results[0].METAID;
					that.setModel(metaid, null, 'M');
				}else{
					sap.m.MessageToast.show("No MetaID Found!");
				}
			});
		},

		setModel: function (sMetaid, arrIDs, sUserType) {
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
			} else {
				sap.m.MessageToast.show("No MetaID Found!");
			}

		}
	});
});