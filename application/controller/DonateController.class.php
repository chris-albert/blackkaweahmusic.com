<?php

class DonateController extends BaseController{

    public function index() {
        $this->Template->render('donate');
    }

}