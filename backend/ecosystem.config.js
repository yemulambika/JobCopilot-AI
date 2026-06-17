module.exports = {
  apps: [
    {
      name: "ai-resume-maker-api",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      max_memory_restart: "512M",
      watch: false,
      ignore_watch: ["node_modules", "logs", "uploads", "*.log"],
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      autorestart: true,
      restart_delay: 4000,
    },
  ],
};