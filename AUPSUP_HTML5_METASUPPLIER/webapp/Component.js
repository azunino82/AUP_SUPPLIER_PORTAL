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

			try {

				jQuery.sap.require("sap.ushell.cpv2.services.cloudServices.SiteService");

				if (sap.ushell && sap.ushell.cpv2 && sap.ushell.cpv2.services &&
					sap.ushell.cpv2.services.cloudServices &&
					sap.ushell.cpv2.services.cloudServices.SiteService) {

					var oLocalSiteService = sap.ushell.cpv2.services.cloudServices.SiteService();
					var oRoles = oLocalSiteService.siteModel.getProperty("/roles");
					var oProperty;
					for (oProperty in oRoles) {
						if (oRoles.hasOwnProperty(oProperty)) {

							console.log("(Component) Ruolo Funzionalita: " + oProperty.toString());

							if (oProperty.toString() !== "Everyone" && oProperty.toString() !== "Anonymous") {

								if (oProperty.toString().startsWith("Z_RL_BUYER")) {
									visibilityRoles.isBuyer = true;

								}

								if (oProperty.toString().startsWith("Z_RL_SUPPLIER")) {
									visibilityRoles.isSupplier = true;
								}

								var oModel = new JSONModel();
								oModel.setData(visibilityRoles);
								this.setModel(oModel, "VisibilityJSONModel");

								console.log("(Component) Ruolo: " + oProperty.toString() + " visibilityRoles: " + JSON.stringify(visibilityRoles));

							}

						}
					}

				}
			} catch (oException) {
				console.log("(Component) Ruolo CATCH");

				visibilityRoles.isBuyer = true;
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(visibilityRoles);
				this.setModel(oModel, "VisibilityJSONModel");
			}


		}
	});
});