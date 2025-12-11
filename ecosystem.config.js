module.exports = {
  apps: [{
    name: 'wmc-executive-hire',
    script: './server.js',
    instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
    exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 3000,
    kill_timeout: 5000,
    wait_ready: true,
    shutdown_with_message: true,
    
    // Cron restart at 3 AM daily (optional)
    cron_restart: process.env.NODE_ENV === 'production' ? '0 3 * * *' : undefined,
    
    // Environment variables
    env_file: '.env',
    
    // Monitoring
    instance_var: 'INSTANCE_ID',
    
    // Advanced features
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 3000,
    
    // Error handling
    exp_backoff_restart_delay: 100,
    
    // Source map support
    source_map_support: true,
    
    // Node args
    node_args: '--max-old-space-size=2048',
    
    // Interpreter
    interpreter: 'node',
    
    // Post-deploy hooks
    post_update: ['npm install', 'npm run init-db'],
    
    // Health check
    health_check: {
      enable: true,
      interval: 30000, // 30 seconds
      path: '/api/health',
      port: 3000
    }
  }],

  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'your-git-repository-url',
      path: '/var/www/wmc-executive-hire',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt-get install git'
    },
    staging: {
      user: 'deploy',
      host: ['your-staging-server-ip'],
      ref: 'origin/develop',
      repo: 'your-git-repository-url',
      path: '/var/www/wmc-executive-hire-staging',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging'
    }
  }
};
