/* 
	
	InlinePDF.js

	A MooTools class to handle inline PDF viewing, in conjunction with serverside InlinePDF.php

	Created on 09/05/2010 by Ryan Mitchell

	Changes:

	* 09/05/2010 by Ryan Mitchell
	  Initial implementation
	  
	* 17/05/2010 by Ryan Mitchell
	  Changed to use Request.JSONP for cross-domain access

*/

// Fx.Scroll and Request.JSONP
MooTools.More={version:"1.2.4.4",build:"6f6057dc645fdb7547689183b2311063bd653ddf"};(function(){var c=this;var b=function(){if(c.console&&console.log){try{console.log.apply(console,arguments);
}catch(d){console.log(Array.slice(arguments));}}else{Log.logged.push(arguments);}return this;};var a=function(){this.logged.push(arguments);return this;
};this.Log=new Class({logged:[],log:a,resetLog:function(){this.logged.empty();return this;},enableLog:function(){this.log=b;this.logged.each(function(d){this.log.apply(this,d);
},this);return this.resetLog();},disableLog:function(){this.log=a;return this;}});Log.extend(new Log).enableLog();Log.logger=function(){return this.log.apply(this,arguments);
};})();Fx.Scroll=new Class({Extends:Fx,options:{offset:{x:0,y:0},wheelStops:true},initialize:function(b,a){this.element=this.subject=document.id(b);this.parent(a);
var d=this.cancel.bind(this,false);if($type(this.element)!="element"){this.element=document.id(this.element.getDocument().body);}var c=this.element;if(this.options.wheelStops){this.addEvent("start",function(){c.addEvent("mousewheel",d);
},true);this.addEvent("complete",function(){c.removeEvent("mousewheel",d);},true);}},set:function(){var a=Array.flatten(arguments);if(Browser.Engine.gecko){a=[Math.round(a[0]),Math.round(a[1])];
}this.element.scrollTo(a[0],a[1]);},compute:function(c,b,a){return[0,1].map(function(d){return Fx.compute(c[d],b[d],a);});},start:function(c,g){if(!this.check(c,g)){return this;
}var e=this.element.getScrollSize(),b=this.element.getScroll(),d={x:c,y:g};for(var f in d){var a=e[f];if($chk(d[f])){d[f]=($type(d[f])=="number")?d[f]:a;
}else{d[f]=b[f];}d[f]+=this.options.offset[f];}return this.parent([b.x,b.y],[d.x,d.y]);},toTop:function(){return this.start(false,0);},toLeft:function(){return this.start(0,false);
},toRight:function(){return this.start("right",false);},toBottom:function(){return this.start(false,"bottom");},toElement:function(b){var a=document.id(b).getPosition(this.element);
return this.start(a.x,a.y);},scrollIntoView:function(c,e,d){e=e?$splat(e):["x","y"];var h={};c=document.id(c);var f=c.getPosition(this.element);var i=c.getSize();
var g=this.element.getScroll();var a=this.element.getSize();var b={x:f.x+i.x,y:f.y+i.y};["x","y"].each(function(j){if(e.contains(j)){if(b[j]>g[j]+a[j]){h[j]=b[j]-a[j];
}if(f[j]<g[j]){h[j]=f[j];}}if(h[j]==null){h[j]=g[j];}if(d&&d[j]){h[j]=h[j]+d[j];}},this);if(h.x!=g.x||h.y!=g.y){this.start(h.x,h.y);}return this;},scrollToCenter:function(c,e,d){e=e?$splat(e):["x","y"];
c=$(c);var h={},f=c.getPosition(this.element),i=c.getSize(),g=this.element.getScroll(),a=this.element.getSize(),b={x:f.x+i.x,y:f.y+i.y};["x","y"].each(function(j){if(e.contains(j)){h[j]=f[j]-(a[j]-i[j])/2;
}if(h[j]==null){h[j]=g[j];}if(d&&d[j]){h[j]=h[j]+d[j];}},this);if(h.x!=g.x||h.y!=g.y){this.start(h.x,h.y);}return this;}});Request.JSONP=new Class({Implements:[Chain,Events,Options,Log],options:{url:"",data:{},retries:0,timeout:0,link:"ignore",callbackKey:"callback",injectScript:document.head},initialize:function(a){this.setOptions(a);
if(this.options.log){this.enableLog();}this.running=false;this.requests=0;this.triesRemaining=[];},check:function(){if(!this.running){return true;}switch(this.options.link){case"cancel":this.cancel();
return true;case"chain":this.chain(this.caller.bind(this,arguments));return false;}return false;},send:function(c){if(!$chk(arguments[1])&&!this.check(c)){return this;
}var e=$type(c),a=this.options,b=$chk(arguments[1])?arguments[1]:this.requests++;if(e=="string"||e=="element"){c={data:c};}c=$extend({data:a.data,url:a.url},c);
if(!$chk(this.triesRemaining[b])){this.triesRemaining[b]=this.options.retries;}var d=this.triesRemaining[b];(function(){var f=this.getScript(c);this.log("JSONP retrieving script with url: "+f.get("src"));
this.fireEvent("request",f);this.running=true;(function(){if(d){this.triesRemaining[b]=d-1;if(f){f.destroy();this.send(c,b).fireEvent("retry",this.triesRemaining[b]);
}}else{if(f&&this.options.timeout){f.destroy();this.cancel().fireEvent("failure");}}}).delay(this.options.timeout,this);}).delay(Browser.Engine.trident?50:0,this);
return this;},cancel:function(){if(!this.running){return this;}this.running=false;this.fireEvent("cancel");return this;},getScript:function(c){var b=Request.JSONP.counter,d;
Request.JSONP.counter++;switch($type(c.data)){case"element":d=document.id(c.data).toQueryString();break;case"object":case"hash":d=Hash.toQueryString(c.data);
}var e=c.url+(c.url.test("\\?")?"&":"?")+(c.callbackKey||this.options.callbackKey)+"=Request.JSONP.request_map.request_"+b+(d?"&"+d:"");if(e.length>2083){this.log("JSONP "+e+" will fail in Internet Explorer, which enforces a 2083 bytes length limit on URIs");
}var a=new Element("script",{type:"text/javascript",src:e});Request.JSONP.request_map["request_"+b]=function(){this.success(arguments,a);}.bind(this);return a.inject(this.options.injectScript);
},success:function(b,a){if(a){a.destroy();}this.running=false;this.log("JSONP successfully retrieved: ",b);this.fireEvent("complete",b).fireEvent("success",b).callChain();
}});Request.JSONP.counter=0;Request.JSONP.request_map={};

var InlinePDF = new Class({

	Implements: [ Options, Events ],
	
	options: {
		el: document.id(document.body),
		url: 'http://pdf.rtnetworks.net/InlinePDF.php',
		selectedClass: 'selected',
		showThumbs: true,
		showPageChooser: true,
		showBackForward: true,
		showZoom: true,
		showDownload: true,
		initialZoom: 0.75,
		maxThumbDims: { x: 100, y: 75 },
		maxPageDims: { x: 1000, y: 1000 }
	},
	
	// values corresponding to the pdf being displayed
	pagecount: 0,
	currentpage: 0,
	pdfurl: '',
	thumbs: [],
	pages: [],
	geometry: { x: 0, y: 0 },
	
	// initialize
	initialize: function(o){
		this.setOptions(o);
	
		// set up our request object
		this.request = new Request.JSONP({ url:this.options.url, onComplete: this.success.bind(this) });
	
		// canvas or not?
		this.canvas = this.canvasSupported();
		
		// setup
		this.setup();
	
	},
	
	// set up the viewer
	setup: function(){
	
		// create our viewer window
		this.viewer = new Element('div').setStyles({
			'position': 'relative',
			'width' : document.id(this.options.el).getStyle('width'),
			'height' : document.id(this.options.el).getStyle('height')
		});
		
		// make it a child of our element
		document.id(this.options.el).empty().adopt(this.viewer);
		
		// main page viewer
		this.viewer.adopt(new Element('div', { html: '<ul></ul>' }).addClass('page'));
		
		// set position as relative
		this.viewer.getElement('div.page').setStyle('position', 'relative');
		
		// add some padding to the ul, to make sure we can always scroll
		this.viewer.getElement('div.page ul').setStyles({
			'padding-bottom': 500,
			'padding-top' : 1000,
			'padding-left' : 500,
			'padding-right' : 500
		});
		
		// mouse down could be dragging
		this.viewer.getElement('div.page ul')
		.addEvent('mousedown', function(ev){
		
			if (ev) ev.stop();
			
			this.dragging = true;
			this.startpos = ev.page;

			this.viewer.setStyle('cursor', 'move');
		
		}.bindWithEvent(this))
		.addEvent('mouseup', function(ev){
		
			if (ev) ev.stop();
			
			this.dragging = false;
			this.viewer.setStyle('cursor', 'default');
		
		}.bindWithEvent(this))
		.addEvent('mousemove', function(ev){
		
			if (this.dragging){
			
				// defaults
				x = y = 0;
				
				// if startpos
				if (this.startpos){
				
					// work out delta
					x = this.startpos.x - ev.page.x;
					y = this.startpos.y - ev.page.y;
					
					// set startpos for next event fire
					this.startpos = ev.page;
				
				}
				
				// current scroll + delta
				y = this.viewer.getElement('div.page').getScroll().y + y;
				x = this.viewer.getElement('div.page').getScroll().x + x;
															
				// work out where we should be?
				this.scroller.set(x, y);
				this.scroller.fireEvent('complete');
							
			}
		
		}.bindWithEvent(this));
		
		// catch mouseup on body in case we move off the viewer and release
		document.id(document.body).addEvent('mouseup', function(ev){ this.viewer.getElement('div.page ul').fireEvent('mouseup', ev); }.bind(this));
				
		// set up scroller
		this.scroller = new Fx.Scroll(this.viewer.getElement('div.page'));
		
		self = this;
		
		// on complete we should fire an event telling us what page we are on	
		this.scroller.addEvent('complete', function(ev){
						
			scrollr = this.viewer.getElement('div.page').getScroll().y;
			
			self = this;
						
			this.viewer.getElements('div.page ul li').each(function(e, id){
			
				// work out which page is closest to the top of the window
				if (scrollr > e.getPosition(self.viewer.getElement('div.page')).y - 5 - parseInt(e.getStyle('margin-bottom'))){
					if (scrollr < (e.getPosition(self.viewer.getElement('div.page')).y - 5 - parseInt(e.getStyle('margin-bottom')) + e.getSize().y)){
						if (id != self.currentpage){
							self.currentpage = id;
							self.fireEvent('pagechange', ev);
						}
					}
				}
			
			});
			
		}.bind(this));
		
		// create navbar
		this.navbar = new Element('div', { html: '<p></p>' }).addClass('navbar');
		this.viewer.adopt(this.navbar);
		
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
			this.navbar.adopt(bf);
		
		}
		
		// show download
		if (this.options.showDownload){
		
			this.navbar.adopt(new Element('div', { html: '<p><a href="#download">Download</a></p>' }).addClass('download'));
			
			self = this;
			this.viewer.getElement('div.download a').addEvent('click', function(ev){
				
				if (ev) ev.stop();
				
				self.download();
				
			});
		
		}
		
		// show Zoom
		if (this.options.showZoom){
		
			var self = this;
			
			this.navbar.adopt(new Element('div', {html: '<p></p>' }).addClass('zoom'));
			
			this.viewer.getElement('div.zoom p').adopt(new Element('select'));
			
			this.viewer.getElement('div.zoom select').adopt(new Element('option', { value: 0.25, html: '25%' }));
			this.viewer.getElement('div.zoom select').adopt(new Element('option', { value: 0.50, html: '50%' }));
			this.viewer.getElement('div.zoom select').adopt(new Element('option', { value: 0.75, html: '75%' }));
			this.viewer.getElement('div.zoom select').adopt(new Element('option', { value: 1, html: '100%' }).set('selected', true));
			this.viewer.getElement('div.zoom select').adopt(new Element('option', { value: 1.5, html: '150%' }));
			this.viewer.getElement('div.zoom select').adopt(new Element('option', { value: 2, html: '200%' }));
			
			this.viewer.getElement('div.zoom select').addEvent('change', this.zoom.bind(this));

		}
		
		// show page chooser
		if (this.options.showPageChooser){
		
			this.navbar.adopt(new Element('div', {html: '<p>Page <select name="tp"><option value="1">1</option></select><span class="pc"> of 1</span></p>' }).addClass('pagechooser'));	
			this.viewer.getElement('div.pagechooser select').addEvent('change', function(ev){ self.changePage(this.get('value') - 1); });
			
			var self = this;
			
			// use pagechange event to update select box
			this.addEvent('pagechange', function(ev){
				self.viewer.getElement('div.pagechooser select').set('value', self.currentpage + 1);
				self.viewer.getElement('div.pagechooser select').get('value');
			}.bindWithEvent(this));
					
		}
		
		// show thumblist?
		if (this.options.showThumbs){
		
			var self = this;
		
			var tl = new Element('ul').addClass('thumblist').addEvent('click', function(ev){
							
				if (ev) ev.stop();
				
				var tar = document.id(ev.target);
				
				if (tar.get('tag') == 'img') tar = tar.getParent('a');
				if (tar.get('tag') != 'a') return;
			
				pg = tar.getProperty('href').split('#');
				pg = parseInt(pg[1]);
			
				self.changePage(pg - 1);
			
			}).addEvent('mousedown', function(ev){
			
				if (ev) ev.stop();
			
			});
		
			this.viewer.adopt(tl);
			
			// use pagechange event to update selected state
			this.addEvent('pagechange', function(ev){
				self.viewer.getElements('ul.thumblist li').removeClass('selected');
				self.viewer.getElements('ul.thumblist li')[self.currentpage].addClass('selected');
			}.bindWithEvent(this));
			
		}
			
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
		this.geometry = j.geometry;
		
		// output pdf
		if (this.pagecount > 0){
		
			// get pages
			this.viewer.getElement('div.page ul').empty().setStyles({
				'width': this.geometry.x,
				'opacity': 0
			});
			this.pages.each(function(el, i){
				this.viewer.getElement('div.page ul').adopt(new Element('li', { html: '<img src="' + el + '" />' }));
			}, this);
			
			// show thumbs?
			if (this.options.showThumbs){
				
				// thumbs
				this.viewer.getElement('ul.thumblist').empty();
				this.thumbs.each(function(el, i){
					this.viewer.getElement('ul.thumblist').adopt(new Element('li', { html: '<a href="#' + (i+1) + '"><img src="' + el + '" /></a>' }));
				}, this);
			
			}
			
			// page chooser?
			if (this.options.showPageChooser){
				this.viewer.getElement('div.pagechooser select').empty();
				for (i=1;i<=this.pagecount;i++){
					this.viewer.getElement('div.pagechooser select').adopt(new Element('option',{ value:i, text:i }));
				}
				this.viewer.getElement('div.pagechooser span.pc').set('html', 'of ' + this.pagecount);				
			}
			
			// fix it to first page
			this.scroller.set(parseInt(this.viewer.getElements('div.page ul').getStyle('padding-left')), parseInt(this.viewer.getElements('div.page ul').getStyle('padding-top')));
			
			// fade it in
			this.viewer.getElement('div.page ul').tween('opacity', 1);
			
			// set initial zoom
			this.viewer.getElements('div.page ul li img').setStyles({
				'width' : this.geometry.x * this.options.initialZoom,
				'height' : this.geometry.y * this.options.initialZoom
			});
			
			if (this.options.showZoom){
				this.viewer.getElement('div.zoom select').set('value', this.options.initialZoom);
			}
			
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
			nocache: false,
			thumbmaxheight: this.options.maxThumbDims.y,
			thumbmaxwidth: this.options.maxThumbDims.x,
			pagemaxheight: this.options.maxPageDims.y,
			pagemaxwidth: this.options.maxPageDims.x
		}, opts);
		
		// make data to query string
		var data = {
			pdf: pdf,
			options: JSON.encode(opts)
		};
		
		// send request
		this.request.send({ data: data });
		
		return this;
				
	},
	
	// change page
	changePage: function(page){
	
		if (this.pagecount > 0){
				
			if (this.pagecount >= page){
			
				// get position
				var pos = this.viewer.getElements('div.page ul li')[page].getPosition(this.viewer.getElement('div.page ul'));
				
				// scroll to main image
				this.scroller.start(this.viewer.getElements('div.page ul').getScroll().x, pos.y);
				
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
	
	// zoom
	zoom: function(ev){
	
		// zoom value
		val = this.viewer.getElement('div.zoom select').get('value');
			
		this.viewer.getElements('div.page ul li img').morph({
			'width' : this.geometry.x * val,
			'height' : this.geometry.y * val
		});
	
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