const PNT = require('pureimage');
const fs = require('fs');
const path = require('path');

const font = PNT.registerFont('C:\\Windows\\Fonts\\arial.ttf', 'Arial');
font.loadSync();

const outputDir = path.join(__dirname, 'chapter3_images');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Utility drawing functions
function drawRect(ctx, x, y, w, h, fill, stroke = null, lineWidth = 1) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(x, y, w, h);
    }
}

function drawText(ctx, text, x, y, fontSize = 16, color = '#000000') {
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

function drawLine(ctx, x1, y1, x2, y2, color = '#333333', width = 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawArrow(ctx, x1, y1, x2, y2, color = '#333333', width = 2) {
    drawLine(ctx, x1, y1, x2, y2, color, width);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 10;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

function drawDiamond(ctx, x, y, w, h, fill, stroke = null) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x, y + h / 2);
    ctx.closePath();
    ctx.fill();
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function drawOval(ctx, x, y, w, h, fill, stroke = null) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rx = w / 2;
    const ry = h / 2;
    ctx.arc(cx, cy, Math.min(rx, ry), 0, Math.PI * 2);
    ctx.fill();
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// -------------------------------------------------------------
// FIGURE 3.1: USE CASE DIAGRAM
// -------------------------------------------------------------
async function generateUseCaseDiagram() {
    const w = 1200, h = 800;
    const img = PNT.make(w, h);
    const ctx = img.getContext('2d');
    
    // Background
    drawRect(ctx, 0, 0, w, h, '#F8FAFC');
    
    // Header
    drawRect(ctx, 0, 0, w, 60, '#1E293B');
    drawText(ctx, "FIGURE 3.1: USE CASE DIAGRAM FOR ODFEL SOCIAL MEDIA PLATFORM", 240, 40, 20, '#FFFFFF');

    // System Boundary
    drawRect(ctx, 300, 90, 600, 670, '#FFFFFF', '#2563EB', 3);
    drawText(ctx, "ODFEL Social Media System Boundary", 420, 120, 18, '#1E40AF');

    // Actors
    const actors = [
        { name: "Student", x: 120, y: 220, color: '#0284C7' },
        { name: "Lecturer", x: 120, y: 450, color: '#0D9488' },
        { name: "Administrator", x: 1020, y: 350, color: '#DC2626' }
    ];

    actors.forEach(act => {
        drawRect(ctx, act.x - 70, act.y - 40, 140, 80, act.color, '#0F172A', 2);
        drawText(ctx, act.name, act.x - 40, act.y + 8, 18, '#FFFFFF');
    });

    // Use Cases
    const useCases = [
        { text: "UC1: Account Registration & JWT Auth", x: 420, y: 170 },
        { text: "UC2: User Profile & Photo Upload", x: 740, y: 170 },
        { text: "UC3: Create Posts & Attach Media", x: 420, y: 280 },
        { text: "UC4: Interact on Feed (Like/Comment)", x: 740, y: 280 },
        { text: "UC5: Real-time Chat (Socket.IO)", x: 420, y: 390 },
        { text: "UC6: Join & Moderate Study Groups", x: 740, y: 390 },
        { text: "UC7: Upload & Download Resources", x: 420, y: 500 },
        { text: "UC8: Real-Time Alert Notifications", x: 740, y: 500 },
        { text: "UC9: User Account & Content Moderation", x: 580, y: 620 }
    ];

    useCases.forEach(uc => {
        drawRect(ctx, uc.x - 130, uc.y - 30, 260, 60, '#EFF6FF', '#1D4ED8', 2);
        drawText(ctx, uc.text, uc.x - 120, uc.y + 6, 13, '#1E3A8A');
    });

    // Connections
    [170, 280, 390, 500].forEach(y => drawLine(ctx, 190, 220, 290, y, '#0284C7', 2));
    [170, 280, 390, 500].forEach(y => drawLine(ctx, 190, 450, 290, y, '#0D9488', 2));
    drawLine(ctx, 950, 350, 870, 620, '#DC2626', 2);
    drawLine(ctx, 950, 350, 870, 170, '#DC2626', 2);
    drawLine(ctx, 950, 350, 870, 390, '#DC2626', 2);

    const stream = fs.createWriteStream(path.join(outputDir, 'figure_3_1_use_case_diagram.png'));
    await PNT.encodePNGToStream(img, stream);
    console.log('Created figure_3_1_use_case_diagram.png');
}

// -------------------------------------------------------------
// FIGURE 3.2: SYSTEM FLOWCHART
// -------------------------------------------------------------
async function generateSystemFlowchart() {
    const w = 1000, h = 950;
    const img = PNT.make(w, h);
    const ctx = img.getContext('2d');
    
    drawRect(ctx, 0, 0, w, h, '#F8FAFC');
    drawRect(ctx, 0, 0, w, 60, '#1E293B');
    drawText(ctx, "FIGURE 3.2: SYSTEM FLOWCHART FOR ODFEL SOCIAL MEDIA PLATFORM", 180, 40, 20, '#FFFFFF');

    // Steps
    // 1. Start (Oval)
    drawRect(ctx, 350, 90, 300, 50, '#10B981', '#0F172A', 2);
    drawText(ctx, "START: Launch ODFEL Web Portal", 370, 122, 16, '#FFFFFF');

    // 2. Input Login Credentials (Process)
    drawRect(ctx, 350, 180, 300, 50, '#3B82F6', '#0F172A', 2);
    drawText(ctx, "Input Login Email & Password", 380, 212, 16, '#FFFFFF');

    // 3. Authenticate JWT (Decision - Diamond)
    drawDiamond(ctx, 300, 270, 400, 80, '#F59E0B', '#0F172A');
    drawText(ctx, "Is User Authenticated & JWT Valid?", 350, 316, 15, '#FFFFFF');

    // 4. Render Dashboard (Process)
    drawRect(ctx, 350, 390, 300, 50, '#3B82F6', '#0F172A', 2);
    drawText(ctx, "Load Main Feed & Dashboard Data", 365, 422, 15, '#FFFFFF');

    // 5. Select Action Choice (Decision - Diamond)
    drawDiamond(ctx, 260, 480, 480, 90, '#8B5CF6', '#0F172A');
    drawText(ctx, "Action: Post / Chat / Resource / Admin Control?", 300, 532, 15, '#FFFFFF');

    // 6. Execute API Request & Database Update (Process)
    drawRect(ctx, 310, 620, 380, 50, '#06B6D4', '#0F172A', 2);
    drawText(ctx, "Execute Express Controller & Update MongoDB", 325, 652, 14, '#FFFFFF');

    // 7. Socket.IO Real-time Push (Process)
    drawRect(ctx, 310, 720, 380, 50, '#3B82F6', '#0F172A', 2);
    drawText(ctx, "Emit Socket.IO Event & Update UI State", 345, 752, 15, '#FFFFFF');

    // 8. End (Oval)
    drawRect(ctx, 350, 820, 300, 50, '#EF4444', '#0F172A', 2);
    drawText(ctx, "END: Terminate User Session", 390, 852, 16, '#FFFFFF');

    // Flow Arrows
    drawArrow(ctx, 500, 140, 500, 180, '#0F172A', 2);
    drawArrow(ctx, 500, 230, 500, 270, '#0F172A', 2);
    drawArrow(ctx, 500, 350, 500, 390, '#0F172A', 2);
    drawText(ctx, "YES (Auth Success)", 515, 375, 14, '#059669');

    // NO Path back to login
    drawLine(ctx, 700, 310, 780, 310, '#EF4444', 2);
    drawLine(ctx, 780, 310, 780, 205, '#EF4444', 2);
    drawArrow(ctx, 780, 205, 650, 205, '#EF4444', 2);
    drawText(ctx, "NO (Auth Error)", 705, 298, 13, '#DC2626');

    drawArrow(ctx, 500, 440, 500, 480, '#0F172A', 2);
    drawArrow(ctx, 500, 570, 500, 620, '#0F172A', 2);
    drawArrow(ctx, 500, 670, 500, 720, '#0F172A', 2);
    drawArrow(ctx, 500, 770, 500, 820, '#0F172A', 2);

    const stream = fs.createWriteStream(path.join(outputDir, 'figure_3_2_system_flowchart.png'));
    await PNT.encodePNGToStream(img, stream);
    console.log('Created figure_3_2_system_flowchart.png');
}

// -------------------------------------------------------------
// FIGURE 3.3: DATABASE SCHEMA & ER DIAGRAM
// -------------------------------------------------------------
async function generateDatabaseDesign() {
    const w = 1200, h = 880;
    const img = PNT.make(w, h);
    const ctx = img.getContext('2d');
    
    drawRect(ctx, 0, 0, w, h, '#F8FAFC');
    drawRect(ctx, 0, 0, w, 60, '#1E293B');
    drawText(ctx, "FIGURE 3.3: DATABASE ENTITY SCHEMA & ER DIAGRAM", 290, 40, 20, '#FFFFFF');

    const collections = [
        {
            title: "USERS Collection", x: 50, y: 90, w: 330, h: 230,
            fields: ["_id: ObjectId (PK)", "fullName: String", "email: String (Unique Index)", "passwordHash: String", "role: String (Student/Lecturer/Admin)", "avatarUrl: String", "bio: String", "createdAt: Date"]
        },
        {
            title: "POSTS Collection", x: 435, y: 90, w: 330, h: 230,
            fields: ["_id: ObjectId (PK)", "authorId: ObjectId (FK -> Users)", "content: String", "mediaUrls: Array<String>", "likes: Array<ObjectId>", "commentsCount: Number", "createdAt: Date"]
        },
        {
            title: "COMMENTS Collection", x: 820, y: 90, w: 330, h: 230,
            fields: ["_id: ObjectId (PK)", "postId: ObjectId (FK -> Posts)", "authorId: ObjectId (FK -> Users)", "content: String", "createdAt: Date"]
        },
        {
            title: "MESSAGES Collection", x: 50, y: 370, w: 330, h: 230,
            fields: ["_id: ObjectId (PK)", "senderId: ObjectId (FK -> Users)", "receiverId: ObjectId (FK -> Users)", "content: String", "mediaUrl: String", "isRead: Boolean", "createdAt: Date"]
        },
        {
            title: "GROUPS Collection", x: 435, y: 370, w: 330, h: 230,
            fields: ["_id: ObjectId (PK)", "name: String (Unique)", "description: String", "creatorId: ObjectId (FK -> Users)", "members: Array<ObjectId>", "createdAt: Date"]
        },
        {
            title: "RESOURCES Collection", x: 820, y: 370, w: 330, h: 230,
            fields: ["_id: ObjectId (PK)", "title: String", "category: String", "fileUrl: String", "uploaderId: ObjectId (FK -> Users)", "createdAt: Date"]
        },
        {
            title: "NOTIFICATIONS Collection", x: 435, y: 640, w: 330, h: 200,
            fields: ["_id: ObjectId (PK)", "recipientId: ObjectId (FK -> Users)", "senderId: ObjectId (FK -> Users)", "type: String", "isRead: Boolean", "createdAt: Date"]
        }
    ];

    collections.forEach(col => {
        drawRect(ctx, col.x, col.y, col.w, 35, '#1E40AF', '#0F172A', 2);
        drawText(ctx, col.title, col.x + 15, col.y + 24, 15, '#FFFFFF');
        
        drawRect(ctx, col.x, col.y + 35, col.w, col.h - 35, '#FFFFFF', '#1E40AF', 2);
        col.fields.forEach((f, idx) => {
            drawText(ctx, f, col.x + 10, col.y + 58 + idx * 24, 12, '#1E293B');
        });
    });

    // Relationships Lines
    drawLine(ctx, 380, 180, 435, 180, '#2563EB', 3); // Users -> Posts
    drawLine(ctx, 765, 180, 820, 180, '#2563EB', 3); // Posts -> Comments
    drawLine(ctx, 215, 320, 215, 370, '#2563EB', 3); // Users -> Messages
    drawLine(ctx, 600, 320, 600, 370, '#2563EB', 3); // Users -> Groups
    drawLine(ctx, 985, 320, 985, 370, '#2563EB', 3); // Users -> Resources
    drawLine(ctx, 600, 600, 600, 640, '#2563EB', 3); // Groups -> Notifications

    const stream = fs.createWriteStream(path.join(outputDir, 'figure_3_3_database_design.png'));
    await PNT.encodePNGToStream(img, stream);
    console.log('Created figure_3_3_database_design.png');
}

// -------------------------------------------------------------
// FIGURE 3.4: INPUT DESIGN WIREFRAME
// -------------------------------------------------------------
async function generateInputDesign() {
    const w = 1100, h = 720;
    const img = PNT.make(w, h);
    const ctx = img.getContext('2d');
    
    drawRect(ctx, 0, 0, w, h, '#F1F5F9');
    drawRect(ctx, 0, 0, w, 60, '#1E293B');
    drawText(ctx, "FIGURE 3.4: INPUT DESIGN SPECIFICATION & WEBSITE MOCKUP", 200, 40, 20, '#FFFFFF');

    // Left Box: Registration Input Specification
    drawRect(ctx, 40, 90, 490, 580, '#FFFFFF', '#CBD5E1', 2);
    drawRect(ctx, 40, 90, 490, 45, '#2563EB');
    drawText(ctx, "Input Specification 1: User Account Registration", 65, 120, 16, '#FFFFFF');

    const regInputs = [
        { label: "Full Name:", value: "e.g. Mohammed Ibrahim (Required)" },
        { label: "Institutional Email:", value: "e.g. m.ibrahim@odfel.edu.ng (Unique)" },
        { label: "Select Academic Role:", value: "[ Student / Lecturer / Admin ]" },
        { label: "Department & Level:", value: "e.g. Computer Science - ND II" },
        { label: "Password:", value: "•••••••••••• (Min 8 characters)" },
        { label: "Confirm Password:", value: "••••••••••••" }
    ];

    regInputs.forEach((inp, i) => {
        const y = 150 + i * 72;
        drawText(ctx, inp.label, 65, y + 16, 14, '#334155');
        drawRect(ctx, 65, y + 24, 440, 36, '#F8FAFC', '#94A3B8', 1);
        drawText(ctx, inp.value, 80, y + 48, 13, '#64748B');
    });

    drawRect(ctx, 65, 595, 440, 45, '#2563EB');
    drawText(ctx, "SUBMIT REGISTRATION FORM", 165, 624, 16, '#FFFFFF');

    // Right Box: Post Creation Input Specification
    drawRect(ctx, 570, 90, 490, 580, '#FFFFFF', '#CBD5E1', 2);
    drawRect(ctx, 570, 90, 490, 45, '#10B981');
    drawText(ctx, "Input Specification 2: Create Academic Post", 595, 120, 16, '#FFFFFF');

    drawText(ctx, "Post Body / Announcement Content:", 595, 170, 14, '#334155');
    drawRect(ctx, 595, 185, 440, 140, '#F8FAFC', '#94A3B8', 1);
    drawText(ctx, "Type your academic update, lecture announcement...", 615, 220, 13, '#94A3B8');

    drawText(ctx, "Attach File / Media (PDF, Images, MP4):", 595, 350, 14, '#334155');
    drawRect(ctx, 595, 365, 440, 60, '#F1F5F9', '#CBD5E1', 1);
    drawText(ctx, "[ + Upload PDF Lecture Notes / Slide Files ]", 665, 402, 14, '#2563EB');

    drawText(ctx, "Post Target Audience / Visibility:", 595, 450, 14, '#334155');
    drawRect(ctx, 595, 465, 440, 38, '#F8FAFC', '#94A3B8', 1);
    drawText(ctx, "Public Feed (All ODFEL Community)", 615, 490, 13, '#1E293B');

    drawRect(ctx, 595, 595, 440, 45, '#059669');
    drawText(ctx, "PUBLISH ANNOUNCEMENT", 695, 624, 16, '#FFFFFF');

    const stream = fs.createWriteStream(path.join(outputDir, 'figure_3_4_input_design.png'));
    await PNT.encodePNGToStream(img, stream);
    console.log('Created figure_3_4_input_design.png');
}

// -------------------------------------------------------------
// FIGURE 3.5: OUTPUT DESIGN WIREFRAME
// -------------------------------------------------------------
async function generateOutputDesign() {
    const w = 1100, h = 760;
    const img = PNT.make(w, h);
    const ctx = img.getContext('2d');
    
    drawRect(ctx, 0, 0, w, h, '#F1F5F9');
    
    // Top Nav
    drawRect(ctx, 0, 0, w, 60, '#0F172A');
    drawText(ctx, "ODFEL SOCIAL PLATFORM", 30, 40, 20, '#38BDF8');
    drawRect(ctx, 300, 12, 350, 35, '#1E293B', '#475569', 1);
    drawText(ctx, "Search posts, courses, peers...", 320, 35, 13, '#94A3B8');
    drawText(ctx, "Feed | Messages | Groups | Resources | Admin", 680, 40, 14, '#F8FAFC');

    // Left Sidebar
    drawRect(ctx, 30, 80, 240, 650, '#FFFFFF', '#CBD5E1', 1);
    drawRect(ctx, 50, 100, 200, 120, '#EFF6FF', '#3B82F6', 1);
    drawText(ctx, "Student Profile", 90, 130, 15, '#1E40AF');
    drawText(ctx, "Dept: Computer Sci", 70, 160, 13, '#475569');
    drawText(ctx, "Level: ND II", 95, 185, 13, '#475569');

    drawText(ctx, "QUICK NAVIGATION", 50, 260, 14, '#0F172A');
    ["My Courses", "Class Schedule", "Saved Notes", "Study Groups", "Settings"].forEach((nav, idx) => {
        drawRect(ctx, 50, 280 + idx * 45, 200, 35, '#F8FAFC', '#E2E8F0', 1);
        drawText(ctx, nav, 70, 303 + idx * 45, 13, '#334155');
    });

    // Center Feed Output
    drawRect(ctx, 290, 80, 520, 650, '#FFFFFF', '#CBD5E1', 1);
    drawRect(ctx, 310, 100, 480, 50, '#F1F5F9', '#CBD5E1', 1);
    drawText(ctx, "Share an update with your ODFEL peers...", 330, 130, 13, '#94A3B8');

    // Post Card 1 Output
    drawRect(ctx, 310, 170, 480, 250, '#FFFFFF', '#94A3B8', 1);
    drawText(ctx, "Dr. A. O. Bello (Lecturer) • 2 hrs ago", 330, 198, 14, '#1E293B');
    drawText(ctx, "Notice: The ND II System Analysis continuous assessment test", 330, 228, 13, '#334155');
    drawText(ctx, "will be held on Friday at 10:00 AM via the online portal.", 330, 248, 13, '#334155');
    
    drawRect(ctx, 330, 265, 440, 90, '#E0F2FE', '#0284C7', 1);
    drawText(ctx, "[ ATTACHMENT: CAT_Timetable_Notice.pdf ]", 390, 318, 14, '#0369A1');

    drawRect(ctx, 330, 370, 440, 35, '#F8FAFC', '#E2E8F0', 1);
    drawText(ctx, "Like (45)  |  Comment (12)  |  Share  |  Save Resource", 390, 393, 13, '#2563EB');

    // Post Card 2 Output
    drawRect(ctx, 310, 440, 480, 260, '#FFFFFF', '#94A3B8', 1);
    drawText(ctx, "Mohammed Ibrahim (Student) • 4 hrs ago", 330, 468, 14, '#1E293B');
    drawText(ctx, "Has anyone solved Question 3 in the Express routing assignment?", 330, 498, 13, '#334155');
    drawText(ctx, "Let's discuss in the Computer Science ND2 study room.", 330, 518, 13, '#334155');
    
    drawRect(ctx, 330, 540, 440, 100, '#F1F5F9', '#CBD5E1', 1);
    drawText(ctx, "[ ACTIVE THREAD: 8 Discussion Replies ]", 390, 598, 13, '#475569');

    // Right Sidebar Output
    drawRect(ctx, 830, 80, 240, 650, '#FFFFFF', '#CBD5E1', 1);
    drawText(ctx, "NOTIFICATIONS & CHAT", 850, 110, 14, '#0F172A');
    
    ["New message from Admin", "Lecture note uploaded", "Group meeting in 1 hr", "Assignment deadline near"].forEach((notif, idx) => {
        drawRect(ctx, 850, 130 + idx * 60, 200, 50, '#EFF6FF', '#BFDBFE', 1);
        drawText(ctx, notif, 860, 160 + idx * 60, 13, '#1E40AF');
    });

    drawText(ctx, "ONLINE PEERS (8)", 850, 400, 14, '#059669');
    ["Amina S. (Online)", "Chidi K. (Online)", "Usman M. (Online)", "Grace P. (Online)"].forEach((peer, idx) => {
        drawRect(ctx, 850, 420 + idx * 45, 200, 35, '#ECFDF5', '#A7F3D0', 1);
        drawText(ctx, peer, 870, 443 + idx * 45, 13, '#047857');
    });

    const stream = fs.createWriteStream(path.join(outputDir, 'figure_3_5_output_design.png'));
    await PNT.encodePNGToStream(img, stream);
    console.log('Created figure_3_5_output_design.png');
}

async function main() {
    try {
        await generateUseCaseDiagram();
        await generateSystemFlowchart();
        await generateDatabaseDesign();
        await generateInputDesign();
        await generateOutputDesign();
        console.log('All 5 diagram PNGs successfully generated with crisp text rendering!');
    } catch (err) {
        console.error('Error generating diagrams:', err);
    }
}

main();
