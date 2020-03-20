sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/odata/UpdateMethod"
], function (Controller, JSONModel, MessageBox, UpdateMethod) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var bGlobalBusyDialogIsShown = false;

	return Controller.extend("it.alteaup.supplier.portal.purchords.AUPSUP_HTML5_PURCH_ORDS.controller.BaseController", {
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

		ajaxPost: function (url, body, fCompletion) {

			jQuery.ajax({
				url: url,
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
		},

		ajaxPut: function (url, body, fCompletion) {

			jQuery.ajax({
				url: url,
				data: JSON.stringify(body),
				method: 'PUT',
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


			var url = "/backend/Utils/UtilsManagement/GetSYSID";
			this.ajaxGet(url, function (oData) {
				if (oData && oData.results && oData.results.length > 0) {
					var sysModel = new JSONModel({
						"SYSID": oData.results[0].SYSID
					});
					sap.ui.getCore().setModel(sysModel, "sysIdJSONModel");
				} else {
					return null;
				}
			});

		},

		getUserInfo: function () {
			var that = this;
			var url = "/backend/Utils/UtilsManagement/GetUserInfo";
			this.ajaxGet(url, function (oData) {
				if (oData) {
					var oModel = new JSONModel(oData);
					sap.ui.getCore().setModel(oModel, "userapi");

					var visibilityRoles = {
						isBuyer: oData.isBuyer,
						isSupplier: oData.isSupplier,
						isSupplierD: oData.isSupplierD,
						isAdministrator: oData.isAdministrator,
						isPlanner: oData.isPlanner
					};

					oModel = new JSONModel();
					oModel.setData(visibilityRoles);
					//sap.ui.getCore().setModel(oModel, "VisibilityJSONModel");
					that.getView().setModel(oModel, "VisibilityJSONModel");
				} else {
					return null;
				}
			});

		},
		pad_with_zeroes : function (number, length) {
			// aggiunge 000 davanti a striga
			var my_string = '' + number;
			while (my_string.length < length) {
				my_string = '0' + my_string;
			}
		
			return my_string;
		
		}


	});
});