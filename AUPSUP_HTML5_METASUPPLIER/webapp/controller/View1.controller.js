sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("it.alteaup.supplier.portal.metasupplier.AUPSUP_HTML5_METASUPPLIER.controller.View1", {
		onInit: function () {
			this.getDataFromXS();
		},
		getDataFromXS: function () {

			var aData = jQuery.ajax({
				type: "GET",
				contentType: "application/json",
				url: "/backend/get_legal_entity",
				async: false,
				success: function (data, textStatus, jqXHR) {

					alert("success to post" + data);
				},
				error: function (err) {
					alert("ErRR" + err);
				}

			});

		}
	});
});