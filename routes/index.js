const express = require('express')
const router = express.Router()


router.get('/', function(req, res, next) {
    console.log('мы тут')
    res.render('index');
});
router.get('/dino', function(req, res, next) {
    console.log('это дино')
    res.render('dino');
});
router.get('/main', function(req, res, next) {
    console.log('это главная')
    res.render('main');
});
router.get('/super', function(req, res, next) {
    console.log('это super')
    res.render('super');
});
module.exports = router