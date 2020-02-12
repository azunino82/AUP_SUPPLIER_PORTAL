var that;
sap.ui.define([
	"it/alteaup/supplier/portal/metasupplier/AUPSUP_HTML5_METASUPPLIER/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/model/Sorter"
], function (BaseController, JSONModel, MessageBox, MessageToast, Export, ExportTypeCSV, Sorter) {
	"use strict";

	return BaseController.extend("it.alteaup.supplier.portal.metasupplier.AUPSUP_HTML5_METASUPPLIER.controller.Metasuppliers", {
		onInit: function () {
			that = this;

			that.getCurrentSYSID();
			this.getView().setModel(sap.ui.getCore().getModel("userapi"), "userapi");

			// gestione delle permissions per il documentale
			//TODO da fare servizio	that.getDocumentCustomizingData();

			var startupParams = undefined;
			if (that.getOwnerComponent().getComponentData() != undefined) {
				startupParams = that.getOwnerComponent().getComponentData().startupParameters;
			}

			if (startupParams != undefined && startupParams.objectId && startupParams.objectId[0]) {
				that.getOwnerComponent().getRouter().navTo("RouteMetasupplierContacts", {
					metaid: startupParams.objectId[0]
				});

				return;
			}

			that.getOwnerComponent().getRouter().getRoute("RouteMetasuppliers").attachPatternMatched(that.handleRoutePatternMatched,
				this);
			that.getPurchaseOrganizations();
		},

		handleRoutePatternMatched: function (oEvent) {
			var user;

			if (that.getOwnerComponent().getModel("user") !== undefined && that.getOwnerComponent().getModel("user").getData() !==
				undefined && that.getOwnerComponent().getModel("user").getData().length > 0) {
				user = that.getOwnerComponent().getModel("user").getData()[0];
			}

			var editVisibleBool = true;
			var deleteVisibleBool = true;
			var contactsVisibleBool = true;
			var createVisibleBool = true;

			var metasupplierFilters = [];

			if (user !== undefined && user !== "" && user.userType !== null) {
				var appTitle = {
					"AppTitle": ""
				};
				switch (user.userType) {
					case "BC":
						editVisibleBool = true;
						deleteVisibleBool = true;
						contactsVisibleBool = false;
						createVisibleBool = true;
						appTitle.AppTitle = that.getResourceBundle().getText("BC");
						break;
					case "BM":
						editVisibleBool = false;
						deleteVisibleBool = false;
						contactsVisibleBool = true;
						createVisibleBool = false;
						appTitle.AppTitle = that.getResourceBundle().getText("BM");
						break;
					case "M":
						editVisibleBool = false;
						deleteVisibleBool = false;
						contactsVisibleBool = true;
						createVisibleBool = false;
						appTitle.AppTitle = that.getResourceBundle().getText("M");
						for (var i = 0; i < user.metaIDs.length; i++) {
							var filter = new sap.ui.model.Filter({
								path: "METAID",
								operator: "EQ",
								value1: user.metaIDs[i]
							});

							metasupplierFilters.push(filter);
						}

						if (user.metaIDs.length === 0) {
							var filter = new sap.ui.model.Filter({
								path: "METAID",
								operator: "EQ",
								value1: " "
							});
							metasupplierFilters.push(filter);
						}
						break;
				}
				var jsonModel = new sap.ui.model.json.JSONModel();
				jsonModel.setData(appTitle);
				that.getOwnerComponent().setModel(jsonModel, "titleJSONModel");
			}


			var url = "/backend/MetasupplierManagement/GetMetasupplier?I_ATTIVO=1";
			this.showBusyDialog();
			that.ajaxGet(url, function (oDataRes) {
				that.hideBusyDialog();

				that.getView().byId("createButton").setVisible(createVisibleBool);
				for (var x = 0; x < oDataRes.results.length; x++) {
					oDataRes.results[x].editVisible = editVisibleBool;
					oDataRes.results[x].deleteVisible = deleteVisibleBool;
					oDataRes.results[x].contactsVisible = contactsVisibleBool;
				}
				var jsonModel = new sap.ui.model.json.JSONModel();
				jsonModel.setData(oDataRes.results);
				that.getView().setModel(jsonModel, "tableModelMetasuppliers");
				that.getView().byId("idMetasuppliersTable").getColumns()[8].setVisible(editVisibleBool);
				that.getView().byId("idMetasuppliersTable").getColumns()[9].setVisible(deleteVisibleBool);
				that.getView().byId("idMetasuppliersTable").getColumns()[10].setVisible(contactsVisibleBool);

			});


			if (that.getView().byId("InputStatoMetafornitore").getItems().length === 0) {

				url = "/backend/MetasupplierManagement/GetSupplierStates";
				that.ajaxGet(url, function (oDataRes) {

					var lang = sap.ui.getCore().getConfiguration().getLanguage();
					var oSelectStatoFornitore = that.getView().byId("InputStatoMetafornitore");
					for (var i = 0; i < oDataRes.results.length; i++) {
						//Inserimento Record Vuoto per ComboBox
						if (i === 0) {
							var nl = new sap.ui.core.Item({
								key: "",
								text: ""
							});
							oSelectStatoFornitore.insertItem(nl);
						}
						var item = new sap.ui.core.Item({
							key: oDataRes.results[i].KEY,
							text: (lang === "it-IT") ? oDataRes.results[i].VALUE_IT : oDataRes.results[i].VALUE_EN
						});
						oSelectStatoFornitore.insertItem(item);
					}

				});

			}

		},

		onSearch: function (oEvent) {
			var vFilter;
			var list = that.getView().byId("idMetasuppliersTable");
			var oBinding = list.getBinding("items");
			var aFilters = [];

			var oSelectCodiceMetafornitore = that.getView().byId("InputCodiceMetafornitore");
			if (oSelectCodiceMetafornitore instanceof sap.m.Input) {
				vFilter = oSelectCodiceMetafornitore.getValue();
				if (vFilter !== "") {
					aFilters.push(new sap.ui.model.Filter("METAID", "Contains", vFilter));

				}
			}

			var oSelectRagSociale = that.getView().byId("InputRagSocialeMetafornitore");
			if (oSelectRagSociale instanceof sap.m.Input) {
				vFilter = oSelectRagSociale.getValue();
				if (vFilter !== "") {
					aFilters.push(new sap.ui.model.Filter("RAG_SOCIALE", "Contains", vFilter));

				}
			}

			var oSelectStatoMetafornitore = that.getView().byId("InputStatoMetafornitore");
			if (oSelectStatoMetafornitore instanceof sap.m.ComboBox) {
				vFilter = oSelectStatoMetafornitore.getSelectedKey();
				if (vFilter !== "") {
					aFilters.push(new sap.ui.model.Filter("STATO_FORNITORE", "EQ", vFilter));
				}
			}

			var oSelectPIVA = that.getView().byId("InputPivaMetafornitore");
			if (oSelectPIVA instanceof sap.m.Input) {
				vFilter = oSelectPIVA.getValue();
				if (vFilter !== "") {
					aFilters.push(new sap.ui.model.Filter("PIVA", "EQ", vFilter));

				}
			}

			var oSelectPaeseMetafornitore = that.getView().byId("InputPaeseMetafornitore");
			if (oSelectPaeseMetafornitore instanceof sap.m.Input) {
				vFilter = oSelectPaeseMetafornitore.getValue();
				if (vFilter !== "") {
					aFilters.push(new sap.ui.model.Filter("PAESE", "EQ", vFilter));

				}
			}

			oBinding.filter(aFilters);
		},

		handleCreateSupplierPressed: function () {
			that.getOwnerComponent().getRouter().navTo("RouteSuppliers");
		},

		editSupplier: function (oEvent) {
			/*Valorizzo i filtri per lettura riga selezionata*/
			var path = oEvent.getSource().getParent().getBindingContext("tableModelMetasuppliers").sPath;
			var data = that.getModel("tableModelMetasuppliers").getProperty(path);

			that.getView().setModel(null, "tableModelSuppliers");
			if (data.METAID !== "" && data.METAID !== undefined) {
				var url = "/backend/MetasupplierManagement/GetMetaidSuppliers?I_METAID=" + data.METAID;
				this.showBusyDialog();
				that.ajaxGet(url, function (oDatalf) {
					that.hideBusyDialog();
					if (oDatalf) {
						var lifnrMetaid = new sap.ui.model.json.JSONModel();
						lifnrMetaid.setData(oDatalf);
						that.getView().setModel(lifnrMetaid, "lifnrMetaidJSONModel");

						/*Fornitori possibili*/
						var jsonModel = new sap.ui.model.json.JSONModel();
						
						if (data !== undefined) {
							data.ATTIVO = data.ATTIVO !== undefined && data.ATTIVO === 1 ? true : false;
						}
						jsonModel.setData(data);
						that.getView().setModel(jsonModel, "metasupplierData");

						/*TODO fare servizio cerco i dati dei fornitori associati al metafornitore
						if (oDatalf.results && oDatalf.results.length > 0) {
							var url = "/SupplierPortal_Utils/xsOdata/GetVendorList.xsjs?I_USERID=" + that.getCurrentUserId();
							that.showBusyDialog();
							var body = {
								"lifnr": []
							};

							oDatalf.results.forEach(function (lifnrElem) {
								body.lifnr.push(lifnrElem.LIFNR);
							});

							that.ajaxPost(url, body, "/SupplierPortal_Utils", function (oData) { // funzione generica su BaseController
								that.hideBusyDialog();
								if (oData && oData.results && oData.results.length > 0) {
									var lookup = {};
									for (var item, i = 0; item = oData.results[i++];) {
										var lifnr = item.LIFNR;

										if (!(lifnr in lookup)) {
											lookup[lifnr] = 1;
											item.Rank = 1;
										}
									}
									// oData.results.forEach(function (lifnrElem) {
									// 	lifnrElem.Rank = 1;
									// });
									var jsonModelLf = new JSONModel();
									jsonModelLf.setData(oData);
									that.getView().setModel(jsonModelLf, "tableModelSuppliers");
								}
							});
						}*/

					} else {
						sap.m.MessageBox.error(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
							"noMetasupplierFoundForUser"));
					}
				});

				if (!that.oModMetaSupFragment) {
					that.oModMetaSupFragment = sap.ui.xmlfragment(
						"it.alteaup.supplier.portal.metasupplier.AUPSUP_HTML5_METASUPPLIER.fragments.ModMetasupplier", that);
					that.getView().addDependent(that.oModMetaSupFragment);
				}
				that.getBuyerBu();
				that.oModMetaSupFragment.open();
			}
		},

		getBuyerBu: function () {

			var url = "/backend/Utils/UtilsManagement/GetUserBU";
			that.ajaxGet(url, function (oData) {
				if (oData) {
					var jsonModel = new sap.ui.model.json.JSONModel();
					jsonModel.setData(oData);
					that.getView().setModel(jsonModel, "buyerBuJSONModel");
				}
			});

		},

		deleteMetasupplierRow: function (id) {

			if (id !== "" && id !== undefined) {
				var url = "/backend/Utils/MetasupplierManagement/DeleteMetaid?I_METAID=" + id;
				that.ajaxGet(url, function (oData) {
					if (oData) {
						that.handleRoutePatternMatched(null);
					}
				});
			}
		},

		deleteSupplier: function (oEvent) {
			var path = oEvent.getSource().getParent().getBindingContext("tableModelMetasuppliers");
			MessageBox.warning(that.getResourceBundle().getText("DeleteMetasupplierRow"), {
				icon: MessageBox.Icon.WARNING,
				title: "Warning",
				actions: [MessageBox.Action.CANCEL, MessageBox.Action.OK],
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.OK) {
						var data = that.byId("idMetasuppliersTable").getModel("tableModelMetasuppliers").getProperty(path.sPath);
						that.deleteMetasupplierRow(data.METAID);
					}
				}
			});
		},

		contactsSupplier: function (oEvent) {

			var path = oEvent.getSource().getParent().getBindingContext("tableModelMetasuppliers");
			var data = that.byId("idMetasuppliersTable").getModel("tableModelMetasuppliers").getProperty(path.sPath);
			that.getOwnerComponent().getRouter().navTo("RouteMetasupplierContacts", {
				metaid: data.METAID
			});
		},

		onClearFilters: function () {
			var CodiceMetafornitore = that.getView().byId("InputCodiceMetafornitore");
			if (CodiceMetafornitore instanceof sap.m.Input)
				CodiceMetafornitore.setValue();

			var RagSocialeMetafornitore = that.getView().byId("InputRagSocialeMetafornitore");
			if (RagSocialeMetafornitore instanceof sap.m.Input)
				RagSocialeMetafornitore.setValue();

			var StatoMetafornitore = that.getView().byId("InputStatoMetafornitore");
			if (StatoMetafornitore instanceof sap.m.ComboBox)
				StatoMetafornitore.setValue();

			var PivaMetafornitore = that.getView().byId("InputPivaMetafornitore");
			if (PivaMetafornitore instanceof sap.m.Input)
				PivaMetafornitore.setValue();

			var PaeseMetafornitore = that.getView().byId("InputPaeseMetafornitore");
			if (PaeseMetafornitore instanceof sap.m.Input)
				PaeseMetafornitore.setValue();

		},

		onCloseMod: function () {
			if (that.oModMetaSupFragment) {
				that.oModMetaSupFragment.close();
				that.oModMetaSupFragment.destroy();
				that.oModMetaSupFragment = undefined;
			}
		},
		onConfirmMod: function (oEvent) {

			var trovato = false;
			var lifnrMod = that.getView().getModel("tableModelSuppliers").getData();
			lifnrMod.results.forEach(function (lifnrElem) {
				if (lifnrElem.Rank === 1) {
					trovato = true;
				}
			});

			if (!trovato) {
				MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("ERR_No_Supplier_Selected"));
				return;
			}

			MessageBox.warning(that.getResourceBundle().getText("MSG_Confirm_Modify_Metasupplier"), {
				icon: MessageBox.Icon.WARNING,
				title: "Warning",
				actions: [MessageBox.Action.CANCEL, MessageBox.Action.OK],
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.OK) {

						var data = that.getModel("metasupplierData").getData();

						if (data !== undefined && data.ATTIVO === true) {
							data.ATTIVO = 1;
						} else {
							if (data !== undefined && data.ATTIVO === false) {
								data.ATTIVO = 0;
							}
						}

						/*Conferma modifiche a video*/
						if (data.METAID !== "" && data.METAID !== undefined) {
							/*Leggo Anagrafica Metafornitore*/
							that.showBusyDialog();
							var oModel = that.getOwnerComponent().getModel();
							oModel.update("/MetasupplierDataSet(METAID='" + data.METAID + "')", data, {
								success: function (oData, oResponse) {
									that.hideBusyDialog();
									/*Chiamo servizio per cancellazione MetaId dalla tabella Fornitori*/
									var url = "/SupplierPortal_Utils/xsOdata/DeleteMetaIdForn.xsjs?I_METAID=" + data.METAID;
									that.ajaxGet(url, function (oDataF) {

										lifnrMod.results.forEach(function (lifnrElem) {
											if (lifnrElem.Rank === 1) {
												var updateData = {};
												updateData.METAID = data.METAID;
												updateData.SYSID = sap.ui.getCore().getModel("sysIdJSONModel") !== undefined && sap.ui.getCore().getModel(
													"sysIdJSONModel").getData() !== undefined ? sap.ui.getCore().getModel("sysIdJSONModel").getData().SYSID : "";
												updateData.LIFNR = lifnrElem.LIFNR;

												oModel.create("/MetasupplierSupplierSet",
													updateData, {
													success: function () { },
													error: function (err) { }
												});
											}
										});
									});

									if (that.oModMetaSupFragment) {
										that.setModel(null, "metasupplierData");
										that.handleRoutePatternMatched(null);
										that.oModMetaSupFragment.close();
										that.oModMetaSupFragment.destroy();
										that.oModMetaSupFragment = undefined;
									}
								},
								error: function (err) {
									that.hideBusyDialog();
								}
							});
						}
					}
				}
			});

		},
		onSelectAll: function (oEvent) {

			var oTable = sap.ui.getCore().byId("idSuppliersTable");
			oTable.getItems().forEach(function (r) {
				var oPath = r.oBindingContexts.tableModelSuppliers.sPath;
				that.getModel("tableModelSuppliers").getProperty(oPath);
				that.getModel("tableModelSuppliers").getProperty(oPath).isSelected = oEvent.getParameters().selected;
			});

			that.getModel("tableModelSuppliers").refresh();
		},

		onExport: function (oEvent) {
			var dataS = this.getView().getModel("tableModelMetasuppliers");
			if (dataS === undefined || dataS.getData() === undefined || dataS.getData().length === 0) {
				MessageBox.error(that.getResourceBundle().getText("ERR_Export"));
				return;
			}

			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new ExportTypeCSV({
					separatorChar: ";"
				}),

				// Pass in the model created above
				models: that.getView().getModel("tableModelMetasuppliers"),

				// binding information for the rows aggregation
				rows: {
					path: "/"
				},

				// column definitions with column name and binding info for the content

				columns: [{
					name: that.getResourceBundle().getText("ragSocialeMetafornitore"),
					template: {
						content: "{RAG_SOCIALE}"
					}
				}, {
					name: that.getResourceBundle().getText("indirizzo"),
					template: {
						content: "{INDIRIZZO}"
					}
				}, {
					name: that.getResourceBundle().getText("nCivico"),
					template: {
						content: "{N_CIVICO}"
					}
				}, {
					name: that.getResourceBundle().getText("paeseMetafornitore"),
					template: {
						content: "{PAESE}"
					}
				}, {
					name: that.getResourceBundle().getText("lingua"),
					template: {
						content: "{LINGUA}"
					}
				}, {
					name: that.getResourceBundle().getText("pivaMetafornitore"),
					template: {
						content: "{PIVA}"
					}
				}, {
					name: that.getResourceBundle().getText("statoMetafornitore"),
					template: {
						content: "{STATO_FORNITORE}"
					}
				}, {
					name: that.getResourceBundle().getText("BU"),
					template: {
						content: "{BU}"
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
		// drag e drop
		getSelectedRowContext: function (sTableId, fnCallback) {
			var oTable = sap.ui.getCore().byId(sTableId);
			var iSelectedIndex = oTable.getSelectedIndex();

			if (iSelectedIndex === -1) {
				MessageToast.show("Please select a row!");
				return;
			}

			var oSelectedContext = oTable.getContextByIndex(iSelectedIndex);
			if (oSelectedContext && fnCallback) {
				fnCallback.call(this, oSelectedContext, iSelectedIndex, oTable);
			}

			return oSelectedContext;
		},

		moveToTable1: function () {
			this.getSelectedRowContext("idTable2", function (oSelectedRowContext, iSelectedRowIndex, oTable2) {
				// reset the rank property and update the model to refresh the bindings
				var oProductsModel = this.getModel("tableModelSuppliers");
				oProductsModel.setProperty("Rank", 0, oSelectedRowContext);
				oProductsModel.refresh(true);

				// select the previous row when there is no row to select
				var oNextContext = oTable2.getContextByIndex(iSelectedRowIndex + 1);
				if (!oNextContext) {
					oTable2.setSelectedIndex(iSelectedRowIndex - 1);
				}
			});
		},
		moveToTable2: function () {
			this.getSelectedRowContext("idTable", function (oSelectedRowContext) {
				var oTable2 = sap.ui.getCore().byId("idTable2");
				var oProductsModel = this.getModel("tableModelSuppliers");
				// var oFirstRowContext = oTable2.getContextByIndex(0);

				// // insert always as a first row
				// var iNewRank = 0;
				// if (oFirstRowContext) {
				// 	iNewRank =  this.config.rankAlgorithm.Before(oFirstRowContext.getProperty("Rank"));
				// }

				oProductsModel.setProperty("Rank", 1, oSelectedRowContext);
				oProductsModel.refresh(true);

				// select the inserted row
				oTable2.setSelectedIndex(0);
			});
		},
		moveSelectedRow: function (sDirection) {
			this.getSelectedRowContext("idTable2", function (oSelectedRowContext, iSelectedRowIndex, oTable2) {
				var oProductsModel = this.getModel("tableModelSuppliers");
				var iSiblingRowIndex = iSelectedRowIndex + (sDirection === "Up" ? -1 : 1);
				var oSiblingRowContext = oTable2.getContextByIndex(iSiblingRowIndex);
				if (!oSiblingRowContext) {
					return;
				}

				// swap the selected and the siblings rank
				var iSiblingRowRank = oSiblingRowContext.getProperty("Rank");
				var iSelectedRowRank = oSelectedRowContext.getProperty("Rank");
				oProductsModel.setProperty("Rank", iSiblingRowRank, oSelectedRowContext);
				oProductsModel.setProperty("Rank", iSelectedRowRank, oSiblingRowContext);
				oProductsModel.refresh(true);

				// after move select the sibling
				oTable2.setSelectedIndex(iSiblingRowIndex);
			});
		},
		moveUp: function () {
			this.moveSelectedRow("Up");
		},

		moveDown: function () {
			this.moveSelectedRow("Down");
		},
		onDragStart: function (oEvent) {
			var oDraggedRow = oEvent.getParameter("target");
			var oDragSession = oEvent.getParameter("dragSession");

			// keep the dragged row context for the drop action
			oDragSession.setComplexData("draggedRowContext", oDraggedRow.getBindingContext());
		},
		onDropTable1: function (oEvent) {
			var oProductsModel = this.getModel("tableModelSuppliers");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDraggedRowContext = oDragSession.getComplexData("draggedRowContext");
			if (!oDraggedRowContext) {
				return;
			}

			// reset the rank property and update the model to refresh the bindings
			oProductsModel.setProperty("Rank", 0, oDraggedRowContext);
			oProductsModel.refresh(true);
		},
		onDropTable2: function (oEvent) {
			var oProductsModel = this.getModel("tableModelSuppliers");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDraggedRowContext = oDragSession.getComplexData("draggedRowContext");
			if (!oDraggedRowContext) {
				return;
			}

			var oConfig = this.config;
			var iNewRank = 1;
			var oDroppedRow = oEvent.getParameter("droppedControl");

			if (oDroppedRow && oDroppedRow instanceof sap.ui.table.Row) {
				// get the dropped row data
				var sDropPosition = oEvent.getParameter("dropPosition");
				var oDroppedRowContext = oDroppedRow.getBindingContext();
				var iDroppedRowRank = oDroppedRowContext.getProperty("Rank");
				var iDroppedRowIndex = oDroppedRow.getIndex();
				var oDroppedTable = oDroppedRow.getParent();

				// find the new index of the dragged row depending on the drop position
				var iNewRowIndex = iDroppedRowIndex + (sDropPosition === "After" ? 1 : -1);
				var oNewRowContext = oDroppedTable.getContextByIndex(iNewRowIndex);
				if (!oNewRowContext) {
					// dropped before the first row or after the last row
					iNewRank = oConfig.rankAlgorithm[sDropPosition](iDroppedRowRank);
				} else {
					// dropped between first and the last row
					iNewRank = oConfig.rankAlgorithm.Between(iDroppedRowRank, oNewRowContext.getProperty("Rank"));
				}
			}

			// set the rank property and update the model to refresh the bindings
			oProductsModel.setProperty("Rank", iNewRank, oDraggedRowContext);
			oProductsModel.refresh(true);
		},

		onSearchSupplier: function () {
			var ekorgs =
				sap.ui.getCore().byId("EKORG").getSelectedKeys();
			var url = "/SupplierPortal_Utils/xsOdata/GetVendorList.xsjs?I_USERID=" + that.getCurrentUserId() + "&I_NAME1=" + sap.ui
				.getCore().byId("NAME1").getValue() + "&ISTCE=" + sap.ui.getCore().byId("STCEG").getValue();
			that.showBusyDialog();
			var body = {
				"ekorg": []
			};
			ekorgs.forEach(function (ekorg) {
				body.ekorg.push(ekorg);
			});

			var lifnrStorico;
			if (that.getView().getModel("tableModelSuppliers") !== undefined && that.getView().getModel(
				"tableModelSuppliers").getData() !== undefined) {
				lifnrStorico = that.getView().getModel("tableModelSuppliers").getData();
				if (lifnrStorico && lifnrStorico.results && lifnrStorico.results.length > 0) {
					var oldArrayLifnr = [];
					lifnrStorico.results.forEach(function (elem) {
						var position = JSON.parse(JSON.stringify(elem));
						oldArrayLifnr.push(position);
					});

				}
			}
			// clear del modello
			that.getView().setModel(null, "tableModelSuppliers");

			that.ajaxPost(url, body, "/SupplierPortal_Utils", function (oData) { // funzione generica su BaseController
				that.hideBusyDialog();
				if (oData && oData.results && oData.results.length > 0) {
					oData.results.forEach(function (lifnrElem) {
						lifnrElem.Rank = 0;
					});
					// scarico nel modello delle tabelle il "vecchio modello con il lifnr rank 1"
					if (oldArrayLifnr !== undefined && oldArrayLifnr.length > 0)
						oldArrayLifnr.forEach(function (elem) {
							oData.results.push(elem);
						});
					var jsonModelLf = new JSONModel();
					jsonModelLf.setData(oData);
					that.getView().setModel(jsonModelLf, "tableModelSuppliers");
				}
			});

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

		}
	});
});