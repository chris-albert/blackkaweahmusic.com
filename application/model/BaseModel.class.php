<?php 

require_once('../application/objects/MySql.class.php');
class BaseModel {
	
    protected $_registry;
    protected $_conn = null;

    public function __construct(&$registry) {
        $this->_registry = $registry;
        //$this->_conn = MySql::get($this->_registry);
    }

    public function select($columns,$table_name,Array $where = array(),$extras = '') {
        $sql = $this->buildSelectSQL($columns,$table_name,$where,$extras);
        $return = $this->executeSQL($sql);
        return $return;
    }

    public function insert($table_name,Array $values, Array $where = array()) {
        $sql = $this->buildInsertSQL($table_name,$values,$where);
        $return = $this->executeSQL($sql);
        return $return;
    }

    public function update($table_name,Array $values, Array $where = array()) {
        $sql = $this->buildUpdateSQL($table_name,$values,$where);
        $return = $this->executeSQL($sql);
        return $return;
    }

    public function delete($table_name, Array $where = array()) {
        $sql = $this->buildDeleteSQL($table_name, $where);
        $return = $this->executeSQL($sql);
        return $return;
    }

    public function buildSelectSQL($columns,$table_name,Array $where = array(),$extras = '') {
        //If we dont get a column or table name there isnt musch we can do
        if(isset($columns) && isset($table_name)) {
            $sql = 'SELECT ';
            //Build column select
            if(is_array($columns)) {
                $sql .= implode(',',$columns);
            }else {
                $sql .= $columns;
            }
            //Build FROM
            $sql .= ' FROM ' . $table_name;
            //Build WHERE
            if(!empty($where)) {
                $sql .= $this->buildWhere($where);
            }
            $sql .= ' '.$extras;
            return $sql;
        }
        //If you didnt provide enough info
        return FALSE;
    }

    public function buildInsertSQL($table_name,Array $values, Array $where = array()) {
        if(isset($table_name) && is_array($values)) {
            $sql = 'INSERT INTO ' . $table_name . '(';
            $keys = array_keys($values);
            $sql .= implode(',',$keys);
            $sql .= ') VALUES (';
            $values = array_values($values);
            foreach($values as $value) {
                $vals[] = '\'' . $this->sanitize($value) . '\'';
            }
            $sql .= implode(',',$vals) . ')';
            if(!empty($where)) {
                $sql .= $this->buildWhere($where);
            }
        }
        return $sql;
    }

    public function buildUpdateSQL($table_name,Array $values, Array $where = array()) {
        if(isset($table_name) && is_array($values)) {
            $sql = 'UPDATE ' . $table_name . ' SET ';
            $end_key = end(array_keys($values));
            foreach($values as $key => $value) {
                $sql .= $key . ' = \'' . $this->sanitize($value) . '\'';
                if($key != $end_key) {
                    $sql .= ',';
                }
            }
            if(!empty($where)) {
                $sql .= $this->buildWhere($where);
            }
            return $sql;
        }
    }

    public function buildDeleteSQL($table_name, Array $where) {
        if(isset($table_name)) {
            $sql = 'DELETE FROM ' . $table_name;
            if(!empty($where)){
                $sql .= $this->buildWhere($where);
            }
        }
    }

    public function buildPaginationSQL($sql,$start,$size) {
        $page_sql = array(
            'SELECT * FROM ('.$sql.') a LIMIT ' . ($start - 1) . ',' . $size,
            'SELECT count(*) AS count FROM ('.$sql.') b'
        );
        return $page_sql;
    }

    public function executePaginationSQL($sql,$start,$size) {
        return $this->executeSQL($this->buildPaginationSQL($sql, $start, $size));
    }

    public function executeSQL($sql) {
        if(is_array($sql)) {
            $ret = $this->_conn->multiQuery($sql);
        }else {

            $ret = $this->_conn->query(trim($sql));
        }

        return $ret;
    }

    private function buildWhere($where) {
        if(!empty($where)) {
            $sql .= ' WHERE ';
            $end_key = end(array_keys($where));
            foreach($where as $key => $value) {
                $sql .= $key.  ' = \'' . $this->sanitize($value).'\'';
                if($key != $end_key) {
                    $sql .= ' AND ';
                }
            }
        }
        return $sql;
    }

    public function sanitize($value) {
        $value = addslashes($value);
        $search = array(
            '@<script[^>]*?>.*?</script>@si',   // Strip out javascript
            '@<[\/\!]*?[^<>]*?>@si',            // Strip out HTML tags
            '@<style[^>]*?>.*?</style>@siU',    // Strip style tags properly
            '@<![\s\S]*?--[ \t\n\r]*>@'         // Strip multi-line comments
        );

        $value = preg_replace($search, '', $value);
        return $value;	
    }

}

?>
