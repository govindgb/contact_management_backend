const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // Import the Sequelize instance

const Contact = sequelize.define('Contact', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true, // Validates email format
        },
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isNumeric: true, // Ensures phone contains only numbers
        },
    },
}, {
    tableName: 'contacts', // Optional: Explicitly set the table name
    timestamps: true,      // Adds createdAt and updatedAt fields
});

module.exports = Contact;
