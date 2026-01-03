const axios = require('axios');
const User = require('../models/User');
const Wallet = require('../models/wallet');

const RAZORPAYX_API_URL = 'https://api.razorpay.com/v1';
const KEY_ID = process.env.RAZORPAYX_KEY_ID; // Needs to be added to .env
const KEY_SECRET = process.env.RAZORPAYX_KEY_SECRET; // Needs to be added to .env
const ACCOUNT_NUMBER = process.env.RAZORPAYX_ACCOUNT_NUMBER; // Your RazorpayX Account Number

const authHeader = {
    Authorization: 'Basic ' + Buffer.from(KEY_ID + ':' + KEY_SECRET).toString('base64'),
    'Content-Type': 'application/json'
};

// 1. Create a Contact (The Owner)
const createContact = async (user) => {
    try {
        const response = await axios.post(`${RAZORPAYX_API_URL}/contacts`, {
            name: user.bankDetails.accountName || user.userName,
            email: user.email,
            contact: user.phone,
            type: 'vendor',
            reference_id: String(user._id)
        }, { headers: authHeader });

        return response.data.id; // contact_id
    } catch (error) {
        console.error("Create Contact Error:", error.response?.data || error.message);
        throw error;
    }
};

// 2. Create Fund Account (Link Bank Account to Contact)
const createFundAccount = async (contactId, bankDetails) => {
    try {
        const response = await axios.post(`${RAZORPAYX_API_URL}/fund_accounts`, {
            contact_id: contactId,
            account_type: 'bank_account',
            bank_account: {
                name: bankDetails.accountName,
                ifsc: bankDetails.ifsc,
                account_number: bankDetails.accountNumber
            }
        }, { headers: authHeader });

        return response.data.id; // fund_account_id
    } catch (error) {
        console.error("Create Fund Account Error:", error.response?.data || error.message);
        throw error;
    }
};

// 3. Initiate Payout
const initiatePayout = async (fundAccountId, amount, userId) => {
    try {
        const response = await axios.post(`${RAZORPAYX_API_URL}/payouts`, {
            account_number: ACCOUNT_NUMBER,
            fund_account_id: fundAccountId,
            amount: amount * 100, // paise
            currency: "INR",
            mode: "IMPS",
            purpose: "payout",
            queue_if_low_balance: true,
            reference_id: `PAYOUT_${userId}_${Date.now()}`,
            narration: "Bicycle Locker Earnings"
        }, { headers: authHeader });

        return response.data;
    } catch (error) {
        console.error("Initiate Payout Error:", error.response?.data || error.message);
        // Determine if it's a critical error or just low balance
        throw error;
    }
};

// Orchestrate the full Payout Flow for a single User
exports.processUserPayout = async (user, wallet) => {
    // 1. Validation
    if (!user.bankDetails?.accountNumber || !user.bankDetails?.ifsc) {
        console.log(`Skipping payout for ${user.email}: Incomplete bank details.`);
        return { success: false, reason: "Incomplete bank details" };
    }

    if (wallet.balance <= 0) {
        console.log(`Skipping payout for ${user.email}: Zero or negative balance.`);
        return { success: false, reason: "Insufficient balance" };
    }

    const payoutAmount = wallet.balance;

    try {
        console.log(`Processing payout of ₹${payoutAmount} for ${user.email}...`);

        // 2. Setup RazorpayX entities
        // Check if we already have these IDs saved in DB to avoid re-creation (future optimization)
        // For now, Razorpay handles de-duplication gracefully usually, but ideally we store contact_id.

        const contactId = await createContact(user);
        const fundAccountId = await createFundAccount(contactId, user.bankDetails);

        // 3. Transfer Money
        const payoutResult = await initiatePayout(fundAccountId, payoutAmount, user._id);

        // 4. Update Wallet Logic (Deduct Funds)
        // Note: In a real system, we might wait for webhook 'payout.processed', but for auto-monthly,
        // we deduct now and refund if it fails later via webhooks.

        wallet.balance = 0; // Reset balance
        wallet.transactions.unshift({
            type: "Withdrawal", // Automated Payout
            amount: -payoutAmount,
            runningBalance: 0,
            date: new Date(),
            description: `Monthly Payout: ${payoutResult.id}`
        });

        await wallet.save();

        // Return success
        return { success: true, payoutId: payoutResult.id, amount: payoutAmount };

    } catch (error) {
        console.error(`Payout failed for ${user.email}:`, error.message);
        return { success: false, reason: "RazorpayX Error: " + error.message };
    }
};

// Orchestrate a MANUAL Payout (Withdrawal)
exports.processManualPayout = async (user, wallet, amount) => {
    // 1. Validation
    if (!user.bankDetails?.accountNumber || !user.bankDetails?.ifsc) {
        throw new Error("Incomplete bank details. Please update them in your dashboard.");
    }

    if (wallet.balance < amount) {
        throw new Error("Insufficient wallet balance.");
    }

    try {
        console.log(`Processing manual payout of ₹${amount} for ${user.email}...`);

        const contactId = await createContact(user);
        const fundAccountId = await createFundAccount(contactId, user.bankDetails);

        // 3. Transfer Money
        const payoutResult = await initiatePayout(fundAccountId, amount, user._id);

        // 4. Update Wallet Logic (Deduct Funds)
        wallet.balance -= amount;
        wallet.transactions.unshift({
            type: "Withdrawal",
            amount: -amount,
            runningBalance: wallet.balance,
            date: new Date(),
            description: `Manual Payout: ${payoutResult.id}`
        });

        await wallet.save();

        return { success: true, payoutId: payoutResult.id, amount };

    } catch (error) {
        console.error(`Manual Payout failed for ${user.email}:`, error.message);
        throw new Error("Payout Failed: " + error.message);
    }
};
