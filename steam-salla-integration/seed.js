// Load environment variables first
require('dotenv').config();

const mongoose = require('mongoose');
const Account = require('./models/Account');
const { encryptData } = require('./utils/encryption');

// Connect to the database directly in this script
const seedDatabase = async () => {
    try {
        console.log('⏳ Connecting to Database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🟢 Connected Successfully!');

        // --- Clean up old test data to avoid duplicates ---
        await Account.deleteMany({ sku: { $in: ['TEST-GAME-01', 'TEST-STRICT-02'] } });
        console.log('🧹 Cleared old test accounts...');

        // ==========================================
        // 1. The "Unlimited" Account (Standard Flow)
        // ==========================================
        const unlimitedAccount = new Account({
            gameName: "Grand Theft Auto V (Unlimited)",
            sku: 'TEST-GAME-01',
            username: encryptData("Gamer_Unlimited"),
            password: encryptData("SuperSecurePass99!"),
            // Dummy secret must be valid base64 for SteamTotp to not crash
            sharedSecret: encryptData("OJ/l6RlYwR9M0zx0gqeDaHu20lM="), 
            maxSales: 5,
            currentSales: 0,
            isActive: true,
            
            // These are the defaults (Unlimited views/time, 3 SG codes, warning on 5th view)
            settings: {
                maxSteamGuardRequests: 3,
                maxAccountViews: null,
                accessDurationMinutes: null,
                warningViewCount: 5 
            }
        });

        // ==========================================
        // 2. The "Strict" Account (Tests all your new limits)
        // ==========================================
        const strictAccount = new Account({
            gameName: "Cyberpunk 2077 (Strict Limits)",
            sku: 'TEST-STRICT-02',
            username: encryptData("Gamer_Strict"),
            password: encryptData("StrictPass2024!"),
            sharedSecret: encryptData("OJ/l6RlYwR9M0zx0gqeDaHu20lM="),
            maxSales: 2,
            currentSales: 0,
            isActive: true,

            // 🔥 TESTING THE GOD MODE LIMITS 🔥
            settings: {
                maxSteamGuardRequests: 2,    // Stop giving codes after 2 clicks
                warningViewCount: 3          // Show the Yellow Warning Box on the 3rd view!
            }
        });

        // Save both to MongoDB
        await unlimitedAccount.save();
        await strictAccount.save();

        console.log(`\n✅ [SUCCESS] Dummy accounts created and encrypted!`);
        console.log(`🎮 SKU 1 (Unlimited): TEST-GAME-01`);
        console.log(`🎮 SKU 2 (Strict): TEST-STRICT-02\n`);

        // Close the database connection and exit the script
        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('🔴 [ERROR] Failed to seed database:', error);
        process.exit(1);
    }
};

// Run the function
seedDatabase();