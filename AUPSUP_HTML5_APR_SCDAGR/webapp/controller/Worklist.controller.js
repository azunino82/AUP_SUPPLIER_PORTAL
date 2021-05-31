sap.ui.define([
	"it/aupsup/aprvschdagr/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"it/aupsup/aprvschdagr/js/Date",
	"it/aupsup/aprvschdagr/js/formatter",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/m/library",
	"sap/ui/core/Fragment",
], function (BaseController, JSONModel, MessageBox, MessageToast, Sorter, Filter, FilterOperator, Export, ExportTypeCSV, Date, Formatter, Button, Dialog, Label, Text, TextArea, Library,Fragment) {
	"use strict";
	var that = undefined;
	var ButtonType = Library.ButtonType;
	return BaseController.extend("it.aupsup.aprvschdagr.controller.Worklist", {

		onInit: function () {
			that = this;
			that.getUserInfo();
			that.onGetOdataColumns();
			// questo meccanismo serve per cercare l'ordine dal link della mail. funziona solo sul portale pubblicato non in preview da webide
			var startupParams = undefined;
			if (that.getOwnerComponent().getComponentData() != undefined) {
				startupParams = that.getOwnerComponent().getComponentData().startupParameters;
			}

			if (startupParams != undefined && startupParams.objectId && startupParams.objectId[0]) {
				// cerco l'ordine passato nella url
				var url = "/Scheduling_Agreement/xsOdata/GetConfermeRifiuti.xsjs";

				that.getView().setModel(oModelFI, "filterJSONModel");
				var body = {
					"ebeln": startupParams.objectId[0],
					"lifnr": [],
					"matnr": [],
					"MatnrDesc": "",
					"ekorg": [],
					"ekgrp": [],
					"werks": [],
				};

				that.showBusyDialog();
				that.ajaxPost(url, body, "/Scheduling_Agreement", function (oData) { // funzione generica su BaseController
					that.hideBusyDialog();
					if (oData) {
						var oModel = new JSONModel();
						oModel.setData(oData);
						that.getView().setModel(oModel, "SchedAgreeJSONModel");
						//	that.getView().byId("rowNumber").setText(oData.results.length);
						that.getView().byId("OrderHeadersTable").setModel(oModel);
					}
					var oTable = that.getModel("SchedAgreeJSONModel").getData().results;
				});
			}

			that.getView().setModel(sap.ui.getCore().getModel("userapi"), "userapi");
			that.getCurrentSYSID();
			that.getPurchaseOrganizations();
			that.getMetasupplier();
			that.getPurchaseGroup();
			that.getPlants();
			that.getProfiliConferma();

			var filter = {
				"ebeln": "",
				"lifnr": [],
				"matnr": [],
				"MatnrDesc": "",
				"ekorg": [],
				"ekgrp": [],
				"werks": [],
			};
			var oModelFI = new JSONModel();
			oModelFI.setData(filter);
			that.getView().setModel(oModelFI, "filterJSONModel");

			if (!this._oResponsivePopover) {

				var oModelFilters = new JSONModel();
				oModelFilters.setData({
					"element": ""
				});
				this._oResponsivePopover = sap.ui.xmlfragment("it.aupsup.aprvschdagr.fragments.FilterSorter", this);
				this._oResponsivePopover.setModel(oModelFilters, "filterJSONModel");
			}

			var oTable = this.getView().byId("OrderHeadersTable");
			oTable.addEventDelegate({
				onAfterRendering: function () {
					var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
					for (var i = 0; i < oHeader.length; i++) {
						var oID = oHeader[i].id;
						that.onClick(oID);
					}
				}
			}, oTable);

			this.getView().setModel(sap.ui.getCore().getModel("VisibilityJSONModel"), "VisibilityJSONModel");

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

		onClick: function (oID) {
			$('#' + oID).click(function (oEvent) { //Attach Table Header Element Event
				var oTarget = oEvent.currentTarget; //Get hold of Header Element
				var oView = that.getView();
				var res = oTarget.id.split("--");
				res = res[1];

				//	var oTable = oView.byId("OrderHeadersTable");
				//	var oModel = oTable.getModel().getProperty("/results"); //Get Hold of Table Model Values
				//	var oKeys = Object.keys(oModel[0]); //Get Hold of Model Keys to filter the value
				if (res !== undefined) {
					oView.getModel("SchedAgreeJSONModel").setProperty("/bindingValue", res); //Save the key value to property
					that._oResponsivePopover.openBy(oTarget);
				}
			});
		},

		onChange: function (oEvent) {
			var oValue = oEvent.getParameter("value");
			var oMultipleValues = oValue.split(",");
			var oTable = this.getView().byId("OrderHeadersTable");
			var oBindingPath = this.getView().getModel("SchedAgreeJSONModel").getProperty("/bindingValue"); //Get Hold of Model Key value that was saved
			var aFilters = [];
			for (var i = 0; i < oMultipleValues.length; i++) {
				var oFilter = new Filter(oBindingPath, "Contains", oMultipleValues[i]);
				aFilters.push(oFilter);
			}
			var oItems = oTable.getBinding("items");
			oItems.filter(aFilters, "Application");

			this._oResponsivePopover.setModel(new JSONModel({
				"element": ""
			}), "filterElementJSONModel");
			this.getView().byId("headerFilterButton").setVisible(true);
			this._oResponsivePopover.close();
		},

		onAscending: function () {
			var oTable = this.getView().byId("OrderHeadersTable");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.getView().getModel("SchedAgreeJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onDescending: function () {
			var oTable = this.getView().byId("OrderHeadersTable");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.getView().getModel("SchedAgreeJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath, true);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onClearFilter: function () {
			var oTable = this.getView().byId("OrderHeadersTable");
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
			var oTable = this.byId("OrderHeadersTable"),
				oViewModel = this.getModel("SchedAgreeJSONModel");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("noData"));
			}
		},

		onPressOrder: function (oEvent) {
			var supplierID = oEvent.getSource().getText();
			// get a handle on the global XAppNav service
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.isIntentSupported(["PurchaseOrders-Display"])
				.done(function (aResponses) {

				})
				.fail(function () {
					new sap.m.MessageToast("Provide corresponding intent to navigate");
				});
			// generate the Hash to display a employee Id
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "PurchaseOrders",
					action: "Display"
				},
				params: {
					"objectId": supplierID
				}
			})) || "";
			//Generate a  URL for the second application
			var url = window.location.href.split('#')[0] + hash;
			//Navigate to second app
			sap.m.URLHelper.redirect(url, true);
		},

		handleSupplier: function () {

			if (!that.oSearchSupplierDialog) {
				that.oSearchSupplierDialog = sap.ui.xmlfragment("it.aupsup.aprvschdagr.fragments.SearchSupplier", that);
				that.getView().addDependent(that.oSearchSupplierDialog);
			}
			that.oSearchSupplierDialog.open();
			var oTable = sap.ui.getCore().byId("idSuppliersTable");
			var oItems = oTable.getItems();

			var selectedSupplier = that.getModel("filterJSONModel").getData().lifnr;
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

			that.getModel("filterJSONModel").getData().lifnr = selectedSupplier;
			that.getModel("filterJSONModel").getData().lifnrDesc = selectedSupplierDesc;

			this.oSearchSupplierDialog.close();
			this.oSearchSupplierDialog.destroy();
			this.oSearchSupplierDialog = undefined;
			that.getModel("filterJSONModel").refresh();
		},
		onSearchSupplier: function () {
			// ricerca fornitori da popup

			var filtri =
				sap.ui.getCore().byId("EKORG").getSelectedKeys();

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

		onSearchOrders: function () {

			var url = "/backend/SchedulingAgreementManagement/GetConfermeRifiuti";
			var body = that.getModel("filterJSONModel").getData();
			var isBuyer = sap.ui.getCore().getModel("VisibilityJSONModel").getData().isBuyer;
			var isPlanner = sap.ui.getCore().getModel("VisibilityJSONModel").getData().isPlanner;
			var isAdministrator = sap.ui.getCore().getModel("VisibilityJSONModel").getData().isAdministrator;
			that.showBusyDialog();
			that.ajaxPost(url, body, function (oData) {
				that.hideBusyDialog();
				if (oData && oData.results) {
					var outArr = { "results": { "EkkoEkpo": [], "EketEkes": [] } }
					if (oData.results.EkkoEkpo) {
						oData.results.EkkoEkpo.forEach(element => {
							element.isSelected = false;
							if (isAdministrator)
								outArr.results.EkkoEkpo.push(element)
							else{
								if (isBuyer && element.CONF_TYPE === 'PRZ')
									outArr.results.EkkoEkpo.push(element)
								if (isPlanner && element.CONF_TYPE === 'QUA')
									outArr.results.EkkoEkpo.push(element)
							}
						});
						oData.results.EketEkes.forEach(element => {
							if (isAdministrator)
								outArr.results.EketEkes.push(element)
							else{
								if (isBuyer && element.CONF_TYPE === 'PRZ')
									outArr.results.EketEkes.push(element)
								if (isPlanner && element.CONF_TYPE === 'QUA')
									outArr.results.EketEkes.push(element)
							}
						});
					}

					// Distinct sulle righe mostrate a video per ebeln e ebelp
					// non la faccio a DB perchè c'è anche la data in chiave
					var distinctArray = []
					outArr.results.EkkoEkpo.forEach(old => {
						var trovato = false;
						distinctArray.forEach(element => {
							if(old.EBELN === element.EBELN && old.EBELP === element.EBELP && (old.CONF_TYPE==='QUA' && element.CONF_TYPE==='QUA')){
								trovato = true;
							}
						});
						if(!trovato){
							distinctArray.push(old);
						}
					});

					outArr.results.EkkoEkpo = distinctArray;


					var oModel = new JSONModel();
					oModel.setData(outArr);
					that.getView().setModel(oModel, "SchedAgreeJSONModel");
					that.getView().byId("OrderHeadersTable").setModel(oModel);
				} else {
					that.getView().byId("OrderHeadersTable").setModel(null);
					var oModel = new JSONModel();
					oModel.setData({});
					that.getView().setModel(oModel, "SchedAgreeJSONModel");
				}
			})
		},

		onSelectAll: function (oEvent) {

			var oTable = that.getView().byId("OrderHeadersTable");
			oTable.getItems().forEach(function (r) {
				var oPath = r.oBindingContexts.SchedAgreeJSONModel.sPath;
				that.getModel("SchedAgreeJSONModel").getProperty(oPath);

				if (that.getModel("SchedAgreeJSONModel").getProperty(oPath).CONF_TYPE === 'PRZ') {
					if (oEvent.getParameters().selected)
						that.getModel("SchedAgreeJSONModel").getProperty(oPath).isSelected = true;
					else
						that.getModel("SchedAgreeJSONModel").getProperty(oPath).isSelected = false;
				}
			});

			that.getModel("SchedAgreeJSONModel").refresh();
		},


		onConfirmPositions: function () {

			var oModel = that.getModel("SchedAgreeJSONModel").getData().results.EkkoEkpo;
			var itemIndex = 0;
			oModel.forEach(element => {
				element.isSelected ? itemIndex++ : itemIndex
			});

			if (itemIndex > 0) {
				that.onSendData('A', '');
			} else {
				MessageBox.error(that.getResourceBundle().getText("ERR_NoOrderSelect"));
			}

			/*var oTable = this.getView().byId("OrderHeadersTable");
			var itemIndex = oTable.indexOfItem(oTable.getSelectedItem());
			if (itemIndex !== -1) {
				MessageBox.warning((that.getResourceBundle().getText("MessConf")), {
					icon: MessageBox.Icon.WARNING,
					title: "Warning",
					actions: [MessageBox.Action.CANCEL, MessageBox.Action.OK],
					initialFocus: MessageBox.Action.CANCEL,
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.OK) {
							that.onSendData('A', '');
						}
					}
				});
			} else {
				MessageBox.error(that.getResourceBundle().getText("ERR_NoOrderSelect"));
			}*/
		},

		onRejectPositions: function () {
			var oModel = that.getModel("SchedAgreeJSONModel").getData().results.EkkoEkpo;
			var itemIndex = 0;
			oModel.forEach(element => {
				element.isSelected ? itemIndex++ : itemIndex
			});

			if (itemIndex > 0) {
				MessageBox.warning(that.getResourceBundle().getText("MessReject"), {
					icon: MessageBox.Icon.WARNING,
					title: "Warning",
					actions: [MessageBox.Action.CANCEL, MessageBox.Action.OK],
					initialFocus: MessageBox.Action.CANCEL,
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.OK) {

							var oDialog = new Dialog({
								title: that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("Reject"),
								type: 'Message',
								content: [
									new Label({
										text: that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("MessReject"),
										labelFor: 'rejectDialogTextarea'
									}),
									new TextArea('rejectDialogTextarea', {
										width: '100%',
										placeholder: that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("AddNota")
									})
								],
								beginButton: new Button({
									type: ButtonType.Emphasized,
									text: that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("Reject"),
									press: function () {
										var sText = sap.ui.getCore().byId('rejectDialogTextarea').getValue();
										that.onSendData('R', sText);
										oDialog.close();
									}
								}),
								endButton: new Button({
									text: that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("close"),
									press: function () {
										oDialog.close();
									}
								}),
								afterClose: function () {
									oDialog.destroy();
								}
							});

							oDialog.open();

						}
					}
				});
			} else {
				MessageBox.error(that.getResourceBundle().getText("ERR_NoOrderSelect"));
			}
		},

		getProfiliConferma: function (fCompletion) {

			var url = "/backend/Utils/UtilsManagement/GetProfiliConferma";
			that.ajaxGet(url, function (oData) {
				if (oData && oData.results) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getOwnerComponent().setModel(oModel, "profiliConfermaJSONModel");
				}
			});

		},

		filterProfiliConferma: function (profiloControllo, tipoConferma) {
			var profiliConfermaModel = this.getView().getModel("profiliConfermaJSONModel");
			var foundProfilo;
			if (profiliConfermaModel !== undefined && profiliConfermaModel.getData() && profiliConfermaModel.getData().length > 0) {
				profiliConfermaModel.getData().forEach(function (elem) {
					if (elem.PROFILO_CONTROLLO === profiloControllo && elem.TIPO_CONFERMA === tipoConferma) {
						foundProfilo = elem;
						return true;
					}
				});
			}
			return foundProfilo;
		},

		formatDate: function (sDate) {
			var oFromFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "yyyyMMdd"
			});
			var oDate = oFromFormat.parse(sDate, true);
			var oToFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd MMM yyyy"
			});
			var sResult = oToFormat.format(oDate);
			return sResult;
		},

		onSendDataForQuantity: function (posToReject, posToApprove, sText) {
			//	var counter = 0;
			var body = {
				"confirmType": [],
				"notaReject": sText,
				"tipoOperazione": "QUA",
				"spras": that.getLanguage()
			};

			if (posToApprove !== undefined && posToApprove.length > 0) {
				posToApprove.forEach(element => {
					var elem = {};
					elem.EBELN = element.EBELN;
					elem.EBELP = element.EBELP;
					elem.XBLNR = element.XBLNR;
					elem.EINDT = element.EKES_EINDT !== undefined ? that.formatDate(element.EKES_EINDT) : element.CREATION_DATE !== undefined ? element.CREATION_DATE : '';
					elem.LIFNR = element.LIFNR;
					elem.MATNR = that.removeZeroBefore(element.MATNR) + " - " + element.TXZ01;
					elem.MENGE = that.importFormatter(element.EKES_MENGE);
					elem.CONF_TYPE = 'A';
					elem.BSTYP = element.BSTYP; // per piani di consegna
					elem.COUNTER = element.COUNTER;
					elem.CREATION_DATE = element.CREATION_DATE;
					body.confirmType.push(elem);
				});
			}
			if (posToReject !== undefined && posToReject.length > 0) {
				posToReject.forEach(element => {
					var elem = {};
					elem.EBELN = element.EBELN;
					elem.EBELP = element.EBELP;
					elem.XBLNR = element.XBLNR;
					elem.EINDT = element.EKES_EINDT !== undefined ? that.formatDate(element.EKES_EINDT) : element.CREATION_DATE !== undefined ? element.CREATION_DATE : '';
					elem.LIFNR = element.LIFNR;
					elem.MATNR = that.removeZeroBefore(element.MATNR) + " - " + element.TXZ01;
					elem.CONF_TYPE = 'R';
					elem.MENGE = that.importFormatter(element.EKES_MENGE);
					elem.BSTYP = element.BSTYP; // per piani di consegna
					elem.COUNTER = element.COUNTER;
					elem.CREATION_DATE = element.CREATION_DATE;
					body.confirmType.push(elem);
				});
			}

			//Chiamata al servizio per la conferma
			var url = "/backend/OrdersManagement/ConfirmReject";
			that.showBusyDialog();
			that.ajaxPost(url, body, function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (oData) {
					if (oData.errLog) {
						MessageBox.error(decodeURI(oData.errLog));
						return;
					}
					if (oData.results && oData.results && oData.results.length > 0) {
						var message = "";
						$.each(oData.results, function (index, item) {
							message = item.MESSAGE + " \n " + message;
						});
						if (message !== "") {
							MessageBox.show(message, {
								onClose: function () {
									// aggiorno la lista
									that.onCloseApproveRejectFragment(true);
									//that.onSearchOrders();
								} // default

							});
						}

					} else {
						MessageBox.success(that.getResourceBundle().getText("correctConfirmData"), {
							title: "Success", // default
							onClose: function () {
								// aggiorno la lista
								that.onCloseApproveRejectFragment(true);
								//that.onSearchOrders();
							} // default

						});

					}
				}
			});

		},

		onSendData: function (confirmationType, notaReject) {
			var counter = 0;
			var body = {
				"confirmType": [],
				"notaReject": notaReject,
				"tipoOperazione": "PRZ",
				"spras": that.getLanguage()
			};

			var oModel = that.getModel("SchedAgreeJSONModel").getData().results.EkkoEkpo;
			oModel.forEach(element => {
				if (element.isSelected) {
					var elem = {};
					elem.EBELN = element.EBELN;
					elem.EBELP = element.EBELP;
					elem.EINDT = element.CREATION_DATE;
					elem.LIFNR = element.LIFNR;
					elem.MATNR = that.removeZeroBefore(element.MATNR) + " - " + element.TXZ01;
					elem.NETPR = that.importFormatter(element.NETPR);
					elem.MENGE = that.importFormatter(element.MENGE);
					elem.PEINH = that.importFormatter(element.PEINH);
					elem.ZINVALIDITA = element.ZINVALIDITA !== undefined ? that.formatDate(element.ZINVALIDITA) : ''
					elem.ZFINVALIDATA = element.ZFINVALIDATA !== undefined ? that.formatDate(element.ZFINVALIDATA) : ''
					if (element.XBLNR === undefined) {
						elem.XBLNR = ""
					} else {
						elem.XBLNR = element.XBLNR
					};
					elem.CONF_TYPE = confirmationType;
					elem.BSTYP = element.BSTYP; // per piani di consegna
					elem.COUNTER = counter++;
					elem.CREATION_DATE = element.CREATION_DATE;
					body.confirmType.push(elem);
				}
			});

			//Chiamata al servizio per la conferma
			var url = "/backend/OrdersManagement/ConfirmReject";
			that.showBusyDialog();
			that.ajaxPost(url, body, function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (oData) {
					if (oData.errLog) {
						MessageBox.error(decodeURI(oData.errLog));
						return;
					}
					if (oData.results && oData.results && oData.results.length > 0) {
						var message = "";
						$.each(oData.results, function (index, item) {
							//Escludo i messaggi di tipo W
							if (item.MSGTY !== 'W')
								message = item.MESSAGE + " \n " + message;
						});
						if (message !== "") {
							MessageBox.show(message, {
								onClose: function () {
									// aggiorno la lista
									that.onSearchOrders();
								} // default

							});
						}

					} else {
						MessageBox.success(that.getResourceBundle().getText("correctConfirmData"), {
							title: "Success", // default
							onClose: function () {
								// aggiorno la lista
								that.onSearchOrders();
							} // default

						});

					}
				}
			});

		},

		onClearFilters: function () {
			if (that.getModel("filterJSONModel") !== undefined && that.getModel("filterJSONModel").getData() !== undefined) {
				that.getModel("filterJSONModel").getData().MatnrDesc = '';
				that.getModel("filterJSONModel").getData().ebeln = "";
				that.getModel("filterJSONModel").getData().lifnr = '';
				that.getModel("filterJSONModel").getData().matnr = '';
				that.getModel("filterJSONModel").getData().ekorg = '';
				that.getModel("filterJSONModel").getData().ekgrp = '';
				that.getModel("filterJSONModel").getData().werks = '';
			}
			if (that.getModel("MetasupplierJSONModel") !== undefined && that.getModel("MetasupplierJSONModel").getData() !== undefined) {
				that.getModel("MetasupplierJSONModel").getData().METAID = '';
			}
			if (that.getModel("lifnrJSONModel") !== undefined && that.getModel("lifnrJSONModel").getData() !== undefined) {
				that.getModel("lifnrJSONModel").setData(null);
			}
			if (that.getModel("MatnrJSONModel") !== undefined && that.getModel("MatnrJSONModel").getData() !== undefined) {
				that.getModel("MatnrJSONModel").setData(null);
			}
			if (that.getModel("filterJSONModel") !== undefined)
				that.getModel("filterJSONModel").refresh();
			if (that.getModel("MetasupplierJSONModel") !== undefined)
				that.getModel("MetasupplierJSONModel").refresh();
			if (that.getModel("lifnrJSONModel") !== undefined)
				that.getModel("lifnrJSONModel").refresh();
			if (that.getModel("MatnrJSONModel") !== undefined)
				that.getModel("MatnrJSONModel").refresh();
		},
		getMetasupplier: function () {
			var url = "/backend/Utils/UtilsManagement/GetMetasupplierList";
			that.ajaxGet(url, function (oData) {

				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "MetasupplierJSONModel");
					//Valorizzazione Campo Lifnr per Servizio
					var oLifnr = that.getModel("filterInboundDelivJSONModel");
					oLifnr = oData.results;
					var oModelLF = new JSONModel();
					oModelLF.setData(oLifnr);
					that.getView().setModel(oModelLF, "filterInboundDelivJSONModel");
				}
			})
		},
		onClearMaterialSearchFilters: function () {
			this.getView().getModel("MatnrSearchJSONModel").getData().matnr = "";
			this.getView().getModel("MatnrSearchJSONModel").getData().maktx = "";
			that.getView().getModel("MatnrJSONModel").setData(null);
			this.getView().getModel("MatnrSearchJSONModel").refresh();
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
			that.getModel("filterJSONModel").getData().lifnr = slifnr;

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
			that.getModel("filterJSONModel").getData().lifnr = lifnr;
		},
		getPlants: function () {

			var url = "/backend/Utils/UtilsManagement/GetUserPlants";
			that.ajaxGet(url, function (oData) {
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					var oComponent = that.getOwnerComponent();
					oComponent.setModel(oModel, "PlantsJSONModel");
				}
			});
		},
		handleMatnr: function () {

			if (!that.oSearchMatnrDialog) {
				that.oSearchMatnrDialog = sap.ui.xmlfragment("it.aupsup.aprvschdagr.fragments.SearchMatnr", that);
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
		},

		onCloseSearchMatnr: function () {
			if (this.oSearchMatnrDialog) {
				this.oSearchMatnrDialog.close();
				this.oSearchMatnrDialog.destroy();
				this.oSearchMatnrDialog = undefined;
			}
		},

		onSearchMatnr: function () {
			// ricerca materiali da popup
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
			//aIndices.forEach(function (indexNumber) {
			for (var i = 0; i < oItems.length; i++) {
				var oPositionModel = that.getModel("MatnrJSONModel").getProperty(oItems[i].getBindingContextPath());
				selectedMatnrDesc = oPositionModel.DESCR + ";" + selectedMatnrDesc;
				selectedMatnr.push(
					//	"ELIFN": 
					oPositionModel.CODE
				);
			}

			that.getModel("filterJSONModel").getData().matnr = selectedMatnr;
			that.getModel("filterJSONModel").getData().MatnrDesc = selectedMatnrDesc;

			this.oSearchMatnrDialog.close();
			this.oSearchMatnrDialog.destroy();
			this.oSearchMatnrDialog = undefined;
			that.getModel("filterJSONModel").refresh();
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

		onExport: function (oEvent) {

			var dataS = this.getView().getModel("SchedAgreeJSONModel");
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
				models: this.getView().getModel("SchedAgreeJSONModel"),

				// binding information for the rows aggregation
				rows: {
					path: "/results/EkkoEkpo"
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
					name: that.getResourceBundle().getText("MENGE"),
					template: {
						content: "{MENGE_ORIGINAL}"
					}
				}, {
					name: that.getResourceBundle().getText("MENGE_NEW"),
					template: {
						content: "{MENGE}"
					}
				}, {
					name: that.getResourceBundle().getText("NETPR"),
					template: {
						content: "{NETPR_ORIGINAL}"
					}
				}, {
					name: that.getResourceBundle().getText("NETPR_NEW"),
					template: {
						content: "{NETPR}"
					}
				}, {
					name: that.getResourceBundle().getText("PEINH"),
					template: {
						content: "{PEINH_ORIGINAL}"
					}
				}, {
					name: that.getResourceBundle().getText("PEINH_NEW"),
					template: {
						content: "{PEINH}"
					}
				}, {
					name: that.getResourceBundle().getText("SchedMod"),
					template: {
						content: "{SCHEDMOD}"
					}
				}]
			});

			// download exported file
			oExport.saveFile().catch(function (oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		},
		onRowSelectionChange: function (oEvent) {

			var oSelectedItem = oEvent.getParameter("listItem");

			var oPath = oSelectedItem.oBindingContexts.SchedAgreeJSONModel.sPath;
			var oItem = that.byId("OrderHeadersTable").getModel().getProperty(oPath);

			var data = {
				orderId: oItem.EBELN,
				posNumber: oItem.EBELP,
				type: oItem.EBTYP,
			};

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("detail", {
				datas: JSON.stringify(data)
			});

			// }

		},

		onValidate: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getBindingContext("SchedAgreeJSONModel").sPath;
			var mod = that.getModel("SchedAgreeJSONModel").getProperty(oPath);

			var url = "/backend/SchedulingAgreementManagement/GetConfermeRifiutiForQuant?I_EBELN=" + mod.EBELN +
				"&I_EBELP=" + mod.EBELP + "&I_BSTYP=" + mod.BSTYP + "&I_SPRAS=" + that.getLanguage();
			this.showBusyDialog();
			that.ajaxGet(url, function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (oData && oData.results && oData.results.length > 0) {

					oData.results.forEach(element => {
						element.MATNR = mod.MATNR;
						element.TXZ01 = mod.TXZ01;
						element.LIFNR = mod.LIFNR;
					});

					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "SchedAgrToApproveRejectJSONModel");

					if (!that.approveRejectFragment) {
						that.approveRejectFragment = sap.ui.xmlfragment("it.aupsup.aprvschdagr.fragments.ApproveReject", that);
						that.getView().addDependent(that.approveRejectFragment);
					}

					that.approveRejectFragment.open();
				} else {
					MessageBox.error(that.getResourceBundle().getText("MSG_NO_TO_CONFIRM"));
				}
			});

		},
		onCloseApproveRejectFragment: function (makeRefresh) {
			if (this.approveRejectFragment) {
				this.approveRejectFragment.close();
				this.approveRejectFragment.destroy();
				this.approveRejectFragment = undefined;
				if (makeRefresh === true) {
					that.onSearchOrders();
				}
			}
		},
		onSetSchedulationStatus: function (oValue) {
			if (oValue === "G") {
				return "Success";
			} else if (oValue === "O") {
				return "Indication03";
			} else {
				if (oValue === "R") {
					return "Indication02";
				} else
					return "None";
			}
		},
		onLegend: function (oEvent) {
			var oButton = oEvent.getSource();

			// create popover
			if (!this._oPopover) {
				new sap.ui.core.Fragment.load({
					name: "it.aupsup.aprvschdagr.fragments.ColorStatus",
					controller: that
				}).then(function (pPopover) {
					that._oPopover = pPopover;
					that.getView().addDependent(this._oPopover);
					//that._oPopover.bindElement("/ProductCollection/0");
					that._oPopover.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
			}
		},
		onConfirmApproveReject: function () {
			// TODO ANCORA DA FINIRE
			var modelData = that.getView().getModel("SchedAgrToApproveRejectJSONModel").getData();
			if (modelData !== undefined && modelData.results !== undefined) {

				MessageBox.warning(that.getResourceBundle().getText("MSG_Confirm_Reject_Text"), {
					icon: MessageBox.Icon.WARNING,
					title: "Warning",
					actions: [MessageBox.Action.CANCEL, MessageBox.Action.OK],
					initialFocus: MessageBox.Action.CANCEL,
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.OK) {

							// 1 controllo se ci sono righe da rifiutare così capisco se devo esporre la popup con la nota
							var posToReject = [];
							var posToApprove = [];
							modelData.results.forEach(element => {
								if (element.REJECT === true) {
									posToReject.push(element);
								}
								if (element.APPROVE === true) {
									posToApprove.push(element);
								}
							});

							if (posToReject !== undefined && posToReject.length > 0) {
								// c'è almeno una riga da rifiutare quindi faccio inserire la nota di reject
								var oDialog = new Dialog({
									title: that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("Reject"),
									type: 'Message',
									content: [
										new Label({
											text: that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("MessReject"),
											labelFor: 'rejectDialogTextarea'
										}),
										new TextArea('rejectDialogTextarea', {
											width: '100%',
											placeholder: that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("AddNota")
										})
									],
									beginButton: new Button({
										type: ButtonType.Emphasized,
										text: that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("Reject"),
										press: function () {
											var sText = sap.ui.getCore().byId('rejectDialogTextarea').getValue();
											that.onSendDataForQuantity(posToReject, posToApprove, sText);
											oDialog.close();
										}
									}),
									endButton: new Button({
										text: that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("close"),
										press: function () {
											oDialog.close();
										}
									}),
									afterClose: function () {
										oDialog.destroy();
									}
								});

								oDialog.open();


							} else {
								that.onSendDataForQuantity(posToReject, posToApprove, '');
							}


						}
					}
				});

			}
		},
		onColumnSelection: function (event) {
			var that = this;
			var List = that.byId("List");
			var popOver = this.byId("popOver");
			if (List !== undefined) {
				List.destroy();
			}
			if (popOver !== undefined) {
				popOver.destroy();
			}
			/*----- PopOver on Clicking ------ */
			var popover = new sap.m.Popover(this.createId("popOver"), {
				showHeader: true,
				showFooter: true,
				placement: sap.m.PlacementType.Bottom,
				content: []
			}).addStyleClass("sapMOTAPopover sapTntToolHeaderPopover");

			/*----- Adding List to the PopOver -----*/
			var oList = new sap.m.List(this.createId("List"), {});
			this.byId("popOver").addContent(oList);
			var openAssetTable = this.getView().byId("OrderHeadersTable"),
				columnHeader = openAssetTable.getColumns();
			var openAssetColumns = [];
			for (var i = 0; i < columnHeader.length; i++) {
				var hText = columnHeader[i].getAggregation("header") !== null ? columnHeader[i].getAggregation("header").getProperty("text") : "";
				var columnObject = {};
				columnObject.column = hText;
				openAssetColumns.push(columnObject);
			}
			var oModel1 = new sap.ui.model.json.JSONModel({
				list: openAssetColumns
			});
			var itemTemplate = new sap.m.StandardListItem({
				title: "{oList>column}"
			});
			oList.setMode("MultiSelect");
			oList.setModel(oModel1);
			sap.ui.getCore().setModel(oModel1, "oList");
			var oBindingInfo = {
				path: 'oList>/list',
				template: itemTemplate
			};
			oList.bindItems(oBindingInfo);
			var footer = new sap.m.Bar({
				contentLeft: [],
				contentMiddle: [new sap.m.Button({
					text: that.getResourceBundle().getText("Comfirm"),
					press: function () {
						that.onSavePersonalization();
					}
				}), new sap.m.Button({
					text: "Cancel",
					press: function () {
						that.onCancelPersonalization();
					}
				})

				]

			});

			this.byId("popOver").setFooter(footer);
			var oList1 = this.byId("List");
			var table = this.byId("OrderHeadersTable").getColumns();
			/*=== Update finished after list binded for selected visible columns ==*/
			oList1.attachEventOnce("updateFinished", function () {
				var a = [];
				for (var j = 0; j < table.length; j++) {
					var list = oList1.oModels.undefined.oData.list[j].column;
					a.push(list);
					var Text = table[j].getHeader() !== null ? table[j].getHeader().getProperty("text") : "";
					var v = table[j].getProperty("visible");
					if (v === true) {
						if (a.indexOf(Text) > -1) {
							var firstItem = oList1.getItems()[j];
							oList1.setSelectedItem(firstItem, true);
						}
					}
				}
			});
			popover.openBy(event.getSource());
		},

		onCancelPersonalization: function () {
			this.byId("popOver").close();
		},

		onSavePersonalization: function () {
			var that = this;
			var oList = this.byId("List");
			var array = [];
			var items = oList.getSelectedItems();

			// Getting the Selected Columns header Text.
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var context = item.getBindingContext("oList");
				var obj = context.getProperty(null, context);
				var column = obj.column;
				array.push(column);
			}
			/*---- Displaying Columns Based on the selection of List ----*/
			var table = this.byId("OrderHeadersTable").getColumns();
			var columnModel = that.getView().getModel("columnVisibilityModel").getData();
			for (var j = 0; j < table.length; j++) {
				var idColonna = "";
				var Text = table[j].getHeader() !== null ? table[j].getHeader().getProperty("text") : "";
				var Column = table[j].getId();
				if (Column !== null && Column !== undefined) {
					idColonna = Column.split("--");
					if (idColonna !== undefined && idColonna.length > 1) {
						idColonna = idColonna[1];
					}
				}
				var columnId = this.getView().byId(Column);
				if (columnId !== undefined)
					if (array.indexOf(Text) > -1) {
						columnModel[idColonna] = true;
						//	columnId.setVisible(true);
					} else {
						columnModel[idColonna] = false;
						//columnId.setVisible(false);
					}
			}
			that.getView().getModel("columnVisibilityModel").refresh();
			this.byId("popOver").close();

		},

		onGetOdataColumns: function () {
			// Implementare il servizio che in AMA è stato creato come "VariantsService.xsodata", inserire poi il model nel Manifest

			//	var oModelData = that.getOwnerComponent().getModel("VariantsModel");
			//	oModelData.metadataLoaded().then(
			//		that.onMetadataLoaded.bind(that, oModelData));
			var columModel = { "EBELN": true, "EBELP": true, "EBTYP": false, "MATNR": true, "TXZ01": true, "LIFNR": true, "NAME1": true, "WERKS": true, "MENGE_ORIGINAL": false, "MENGE": false, "NETPR_ORIGINAL": true, "NETPR": true, "ZINVALIDITA": true, "ZFINVALIDATA": true, "PEINH_ORIGINAL": true, "PEINH": true, "SCHEDMOD": false };
			var oModel = new JSONModel();
			oModel.setData(columModel);
			that.getView().setModel(oModel, "columnVisibilityModel");

		},

		handleTextPopoverPress: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getBindingContext("SchedAgreeJSONModel").sPath;

			var oButton = oEvent.getSource();

			if (this._oPopover !== undefined) {
				this._oPopover = undefined;
			}

			// create popover
			if (!this._oPopover) {
				Fragment.load({
					name: "it.aupsup.aprvschdagr.fragments.TextPopOver",
					controller: this
				}).then(function (pPopover) {
					this._oPopover = pPopover;
					this.getView().addDependent(this._oPopover);
					this._oPopover.bindElement({ path: oPath, model: "SchedAgreeJSONModel" });
					this._oPopover.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
			}
		},

		handleTextPositionPopoverPress: function(oEvent){
			var oPath = oEvent.getSource().getParent().getBindingContext("SchedAgrToApproveRejectJSONModel").sPath;

			var oButton = oEvent.getSource();

			if (this._oPopoverPos !== undefined) {
				this._oPopoverPos = undefined;
			}
			
			// create popover
			if (!this._oPopoverPos) {
				Fragment.load({
					name: "it.aupsup.aprvschdagr.fragments.TextPopOverPos",
					controller: this
				}).then(function (pPopover) {
					this._oPopoverPos = pPopover;
					this.getView().addDependent(this._oPopoverPos);
					this._oPopoverPos.bindElement({ path: oPath, model: "SchedAgrToApproveRejectJSONModel" });
					this._oPopoverPos.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopoverPos.openBy(oButton);
			}			
		}

	});

});