const express = require('express');
const borrowController = require('../controllers/borrows');

const router = express.Router();

router.get('/', borrowController.getBorrowperSchool);
router.get('/query3.1.3', borrowController.getBorrowYoung);
router.get('/query3.1.5', borrowController.getsameBorrow);
router.get('/view', borrowController.getBorrows);
router.get('/return/:borrow_id', borrowController.postReturn);

module.exports = router;