<?php
class FrontController {
	
    protected $_params, $_controller, $_action, $_registry;
    protected $log_file = '../logs/log.txt';
    protected $ini_file = '../config/config.ini';
	
    public function __construct(&$registry) {
        $this->_registry = $registry;
        $this->set_up(array());
    }

    public function set_up($uri) {
    //		get parameters passed after www.creasetoph.com
        if(empty($uri)) {
            $request = trim($_SERVER['REQUEST_URI']);
        }else {
            $request = $uri;
        }
        
        //		turn parameters into array
        $this->_params = explode('/',$request);
        //		take care of the first element being blank
        array_shift($this->_params);
        //		find and set controller and action
        $this->_controller = array_shift($this->_params);
        $this->_action = array_shift($this->_params);
        $this->_registry->controller = $this->getControllerName();
        $this->_registry->action = $this->getAction();
        $this->_registry->params = $this->_params;
        $params = array();
        foreach($this->_params as $key => $value) {
            if(($key % 2) == 0) {
                $params[$value] = $this->_params[$key + 1];
            }
        }
        $this->_registry->request = $params;
        $this->_registry->post = $_POST;
        $this->parseINI();
        session_start();
    }

    public function route() {
        $this->includeBaseClasses();
        //		make sure file exists on server
        if(file_exists($this->getControllerPath())) {
            //		include controller file
            require_once($this->getControllerPath());
            if(class_exists($this->getController())) {
                $controller_name = $this->getController();
                $controller = new $controller_name($this->_registry);
                if(method_exists($controller,$this->getAction())) {
                    $method = $this->getAction();
                    $controller->$method();
                }else {
                    echo "Error: cant find " , $this->getAction() , " method in ", $this->getController(), " class";
                }
            }else {
                echo "Error: Cant find ", $this->getController(), " class.<br />";
            }
        }else {
            echo "Error: Cant find ", $this->getController() , " controller.<br />";
        }
		
    }
	
    private function includeBaseClasses() {
        require_once('../application/controller/BaseController.class.php');
        require_once('../application/Util.class.php');
    }
	 
    private function debug() {
        echo "<br />Front contoller debug info: <br />--------------------------------------------<br />";
        echo "Controller: " , $this->getController(), "<br />";
        echo "Action: " , $this->getAction() , "<br />";
        echo "Parameters: <pre>";
        print_r($this->getParams());
        echo "</pre>";
    }
	
    public function getParams() {
        return $this->_params;
    }
	
    public function getController() {
        if(empty($this->_controller) || $this->_controller === 'home') {
            return "IndexController";
        }else {
            return ucwords($this->_controller) . "Controller";
        }
    }

    public function getControllerName() {
        if(empty($this->_controller)) {
            return 'index';
        }
        return $this->_controller;
    }

    public function getControllerPath() {
        return "../application/controller/". $this->getController() . ".class.php";
    }
	
    public function getAction() {
        if(empty($this->_action)) {
            return "index";
        }else {
            return $this->_action;
        }
    }
	
    private function parseINI() {
        $this->_registry->ini = parse_ini_file($this->ini_file,true);
    }

    public function log($message) {
        $fh = fopen($this->log_file,'a');
        fwrite($fh,$message . "\n");
        fclose($fh);
    }
}




