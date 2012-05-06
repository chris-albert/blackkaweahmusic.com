<?php
if(!empty($css)) {
    foreach($css as $value) {
        echo '<link rel="stylesheet" type="text/css" href="'.$value.'" />';
    }
}
if(file_exists($content)) {
    include($content);
}else {
    echo "Error: Could not find " . $name . " template.";
}
if(!empty($javascript)) {
    foreach($javascript as $value) {
        echo '<script type="text/javascript" src="'.$value .'" ></script>';
    }
}
    ?>
