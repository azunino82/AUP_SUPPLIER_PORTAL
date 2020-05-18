sap.ui.define([
	"it/aupsup/inboundDelivery/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Sorter",
	"it/aupsup/inboundDelivery/js/Date",
	"it/aupsup/inboundDelivery/js/formatter",
], function (BaseController, Filter, FilterOperator, JSONModel, MessageToast, MessageBox, Sorter, Date, Formatter) {
	"use strict";
	var that;

	return BaseController.extend("it.aupsup.inboundDelivery.controller.OrderPositions", {

		onInit: function () {
			that = this;
			that.getRouter().getRoute("object").attachPatternMatched(that._onObjectMatched, that);

			that.getView().setModel(new JSONModel({
				globalFilter: "",
				availabilityFilterOn: false,
				cellFilterOn: false
			}), "ui");

			that._oGlobalFilter = null;
			that._oPriceFilter = null;

			if (!this._oResponsivePopover) {
				var oModelFilters = new JSONModel();
				oModelFilters.setData({
					"element": ""
				});
				this._oResponsivePopover = sap.ui.xmlfragment("it.aupsup.inboundDelivery.fragments.FilterSorter", this);
				this._oResponsivePopover.setModel(oModelFilters, "filterElementJSONModel");
			}

			var oTable = this.getView().byId("OrderTable");
			oTable.addEventDelegate({
				onAfterRendering: function () {
					var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
					for (var i = 0; i < oHeader.length; i++) {
						var oID = oHeader[i].id;
						that.onClick(oID, i + 1);
					}
				}
			}, oTable);

		},

		onClick: function (oID) {
			$('#' + oID).click(function (oEvent) { //Attach Table Header Element Event
				var oTarget = oEvent.currentTarget; //Get hold of Header Element
				var oView = that.getView();
				var res = oTarget.id.split("--");
				res = res[1];

				oView.getModel("DataJSONModel").setProperty("/bindingValue", res); //Save the key value to property
				that._oResponsivePopover.openBy(oTarget);
			});
		},

		onChange: function (oEvent) {
			var oValue = oEvent.getParameter("value");
			var oMultipleValues = oValue.split(",");
			var oTable = this.getView().byId("OrderTable");
			var oBindingPath = this.getView().getModel("DataJSONModel").getProperty("/bindingValue"); //Get Hold of Model Key value that was saved
			var aFilters = [];
			for (var i = 0; i < oMultipleValues.length; i++) {
				var oFilter = new Filter(oBindingPath, "Contains", oMultipleValues[i]);
				aFilters.push(oFilter)
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
			var oTable = this.getView().byId("OrderTable");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.getView().getModel("DataJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onDescending: function () {
			var oTable = this.getView().byId("OrderTable");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.getView().getModel("DataJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath, true);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		_onObjectMatched: function (oControlEvent) {

			//	that.showBusyDialog();
			var sObjectId = oControlEvent.getParameter("arguments").orderID;
			that.loadObject(sObjectId, "", "", function (oData) {
				that.hideBusyDialog();
				if (oData === null || oData === undefined) {

				} else {
					that._completeInit("Display", oData, function () {

					});
				}
			});
		},

		_completeInit: function (sMode, oData, fCompletion) {

			// TODO eventuale gestione di sMode in Edit o Display
			var oModel = new JSONModel();
			if (oData.results)
				oModel.setData(oData.results[0]);
			if (oData.results[0].OrderPositions) {
				for (var i = 0; i < oData.results[0].OrderPositions.results.length; i++) {
					if (oData.results[0].OrderPositions) {
						//Descrizione Plant
						// var plantsOrgModel = sap.ui.getCore().getModel("PlantsJSONModel").getData().results;
						var oComponent = that.getOwnerComponent(); 
						var plantsOrgModel = oComponent.getModel("PlantsJSONModel").getData().results;
						if (plantsOrgModel !== undefined) {
							oData.results[0].OrderPositions.results[i].EWERK = plantsOrgModel[0].EWERK;
							oData.results[0].OrderPositions.results[i].DESCR_EWERK = plantsOrgModel[0].DESCR;
						}

						if (oData.results[0].OrderPositions.results[i].POItemSchedulers.results) {
							for (var j = 0; j < oData.results[0].OrderPositions.results[i].POItemSchedulers.results.length; j++) {
								oData.results[0].OrderPositions.results[i].POItemSchedulers.results[j].editMode = false;
								oData.results[0].OrderPositions.results[i].POItemSchedulers.results[j].editPrice = false;
								oData.results[0].OrderPositions.results[i].POItemSchedulers.results[j].editQuantity = true;
							}
						}
					}
				}
			}
			//	var purchaseOrgModel = sap.ui.getCore().getModel("PurchaseOrganizationJSONModel").getData().results;
			var oComponent = that.getOwnerComponent(); //Returns the Component
			var purchaseOrgModel = oComponent.getModel("PurchaseOrganizationJSONModel").getData().results;
			if (purchaseOrgModel !== undefined) {
				var selectedEkorg = purchaseOrgModel.find(x => x.PURCH_ORG === oModel.getData().EKORG);
				that.getView().byId('headerPuchaseOrder').setText(selectedEkorg.PURCH_ORG + ' - ' + selectedEkorg.DESCR);
			}

			that.getView().setModel(oModel, "DataJSONModel");
			that.getView().byId("OrderTable").setModel(oModel);
			//that.getView().byId("OrderTable").refresh();
			fCompletion();
		},

		loadObject: function (sObjectId, sBSTAE, sEVTYP, fCompletion) {

			var url = "/SupplierPortal_OrdersManagement/xsOdata/GetOrderPositionsSchedAndConf.xsjs?I_USERID=" + this.getCurrentUserId() +
				"&I_EBELN=" + sObjectId + "&I_BSTAE=" + sBSTAE + "&I_EBTYP=" + sEVTYP;

			this.showBusyDialog();
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

			// var url = "OrderPositionsAndSchedulations";
			// var parameters = {
			// 	"$expand": "OrderPositions/POItemSchedulers",
			// 	"$filter": "(EBELN eq '" + sObjectId + "')"
			// };

			// that.readObject("OrderManagementService", url, parameters, function (oData) {
			// 	if (oData === null || oData === undefined) {
			// 		MessageBox.error(that.getResourceBundle().getText("noOrderFound"));
			// 		if (fCompletion !== undefined) {
			// 			fCompletion();
			// 		}
			// 	} else {
			// 		fCompletion(oData);
			// 	}

			// });

		},

		onRowSelectionChange: function (oEvent) {

			var oSelectedItem = oEvent.getParameter("listItem");

			var oPath = oSelectedItem.oBindingContexts.DataJSONModel.sPath;
			var oItem = that.byId("OrderTable").getModel().getProperty(oPath);
			// var idx = spath.slice(-1);
			// if (idx !== -1) {

			// 	var m = this.byId("OrderTable").getModel();
			// 	var data = m.getData();
			// 	var oItem = data.POItem.results[idx];
			var data = {
				orderId: oItem.EBELN,
				posNumber: oItem.EBELP
			};

			var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
			oRouter.navTo("detail", {
				datas: JSON.stringify(data)
			});

			// }

		},

		// onRowSelectionChange: function (oEvent) {

		// 	// giro malato per prendere l'EBELN
		// 	var oBindingContext = oEvent.getSource().getParent().getParent().getBindingContext("DataJSONModel");
		// 	if (oBindingContext === undefined) {
		// 		oBindingContext = oEvent.getSource().getParent().getParent().getBindingContext("DynamicJSONModel");
		// 	}

		// 	var oItem = oBindingContext.getModel().getProperty(oBindingContext.sPath);

		// 	var data = {
		// 		orderId: oItem.EBELN,
		// 		posNumber: oItem.EBELP
		// 	};

		// 	var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
		// 	oRouter.navTo("detail", {
		// 		datas: JSON.stringify(data)
		// 	});
		// },

		onGlobalFilter: function (oEvent) {

			var aTableSearchState = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				aTableSearchState = [new Filter("TXZ01", FilterOperator.Contains, sQuery)];
			}
			this._applySearch(aTableSearchState);

		},

		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("OrderTable"),
				oViewModel = this.getModel("DataJSONModel");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("noData"));
			}
		},

		onClearFilter: function () {
			var oTable = this.getView().byId("OrderTable");
			var aFilters = [];
			var oItems = oTable.getBinding("items");
			oItems.filter(aFilters, "Application");

			this.getView().byId("headerFilterButton").setVisible(false);
		},

		// =========================== gestione di selezione delle posizioni ================================
		onConfirmPositions: function () {
			var oTable = that.getView().byId("OrderTable");
			var aIndices = oTable.indexOfItem(oTable.getSelectedItem());
			var selectedContextBinding = [];
			if (parseInt(aIndices) < 0) {
				MessageToast.show(that.getResourceBundle().getText("ERR_Selection_Row"));
				return;
			}
			var oItems = oTable.getSelectedItems();
			var oNotEditPositions = ""; //Elenco delle posizione per le quali è inibita la modifica
			var countNotEditPositions = 0;
			for (var i = 0; i < oItems.length; i++) {
				var singleRow = that.getModel("DataJSONModel").getProperty(oItems[i].getBindingContextPath());
				var oPositionModel = JSON.parse(JSON.stringify(singleRow));
				oPositionModel.editMode = false;
				oPositionModel.editPrice = false;
				oPositionModel.editQuantity = true;
				oPositionModel.canShowPosition = true;
				if (oPositionModel.BSTAE === undefined || oPositionModel.BSTAE === "") {
					if (oPositionModel.LABNR === "" && (oPositionModel.KZABS !== undefined && oPositionModel.KZABS !== "")) {
						oPositionModel.canShowPosition = true;
					} else {
						oPositionModel.canShowPosition = false;
						oNotEditPositions = oPositionModel.EBELP + " " + oNotEditPositions;
						countNotEditPositions++;
					}
				} else {
					oPositionModel.canShowPosition = true;
				}
				oPositionModel.profiliConferma = [];
				var url = "/SupplierPortal_Utils/xsOdata/GetProfiliConferma.xsjs?I_USERID=" + this.getCurrentUserId() + "&I_BSTAE=" +
					oPositionModel.BSTAE;
				that.ajaxGet(url, function (oData) { // funzione generica su BaseController
					if (oData && oData.results) {
						oPositionModel.profiliConferma = oData.results;
					}
				});

				selectedContextBinding.push(oPositionModel);
			}

			if (countNotEditPositions === oItems.length) {
				MessageBox.error(that.getResourceBundle().getText("allPositionNotConfirmable"), {
					icon: MessageBox.Icon.ERROR,
					title: "Error",
				});
				return;
			}
			var oModelSelectedPos = new JSONModel();
			oModelSelectedPos.setData(selectedContextBinding);
			this.getView().setModel(oModelSelectedPos,
				"SelectedPositionsJSONModel");

			if (!that.oConfirmPositionsFragment) {
				that.oConfirmPositionsFragment = sap.ui.xmlfragment("it.aupsup.inboundDelivery.fragments.ConfirmPositions", this);
				that.getView().addDependent(that.oConfirmPositionsFragment);
			}

			that.oConfirmPositionsFragment.open();

			if (oNotEditPositions != "") {
				MessageBox.warning(that.getResourceBundle().getText("positionNotConfirmable", oNotEditPositions), {
					icon: MessageBox.Icon.WARNING,
					title: "Warning",
				});
			}
		},

		onChoseType: function (oEvent) {
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				oPath = oEvent.getSource().getSelectedItem().oBindingContexts.SelectedPositionsJSONModel.sPath;
			var mod = that.getModel("SelectedPositionsJSONModel").getProperty(oPath);
			if (mod != undefined && mod.TIPO_CONFERMA === "4") {
				var oIndexs = oEvent.getSource().sId.split("-");
				oIndexs = oIndexs[oIndexs.length - 1];
				if (mod.MODIFICA_PREZZO !== undefined && mod.MODIFICA_PREZZO !== "") {
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editPrice = true;
				}
				if (mod.MODIFICA_QUANTITA !== undefined && mod.MODIFICA_QUANTITA !== "") {
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editQuantity = true;
				} else {
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editQuantity = false;
				}
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editMode = true;
				// salvo il prezzo calcolato originale di posizione e le percentuali di scostamento prese dalla tabella T_PROFILI_CONFERMA per poi fare i controlli sullo scostamento percentuale
				var PEINH = that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].PEINH;
				var NETPR = that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].NETPR;
				if (NETPR != undefined && NETPR != "" && PEINH != undefined && PEINH != "") {
					PEINH = parseFloat(PEINH);
					NETPR = parseFloat(NETPR);
					var prezzoOriginale = NETPR / PEINH;
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].OriginalPrice = prezzoOriginale;
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].OriginalPEINH = PEINH;
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].OriginalNETPR = NETPR;
				}
				if (mod.PERC_INFERIORE !== undefined && mod.PERC_INFERIORE != "")
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].PricePercDOWN = parseInt(mod.PERC_INFERIORE);
				if (mod.PERC_SUPERIORE !== undefined && mod.PERC_SUPERIORE != "")
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].PricePercUP = parseInt(mod.PERC_SUPERIORE);

				that.getView().getModel("SelectedPositionsJSONModel").refresh();
			} else {
				var oIndexs = oEvent.getSource().sId.split("-");
				oIndexs = oIndexs[oIndexs.length - 1];
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editPrice = false;
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editQuantity = true;
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].editMode = false;
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].UPDKZ = "";
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].PricePercDOWN = undefined;
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].PricePercUP = undefined;
				if (that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].OriginalPEINH !== undefined)
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].PEINH = that.getView().getModel(
						"SelectedPositionsJSONModel").getData()[oIndexs].OriginalPEINH;
				if (that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].OriginalNETPR !== undefined)
					that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].NETPR = that.getView().getModel(
						"SelectedPositionsJSONModel").getData()[oIndexs].OriginalNETPR;

				that.getView().getModel("SelectedPositionsJSONModel").refresh();
			}
			that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].EBTYP = sSelectedKey;
			if (mod !== undefined) {
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].KSCHL = mod.TIPO_COND_PREZZO;
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].UPDKZ = mod.TIPO_CONFERMA;
			} else {
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].KSCHL = "";
				that.getView().getModel("SelectedPositionsJSONModel").getData()[oIndexs].UPDKZ = "";
			}
		},

		onCloseOrderPositions: function () {
			if (this.oConfirmPositionsFragment) {
				this.oConfirmPositionsFragment.close();
				this.oConfirmPositionsFragment.destroy();
				this.oConfirmPositionsFragment = undefined;
			}
		},

		addSchedulations: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getParent().getBindingContext("SelectedPositionsJSONModel").sPath;
			var mod = that.getModel("SelectedPositionsJSONModel").getProperty(oPath);

			var schedulation = {
				"EINDT": "",
				"MENGE": ""
			};
			if (mod !== undefined && mod.POItemSchedulers.results !== undefined) {
				mod.POItemSchedulers.results.push(schedulation);
			} else {
				var oSchedulationsArray = [];
				oSchedulationsArray.push(schedulation);
				mod.POItemSchedulers.results = oSchedulationsArray;
			}
			this.getModel("SelectedPositionsJSONModel").refresh();
		},

		onDeleteSchedulation: function (oEvent) {
			var oPath = oEvent.getSource().getParent().getParent().getBindingContext("SelectedPositionsJSONModel").sPath;
			var mod = that.getModel("SelectedPositionsJSONModel").getProperty(oPath);

			var keys = oEvent.getParameter("id");
			var splits = keys.split("-");
			var rowNumber = splits[splits.length - 1];

			if (mod !== undefined && mod.POItemSchedulers.results !== null) {
				mod.POItemSchedulers.results.splice(rowNumber, 1);
			}
			this.getModel("SelectedPositionsJSONModel").refresh(true);
		},

		onConfirmPositionsDialog: function () {
			var model = that.getModel("SelectedPositionsJSONModel").oData;
			var err = "";
			for (var i = 0; i < model.length; i++) {

				//se per la posizione i-esima non ho selezionato il profiliConferma blocco tutto
				if (model[i].profiliConferma != undefined && model[i].profiliConferma != "") {
					if (model[i].EBTYP === undefined || model[i].EBTYP === "") {
						err = that.getResourceBundle().getText("ERR_Confirmation_Type_Mandatory", model[i].EBELP);
						break;
					}
				}
				var sommaQuantitaSchedulazioni = 0;
				if (model[i].POItemSchedulers.results) {
					for (var j = 0; j < model[i].POItemSchedulers.results.length; j++) {
						sommaQuantitaSchedulazioni = sommaQuantitaSchedulazioni + parseInt(model[i].POItemSchedulers.results[j].MENGE);
						if ((model[i].POItemSchedulers.results[j]) && ((model[i].POItemSchedulers.results[j].EINDT == "") || (model[i].POItemSchedulers
								.results[
									j].MENGE == ""))) {
							err = that.getResourceBundle().getText("ERR_Schedulations_Mandatory");
							break;
						}
					}
					if (err != "") {
						break;
					}
				}

				// nel caso in cui sono in modifica ("TIPO_CONFERMA": "4" ma a sap passiamo EBTYP === "CH") devo controllare che la somma delle quantità sia = alla quantità totale di posizione
				if (model[i].EBTYP !== undefined && model[i].EBTYP === "CH") {
					if (model[i].MENGE !== undefined && model[i].MENGE != "" && sommaQuantitaSchedulazioni > parseFloat(model[i].MENGE)) {
						err = that.getResourceBundle().getText("ERR_Sum_Schedulations", model[i].EBELP);
						break;
					}
					// controllo che il prezzo modificato sia all'interno delle percentuali di scostamento se ci sono
					if (model[i].PricePercDOWN !== undefined) {
						if (model[i].OriginalPrice !== undefined) {

							var PEINH = model[i].PEINH;
							var NETPR = model[i].NETPR;
							if (NETPR != undefined && NETPR != "" && PEINH != undefined && PEINH != "") {
								PEINH = parseFloat(PEINH);
								NETPR = parseFloat(NETPR);
								var nuovoPrezzoPosizione = NETPR / PEINH;
								var differenzaPrezzo = nuovoPrezzoPosizione - model[i].OriginalPrice;
								if (differenzaPrezzo > 0) {
									// differenza positiva
									var percScostamentoUP = (differenzaPrezzo / model[i].OriginalPrice) * 100;
									if (percScostamentoUP > model[i].PricePercUP) {
										err = that.getResourceBundle().getText("ERR_Price_Perc_Up", model[i].EBELP);
										break;
									}
								}
								if (differenzaPrezzo < 0) {
									// differenza positiva
									var percScostamentoDown = ((differenzaPrezzo * -1) / model[i].OriginalPrice) * 100;
									if (percScostamentoDown > model[i].PricePercDOWN) {
										err = that.getResourceBundle().getText("ERR_Price_Perc_Down", model[i].EBELP);
										break;
									}
								}
							}
						}
					}
				}
			}
			if (err !== "") {
				MessageBox.error(err);
				err = "";
			} else {
				var navCon = sap.ui.getCore().byId("navCon");
				navCon.to(sap.ui.getCore().byId("p2"), "slide");
			}
		},

		onConfirmAndClose: function () {

			if (sap.ui.getCore().byId("XBLNR").getValue() === undefined || sap.ui.getCore().byId("XBLNR").getValue() === "") {
				MessageBox.error(that.getResourceBundle().getText("ERR_Confirm_Position_Text"));
				return;
			}

			MessageBox.warning(that.getResourceBundle().getText("MSG_Confirm_Position_Text"), {
				icon: MessageBox.Icon.WARNING,
				title: "Warning",
				actions: [MessageBox.Action.CANCEL, MessageBox.Action.OK],
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.OK) {
						var body = {
							"ekes": [],
							"eket": [],
							"ekko": [{
								"EBELN": that.getModel("DataJSONModel").getData().EBELN,
								"LIFNR": that.getModel("DataJSONModel").getData().LIFNR,
								"ZCUSTOM01": "",
								"ZCUSTOM02": "",
								"ZCUSTOM03": "",
								"ZCUSTOM04": "",
								"ZCUSTOM05": "",
								"ZCUSTOM06": "",
								"ZCUSTOM07": "",
								"ZCUSTOM08": "",
								"ZCUSTOM09": "",
								"ZCUSTOM10": ""
							}],
							"ekpo": [],
							"userid": that.getCurrentUserId()
						};
						var ekpoRow = that.getModel("SelectedPositionsJSONModel").getData();
						if (ekpoRow !== undefined) {
							for (var i = 0; i < ekpoRow.length; i++) {
								var row = ekpoRow[i];
								if (row.POItemSchedulers.results !== undefined) {
									for (var j = 0; j < row.POItemSchedulers.results.length; j++) {
										var singleEkesModel = {};
										var singleEketModel = {};

										singleEkesModel.ETENS = "" + j;
										singleEketModel.ETENR = "" + j;
										singleEkesModel.EBELN = row.EBELN;
										singleEketModel.EBELN = row.EBELN;
										singleEkesModel.EBELP = row.EBELP;
										singleEketModel.EBELP = row.EBELP;

										if (row.POItemSchedulers.results[j].EBTYP !== undefined) {
											singleEkesModel.EBTYP = row.POItemSchedulers.results[j].EBTYP;
										} else {
											if (row.POItemSchedulers.results[j].EBTYP === undefined && row.EBTYP === undefined)
												singleEkesModel.EBTYP = "";
											else if (row.POItemSchedulers.results[j].EBTYP === undefined)
												singleEkesModel.EBTYP = row.EBTYP;
											else if (row.EBTYP === undefined && row.POItemSchedulers.results[j].EBTYP != undefined)
												singleEkesModel.EBTYP = row.POItemSchedulers.results[j].EBTYP;
										}

										singleEkesModel.EINDT = row.POItemSchedulers.results[j].EINDT;
										singleEketModel.EINDT = row.POItemSchedulers.results[j].EINDT;
										if (row.POItemSchedulers.results[j].LPEIN === undefined || row.POItemSchedulers.results[j].LPEIN === "") {
											singleEkesModel.LPEIN = "D";
											singleEketModel.LPEIN = "D";
										} else {
											singleEkesModel.LPEIN = row.POItemSchedulers.results[j].LPEIN;
											singleEketModel.LPEIN = row.POItemSchedulers.results[j].LPEIN;
										}
										singleEkesModel.MENGE = row.POItemSchedulers.results[j].MENGE;
										singleEketModel.MENGE = row.POItemSchedulers.results[j].MENGE;
										singleEketModel.WEMNG = "0";
										singleEketModel.MNG02 = "0";
										if (row.POItemSchedulers.results[j].UZEIT === undefined) {
											singleEkesModel.UZEIT = "000000";
										} else {
											singleEkesModel.UZEIT = row.POItemSchedulers.results[j].UZEIT;
										}
										if (row.POItemSchedulers.results[j].XBLNR === undefined || row.POItemSchedulers.results[j].XBLNR === "") {
											singleEkesModel.XBLNR = sap.ui.getCore().byId("XBLNR").getValue();
										} else {
											singleEkesModel.XBLNR = row.POItemSchedulers.results[j].XBLNR;
										}
										body.ekes.push(singleEkesModel);
										body.eket.push(singleEketModel);
									}
								}
								var singleEkpoModel = {};
								singleEkpoModel.EBELN = row.EBELN;
								singleEkpoModel.EBELP = row.EBELP;
								singleEkpoModel.MENGE = row.MENGE;
								singleEkpoModel.MEINS = row.MEINS;
								singleEkpoModel.NETPR = row.NETPR;
								singleEkpoModel.PEINH = row.PEINH;
								if (row.KSCHL === undefined)
									singleEkpoModel.KSCHL = "";
								else
									singleEkpoModel.KSCHL = row.KSCHL;
								singleEkpoModel.BPRME = row.BPRME;
								singleEkpoModel.BPUMZ = row.BPUMZ;
								singleEkpoModel.BPUMN = row.BPUMN;
								singleEkpoModel.UMREZ = row.UMREZ;
								singleEkpoModel.UMREN = row.UMREN;
								singleEkpoModel.LABNR = row.LABNR;
								if (row.UPDKZ === undefined)
									singleEkpoModel.UPDKZ = "L";
								else
									singleEkpoModel.UPDKZ = row.UPDKZ;
								singleEkpoModel.ZCUSTOM01 = row.ZCUSTOM01;
								singleEkpoModel.ZCUSTOM02 = row.ZCUSTOM02;
								singleEkpoModel.ZCUSTOM03 = row.ZCUSTOM03;
								singleEkpoModel.ZCUSTOM04 = row.ZCUSTOM04;
								singleEkpoModel.ZCUSTOM05 = row.ZCUSTOM05;
								singleEkpoModel.ZCUSTOM06 = row.ZCUSTOM06;
								singleEkpoModel.ZCUSTOM07 = row.ZCUSTOM07;
								singleEkpoModel.ZCUSTOM08 = row.ZCUSTOM08;
								singleEkpoModel.ZCUSTOM09 = row.ZCUSTOM09;
								singleEkpoModel.ZCUSTOM10 = row.ZCUSTOM10;
								body.ekpo.push(singleEkpoModel);

							}
						}

						var url = "/SupplierPortal_OrdersManagement/xsOdata/ConfirmOrders.xsjs";
						that.showBusyDialog();
						that.ajaxPost(url, body, "/SupplierPortal_OrdersManagement", function (oData) { // funzione generica su BaseController
							that.hideBusyDialog();
							if (oData) {
								if (oData.errLog) {
									MessageBox.error(decodeURI(oData.errLog));
									return;
								}
								if (oData.results && oData.results && oData.results.length > 0) {
									var messageError = "";
									var messageWarning = "";
									$.each(oData.results, function (index, item) {
										if (item.MSGTY !== undefined && item.MSGTY === 'E')
											messageError = item.MESSAGE + " \n " + messageError;
										if (item.MSGTY !== undefined && (item.MSGTY === 'W' || item.MSGTY === 'I'))
											messageWarning = item.MESSAGE + " \n " + messageWarning;
									});
									if (messageError !== "" && messageWarning !== "") {
										MessageBox.error(messageError + "\n" + messageWarning);
									} else {
										if (messageError !== "")
											MessageBox.error(messageError);
										if (messageWarning !== "")
											MessageBox.warning(messageWarning);
									}

								} else {
									MessageBox.success(that.getResourceBundle().getText("correctConfirmPositions"), {
										title: "Success", // default
										onClose: function () {
												that.onCloseOrderPositions();
											} // default

									});

								}
							}

						});
					}
				}
			});
		},

		onNavBackToConfirm: function () {
			var navCon = sap.ui.getCore().byId("navCon");
			navCon.to(sap.ui.getCore().byId("p1"), "slide");
		},

		getLastSchedulationPosition: function (modelData) {
			var lastPos = 0;
			// if (tableName === 'Ekes') {
			for (var i = 0; i < modelData.length; i++) {
				if (modelData[i].ETENS != undefined && parseInt(modelData[i].ETENS) > lastPos) {
					lastPos = parseInt(modelData[i].ETENS);
				}
			}
			return "" + (lastPos + 10);
			// }
			// if (tableName === 'Eket') {
			// 	for (var i = 0; i < modelData.length; i++) {
			// 		if (modelData[i].ETENR != undefined && parseInt(modelData[i].ETENR) > lastPos) {
			// 			lastPos = parseInt(modelData[i].ETENR);
			// 		}
			// 	}
			// 	return "" + (lastPos + 10);
			// }
		},

		onChangeProfiloConsegna: function (oEvent) {
			var sObjectId = that.getModel("DataJSONModel").getData().EBELN;
			var selectedKey = oEvent.getSource().getSelectedItem().getKey();

			var profiliConsegna = that.getModel("AllProfiliConfermaJSONModel").getData().results;
			var profiloSelezionato = [];
			if (profiliConsegna != undefined) {
				profiloSelezionato = profiliConsegna.find(x => x.CAT_CONFERMA === selectedKey);
			}

			that.loadObject(sObjectId, profiloSelezionato !== undefined ? profiloSelezionato.PROFILO_CONTROLLO : "", selectedKey, function (
				oData) {
				that.hideBusyDialog();
				if (oData === null || oData === undefined) {

				} else {
					that._completeInit("Display", oData, function () {

					});
				}
			});
		}

	});

});