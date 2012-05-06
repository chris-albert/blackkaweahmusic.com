<?php 
require_once('../application/objects/User.class.php');
require_once('../application/model/UsersModel.class.php');
class UsersController extends BaseController{

    public function __construct(&$registry) {
        parent::__construct($registry);
        $this->Model = new UsersModel($registry);
    }
	
    public function view() {
        $this->index();
    }
	
    public function index() {
        $this->loadSRC($this->_registry->request,array(
            'css/users.css'
        ),'css');
        $this->Template->user_links = $this->user_link = $this->Model->getAllUsers();
        $this->Template->link = '/users/user/id/';
        $this->Template->render('users');
    }

    public function login() {
        $user = $this->Model->checkUserLogin($_POST['username'],$_POST['password']);
        if(is_array($user)) {
            $this->User->loginUser($user[0]);
            $this->_registry->json = array('login' => 'success');
            $this->_registry->template = array('signout' => 'signout');
        }else {
            $this->_registry->json = array('login' => 'failure');
        }
        $this->redirect($_POST['referer']);
    }

    public function logout() {
        $this->User->logoutUser();
        $this->_registry->template = array('signin' => 'signin');
        $this->redirect($_POST['referer']);
    }
}
