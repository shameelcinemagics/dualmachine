const { spawn } = require("child_process");

const path = require('path');

const APP_PATH = path.join(__dirname, '..', '..', '..');

exports.updateSystem = async (req, res) => {
  try {
    console.log(APP_PATH)
    // send initial response immediately
    res.json({ message: "Update started... check backend logs" });

    const commands = `cd "${APP_PATH}" && git fetch origin main && git reset --hard origin/main && shutdown /r /t 0`;

    // Run inside Windows cmd
    const child = spawn("cmd.exe", ["/c", commands], {
      cwd: APP_PATH,
      shell: true,
    });

    child.stdout.on("data", (data) => {
      console.log("📄 STDOUT:", data.toString());
    });

    child.stderr.on("data", (data) => {
      console.error("❌ STDERR:", data.toString());
    });

    child.on("close", (code) => {
      console.log(`✅ Update process finished with code ${code}`);
    });
  } catch (error) {
    console.error("❌ Update failed:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};
