const PNT = require('pureimage');
const fs = require('fs');
const path = require('path');

const font = PNT.registerFont('C:\\Windows\\Fonts\\arial.ttf', 'Arial');
font.loadSync();

const img = PNT.make(600, 300);
const ctx = img.getContext('2d');

ctx.fillStyle = '#F8FAFC';
ctx.fillRect(0, 0, 600, 300);

ctx.font = "24px Arial";
ctx.fillStyle = '#1E3A8A';
ctx.fillText("ODFEL Social Media Platform", 50, 60);

ctx.font = "16px Arial";
ctx.fillStyle = '#334155';
ctx.fillText("System Flowchart & Database Architecture", 50, 110);

ctx.fillStyle = '#2563EB';
ctx.fillRect(50, 150, 200, 80);

ctx.font = "18px Arial";
ctx.fillStyle = '#FFFFFF';
ctx.fillText("START PROCESS", 70, 198);

const out = fs.createWriteStream(path.join(__dirname, 'test_font_render.png'));
PNT.encodePNGToStream(img, out).then(() => {
    console.log('Successfully saved test_font_render.png');
}).catch(console.error);
