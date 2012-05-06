<?php

class MusicController extends BaseController{

    private $music_root = 'music/';

    public function index() {
        $this->Template->render('music');
    }

    public function stream() {
        $path = urldecode($this->music_root . $this->_registry->params[0] . '/' . $this->_registry->params[1] . '/' . $this->_registry->params[2]);
        if(file_exists($path)) {
	        $song = file_get_contents($path);
	        header('Last-Modified: ');
	        header('ETag: ');
	        header('Accept-Ranges: bytes');
	        header('Content-Length: '.filesize($path));
	        header('Connection: close');
	        header('Content-Type: audio/mpeg');
	        echo $song;
        }
    }
}