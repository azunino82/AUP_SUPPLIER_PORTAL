sap.ui.define([
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException"
], function (SimpleType, ValidateException) {
    "use strict";
    
    return SimpleType.extend("it.alteaup.supplier.portal.aprvschdagr.AUPSUP_HTML5_APR_SCDAGR.type.Date", {
    	 
        formatValue: function(sDate) {

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
        
        parseValue: function(oValue) {
            return oValue;
        },
        
        validateValue: function(oValue) {
        	return true;
        }

    });

});