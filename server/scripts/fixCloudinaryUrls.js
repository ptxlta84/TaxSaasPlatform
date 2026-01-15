// One-time script to fix all existing Cloudinary URLs in database
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const IncomeTaxReturn = require('../src/models/IncomeTaxReturn');

const fixAllDocumentUrls = async () => {
  try {
      console.info('Connecting to MongoDB...', process.env.MONGODB_URI ? 'URI Found' : 'URI Missing');
      await mongoose.connect(process.env.MONGODB_URI);
      console.info('Connected.');
      
      // Find all ITRs that might have documents
      const itrs = await IncomeTaxReturn.find({ 'documents.0': { $exists: true } });
      
      console.info(`Found ${itrs.length} ITRs with documents`);
      
      let fixedCount = 0;

      for (const itr of itrs) {
        let modified = false;
        
        if (itr.documents) {
            itr.documents.forEach(doc => {
                const oldUrl = doc.fileUrl;
                if (oldUrl && oldUrl.includes('cloudinary.com') && !oldUrl.includes('/v1') && !oldUrl.includes('/v2')) {
                   // Needs fix
                   const parts = oldUrl.split('/upload/');
                   if (parts.length === 2) {
                       const version = 'v' + Math.floor(Date.now() / 1000);
                       const newUrl = `${parts[0]}/upload/${version}/${parts[1]}`;
                       
                       console.info(`Fixing: ${oldUrl} -> ${newUrl}`);
                       doc.fileUrl = newUrl;
                       modified = true;
                       fixedCount++;
                   }
                }
            });
        }
        
        if (modified) {
            // Mongoose array mutations sometimes need markModified
            itr.markModified('documents'); 
            await itr.save();
        }
      }
      
      console.info(`All operations complete. Fixed ${fixedCount} URLs.`);
      process.exit(0);

  } catch (err) {
      console.error('Script Failed:', err);
      process.exit(1);
  }
};

fixAllDocumentUrls();
