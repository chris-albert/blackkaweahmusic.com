<?php

class AboutController extends BaseController{

    public function index() {
        $this->Template->render('about');
    }

}