var that;
var metaid;
var oDialogContact;
var contactType = [];
var template;
sap.ui.define([
	"it/alteaup/supplier/portal/metasupplier/AUPSUP_HTML5_METASUPPLIER_BM/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (BaseController, MessageBox, MessageToast, JSONModel) {
	"use strict";

	return BaseController.extend("it.alteaup.supplier.portal.metasupplier.AUPSUP_HTML5_METASUPPLIER_BM.controller.MetasupplierContacts", {
		onInit: function () {
			that = this;

			that.getOwnerComponent().getRouter().getRoute("RouteMetasupplierContacts").attachPatternMatched(
				that.handleRoutePatternMatched,
				this);
		},

		onAfterRendering: function () {
			that._getFragment();
		},

		handleRoutePatternMatched: function (oEvent) {

			metaid = oEvent.getParameter("arguments").metaid;
			var user = "";

			var url = "/backend/MetasupplierManagement/GetMetasupplier?I_METAID=" + metaid;

			that.ajaxGet(url, function (oDataRes) {

				if (oDataRes.results.length !== 0) {
					var jsonModel = new sap.ui.model.json.JSONModel();
					if (oDataRes.results[0].ATTIVO === 1) {
						oDataRes.results[0].STATO = that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
							"active");
						oDataRes.results[0].ICON = "Success";
					} else {
						oDataRes.results[0].STATO = that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
							"active");
						oDataRes.results[0].ICON = "Error";
					}

					jsonModel.setData(oDataRes.results[0]);

					that.getView().setModel(jsonModel, "metasupplierData");
					getContacts();
					that.getSupplierList();

				} else {
					sap.m.MessageBox.error(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
						"noMetasupplierFoundForUser"));
				}

			});

			/*	var filters = [];
				var filter = new sap.ui.model.Filter({
					path: "METAID",
					operator: "EQ",
					value1: metaid
				});
	
				filters.push(filter);
				var oModel = that.getOwnerComponent().getModel();
				oModel.read("/MetasupplierDataSet", {
					filters: filters,
					success: function (oDataRes, oResponse) {
	
						if (oDataRes.results.length !== 0) {
							var jsonModel = new sap.ui.model.json.JSONModel();
							if (oDataRes.results[0].ATTIVO === 1) {
								oDataRes.results[0].STATO = that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
									"active");
								oDataRes.results[0].ICON = "Success";
							} else {
								oDataRes.results[0].STATO = that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
									"active");
								oDataRes.results[0].ICON = "Error";
							}
	
							jsonModel.setData(oDataRes.results[0]);
	
							that.getView().setModel(jsonModel, "metasupplierData");
							getContacts();
							that.getSupplierList();
	
						} else {
							sap.m.MessageBox.error(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
								"noMetasupplierFoundForUser"));
						}
	
					},
					error: function (oError) {}
				}); */

			function getContacts() {
				if (that.getOwnerComponent().getModel("user") !== undefined)
					user = that.getOwnerComponent().getModel("user").getData()[0];

				if (user !== "" && user.userType === "M" && (user.metaIDs === null || user.metaIDs === undefined || user.metaIDs.length === 0))
					that.getView().byId("contactsPage").setShowNavButton(false);

				var url = "/backend/MetasupplierManagement/GetContactTypes?I_ATTIVO=1";
				that.ajaxGet(url, function (oDataRes) {
					if (oDataRes && oDataRes.results && oDataRes.results.length > 0) {
						//var contactType = [];
						for (var x = 0; x < oDataRes.results.length; x++) {
							contactType.push({
								key: oDataRes.results[x].TIPOLOGIA,
								value: oDataRes.results[x].DESCRIZIONE,
								data: []
							});

						}
						that.getContact();
					}

				});

				/*var filters = [];

				var filter = new sap.ui.model.Filter({
					path: "ATTIVO",
					operator: "EQ",
					value1: 1
				}); 

				filters.push(filter);

				template = {
					"settings": {
						"Sections": []
					}
				};

				oModel.read("/ContactTypeSet", {
					filters: filters,
					success: function (oDataRes, oResponse) {
						contactType = [];
						for (var x = 0; x < oDataRes.results.length; x++) {
							contactType.push({
								key: oDataRes.results[x].TIPOLOGIA,
								value: oDataRes.results[x].DESCRIZIONE,
								data: []
							});

						}
						that.getContact();
					},
					error: function (oError) {}
				}); */
			}

		},
		getDocumentList: function () {

			var jsonModel = new JSONModel();
			jsonModel.setData({
				"Attachments": []
			});
			that.getView().setModel(jsonModel, "AttachmentsJSONModel");

			var oModelSupplier = that.getView().getModel("supplierListJSONModel").getData();
			if (oModelSupplier !== undefined && oModelSupplier.length > 0) {
				that.showBusyDialog();
				var countDoc = oModelSupplier.length;
				oModelSupplier.forEach(function (lifnr) {
					var url = "/backend/DocumentManagement/DocList?I_CLASSIFICATION=GEN&I_APPLICATION=CONT_META&I_OBJECT_CODE=" + lifnr.LIFNR
					jQuery.ajax({
						url: url,
						method: 'GET',
						async: false,
						success: function (data) {
							countDoc = countDoc - 1;
							if (data && data.results && data.results.length > 0) {
								data.results.forEach(function (attach) {
									that.getView().getModel("AttachmentsJSONModel").getData().Attachments.push(attach);
								});
							}
							if (countDoc <= 0)
								that.hideBusyDialog();
						},
						error: function (e) {
							that.hideBusyDialog();
						}
					});
				});

				that.getView().getModel("AttachmentsJSONModel").refresh();
			}

		},
		getSupplierList: function () {
			var metasupplier = that.getView().getModel("metasupplierData").getData().METAID;
			var url = "/backend/MetasupplierManagement/GetMetaidSuppliers?I_METAID=" + metasupplier;
			this.showBusyDialog();
			that.ajaxGet(url, function (oDataRes) {
				that.hideBusyDialog();
				if (oDataRes && oDataRes.results && oDataRes.results.length > 0) {
					var jsonModel = new JSONModel();
					jsonModel.setData(oDataRes.results);
					that.getView().setModel(jsonModel, "supplierListJSONModel");

					// estraggo gli allegati di tutti i fornitori associati al metafornitore
					that.getDocumentList();
				}
			})
		},

		getContact: function () {

			var url = "/backend/MetasupplierManagement/GetContacts?I_METAID=" + metaid;

			that.ajaxGet(url, function (oDataRes) {

				if (oDataRes === undefined || oDataRes.results === undefined) {
					template = {
						"settings": {
							"Sections": []
						}
					};

					for (var x = 0; x < contactType.length; x++) {
						var jsonSection = {};
						jsonSection.SectionTitle = contactType[x].value;
						jsonSection.Subsections = [];
						var jsonSubsection = {
							"Data": false
						};
						jsonSection.Subsections.push(jsonSubsection);

						template.settings.Sections.push(jsonSection);
					}

					var jsonModel = new sap.ui.model.json.JSONModel();
					jsonModel.setData(template);
					that.getView().setModel(jsonModel, "mysettings");
				} else {
					for (var x = 0; x < contactType.length; x++) {
						contactType[x].data = [];
						for (var i = 0; i < oDataRes.results.length; i++) {
							if (oDataRes.results[i].TIPOLOGIA === contactType[x].key) {
								var json = {
									"Id": oDataRes.results[i].KEY,
									"Mail": oDataRes.results[i].MAIL,
									"Tel": oDataRes.results[i].TEL,
									"Tel1": oDataRes.results[i].TEL1,
									"Titolo": oDataRes.results[i].TITOLO,
									"Nome": oDataRes.results[i].NOME,
									"Cognome": oDataRes.results[i].COGNOME,
									"Fax": oDataRes.results[i].FAX
								};
								contactType[x].data.push(json);
							}
						}
					}
					that.buildPage();

				}

			});

			/*
			var contactFilters = [];

			var filter = new sap.ui.model.Filter({
				path: "METAID",
				operator: "EQ",
				value1: metaid
			});

			contactFilters.push(filter);
			var oModel = that.getOwnerComponent().getModel();
			oModel.read("/MetasupplierContactSet", {
				filters: contactFilters,
				success: function (oDataRes, oResponse) {
					if (oDataRes.results.length === 0) {
						template = {
							"settings": {
								"Sections": []
							}
						};

						for (var x = 0; x < contactType.length; x++) {
							var jsonSection = {};
							jsonSection.SectionTitle = contactType[x].value;
							jsonSection.Subsections = [];
							var jsonSubsection = {
								"Data": false
							};
							jsonSection.Subsections.push(jsonSubsection);

							template.settings.Sections.push(jsonSection);
						}

						var jsonModel = new sap.ui.model.json.JSONModel();
						jsonModel.setData(template);
						that.getView().setModel(jsonModel, "mysettings");
					} else {
						for (var x = 0; x < contactType.length; x++) {
							contactType[x].data = [];
							for (var i = 0; i < oDataRes.results.length; i++) {
								if (oDataRes.results[i].TIPOLOGIA === contactType[x].key) {
									var json = {
										"Id": oDataRes.results[i].KEY,
										"Mail": oDataRes.results[i].MAIL,
										"Tel": oDataRes.results[i].TEL,
										"Tel1": oDataRes.results[i].TEL1,
										"Titolo": oDataRes.results[i].TITOLO,
										"Nome": oDataRes.results[i].NOME,
										"Cognome": oDataRes.results[i].COGNOME,
										"Fax": oDataRes.results[i].FAX
									};
									contactType[x].data.push(json);
								}
							}
						}
						that.buildPage();

					}

				},
				error: function (oError) { }
			}); */
		},

		buildPage: function () {

			template = {
				"settings": {
					"Sections": []
				}
			};

			for (var x = 0; x < contactType.length; x++) {
				var jsonSection = {};
				jsonSection.SectionTitle = contactType[x].value;
				jsonSection.Subsections = [];
				if (contactType[x].data.length > 0) {
					for (var i = 0; i < contactType[x].data.length; i++) {
						var jsonSubsection = {
							"ID": contactType[x].data[i].Id,
							"Mail": contactType[x].data[i].Mail,
							"Tel": contactType[x].data[i].Tel,
							"Tel1": contactType[x].data[i].Tel1,
							"Titolo": contactType[x].data[i].Titolo,
							"Nome": contactType[x].data[i].Nome,
							"Cognome": contactType[x].data[i].Cognome,
							"Fax": contactType[x].data[i].Fax,
							"Data": true,
							"SectionTitle": contactType[x].value
						};
						jsonSection.Subsections.push(jsonSubsection);
					}
				} else {
					var jsonSubsection = {
						"Data": false
					};
					jsonSection.Subsections.push(jsonSubsection);
				}

				template.settings.Sections.push(jsonSection);
			}

			var jsonModel = new sap.ui.model.json.JSONModel();
			jsonModel.setData(template);
			that.getView().setModel(jsonModel, "mysettings");

		},

		/*onNavBack: function () {
			that.getView().getModel("AttachmentsJSONModel").setData({
				"Attachments": []
			});
			jQuery.sap.history.back();
		},*/

		handleCreateContactPress: function (oEvent) {

			var sContactType = oEvent.getSource().data("section");
			var sKey = "";

			for (var i = 0; i < contactType.length; i++) {
				if (contactType[i].value == sContactType)
					sKey = contactType[i].key;
			}

			if (!oDialogContact) {
				// create dialog via fragment factory
				oDialogContact = sap.ui.xmlfragment(this.getView().getId(), "it.alteaup.supplier.portal.metasupplier.AUPSUP_HTML5_METASUPPLIER_BM.fragments.CreateContact", this);

			}

			var oModeli18n = that.getView().getModel("i18n");
			oDialogContact.setModel(oModeli18n, "i18n");

			//reset input
			that.getView().byId("mailCreateContact").setValue("");
			that.getView().byId("telCreateContact").setValue("");
			that.getView().byId("titleCreateContact").setValue("");
			that.getView().byId("nameCreateContact").setValue("");
			that.getView().byId("surnameCreateContact").setValue("");
			that.getView().byId("tel1CreateContact").setValue("");
			that.getView().byId("faxCreateContact").setValue("");

			that.getView().byId("metaidCreateContact").setValue(metaid);
			that.getView().byId("contactTypeCreateContact").setValue(sKey);

			oDialogContact.open();
		},

		closeDialog: function () {
			oDialogContact.close();
		},

		createContactConfirm: function () {
			var dataContact = {};
			var oView = that.getView();

			function uuidv4() {
				return 'xxxxxxxx-xxxx-3xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
					var r = Math.random() * 16 | 0,
						v = c === 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			}

			dataContact.KEY = uuidv4();
			dataContact.METAID = oView.byId("metaidCreateContact").getValue();
			dataContact.TIPOLOGIA = oView.byId("contactTypeCreateContact").getValue();
			dataContact.MAIL = oView.byId("mailCreateContact").getValue();
			dataContact.TEL = oView.byId("telCreateContact").getValue();
			dataContact.TEL1 = oView.byId("tel1CreateContact").getValue();
			dataContact.TITOLO = oView.byId("titleCreateContact").getValue();
			dataContact.NOME = oView.byId("nameCreateContact").getValue();
			dataContact.COGNOME = oView.byId("surnameCreateContact").getValue();
			dataContact.FAX = oView.byId("faxCreateContact").getValue();

			var url = "/backend/MetasupplierManagement/CreateContact";

			that.showBusyDialog();

			that.ajaxPost(url, dataContact, function (oData) {
				that.hideBusyDialog();
				sap.m.MessageToast.show(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
					"metasupplierContactCreated"));

				that.closeDialog();
				that.getContact();
			});

		},

		handleEditContactPressed: function (oEvent) {

			var vbox = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getItems();

			vbox[0].setVisible(false);
			vbox[1].setVisible(true);
		},

		handleResetContactPressed: function (oEvent) {
			var vbox = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getItems();

			vbox[0].setVisible(false);
			vbox[1].setVisible(true);

			that.getContact();
		},

		handleSaveContactPressed: function (oEvent) {
			var dataUpdateTemp = {};
			var dataUpdate = {};
			var key = oEvent.getSource().data("id");
			var sKey;

			var aData = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getItems()[1].getModel("mysettings").getData()
				.settings.Sections;
			for (var i = 0; i < aData.length; i++) {
				if (aData[i].SectionTitle === oEvent.getSource().data("section")) {
					var data = aData[i].Subsections;
					for (var x = 0; x < data.length; x++) {
						if (data[x].ID === key)
							dataUpdateTemp = data[x];
					}
				}
			}

			for (var i = 0; i < contactType.length; i++) {
				if (contactType[i].value == oEvent.getSource().data("section"))
					sKey = contactType[i].key;
			}

			dataUpdate.TIPOLOGIA = sKey;
			dataUpdate.MAIL = dataUpdateTemp.Mail;
			dataUpdate.TEL = dataUpdateTemp.Tel;
			dataUpdate.TEL1 = dataUpdateTemp.Tel1;
			dataUpdate.TITOLO = dataUpdateTemp.Titolo;
			dataUpdate.NOME = dataUpdateTemp.Nome;
			dataUpdate.COGNOME = dataUpdateTemp.Cognome;
			dataUpdate.FAX = dataUpdateTemp.Fax;

			
			var url = "/backend/MetasupplierManagement/UpdateContact?KEY=" + key;
			that.showBusyDialog();
			that.ajaxPut(url, dataUpdate, function (oData) {
				that.hideBusyDialog();
				sap.m.MessageToast.show(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
					"metasupplierContactUpdated"));
				that.getContact();
			});



		/*	var oModel = that.getOwnerComponent().getModel();
			oModel.update("/MetasupplierContactSet(KEY='" + key + "')", dataUpdate, {
				success: function (oData, oResponse) {
					sap.m.MessageToast.show(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
						"metasupplierContactUpdated"));
					that.getContact();
				},
				error: function (oError) {
					sap.m.MessageBox.error(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
						"errorUpdateingMetasupplierContact"));
				}
			}); */

		},

		handleDeleteContactPressed: function (oEvent) {

			var key = oEvent.getSource().data("id");

			sap.m.MessageBox.confirm(
				that.getView().getModel("i18n").getResourceBundle().getText("confirmDeletion"), {
				actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				styleClass: "sapUiSizeCompact",
				onClose: function (sAction) {

					if (sAction === "OK")
						that.deleteContact(key);
				}
			}
			);

		},

		deleteContact: function (key) {
			var url = "/backend/MetasupplierManagement/DeleteContract?KEY=" + key;
			this.showBusyDialog();
			that.ajaxGet(url, function (oDataRes) {
				that.hideBusyDialog();

				sap.m.MessageToast.show(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
					"metasupplierContactDeleted"));
				that.getContact();

			});

			/*var sKey = "/MetasupplierContactSet(KEY='" + key + "')";

			var oModel = that.getOwnerComponent().getModel();
			oModel.remove(sKey, {
				success: function () {
					sap.m.MessageToast.show(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
						"metasupplierContactDeleted"));
					that.getContact();
				},
				error: function (oError) {
					sap.m.MessageBox.error(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
						"errorDeletingMetasupplierContact"));
				}
			});*/
		},

		_getFragment: function (sFragmentName) {
			if (sap.ui.getCore().getModel("DocumentManagementJSONModel") !== undefined) {
				var documentModel = sap.ui.getCore().getModel("DocumentManagementJSONModel").getData();
				if (documentModel !== undefined && documentModel.DOC_IN === 'X') {
					var oObjectPageLayout = that.getView().byId("ObjectPageLayoutId");
					var sPath = "it.alteaup.supplier.portal.metasupplier.AUPSUP_HTML5_METASUPPLIER_BM.fragments.Attachments";
					var oFormFragment = sap.ui.xmlfragment(this.getView().getId(), sPath, this);
					oObjectPageLayout.addSection(oFormFragment);
					that.getView().byId("uploadDocBtn").setVisible(true);
				} else {
					that.getView().byId("uploadDocBtn").setVisible(false);
				}
			} else {

				Promise.all([
					new Promise(function (resolve, reject) {

						var url = "/backend/DocumentManagement/GetDocumentData?I_CLASSIFICATION=CONT_META";
						that.ajaxGet(url, function (oData) {
							if (oData && oData.results && oData.results[0]) {
								var oModel = new JSONModel(oData.results[0]);
								sap.ui.getCore().setModel(oModel, "DocumentManagementJSONModel");
							}
							resolve();
						});

						/*	var oModelData = that.getOwnerComponent().getModel("CustomizingModel");
	
							oModelData.read("/DocumentManagement", {
								urlParameters: {
									"$filter": "APPLICATION eq 'CONT_META'"
								},
								success: function (oData, oResponse) {
									if (oData && oData.results && oData.results[0]) {
										var oModel = new JSONModel(oData.results[0]);
										sap.ui.getCore().setModel(oModel, "DocumentManagementJSONModel");
									}
									resolve();
								},
								error: function (err) {
									resolve();
								}
							}); */
					})
				]).then(function (values) {
					var documentModel = sap.ui.getCore().getModel("DocumentManagementJSONModel") !== undefined && sap.ui.getCore().getModel("DocumentManagementJSONModel").getData() !== undefined ? sap.ui.getCore().getModel("DocumentManagementJSONModel").getData() : undefined;
					if (documentModel !== undefined && documentModel.DOC_IN === 'X') {
						var oObjectPageLayout = that.getView().byId("ObjectPageLayoutId");
						var sPath = "it.alteaup.supplier.portal.metasupplier.AUPSUP_HTML5_METASUPPLIER_BM.fragments.Attachments";
						var oFormFragment = sap.ui.xmlfragment(that.getView().getId(), sPath, that);
						oObjectPageLayout.addSection(oFormFragment);
						that.getView().byId("uploadDocBtn").setVisible(true);
					} else {
						if (that.getView().byId("uploadDocBtn") !== undefined)
							that.getView().byId("uploadDocBtn").setVisible(false);
					}
				});

			}
		},

		onItemUpload: function (oEvent) {
			var file = oEvent.getParameters().files[0];
			var metasupplier = that.getView().getModel("metasupplierData").getData().METAID;
			var oModelSupplier = undefined;
			if (that.getView().getModel("supplierListJSONModel"))
				oModelSupplier = that.getView().getModel("supplierListJSONModel").getData();
			if (oModelSupplier !== undefined && oModelSupplier.length > 0) {

				oModelSupplier.forEach(function (lifnr) {
					var reader = new FileReader();
					reader.onload = function (e) {
						//var vContent = e.currentTarget.result.replace("data:" + file.type + ";base64,", "");
						var vContent = e.currentTarget.result.split(',');
						vContent = vContent[1];
						var url = "/backend/DocumentManagement/DocUpload?I_CLASSIFICATION=GEN&I_APPLICATION=CONT_META&I_FILE_NAME=" + lifnr.LIFNR + "&I_OBJECT_CODE=" +
							lifnr.LIFNR + "&I_METAID=" + metasupplier;

						that.showBusyDialog();

						jQuery.ajax({
							url: url,
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
									that.getDocumentList();
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

					};
					reader.readAsDataURL(file);
				});

			} else {
				MessageBox.error(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
					"noUploadPossible"));
			}

		},

		onTypeMissmatch: function (oControlEvent) {
			MessageToast.show(that.getResourceBundle().getText("ERR_Type_missmatch"));
		},

		onFileSizeExceed: function (oControlEvent) {
			MessageToast.show(that.getResourceBundle().getText("ERR_file_size"));
		},

		onAttachmetnsClick: function (oEvent) {
			var getTabledata = that.getView().getModel("AttachmentsJSONModel").getData().Attachments;
			var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
			var elem = getTabledata[itemPosition];
			that.showBusyDialog()
			var url = "/backend/DocumentManagement/DocDownload?I_DOKAR=" + elem.DOKAR + "&I_DOKNR=" + elem.DOKNR + "&I_DOKTL=" + elem.DOKTL + "&I_DOKVR=" + elem.DOKVR +
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
					that.hideBusyDialog();

				})
				.catch(() => console.log("some error during download process"));

		}

	});
});