<?

/* 
	
	InlinePDF.php

	PHP class for converting PDFs to JPEG

	Created on 09/05/2010 by Ryan Mitchell

	Requires
	* Imagemagick
	* Ghostscript

	Changes:

	* 09/05/2010 by Ryan Mitchell
	  Initial implementation

*/

ini_set('display_errors', 'off');

class InlinePDF {

	// private variables
	private $pdf = '';
	private $cachedir = './cache';
	private $cachedays = 30;
	private $URL = 'http://pdf.rtnetworks.net/';
	private $CACHEURL = 'http://pdf.rtnetworks.net/cache/';
	
	// constructor
	public function __construct(){
					
		// delete from cache where last accessed is over $cachedays
		if ($dirlist = opendir($this->cachedir)){
			while (($file = readdir($dirlist)) !== false) {
				if (is_dir($this->cachedir.'/'.$file)){
					if (fileatime($this->cachedir.'/'.$file) <= (60*60*24*$this->cachedays)){
						//$this->recursiveDelete($this->cachedir.'/'.$file);
					}
				}
			}
		}
		
		// chaining
		return $this;
		
	}
	
	// recursively delete a folder
	private function recursiveDelete($str){
		if(is_file($str)){
			return @unlink($str);
		}
		elseif(is_dir($str)){
			$scan = glob(rtrim($str,'/').'/*');
			foreach($scan as $index=>$path){
		 	   recursiveDelete($path);
			}
			return @rmdir($str);
		}
	}

	// run function
	public function run($pdf, $opts){

		// catch objects
		if (!isset($opts)) $opts = '';
	
		// get options
		$opts = json_decode($opts);
		
		// set up an object
		if (!$opts) $opts = (object) array();
		
		// default options
		if (!property_exists($opts, 'nocache')) $opts->nocache = false;
		if (!property_exists($opts, 'pagemaxwidth')) $opts->pagemaxwidth = 1000;
		if (!property_exists($opts, 'pagemaxheight')) $opts->pagemaxheight = 1000;
		if (!property_exists($opts, 'thumbmaxwidth')) $opts->thumbmaxwidth = 100;
		if (!property_exists($opts, 'thumbmaxheight')) $opts->thumbmaxheight = 75;
	
		// create a cache id
		$cachemod = md5($pdf);
				
		// does it exist in the cache, if so return it
		if (!$opts->nocache && file_exists($this->cachedir.'/'.$cachemod.'/json.txt')){
			return json_decode(file_get_contents($this->cachedir.'/'.$cachemod.'/json.txt'));
		}
				
		try {
		
			// create our cache directory
			mkdir($this->cachedir.'/'.$cachemod, 0777, true);
			
			// filename
			$filename = $this->cachedir.'/'.$cachemod.'/'.basename($pdf);
			
			// download the file
			$bytes = file_put_contents($filename, file_get_contents($pdf));
						
			// make sure we downloaded something
			if ($bytes === FALSE){
				$json = array(
					'error' => false,
					'errormsg' => 'Could not download the PDF specified'
				);
				return $json;
			}
			
			// json to return
			$json = array(
				'error' => false,
				'pagecount' => 0,
				'pdfurl' => $this->URL.$filename,
				'thumbs' => array(),
				'pages' => array()
			);
					
			// set up imagick instance
			$im = new Imagick();
			
			// force resolution to screen
			$im->setResolution(72,72);
			
			// read image
			$im->readImage($filename);
			
			// get image information
			$imageInfo = $im->identifyImage();
						
			// ensure its a pdf!
			if (!$imageInfo || strpos(strtolower($imageInfo['format']), 'pdf') === FALSE){
				$json = array(
					'error' => false,
					'errormsg' => 'The file specified is not a PDF!'
				);
				return $json;
			}
			
			// get geometry
			$geometry = $imageInfo['geometry'];
			
			// resize ratio
			$ratio = 1;
			$thumbratio = 1;
			
			// landscape or portrait?
			if ($geometry['width'] > $geometry['height']){
				if ($geometry['width'] > $opts->pagemaxwidth){
					$ratio = $opts->pagemaxwidth / $geometry['width'];
				}	
			} else {
				if ($geometry['height'] > $opts->pagemaxheight){
					$ratio = $opts->pagemaxheight / $geometry['height'];
				}
			}
			
			//  thumb ratio
			if ($geometry['width'] > $geometry['height']){
				if ($geometry['width'] > $opts->thumbmaxwidth){
					$thumbratio = $opts->thumbmaxwidth / $geometry['width'];
				}	
			} else {
				if ($geometry['height'] > $opts->thumbmaxheight){
					$thumbratio = $opts->thumbmaxheight / $geometry['height'];
				}
			}
			
			// get the number of pages
			$json['pagecount'] = $im->getNumberImages();
						
			// loop over pagecount
			for ($i=0;$i<$json['pagecount'];$i++){
						
				// convert to jpg 
				$im2 = new Imagick($filename.'['.$i.']');
				//$im2->setImageColorspace(255); 
				$im2->setCompression(Imagick::COMPRESSION_JPEG); 
				$im2->setCompressionQuality(95); 
				$im2->setImageFormat('jpeg'); 
				
				// main image max size
				$im2->resizeImage($geometry['width'] * $ratio, $geometry['height'] * $ratio, imagick::FILTER_UNDEFINED, 1); 
			
				//write image on server 
				$im2->writeImage($this->cachedir.'/'.$cachemod.'/page-'.$i.'.jpg'); 
				
				// thumb resize
				$im2->resizeImage($geometry['width'] * $thumbratio, $geometry['height'] * $thumbratio, imagick::FILTER_UNDEFINED, 1); 
				
				//write image on server 
				$im2->writeImage($this->cachedir.'/'.$cachemod.'/thumb-'.$i.'.jpg'); 
				
				// tidy up
				$im2->clear();
				$im2->destroy();
				
				// add to json
				$json['thumbs'][] = $this->CACHEURL.$cachemod.'/thumb-'.$i.'.jpg';
				$json['pages'][] = $this->CACHEURL.$cachemod.'/page-'.$i.'.jpg';
			
			}
			
			// tidy up
			$im->clear(); 
			$im->destroy(); 			
			
			// put json into file
			file_put_contents($this->cachedir.'/'.$cachemod.'/json.txt', json_encode($json));
			
			// return values
			return $json;
			
		} catch (exception $e){
		
			var_dump($e);
				
	 		return array(
				'error' => true,
				'errormsg' => $e->getMessage()
			);
		}
	
	}

};

header('Content-Type: text/json');

$pdf = new InlinePDF();
echo json_encode($pdf->run($_POST['pdf'], $_POST['options']));

?>