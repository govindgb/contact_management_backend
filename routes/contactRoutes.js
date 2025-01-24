const express = require('express');
const {
    uploadContacts,
    updateContact,
    deleteContact,
    getAllContacts,
    getContactById,
} = require('../controllers/contactController');
const validateExcel = require('../middleware/validateExcel');

const router = express.Router();

router.post('/upload', validateExcel, uploadContacts);
router.put('/:id', updateContact); // Update a contact
router.delete('/:id', deleteContact); // Delete a contact
router.get('/', getAllContacts); // Get all contacts
router.get('/:id', getContactById); // Get a contact by ID

module.exports = router;
