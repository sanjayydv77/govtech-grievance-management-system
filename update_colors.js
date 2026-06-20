const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'd:/CMPortal/delhi-cm-portal/frontend/src/pages/Auth/AuthPage.jsx',
    'd:/CMPortal/delhi-cm-portal/frontend/src/layouts/AdminLayout.jsx',
    'd:/CMPortal/delhi-cm-portal/frontend/src/pages/Admin/AdminDashboard.jsx',
    'd:/CMPortal/delhi-cm-portal/frontend/src/pages/Admin/AllComplaints.jsx',
    'd:/CMPortal/delhi-cm-portal/frontend/src/pages/Admin/ManageOfficers.jsx',
    'd:/CMPortal/delhi-cm-portal/frontend/src/pages/Admin/UserManagement.jsx',
    'd:/CMPortal/delhi-cm-portal/frontend/src/App.jsx'
];

filesToUpdate.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // 1. Replace indigo with blue for official government look
        content = content.replace(/indigo-/g, 'blue-');
        
        // 2. AuthPage overrides
        if (file.includes('AuthPage.jsx')) {
            content = content.replace(/bg-slate-900/g, 'bg-blue-900');
            content = content.replace(/hover:bg-slate-800/g, 'hover:bg-blue-800');
            content = content.replace(/text-slate-900/g, 'text-blue-900');
        }
        
        // 3. AdminLayout structural changes
        if (file.includes('AdminLayout.jsx')) {
            // Sidebar color
            content = content.replace(/bg-slate-900/g, 'bg-blue-900');
            
            // Remove 'fixed' from sidebar, 'ml-64' from main, 'h-screen' from wrapper
            content = content.replace(/h-screen/g, 'h-full flex-1 min-h-0');
            content = content.replace(/fixed h-full/g, 'relative h-full');
            content = content.replace(/ml-64 /g, '');
        }

        // 4. AdminDashboard overrides
        if (file.includes('AdminDashboard.jsx')) {
            content = content.replace(/text-slate-800/g, 'text-blue-900');
        }

        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated colors in ${path.basename(file)}`);
    } else {
        console.error(`File not found: ${file}`);
    }
});
