module.exports = {
  apps: [
    {
      name: 'sever',
      script: './dist/src/index.js',
      exec_mode: 'cluster',
      watch: ['./dist', './ecosystem.config.js', './.env'],
      ignore_watch: [],
      max_memory_restart: '512M',
      instances: 1,
      instance_var: 'INSTANCE_ID',
      error_file: './logs/pm2/error.log',
      out_file: './logs/pm2/out.log',
      combine_logs: true,
      listen_timeout: 10000,
      max_restarts: 10,
      min_uptime: '5s',
      watch_options: {
        persistent: true,
        ignoreInitial: true,
      },
    },
  ],
};
