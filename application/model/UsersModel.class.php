<?php
/**
 * Description of UsersModelclass
 *
 * @author creasetoph
 */
require_once('../application/model/BaseModel.class.php');
class UsersModel extends BaseModel {

    public function __contstruct(&$regsitry) {
        parent::__construct($registry);
    }

    public function checkUserLogin($username,$password) {
        $data = $this->select(
            array('username','id as user_id','rank','post_per_page'),
            'user_info',
            array(
                'username' => $username,
                'password' => md5($password)
            ),
            'LIMIT 1'
        );
        return $data;
    }

    public function getAllUsers() {
        $sql = '
            SELECT u.id as user_id,u.username,i.small_path, i.tag
            FROM user_info u
            LEFT JOIN images i
            ON i.id = u.image_id
        ';
        return $this->executeSQL($sql);
    }

    public function getUserInfo($id) {
        $sql = '
            SELECT u.id as user_id, u.username,u.email,u.description,u.rank,u.signature,u.last_login,u.logins,u.posts,u.start_date,i.small_path,i.large_path,i.tag
            FROM user_info u
            LEFT JOIN images i
            ON i.id = u.image_id
            WHERE u.id = '.$id.'
            LIMIT 1
        ';
        return current($this->executeSQL($sql));
    }

    public function getAllBlogs($start,$size) {
        $sql = '
            SELECT b.*,u.username
            FROM blog b
            JOIN user_info u
            WHERE b.user_id = u.id
            ORDER BY b.post_date DESC
         ';
        $sql = $this->buildPaginationSQL($sql, $start, $size);
        return $this->executeSQL($sql);
    }

    public function getBlogs($user_id,$start,$size) {
        $sql = '
            SELECT b.*,u.username
            FROM blog b
            JOIN user_info u
            ON b.user_id = u.id
            WHERE b.user_id = '.$user_id.'
            ORDER BY b.post_date DESC
         ';
        $sql = $this->buildPaginationSQL($sql, $start, $size);
        return $this->executeSQL($sql);
    }
}
?>
