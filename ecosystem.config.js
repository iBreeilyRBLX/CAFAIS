module.exports = {
    apps: [
        {
            name: 'cafais-bot',
            script: 'npm',
            args:'run start',
            error_file: './logs/error.log',
            out_file: './logs/out.log',
            log_file: './logs/combined.log',
            time: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            autorestart: true,
            merge_logs: true,
            max_size: '10M',
            max_memory_restart: '500M',
            retain: 5,
        },
    ],
};
