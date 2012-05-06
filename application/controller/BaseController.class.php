<?php 
require_once('../application/objects/User.class.php');
require_once('../application/model/BaseModel.class.php');
require_once('../application/objects/Pagination.class.php');
abstract class BaseController extends Registry{
	
    protected $_registry;
    protected $User;
    protected $Template;
    protected $Model;
    protected $root_url;
    protected $Pageination;
    protected $page = 1;
    protected $request = array();
    protected $log_file = '../logs/log.txt';
	
    public function __construct(&$registry) {
		
        $this->_registry = $registry;
        $this->root_url = 'http://' . $_SERVER['SERVER_NAME'];
        $this->_registry->root_url = $this->root_url;
        $this->_registry->path = $this->getPath();
        $this->User = User::getInstance($this->_registry);
        $this->Template = new Template($this->_registry,$this);
        $this->Model = new BaseModel($this->_registry);
        $this->Template->User = $this->User->getUserInfo();
        
        $this->request = $this->_registry->request;
        
        $this->Pagination = new Pagination($this->_registry,$this->Template->User['post_per_page'],$this->request['page']);
    }

    public function redirect($url) {
//        header('Location: ' . $this->root_url . $url);
//        exit;
//        require_once('../application/controller/FrontController.class.php');
        global $_FRONT_CONTROLLER;
//        $this->log($url);
        $_FRONT_CONTROLLER->set_up($url);
        $_FRONT_CONTROLLER->route();
    }

    public function log($message) {
        $str = $message;
        if(is_array($message)) {
            $str = print_r($message,true);
        }
        $fh = fopen($this->log_file,'a');
        fwrite($fh,'['. date(DATE_ATOM) . "]\n" . $str . "\n\n");
        fclose($fh);
    }
	
    public function loadSRC($params,$files, $file_type,$cache = TRUE,$base = FALSE) {
        if(is_array($params) && $params['content'] == $file_type) {
	        ob_start();
			//make sure $files is an array
			if(is_array($files)) {
			//loop through files and add to $content 
				foreach($files as $file) {
					if(file_exists($file)) {
						$content .= file_get_contents($file);
					}else {
						echo 'File ' , $file , ' not found.';
					}
				}
                if($file_type == 'js') {
                    $header_content = 'Content-type:text/javascript';
                }else if($file_type == 'css') {
                    $header_content = 'Content-type:text/css';
                }
				if($cache) {
					$md5 = md5($content);
					$cache_length = 28800;
					 if((
					 	isset($_SERVER['HTTP_IF_NONE_MATCH'])) 				&& 
					 	(stripslashes($_SERVER['HTTP_IF_NONE_MATCH']) == $md5)
					 ) {
		                header("HTTP/1.1 304 Not Modified", TRUE, 304);
		                header("Cache-Control:max-age=$cache_length");
		                header('Pragma:public');
		                header("ETag:".$md5);
		                header($header_content);
		                ob_end_flush();
		                exit;
		            }
		            header("Cache-Control:max-age=$cache_length");
		            header('Expires: Fri, 1 Jan 2500 01:01:01 GMT');
		            header('Pragma:public');
		            header("ETag:".$md5); 
		            header($header_content);
		            
		            echo $content;
		            ob_end_flush();
		            
		            exit;

				}else {
					return $content;
				}
	//			$md5_file= fopen('cache/js_md5.txt' ,'w');
	//			fwrite($md5_file, $md5);
	//			fclose($md5_file);
	//			//store file as temp
	//			$temp_file = fopen($file_name, 'w');
	//			fwrite($temp_file,$content);
	//			fclose($temp_file);
	//			return $tag;
			}
        }

        if($file_type == 'js' && !$base) {
            $this->Template->javascript[] = $this->root_url . '/'.$this->getController() .'/' . $this->getAction() . '/content/js';
        }else if($file_type == 'css' && !$base) {
            $this->Template->css[] = $this->root_url . '/'.$this->getController().'/' . $this->getAction() . '/content/css' ;
        }
	}
	/*
	 * Use this if you want to print the contents of a javscript or css file in the page
	 */
	public function printSRC($files,$file_type) {
            if($file_type == 'js') {
                $start_tag = '<script type=\'text/javascript\'>';
                $end_tag = '</script>';
            }else if($file_type == 'css') {
                $start_tag = '<style type\'text/css\'>';
                $end_tag = '</style>';
            }
            if(is_array($files)) {
                echo $start_tag;
                foreach($files as $file) {
                    if(file_exists($file)) {
                        readfile($file);
                    }
                }
                echo $end_tag;
            }
	}
	
	
	
    /*
     * All controllers must implement an index method
     */
    abstract function index();

    public function echoArgs($args) {
        echo '<pre>';
        print_r($args);
        echo '</pre>';
    }

    public function getController() {
        if($this->_registry->controller == '') {
            return 'index';
        }
        return $this->_registry->controller;
    }

    public function getAction() {
        if($this->_registry->action == '') {
            return 'index';
        }
        return $this->_registry->action;
    }

    public function getPath() {
        return
        implode('/',
            array(
                $this->root_url,
                $this->getController(),
                $this->getAction(),
                implode('/',$this->_registry->params)
            )
        );
    }

    public function getDirStructure($path ,$filter = '') {
        $info = array();
        if(is_dir($path)) {
            if($dh = opendir($path)) {
                while(($file = readdir($dh)) !== false) {
                    if($file != '.' && $file != '..') {
                        $type = filetype($path.$file);
                        if($type === 'dir') {
                            $info[$file] = $this->getDirStructure($path.$file.'/',$filter);
                        }else {
                            if(!empty($filter) && preg_match($filter,$file)) {
                                $info[] = $file;
                            }else if(empty($filter)) {
                                $info[] = $file;
                            }
                        }
                    }
                }
            }
        }else {
            echo "Cant find $path<br />";
        }
        if(!empty($info)) {
            if($type === 'dir') {
                ksort($info);
            }else {
                sort($info);
            }
            return $info;
        }
        return FALSE;
    }
}

