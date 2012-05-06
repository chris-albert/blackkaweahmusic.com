<?php

class VideoController extends BaseController{

    public function index() {
        $this->Template->render('video');
    }

}