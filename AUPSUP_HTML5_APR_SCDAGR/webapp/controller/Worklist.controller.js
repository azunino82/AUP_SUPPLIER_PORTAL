sap.ui.define([
	"it/alteaup/supplier/portal/aprvschdagr/AUPSUP_HTML5_APR_SCDAGR/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"it/alteaup/supplier/portal/aprvschdagr/AUPSUP_HTML5_APR_SCDAGR/js/Date",
	"it/alteaup/supplier/portal/aprvschdagr/AUPSUP_HTML5_APR_SCDAGR/js/formatter",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/m/library",
], function (BaseController, JSONModel, MessageBox, MessageToast, Sorter, Filter, FilterOperator, Export, ExportTypeCSV, Date, Formatter, Button, Dialog, Label, Text, TextArea, Library) {
	"use strict";
	var that = undefined;
	var ButtonType = Library.ButtonType;
	return BaseController.extend("it.alteaup.supplier.portal.aprvschdagr.AUPSUP_HTML5_APR_SCDAGR.controller.Worklist", {

		onInit: function () {
			that = this;
			that.getUserInfo();
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
				this._oResponsivePopover = sap.ui.xmlfragment("it.alteaup.supplier.portal.aprvschdagr.AUPSUP_HTML5_APR_SCDAGR.fragments.FilterSorter", this);
				this._oResponsivePopover.setModel(oModelFilters, "filterJSONModel");
			}

			/*var oTable = this.getView().byId("OrderHeadersTable");
			oTable.addEventDelegate({
				onAfterRendering: function () {
					var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
					for (var i = 0; i < oHeader.length; i++) {
						var oID = oHeader[i].id;
						that.onClick(oID);
					}
				}
			}, oTable);*/

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

		/*onClick: function (oID) {
			$('#' + oID).click(function (oEvent) { //Attach Table Header Element Event
				var oTarget = oEvent.currentTarget; //Get hold of Header Element
				var oView = that.getView();
				var res = oTarget.id.split("--");
				res = res[1];

				//	var oTable = oView.byId("OrderHeadersTable");
				//	var oModel = oTable.getModel().getProperty("/results"); //Get Hold of Table Model Values
				//	var oKeys = Object.keys(oModel[0]); //Get Hold of Model Keys to filter the value
				oView.getModel("SchedAgreeJSONModel").setProperty("/bindingValue", res); //Save the key value to property
				that._oResponsivePopover.openBy(oTarget);
			});
		},*/

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
				that.oSearchSupplierDialog = sap.ui.xmlfragment("it.alteaup.supplier.portal.aprvschdagr.AUPSUP_HTML5_APR_SCDAGR.fragments.SearchSupplier", that);
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

			var body = that.getModel("filterJSONModel").getData();
			var url = "/backend/SchedulingAgreementManagement/GetConfermeRifiuti";
			this.showBusyDialog();
			that.ajaxPost(url, body, function (oData) {
				that.hideBusyDialog();
				if (oData) {
					if (oData.results.EkkoEkpo) {
						oData.results.EkkoEkpo.forEach(element => {
							element.isSelected = false;
						});
					}

					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "SchedAgreeJSONModel");
					that.getView().byId("OrderHeadersTable").setModel(oModel);
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

		onSendDataForQuantity : function (posToReject,posToApprove,sText){
			var body = {
				"confirmType": [],
				"notaReject": sText,
				"tipoOperazione": "QUA"
			};

			if(posToApprove !== undefined && posToApprove.length>0){
				posToApprove.forEach(element => {
					var elem = {};
					elem.EBELN = element.EBELN;
					elem.EBELP = element.EBELP;
					elem.XBLNR = element.XBLNR;
					elem.CONF_TYPE = 'A',
					elem.BSTYP = 'L'; // per piani di consegna
					body.confirmType.push(elem);
				});
			}
			if(posToReject !== undefined && posToReject.length>0){
				posToReject.forEach(element => {
					var elem = {};
					elem.EBELN = element.EBELN;
					elem.EBELP = element.EBELP;
					elem.XBLNR = element.XBLNR;
					elem.CONF_TYPE = 'R',
					elem.BSTYP = 'L'; // per piani di consegna
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
									that.onCloseApproveRejectFragment();
									that.onSearchOrders(); 
								} // default

							});
						}

					} else {
						MessageBox.success(that.getResourceBundle().getText("correctConfirmData"), {
							title: "Success", // default
							onClose: function () {
								// aggiorno la lista
								that.onCloseApproveRejectFragment();
								that.onSearchOrders();
							} // default

						});

					}
				}
			});

		},

		onSendData: function (confirmationType, notaReject) {

			var body = {
				"confirmType": [],
				"notaReject": notaReject,
				"tipoOperazione": "PRZ"
			};

			var oModel = that.getModel("SchedAgreeJSONModel").getData().results.EkkoEkpo;
			oModel.forEach(element => {
				if (element.isSelected) {
					var elem = {};
					elem.EBELN = element.EBELN;
					elem.EBELP = element.EBELP;
					elem.CONF_TYPE = confirmationType,
						elem.BSTYP = 'L'; // per piani di consegna

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
				that.oSearchMatnrDialog = sap.ui.xmlfragment("it.alteaup.supplier.portal.aprvschdagr.AUPSUP_HTML5_APR_SCDAGR.fragments.SearchMatnr", that);
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

			var filtri = "";
			var url = "/backend/SchedulingAgreementManagement/GetConfermeRifiutiForQuant?I_EBELN=" + mod.EBELN +
				"&I_EBELP=" + mod.EBELP;
			this.showBusyDialog();
			that.ajaxGet(url, function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (oData && oData.results && oData.results.length > 0) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "SchedAgrToApproveRejectJSONModel");

					if (!that.approveRejectFragment) {
						that.approveRejectFragment = sap.ui.xmlfragment("it.alteaup.supplier.portal.aprvschdagr.AUPSUP_HTML5_APR_SCDAGR.fragments.ApproveReject", that);
						that.getView().addDependent(that.approveRejectFragment);
					}

					that.approveRejectFragment.open();
				} else {
					MessageBox.error(that.getResourceBundle().getText("MSG_NO_TO_CONFIRM"));
				}
			});

		},
		onCloseApproveRejectFragment: function () {
			if (this.approveRejectFragment) {
				this.approveRejectFragment.close();
				this.approveRejectFragment.destroy();
				this.approveRejectFragment = undefined;
				that.onSearchOrders();
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
					name: "it.alteaup.supplier.portal.aprvschdagr.AUPSUP_HTML5_APR_SCDAGR.fragments.ColorStatus",
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
											that.onSendDataForQuantity(posToReject,posToApprove,sText);
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
								that.onSendDataForQuantity(posToReject,posToApprove,'');
							}


						}
					}
				});

			}
		}

	});

});