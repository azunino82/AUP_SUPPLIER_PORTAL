sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"it/alteaup/supplier/portal/metasupplier/AUPSUP_HTML5_METASUPPLIER/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("it.alteaup.supplier.portal.metasupplier.AUPSUP_HTML5_METASUPPLIER.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			var userModel = new sap.ui.model.json.JSONModel("/services/userapi/currentUser");
			sap.ui.getCore().setModel(userModel, "userapi");

			


		}
	});
});