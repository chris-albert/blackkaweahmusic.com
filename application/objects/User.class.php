<?php 
require_once('../application/model/UsersModel.class.php');
class User {

    private $_registry = null;
    private $username = '';
    private $user_id = '';
    private $rank = '';
    private $secret = '';
    private $post_per_page = 10;
    private $Model = null;
    private $user_vars = array('username','user_id','rank','secret','post_per_page');
    public  $isValid = FALSE;
    private static $instance;

    public static function getInstance(&$registry) {
        if(!(self::$instance instanceof self)) {
            self::$instance = new self($registry);
        }
        return self::$instance;
    }

    private function __construct(&$registry) {
        $this->_registry = $registry;
        $this->Model = new UsersModel($registry);
        if(!empty($_SESSION)) {
            $this->setUserInfoFromSession();
        }
    }

    public function loginUser(array $user) {
        if(!empty($user)) {
            $user['secret'] = md5($user['username'] . $user['user_id'] . $user['rank']);
            foreach($this->user_vars as $value) {
                $this->$value = $user[$value];
                $_SESSION[$value] = $user[$value];
            }
            $this->validate();
        }
    }

    public function logoutUser() {
        $this->unsetUser();
    }

    public function validate() {
        if($this->secret == md5($this->username . $this->user_id . $this->rank)){
            $this->isValid = TRUE;
            return TRUE;
        }else {
            return FALSE;
        }
    }

    public function setUserInfoFromSession() {
        foreach($this->user_vars as $value) {
            $this->$value = trim($_SESSION[$value]);
        }
        if(!$this->validate()) {
            $this->unsetUser();
        }
    }

    public function unsetUser() {
        foreach($this->user_vars as $value) {
            unset($this->$value);
        }
        $this->isValid = false;
//        $_SESSION = array();
        session_destroy();
    }

    public function getUserInfo() {
        foreach($this->user_vars as $value) {
           $arr[$value] = $this->$value;
        }
        return array_merge($arr,array('isValid' => $this->isValid));
    }

    public function getUsername() {
        return $this->username;
    }

    public function getId() {
        return $this->user_id;
    }
}

?>