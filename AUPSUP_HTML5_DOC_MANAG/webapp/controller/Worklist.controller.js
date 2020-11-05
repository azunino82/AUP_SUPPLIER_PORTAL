sap.ui.define([
	"it/aupsup/docmanagement/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"it/aupsup/docmanagement/js/Date",
	"it/aupsup/docmanagement/js/formatter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/PDFViewer",
	"it/aupsup/docmanagement/js/moment",
], function (BaseController, Filter, FilterOperator, JSONModel, MessageBox, MessageToast, Sorter, DateF, Formatter, Export, ExportTypeCSV,
	PDFViewer, Moment) {
	"use strict";
	var that;
	Date.prototype.addDays = function (days) {
		var date = new Date(this.valueOf());
		date.setDate(date.getDate() + days);
		return date;
	};
	Date.prototype.subDays = function (days) {
		var date = new Date(this.valueOf());
		date.setDate(date.getDate() - days);
		return date;
	};
	return BaseController.extend("it.aupsup.docmanagement.controller.Worklist", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf it.alteaup.supplier.portal.inboundDelivery.inboundDelivery.view.Worklist
		 */
		onInit: function () {
			that = this;

			that.getMetasupplier();

			var versionState = [{
				"code": "A",
				"descr": that.getResourceBundle().getText("attivo")
			}, {
				"code": "I",
				"descr": that.getResourceBundle().getText("inattivo")
			}]

			var oModel = new JSONModel();
			oModel.setData(versionState);
			that.getView().setModel(oModel, "versionStateJSONModel");

			var doc = [{
				"code": "DUR",
				"descr": that.getResourceBundle().getText("DUR")
			}, {
				"code": "COND",
				"descr": that.getResourceBundle().getText("COND")
			}, {
				"code": "REI",
				"descr": that.getResourceBundle().getText("REI")
			}, {
				"code": "LMI",
				"descr": that.getResourceBundle().getText("LMI")
			}, {
				"code": "VAL",
				"descr": that.getResourceBundle().getText("VAL")
			}]

			var oModel = new JSONModel();
			oModel.setData(doc);
			that.getView().setModel(oModel, "docTypeJSONModel");

			var docTipologia = [{
				"code": "OA",
				"descr": that.getResourceBundle().getText("OrdiniAperti")
			}, {
				"code": "NC",
				"descr": that.getResourceBundle().getText("NonConformita")
			}, {
				"code": "O",
				"descr": that.getResourceBundle().getText("Offerte")
			}, {
				"code": "G",
				"descr": that.getResourceBundle().getText("Generale")
			}, {
				"code": "RFQ",
				"descr": that.getResourceBundle().getText("RFQ")
			}]

			oModel = new JSONModel();
			oModel.setData(docTipologia);
			that.getView().setModel(oModel, "docTipologiaJSONModel");

			var filterModel = {
				"lifnr": [],
				"docType": [],
				"docTipology": [],
				"versionState": [],
				"version": false
			};

			oModel = new JSONModel();
			oModel.setData(filterModel);
			this.getView().setModel(oModel, "filterDocumentJSONModel");


		},

		onClick: function (oID) {
			$('#' + oID).click(function (oEvent) { //Attach Table Header Element Event
				var oTarget = oEvent.currentTarget; //Get hold of Header Element
				var oView = that.getView();
				var res = oTarget.id.split("--");
				res = res[1];

				oView.getModel("filterDocumentJSONModel").setProperty("/bindingValue", res); //Save the key value to property
				that._oResponsivePopover.openBy(oTarget);
			});
		},

		onChange: function (oEvent) {
			var oValue = oEvent.getParameter("value");
			var oMultipleValues = oValue.split(",");
			var oTable = this.getView().byId("InboundDelivHeadersTable");
			var oBindingPath = this.getView().getModel("filterDocumentJSONModel").getProperty("/bindingValue"); //Get Hold of Model Key value that was saved
			var aFilters = [];
			for (var i = 0; i < oMultipleValues.length; i++) {
				var oFilter = new Filter(oBindingPath, "Contains", oMultipleValues[i]);
				aFilters.push(oFilter);
			}
			var oItems = oTable.getBinding("items");
			oItems.filter(aFilters, "Application");

			this._oResponsivePopover.setModel(new JSONModel({
				"element": ""
			}), "filterDocumentJSONModel");
			this.getView().byId("headerFilterButton").setVisible(true);

			this._oResponsivePopover.close();
		},

		onAscending: function () {
			var oTable = this.getView().byId("InboundDelivHeadersTable");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.getView().getModel("filterDocumentJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onDescending: function () {
			var oTable = this.getView().byId("InboundDelivHeadersTable");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.getView().getModel("filterDocumentJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath, true);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onSetDocumentColor: function (oValue) {

			var processDoc;
			if (that.getView().getModel("DocumentJSONModel") !== undefined && that.getView().getModel("DocumentJSONModel").getData() !== undefined && that.getView().getModel("DocumentJSONModel").getData().ProcessDoc !== undefined) {
				processDoc = that.getView().getModel("DocumentJSONModel").getData().ProcessDoc
				for (let index = 0; index < processDoc.results.length; index++) {
					const element = processDoc.results[index];
					if(element.OBJECT === oValue && element.TO_UPLOAD > 0 && element.EXP_DATE !== ''){
						return "Indication02";
					}else{
						if(element.OBJECT === oValue && element.TO_UPLOAD > 0 && element.EXP_DATE === ''){
							return "Indication03";
						}
					}
					
				}
			}
		},

		onRowSelectionProcessItem: function (oEvent) {

			var oSelectedItem = oEvent.getParameter("listItem");
			var oPath = oSelectedItem.oBindingContexts.DocumentJSONModel.sPath;
			var selctedRowdata = that.getView().byId("processDocumentTable").getModel("DocumentJSONModel").getProperty(oPath);

			var data = {
				"results": [{
						"OBJECT": "OA – 4500006548",
						"DOC_TYPE": "TMA",
						"DOC_TYPE_DESCR": "",
						"VERSION": "00",
						"CREATION_DATE": "20160701",
						"DOWNLOAD_DATE": "20200210",
						"VERSION_STATE": "I",
						"WORKFLOW": "",
						"UPLOAD_DATE": "",
						"UPLOAD_EXP_DATE": "",
						"END_DATE_DOC": "",
						"IS_UPLOAD": false,
						"IS_DOWNLOAD": true
					},
					{
						"OBJECT": "OA – 4500006548",
						"DOC_TYPE": "TMA",
						"DOC_TYPE_DESCR": "",
						"VERSION": "01",
						"CREATION_DATE": "20200301",
						"DOWNLOAD_DATE": "20200308",
						"VERSION_STATE": "A",
						"WORKFLOW": "",
						"UPLOAD_DATE": "",
						"UPLOAD_EXP_DATE": "",
						"END_DATE_DOC": "",
						"IS_UPLOAD": false,
						"IS_DOWNLOAD": true
					},
					{
						"OBJECT": "OA – 4500006548",
						"DOC_TYPE": "OFF",
						"DOC_TYPE_DESCR": "",
						"VERSION": "",
						"CREATION_DATE": "",
						"DOWNLOAD_DATE": "",
						"VERSION_STATE": "",
						"WORKFLOW": "",
						"UPLOAD_DATE": "",
						"UPLOAD_EXP_DATE": "20201003",
						"END_DATE_DOC": "",
						"IS_UPLOAD": true,
						"IS_DOWNLOAD": false
					},
					{
						"OBJECT": "OA – 4500006548",
						"DOC_TYPE": "MAT",
						"DOC_TYPE_DESCR": "",
						"VERSION": "00",
						"CREATION_DATE": "20200301",
						"DOWNLOAD_DATE": "20200308",
						"VERSION_STATE": "A",
						"WORKFLOW": "",
						"UPLOAD_DATE": "",
						"UPLOAD_EXP_DATE": "",
						"END_DATE_DOC": "",
						"IS_UPLOAD": false,
						"IS_DOWNLOAD": true
					},
					{
						"OBJECT": "OA - 4500000678",
						"DOC_TYPE": "MAT",
						"DOC_TYPE_DESCR": "",
						"VERSION": "00",
						"CREATION_DATE": "20200301",
						"DOWNLOAD_DATE": "20200308",
						"VERSION_STATE": "A",
						"WORKFLOW": "",
						"UPLOAD_DATE": "",
						"UPLOAD_EXP_DATE": "",
						"END_DATE_DOC": "",
						"IS_UPLOAD": false,
						"IS_DOWNLOAD": true
					},
					{
						"OBJECT": "OA - 4500000678",
						"DOC_TYPE": "ALL",
						"DOC_TYPE_DESCR": "",
						"VERSION": "",
						"CREATION_DATE": "20200301",
						"DOWNLOAD_DATE": "20200308",
						"VERSION_STATE": "A",
						"WORKFLOW": "",
						"UPLOAD_DATE": "",
						"UPLOAD_EXP_DATE": "",
						"END_DATE_DOC": "",
						"IS_UPLOAD": false,
						"IS_DOWNLOAD": true
					},
					{
						"OBJECT": "NC - 200000010",
						"DOC_TYPE": "R8D",
						"DOC_TYPE_DESCR": "",
						"VERSION": "12",
						"CREATION_DATE": "20201028",
						"DOWNLOAD_DATE": "20201029",
						"VERSION_STATE": "A",
						"WORKFLOW": "",
						"UPLOAD_DATE": "",
						"UPLOAD_EXP_DATE": "",
						"END_DATE_DOC": "",
						"IS_UPLOAD": true,
						"IS_DOWNLOAD": true
					},
					{
						"OBJECT": "NC - 200000010",
						"DOC_TYPE": "ADD",
						"DOC_TYPE_DESCR": "",
						"VERSION": "",
						"CREATION_DATE": "20201030",
						"DOWNLOAD_DATE": "20201029",
						"VERSION_STATE": "",
						"WORKFLOW": "",
						"UPLOAD_DATE": "",
						"UPLOAD_EXP_DATE": "",
						"END_DATE_DOC": "",
						"IS_UPLOAD": false,
						"IS_DOWNLOAD": true
					}
				]
			};

			var oModel = new JSONModel();
			oModel.setData(data);
			that.getView().setModel(oModel, "DocumentDetailJSONModel");

			if (!that.documentDetailFragment) {
				that.documentDetailFragment = sap.ui.xmlfragment("it.aupsup.docmanagement.fragments.DocumentDetails", that);
				that.getView().addDependent(that.documentDetailFragment);
			}

			that.documentDetailFragment.open();

			var oFilters = []

			oFilters.push(new Filter("OBJECT", sap.ui.model.FilterOperator.Contains, selctedRowdata.OBJECT));

			var oTable = sap.ui.getCore().byId("DocumentDetailTable");
			var oBinding = oTable.getBinding("items");
			var filterObj = new Filter(oFilters, true);
			oBinding.filter(filterObj);

		},

		onClearFilter: function () {
			var oTable = this.getView().byId("InboundDelivHeadersTable");
			var aFilters = [];
			var oItems = oTable.getBinding("items");
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
			var oTable = this.byId("InboundDelivHeadersTable"),
				oViewModel = this.getModel("filterDocumentJSONModel");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("noData"));
			}
		},

		onSearch: function () {

			var data = {
				"GeneralDoc": {
					"results": [{
							"OBJECT": "G",
							"DOC_TYPE": "DUR",
							"DOC_TYPE_DESCR": "",
							"VERSION": "",
							"CREATION_DATE": "",
							"DOWNLOAD_DATE": "",
							"VERSION_STATE": "A",
							"WORKFLOW": "IA",
							"UPLOAD_DATE": "20201006",
							"UPLOAD_EXP_DATE": "20201005",
							"END_DATE_DOC": "20201231",
							"IS_UPLOAD": true,
							"IS_DOWNLOAD": false
						},
						{
							"OBJECT": "G",
							"DOC_TYPE": "COND",
							"DOC_TYPE_DESCR": "",
							"VERSION": "00",
							"CREATION_DATE": "20190912",
							"DOWNLOAD_DATE": "20200917",
							"VERSION_STATE": "I",
							"WORKFLOW": "AP",
							"UPLOAD_DATE": "20191010",
							"UPLOAD_EXP_DATE": "20201005",
							"END_DATE_DOC": "",
							"IS_UPLOAD": true,
							"IS_DOWNLOAD": true
						},
						{
							"OBJECT": "G",
							"DOC_TYPE": "COND",
							"DOC_TYPE_DESCR": "",
							"VERSION": "01",
							"CREATION_DATE": "20201010",
							"DOWNLOAD_DATE": "",
							"VERSION_STATE": "A",
							"WORKFLOW": "",
							"UPLOAD_DATE": "20191010",
							"UPLOAD_EXP_DATE": "20201212",
							"END_DATE_DOC": "",
							"IS_UPLOAD": true,
							"IS_DOWNLOAD": true
						},
						{
							"OBJECT": "G",
							"DOC_TYPE": "REI",
							"DOC_TYPE_DESCR": "",
							"VERSION": "",
							"CREATION_DATE": "",
							"DOWNLOAD_DATE": "",
							"VERSION_STATE": "A",
							"WORKFLOW": "AP",
							"UPLOAD_DATE": "20191001",
							"UPLOAD_EXP_DATE": "",
							"END_DATE_DOC": "20201231",
							"IS_UPLOAD": true,
							"IS_DOWNLOAD": false
						},
						{
							"OBJECT": "G",
							"DOC_TYPE": "LMI",
							"DOC_TYPE_DESCR": "",
							"VERSION": "",
							"CREATION_DATE": "",
							"DOWNLOAD_DATE": "",
							"VERSION_STATE": "A",
							"WORKFLOW": "RF",
							"UPLOAD_DATE": "20201003",
							"UPLOAD_EXP_DATE": "",
							"END_DATE_DOC": "",
							"IS_UPLOAD": true,
							"IS_DOWNLOAD": false
						},
						{
							"OBJECT": "G",
							"DOC_TYPE": "VAL",
							"DOC_TYPE_DESCR": "",
							"VERSION": "",
							"CREATION_DATE": "",
							"DOWNLOAD_DATE": "",
							"VERSION_STATE": "A",
							"WORKFLOW": "",
							"UPLOAD_DATE": "",
							"UPLOAD_EXP_DATE": "",
							"END_DATE_DOC": "",
							"IS_UPLOAD": false,
							"IS_DOWNLOAD": true
						}
					]
				},
				"ProcessDoc": {
					"results": [{
						"OBJECT": "OA – 4500006548",
						"TO_READ": 0,
						"READ": 3,
						"TO_UPLOAD": 1,
						"UPLOADED": 0,
						"EXP_DATE": "20200310"
					}, {
						"OBJECT": "OA - 4500000678",
						"TO_READ": 2,
						"READ": 2,
						"TO_UPLOAD": 0,
						"UPLOADED": 0,
						"EXP_DATE": ""
					}, {
						"OBJECT": "NC - 200000010",
						"TO_READ": 2,
						"READ": 2,
						"TO_UPLOAD": 1,
						"UPLOADED": 0,
						"EXP_DATE": ""
					}]
				}
			};

			var oFilters = []
			var oFiltersDocType = []
			var oFiltersProcess = []
			var filtri = this.getView().getModel("filterDocumentJSONModel").getData();
			var outArr = []
			if (filtri.version) {
				for (let index = 0; index < data.GeneralDoc.results.length; index++) {
					const element = data.GeneralDoc.results[index];
					var trovato = false
					var exitElement
					var indice = 0;
					for (let i = 0; i < outArr.length; i++) {
						exitElement = outArr[i];
						if (exitElement.DOC_TYPE === element.DOC_TYPE) {
							trovato = true
							indice = i
							break
						}
					}
					if (trovato) {
						if (moment(exitElement.CREATION_DATE, "YYYYMMDD")._d < moment(element.CREATION_DATE, "YYYYMMDD")._d) {
							outArr.splice(indice, 1);
							outArr.push(element)
						}
					} else {
						outArr.push(element)
					}
				}
			}

			var oModel = new JSONModel();

			if (outArr.length > 0) {
				data.GeneralDoc.results = outArr
			}
			oModel.setData(data);
			that.getView().setModel(oModel, "DocumentJSONModel");

			if (filtri.versionState !== null && filtri.versionState.length > 0) {
				filtri.versionState.forEach(element => {
					oFilters.push(new Filter("VERSION_STATE", sap.ui.model.FilterOperator.Contains, element));
				});
			}
			if (filtri.docType !== null && filtri.docType.length > 0) {
				filtri.docType.forEach(element => {
					oFiltersDocType.push(new Filter("DOC_TYPE", sap.ui.model.FilterOperator.Contains, element));
				});
			}
			if (filtri.docTipology !== null && filtri.docTipology.length > 0) {
				filtri.docTipology.forEach(element => {
					oFilters.push(new Filter("OBJECT", sap.ui.model.FilterOperator.Contains, element, undefined, true));
					oFiltersProcess.push(new Filter("OBJECT", sap.ui.model.FilterOperator.Contains, element, undefined, true));
				});
			}

			if (oFilters.length > 0) {
				var oTable = this.getView().byId("generalDocTable");
				var oBinding = oTable.getBinding("items");
				oBinding.filter(new Filter({
					filters: oFilters,
					and: true,
				}), sap.ui.model.FilterType.Application);

				oBinding.filter(new Filter({
					filters: oFiltersDocType,
					and: false,
				}), sap.ui.model.FilterType.Application);

				this.getView().byId("processDocumentTable").getBinding("items").filter(new Filter({
					filters: oFiltersProcess,
					and: false,
				}), sap.ui.model.FilterType.Application);

			}

		},

		getMetasupplier: function () {
			var url = "/backend/Utils/UtilsManagement/GetMetasupplierList";
			that.ajaxGet(url, function (oData) {

				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "MetasupplierJSONModel");
					//Valorizzazione Campo Lifnr per Servizio
					var oLifnr = that.getModel("filterDocumentJSONModel");
					oLifnr = oData.results;
					var oModelLF = new JSONModel();
					oModelLF.setData(oLifnr);
					that.getView().setModel(oModelLF, "filterDocumentJSONModel");
				}
			})
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
			that.getModel("filterDocumentJSONModel").getData().lifnr = slifnr;

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
			that.getModel("filterDocumentJSONModel").getData().lifnr = lifnr;
		},

		handleSupplier: function () {

			if (!that.oSearchSupplierDialog) {
				that.oSearchSupplierDialog = sap.ui.xmlfragment("it.aupsup.inboundDelivery.fragments.SearchSupplier", that);
				that.getView().addDependent(that.oSearchSupplierDialog);
			}
			that.oSearchSupplierDialog.open();
			var oTable = sap.ui.getCore().byId("idSuppliersTable");
			var oItems = oTable.getItems();

			var selectedSupplier = that.getModel("filterDocumentJSONModel").getData().lifnr;
			var supplier = that.getModel("suppliersJSONModel");
			if (supplier !== undefined && supplier.getData() && supplier.getData().results) {
				for (var i = 0; i < supplier.getData().results.length; i++) {
					for (var j = 0; j < selectedSupplier.length; j++) {
						if (selectedSupplier[j].ELIFN === supplier.getData().results[i].LIFNR) {
							oItems[i].setSelected(true);
						}
					}
				}
			}

		},

		onCloseSearchSuppliers: function () {
			if (this.oSearchSupplierDialog) {
				this.oSearchSupplierDialog.close();
				this.oSearchSupplierDialog.destroy();
				this.oSearchSupplierDialog = undefined;
			}
		},

		onConfirmSuppliers: function () {
			var oTable = sap.ui.getCore().byId("idSuppliersTable");
			var aIndices = oTable.indexOfItem(oTable.getSelectedItem());
			var selectedSupplier = [];
			var selectedSupplierDesc = "";
			if (aIndices.length < 1) {
				MessageToast.show(that.getResourceBundle().getText("ERR_Selection_Row"));
				return;
			}
			var oItems = oTable.getSelectedItems();
			//aIndices.forEach(function (indexNumber) {
			for (var i = 0; i < oItems.length; i++) {
				var oPositionModel = that.getModel("suppliersJSONModel").getProperty(oItems[i].getBindingContextPath());
				selectedSupplierDesc = oPositionModel.NAME1 + ";" + selectedSupplierDesc;
				selectedSupplier.push(
					//	"ELIFN": 
					oPositionModel.LIFNR
				);
			}

			that.getModel("filterDocumentJSONModel").getData().lifnr = selectedSupplier;
			that.getModel("filterDocumentJSONModel").getData().lifnrDesc = selectedSupplierDesc;

			this.oSearchSupplierDialog.close();
			this.oSearchSupplierDialog.destroy();
			this.oSearchSupplierDialog = undefined;
			that.getModel("filterDocumentJSONModel").refresh();
		},
		onSearchSupplier: function () {
			// ricerca fornitori da popup

			var filtri =
				sap.ui.getCore().byId("ekorg").getSelectedKeys();

			var filterVar = "";
			var i = 0;

			$.each(filtri, function (key, value) {
				if (value !== "" && value !== undefined) {
					if (i > 0)
						filterVar = filterVar + " and ";
					filterVar = filterVar + "EKORG eq " + "'" + value + "'";
					i++;
				}
			});

			if (filterVar !== "") {
				filtri = {
					"$filter": filterVar
				};
			} else {
				filtri = "";
			}

			var url = "VendorListParameters(I_USERID='" + that.getCurrentUserId() + "',I_NAME1='" + sap.ui.getCore().byId("NAME1").getValue() +
				"',I_STCEG='" + sap.ui.getCore().byId("STCEG").getValue() + "')/Results";

			that.readObject("OrderManagementService", url, filtri, function (oData) {
				that.hideBusyDialog();
				if (oData === null || oData === undefined) {
					MessageBox.error(that.getResourceBundle().getText("noOrderFound"));
				} else {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "suppliersJSONModel");
					that.oSearchSupplierDialog.setModel(that.getView().getModel("suppliersJSONModel"));

				}

			});

		},

		onItemUpload: function () {

		},

		onClosedocumentDetailFragment: function (makeRefresh) {
			if (this.documentDetailFragment) {
				this.documentDetailFragment.close();
				this.documentDetailFragment.destroy();
				this.documentDetailFragment = undefined;
			}
		},

		onClearFilters: function () {
			if (that.getModel("filterDocumentJSONModel") !== undefined && that.getModel("filterDocumentJSONModel").getData() !==
				undefined) {
				that.getModel("filterDocumentJSONModel").getData().MatnrDesc = '';
				that.getModel("filterDocumentJSONModel").getData().ebeln = "";
				that.getModel("filterDocumentJSONModel").getData().lifnr = '';
				that.getModel("filterDocumentJSONModel").getData().ekorg = '';
				that.getModel("filterDocumentJSONModel").getData().werks = '';
				that.getModel("filterDocumentJSONModel").getData().dateFrom = null;
				that.getModel("filterDocumentJSONModel").getData().dateTo = null;
			}
			if (that.getModel("MetasupplierJSONModel") !== undefined && that.getModel("MetasupplierJSONModel").getData() !== undefined) {
				that.getModel("MetasupplierJSONModel").getData().METAID = '';
			}
			if (that.getModel("lifnrJSONModel") !== undefined && that.getModel("lifnrJSONModel").getData() !== undefined) {
				that.getModel("lifnrJSONModel").setData(null);
			}
			if (that.getModel("filterDocumentJSONModel") !== undefined)
				that.getModel("filterDocumentJSONModel").refresh();
			if (that.getModel("MetasupplierJSONModel") !== undefined)
				that.getModel("MetasupplierJSONModel").refresh();
			if (that.getModel("lifnrJSONModel") !== undefined)
				that.getModel("lifnrJSONModel").refresh();
		},

		onExport: function (oEvent) {

			var dataS = this.getView().getModel("filterDocumentJSONModel");
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
				models: this.getView().getModel("filterDocumentJSONModel"),

				// binding information for the rows aggregation
				rows: {
					path: "/results"
				},

				// column definitions with column name and binding info for the content

				columns: [{
					name: that.getResourceBundle().getText("EBELN"),
					template: {
						content: "{EBELN}"
					}
				}, {
					name: that.getResourceBundle().getText("EBELP"),
					template: {
						content: "{EBELP}"
					}
				}, {
					name: that.getResourceBundle().getText("ETENR"),
					template: {
						content: "{ETENR}"
					}
				}, {
					name: that.getResourceBundle().getText("TYPE"),
					template: {
						content: "{TYPE}"
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
					name: that.getResourceBundle().getText("WERKS"),
					template: {
						content: "{DESCR_WERKS}"
					}
				}, {
					name: that.getResourceBundle().getText("IDNLF"),
					template: {
						content: "{IDNLF}"
					}
				}, {
					name: that.getResourceBundle().getText("MENGE"),
					template: {
						content: "{MENGE}"
					}
				}, {
					name: that.getResourceBundle().getText("EINDT"),
					template: {
						content: "{EINDT}"
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