const express = require('express');
const cors = require('cors');
// const contactRoutes = require('./routes/contactRoutes');
// const errorHandler = require('./middleware/errorHandler');
const sequelize = require('./database');
// const Contact = require('./models/Contact'); // Import the Contact model
const contactRoutes = require('./routes/contactRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// app.use('/api/contacts', contactRoutes);

// Global error handler
(async () => {
    try {
        // Sync all models with the database
        await sequelize.sync({ alter: true }); // Use `alter: true` to update the table structure without deleting data
        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Error syncing database:', error.message);
    }
})();
app.use('/api/contacts', contactRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
