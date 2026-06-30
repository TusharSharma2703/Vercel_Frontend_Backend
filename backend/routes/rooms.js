const express = require("express");
const Room = require("../models/Room");
const protect = require("../middleware/auth");

const router = express.Router();

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// POST /api/rooms  - create a new room
router.post("/", protect, async (req, res) => {
  try {
    const { name, durationMinutes } = req.body;
    if (!name) return res.status(400).json({ message: "Room name is required" });

    let code;
    let exists = true;
    while (exists) {
      code = generateCode();
      exists = await Room.findOne({ code });
    }

    const room = await Room.create({
      code,
      name,
      host: req.user.id,
      durationMinutes: durationMinutes || 25,
      startedAt: new Date(),
    });

    res.status(201).json({ room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/rooms/:code - get room info by join code
router.get("/:code", protect, async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const room = await Room.findOne({ code, isActive: true }).populate("host", "name");
    if (!room) return res.status(404).json({ message: "Room not found or has ended" });
    res.json({ room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/rooms/:code/end - host ends the room
router.patch("/:code/end", protect, async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const room = await Room.findOne({ code });
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.host.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the host can end the room" });
    }
    room.isActive = false;
    await room.save();
    res.json({ message: "Room ended" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
