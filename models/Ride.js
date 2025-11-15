const mongoose = require("mongoose");
const { Schema } = mongoose;

const PointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  { _id: false }
);

const PaymentSchema = new Schema(
  {
    paid: { type: Boolean, default: false },
    method: { type: String },
    amount: { type: Number, default: 0 },
    txnId: { type: String }
  },
  { _id: false }
);

const RideSchema = new Schema(
  {
    bikeId: { type: Schema.Types.ObjectId, ref: "Cycle", required: true },
    bikeName: { type: String },

    riderId: { type: String, required: true },

    boarding: {
      type: PointSchema,
      required: true
    },
    destination: {
      type: PointSchema,
      required: true
    },

    status: {
      type: String,
      enum: ["started", "finished", "cancelled"],
      default: "started"
    },

    payment: { type: PaymentSchema, default: () => ({}) },

    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },

    plannedDistanceKm: { type: Number },
    plannedDurationMin: { type: Number },

    meta: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

// Geospatial indexes for tracking user starting points and route ends
RideSchema.index({ boarding: "2dsphere" });
RideSchema.index({ destination: "2dsphere" });

module.exports = mongoose.model("Ride", RideSchema);
