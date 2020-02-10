sap.ui.define([
	"it/alteaup/supplier/portal/metasupplier/AUPSUP_HTML5_METASUPPLIER/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (Controller,JSONModel) {
	"use strict";
	var that;
	return Controller.extend("it.alteaup.supplier.portal.metasupplier.AUPSUP_HTML5_METASUPPLIER.controller.View1", {
		onInit: function () {
			that = this;
			this.getDataFromXS();
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