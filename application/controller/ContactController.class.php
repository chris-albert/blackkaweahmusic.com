<?php

class ContactController extends BaseController{

    public function index() {
        $this->Template->render('contact');
    }

}