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

$InlinePDF = new Class(

	// private variables
	private $pdf = '';
	private $cachedir = './cache/';
	private $cachedays = 30;
	
	// constructor
	public function __construct(){
		
		// delete from cache where last accessed is over $cachedays
		if ($dirlist = opendir($cachedir)){
			while (($file = readdir($dirlist)) !== false) {
				if (is_dir($file)){
					if (fileatime($cachedir.'/'.$file) <= (60*60*24*$cachedays)){
						$this->recursiveDelete($cachedir.'/'.$file);
					}
				}
			}
		}
		
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
	public function run($pdf, $opts = object()){
	
		// get options
		$opts = json_decode($opts);
		
		// default options
		if ($opts == object()){
			$opts->nocache = false;
		}
	
		// create a cache id
		$cachemod = md5($pdf);
		
		// does it exist in the cache, if so return it
		if (!$opts->nocache && is_dir($cachedir.'/'.$cachemod.'/json.txt')){
			return file_get_contents($cachedir.'/'.$cachemod.'/json.txt');
		}
		
		try {
		
			// create our cache directory
			mkdir($cachedir.'/'.$cachemod, '0777', true);
			
			// json to return
			$json = array(
				'error' => false,
				'pagecount' => 0,
				'pdfurl' => $pdf,
				'thumbs' => array(),
				'pages' => array()
			);
			
			// use imagemagick to find out number of pages in pdf
			
			// use imagemagick to create a jpeg and thumb of each page, and add them to the corresponding arrays
			
			// put json into file
			file_put_contents($cachedir.'/'.$cachemod.'/json.txt', json_encode($json));
			
			// return values
			return $json;
			
		} catch (Exception $e){
			return array(
				'error' => true,
				'errormsg' => $e
			);
		}
	
	}

);

var $pdf = new InlinePDF();
echo json_encode($pdf->run($_POST['pdf'], $_POST['options']));

?>