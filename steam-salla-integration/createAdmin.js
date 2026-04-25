require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Change these to whatever you want your client to use
        const adminUsername = 'admin';
        const adminPassword = 'admin123';

        const adminExists = await Admin.findOne({ username: adminUsername });
        if (adminExists) {
            console.log('Admin already exists!');
            process.exit(0);
        }

        const admin = new Admin({
            username: adminUsername,
            password: adminPassword,
            role: 'superadmin'
        });

        await admin.save();
        console.log(`✅ Admin created successfully!\nUsername: ${adminUsername}\nPassword: ${adminPassword}`);
        
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createSuperAdmin();