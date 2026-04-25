const mongoose = require('mongoose');
const Account = require('./models/Account');
require('dotenv').config();

async function checkOrders() {
    await mongoose.connect(process.env.MONGODB_URI);
    const accounts = await Account.find({}, 'gameName sku settings assignedOrders');
    
    let allOrders = [];
    accounts.forEach(acc => {
        acc.assignedOrders.forEach(order => {
            allOrders.push({
                ...order.toObject(),
                gameName: acc.gameName,
                sku: acc.sku,
                accountId: acc._id,
                settings: acc.settings
            });
        });
    });
    
    console.log("SAMPLE ORDER SETTINGS:", allOrders[0]?.settings);
    console.log("SAMPLE ORDER WARNING LIMIT:", allOrders[0]?.settings?.warningViewCount);
    
    process.exit();
}

checkOrders();
