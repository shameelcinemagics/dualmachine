const prisma = require('../db/client');
const { sendCommandToSlot,testAllSlots } = require('../commands/sendCommand');


// Test a slot
exports.testSingleSlot = async (req, res) => {
  try {
    const { slotNumber } = req.body;

    if (typeof slotNumber !== "number" || slotNumber < 1 || slotNumber > 160) {
      return res.status(400).json({ message: "Invalid slot number (1-80)" });
    }

    const response = await sendCommandToSlot(slotNumber); // no drop sensor
    res.status(200).json({
      message: `Slot ${slotNumber} tested successfully`,
      response,
    });
  } catch (error) {
    console.error(`❌ Failed to test slot ${req.body.slotNumber}:`, error);
    res.status(500).json({
      message: `Error testing slot ${req.body.slotNumber}`,
      error: error.message,
    });
  }
}

exports.testAllSlots = async (req, res) => {
  try {
    await testAllSlots(false); // or true if you want drop sensor
    res.status(200).json({ message: "✅ All slots tested." });
  } catch (err) {
    console.error("❌ testAllSlots error:", err);
    res.status(500).json({ message: "Error testing all slots." });
  }
};

// Update a slot (assign product and quantity)
exports.updateSlot = async (req, res) => {
  try {
    const slotId = parseInt(req.params.id);
    const { productId, quantity } = req.body;

    const slot = await prisma.slot.update({
      where: { id: slotId },
      data: {
        productId,
        quantity,
        status: quantity === 0 ? "out-of-stock" : "active",
      },
    });

    res.status(200).json({ message: "Slot updated successfully", slot });
  } catch (err) {
    console.error("❌ updateSlot error:", err);
    res.status(500).json({ message: "Failed to update slot" });
  }
};
