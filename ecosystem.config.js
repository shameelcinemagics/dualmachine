module.exports = {
  apps: [
    {
      name: "backend",
      cwd: "D:/vendIT-FulllApp/backend",
      script: "server.js",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "frontend",
      cwd: "D:/vendIT-FulllApp/frontend",
      script: "./node_modules/serve/build/main.js",
      args: "-s dist -l 8080",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "signage",
      cwd: "D:/vendIT-FulllApp/signage", // or wherever your watcher.js is
      script: "watcher.js",
      autorestart: true,
      watch: false,
    },
    {
      name: "chrome",
      cwd:"D:/vendIT-FulllApp",
      script:"chrome.js",
      interpreter:"node",
      autorestart:false
    },
  ],
};
