const { SerialPort } = require("serialport");
const {port,readAndLogTemperature, port1} = require('../commands/sendCommand')

function buildSetTempCommand(temp, boardId = 0x00) {
  const instruction = 0xCE;
  const D1 = boardId;
  const D2 = 0xFF;
  const D3 = instruction;
  const D4 = 0xFF - D3;
  const D5 = temp; // e.g. 5°C
  const D6 = 0xFF - D5;

  return Buffer.from([D1, D2, D3, D4, D5, D6]);
}

exports.setTemperature = (req, res) => {
  const { temperature, machine } = req.body;

  console.log(temperature, machine)
  if (typeof temperature !== "number" || temperature < -20 || temperature > 100) {
    return res.status(400).json({ message: "Temperature must be a number between -20 and 100" });
  }

  function getPortAndBoard(machine) {
  if (machine == 1) return port;
  if (machine == 2) return port1;
  return null;
}

  const selectedPort = getPortAndBoard(machine);
  console.log(selectedPort)
  const packet = buildSetTempCommand(temperature);

  const onData = (data) => {
    clearTimeout(timeout);
    selectedPort.off("data", onData); // Remove this listener after use

    const response = data.toString().trim();
    console.log("✅ Response from device:", response);

    // return res.status(200).json({
    //   message: `Temperature set to ${temperature}°C`,
    //   deviceResponse: response,
    // });
  };

  selectedPort.write(packet, (err) => {
    if (err) {
      console.error("❌ Failed to write temperature command:", err);
      return res.status(500).json({ message: "Serial write failed" });
    }

    console.log("✅ Temperature set command sent:", packet);
    return res.status(200).json({ message: `Temperature set to ${temperature}°C` });
  });
};

exports.readTemperature = async (req, res) => {
  try {
    const temps = await readAndLogTemperature();
    res.status(200).json(temps);
  } catch (error) {
    console.error("❌ Read temperature failed:", error.message);
    res.status(500).json({ message: error.message });
  }
};
