/** PM2 常驻进程。确保项目根目录已有 .env（含 PORT / HOST / PUBLIC_ORIGIN / GitHub 密钥）。
 * 不要在 ecosystem 里再写一份 GITHUB_CLIENT_SECRET：若与 .env 不一致，会导致会话验签失败、一直 401。
 */
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
      /** 强制用项目根目录 .env 覆盖 PM2 里的 GITHUB_CLIENT_SECRET（若存在变量名），避免验签失败 */
      env: {
        VIBY_DOTENV_OVERRIDE: "1",
      },
    },
  ],
};
