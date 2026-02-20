const { spawn } = require('child_process');
const path = require('path');

console.log('\n🚀 Starting HelpMe Application...\n');

// Start Backend
console.log('📦 Starting Backend Server...');
const backend = spawn('npm', ['start'], {
  cwd: __dirname,
  shell: true,
  stdio: 'inherit'
});

backend.on('error', (err) => {
  console.error('❌ Backend Error:', err);
});

// Wait 3 seconds then start frontend
setTimeout(() => {
  console.log('\n📦 Starting Frontend Server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'client'),
    shell: true,
    stdio: 'inherit'
  });
  
  frontend.on('error', (err) => {
    console.error('❌ Frontend Error:', err);
  });
}, 3000);

console.log('\n✅ Application Starting...');
console.log('   Backend: http://localhost:5000');
console.log('   Frontend: http://localhost:3002');
console.log('\n   Press Ctrl+C to stop both servers\n');

// Handle exit
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down servers...\n');
  backend.kill();
  process.exit();
});
