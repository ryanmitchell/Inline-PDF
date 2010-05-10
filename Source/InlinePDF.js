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
		showZoom: true,
		showDownload: true
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
		this.request = new Request.JSON({ url:this.options.url, method:'post' })
		.addEvent('success', this.success.bind(this))
		.addEvent('failure', this.failure.bind(this));
	
		// canvas or not?
		this.canvas = this.canvasSupported();
		
		// setup
		this.setup();
	
	},
	
	// set up the viewer
	setup: function(){
	
		// create our viewer window etc, canvas with fallback for non-canvas browsers
		this.viewer = document.id(this.options.el).empty();
		
		// main page viewer
		this.viewer.adopt(new Element('div').addClass('page'));
		
		// show back/foward
		if (this.options.showBackForward){
		
			var self = this;
			
			var bf = new Element('div', { html: '<p></p>' }).addClass('nav');
			
			var bk = new Element('a', { html: 'Back', href: '#back' })
			.addEvent('click', function(ev){
			
				if (ev) ev.stop();
			
				if (self.currentpage > 0){
					self.changePage(self.currentpage - 1);
				}
			
			});
			
			bf.getElement('p').adopt(bk).adopt(new Element('span', {html: ' '}));
			
			var nx = new Element('a', { html: 'Forward', href: '#next' })
			.addEvent('click', function(ev){
			
				if (ev) ev.stop();
			
				if (self.currentpage < (self.pagecount - 1)){
					self.changePage(self.currentpage + 1);
				}
			
			});
			
			bf.getElement('p').adopt(nx);
			
			// adopt back/forward
			this.viewer.adopt(bf);
		
		}
		
		// show download
		if (this.options.showDownload){
		
			this.viewer.adopt(new Element('div', { html: '<p><a href="#download">Download</a></p>' }).addClass('download'));
			
			self = this;
			this.viewer.getElement('div.download a').addEvent('click', function(ev){
				
				if (ev) ev.stop();
				
				self.download();
				
			});
		
		}
		
		// show Zoom
		if (this.options.showZoom){
		
			var self = this;
			
			this.viewer.adopt(new Element('div', {html: '<p></p>' }).addClass('zoom'));
			
			this.viewer.getElement('div.zoom p').adopt(new Element('select'));
			
			this.viewer.getElement('div.zoom select').adopt(new Element('option', { value: 0.25, html: '25%' }));
			this.viewer.getElement('div.zoom select').adopt(new Element('option', { value: 0.50, html: '50%' }));
			this.viewer.getElement('div.zoom select').adopt(new Element('option', { value: 0.75, html: '75%' }));
			this.viewer.getElement('div.zoom select').adopt(new Element('option', { value: 1, html: '100%' }).set('selected', true));
			this.viewer.getElement('div.zoom select').adopt(new Element('option', { value: 1.5, html: '150%' }));
			this.viewer.getElement('div.zoom select').adopt(new Element('option', { value: 2, html: '200%' }));

		}
		
		
		// show thumblist?
		if (this.options.showThumbs){
		
			var self = this;
		
			var tl = new Element('ul').addClass('thumblist').addEvent('click', function(ev){
							
				if (ev) ev.stop();
				
				var tar = document.id(ev.target);
				
				if (tar.get('tag') == 'img') tar = tar.getParent('a');
				if (tar.get('tag') != 'a') return;
			
				self.changePage(parseInt(tar.getProperty('href').replace('#', '')) - 1);
			
			});
		
			this.viewer.adopt(tl);
		}
		
		this.viewer.adopt(new Element('div', {html: '<p>Still to do:<br />* Canvas based for those that can<br />* Make zoom etc work<br />* Preloading<br />* Animations<br />* Drag/moving of main image</p>' }));
	
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
		
		// error catching
		if (!j){
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
		if (this.pagecount > 0){
				
			// thumbs
			this.viewer.getElement('ul.thumblist').empty();
			this.thumbs.each(function(el, i){
				this.viewer.getElement('ul.thumblist').adopt(new Element('li', { html: '<a href="#' + (i+1) + '"><img src="' + el + '" /></a>' }));
			});
			
			// change page
			this.changePage(0);
		
		}
		
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
			nocache: false
		}, opts);
		
		// make data to query string
		var data = $H({
			pdf: pdf,
			options: JSON.encode(opts)
		});
		
		// send request
		this.request.send(data.toQueryString());
		
		return this;
				
	},
	
	// change page
	changePage: function(page){
	
		if (this.pagecount > 0){
				
			if (this.pagecount >= page){
			
				// set currentpage var
				this.currentpage = page;
								
				// output main image
				this.viewer.getElement('div.page').set('html', '<img src="' + this.pages[page] + '" />');
				
				if (this.options.showThumbs){
			
					// remove selected from thumbs
					this.viewer.getElements('ul.thumblist li').removeClass(this.options.selectedClass);
				
					// need to add selected class to thumb
					this.viewer.getElements('ul.thumblist li')[page].addClass(this.options.selectedClass);
				
				}
								
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
	},
	
	// download file convenience function
	download: function(){
		window.open(this.pdfurl);
	},
	
	// get
	get: function(k){
		try {
			return eval('this.' + k);
		} catch (e){
			return null;
		}
	}

});

window.addEvent('domready', function(){
	
	window.ip = new InlinePDF({ el: document.id('viewer') }).show('http://www.nitec.com/cmsfiles/pdf/wg_2010_security_predictions.pdf');
	
});