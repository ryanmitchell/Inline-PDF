Inline PDF
===========

A inline PDF viewer with a [MooTools](http://mootools.net/) front end, and a [PHP](http://php.net) backend.

Features
--------

* Converts each page of PDF to JPEG
* Cross site compatible
* Control the size of thumbnails and page images
* CSS skin-able and customisable


How to Use
----------

window.addEvent('domready', function(){
	new InlinePDF({ el: document.id('viewer') }).show('{PDF_URL}');
});