"use strict";

(function() {
  if (typeof jQuery !== 'undefined') {
    jQuery.sap.require("sap.m.NavContainer");
    jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-core");
    jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-effect");
    jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-effects-core");
    jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-effects-slide");


    sap.m.NavContainer.transitions["slideRight"] = {
      to: function (oFromPage, oToPage, fCallback) {
        window.setTimeout(function () {
          oFromPage.$().hide("slide", { direction: "right" });
          oToPage.$().show("slide", { direction: "left" });
          fCallback();
        });
      },
      back: function (oFromPage, oToPage, fCallback) {
        window.setTimeout(function () {
          oFromPage.$().hide("slide", { direction: "left" });
          oToPage.$().show("slide", { direction: "right" });
          fCallback();
        });
      }
    };

    sap.m.NavContainer.transitions["slideLeft"] = {
      to: function (oFromPage, oToPage, fCallback) {
        window.setTimeout(function () {
          oFromPage.$().hide("slide", { direction: "left" });
          oToPage.$().show("slide", { direction: "right" });
          fCallback();
        });
      },
      back: function (oFromPage, oToPage, fCallback) {
        window.setTimeout(function () {
          oFromPage.$().hide("slide", { direction: "right" });
          oToPage.$().show("slide", { direction: "left" });
          fCallback();
        });
      }
    };
  }
})()
