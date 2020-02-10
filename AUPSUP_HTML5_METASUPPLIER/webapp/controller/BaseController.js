sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/odata/UpdateMethod"
], function (Controller, JSONModel, MessageBox, UpdateMethod) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var bGlobalBusyDialogIsShown = false;

	return Controller.extend("it.alteaup.supplier.portal.metasupplier.AUPSUP_HTML5_METASUPPLIER.controller.BaseController", {
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		getCurrentUserId: function () {
			var userID = "";
			if (sap.ui.getCore().getModel("userapi") === undefined || sap.ui.getCore().getModel("userapi").getData() === undefined || sap.ui.getCore()
				.getModel("userapi").getData().name === undefined) {
				userID = sap.ushell.Container.getService("UserInfo").getId();
			} else {
				userID = sap.ui.getCore().getModel("userapi").getData().name;
			}
			//	console.log("USERINF: " + JSON.stringify(sap.ushell.Container.getService("UserInfo")));
			return userID.toUpperCase();
		},

		addHistoryEntry: function () {
			var aHistoryEntries = [];

			return function (oEntry, bReset) {
				if (bReset) {
					aHistoryEntries = [];
				}

				var bInHistory = aHistoryEntries.some(function (entry) {
					return entry.intent === oEntry.intent;
				});

				if (!bInHistory) {
					aHistoryEntries.push(oEntry);
					this.getOwnerComponent().getService("ShellUIService").then(function (oService) {
						oService.setHierarchy(aHistoryEntries);
					});
				}
			};
		},

		getToken: function (tokenUrl, fCompletion) {
			// var url = "/SupplierPortal_OrdersManagement";
			var url = tokenUrl;
			jQuery.ajax({
				url: url,
				headers: {
					'x-csrf-token': 'fetch'
				},
				method: 'HEAD',
				body: '',
				contentType: 'application/json',
				success: function (data, textStatus, request) {
					fCompletion(request.getResponseHeader('x-csrf-token'));
				},
				error: function (request, textStatus, errorThrown) {
					fCompletion(request.getResponseHeader('x-csrf-token'));
				}
			});
		},

		ajaxPost: function (url, body, tokenUrl, fCompletion) {

			this.getToken(url, function (token) {

				jQuery.ajax({
					url: url,
					headers: {
						'x-csrf-token': token
					},
					data: JSON.stringify(body),
					method: 'POST',
					contentType: 'application/json',
					success: function (data) {
						if (data) {
							fCompletion(data);
						}
					},
					error: function (e) {
						try {
							if (e.responseText) {
								fCompletion(JSON.parse(e.responseText));
							} else
								fCompletion();
						} catch (err) {
							fCompletion({
								"errLog": e.responseText
							});
						}
					}
				});

			});

		},

		ajaxGet: function (url, fCompletion) {

			jQuery.ajax({
				url: url,
				method: 'GET',
				async: false,
				//				data: JSON.stringify(body),
				contentType: 'application/json',
				success: function (data) {
					if (data) {
						fCompletion(data);
					}
				},
				error: function (e) {
					fCompletion();
				}
			});

		},

		readObject: function (modelName, entity, parameters, fCompletion) {
			var that = this;
			var oModelData = that.getOwnerComponent().getModel(modelName);
			this.showBusyDialog();

			oModelData.read("/" + entity, {
				urlParameters: parameters,
				success: function (oData, oResponse) {
					//	that.sendLog(entity, "GET", oData, oResponse.statusCode, "", "I", "ECC1");
					fCompletion(oData);
				},
				error: function (oError) {
					that.sendLog(entity, "GET", oModelData.sServiceUrl, oError.statusCode, oError.responseText, "E", "ECC1");
					fCompletion();
				}
			});
		},

		sendLog: function (entity, method, jsonData, status, message, logType, sid) {
			var oModelData = this.getOwnerComponent().getModel("LogsService");

			var oEntry = {};
			oEntry.UUID = "1";
			oEntry.SERVICE_NAME = entity;
			oEntry.CALLED_METHOD = method;
			oEntry.DATA = JSON.stringify(jsonData);
			oEntry.STATUS = status;
			oEntry.MESSAGE = message;
			oEntry.LOG_TYPE = logType;
			oEntry.SID = sid;
			oEntry.USERID = this.getCurrentUserId();

			// oModelData.create("/Logs", oEntry, {
			// 	success: function (oData, oResponse) {

			// 	},
			// 	error: function (err) {

			// 	}
			//});

		},

		showBusyDialog: function () {
			oGlobalBusyDialog.setText(this.getResourceBundle().getText("loading"));
			oGlobalBusyDialog.open();
			bGlobalBusyDialogIsShown = true;
		},

		updateBusyDialog: function (sText) {
			if (bGlobalBusyDialogIsShown) {
				oGlobalBusyDialog.setText(sText);
			}
		},

		hideBusyDialog: function () {
			oGlobalBusyDialog.close();
			bGlobalBusyDialogIsShown = false;
		},

		getCurrentSYSID: function (fCompletion) {
			var oModelData = this.getOwnerComponent().getModel("CustomizingModel");

			oModelData.read("/BackendSystem", {
				success: function (oData, oResponse) {
					if (oData && oData.results && oData.results.length > 0) {
						var sysModel = new JSONModel({
							"SYSID": oData.results[0].SYSID
						});
						sap.ui.getCore().setModel(sysModel, "sysIdJSONModel");

					}
				},
				error: function (err) {
					return null;
				}
			});

		}

	});
});