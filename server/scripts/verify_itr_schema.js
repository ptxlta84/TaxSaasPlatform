const mongoose = require('mongoose');

// Connect to a dummy in-memory db or just load schema
console.log("Loading ITR V2 Schemas...");

try {
    const ITRModel = require('../src/models/itr/index');
    console.log("✅ Main ITR Model (V2) loaded successfully.");
    
    // Check paths
    const paths = ITRModel.schema.paths;
    const requiredSchedules = ['partA_General', 'scheduleSalary', 'scheduleHP', 'scheduleCG', 'scheduleOS', 'scheduleVIA', 'scheduleIT'];
    
    let allFound = true;
    requiredSchedules.forEach(s => {
        // Mongoose maps nested paths as 'path' or 'path.subpath'
        // For array of subdocs, it might just be 'scheduleSalary'
        if(paths[s] || ITRModel.schema.nested[s] || ITRModel.schema.path(s)) {
             console.log(`✅ Schedule loaded: ${s}`);
        } else {
             console.error(`❌ Schedule MISSING: ${s}`);
             allFound = false;
        }
    });

    if(allFound) {
        console.log("\n🎉 ALL SYSTEMS GO: ITR Engine Schemas are wired correctly.");
        process.exit(0);
    } else {
        console.error("\n🔥 CRITICAL FAILURE: Some schedules are missing.");
        process.exit(1);
    }

} catch (e) {
    console.error("🔥 FATAL ERROR Loading Schemas:", e);
    process.exit(1);
}
