/**
* JSON-based lazy DataBinding
*
* @namespace
* @name sap.ui.model.marmolata
* @public
*/
if (typeof jQuery !== 'undefined') {
jQuery.sap.declare("sap.ui.model.marmolata.MarmolataModel")
// Provides the JSON object based model implementation
sap.ui.define(['jquery.sap.global', 'sap/ui/model/ClientModel', 'sap/ui/model/Context', 'sap/ui/model/marmolata/MarmolataListBinding', 'sap/ui/model/json/JSONPropertyBinding', 'sap/ui/model/json/JSONTreeBinding', 'sap/ui/model/json/JSONModel'],
function(jQuery, ClientModel, Context, MarmolataListBinding, JSONPropertyBinding, JSONTreeBinding) {
	"use strict";


	/**
	* Constructor for a new JSONModel.
	*
	*
	* @class
	* Model implementation for JSON format
	*
	* @extends sap.ui.model.ClientModel
	*
	* @author SAP SE
	* @version 1.36.3
	*
	* @param {object} oData either the URL where to load the JSON from or a JS object
	* @constructor
	* @public
	* @alias sap.ui.model.json.JSONModel
	*/
	var MarmolataModel = sap.ui.model.json.JSONModel.extend("sap.ui.model.marmolata.MarmolataModel", /** @lends sap.ui.model.json.JSONModel.prototype */ {

    		constructor : function(iTotalRows) {
    			//ClientModel.apply(this, arguments);
    			ClientModel.apply(this, []);

    			iTotalRows |= 0;

    			if (typeof iTotalRows == "number") {
    				this.setTotalRows(iTotalRows);
    				this.pages = [];
    				this.iPageSize = 500;
    				this.iThreshold = 100;
    				this.fetchingData = false;
    				this.hasFooter = false;
    				this.loadData = function(iOffset, iLength){

    			        var promise = new Promise(function(resolve, reject) {
                            reject(Error("loadData() on MarmolataModel was called before it was initialized"));
                        });
                        return promise;
    				}
    			}
    		},

    		metadata : {
    			publicMethods : ["setJSON", "getJSON"]
    		}
    	});

    	MarmolataModel.prototype.generateDummyData = function(){
    	    var aData = [];
            for (var i = 1; i <= 500; i++) {
        	    aData.push({number : i, text : "a" + i});
        	}
        	this.setData({modelData : aData});
    	}

    	MarmolataModel.prototype.setData = function(oData, bMerge){
        	if (bMerge) {
            	// do a deep copy
        		this.oData = jQuery.extend(true, jQuery.isArray(this.oData) ? [] : {}, this.oData, oData);
        	} else {
        		this.oData = oData;
        	}
        	this.checkUpdate();
        };


    	MarmolataModel.prototype.setLoadData = function(newLoadDataFunction){
    	    this.ui5Control.setFixedBottomRowCount(0)
    	    this.hasFooter = false;
    	    this.loadData = newLoadDataFunction;
    	}

    	// This method allows to load multiple consequtive pages with a single database query
    	MarmolataModel.prototype._fetchPages = function(iStartPageIndex, iEndPageIndex){
    		var aData = loadData(iStartPageIndex * this.iPageSize, (iStartPageIndex - iEndPageIndex + 1) * this.iPageSize);
    		var aPages = [];
    		for(var i = 0; i <= iEndPageIndex - iStartPageIndex; i ++){
    			aPages.push(aData.slice(i * this.iPageSize, (i + 1) * this.iPageSize -1));
    			console.log("CLF fetched Page " + (i + iStartPageIndex));
    		}
    	}

    	MarmolataModel.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
    		var oBinding = new MarmolataListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
    		return oBinding;
    	};

    	MarmolataModel.prototype.getRow = function(row) {
    	    return this._getObject("/" + row);
    	}

    	MarmolataModel.prototype._getObject = function (sPath, oContext) {
    		var oNode = this.isLegacySyntax() ? this.oData : null;
    		if (oContext instanceof Context) {
    			oNode = this._getObject(oContext.getPath());
    		} else if (oContext) {
    			oNode = oContext;
    		}
    		if (!sPath) {
    			return oNode;
    		}
    		var aParts = sPath.split("/"),
    			iIndex = 0;
    		if (!aParts[0]) {
    			// absolute path starting with slash
    			oNode = this.oData;
    			iIndex++;
    		}
    		while (oNode && aParts[iIndex]) {
    			oNode = oNode[aParts[iIndex]];
    			iIndex++;
    		}

    		if(this.oData.length < this.getTotalRows() && !isNaN(Number(aParts[iIndex - 1])) && Number(aParts[iIndex -1]) != this.oData.length -1){
    			if(Number(aParts[iIndex -1]) > this.oData.length - this.getThreshold()){
    			    if(!this.fetchingData){
                        this.fetchingData = true
                        var aData = this.loadData(this.oData.length, this.getPageSize());
                        aData.then(function(val){
                            if(this.hasFooter){
                                var newData = this.oData.slice(0,this.oData.length -1).concat(val).concat([this.oData[this.oData.length -1]])
                            }else{
                                var newData = this.oData.concat(val)
                            }
                            this.oData = newData
                            this.checkUpdate();
                            this.fetchingData = false;
                        }.bind(this),function(reason) {
                            this.fetchingData = false;
                            console.log("Error Query failed: "+reason)
                        }.bind(this));
                    }
                }

    		}
    		return oNode;
    	};

    	MarmolataModel.prototype.setTotalRows = function(iTotalRows){
    		this.iTotalRows = iTotalRows;
    	}

    	MarmolataModel.prototype.getTotalRows = function(){
    		return this.iTotalRows;
    	}

    	MarmolataModel.prototype.setPageSize = function(iPageSize){
    		this.iPageSize = iPageSize;
    	}

    	MarmolataModel.prototype.getPageSize = function(){
    		return this.iPageSize;
    	}

    	MarmolataModel.prototype.setThreshold = function(iThreshold){
    		this.iThreshold = iThreshold;
    	}

    	MarmolataModel.prototype.getThreshold = function(){
    		return this.iThreshold;
    	}

    	MarmolataModel.prototype.setRowProvider = function(rowProvider){
    	    this.hasFooter = false;
    	    this.fetchingData = false;
    	    this.rowProvider = rowProvider;
    	}

    	MarmolataModel.prototype.setUi5Control = function(ui5Control) {
    	    this.ui5Control = ui5Control;
    	}

        MarmolataModel.prototype.setFooter = function(row){
            if(this.hasFooter){
                this.oData[this.oData.length - 1] = value
            }else{
                this.hasFooter = true;
                this.ui5Control.setFixedBottomRowCount(1)
                this.oData.push(row)
            }
            this.checkUpdate();
        }

    	sap.ui.model.marmolata.MarmolataModel = MarmolataModel;
    	return MarmolataModel;

});
}
