const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },

    role: {
        type: String,
        enum: ['user', 'owner', 'admin'],
        default: 'user'
    },

    walletBalance: {
        type: Number,
        default: 0
    },

    // -----------------------------
    // ACTIVE RENTALS
    // -----------------------------
    // activeRentals: [{
    //     cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cycle' },
    //     rentedAt: { type: Date, default: Date.now },
    //     startLocation: {
    //         type: {
    //             type: String,
    //             enum: ['Point'],
    //             default: 'Point'
    //         },
    //         coordinates: {
    //             type: [Number], // [lng, lat]
    //         }
    //     },
    //     required: false
    // }],

    // // -----------------------------
    // // PAST RENTALS HISTORY
    // // -----------------------------
    // pastRentals: [{
    //     cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cycle' },
    //     rentedAt: { type: Date },
    //     returnedAt: { type: Date },
    //     durationMinutes: { type: Number },

    //     startLocation: {
    //         type: {
    //             type: String,
    //             enum: ['Point'],
    //             default: 'Point'
    //         },
    //         coordinates: {
    //             type: [Number], // [lng, lat]
    //         }
    //     },

    //     endLocation: {
    //         type: {
    //             type: String,
    //             enum: ['Point'],
    //             default: 'Point'
    //         },
    //         coordinates: {
    //             type: [Number] // [lng, lat]
    //         }
    //     },

    //     cost: { type: Number }, // final ride amount
    //     required: false
    // }],

    // -----------------------------
    // USER CURRENT LOCATION
    // -----------------------------
    // lastKnownLocation: {
    //     type: {
    //         type: String,
    //         enum: ['Point'],
    //         default: 'Point'
    //     },
    //     coordinates: {
    //         type: [Number] // [lng, lat]
    //     }
    // },


    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Geospatial index for querying nearby users
// UserSchema.index({ lastKnownLocation: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
