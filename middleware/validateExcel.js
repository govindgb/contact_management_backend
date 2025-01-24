const multer = require('multer');

const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage });

module.exports = upload.single('file'); // Expect a single file with the key "file"
