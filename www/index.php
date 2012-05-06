<?php 
/**
 * This is the entry point for the site, all request come here first then get sent to the front controller 
 * to be router.
 * @author creasetoph
 */
require_once('../application/controller/FrontController.class.php');
require_once('../application/view/Template.class.php');
require_once('../application/Registry.class.php');
global $_FRONT_CONTROLLER;
$REGISTRY = new Registry();
$_FRONT_CONTROLLER = new FrontController($REGISTRY);
$_FRONT_CONTROLLER->route();