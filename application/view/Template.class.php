<?php
class Template {
	
    private $_registry;
    private $controller;
    public $json = array();
    protected $_vars = array();
    public $css = array();
    public $javascript = array();
    public $debug = FALSE;

    public function __construct(&$registry,$controller) {
        $this->_registry = $registry;
        $this->controller = $controller;
//        $this->css = array();
//        $this->javascript = array();
    }
	
    public function __set($index,$value) {
        $this->_vars[$index] = $value;
    }
	
    public function __get($index) {
        return $this->_vars[$index];
    }
	
    /**
     * This will include the template path and display it
     * What ever you pass to render will get _template.php appended to it
     * @param Mixed $name    : String or array of templates to include
     * @param String $header : Title of the page appended to Creasetoph $header
     * @return unknown_type
     */
    public function render($name, $header = '') {
        if(empty($header)) {
            $title = $this->_registry->ini['site']['header_prefix'] . ucfirst($name);
            $page = $name;
        }else {
            $title = $this->_registry->ini['site']['header_prefix'] . ucfirst($header);
            $page = $header;
        }
        if(array_key_exists('ajax',$this->_registry->request)) {
            if($this->_registry->request['ajax'] === 'html') {
                //include ajax
                $this->renderJson($name,$title);
            }else if($this->_registry->request['ajax'] === 'json'){
                
            }else if($this->_registry->request['ajax'] === 'plain') {
                $out = $this->renderTemplate('../application/view/templates/' . $name .'_template.php',true);
                echo $out;
                return;
            }
        }
        $this->content = '../application/view/templates/' . $name .'_template.php';
        //incldue main
        $this->renderTemplate("../application/view/templates/main_template.php");
    }

    public function renderJson($template,$title) {
        if(!is_array($template)) {
            $template = array('content' => $template);
        }
        $json = array(
            'type'  => 'html',
            'title' => $title
        );
        if(is_array($this->_registry->json)) {
            $json = array_merge($json,$this->_registry->json);
        }
        if(is_array($this->_registry->template)) {
            $template = array_merge($template,$this->_registry->template);
        }
        foreach($template as $k => $v) {
            $this->content = "../application/view/templates/" . $v ."_template.php";
            $json['insert_ui'][$k] = $this->renderTemplate("../application/view/templates/ajax_template.php",true);
        }
        $json = json_encode($json);
        print_r($json);
        die();
    }

    public function renderTemplate($template,$echo_contents = false) {
        
        foreach ($this->getTemplateVars() as $key => $value) {
            $$key = $value;
        }
        // Start output
        ob_start();
        header('Content-Type: text/html; charset=utf-8');
        if(file_exists($template)) {
           include($template);
        }

        if($echo_contents) {
            return ob_get_clean();
        }else {
            ob_end_flush();
        }
        exit;
        //End output
    }

    public function getTemplateVars() {
        return array_merge(
            $this->_vars,
            array(
                'css'        => $this->css,
                'javascript' => $this->javascript
            )
        );
    }

    public function printArgs() {
        echo "Template vars:";
        Util::echoArgs(array_merge($this->css,$this->javascript,$this->_vars));
    }
}
