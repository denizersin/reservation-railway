module.exports = {
  apps: [
    {
      name: 'nextjs-dev',
      script: 'npm',
      args: 'run dev-node'
    },
    {
        name: 'cron-jobs',
        script: 'npm',
        args:"run start-crons"
    }

  ]
}; 