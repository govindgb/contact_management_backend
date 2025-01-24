const Contact = require('../models/Contact');
const xlsx = require('xlsx');

// Upload Contacts
exports.uploadContacts = async (req, res) => {
    try {
        // Check if a file is provided
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // Parse the uploaded Excel file
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Validate data and add to the database
        const errors = [];
        const validContacts = [];

        sheetData.forEach((row, index) => {
            const { Name, Email, Phone } = row;

            // Check for missing fields
            if (!Name || !Email || !Phone) {
                errors.push(`Row ${index + 1}: Missing required fields.`);
                return;
            }

            // Validate email and phone format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^\d+$/;

            if (!emailRegex.test(Email)) {
                errors.push(`Row ${index + 1}: Invalid email format.`);
            } else if (!phoneRegex.test(Phone)) {
                errors.push(`Row ${index + 1}: Invalid phone number.`);
            } else {
                validContacts.push({ name: Name, email: Email, phone: Phone });
            }
        });

        if (errors.length) {
            return res.status(400).json({ message: 'Validation errors', errors });
        }

        // Bulk insert valid contacts
        const createdContacts = await Contact.bulkCreate(validContacts);

        res.status(201).json({
            message: 'Contacts uploaded successfully.',
            contacts: createdContacts,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get Contacts with pagination, search, and filtering
exports.getContacts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const filters = search ? { where: { name: { [Op.like]: `%${search}%` } } } : {};
        const contacts = await Contact.findAndCountAll({
            ...filters,
            offset: (page - 1) * limit,
            limit: parseInt(limit),
        });
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update a contact by ID
exports.updateContact = async (req, res) => {
    try {
        const { id } = req.params; // Get ID from the URL
        const { name, email, phone } = req.body; // Get updated data from the request body

        // Find the contact by ID
        const contact = await Contact.findByPk(id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found.' });
        }

        // Update the contact
        await contact.update({ name, email, phone });
        res.status(200).json({
            message: 'Contact updated successfully.',
            contact,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Delete a contact by ID
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params; // Get ID from the URL

        // Find the contact by ID
        const contact = await Contact.findByPk(id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found.' });
        }

        // Delete the contact
        await contact.destroy();
        res.status(200).json({ message: 'Contact deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all contacts with optional search and pagination
exports.getAllContacts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query; // Pagination and search parameters
        const offset = (page - 1) * limit;

        // Filter contacts by name or email
        const whereClause = {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
            ],
        };

        // Fetch contacts from the database
        const { rows, count } = await Contact.findAndCountAll({
            where: search ? whereClause : {},
            limit: parseInt(limit),
            offset,
        });

        res.status(200).json({
            contacts: rows,
            total: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a contact by ID
exports.getContactById = async (req, res) => {
    try {
        const { id } = req.params; // Get ID from the URL

        // Find the contact by ID
        const contact = await Contact.findByPk(id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found.' });
        }

        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
