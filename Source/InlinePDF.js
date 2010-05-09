/* 
	
	InlinePDF.js

	A MooTools class to handle inline PDF viewing, in conjunction with serverside InlinePDF.php

	Created on 09/05/2010 by Ryan Mitchell

	Changes:

	* 09/05/2010 by Ryan Mitchell
	  Initial implementation

*/
var InlinePDF = new Class({

	Implements: [ Options, Events ],
	
	options: {
		el: document.id(document.body),
		url: 'InlinePDF.php',
		animate: true,
		selectedClass: 'selected',
		showThumbs: true,
		showBackForward: true,
		showZoom: true
	},
	
	// values corresponding to the pdf
	// set them as variables so that you can use
	// instance.get('pagecount') etc...
	pagecount: 0,
	currentpage: 0,
	pdfurl: '',
	thumbs: [],
	pages: [],
	
	// initialize
	initialize: function(o){
		this.setOptions(o);
	
		// set up our request object
		this.request = new Request.JSON({ url:this.options.url, method:'post' }).addEvent('success', this.success.bind(this)).addEvent('failure', this.failure.bind(this));
	
		// canvas or not?
		this.canvas = canvasSupported();
	
	},
	
	// set up the viewer
	setup: function(){
	
		// create our viewer window etc, canvas with fallback for non-canvas browsers
		
		// note, showThumbs, showBackForward, showZoom
	
		// fire setup event
		this.fireEvent('setup');
		
		// return this for chaining
		return this;	
	},
	
	// is the <canvas> element supported?
	canvasSupported: function() {
		try {
			canvas = !!(document.createElement('canvas').getContext('2d')); // S60
		} catch(e){
			canvas = !!(document.createElement('canvas').getContext); // IE
		} 
		return canvas;
	},

	// set the values of the pdf
	success: function(j){
		
		if (j){
			this.failure();
			return;
		}
		
		if (j.error){
			this.failure(j.errormsg);
			return;
		}
		
		// set values returned by server-side script
		this.pagecount = j.pagecount;
		this.pdfurl = j.pdfurl;
		this.thumbs = j.thumbs;
		this.pages = j.pages;
		
		// output pdf
		
		// fire show event
		this.fireEvent('show');
		
	},
	
	// display a failure message
	failure: function(msg){
		if (msg){
			alert(msg);
		} else {
			alert('Unable to read the file passed');
		}
	},
	
	// show a pdf
	show: function(pdf, opts){
	
		// fire show event
		this.fireEvent('beforeshow');
		
		// default options
		var opts = $merge({
			nocache: true
		}, opts);
		
		// send request
		this.request.send({
			pdf: pdf,
			options: JSON.encode(opts)
		});
		
		return this;
				
	},
	
	// change page
	changePage: function(page){
	
		if (this.pagecount > 0){
			if (this.pagecount >= page){
			
				// set currentpage var
				this.currentpage = page;
			
				// need to add selected class to thumb
				
				// need to set the main image
				
				// need to update back/forward to selectable or not
			
			}
		}
	
		return this;
	
	},
	
	// previous page convenience function
	previousPage: function(){
		if (this.currentpage > 0){
			this.changePage(this.currentpage - 1);
		}
		return this;
	},
	
	// next page convenience function
	nextPage: function(){
		if (this.currentpage < this.pagecount){
			this.changePage(this.currentpage + 1);
		}
		return this;
	}

});