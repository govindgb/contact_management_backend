const Contact = require('../models/Contact');
const xlsx = require('xlsx');
const { Op } = require('sequelize');

// Upload Contacts
exports.uploadContacts = async (req, res) => {
  try {
    let contactsToSave = [];
      
    // **1. Check if an Excel file is uploaded**
    if (req.file) {
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      sheetData.forEach((row, index) => {
        const { Name, Email, Phone } = row;

        // Validation
        if (!Name || !Email || !Phone) {
          return res.status(400).json({ message: `Row ${index + 1} has missing fields.` });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d+$/;

        if (!emailRegex.test(Email) || !phoneRegex.test(Phone)) {
          return res.status(400).json({ message: `Row ${index + 1} has invalid data.` });
        }

        contactsToSave.push({ name: Name, email: Email, phone: Phone });
      });
    } 
    
    // **2. Check if JSON data is sent in the request body**
    else if (req.body && Object.keys(req.body).length > 0) {
      if (Array.isArray(req.body)) {
        // **Multiple contacts (Array)**
        req.body.forEach((contact, index) => {
          const { name, email, phone } = contact;
          if (!name || !email || !phone) {
            return res.status(400).json({ message: `Item ${index + 1} has missing fields.` });
          }
          contactsToSave.push({ name, email, phone });
        });
      } else {
        // **Single contact (Object)**
        const { name, email, phone } = req.body;
        if (!name || !email || !phone) {
          return res.status(400).json({ message: "Missing required fields." });
        }
        contactsToSave.push({ name, email, phone });
      }
    } 
    
    else {
      return res.status(400).json({ message: "Invalid request. No data found." });
    }

    // **3. Save contacts to the database**
    const savedContacts = await Contact.bulkCreate(contactsToSave);

    return res.status(201).json({
      message: "Contacts uploaded successfully.",
      contacts: savedContacts,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get Contacts with pagination, search, and filtering
exports.getContacts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;

        // Apply search filter if 'search' query parameter is provided
        const filters = search
            ? { where: { name: { [Op.like]: `%${search}%` } } }
            : {};

        // Fetch contacts with pagination and optional filtering
        const contacts = await Contact.findAndCountAll({
            ...filters,
            offset: (page - 1) * limit,
            limit: parseInt(limit),
        });

        // Return paginated contacts
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
