/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

if (typeof jQuery !== 'undefined') {
    jQuery.sap.declare("sap.marmolata.DatePeriodPicker", true);

    sap.ui.define(["sap/m/ComboBox"],
        function(ComboBox) {
        "use strict";

        var DatePeriodPickerModel = ComboBox.extend("sap.marmolata.DatePeriodPicker", {

            metadata : {
                properties: {
                         "showSuggestion": {type: "boolean", group: "Behavior", defaultValue: true},
                         "filterSuggests": {type: "boolean", group: "Behavior", defaultValue: false},
                         "placeholder": {type: "string", group: "Misc", defaultValue: "Enter Date or Period"},
                         "periodURL": {type: "string", group: "period"},
                         "sapclient": {type: "string", group: "Misc", defaultValue: "001"},
                         "inputFn": {type: "function", group: "Behavior"}
                     }
            },

            renderer:{},

            events: {
                inputChange: {
                    parameters : {
                        value: {type: "string"}
                    }
                }
            },

            constructor: function(datePeriodPickerProps){
                ComboBox.apply(this, arguments);
                var that = this;
            }
        });

        DatePeriodPickerModel.prototype.fireInputChange = function(evt) {
            this.fireEvent("inputChange", evt);
            return this;
        };


        DatePeriodPickerModel.prototype.oninput = function(event) {
            this.fireInputChange({value: event.target.value});
            ComboBox.prototype.oninput.call(this, event);
            return this;
        };

        DatePeriodPickerModel.prototype.attachInputChange = function(fnFunction, oListener) {
            this.attachEvent("inputChange", fnFunction, oListener);
            return this;
        };

        DatePeriodPickerModel.prototype.detachInputChange = function(fnFunction, oListener) {
            this.detachEvent("inputChange", fnFunction, oListener);
            return this;
        };

        sap.marmolata.DatePeriodPicker = DatePeriodPickerModel;

        return DatePeriodPickerModel;

    });
} else {
    console.log("Cannot declare sap.marmolata.DatePeriodPicker because of lacking jQuery");
}
