const express = require('express');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json();

const noteController = require('../controllers/noteController');

const router = express.Router();

router.get('/', noteController.note_get);
router.post('/', noteController.note_create_post);
router.get('/create', noteController.note_create_get);
router.post('/search', noteController.note_search);
router.get('/:filename', noteController.note_details);
router.delete('/:filename', noteController.note_delete);
router.post('/:filename', noteController.note_update);


module.exports = router;