sap.ui.define([
	"it/aupsup/schedulingagreement/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter"
], function (BaseController, JSONModel, MessageBox, Filter, Sorter) {
	"use strict";

	var that = undefined;

	return BaseController.extend("it.aupsup.schedulingagreement.controller.OrderPositionDetail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf it.altea.portal.schedulingagreement.view.OrderPositionDetail
		 */
		onInit: function () {
			that = this;
			that.getRouter().getRoute("detail").attachPatternMatched(that._onObjectMatched, that);

		},

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