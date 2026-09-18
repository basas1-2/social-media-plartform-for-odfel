const fs = require('fs');
const path = require('path');
const docx = require('docx');

const docPath = path.join(__dirname, 'ODFEL_Project_Chapters_3_4.docx');
const stats = fs.statSync(docPath);

console.log(`Document File: ${path.basename(docPath)}`);
console.log(`File Size: ${(stats.size / 1024).toFixed(2)} KB`);

// Read images
const imgDir = path.join(__dirname, 'chapter3_images');
const images = fs.readdirSync(imgDir);
console.log(`Embedded Figures: ${images.length} files found in chapter3_images:`);
images.forEach(img => {
    const s = fs.statSync(path.join(imgDir, img));
    console.log(` - ${img} (${(s.size/1024).toFixed(1)} KB)`);
});
