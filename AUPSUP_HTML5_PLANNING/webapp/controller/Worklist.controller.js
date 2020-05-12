sap.ui.define([
	"it/aupsup/planning/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
], function (BaseController, JSONModel, MessageBox, MessageToast, Sorter, Filter, FilterOperator, Controller, Export, ExportTypeCSV) {
	"use strict";
	var that = undefined;
	Date.prototype.addDays = function (days) {
		var date = new Date(this.valueOf());
		date.setDate(date.getDate() + days);
		return date;
	};
	return BaseController.extend("it.aupsup.planning.controller.Worklist", {
		onInit: function () {
			that = this;

			that.getPurchaseOrganizations();
			that.getUserInfo();
			that.getPurchaseGroup();
			that.getMetasupplier();

			var filterOrd = {
				"ekorg": [],
				"lifnr": [],
				"langu": that.getLanguage()
			};

			var oModelFI = new JSONModel();
			oModelFI.setData(filterOrd);
			this.getView().setModel(oModelFI, "filterPlanningJSONModel");

			if (!this._oResponsivePopover) {

				var oModelFilters = new JSONModel();
				oModelFilters.setData({
					"element": ""
				});
				this._oResponsivePopover = sap.ui.xmlfragment("it.aupsup.planning.fragments.FilterSorter", this);
				this._oResponsivePopover.setModel(oModelFilters, "filterPlanningJSONModel");
			}

			var oTable = this.getView().byId("OrderHeadersTable");
			oTable.addEventDelegate({
				onAfterRendering: function () {
					//GESTIONE SAP.UI.TABLE.TABLE
					var oHeader = this.$().find(".sapUiTableHeaderRow");
					for (var i = 0; i < oHeader.length; i++) {
						var oCells = oHeader[i];
						for (var j = 0; j < oCells.cells.length; j++) {
							var oID = oCells.cells[j].id;
							that.onClick(oID);
						}
					}
				}
			}, oTable);

			this.getView().setModel(sap.ui.getCore().getModel("userapi"), "userapi");

		},

		getPurchaseOrganizations: function () {

			var url = "/backend/Utils/UtilsManagement/GetPurchaseOrganizations";
			this.showBusyDialog();
			that.ajaxGet(url, function (oData) {
				that.hideBusyDialog();
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					var oComponent = that.getOwnerComponent();
					oComponent.setModel(oModel, "PurchaseOrganizationJSONModel");
				}
			});

		},

		onAfterRendering: function () {
			that.createWeekHeaderModel();
		},

		getPurchaseGroup: function () {
			var url = "/backend/Utils/UtilsManagement/GetPurchaseDoc";
			that.ajaxPost(url, {}, function (oData) {
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "PurchaseGroupJSONModel");
				}
			})
		},

		onClick: function (oID) {
			$('#' + oID).click(function (oEvent) { //Attach Table Header Element Event
				var oTarget = oEvent.currentTarget; //Get hold of Header Element
				var oView = that.getView();
				var res = oTarget.id.split("--");
				res = res[1];

				//	var oTable = oView.byId("OrderHeadersTable");
				//	var oModel = oTable.getModel().getProperty("/results"); //Get Hold of Table Model Values
				//	var oKeys = Object.keys(oModel[0]); //Get Hold of Model Keys to filter the value
				oView.getModel("PlanningJSONModel").setProperty("/bindingValue", res); //Save the key value to property
				that._oResponsivePopover.openBy(oTarget);
			});
		},

		onChangeMetasupplier: function (oEvent) {

			var selectedKeyArray = oEvent.oSource.getSelectedKeys();
			var metaIdlist = that.getModel("MetasupplierJSONModel").getData().results;
			var selectedMetaid = "";
			var lifnr = [];
			var slifnr = [];
			if (selectedKeyArray != undefined) {
				for (var i = 0; i < selectedKeyArray.length; i++) {
					if (metaIdlist != undefined) {
						selectedMetaid = metaIdlist.find(x => x.METAID === selectedKeyArray[i]);
						if (selectedMetaid !== undefined) {
							if (selectedMetaid.LIFNR != undefined) {
								for (var j = 0; j < selectedMetaid.LIFNR.length; j++) {
									lifnr.push(selectedMetaid.LIFNR[j]);
									slifnr.push(selectedMetaid.LIFNR[j].LIFNR);
								}
							}
						}
					}
				}
			}

			var oModelLF = new JSONModel();
			oModelLF.setData(lifnr);
			that.getView().setModel(oModelLF, "lifnrJSONModel");
			that.getModel("filterPlanningJSONModel").getData().lifnr = slifnr;

		},
		onChangeMetalifnr: function (oEvent) {
			var selectedKeyArray = oEvent.oSource.getSelectedKeys();
			var lifnrList = that.getModel("lifnrJSONModel").getData();
			var selectedLifnr = "";
			var lifnr = [];
			if (selectedKeyArray != undefined) {
				for (var i = 0; i < selectedKeyArray.length; i++) {
					if (lifnrList != undefined) {
						selectedLifnr = lifnrList.find(x => x.LIFNR === selectedKeyArray[i]);
						if (selectedLifnr !== undefined) {
							if (selectedLifnr.LIFNR != undefined) {
								lifnr.push(selectedLifnr.LIFNR);
							}
						}
					}
				}
			}
			if (selectedKeyArray.length === 0) {
				for (var j = 0; j < lifnrList.length; j++) {
					lifnr.push(lifnrList[j].LIFNR);
				}
			}
			that.getModel("filterPlanningJSONModel").getData().lifnr = lifnr;
		},

		getMetasupplier: function () {

			var url = "/backend/Utils/UtilsManagement/GetMetasupplierList";
			that.ajaxGet(url, function (oData) {

				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "MetasupplierJSONModel");
					//Valorizzazione Campo Lifnr per Servizio
					var oLifnr = that.getModel("filterPlanningJSONModel");
					oLifnr = oData.results;
					var oModelLF = new JSONModel();
					oModelLF.setData(oLifnr);
					that.getView().setModel(oModelLF, "filterPlanningJSONModel");
				}
			})
		},

		onChange: function (oEvent) {
			var oValue = oEvent.getParameter("value");
			var oMultipleValues = oValue.split(",");
			var oTable = this.getView().byId("OrderHeadersTable");
			var oBindingPath = this.getView().getModel("PlanningJSONModel").getProperty("/bindingValue"); //Get Hold of Model Key value that was saved
			var aFilters = [];
			for (var i = 0; i < oMultipleValues.length; i++) {
				var oFilter = new Filter(oBindingPath, "Contains", oMultipleValues[i]);
				aFilters.push(oFilter);
			}
			var oItems = oTable.getBinding("rows");
			oItems.filter(aFilters, "Application");

			this._oResponsivePopover.setModel(new JSONModel({
				"element": ""
			}), "filterElementJSONModel");
			this.getView().byId("headerFilterButton").setVisible(true);
			this._oResponsivePopover.close();
		},

		onAscending: function () {
			var oTable = this.getView().byId("OrderHeadersTable");
			var oItems = oTable.getBinding("rows");
			var oBindingPath = this.getView().getModel("PlanningJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onDescending: function () {
			var oTable = this.getView().byId("OrderHeadersTable");
			var oItems = oTable.getBinding("rows");
			var oBindingPath = this.getView().getModel("PlanningJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath, true);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onClearFilter: function () {
			var oTable = this.getView().byId("OrderHeadersTable");
			var aFilters = [];
			var oItems = oTable.getBinding("rows");
			oItems.filter(aFilters, "Application");
			this.getView().byId("headerFilterButton").setVisible(false);
		},

		onGlobalFilter: function (oEvent) {

			var aTableSearchState = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				aTableSearchState = [new Filter("TXZ01", FilterOperator.Contains, sQuery)];
			}
			this._applySearch(aTableSearchState);

		},

		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("OrderHeadersTable"),
				oViewModel = this.getModel("PlanningJSONModel");
			oTable.getBinding("rows").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("noData"));
			}
		},

		handleMatnr: function () {
			if (!that.oSearchMatnrDialog) {
				that.oSearchMatnrDialog = sap.ui.xmlfragment("it.aupsup.planning.fragments.SearchMatnr", that);
				that.getView().addDependent(that.oSearchMatnrDialog);
			}
			that.oSearchMatnrDialog.open();
			var oTable = sap.ui.getCore().byId("idMatnrTable");
			var oItems = oTable.getItems();

			var body = {
				"matnr": "",
				"maktx": ""
			};
			var oModelMT = new JSONModel();
			oModelMT.setData(body);
			this.getView().setModel(oModelMT, "MatnrSearchJSONModel");
			this.getView().getModel("MatnrJSONModel").setData(null);

		},

		onCloseSearchMatnr: function () {
			if (this.oSearchMatnrDialog) {
				this.oSearchMatnrDialog.close();
				this.oSearchMatnrDialog.destroy();
				this.oSearchMatnrDialog = undefined;
			}
		},

		onSearchMatnr: function () {
			var url = "/backend/Utils/UtilsManagement/SearchMaterial";
			var body = this.getView().getModel("MatnrSearchJSONModel").getData();
			this.showBusyDialog();
			that.ajaxPost(url, body, function (oData) {
				that.hideBusyDialog();
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "MatnrJSONModel");
				}
			})
		},

		onConfirmMatnr: function () {
			var oTable = sap.ui.getCore().byId("idMatnrTable");
			var aIndices = oTable.indexOfItem(oTable.getSelectedItem());
			var selectedMatnr = [];
			var selectedMatnrDesc = "";
			if (aIndices.length < 1) {
				MessageToast.show(that.getResourceBundle().getText("ERR_Selection_Row"));
				return;
			}
			var oItems = oTable.getSelectedItems();
			for (var i = 0; i < oItems.length; i++) {
				var oPositionModel = that.getModel("MatnrJSONModel").getProperty(oItems[i].getBindingContextPath());
				selectedMatnrDesc = oPositionModel.DESCR + ";" + selectedMatnrDesc;
				selectedMatnr.push(
					oPositionModel.CODE
				);
			}

			that.getModel("filterPlanningJSONModel").getData().matnr = selectedMatnr;
			that.getModel("filterPlanningJSONModel").getData().MatnrDesc = selectedMatnrDesc;

			this.oSearchMatnrDialog.close();
			this.oSearchMatnrDialog.destroy();
			this.oSearchMatnrDialog = undefined;
			that.getModel("filterPlanningJSONModel").refresh();
		},

		onSearchOrders: function () {
			var url = "/backend/PlanningManagement/GetPlanning";
			var body = that.getModel("filterPlanningJSONModel").getData();

			this.showBusyDialog();
			that.ajaxPost(url, body, function (oData) {
				that.hideBusyDialog();
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "PlanningJSONModel");
					that.getView().byId("OrderHeadersTable").setModel(oModel);
				}
				var oTable = that.getModel("PlanningJSONModel").getData().results;
			})

		},
		onClearFilters: function () {
			if (that.getModel("filterPlanningJSONModel") !== undefined && that.getModel("filterPlanningJSONModel").getData() !== undefined) {
				that.getModel("filterPlanningJSONModel").getData().MatnrDesc = '';
				that.getModel("filterPlanningJSONModel").getData().matnr = '';
				that.getModel("filterPlanningJSONModel").getData().ebeln = "";
				that.getModel("filterPlanningJSONModel").getData().ekorg = '';
				that.getModel("filterPlanningJSONModel").getData().ekgrp = '';
				that.getModel("filterPlanningJSONModel").getData().lifnr = '';
			}
			if (that.getModel("filterPlanningJSONModel") !== undefined)
				that.getModel("filterPlanningJSONModel").refresh();
			if (that.getModel("lifnrJSONModel") !== undefined && that.getModel("lifnrJSONModel").getData() !== undefined) {
				that.getModel("lifnrJSONModel").setData(null);
			}
			if (that.getModel("lifnrJSONModel") !== undefined)
				that.getModel("lifnrJSONModel").refresh();
			if (that.getModel("MetasupplierJSONModel") !== undefined && that.getModel("MetasupplierJSONModel").getData() !== undefined) {
				that.getModel("MetasupplierJSONModel").getData().METAID = '';
			}
			if (that.getModel("MetasupplierJSONModel") !== undefined)
				that.getModel("MetasupplierJSONModel").refresh();
		},

		getFormattedDate: function (fullDate) {
			var dd = String(fullDate.getDate()).padStart(2, '0');
			var mm = String(fullDate.getMonth() + 1).padStart(2, '0'); //January is 0!
			var yyyy = fullDate.getFullYear();

			fullDate = dd + '/' + mm + '/' + yyyy;
			return fullDate;
		},

		createWeekHeaderModel: function () {
			var today = new Date();
			var todayDate = that.getFormattedDate(today);

			var more6 = today.addDays(6);
			var more6_formatted = that.getFormattedDate(more6);
			var singleDay = more6.addDays(1);
			var singleDayMore6Formatted = that.getFormattedDate(singleDay);
			var more12 = singleDay.addDays(6);
			var more12_formatted = that.getFormattedDate(more12);
			singleDay = more12.addDays(1);
			var singleDayMore12Formatted = that.getFormattedDate(singleDay);
			var more18 = singleDay.addDays(6);
			var more18_formatted = that.getFormattedDate(more18);
			singleDay = more18.addDays(1);
			var singleDayMore18Formatted = that.getFormattedDate(singleDay);
			var more24 = singleDay.addDays(6);
			var more24_formatted = that.getFormattedDate(more24);
			singleDay = more24.addDays(1);

			var singleDayMore24Formatted = that.getFormattedDate(singleDay);

			singleDay = more24.addDays(1);
			var mn1 = singleDay.addDays(30);
			var mn1_formatted = that.getFormattedDate(mn1);
			var mn1_more1 = mn1.addDays(1);
			var mn1_more1_formatted = that.getFormattedDate(mn1_more1);
			singleDay = mn1.addDays(1);
			var mn2 = singleDay.addDays(30);
			var mn2_formatted = that.getFormattedDate(mn2);
			var mn2_more1 = mn2.addDays(1);
			var mn2_more1_formatted = that.getFormattedDate(mn2_more1);
			singleDay = mn2.addDays(1);
			var mn3 = singleDay.addDays(30);
			var mn3_formatted = that.getFormattedDate(mn3);
			var mn3_more1 = mn3.addDays(1);
			var mn3_more1_formatted = that.getFormattedDate(mn3_more1);
			singleDay = mn3.addDays(1);
			var mn4 = singleDay.addDays(30);
			var mn4_formatted = that.getFormattedDate(mn4);
			var mn4_more1 = mn4.addDays(1);
			var mn4_more1_formatted = that.getFormattedDate(mn4_more1);
			singleDay = mn4.addDays(1);
			var mn5 = singleDay.addDays(30);
			var mn5_formatted = that.getFormattedDate(mn5);
			// var d = new Date();
			// d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
			// d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
			// var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
			// var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
			// var cont = 0;
			var elem = {};
			// for (var i = parseInt(weekNo); i < 54; i++) {

			// 	var dates = that.getDateRangeOfWeek(i, d.getFullYear());
			// 	var key = "wk" + cont;
			// 	elem[key] = dates;
			// 	cont = cont + 1;
			// }

			elem.wk1 = todayDate + " - " + more6_formatted;
			elem.wk2 = singleDayMore6Formatted + " - " + more12_formatted;
			elem.wk3 = singleDayMore12Formatted + " - " + more18_formatted;
			elem.wk4 = singleDayMore18Formatted + " - " + more24_formatted;
			elem.mn1 = singleDayMore24Formatted + " - " + mn1_formatted;
			elem.mn2 = mn1_more1_formatted + " - " + mn2_formatted;
			elem.mn3 = mn2_more1_formatted + " - " + mn3_formatted;
			elem.mn4 = mn3_more1_formatted + " - " + mn4_formatted;
			elem.mn5 = mn4_more1_formatted + " - " + mn5_formatted;

			var oModel = new JSONModel();
			oModel.setData(elem);
			that.getView().setModel(oModel, "headersDateJSONModel");
		},

		onPressOrder: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getBindingContext("PlanningJSONModel").sPath;
			var mod = that.getModel("PlanningJSONModel").getProperty(oPath)

			var order = mod.EBELN;
			var pos = mod.EBELP;
			var BSTYP = mod.BSTYP;

			//Generate a  URL for the second application

			var url = '';
			if (BSTYP === 'F')
				url = "/cp.portal/site?#PurchaseOrders-Display?objectId={\"orderId\":\"" + order + "\",\"posNumber\":\"" + pos + "\"}";

			if (BSTYP === 'L')
				url = "/cp.portal/site?#SchedulingAgreement-Display?objectId={\"orderId\":\"" + order + "\",\"posNumber\":\"" + pos + "\"}";

			//Navigate to second app
			sap.m.URLHelper.redirect(url, true);
		},

		onExport: function (oEvent) {

			var dataS = this.getView().getModel("PlanningJSONModel");
			if (dataS === undefined || dataS.getData() === undefined || dataS.getData().results === undefined ||
				dataS.getData().results.length === 0) {
				MessageBox.error(that.getResourceBundle().getText("ERR_Export"));
				return;
			}

			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new ExportTypeCSV({
					separatorChar: ";"
				}),

				// Pass in the model created above
				models: this.getView().getModel("PlanningJSONModel"),

				// binding information for the rows aggregation
				rows: {
					path: "/results"
				},

				// column definitions with column name and binding info for the content

				columns: [{
					name: that.getResourceBundle().getText("NAME1"),
					template: {
						content: "{NAME1}"
					}
				}, {
					name: that.getResourceBundle().getText("MATNR"),
					template: {
						content: "{MATNR}"
					}
				}, {
					name: that.getResourceBundle().getText("TXZ01"),
					template: {
						content: "{TXZ01}"
					}
				}, {
					name: that.getResourceBundle().getText("IDNLF"),
					template: {
						content: "{IDNLF}"
					}
				}, {
					name: that.getResourceBundle().getText("MEINS"),
					template: {
						content: "{MEINS}"
					}
				}, {
					name: that.getResourceBundle().getText("KONNR"),
					template: {
						content: "{KONNR}"
					}
				}, {
					name: that.getResourceBundle().getText("KTPNR"),
					template: {
						content: "{KTPNR}"
					}
				}, {
					name: that.getResourceBundle().getText("EBELN") + ' - ' + that.getResourceBundle().getText("EBELP"),
					template: {
						content: "{EBELN} - {EBELP}"
					}
				}, {
					name: that.getResourceBundle().getText("TYPE"),
					template: {
						content: "{= ${BSTYP} === 'L' ? 'Piano di consegna' : ${BSTYP} === 'F' ? 'Ordine' : 'Previsionale' }"
					}
				}, {
					name: that.getResourceBundle().getText("OPENCLOSE"),
					template: {
						content: "{= ${BSTYP} === 'L' ? 'A' : ${BSTYP} === 'F' ? 'C' : 'R' }"
					}
				}, {
					name: that.getResourceBundle().getText("WERKS"),
					template: {
						content: "{WERKS}"
					}
				}, {
					name: that.getResourceBundle().getText("ZQUANTITA"),
					template: {
						content: "{ZQUANTITA}"
					}
				}, {
					name: that.getResourceBundle().getText("PREGRESSO"),
					template: {
						content: "{PREGRESSO}"
					}
				}, {
					name: that.getView().getModel("headersDateJSONModel").getData().wk1,
					template: {
						content: "{SOMMA_WK1}"
					}
				}, {
					name: that.getView().getModel("headersDateJSONModel").getData().wk2,
					template: {
						content: "{SOMMA_WK2}"
					}
				}, {
					name: that.getView().getModel("headersDateJSONModel").getData().wk3,
					template: {
						content: "{SOMMA_WK3}"
					}
				}, {
					name: that.getView().getModel("headersDateJSONModel").getData().wk4,
					template: {
						content: "{SOMMA_WK4}"
					}
				}, {
					name: that.getView().getModel("headersDateJSONModel").getData().mn1,
					template: {
						content: "{SOMMA_MN1}"
					}
				}, {
					name: that.getView().getModel("headersDateJSONModel").getData().mn2,
					template: {
						content: "{SOMMA_MN2}"
					}
				}, {
					name: that.getView().getModel("headersDateJSONModel").getData().mn3,
					template: {
						content: "{SOMMA_MN3}"
					}
				}, {
					name: that.getView().getModel("headersDateJSONModel").getData().mn4,
					template: {
						content: "{SOMMA_MN4}"
					}
				}, {
					name: that.getView().getModel("headersDateJSONModel").getData().mn5,
					template: {
						content: "{SOMMA_MN5}"
					}
				}]
			});

			// download exported file
			oExport.saveFile().catch(function (oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		}
	});

});
