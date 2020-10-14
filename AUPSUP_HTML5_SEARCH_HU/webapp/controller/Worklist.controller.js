sap.ui.define([
	"it/aupsup/searchHU/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/PDFViewer",
	"it/aupsup/searchHU/js/jszip",
], function (BaseController, JSONModel, MessageBox, MessageToast, Filter, Sorter, Export, ExportTypeCSV, PDFViewer, JSZIP) {
	"use strict";
	var that;

	return BaseController.extend("it.aupsup.searchHU.controller.Worklist", {

		onInit: function () {
			that = this;
			//	that.onGetOdataColumns();
			that.getUserInfo();
			that.getMetasupplier();
			//	that.onGetMyVariants();

			var filterHu = {
				"vbeln": [],
				"lifnr": [],
				"verur": [],
				"matnr": [],
				"vgbel": [],
				"exdiv": [],
				"lfDateFrom": null,
				"lfDateTo": null,
				"waDateFrom": null,
				"waDateTo": null
			};

			var oModelHu = new JSONModel();
			oModelHu.setData(filterHu);
			this.getView().setModel(oModelHu, "filterHUJSONModel");

			this.getView().setModel(sap.ui.getCore().getModel("userapi"), "userapi");


			if (!this._oResponsivePopover) {

				var oModelFilters = new JSONModel();
				oModelFilters.setData({
					"element": ""
				});
				// this.getView().setModel(oModelFilters, "filterElementJSONModel");

				this._oResponsivePopover = sap.ui.xmlfragment("it.aupsup.searchHU.fragments.FilterSorter", this);
				this._oResponsivePopover.setModel(oModelFilters, "filterElementJSONModel");
			}
			var oTable = this.getView().byId("HUHeadersTable");
			oTable.addEventDelegate({
				onAfterRendering: function () {
					var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
					for (var i = 0; i < oHeader.length; i++) {
						var oID = oHeader[i].id;
						if (oID !== '__column0') // prima colonna con checkbox
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
				if (res !== undefined) {
					oView.getModel("HUJSONModel").setProperty("/bindingValue", res); //Save the key value to property
					that._oResponsivePopover.openBy(oTarget);
				}
			});
		},

		onChange: function (oEvent) {
			var oValue = oEvent.getParameter("value");
			var oMultipleValues = oValue.split(",");
			var oTable = this.getView().byId("HUHeadersTable");
			var oBindingPath = this.getView().getModel("HUJSONModel").getProperty("/bindingValue"); //Get Hold of Model Key value that was saved
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
			var oTable = this.getView().byId("HUHeadersTable");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.getView().getModel("HUJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onDescending: function () {
			var oTable = this.getView().byId("HUHeadersTable");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.getView().getModel("HUJSONModel").getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath, true);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		/*Valorizzo MatchCode Metasupplier*/
		getMetasupplier: function () {
			var url = "/backend/Utils/UtilsManagement/GetMetasupplierList";
			that.ajaxGet(url, function (oData) {

				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "MetasupplierJSONModel");
					//Valorizzazione Campo Lifnr per Servizio
					var oLifnr = that.getModel("filterHUJSONModel");
					oLifnr = oData.results;
					var oModelLF = new JSONModel();
					oModelLF.setData(oLifnr);
					that.getView().setModel(oModelLF, "filterHUJSONModel");
				}
			})
		},
		/*Alla selezione di uno o più metafornitori Valorizzo il MatchCode del Fornitore*/
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
			that.getModel("filterHUJSONModel").getData().lifnum = slifnr;

		},
		/*Selezione Fornitore*/
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
			that.getModel("filterHUJSONModel").getData().lifnum = lifnr;
		},

		/*Ricerca materiale tramite nuova videata*/
		handleMatnr: function () {

			if (!that.oSearchMatnrDialog) {
				that.oSearchMatnrDialog = sap.ui.xmlfragment("it.aupsup.searchHU.fragments.SearchMatnr", that);
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

			that.getModel("filterHUJSONModel").getData().matnr = selectedMatnr;
			that.getModel("filterHUJSONModel").getData().MatnrDesc = selectedMatnrDesc;

			this.oSearchMatnrDialog.close();
			this.oSearchMatnrDialog.destroy();
			this.oSearchMatnrDialog = undefined;
			that.getModel("filterHUJSONModel").refresh();
		},
		onClearMaterialSearchFilters: function () {
			this.getView().getModel("MatnrSearchJSONModel").getData().matnr = "";
			this.getView().getModel("MatnrSearchJSONModel").getData().maktx = "";
			this.getView().getModel("MatnrSearchJSONModel").refresh();
			that.getView().getModel("MatnrJSONModel").setData(null);

		},

		onClearFilterTable: function () {
			var oTable = this.getView().byId("HUHeadersTable");
			var aFilters = [];
			var oItems = oTable.getBinding("items");
			oItems.filter(aFilters, "Application");

			this.getView().byId("headerFilterButton").setVisible(false);
		},

		/*reset Filtri worklist View*/
		onClearFilters: function () {
			if (that.getModel("filterHUJSONModel") !== undefined && that.getModel("filterHUJSONModel").getData() !==
				undefined) {
				that.getModel("filterHUJSONModel").getData().vbeln = "";
				that.getModel("filterHUJSONModel").getData().lifnr = '';
				that.getModel("filterHUJSONModel").getData().verur = '';
				that.getModel("filterHUJSONModel").getData().vgbel = '';
				that.getModel("filterHUJSONModel").getData().lfDateFrom = null;
				that.getModel("filterHUJSONModel").getData().lfDateTo = null;
				that.getModel("filterHUJSONModel").getData().waDateFrom = null;
				that.getModel("filterHUJSONModel").getData().waDateTo = null;
				that.getModel("filterHUJSONModel").getData().exdiv = '';
				that.getModel("filterHUJSONModel").getData().MatnrDesc = '';
				that.getModel("filterHUJSONModel").refresh();
			}
			if (that.getModel("MetasupplierJSONModel") !== undefined && that.getModel("MetasupplierJSONModel").getData() !== undefined) {
				that.getModel("MetasupplierJSONModel").getData().METAID = '';
			}
			if (that.getModel("lifnrJSONModel") !== undefined && that.getModel("lifnrJSONModel").getData() !== undefined) {
				that.getModel("lifnrJSONModel").setData(null);
			}
			if (that.getModel("MetasupplierJSONModel") !== undefined)
				that.getModel("MetasupplierJSONModel").refresh();
			if (that.getModel("lifnrJSONModel") !== undefined)
				that.getModel("lifnrJSONModel").refresh();
		},
		/*Richiamo servizio per valorizzare tabella*/
		onSearchHU: function () {

			var url = "/backend/InboundDeliveryManagement/GetInboundList";
			var body = that.getModel("filterHUJSONModel").getData();

			var jsonBody = JSON.parse(JSON.stringify(body));


			if (body !== undefined && body.lfDateFrom !== undefined && body.lfDateFrom !== null) {
				var year = body.lfDateFrom.getFullYear();
				var month = (1 + body.lfDateFrom.getMonth()).toString();
				month = month.length > 1 ? month : '0' + month;
				var day = body.lfDateFrom.getDate().toString();
				day = day.length > 1 ? day : '0' + day;
				jsonBody.lfDateFrom = year + month + day;
			}
			if (body !== undefined && body.lfDateTo !== undefined && body.lfDateTo !== null) {
				var year = body.lfDateTo.getFullYear();
				var month = (1 + body.lfDateTo.getMonth()).toString();
				month = month.length > 1 ? month : '0' + month;
				var day = body.lfDateTo.getDate().toString();
				day = day.length > 1 ? day : '0' + day;
				jsonBody.lfDateTo = year + month + day;
			}
			if (body !== undefined && body.waDateFrom !== undefined && body.waDateFrom !== null) {
				var year = body.waDateFrom.getFullYear();
				var month = (1 + body.waDateFrom.getMonth()).toString();
				month = month.length > 1 ? month : '0' + month;
				var day = body.waDateFrom.getDate().toString();
				day = day.length > 1 ? day : '0' + day;
				jsonBody.waDateFrom = year + month + day;
			}
			if (body !== undefined && body.waDateTo !== undefined && body.waDateTo !== null) {
				var year = body.waDateTo.getFullYear();
				var month = (1 + body.waDateTo.getMonth()).toString();
				month = month.length > 1 ? month : '0' + month;
				var day = body.waDateTo.getDate().toString();
				day = day.length > 1 ? day : '0' + day;
				jsonBody.waDateTo = year + month + day;
			}

			this.showBusyDialog();
			that.ajaxPost(url, jsonBody, function (oData) {
				that.hideBusyDialog();
				if (oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "HUJSONModel");
					that.getView().byId("HUHeadersTable").setModel(oModel);
				}
			})

		},

		onDownloadZip: function (oEvent) {

			var oTable = that.getView().byId("HUHeadersTable");
			var idx = oTable.indexOfItem(oTable.getSelectedItem());
			if (idx !== -1) {

				var oItems = oTable.getSelectedItems()
				var promiseArr = []
				var zip = new JSZip()
				this.showBusyDialog();
				for (var i = 0; i < oItems.length; i++) {
					var oPositionModel = that.getModel("HUJSONModel").getProperty(oItems[i].getBindingContextPath());
					promiseArr.push(new Promise(function (resolve, reject) {

						var path = "/backend/InboundDeliveryManagement/GetHUPDF" + "?I_EXIDV=" + oPositionModel.EXIDV + "&I_WERKS=" + oPositionModel.WERKS;
						try {
							var xhr = new window.XMLHttpRequest();
							xhr.EXIDV = oPositionModel.EXIDV;
							xhr.open('GET', path, true);

							// recent browsers
							if ("responseType" in xhr) {
								xhr.responseType = "arraybuffer";
							}

							// older browser
							if (xhr.overrideMimeType) {
								xhr.overrideMimeType("text/plain; charset=x-user-defined");
							}

							xhr.onreadystatechange = function (event) {
								// use `xhr` and not `this`... thanks IE
								if (xhr.readyState === 4) {
									if (xhr.status === 200 || xhr.status === 0) {
										try {
											zip.file("download_hu_" + xhr.EXIDV + ".pdf", xhr.response || xhr.responseText, {
												binary: true
											});
											resolve();
										} catch (err) {
											that.hideBusyDialog();
											reject();
										}
									} else {
										that.hideBusyDialog();
										reject("Ajax error for " + path + " : " + this.status + " " + this.statusText);
									}
								}
							};

							xhr.send();

						} catch (e) {
							that.hideBusyDialog();
							reject(e, null);
						}
					}))

				}

				Promise.all(promiseArr).then(values => {
					that.hideBusyDialog();
					zip.generateAsync({
							type: "blob"
						})
						.then(function (content) {
							// Force down of the Zip file
							that.saveAs(content, "download.zip");
						});
				});

			} else {
				MessageBox.error(that.getResourceBundle().getText("ERR_Select_HU"));
			}


		},

		onItemPrintHU: function (oEvent) {
			var oPath = oEvent.getSource().getBindingContext('HUJSONModel').sPath
			var selctedRowdata = that.getView().getModel("HUJSONModel").getProperty(oPath);

			var url = "/backend/InboundDeliveryManagement/GetHUPDF" + "?I_EXIDV=" + selctedRowdata.EXIDV + "&I_WERKS=" + selctedRowdata.WERKS;

			that._pdfViewer = new PDFViewer();
			that._pdfViewer.setShowDownloadButton(false);
			that._pdfViewer.attachSourceValidationFailed(function (oControlEvent) {
				oControlEvent.preventDefault();
			});
			that.getView().addDependent(that._pdfViewer);
			that._pdfViewer.setSource(url);
			that._pdfViewer.open();
			that.onCloseOrderPositions();

		},
		saveAs: function (blob, filename) {
			if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
				return navigator.msSaveOrOpenBlob(blob, fileName);
			} else if (typeof navigator.msSaveBlob !== 'undefined') {
				return navigator.msSaveBlob(blob, fileName);
			} else {
				var elem = window.document.createElement('a');
				elem.href = window.URL.createObjectURL(blob);
				elem.download = filename;
				elem.style = 'display:none;opacity:0;color:transparent;';
				(document.body || document.documentElement).appendChild(elem);
				if (typeof elem.click === 'function') {
					elem.click();
				} else {
					elem.target = '_blank';
					elem.dispatchEvent(new MouseEvent('click', {
						view: window,
						bubbles: true,
						cancelable: true
					}));
				}
				URL.revokeObjectURL(elem.href);
			}
		},
		onExport: function (oEvent) {

			var dataS = this.getView().getModel("HUJSONModel");
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
				models: this.getView().getModel("HUJSONModel"),

				// binding information for the rows aggregation
				rows: {
					path: "/results"
				},

				// column definitions with column name and binding info for the content

				columns: [{
					name: that.getResourceBundle().getText("SYSID"),
					template: {
						content: "{SYSID}"
					}
				}, {
					name: that.getResourceBundle().getText("VENUM"),
					template: {
						content: "{VENUM}"
					}
				}, {
					name: that.getResourceBundle().getText("VEPOS"),
					template: {
						content: "{VEPOS}"
					}
				}, {
					name: that.getResourceBundle().getText("VBELN"),
					template: {
						content: "{VBELN}"
					}
				}, {
					name: that.getResourceBundle().getText("POSNR"),
					template: {
						content: "{POSNR}"
					}
				}, {
					name: that.getResourceBundle().getText("EXIDV"),
					template: {
						content: "{EXIDV}"
					}
				}, {
					name: that.getResourceBundle().getText("MATNR"),
					template: {
						content: "{MATNR}"
					}

				}, {
					name: that.getResourceBundle().getText("WERKS"),
					template: {
						content: "{WERKS}"
					}
				}, {
					name: that.getResourceBundle().getText("TMENG"),
					template: {
						content: "{TMENG}"
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

		// GESTIONE VARIANTI
		onGetMyVariants: function () {
			var oModelData = this.getOwnerComponent().getModel("VariantsModel");

			oModelData.read("/Variants?$filter=(USERID eq '" + that.getCurrentUserId() +
				"' and APPLICATION eq 'SEARCH_HU' and TABLE_NAME eq 'WORKLIST')", {
					success: function (oData, oResponse) {
						if (oData && oData.results) {
							var oModel = new JSONModel();
							oModel.setData({
								VariantSet: oData.results
							});
							sap.ui.getCore().setModel(oModel, "variantsJSONModel");

							var oModelSelection = new JSONModel();
							oModelSelection.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
							sap.ui.getCore().setModel(oModelSelection, "selection");

						}
					},
					error: function (err) {

					}
				});
		},
		onGetOdataColumns: function () {
			var oModelData = that.getOwnerComponent().getModel("VariantsModel");
			oModelData.metadataLoaded().then(
				that.onMetadataLoaded.bind(that, oModelData));
		},
		onMetadataLoaded: function (myODataModel) {
			var metadata = myODataModel.getServiceMetadata();
			if (metadata.dataServices.schema[0].entityType) {
				var selected = metadata.dataServices.schema[0].entityType.find(x => x.name === "SearchHUStructureType");
				if (selected !== undefined) {
					var str = "";
					selected.property.forEach(function (elem) {
						str = '"' + elem.name + '":true,' + str;
					});
					str = str.slice(0, -1);
					str = '{' + str + '}';
					var oModel = new JSONModel();
					oModel.setData(JSON.parse(str));
					that.getView().setModel(oModel, "columnVisibilityModel");

				}
			}
		},

		onSaveVariant: function (oEvent) {
			var params = oEvent.getParameters();
			if (params.overwrite) {
				//Get Values from selection screen
				var parametersValue = this.getParametersValue();
				//Get selected Variants Data
				var selectedKey = oEvent.getSource().getSelectionKey();
				var bindingPath = oEvent.getSource().getItemByKey(selectedKey).getBindingContext().getPath();
				var modelData = sap.ui.getCore().byId("idPunter1").byId("app").getModel().getProperty(bindingPath);
				var save = Object.create(null);
				save.FIRST_PROFILE = parametersValue.firstProfile;
				save.SECOND_PROFILE = parametersValue.secondProfile;
				save.CRITICAL = parametersValue.critical;
				save.VAR_KEY = modelData.VAR_KEY;
				save.VAR_NAME = modelData.VAR_NAME;
				$.extend(modelData, save);
				sap.ui.getCore().byId("idPunter1").byId("app").getModel().refresh();
				oDataModel.update("VariantSet('" + save.VAR_KEY + "')", save, null, function (oData, response) {}, function (err) {
					alert("Service Failed");
				});

			} else {
				var oModel = JSON.stringify(that.getView().getModel("columnVisibilityModel").getData())
				var oModelData = this.getOwnerComponent().getModel("VariantsModel");

				var newEntry = Object.create(null);
				newEntry.SYSID = "ASM";
				newEntry.USERID = that.getCurrentUserId();
				newEntry.APPLICATION = "SEARCH_HU";
				newEntry.TABLE_NAME = "WORKLIST";
				newEntry.VARIANT_NAME = params.name;
				newEntry.COLUMNS = oModel;
				//Updating database via Odata           
				oModelData.create("/Variants", newEntry, null, function (oData, response) {
					//Updating Json Model Local Data
					var Data = that.getView().getModel("columnVisibilityModel").getData();
					Data.push(newEntry);
					that.getView().getModel("columnVisibilityModel").refresh();
				}, function (err) {
					alert("Service Failed");
				});

			}
			var sMessage = "New Name: " + params.name + "\nDefault: " + params.def + "\nOverwrite: " + params.overwrite +
				"\nSelected Item Key: " +
				params.key;

			MessageToast.show(sMessage);

		},

		onManageVariant: function (oEvent) {

			var params = oEvent.getParameters();
			var renamed = params.renamed;
			var deleted = params.deleted;
			var oModelData = this.getOwnerComponent().getModel("VariantsModel");
			var varModel = sap.ui.getCore().getModel("variantsJSONModel").getData().VariantSet;
			//rename backend data       
			if (renamed) {

				renamed.forEach(function (rename) {
					var selected = varModel.find(x => x.VARIANT_NAME === rename.name);
					var elem = Object.create(null);
					elem.SYSID = selected.SYSID;
					elem.USERID = selected.USERID;
					elem.APPLICATION = selected.APPLICATION;
					elem.TABLE_NAME = selected.TABLE_NAME;
					elem.VARIANT_NAME = rename.name;
					var url = "/Variants(SYSID='" + selected.SYSID + "',USERID='" + selected.USERID + "',APPLICATION='" + selected.APPLICATION +
						"',TABLE_NAME='" + selected.TABLE_NAME + "',VARIANT_NAME='" + rename.key + "')";
					oModelData.update(url, elem, null,
						function () {
							alert("Update successful");
						},
						function () {
							alert("Update failed");
						});
				});

			}

			var sMessage = "renamed: \n";
			for (var h = 0; h < renamed.length; h++) {
				sMessage += renamed[h].key + " = " + renamed[h].name + "\n";
			}

			//delete backend data             
			if (deleted) {

				deleted.forEach(function (remove) {
					var selected = varModel.find(x => x.VARIANT_NAME === remove);
					oModelData.remove("/Variants(SYSID='" + selected.SYSID + "',USERID='" + selected.USERID + "',APPLICATION='" + selected.APPLICATION +
						"',TABLE_NAME='" + selected.TABLE_NAME + "',VARIANT_NAME='" + selected.VARIANT_NAME + "')", null,
						function () {
							alert("Delete successful");
						},
						function () {
							alert("Delete failed");
						});

				});

			}
			sMessage += "\n\ ndeleted: ";
			for (var f = 0; f < deleted.length; f++) {
				sMessage += deleted[f] + ", ";
			}
			MessageToast.show(sMessage);

		},

		onSelect: function (oEvent) {
			var selectedKey = oEvent.getSource().getSelectionKey();
			if (selectedKey === "*standard*") {
				that.onGetOdataColumns();

			} else {
				var bindingPath = oEvent.getSource().getItemByKey(selectedKey).oBindingContexts.variantsJSONModel.getPath();
				var selectedVar = sap.ui.getCore().getModel("variantsJSONModel").getProperty(bindingPath);

				var columns = JSON.parse(selectedVar.COLUMNS);
				var columnModel = that.getView().getModel("columnVisibilityModel");
				if (columns && columnModel && columnModel.getData()) {
					columnModel = columnModel.getData();
					//	$.each(columnModel, function (key, value) {
					$.each(columns, function (key, value) {
						columnModel[key] = value;
					});
					//	});
				}
				var oModel = new JSONModel();
				oModel.setData(columnModel);
				that.getView().setModel(oModel, "columnVisibilityModel");

			}

		},

		getParametersValue: function () {
			var parametersValue = Object.create(null);
			// parametersValue.firstProfile = sap.ui.getCore().byId(“idPunter1”).byId(“firstProfile”).getValue();
			// parametersValue.secondProfile = sap.ui.getCore().byId(“idPunter1”).byId(“secondProfile”).getValue();
			// parametersValue.critical = sap.ui.getCore().byId(“idPunter1”).byId(“critical”).getSelected();
			return parametersValue;
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
			var openAssetTable = this.getView().byId("HUHeadersTable"),
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
						text: "Cancel",
						press: function () {
							that.onCancelPersonalization();
						}
					}),
					new sap.m.Button({
						text: that.getResourceBundle().getText("Comfirm"),
						press: function () {
							that.onSavePersonalization();
						}
					})
				]

			});

			this.byId("popOver").setFooter(footer);
			var oList1 = this.byId("List");
			var table = this.byId("HUHeadersTable").getColumns();
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
			var table = this.byId("HUHeadersTable").getColumns();
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

		}

		// FINE VARIANTI
	});

});