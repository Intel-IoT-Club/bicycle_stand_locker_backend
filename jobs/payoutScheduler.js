const cron = require('node-cron');
const User = require('../models/User');
const Wallet = require('../models/wallet');
const { processUserPayout } = require('../services/payoutService');

const runMonthlyPayouts = async () => {
    console.log("-----------------------------------------");
    console.log(`[${new Date().toISOString()}] Starting Monthly Payout Job...`);
    console.log("-----------------------------------------");

    try {
        // 1. Find all Owners
        const owners = await User.find({ role: 'owner' });
        console.log(`Found ${owners.length} owners to process.`);

        let successCount = 0;
        let failCount = 0;

        for (const owner of owners) {
            try {
                // 2. Get their wallet
                let wallet = await Wallet.findOne({ userId: owner._id });
                if (!wallet) continue; // Skip if no wallet

                if (wallet.balance > 0) {
                    // 3. Process Payout
                    const result = await processUserPayout(owner, wallet);

                    if (result.success) {
                        successCount++;
                        console.log(`✅ Payout Success: ${owner.userName} - ₹${result.amount}`);
                    } else {
                        failCount++;
                        // Log reason but don't crash loop
                        // console.log(`⏩ Skipped/Failed: ${owner.userName} - ${result.reason}`);
                    }
                }
            } catch (err) {
                console.error(`❌ Error processing owner ${owner._id}:`, err);
                failCount++;
            }
        }

        console.log("-----------------------------------------");
        console.log(`Monthly Payouts Completed.`);
        console.log(`Success: ${successCount} | Skipped/Failed: ${failCount}`);
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("CRITICAL: Automated Payout Job Failed!", error);
    }
};

// Initialize Cron Job
const initPayoutJob = () => {
    // Schedule: At 00:00 on day-of-month 1 (Monthly)
    // "0 0 1 * *"

    // For testing purposes, you can change this to run every minute: "* * * * *"
    cron.schedule('0 0 1 * *', () => {
        runMonthlyPayouts();
    });

    console.log("📅 Monthly Payout Scheduler Initialized (Runs 1st of every month).");
};

module.exports = { initPayoutJob, runMonthlyPayouts };
