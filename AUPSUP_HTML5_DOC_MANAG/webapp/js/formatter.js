jQuery.sap.declare("STATO.formatter");

STATO.formatter = {

	getColor: function (value) {

		if (value == "H") return "red";
		if (value == "L") return "green";
		if (value == "MH") return "orange";
		if (value == "") return "white";
		if (value == "ML") return "grey";
		if (value == "M") return "gold";

		return "white";

	},

	getRowColor: function (value) {
		var cellId = this.getId();

		if (value != null && value != "")
			$("#" + cellId).parent().parent().parent().css("background-color", "#BFBFBF");
		else
			$("#" + cellId).parent().parent().parent().css("background-color", "white");

	}
};