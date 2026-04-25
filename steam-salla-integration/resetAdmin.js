require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const resetSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const superAdmin = await Admin.findOne({ role: 'superadmin' });
        
        if (!superAdmin) {
            console.log('No Super Admin found in the database.');
            process.exit(1);
        }

        // Set the new emergency password
        superAdmin.password = 'admin';
        await superAdmin.save();

        console.log(`✅ Password reset successfully for Super Admin: ${superAdmin.username}`);
        console.log(`New Password is: admin`);
        console.log(`Please ask the client to log in and change this immediately from their Profile page.`);
        
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetSuperAdmin();