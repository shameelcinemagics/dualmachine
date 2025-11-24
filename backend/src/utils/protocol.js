// Build the 6-byte command packet
function buildCommand(boardId, slotNumber, instruction) {

  let actualSlot = slotNumber;

  if(slotNumber>=100 && slotNumber<= 160){
    actualSlot = slotNumber - 100;
  }


  const d1 = boardId;
  const d2 = 0xFF - d1;
  const d3 = actualSlot;
  const d4 = 0xFF - d3;
  const d5 = instruction;
  const d6 = 0xFF - d5;

  return Buffer.from([d1, d2, d3, d4, d5, d6]);
}

// Parse the 5-byte response packet
function parseResponse(buffer) {
  if (buffer.length !== 5) {
    throw new Error("Invalid response length");
  }

  const [r1, r2, r3, r4, r5] = buffer;
  const checksum = (r1 + r2 + r3 + r4) & 0xFF;

  if (r5 !== checksum) {
    throw new Error(`Checksum mismatch: expected 0x${checksum.toString(16)}, got 0x${r5.toString(16)}`);
  }

  const Y = (r3 & 0xF0) >> 4;
  const Z = r3 & 0x0F;

  return {
    boardId: r1,
    status: r2 === 0x5D ? "Normal" : "Error",
    motor: {
      0: "Normal",
      1: "PMOS short",
      2: "NMOS short",
      3: "Motor circuit",
      4: "Motor open circuit",
      5: "Motor timeout"
    }[Y] || "Unknown",
    dropSensor: {
      0: "Normal",
      1: "Sensor triggered without transmission",
      2: "No output when forbidden",
      3: "Sensor signal during dispense"
    }[Z] || "Unknown",
    dispenseStatus: {
      0x00: "No dispense or sensor off",
      0xAA: "Dispensing product"
    }[r4] || "Unknown",
    raw: [r1, r2, r3, r4, r5]
  };
}

module.exports = {
  buildCommand,
  parseResponse,
};
