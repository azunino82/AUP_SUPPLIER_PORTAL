jQuery.sap.require("it.alteaup.supplier.portal.nonConformita.js.formatter");
sap.ui.define([
	"it/alteaup/supplier/portal/nonConformita/AUPSUP_HTML5_NONCONFORMITA/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/PDFViewer"
], function (BaseController, JSONModel, MessageBox, MessageToast, Export, ExportTypeCSV, PDFViewer) {
	"use strict";
	var that;
	var myPDFViewer;
	return BaseController.extend("it.alteaup.supplier.portal.nonConformita.AUPSUP_HTML5_NONCONFORMITA.controller.Worklist", {
		onInit: function () {
			that = this;

			that.getUserInfo();

			// questo meccanismo serve per cercare l'ordine dal link della mail. funziona solo sul portale pubblicato non in preview da webide
			var startupParams = undefined;
			if (that.getOwnerComponent().getComponentData() != undefined) {
				startupParams = that.getOwnerComponent().getComponentData().startupParameters;
			}

			if (startupParams != undefined && startupParams.objectId && startupParams.objectId[0]) {

				var body = {
					"matnr": [],
					"mawerk": [],
					"lifnum": [],
					"idnlf": "",
					"ernam": "",
					"MatnrDesc": "",
					"metaids": [],
					"bu": "",
					"qmnum": startupParams.objectId[0],
					"qmart": [],
					"qmart_stat": [],
					"spras": sap.ui.getCore().getConfiguration().getLanguage() !== undefined ? sap.ui.getCore().getConfiguration().getLanguage().toUpperCase()
						.charAt(0) : "I" // TODO da prendere dall'utente
				};

				var url = "/SupplierPortal_Notifications/xsOdata/GetNotificationList.xsjs";
				this.showBusyDialog();
				that.ajaxPost(url, body, "/SupplierPortal_Notifications", function (oData) { // funzione generica su BaseController
					that.hideBusyDialog();
					if (oData) {
						var oModel = new JSONModel();
						oModel.setData(oData);
						for (var i = 0; i < oData.results.length; i++) {
							/*Assegnazione Colore*/
							if (oData.results[i].DRAW_EXIST === "X")
								oData.results[i].color = 'L'; //"Accept";
							else {
								oData.results[i].color = ''; //"Default";
							}
						}
						that.getView().setModel(oModel, "NCJSONModel");
						that.getView().byId("NCTable").setModel(oModel);
					}

				});
			}

			that.getMetasupplier();
			that.getPlants();
			that.getTipoAvviso();
			that.getDocumentCustomizingData();

			var filterModel = {
				"userid": that.getCurrentUserId(),
				"matnr": [],
				"mawerk": [],
				"lifnum": [],
				"idnlf": "",
				"ernam": "",
				"MatnrDesc": "",
				"metaids": [],
				"qmnum": "",
				"bu": "",
				"qmart": [],
				"qmart_stat": [],
				"spras": sap.ui.getCore().getConfiguration().getLanguage() !== undefined ? sap.ui.getCore().getConfiguration().getLanguage().toUpperCase()
					.charAt(0) : "I" // TODO da prendere dall'utente
			};

			var oModel = new JSONModel();
			oModel.setData(filterModel);
			this.getView().setModel(oModel, "filterNCJSONModel");
			
			this.getView().setModel(sap.ui.getCore().getModel("userapi"), "userapi");			
		},

		getMetasupplier: function () {

			var url = "/backend/Utils/UtilsManagement/GetMetasupplierList";
			that.ajaxGet(url, function (oData) {
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "MetasupplierJSONModel");
					//Valorizzazione Campo Lifnr per Servizio
					var oLifnr = that.getModel("filterOrdersJSONModel");
					oLifnr = oData.results;
					var oModelLF = new JSONModel();
					oModelLF.setData(oLifnr);
					that.getView().setModel(oModelLF, "filterOrdersJSONModel");
				}
			})
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
		getDocumentCustomizingData: function () {
			var oModelData = this.getOwnerComponent().getModel("DocumentCustomizingModel");

			oModelData.read("/DocumentManagement", {
				urlParameters: {
					"$filter": "CLASSIFICATION eq 'REP_8D'"
				},
				success: function (oData, oResponse) {
					if (oData && oData.results && oData.results[0]) {
						var oModel = new JSONModel(oData.results[0]);
						that.getView().setModel(oModel, "DocumentManagementJSONModel");
					}
				},
				error: function (err) {

				}
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
			that.getModel("filterNCJSONModel").getData().lifnum = slifnr;

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
			that.getModel("filterNCJSONModel").getData().lifnum = lifnr;
		},

		// getBu: function () {

		// 	var url = "/SupplierPortal_Utils/xsOdata/GetUserBU.xsjs?I_USERID=" + that.getCurrentUserId();
		// 	that.ajaxGet(url, function (oData) {
		// 		if (oData) {
		// 			var jsonModel = new sap.ui.model.json.JSONModel();
		// 			jsonModel.setData(oData);
		// 			that.getView().setModel(jsonModel, "BUJSONModel");
		// 		}
		// 	});
		// },

		getTipoAvviso: function () {
			var url = "/backend/Utils/UtilsManagement/GetAvvisiQualita";
			that.ajaxGet(url, function (oData) {
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "avvisiQualitaJSONModel");
				}
			});			
		},
		
		onChangeBU: function (oEvent) {
			that.getView().setModel(null, "avvisiQualitaJSONModel");
			var selectedBU = oEvent.oSource.getSelectedKey();
			var oModelData = this.getOwnerComponent().getModel("UtilsModel");
			oModelData.read("/GetAvvisiQualita", {
				urlParameters: {
					"$filter": "BU eq '" + selectedBU + "'"
				},
				success: function (oData, oResponse) {
					if (oData) {
						var oModel = new JSONModel();
						oModel.setData(oData);
						that.getView().setModel(oModel, "avvisiQualitaJSONModel");

					}
				},
				error: function (err) {}
			});

		},

		onChangeTipoAvviso: function (oEvent) {
			that.getView().setModel(null, "statusJSONModel");
			var selectedTipoAvviso = oEvent.oSource.getSelectedKey();
			var filterNCModel = that.getView().getModel("filterNCJSONModel");
			if (selectedTipoAvviso !== undefined && selectedTipoAvviso !== "" && filterNCModel.getData() !== undefined) {
				var oModelData = this.getOwnerComponent().getModel("UtilsModel");
				oModelData.read("/GetAvvisiQualita", {
					urlParameters: {
						"$filter": "TIPO_AVVISO eq '" + selectedTipoAvviso + "'"
					},
					success: function (oData, oResponse) {
						if (oData && oData.results && oData.results.length > 0) {
							that.getModel("filterNCJSONModel").getData().qmart_stat = [];
							var elem = oData.results[0].IN_PROCESS;
							that.getModel("filterNCJSONModel").getData().qmart_stat.push({
								"QMART": selectedTipoAvviso,
								"STAT": elem
							});
							// var statusList = [];
							// $.each(oData.results, function (key, value) {

							// var elem = {
							// 	"Code": value.IN_PROCESS,
							// 	"Descr": that.getResourceBundle().getText("inProgress")
							// };
							// statusList.push(elem);
							// elem = {
							// 	"Code": value.COMPLETED,
							// 	"Descr": that.getResourceBundle().getText("completed")
							// };
							// statusList.push(elem);
							// });
							// var oModel = new JSONModel();
							// oModel.setData(statusList);
							// that.getView().setModel(oModel, "statusJSONModel");

						}
					},
					error: function (err) {}
				});
			}
		},

		handleMatnr: function () {

			if (!that.oSearchMatnrDialog) {
				that.oSearchMatnrDialog = sap.ui.xmlfragment("it.alteaup.supplier.portal.nonConformita.fragments.SearchMatnr", that);
				that.getView().addDependent(that.oSearchMatnrDialog);
			}
			that.oSearchMatnrDialog.open();
			var oTable = sap.ui.getCore().byId("idMatnrTable");
			var oItems = oTable.getItems();

			var body = {
				"userid": that.getCurrentUserId(),
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

			that.getModel("filterNCJSONModel").getData().matnr = selectedMatnr;
			that.getModel("filterNCJSONModel").getData().MatnrDesc = selectedMatnrDesc;

			this.oSearchMatnrDialog.close();
			this.oSearchMatnrDialog.destroy();
			this.oSearchMatnrDialog = undefined;
			that.getModel("filterNCJSONModel").refresh();
		},
		onClearMaterialSearchFilters: function () {
			this.getView().getModel("MatnrSearchJSONModel").getData().matnr = "";
			this.getView().getModel("MatnrSearchJSONModel").getData().maktx = "";
			that.getView().getModel("MatnrJSONModel").setData(null);
			this.getView().getModel("MatnrSearchJSONModel").refresh();
		},

		onSearchNC: function () {
			var url = "/SupplierPortal_Notifications/xsOdata/GetNotificationList.xsjs";
			var body = that.getModel("filterNCJSONModel").getData();
			this.showBusyDialog();
			that.ajaxPost(url, body, "/SupplierPortal_Notifications", function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					for (var i = 0; i < oData.results.length; i++) {
						/*Assegnazione Colore*/
						if (oData.results[i].DRAW_EXIST === "X")
							oData.results[i].color = 'L'; //"Accept";
						else {
							oData.results[i].color = ''; //"Default";
						}
					}
					that.getView().setModel(oModel, "NCJSONModel");
					that.getView().byId("NCTable").setModel(oModel);
				}

			});
		},

		onTypeMissmatch: function (oControlEvent) {
			MessageToast.show(that.getResourceBundle().getText("ERR_Type_missmatch"));
		},

		onFileSizeExceed: function (oControlEvent) {
			MessageToast.show(that.getResourceBundle().getText("ERR_file_size"));
		},

		onPrint: function (oEvent) {
			var getTabledata = that.getView().getModel("NCJSONModel").getData().results;
			var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
			var selctedRowdata = getTabledata[itemPosition];

			var url = "/SupplierPortal_Documents/xsOdata/DocPrint.xsjs?I_QMART=" + selctedRowdata.QMART + "&I_NOTIF_NO=" + selctedRowdata.QMNUM;

			that._pdfViewer = new PDFViewer();
			that._pdfViewer.setShowDownloadButton(false);
			that._pdfViewer.attachSourceValidationFailed(function (oControlEvent) {
				oControlEvent.preventDefault();
			});
			that.getView().addDependent(that._pdfViewer);
			that._pdfViewer.setSource(url);
			that._pdfViewer.open();
		},
		onDetails: function (oEvent) {

			var getTabledata = that.getView().getModel("NCJSONModel").getData().results;
			var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
			var selctedRowdata = getTabledata[itemPosition];

			/*Gestione Edit*/
			var oModel = new JSONModel();
			if (selctedRowdata)
				oModel.setData(selctedRowdata);
			that.getView().setModel(oModel, "NCDetailJSONModel");

			var SPRAS = sap.ui.getCore().getConfiguration().getLanguage() !== undefined ? sap.ui.getCore().getConfiguration().getLanguage().toUpperCase()
				.charAt(0) : "I";

			var url = "/SupplierPortal_Notifications/xsOdata/GetNotificationDetail.xsjs?I_USERID=" + this.getCurrentUserId() + "&I_QMNUM=" +
				selctedRowdata.QMNUM + "&I_SPRAS=" + SPRAS;
			this.showBusyDialog();
			jQuery.ajax({
				url: url,
				method: 'GET',
				async: true,
				contentType: 'application/json',
				success: function (oDataD) {
					that.hideBusyDialog();
					if (oDataD) {
						var oModelD = new JSONModel();
						oModelD.setData(oDataD);
						that.getView().setModel(oModelD, "DetailJSONModel");
						if (!that.oDetailsFragment) {
							that.oDetailsFragment = sap.ui.xmlfragment("it.alteaup.supplier.portal.nonConformita.fragments.Detail", that)
							that.getView().addDependent(that.oDetailsFragment);
						}

						that.oDetailsFragment.open();
					}
				}
			});

			// that.ajaxGet(url, function (oDataD) { // funzione generica su BaseController
			// 	this.hideBusyDialog();
			// 	if (oDataD) {
			// 		var oModelD = new JSONModel();
			// 		oModelD.setData(oDataD);
			// 		that.getView().setModel(oModelD, "DetailJSONModel");
			// 		if (!that.oDetailsFragment) {
			// 			that.oDetailsFragment = sap.ui.xmlfragment("it.alteaup.supplier.portal.nonConformita.fragments.Detail", that)
			// 			that.getView().addDependent(that.oDetailsFragment);
			// 		}

			// 		that.oDetailsFragment.open();
			// 	}
			// });

			// if (selctedRowdata.t_VIQMFE) {
			// 	for (var i = 0; i < selctedRowdata.t_VIQMFE.results.length; i++) {
			// 		if (selctedRowdata.t_VIQMFE.results[i].AKTYP === "D" || selctedRowdata.t_VIQMFE.results[i].AKTYP === "H" || selctedRowdata.t_VIQMFE
			// 			.results[i].AKTYP === "")
			// 			selctedRowdata.t_VIQMFE.results[i].edit = false;
			// 		else {
			// 			if (selctedRowdata.t_VIQMFE.results[i].AKTYP === "E")
			// 				selctedRowdata.t_VIQMFE.results[i].edit = true;
			// 		}
			// 	}
			// }
			// if (selctedRowdata.t_VIQMUR) {
			// 	for (var i = 0; i < selctedRowdata.t_VIQMUR.results.length; i++) {
			// 		if (selctedRowdata.t_VIQMUR.results[i].AKTYP === "D" || selctedRowdata.t_VIQMUR.results[i].AKTYP === "H" || selctedRowdata.t_VIQMUR
			// 			.results[i].AKTYP === "")
			// 			selctedRowdata.t_VIQMUR.results[i].edit = false;
			// 		else {
			// 			if (selctedRowdata.t_VIQMUR.results[i].AKTYP === "E")
			// 				selctedRowdata.t_VIQMUR.results[i].edit = true;
			// 		}
			// 	}
			// }
			// if (selctedRowdata.t_VIQMSM) {
			// 	for (var i = 0; i < selctedRowdata.t_VIQMSM.results.length; i++) {
			// 		if (selctedRowdata.t_VIQMSM.results[i].AKTYP === "D" || selctedRowdata.t_VIQMSM.results[i].AKTYP === "H" || selctedRowdata.t_VIQMSM
			// 			.results[i].AKTYP === "")
			// 			selctedRowdata.t_VIQMSM.results[i].edit = false;
			// 		else {
			// 			if (selctedRowdata.t_VIQMSM.results[i].AKTYP === "E")
			// 				selctedRowdata.t_VIQMSM.results[i].edit = true;
			// 		}
			// 	}
			// }
			// if (selctedRowdata.t_VIQMMA) {
			// 	for (var i = 0; i < selctedRowdata.t_VIQMMA.results.length; i++) {
			// 		if (selctedRowdata.t_VIQMMA.results[i].AKTYP === "D" || selctedRowdata.t_VIQMMA.results[i].AKTYP === "H" || selctedRowdata.t_VIQMMA
			// 			.results[i].AKTYP === "")
			// 			selctedRowdata.t_VIQMMA.results[i].edit = false;
			// 		else {
			// 			if (selctedRowdata.t_VIQMMA.results[i].AKTYP === "E")
			// 				selctedRowdata.t_VIQMMA.results[i].edit = true;
			// 		}
			// 	}
			// }

			/*Fine gestione Edit*/

		},
		convertBinaryToHex: function (buffer) {
			return Array.prototype.map.call(new Uint8Array(buffer), function (x) {
				return ("00" + x.toString(16)).slice(-2);
			}).join("");
		},
		onCloseDetail: function () {
			if (this.oDetailsFragment) {
				this.oDetailsFragment.close();
				this.oDetailsFragment.destroy();
				this.oDetailsFragment = undefined;
			}
		},
		onConfirmDetail: function (oEvent) {

			MessageBox.warning(that.getResourceBundle().getText("MSG_Confirm_Text"), {
				icon: MessageBox.Icon.WARNING,
				title: "Warning",
				actions: [MessageBox.Action.CANCEL, MessageBox.Action.OK],
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.OK) {
						var body = {
							"it_viqmfe": [],
							"it_viqmma": [],
							"it_viqmsm": [],
							"it_viqmur": [],
							"i_notif": that.getModel("DetailJSONModel").getData().QMNUM,
							"userid": that.getCurrentUserId()
						};
						// Valorizzo Modifiche di posizione  -- DA RICONTROLLARE 17.12.2019
						var viqmfeRow = that.getModel("DetailJSONModel").getData().P_DEFECTS;
						if (viqmfeRow !== undefined) {
							var row = viqmfeRow.results;
							if (row !== undefined) {
								for (var i = 0; i < row.length; i++) {

									var singlefeModel = {};
									singlefeModel.FENUM = row[i].FENUM;
									singlefeModel.FETXT = row[i].FETXT;
									if (row[i].FETXT_LONG_NEW !== undefined)
										singlefeModel.FETXT_LONG = row[i].FETXT_LONG_NEW;
									else {
										singlefeModel.FETXT_LONG = '';
									}
									singlefeModel.AKTYP = row[i].AKTYP;
									body.it_viqmfe.push(singlefeModel);

									var viqmposRow = row[i].CMI;
									if (viqmposRow !== undefined) {
										var rowC = viqmposRow.results;
										if (rowC !== undefined) {
											for (var j = 0; j < rowC.length; j++) {

												if (rowC[j].TYPE === 'VIQMMA') {
													var singleposModel = {};
													singleposModel.MANUM = rowC[j].PROGRESSIVO;
													singleposModel.MATXT = rowC[j].TEXT;
													if (rowC[j].TEXT_LONG_NEW !== undefined)
														singleposModel.MATXT_LONG = rowC[j].TEXT_LONG_NEW;
													else {
														singleposModel.MATXT_LONG = '';
													}
													singleposModel.AKTYP = rowC[j].AKTYP;
													body.it_viqmma.push(singleposModel);
												}
												if (rowC[j].TYPE === 'VIQMSM') {
													var singleposModel = {};
													singleposModel.MANUM = rowC[j].PROGRESSIVO;
													singleposModel.MATXT = rowC[j].TEXT;
													if (rowC[j].TEXT_LONG_NEW !== undefined)
														singleposModel.MATXT_LONG = rowC[j].TEXT_LONG_NEW;
													else {
														singleposModel.MATXT_LONG = '';
													}
													singleposModel.AKTYP = rowC[j].AKTYP;
													body.it_viqmsm.push(singleposModel);
												}
												if (rowC[j].TYPE === 'VIQMUR') {
													var singleposModel = {};
													singleposModel.FENUM = rowC[j].FENUM;
													singleposModel.URNUM = rowC[j].PROGRESSIVO;
													singleposModel.URTXT = rowC[j].TEXT;
													if (rowC[j].TEXT_LONG_NEW !== undefined)
														singleposModel.URTXT_LONG = rowC[j].TEXT_LONG_NEW;
													else {
														singleposModel.URTXT_LONG = '';
													}
													singleposModel.AKTYP = rowC[j].AKTYP;
													body.it_viqmur.push(singleposModel);
												}
											} // chiusura ciclo di for CMI
										}
									}
								} // Chiusura ciclo di for
							}
						}
						// Valorizzo Modifiche di testata
						var viqmfeRow = that.getModel("DetailJSONModel").getData().T_VIQMFE;
						if (viqmfeRow !== undefined) {
							var rowT = viqmfeRow.results;
							if (rowT !== undefined) {
								for (var j = 0; j < rowT.length; j++) {
									var singlefeModel = {};
									singlefeModel.FENUM = rowT[j].FENUM;
									singlefeModel.FETXT = rowT[j].FETXT;
									if (rowT[j].FETXT_LONG_NEW !== undefined)
										singlefeModel.FETXT_LONG = rowT[j].FETXT_LONG_NEW;
									else {
										singlefeModel.FETXT_LONG = '';
									}
									singlefeModel.AKTYP = rowT[j].AKTYP;
									body.it_viqmfe.push(singlefeModel);
								}
							}
						}
						var viqmmaRow = that.getModel("DetailJSONModel").getData().T_VIQMMA;
						if (viqmmaRow !== undefined) {
							var rowT = viqmmaRow.results;
							if (rowT !== undefined) {
								for (var j = 0; j < rowT.length; j++) {
									var singlemaModel = {};
									singlemaModel.MANUM = rowT[j].MANUM;
									singlemaModel.MATXT = rowT[j].MATXT;
									if (rowT[j].MATXT_LONG_NEW !== undefined)
										singlemaModel.MATXT_LONG = rowT[j].MATXT_LONG_NEW;
									else {
										singlemaModel.MATXT_LONG = '';
									}
									singlemaModel.AKTYP = rowT[j].AKTYP;
									body.it_viqmma.push(singlemaModel);
								}
							}
						}
						var viqmsmRow = that.getModel("DetailJSONModel").getData().T_VIQMSM;
						if (viqmsmRow !== undefined) {
							var rowT = viqmsmRow.results;
							if (rowT !== undefined) {
								for (var j = 0; j < rowT.length; j++) {
									var singlesmModel = {};
									singlesmModel.MANUM = rowT[j].MANUM;
									singlesmModel.MATXT = rowT[j].MATXT;
									if (rowT[j].MATXT_LONG_NEW !== undefined)
										singlesmModel.MATXT_LONG = rowT[j].MATXT_LONG_NEW;
									else {
										singlesmModel.MATXT_LONG = '';
									}
									singlesmModel.AKTYP = rowT[j].AKTYP;
									body.it_viqmsm.push(singlesmModel);
								}
							}
						}
						var viqmurRow = that.getModel("DetailJSONModel").getData().T_VIQMUR;
						if (viqmurRow !== undefined) {
							var rowT = viqmurRow.results;
							if (rowT !== undefined) {
								for (var j = 0; j < rowT.length; j++) {
									var singleurModel = {};
									singleurModel.FENUM = rowT[j].FENUM;
									singleurModel.URNUM = rowT[j].URNUM;
									singleurModel.URTXT = rowT[j].URTXT;
									if (rowT[j].URTXT_LONG_NEW !== undefined)
										singleurModel.URTXT_LONG = rowT[j].URTXT_LONG_NEW;
									else {
										singleurModel.URTXT_LONG = '';
									}
									singleurModel.AKTYP = rowT[j].AKTYP;
									body.it_viqmur.push(singleurModel);
								}
							}
						}

						//chiamo Bapi per invio modifiche
						var url = "/SupplierPortal_Notifications/xsOdata/NotifChange.xsjs";
						that.showBusyDialog();
						that.ajaxPost(url, body, "/SupplierPortal_Notifications", function (oData) { // funzione generica su BaseController
							that.hideBusyDialog();
							if (oData !== undefined && oData.results.length > 0) {
								for (var i = 0; i < oData.results.length; i++) {
									var errLog = oData.results[i].MESSAGE;
									MessageBox.error(errLog);
								}
							} else {
								MessageToast.show(that.getResourceBundle().getText("Elaborato Correttamente"));
								// ricarico la pagina
								that.onSearchNC();
								// Chiudo
								that.onCloseDetail();
							}

						});

					}
				}
			});

		},
		onClearFilters: function () {
			if (that.getModel("filterNCJSONModel") !== undefined && that.getModel("filterOrdersJSONModel").getData() !== undefined) {
				that.getModel("filterNCJSONModel").getData().qmnum = '';
				that.getModel("filterNCJSONModel").getData().metaids = [];
				that.getModel("filterNCJSONModel").getData().lifnum = [];
				that.getModel("filterNCJSONModel").getData().matnr = [];
				that.getModel("filterNCJSONModel").getData().idnlf = '';
				that.getModel("filterNCJSONModel").getData().ernam = '';
				that.getModel("filterNCJSONModel").getData().MatnrDesc = '';
				that.getModel("filterNCJSONModel").getData().bu = '';
				that.getModel("filterNCJSONModel").getData().qmart = [];
				that.getModel("filterNCJSONModel").getData().qmart_stat = [];
			}
			if (that.getModel("MetasupplierJSONModel") !== undefined && that.getModel("MetasupplierJSONModel").getData() !== undefined) {
				that.getModel("MetasupplierJSONModel").getData().METAID = '';
			}
			if (that.getModel("lifnrJSONModel") !== undefined && that.getModel("lifnrJSONModel").getData() !== undefined) {
				that.getModel("lifnrJSONModel").setData(null);
			}
			if (that.getModel("filterNCJSONModel") !== undefined)
				that.getModel("filterNCJSONModel").refresh();
			if (that.getModel("MetasupplierJSONModel") !== undefined)
				that.getModel("MetasupplierJSONModel").refresh();
			if (that.getModel("lifnrJSONModel") !== undefined)
				that.getModel("lifnrJSONModel").refresh();
		},
		onItemUpload: function (oEvent) {
			var getTabledata = that.getView().getModel("NCJSONModel").getData().results;
			var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
			var selctedRowdata = getTabledata[itemPosition];

			var file = oEvent.getParameters().files[0];
			var xhr = new XMLHttpRequest();
			var fileName = file.name;

			var reader = new FileReader();
			reader.onload = function (e) {
				//var vContent = e.currentTarget.result.replace("data:" + file.type + ";base64,", "");
				var vContent = e.currentTarget.result.split(',');
				vContent = vContent[1];
				var url = "/SupplierPortal_Documents/xsOdata/DocUpload.xsjs?I_USERID=" + that.getCurrentUserId() +
					"&I_CLASSIFICATION=REP_8D&I_APPLICATION=NC&I_FILE_NAME=" + file.name + "&I_OBJECT_CODE=" + selctedRowdata.QMNUM + "&I_WERKS=" +
					selctedRowdata.MAWERK + "&I_LIFNR=" + selctedRowdata.LIFNUM;

				that.showBusyDialog();
				that.getToken("/SupplierPortal_Documents", function (token) {

					jQuery.ajax({
						url: url,
						headers: {
							'x-csrf-token': token
						},
						data: vContent, //e.currentTarget.result,
						method: 'POST',
						cache: false,
						contentType: false,
						processData: false,
						success: function (data) {
							that.hideBusyDialog();
							data = jQuery.parseJSON(data);
							if (data && data.docId) {
								MessageBox.success(that.getResourceBundle().getText("OK_Upload"));
							} else {
								if (data && data.message) {
									MessageBox.error(data.message);
								}
							}
						},
						error: function (e) {
							that.hideBusyDialog();
							if (e.responseText !== '' && e.responseText != undefined)
								MessageBox.error(e.responseText);
							else {
								if (e.responseJSON !== undefined && e.responseJSON != '' && e.responseJSON.errLog != undefined)
									MessageBox.error(e.responseJSON.errLog);
							}

						}
					});

				});
			};
			reader.readAsDataURL(file);
			var dublicateValue = [];

			// if (file) {
			// 	var url = "/SupplierPortal_Documents/xsOdata/DocUpload.xsjs?I_USERID=" + that.getCurrentUserId() +
			// 		"&I_CLASSIFICATION=REP_8D&I_FILE_NAME=" + file.name + "&I_OBJECT_CODE=" + selctedRowdata.QMNUM;

			// 	that.showBusyDialog();
			// 	that.getToken("/SupplierPortal_Documents", function (token) {
			// 		var formData = new FormData();
			// 		formData.append('document', file);
			// 		jQuery.ajax({
			// 			url: url,
			// 			headers: {
			// 				'x-csrf-token': token
			// 			},
			// 			data: reader,
			// 			method: 'POST',
			// 			cache: false,
			// 			contentType: false,
			// 			processData: false,
			// 			success: function (data) {
			// 				that.hideBusyDialog();
			// 				if (data && data.docId) {
			// 					MessageBox.success(that.getResourceBundle().getText("OK_Upload"));
			// 				} else {
			// 					if (data && data.message) {
			// 						MessageBox.error(data.message);
			// 					}
			// 				}
			// 			},
			// 			error: function (e) {
			// 				that.hideBusyDialog();
			// 				if (e.responseText !== '' && e.responseText != undefined)
			// 					MessageBox.error(e.responseText);
			// 				else {
			// 					if (e.responseJSON !== undefined && e.responseJSON != '' && e.responseJSON.errLog != undefined)
			// 						MessageBox.error(e.responseJSON.errLog);
			// 				}

			// 			}
			// 		});

			// 	});
			// }
		},

		onItemDownload: function (oEvent) {
			var getTabledata = that.getView().getModel("NCJSONModel").getData().results;
			var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
			var selctedRowdata = getTabledata[itemPosition];

			var url = "/SupplierPortal_Documents/xsOdata/DocList.xsjs?I_USERID=" + that.getCurrentUserId() +
				"&I_CLASSIFICATION=REP_8D&I_APPLICATION=NC&I_OBJECT_CODE=" + selctedRowdata.QMNUM;
			this.showBusyDialog();
			jQuery.ajax({
				url: url,
				method: 'GET',
				async: false,
				success: function (data) {

					if (data && data.results && data.results.length > 0) {
						var totDoc = data.results.length;
						data.results.forEach(function (elem) {
							url = "/sap/fiori/nonconformita/SupplierPortal_Documents/xsOdata/DocDownload.xsjs?I_USERID=" + that.getCurrentUserId() +
								"&I_DOKAR=" + elem.DOKAR + "&I_DOKNR=" + elem.DOKNR + "&I_DOKTL=" + elem.DOKTL + "&I_DOKVR=" + elem.DOKVR +
								"&I_LO_INDEX=" + elem.LO_INDEX + "&I_LO_OBJID=" + elem.LO_OBJID + "&I_OBJKY=" + elem.OBJKY + "&I_DOKOB=" + elem.DOKOB;
							// NB: questa chiamata fetch funziona SOLO su portale non con webide preview
							fetch(url)
								.then(resp => resp.blob())
								.then(blob => {
									const url = window.URL.createObjectURL(blob);
									const a = document.createElement('a');
									a.style.display = 'none';
									a.href = url;
									// the filename you want
									a.download = elem.DESCRIPTION !== undefined && elem.DESCRIPTION !== "" ? elem.DESCRIPTION : "outFile" + elem.EXTENSION;
									document.body.appendChild(a);
									a.click();
									window.URL.revokeObjectURL(url);
									totDoc--;
									if (totDoc <= 0) {
										that.hideBusyDialog();
									}
								})
								.catch(() => console.log("some error during download process"));

						});
					} else {
						that.hideBusyDialog();
						MessageBox.error(that.getResourceBundle().getText("ERR_file_not_found"));
					}
				},
				error: function (e) {
					that.hideBusyDialog();
					MessageBox.error(that.getResourceBundle().getText("ERR_file_not_found"));
				}
			});

			//		window.open(url);
			// this.showBusyDialog();
			// that.ajaxGet(url, function (oData) { // funzione generica su BaseController
			// 	that.hideBusyDialog();
			// 	if (oData) {
			// 		var filename = "text.xls";
			// 		if (typeof window.chrome !== 'undefined') {
			// 			// Chrome version
			// 			var link = document.createElement('a');
			// 			link.href = window.URL.createObjectURL(oData);
			// 			link.download = filename;
			// 			link.click();
			// 		} else if (typeof window.navigator.msSaveBlob !== 'undefined') {
			// 			// IE version
			// 			var blob = new Blob([req.response], {
			// 				type: 'application/pdf'
			// 			});
			// 			window.navigator.msSaveBlob(blob, filename);
			// 		} else {
			// 			// Firefox version
			// 			var file = new File([req.response], filename, {
			// 				type: 'application/force-download'
			// 			});
			// 			window.open(URL.createObjectURL(file));
			// 		}
			// 	} else {
			// 		MessageBox.error(that.getResourceBundle().getText("ERR_file_not_found"));
			// 	}
			// });

		},

		onExport: function (oEvent) {

			var dataS = this.getView().getModel("NCJSONModel");
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
				models: this.getView().getModel("NCJSONModel"),

				// binding information for the rows aggregation
				rows: {
					path: "/results"
				},

				// column definitions with column name and binding info for the content

				columns: [{
					name: that.getResourceBundle().getText("QMNUM"),
					template: {
						content: "{QMNUM}"
					}
				}, {
					name: that.getResourceBundle().getText("QMTXT"),
					template: {
						content: "{QMTXT}"
					}
				}, {
					name: that.getResourceBundle().getText("MATNR"),
					template: {
						content: "{MATNR}"
					}
				}, {
					name: that.getResourceBundle().getText("MAKTX"),
					template: {
						content: "{MAKTX}"
					}
				}, {
					name: that.getResourceBundle().getText("IDNLF"),
					template: {
						content: "{IDNLF}"
					}
				}, {
					name: that.getResourceBundle().getText("SERIALNR"),
					template: {
						content: "{SERIALNR}"
					}
				}, {
					name: that.getResourceBundle().getText("XBLNR"),
					template: {
						content: "{XBLNR}"
					}
				}, {
					name: that.getResourceBundle().getText("LIFNUM"),
					template: {
						content: "{LIFNUM}"
					}
				}, {
					name: that.getResourceBundle().getText("ERNAM_TEXT"),
					template: {
						content: "{ERNAM_TEXT}"
					}
				}, {
					name: that.getResourceBundle().getText("NAME1_WRK"),
					template: {
						content: "{NAME1_WRK}"
					}
				}, {
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
					name: that.getResourceBundle().getText("RKMNG"),
					template: {
						content: "{RKMNG} - {MGEIN}"
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