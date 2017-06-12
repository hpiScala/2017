if (typeof jQuery !== "undefined") {

sap.ui.define(
  ["sap/ui/core/Control"],
  function (Control) {

    "use strict";

    let Canvas = Control.extend("sap.marmolata.ui.Canvas", {

      metadata: {
        properties: {
          "width": { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: null },
          "height": { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: null },
          "backgroundColor": { type: "sap.ui.core.CSSColor", defaultValue: "white" }
        }
      },

      renderer: function (oRm, oControl) {
        //first up, render a div for the ShadowBox
        oRm.write("<canvas");

        //next, render the control information, this handles your sId (you must do this for your control to be properly tracked by ui5).
        oRm.writeControlData(oControl);
        oRm.write("style='position:relative;background-color:" +
          oControl.getBackgroundColor() + ";'");
        oRm.write(">");

        oRm.write("</canvas>");
      },

      onAfterRendering: function () {
        if (sap.ui.core.Control.prototype.onAfterRendering) {
          sap.ui.core.Control.prototype.onAfterRendering.apply(this, arguments);
        }
      }
    });

    Canvas.prototype.doWithContext = function (f) {
      var self;
      self = this;
      setTimeout(function () {
        if (!self.getDomRef()) throw "Canvas internal not found. Canvas needs to be rendered before being used";
        f(self.getDomRef().getContext("2d"));
      }, 0);
    }

    Canvas.prototype.clear = function () {
      var self = this;

      setTimeout(function () {
        if (!self.getDomRef())
          throw "Canvas internal not found. Canvas needs to be rendered before being used";
        var ctx = self.getDomRef().getContext("2d");
        ctx.clearRect(0, 0, self.getDomRef().width, self.getDomRef().height)
      }, 0);
    }

    return Canvas;
  }
);

jQuery.sap.declare("sap.marmolata.ui.Canvas");
}