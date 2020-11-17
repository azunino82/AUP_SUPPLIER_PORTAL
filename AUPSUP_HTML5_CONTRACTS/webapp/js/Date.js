sap.ui.define([
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException"
], function (SimpleType, ValidateException) {
	"use strict";

	return SimpleType.extend("it.aupsup.contracts.type.Date", {

		formatValue: function (sDate) {

			var oFromFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "yyyyMMdd"
			});
			var oDate = oFromFormat.parse(sDate, true);
			var oToFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd MMM yyyy"
			});
			if (sDate === "00000000") {
				return ""; // or whatever special case
			} else {
				var sResult = oToFormat.format(oDate);
				return sResult;
			}
		},

		parseValue: function (oValue) {
			return oValue;
		},

		validateValue: function (oValue) {
			return true;
		}

	});

});