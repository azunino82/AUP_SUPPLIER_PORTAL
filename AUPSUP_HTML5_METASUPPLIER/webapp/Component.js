sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"it/aupsup/metasupplier/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("it.aupsup.metasupplier.Component", {

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

			/* LS 17.03.2020 ho asteriscato perchè va in errore verificare
			var userModel = new sap.ui.model.json.JSONModel("/services/userapi/currentUser");
			sap.ui.getCore().setModel(userModel, "userapi");*/

			


		}
	});
});