jQuery.sap.declare("COLOR.formatter");

COLOR.formatter = {

	getColor: function (value) {
		var cellId = this.getId() + "-inner";

		if (value == "L") {
			this.addStyleClass('buttonColor');
		}

	}
};