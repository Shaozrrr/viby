/** PM2 常驻进程。确保项目根目录已有 .env（含 PORT / HOST / PUBLIC_ORIGIN / GitHub 密钥） */
module.exports = {
  apps: [
    {
      name: "viby",
      script: "./server.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "220M",
    },
  ],
};
