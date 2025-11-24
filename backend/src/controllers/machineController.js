const { sendCommand, enableControler } = require('../commands/sendCommand');

exports.setTemperature = async (req, res) => {
  const { temperature } = req.body;
  if (typeof temperature !== 'number') {
    return res.status(400).json({ message: 'Temperature must be a number.' });
  }

  const cmd = `SET_TEMP:${temperature}`;
  await sendCommand(cmd);
  res.json({ message: 'Temperature command sent.', command: cmd });
};

exports.defrost = async (req, res) => {
  const cmd = 'DEFROST_ON';
  await sendCommand(cmd);
  res.json({ message: 'Defrost command sent.', command: cmd });
};

exports.glassHeating = async (req, res) => {
  const { state } = req.body;
  if (!['on', 'off'].includes(state)) {
    return res.status(400).json({ message: 'State must be "on" or "off".' });
  }

  const cmd = `GLASS_HEAT_${state.toUpperCase()}`;
  await sendCommand(cmd);
  res.json({ message: `Glass heating ${state}.`, command: cmd });
};

exports.enableControler = async(req,res)=>{
  await enableControler()
  return res.json({message:"Temperature Controll Enbaled"})
}