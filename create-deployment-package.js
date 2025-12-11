const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║   WMC Executive Hire - Deployment Package      ║');
console.log('╚════════════════════════════════════════════════╝\n');

// Create deployment directory
const deployDir = path.join(__dirname, 'wmc-deployment-package');
const timestamp = new Date().toISOString().split('T')[0];

console.log('📦 Creating deployment package...\n');

// Files and directories to include
const filesToCopy = [
    // Root files
    'server.js',
    'package.json',
    'package-lock.json',
    '.env.example',
    'ecosystem.config.js',
    '.gitignore',
    
    // HTML files
    'index.html',
    'about.html',
    'services.html',
    'fleet.html',
    'prices.html',
    'contact.html',
    
    // Documentation
    'README.md',
    'START-HERE.md',
    'PRODUCTION-DEPLOYMENT.md',
    'FINAL-PRODUCTION-CHECKLIST.md',
    'PRODUCTION-OPTIMIZATION-COMPLETE.md',
    'QUICK-START.md',
    'DEPLOYMENT-GUIDE.md',
    
    // Admin scripts
    'add-admin-user.js',
    'list-admin-users.js',
    'delete-admin-user.js',
];

const directoriesToCopy = [
    'admin',
    'controllers',
    'css',
    'database',
    'images',
    'js',
    'middleware',
    'routes',
    'scripts',
    'utils',
];

// Create deployment directory
if (fs.existsSync(deployDir)) {
    fs.rmSync(deployDir, { recursive: true });
}
fs.mkdirSync(deployDir, { recursive: true });

// Copy files
console.log('📄 Copying files...');
filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(deployDir, file));
        console.log(`  ✓ ${file}`);
    }
});

// Copy directories
console.log('\n📁 Copying directories...');
directoriesToCopy.forEach(dir => {
    if (fs.existsSync(dir)) {
        copyDirectory(dir, path.join(deployDir, dir));
        console.log(`  ✓ ${dir}/`);
    }
});

// Create necessary empty directories
console.log('\n📂 Creating empty directories...');
const emptyDirs = ['logs', 'backups', 'uploads'];
emptyDirs.forEach(dir => {
    const dirPath = path.join(deployDir, dir);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(path.join(dirPath, '.gitkeep'), '');
    console.log(`  ✓ ${dir}/`);
});

// Create deployment README
console.log('\n📝 Creating deployment instructions...');
const deploymentReadme = `# WMC Executive Private Hire - Deployment Package

## 🚀 Quick Deployment Guide

This package contains everything you need to deploy your website.

### Step 1: Extract Files
Extract this ZIP to your desired location.

### Step 2: Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Step 3: Configure Environment
\`\`\`bash
cp .env.example .env
# Edit .env with your settings
\`\`\`

### Step 4: Initialize Database
\`\`\`bash
npm run init-db
npm run add-admin
\`\`\`

### Step 5: Start Server
\`\`\`bash
# Development
npm start

# Production
npm run prod
# OR
pm2 start ecosystem.config.js --env production
\`\`\`

## 📚 Documentation

- **START-HERE.md** - Quick start guide
- **PRODUCTION-DEPLOYMENT.md** - Complete deployment instructions
- **FINAL-PRODUCTION-CHECKLIST.md** - Pre-deployment checklist

## 📞 Support

- Email: wmctransportltd@gmail.com
- Phone: +44 7501 073623

## ✅ Package Contents

- ✅ All source code files
- ✅ Database schema (database/schema.sql)
- ✅ Configuration files
- ✅ Admin panel
- ✅ Security middleware
- ✅ Logging system
- ✅ Caching layer
- ✅ Backup scripts
- ✅ Complete documentation

**Status:** Production Ready
**Version:** 1.0
**Date:** ${timestamp}
`;

fs.writeFileSync(path.join(deployDir, 'DEPLOYMENT-README.md'), deploymentReadme);
console.log('  ✓ DEPLOYMENT-README.md');

console.log('\n✅ Deployment package created successfully!');
console.log(`\n📦 Location: ${deployDir}`);
console.log('\n📋 Next Steps:');
console.log('1. Compress the "wmc-deployment-package" folder to ZIP');
console.log('2. Download the ZIP file');
console.log('3. Extract on your server');
console.log('4. Follow DEPLOYMENT-README.md instructions\n');

// Helper function to copy directory recursively
function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
