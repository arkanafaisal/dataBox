module.exports = {
  apps: [{
    name: "textvault",
    script: "./backend/server.js",

    max_memory_restart:"250M",
    autorestart:true,
    restart_delay:3000,
    max_restarts:10 
  }]
};
