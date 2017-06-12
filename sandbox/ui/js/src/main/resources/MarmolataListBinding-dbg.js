/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
if (typeof jQuery !== 'undefined') {
jQuery.sap.declare("sap.ui.model.marmolata.MarmolataListBinding", true)
// Provides the lazy JSON model implementation of a list binding
sap.ui.define(['jquery.sap.global', 'sap/ui/model/ChangeReason', 'sap/ui/model/ClientListBinding', 'sap/ui/model/json/JSONListBinding'],
	function(jQuery, ChangeReason, ClientListBinding) {
	"use strict";



	/**
	 *
	 * @class
	 * Lazy list binding implementation for JSON format
	 *
	 * @param {sap.ui.model.json.JSONModel} oModel
	 * @param {string} sPath
	 * @param {sap.ui.model.Context} oContext
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [aSorters] initial sort order (can be either a sorter or an array of sorters)
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [aFilters] predefined filter/s (can be either a filter or an array of filters)
	 * @param {object} [mParameters]
	 * @alias sap.ui.model.marmolata.MarmolataListBinding
	 * @extends sap.ui.model.json.JSONListBinding
	 */

	var MarmolataListBinding = sap.ui.model.json.JSONListBinding.extend("sap.ui.model.marmolata.MarmolataListBinding");
      sap.ui.model.marmolata.MarmolataListBinding = MarmolataListBinding;

    	MarmolataListBinding.prototype.sort = function(aSorters) {
    		console.log("Sort Condition " + aSorters[0].sPath + " desc " + aSorters[0].bDescending)


    		// Swap data here
    		this._fireChange({reason: ChangeReason.Sort});
    		return this;
    	}

    	MarmolataListBinding.prototype.filter = function(aFilters, sFilterType, bReturnSuccess) {
    		for (var i = 0; i < aFilters.length; i++) {
    			console.log("Filter Condidtion: " + aFilters[i].sPath + " " + aFilters[i].sOperator + " " + aFilters[i].oValue1 + " " + aFilters[i].oValue2 + " " + aFilters[i]._bMultiFilter);
    		}
    		// Swap data here
    		var aData =  [{number : 12, text : "a12"}];
    		this.oModel.setData({modelData: aData} , false);
    		//this.oModel.setData({modelData:[{number : aFilters[0].oValue1, text : "a" + aFilters[0].oValue1}]} , false);
    		var model = this.oModel
    		bReturnSuccess = true;
    		this._fireChange({reason: ChangeReason.Change});
    		//["sPath", "sOperator", "oValue1", "oValue2", "_bMultiFilter"]
    	}

    	MarmolataListBinding.prototype.loadData = function(iOffset, iLength){
    		if(iOffset < 100){
    			var aData = [];
    			for (var loadedRows = 1; loadedRows <= iLength; loadedRows++) {
    				aData.push({number : loadedRows + iOffset, text : "a" + (loadedRows + iOffset)});
    			}
    			console.log("Loaded " + loadedRows + " rows, starting at " + iOffset)
    			return aData;
    		}else{
    			return [];
    		}
    	}

    	MarmolataListBinding.prototype.setThreshold = function(iThreshold){
    		this.iThreshold = iThreshold;
    	}

    	MarmolataListBinding.prototype.getThreshold = function(){
    		return this.iThreshold;
    	}

    	MarmolataListBinding.prototype.setPageSize = function(iPageSize){
    		this.iPageSize = iPageSize;
    	}

    	MarmolataListBinding.prototype.getPageSize = function(){
    		return this.iPageSize;
    	}

    	MarmolataListBinding.prototype.getContexts = function(iStartIndex, iLength) {
    		if (!iStartIndex) {
    			iStartIndex = 0;
    		}
    		if (!iLength) {
    			iLength = Math.min(this.iLength, this.oModel.iSizeLimit);
    		}

    		var aContexts = this._getContexts(iStartIndex, iLength),
    			oContextData = {};

    		if (this.bUseExtendedChangeDetection) {

    			for (var i = 0; i < aContexts.length; i++) {
    				oContextData[aContexts[i].getPath()] = aContexts[i].getObject();
    			}

    			//Check diff
    			if (this.aLastContexts && iStartIndex < this.iLastEndIndex) {
    				var that = this;
    				var aDiff = jQuery.sap.arrayDiff(this.aLastContexts, aContexts, function(oOldContext, oNewContext) {
    					return jQuery.sap.equal(
    							oOldContext && that.oLastContextData && that.oLastContextData[oOldContext.getPath()],
    							oNewContext && oContextData && oContextData[oNewContext.getPath()]
    						);
    				});
    				aContexts.diff = aDiff;
    			}

    			this.iLastEndIndex = iStartIndex + iLength;
    			this.aLastContexts = aContexts.slice(0);
    			this.oLastContextData = jQuery.extend(true, {}, oContextData);
    		}

    		return aContexts;
    	};

    	return MarmolataListBinding;

});
}
