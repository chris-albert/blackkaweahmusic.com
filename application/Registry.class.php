<?php 
/**
 * @author creasetoph
 * This class holds global variables without them being vulnerable
 *
 */
class Registry {
	//passed registry way
	private $_vars = array();
	//inherited registry way
	protected $_registry = array();
	
	public function __set($index,$value) {
		$this->_vars[$index] = $value;
	}
	
	public function __get($index) {
		return $this->_vars[$index];
	}
	
	public function echoContents() {
		echo "<pre>";
		print_r($this->_vars);
		echo "</pre>";
	}
}