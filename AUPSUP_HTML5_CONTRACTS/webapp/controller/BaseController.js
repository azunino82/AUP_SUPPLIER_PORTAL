sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/odata/UpdateMethod"
], function (Controller, JSONModel, MessageBox, UpdateMethod) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var bGlobalBusyDialogIsShown = false;

	return Controller.extend("it.aupsup.contracts.controller.BaseController", {
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
					that.getView().setModel(sap.ui.getCore().getModel("userapi"), "userapi");
				} else {
					return null;
				}
			});

		},
		pad_with_zeroes: function (number, length) {
			// aggiunge 000 davanti a striga
			var my_string = '' + number;
			while (my_string.length < length) {
				my_string = '0' + my_string;
			}

			return my_string;

		},

		importFormatter: function (sValue) {
			if (sValue !== null && sValue !== undefined) {
				if (sValue.toString().includes('.000'))
					return sValue.toString().replace('.000', '')
				else
				if (sValue.toString().includes('.00'))
					return sValue.toString().replace('.00', '')
				else
					return sValue.toString().replace('.', ',')
			}
		},

		removeZeroBefore: function (sValue) {
			if (sValue !== undefined) {
				var n = 0
				for (var i = 0; i < sValue.length; i++) {
					if (sValue.charAt(i) !== '0') {
						n = i
						break
					}
				}
				return sValue.substring(n, sValue.length);
			}
			return sValue
		},

		sortJSONArrayByProperty: function (property) {
			return function (a, b) {
				if (a[property] > b[property])
					return 1;
				else if (a[property] < b[property])
					return -1;

				return 0;
			}
		},

		getLanguage: function () {
			if (sap.ui.getCore().getConfiguration().getLanguage() !== undefined && sap.ui.getCore().getConfiguration().getLanguage() === 'it') {
				return 'I';
			}
			if (sap.ui.getCore().getConfiguration().getLanguage() !== undefined && sap.ui.getCore().getConfiguration().getLanguage() === 'it-IT') {
				return 'I';
			}
			if (sap.ui.getCore().getConfiguration().getLanguage() !== undefined && sap.ui.getCore().getConfiguration().getLanguage() === 'en') {
				return 'E';
			}
			if (sap.ui.getCore().getConfiguration().getLanguage() !== undefined && sap.ui.getCore().getConfiguration().getLanguage() === 'en-EN') {
				return 'E';
			}
			if (sap.ui.getCore().getConfiguration().getLanguage() !== undefined && sap.ui.getCore().getConfiguration().getLanguage() === 'de') {
				return 'D';
			}
			return 'E'
		},

		convertDateToSAPDate: function (date) {
			if (date.includes("/")) {
				var d = new Date(date),
					month = '' + d.getDate(),
					day = '' + (d.getMonth() + 1),
					year = d.getFullYear();

				if (month.length < 2)
					month = '0' + month;
				if (day.length < 2)
					day = '0' + day;

				return year+month+day;
			}
			return date
		},

		getGlobalCustomizing: function () {

			var url = "/backend/CustomizingManagement/GetCustomizingGlobalValues?I_APPID=CONTRACTS";
			var that = this;
			this.ajaxGet(url, function (oData) {
				if (oData && oData.results && oData.results.length > 0) {
					// modifica DL - 26/04/2021 - costruisco object per biding view
					var object = new Object();
					var functionality = "";
					for(var i = 0; i < oData.results.length; i++){
						functionality = oData.results[0].FUNCTIONALITY;
						if(oData.results[0].ACTIVE === 'X'){
							object[functionality] = true;
						} else {
							object[functionality] = false;
						}
						//object[functionality] = oData.results[0].ACTIVE;
					}
					//var custModel = new JSONModel(oData);
					var custModel = new JSONModel(object);
					// modifica DL - 26/04/2021 - costruisco object per biding view - FINE					
					//sap.ui.getCore().setModel(custModel, "globalCustomizingJSONModel");
					that.getView().setModel(custModel, "globalCustomizingJSONModel");
				} else {
					var custModel = new JSONModel({'ORD_ACKN':false});
					that.getView().setModel(custModel, "globalCustomizingJSONModel");
				}
			});

		}


	});
});