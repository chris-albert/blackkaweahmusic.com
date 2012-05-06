<?php
/**
 * Description of Utilclass
 *
 * @author creasetoph
 */
class Util {
    //put your code here
    public static function array_to_object(array $arr = array(), $obj = null) {
        if(!empty($arr) && !is_null($obj)) {
            $vars = get_object_vars($obj);
        }
    }

    public static function echoArgs($args) {
        echo '<pre>';
        print_r($args);
        echo '</pre>';
    }

    public static function getTimeDifferenceFormat($time) {
		$diff = Util::getTimeDifference($time);
		$sec = floor($diff);
		$min = floor($diff / 60);
		$hour = floor($min / 60);
		$day = floor($hour / 24);
		if ($day == 0) {
			if ($hour == 0){
				if ($min == 0) {
					$s = $sec;
					$t = "sec";
				}else {
					$s = $min;
					$t = "min";
				}
			}else {
				$s = $hour;
				$t = "hour";
			}
		}else{
			$s = $day;
			$t = "day";
		}
		if($s > 1) {
			$s = $s . " " . $t . "s";
		}else {
			$s = $s . " " . $t;
		}
		return $s . " ago";
	}
	public static function getTimeDifference($date) {
		//		get now time
		$now = time();
		//		convert $date to unix time stamp
		$date = strtotime($date);
		//		calculate difference
		return $now - $date;
	}

    public static function toHTML($string, $escape = FALSE) {
        $string = nl2br($string);
        if($escape) {
            $string = addslashes($string);
        }
        return $string;
    }

    public static function toTitle($string) {
        return htmlentities($string,ENT_QUOTES);
    }
}
?>
