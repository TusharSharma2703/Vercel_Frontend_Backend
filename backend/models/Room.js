const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, length: 6 },
    name: { type: String, required: true, trim: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    durationMinutes: { type: Number, default: 25 },
    startedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
