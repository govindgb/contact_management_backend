const { Sequelize } = require('sequelize');

// Create Sequelize instance using XAMPP MySQL credentials
const sequelize = new Sequelize('contact_db', 'root', '', {
    host: 'localhost', // XAMPP MySQL runs on localhost
    port: 3306,        // Default MySQL port for XAMPP
    dialect: 'mysql',  // We're using MySQL
});

// Test the database connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to the XAMPP MySQL database successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
    }
})();

module.exports = sequelize;
