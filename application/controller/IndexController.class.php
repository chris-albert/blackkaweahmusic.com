<?php 

class IndexController extends BaseController{

    private $UsersModel = null;
	public function __construct(&$registry) {
		parent::__construct($registry);
        $this->UsersModel = new UsersModel($registry);
	}
	
	public function view() {
		$this->index();
	}

    public function site() {
        //Site wide source, this is loaded on every page
        $this->loadSRC($this->_registry->request, array(
            'js/jquery.js',
            'js/jquery.jplayer.min.js'
        ),'js',true,true);
    }
	
    public function index() {
        $this->Template->render('home');
	}

    public function phpinfo() {
	echo phpinfo();
    }
    
}
