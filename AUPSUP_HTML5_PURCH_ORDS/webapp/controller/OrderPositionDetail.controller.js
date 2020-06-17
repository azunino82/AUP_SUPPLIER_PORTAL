sap.ui.define([
	"it/aupsup/purchords/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"it/aupsup/purchords/js/Date",
], function (BaseController, JSONModel, MessageBox, Filter, Sorter,Datef) {
	"use strict";

	var that = undefined;

	return BaseController.extend("it.aupsup.purchords.controller.OrderPositionDetail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf it.altea.portal.schedulingagreement.view.OrderPositionDetail
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

			// 	this._oResponsivePopover = sap.ui.xmlfragment("it.alteaup.supplier.portal.schedulingagreement.fragments.FilterSorter", this);
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
			try{
				datas = JSON.parse(datas)
			}catch(e){

			}
			
			that.loadObject(datas, function (oData) {
				that.hideBusyDialog();
				if (oData === null || oData === undefined) {} else {
					that._completeInit("Display", oData, function () {});
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
			
			var url = "/backend/SchedulingAgreementManagement/GetPianoConfermaDetail?I_EBELN=" +
			sObjectId.orderId + "&I_EBELP=" + sObjectId.posNumber + "&I_SPRAS=" + sObjectId.spras + "&I_UPDATE_DATA=" + sObjectId.isUpdateData;
			that.ajaxGet(url, function (oData) {
				if (oData === null || oData === undefined) {
					if (fCompletion !== undefined) {
						fCompletion();
					}
				} else {
					fCompletion(oData);
				}
			});
		},
	});

});