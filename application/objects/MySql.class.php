<?php 
class MySql {
	
    protected static $instance;
    protected $_registry;
    protected $_dbConnection = null;
    private $mysqldate = '';
    private $ip = '';

    public static function get(&$registry) {
        if(!(self::$instance instanceof self)) {
            self::$instance = new MySql($registry);
        }
        return self::$instance;
    }

    private function __construct(&$registry) {
        $this->_registry = $registry;
        $this->mysqldate = date('Y-m-d H:i:s');
        $this->ip = $_SERVER['REMOTE_ADDR'];
        $this->_dbConnection = new mysqli(
            $this->_registry->ini['database_settings']['servername'],
            $this->_registry->ini['database_settings']['username'],
            $this->_registry->ini['database_settings']['password'],
            $this->_registry->ini['database_settings']['database']
        );
        if(mysqli_connect_errno()) {
            $this->mysqlErrorLog($this->_dbConnection->error(),__FUNCTION__);
            return FALSE;
        }
    }

    public function query($sql) {
        $type = substr($sql,0,strpos($sql,' '));
        $return = $this->_dbConnection->query($sql)
                or die($this->mysqlErrorLog(mysqli_error($this->_dbConnection),__FUNCTION__));
        switch(strtolower($type)) {
            case 'select':
                $data = $this->fetch($return);
                break;
            case 'insert':
                $data = mysqli_insert_id($this->_dbConnection);
                break;
            case 'update':
                $data = mysqli_affected_rows($this->_dbConnection);
                break;
            case 'delete':
                $data = mysqli_affected_rows($this->_dbConnection);
                break;
            default:
                echo 'Type error';
        }
        return $data;
    }

    public function multiQuery(Array $sql) {
            //Determine the type of query for each statement
            $types = array();
            foreach($sql as $k => $v) {
                    $v = trim($v);
                    $types[] = substr($v,0,strpos($v,' '));
            }
            $this->_dbConnection->multi_query(implode(';',$sql))
                    or die($this->mysqlErrorLog($this->_dbConnection->error(),__FUNCTION__));
            $data = array();
            do {
                    $ret = $this->_dbConnection->store_result();
                    switch(strtolower(current($types))) {
                            case 'select':
                                    $data[] = $this->fetch($ret);
                                    break;
                            case 'insert':
                                    $data[] = mysqli_insert_id($this->_dbConnection);
                                    break;
                            case 'update':
                                    $data[] = mysqli_affected_rows($this->_dbConnection);
                                    break;
                            case 'delete':
                                    $data[] = mysqli_affected_rows($this->_dbConnection);
                                    break;
                            default:
                                    echo 'error';
                    }
                    next($types);

            }while($this->_dbConnection->next_result());
            return $data;
    }

    public function fetch($result) {
            while($row = $result->fetch_assoc()) {
                    $inner_data[] = $row;
            }
            return $inner_data;
    }

    public function __destruct() {
            $this->_dbConnection->close();
    }

    private function mysqlErrorLog($errorString , $function = "?") {
    // 		opens a file and adds an error string
            $errorString = $this->mysqldate ."    method:". $function ."()    ". $errorString ."    ".$this->ip."\n";
            $file = fopen("../logs/mysqlErrors.txt", "a+");
            fwrite($file, $errorString);
            fclose($file);
    }
}
?>