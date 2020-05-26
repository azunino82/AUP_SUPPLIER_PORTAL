sap.ui.define([
	"it/aupsup/inboundDelivery/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"it/aupsup/inboundDelivery/js/Date",
	"it/aupsup/inboundDelivery/js/formatter",
], function (BaseController, JSONModel, MessageBox, Filter, Sorter, Date, Formatter) {
	"use strict";

	var that = undefined;

	return BaseController.extend("it.aupsup.inboundDelivery.controller.OrderPositionDetail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf it.altea.portal.inboundDelivery.view.OrderPositionDetail
		 */
		onInit: function () {
			that = this;
			that.getRouter().getRoute("detail").attachPatternMatched(that._onObjectMatched, that);

			// if (!this._oResponsivePopover) {

			// 	var oModelFilters = new JSONModel();
			// 	oModelFilters.setData({
			// 		"element": ""
			// 	});
			// 	// this.getView().setModel(oModelFilters, "filterElementJSONModel");

			// 	this._oResponsivePopover = sap.ui.xmlfragment("it.aupsup.inboundDelivery.fragments.FilterSorter", this);
			// 	this._oResponsivePopover.setModel(oModelFilters, "filterElementJSONModel");
			// }
			// var oTable = this.getView().byId("ShedulersTable");
			// oTable.addEventDelegate({
			// 	onAfterRendering: function () {
			// 		var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
			// 		for (var i = 0; i < oHeader.length; i++) {
			// 			var oID = oHeader[i].id;
			// 			that.onClick(oID, i + 1);
			// 		}
			// 	}
			// }, oTable);
		},

		// onClick: function (oID) {
		// 	$('#' + oID).click(function (oEvent) { //Attach Table Header Element Event
		// 		var oTarget = oEvent.currentTarget; //Get hold of Header Element
		// 		var oView = that.getView();
		// 		var res = oTarget.id.split("--");
		// 		res = res[1];

		// 		oView.getModel("OrderPrositionJSONModel").setProperty("/bindingValue", res); //Save the key value to property
		// 		that._oResponsivePopover.openBy(oTarget);
		// 	});
		//},

		// onChange: function (oEvent) {
		// 	var oValue = oEvent.getParameter("value");
		// 	var oMultipleValues = oValue.split(",");
		// 	var oTable = this.getView().byId("ShedulersTable");
		// 	var oBindingPath = this.getView().getModel("OrderPrositionJSONModel").getProperty("/bindingValue"); //Get Hold of Model Key value that was saved
		// 	var aFilters = [];
		// 	for (var i = 0; i < oMultipleValues.length; i++) {
		// 		var oFilter = new Filter(oBindingPath, "Contains", oMultipleValues[i]);
		// 		aFilters.push(oFilter);
		// 	}
		// 	var oItems = oTable.getBinding("items");
		// 	oItems.filter(aFilters, "Application");

		// 	this._oResponsivePopover.setModel(new JSONModel({
		// 		"element": ""
		// 	}), "filterElementJSONModel");
		// 	this.getView().byId("headerFilterButton").setVisible(true);

		// 	this._oResponsivePopover.close();
		// },

		// onAscending: function () {
		// 	var oTable = this.getView().byId("ShedulersTable");
		// 	var oItems = oTable.getBinding("items");
		// 	var oBindingPath = this.getView().getModel("OrderPrositionJSONModel").getProperty("/bindingValue");
		// 	var oSorter = new Sorter(oBindingPath);
		// 	oItems.sort(oSorter);
		// 	this._oResponsivePopover.close();
		// },

		// onDescending: function () {
		// 	var oTable = this.getView().byId("ShedulersTable");
		// 	var oItems = oTable.getBinding("items");
		// 	var oBindingPath = this.getView().getModel("OrderPrositionJSONModel").getProperty("/bindingValue");
		// 	var oSorter = new Sorter(oBindingPath, true);
		// 	oItems.sort(oSorter);
		// 	this._oResponsivePopover.close();
		// },

		// onClearFilter: function () {
		// 	var oTable = this.getView().byId("ShedulersTable");
		// 	var aFilters = [];
		// 	var oItems = oTable.getBinding("items");
		// 	oItems.filter(aFilters, "Application");

		// 	this.getView().byId("headerFilterButton").setVisible(false);
		// },

		_onObjectMatched: function (oControlEvent) {

			//	that.showBusyDialog();
			var sObjectId = oControlEvent.getParameter("arguments").datas;

			var datas = JSON.parse(sObjectId);

			that.loadObject(datas, function (oData) {
				that.hideBusyDialog();
				if (oData === null || oData === undefined || oData.results === undefined) {} else {
					that._completeInit("Display", oData.results, function () {});
				}
			});
		},

		_completeInit: function (sMode, oData, fCompletion) {

			var oModel = new JSONModel();
			oModel.setData(oData);
			that.getView().setModel(oModel, "OrderPrositionJSONModel");
			fCompletion();
		},

		loadObject: function (sObjectId, fCompletion) {

			var url = "/backend/InboundDeliveryManagement/GetSchedAndConf?I_EBELN=" + sObjectId.orderId + "&I_EBELP=" + sObjectId.posNumber;

			that.showBusyDialog();
			that.ajaxGet(url, function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (!oData) {
					MessageBox.error(that.getResourceBundle().getText("noOrderFound"));
					if (fCompletion !== undefined) {
						fCompletion();
					}
				} else {
					fCompletion(oData);
				}
			});

			/*			var url = "POSchedulers(SYSID='ASD',EBELN='" + sObjectId.orderId + "',EBELP='" + sObjectId.posNumber + "')";
						var parameters = {
							"$expand": "POItemConfirmations,POItemSchedulers"
						};

						that.readObject("OrderManagementService", url, parameters, function (oData) {
							if (oData === null || oData === undefined) {
								MessageBox.error(that.getResourceBundle().getText("noOrderFound"));
								if (fCompletion !== undefined) {
									fCompletion();
								}
							} else {
								fCompletion(oData);
							}

						});*/

		},
	});

});