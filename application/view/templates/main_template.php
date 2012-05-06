<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN'
   'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
<html xmlns='http://www.w3.org/1999/xhtml' xml:lang='en' lang='en'>
<head>
    <meta http-equiv='content-type' content='text/html; charset=utf-8' />
    <title><?php echo $title;?></title>
    <link rel='SHORTCUT ICON' href='images/icon.ico' />

    <!-- Site wide js and css -->
    <script type="text/javascript" src="<?php echo 'http://' . $_SERVER['SERVER_NAME'] . '/index/site/content/js'; ?>"></script>
    <link rel="stylesheet" type="text/css" href="<?php echo 'http://' . $_SERVER['SERVER_NAME'] . '/content/css/main.css'; ?>" />
    <link rel="stylesheet" type="text/css" href="<?php echo 'http://' . $_SERVER['SERVER_NAME'] . '/content/css/jplayer.blue.monday.css'; ?>" />
    <!-- Page specific js and css -->
    <?php
    if(!empty($css)) {
        foreach($css as $value) {
    ?>
            <link rel="stylesheet" type="text/css" href="<?php echo $value; ?>" />
    <?php }
    }?>
</head>
<body class="creasetoph_content" controller="CreasetophBody">
    <!-- Page Content-->
    <?php
    if($this->debug) {
        Util::echoArgs($this->printArgs());
    }
    ?>
	<div class="header">Black Kaweah</div>
        <div class="navigation_main_container">
            <div class="navigation">
                <span><a href="/video">Video</a></span>
                <span><a href="/music">Music</a></span>
                <span><a href="/about">About</a></span>
                <span><a href="/contact">Contact</a></span>
                <span><a href="/donate">Donate</a></span>
            </div>
        </div>
        <div class="main_content_container">
            <div class="main_content">
             <?php
                    if(file_exists($content)) {
                        include($content);
                    }else {
                        echo "Error: Could not find " . $name . " template.";
                    }
                    ?>
            </div>
        </div>
    </div>

    <div class="hidden_cache_container">
    </div>
     <?php if(!empty($javascript)) {
            foreach($javascript as $value) {
        ?>`
        <script type="text/javascript" src="<?php echo $value; ?>" ></script>
    <?php }}?>
</body>
</html>
