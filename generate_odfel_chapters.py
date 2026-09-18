from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

root = Path(r"c:\Users\MOHAMMED\Desktop\implementation of social media platform using odfel as a case study")
image_dir = root / "chapter3_images"
image_dir.mkdir(exist_ok=True)

def draw_box(draw, x1, y1, x2, y2, text, fill=(210, 230, 255), outline=(20, 30, 50), font_size=18):
    draw.rounded_rectangle([x1, y1, x2, y2], radius=18, fill=fill, outline=outline, width=2)
    font = ImageFont.load_default()
    lines = text.split("\n")
    line_height = font_size + 8
    total_height = len(lines) * line_height
    start_y = y1 + ((y2 - y1) - total_height) / 2
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        draw.text(((x1 + x2 - w) / 2, start_y + i * line_height), line, fill=(0, 0, 0), font=font)

# Generate use case diagram
img = Image.new("RGB", (1600, 900), (240, 245, 250))
d = ImageDraw.Draw(img)
d.text((620, 20), "Use Case Diagram", fill=(0, 0, 0), font=ImageFont.load_default())
d.ellipse((100, 250, 260, 520), fill=(215, 228, 255), outline=(40, 50, 80), width=2)
d.text((155, 370), "Student", fill=(0, 0, 0), font=ImageFont.load_default())
d.ellipse((100, 600, 260, 860), fill=(215, 228, 255), outline=(40, 50, 80), width=2)
d.text((155, 705), "Admin", fill=(0, 0, 0), font=ImageFont.load_default())
d.rounded_rectangle((420, 120, 1280, 820), radius=25, outline=(40, 70, 110), width=2, fill=(255, 255, 255))
d.text((560, 150), "ODFEL Social Media Platform", fill=(0, 0, 0), font=ImageFont.load_default())
boxes = [
    (500, 200, 770, 305, "Register/Login"),
    (820, 200, 1090, 305, "Create Profile"),
    (500, 380, 770, 495, "Create Post"),
    (820, 380, 1090, 495, "Comment/Like"),
    (500, 560, 770, 675, "Join Group"),
    (820, 560, 1090, 675, "Send Message"),
    (610, 700, 985, 785, "Manage Users\n& Content"),
]
for item in boxes:
    draw_box(d, *item)
# connectors
for x_start in (500, 820):
    d.line((x_start, 250, x_start + 60, 250), fill=(0, 0, 0), width=3)
for x in (500, 820):
    d.line((260, 385, x, 250), fill=(0, 0, 0), width=3)
    d.line((260, 710, x + 100, 740), fill=(0, 0, 0), width=3)
img.save(image_dir / "figure_3_1_use_case_diagram.png")

# Generate flowchart
img = Image.new("RGB", (1600, 980), (250, 250, 250))
d = ImageDraw.Draw(img)
boxes = [
    (640, 30, 960, 120, "Start"),
    (570, 170, 1030, 260, "Open Application"),
    (580, 330, 1020, 440, "Register or Login"),
    (510, 500, 1090, 610, "View Feed / Profile / Groups"),
    (545, 670, 1055, 780, "Create Post, Comment,\nSend Message or Upload File"),
    (660, 840, 940, 920, "End"),
]
for item in boxes:
    draw_box(d, *item, fill=(215, 240, 220), font_size=17)
for i in range(len(boxes)-1):
    x1, y1, x2, y2, _ = boxes[i]
    x3, y3, x4, y4, _ = boxes[i+1]
    mid1 = (x1 + x2) / 2
    mid2 = (x3 + x4) / 2
    d.line((mid1, y2, mid2, y3), fill=(0, 0, 0), width=3)
    d.polygon([(mid2 - 12, y3), (mid2 + 12, y3), (mid2, y3 + 20)], fill=(0, 0, 0))
img.save(image_dir / "figure_3_2_system_flowchart.png")

# Generate database design
img = Image.new("RGB", (1700, 1000), (246, 250, 255))
d = ImageDraw.Draw(img)
d.text((600, 20), "Database Design Overview", fill=(0, 0, 0), font=ImageFont.load_default())
boxes = [
    (60, 120, 430, 290, "Users\n- userId\n- fullName\n- email\n- password\n- role"),
    (460, 120, 830, 290, "Posts\n- postId\n- userId\n- content\n- imageUrl\n- createdAt"),
    (860, 120, 1230, 290, "Comments\n- commentId\n- postId\n- userId\n- message"),
    (1260, 120, 1630, 290, "Messages\n- messageId\n- senderId\n- receiverId\n- text"),
    (60, 420, 430, 610, "Groups\n- groupId\n- name\n- description\n- adminId"),
    (460, 420, 830, 610, "Resources\n- resourceId\n- title\n- type\n- fileUrl"),
    (860, 420, 1230, 610, "Notifications\n- notificationId\n- userId\n- message\n- status"),
    (1260, 420, 1630, 610, "Schedules\n- scheduleId\n- title\n- date\n- lecturer"),
]
for item in boxes:
    draw_box(d, *item, fill=(223, 236, 255), font_size=17)
for x in (430, 830, 1230):
    d.line((x, 200, x + 30, 200), fill=(0, 0, 0), width=3)
for y in (290, 610):
    d.line((245, y, 245, y + 130), fill=(0, 0, 0), width=3)
    d.line((645, y, 645, y + 130), fill=(0, 0, 0), width=3)
    d.line((1045, y, 1045, y + 130), fill=(0, 0, 0), width=3)
    d.line((1445, y, 1445, y + 130), fill=(0, 0, 0), width=3)
img.save(image_dir / "figure_3_3_database_design.png")

# Document creation

def add_text(doc, text):
    doc.add_paragraph(text)

def add_heading(doc, text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)

chapter3_paragraphs = [
    "The analysis and design phase is one of the most important stages in the development of any software system because it defines the requirements, problem scope, and technical blueprint for the final product. For the ODFEL social media platform, this phase is especially essential because the system is intended to support academic communication, digital collaboration, and the distribution of important information within an educational environment. A proper system analysis ensures that the project is planned around real user needs and institutional goals, rather than simple assumptions. It also helps to identify the activities, roles, processes, and data structures that are required to make the platform functional, secure, and sustainable.",
    "The ODFEL system is designed as a web-based social networking application that supports academic interaction, information sharing, scheduling, communication, and user management. Unlike generic social platforms, its focus is on academic collaboration, educational engagement, and resource exchange within a university or college environment. The system is built to connect students, lecturers, and administrators in a single digital platform where information can be shared promptly and organized clearly. This design improves the interaction between academic stakeholders and ensures that relevant information reaches the right people at the right time.",
    "In an educational context, communication is often fragmented because students receive updates through different sources such as notice boards, phone messages, emails, social media groups, or word-of-mouth. These methods may be helpful in some situations, but they also create delays, confusion, and loss of information. For instance, a student may miss a crucial lecture update because it was sent via a message channel that was not monitored regularly. A lecturer may struggle to share learning materials with all students because there is no centralized platform for materials and notices. This shows that a well-structured and centralized social media platform is necessary for effective academic communication.",
    "The design and planning of the proposed system consider all these challenges and attempt to create a better solution. The platform allows members of the academic community to create accounts, manage profiles, share posts, interact with groups, send messages, upload resources, and receive notifications. These features are tailored to the needs of students and workers in institutions of learning, and they improve the communication cycle significantly. By integrating all key functions into one system, the project reduces the need for multiple disconnected tools and creates an efficient digital ecosystem for academic work.",
    "The existing system in many institutions is often manual or semi-automated. It includes physical notices, class announcements, informal social media groups, and direct messages, all of which are difficult to manage and lack proper records. This causes several problems, including inconsistent information, poor communication flow, weak tracking of academic events, and increased burden on administrative staff. The result is a system that may work on a small scale but cannot effectively support a larger academic population. This form of communication does not provide the central records, user accountability, and system visibility required for modern education.",
    "The proposed platform addresses these shortcomings by introducing a central, structured, and digital communication environment. It improves the management of messages, posts, events, schedules, and learning materials while also permitting a better interactive experience. The platform enables academic information to be created, stored, retrieved, and accessed in an organized manner. Users can engage with one another, contribute ideas, update one another, and seek support without relying on scattered media forms. This makes the platform both efficient and academically useful.",
    "System analysis, therefore, does not begin with coding. It begins with understanding the environment, the problem, and the requirements. The developers identified that students needed a place for academic discussion, lecturers needed a way to distribute updates, and administrators required a tool for system oversight. These needs guided the development of the application design and its functional modules. This chapter explains what the current system lacks, what the new system will offer, and how the solution has been structured to meet the project’s goals.",
    "The proposed system is also designed with future expansion in mind. Since academic institutions continue to evolve, the platform can be updated to include more modules such as assignment management, examination timetable integration, or a student advisory service. This future-proofing is possible because the system design is modular and the database is structured for growth. The project is therefore not only a final year solution but also a foundation for further academic digital improvement. This long-term perspective is one of the strengths of the platform.",
    "The goal of system analysis is to reduce risk by defining what the system must do before any actual implementation takes place. This includes understanding the tasks users perform, the events that trigger actions, the data needed for each task, and the expected outputs produced by the system. Once these details are clear, the developer can create a design that meets user expectations. The ODFEL platform design therefore focuses on user roles, functionality, and data flow, which makes it easier to build and maintain.",
    "In summary, Chapter Three presents the analysis and design of the ODFEL social media platform and explains how the new system will improve communication and academic coordination. It covers the description of the existing system, the need for the proposed system, the planned design structure, and the model used to visually describe the application. The chapter also points to the fact that the platform is not merely a social media clone, but a purpose-built educational communication system designed to meet institutional needs.",
    "The existing system in most educational institutions remains manual and fragmented. Students often obtain academic information through face-to-face communication and scattered digital tools. This style of communication can be unreliable, especially when there are many students, timetables, and announcements to manage. Important information may be lost or delayed, and some students may never see essential updates because they are communicated in channels not accessible to everyone. This weakens trust, reduces efficiency, and limits the active participation of students in the academic community.",
    "The transition to a digital academic platform is therefore necessary. It enables institutions to centralize communication, improve transparency, and create a history of information that can be reviewed later. The ODFEL platform offers such a central structure by bringing together posts, messages, groups, resources, notification systems, and schedules in one system. With this arrangement, institutions no longer depend on multiple tools that do not cooperate with one another. Instead, users rely on a single system with standard procedures and consistent information handling.",
    "A major weakness of the existing system is the poor documentation of conversations and academic updates. When information is shared on several channels, records become disorganized and difficult to recover. This can become a serious problem during student queries, extension of deadlines, or changes in class schedules. Without a formal record, it becomes difficult to verify what was communicated and when. A centralized database, as proposed in this system, provides a solution by storing all essential academic records in an organized way.",
    "Another concern with the current method is that it does not promote collaboration among users in a structured environment. Students may form unofficial groups for assignments or messages, but these groups are outside institutional oversight and may not contain useful records. The proposed system addresses this by providing recognized academic groups where communication is visible, structured, and associated with specific academic activities. By allowing users to join and manage groups, the platform encourages learning communities and teamwork among students and lecturers.",
    "The description of the existing system therefore reflects the need for improvement. It shows that manual or informal systems are not sufficient for delivering reliable academic communication. This creates an opportunity for an integrated digital system that restructures communication around academic needs. The ODFEL social media platform is designed to respond to that need and provide a new model of communication for educational institutions.",
    "The proposed system is intended to solve these communication difficulties by providing a secure and organized web platform accessible to students, lecturers, and administrators. Users can sign up and sign in to the platform using dedicated credentials, creating a personal digital identity within the institution. Once they log in, they are able to view updates, participate in platform discussions, search for resources, and interact with academic groups. This reduces the separation between administrative information, classroom communication, and user engagement.",
    "The platform supports both direct communication and broad information sharing. Direct communication is handled through messages, while broad communication is handled through public posts and notifications. This dual structure makes the system flexible because users can choose a suitable communication method depending on the purpose of the communication. For example, a lecturer may use a public post to announce a timetable adjustment, while a student may use a message to request clarification on a topic. This variety of communication channels helps the system reflect real academic behaviour and social interaction more naturally.",
    "In the proposed platform, all major features are connected through a common application logic. The dashboard acts as the central point where users can move between feeds, profiles, messages, resources, and institutional updates. This reduces navigation complexity and ensures that users can access the information they need efficiently. The system is also built with access control in mind so that each user role has the correct level of permissions. This ensures that only authorized users can view certain activity or manage certain sections.",
    "Security is also a critical feature of the proposed system. Since the platform stores personal profiles, academic data, and communication records, it must protect user information and maintain the integrity of the system. Authentication, validation, and role-based access help to ensure that users are properly identified. File upload checks and data validation prevent the system from receiving poor-quality or unsupported content. In this way, the platform is secure, reliable, and suitable for institutional use.",
    "The design of the proposed solution therefore aims at a user-centered and service-oriented approach. It considers how students and lecturers will actually use the application, and it matches functionality to their needs. This is not a generic social platform; it is an academic communication solution. Because it includes resources, schedules, and institutional content, it can support everyday educational operations more effectively than a standard entertainment-oriented social network.",
    "The system design is composed of several connected components. These include the user interface, application modules, server logic, database layer, and communication flows. Each component is developed to handle a specific responsibility while also interacting with other components to form a cohesive whole. The user interface manages display and input, the server validates processes, the database stores records, and the modules integrate functions such as posts, messaging, resources, and notifications. This layered design ensures that the whole system is organized and easier to maintain.",
    "The design process also includes the development of system models. These models help to explain the way the system works to both technical and non-technical stakeholders. Use case diagrams are used to show the interactions between actors and the platform, while flowcharts are used to show the sequence of activities in a process. These tools are valuable because they transform abstract requirements into visual descriptions that are easier to discuss, validate, and implement. The system model of the platform is therefore an essential part of the design process.",
    "The use case model is especially important because it shows the actions each actor can perform. The student, for example, can register, log in, create a profile, post content, comment, join groups, and communicate with others. The lecturer can upload files, manage schedules, share announcements, and guide academic discussions. The administrator can manage users, monitor platform activity, and ensure system governance. This division of responsibility makes it possible to implement user permissions correctly and maintain a clear process flow.",
    "The system flowchart then shows how these functions work together in sequence. It begins with user access and authentication, then moves into the dashboard, content interaction, and resource access. Each step is tied to a decision or action, which helps to define how the system should respond under different conditions. These decision paths are important because they show the logic behind user interaction and how errors are handled in a structured way.",
    "System design also includes the way data is collected and processed. Input design determines what information is to be supplied by users, while output design identifies what the system shows back to them. Good design in both areas ensures a better relationship between user expectations and system response. For example, a user who submits a post should receive a visible confirmation that the post has been created successfully. Similarly, a user who attempts an invalid login should see a clear error message. These interactions make the system easier to understand and use.",
    "The database design is crucial because it defines how information is stored across the platform. A badly designed database can lead to duplicated records, inconsistent relationships, slower access, and greater difficulty in system maintenance. The ODFEL database is designed to organize academic and communication data in a structured way. It includes entities such as Users, Posts, Comments, Messages, Resources, Groups, Notifications, and Schedules, each linked by relationships that reflect real-world interactions within the academic environment.",
    "With such a database, data is not stored in isolation. For example, a post belongs to a user, a comment belongs to a post, a message belongs to two users, a resource belongs to a lecturer or department, and a group is associated with multiple users. These relationships support better record management and more advanced features in the future. The relational structure also allows for efficient querying, robust data integrity checks, and easier data updates. For student information systems, this is highly useful because academic records must be organized and precise.",
    "The software design decisions for the ODFEL system therefore reflect the principles of clarity, modularity, and maintainability. Each feature is designed to stand on its own but also integrate into a larger framework. This is especially valuable in a student project because it allows the system to be developed over time, with changes easily introduced after testing. The structure also makes documentation easier, since every component has a defined role and relationship with the rest of the system.",
    "Overall, Chapter Three provides the complete analysis and design foundation of the project. It demonstrates that the proposed solution is not random or superficial but is based on a clear understanding of academic communication needs, user roles, data management, and system modelling. The chapter therefore serves as a technical foundation for Chapter Four, which will focus on the actual implementation, installation, testing, and maintenance of the completed system.",
    "The system analysis stage also helps the project team to validate whether the requirements are realistic and implementable. A platform that looks attractive on the surface may fail in practice if the design is weak or if the database does not support important functions. The ODFEL project avoids this by carefully planning the user requirements, business workflow, and technical architecture before coding begins. This improves the likelihood of successful execution and reduces the risk of design-related delays during implementation.",
    "In terms of user interaction, the platform is built to support a natural flow from onboarding to academic use. A student can create an account, set up a profile, follow academic communities, view updates, and participate in discussions. A lecturer can manage the group, publish course information, and respond to student questions. An administrator can manage accounts and monitor the status of the system. This realistic engagement model makes the system valuable and practical for daily use in an academic setting.",
    "The system also provides the ability to handle different types of content, from text-based posts to media uploaded documents and images. This matters in academic settings where learning materials come in several forms. Students may need to view lecture slides, assignment briefs, PDF notes, or discussion threads. By supporting such content, the platform becomes more than a chat system; it becomes a collaborative academic hub for learning and knowledge sharing.",
    "The analysis and design chapter therefore explains not only what the system does, but how it does it. It defines user roles, data structures, workflows, database connectivity, and the logic of functional operations. This detailed planning is what helps the technical implementation proceed smoothly and efficiently. Without this stage, a project could easily become misaligned with user needs or produce a final application that is difficult to maintain and extend.",
    "The design quality of the ODFEL platform is further improved by the use of modern web technologies and modular architecture. It separates the presentation layer from the application logic and data layer, which is a common and effective approach in web development. This separation makes the project easier to debug and easier to adjust when users request new features or when the institution wants additional modules. The result is a scalable and maintainable application that reflects professional software engineering principles.",
    "The use case diagram is a visual representation of the interaction between actors and the system. It helps developers understand which tasks are allowed for each user type and how the system responds to different user actions. Because the platform covers more than one category of user, the diagram gives each user a distinct set of responsibilities while also highlighting the common features that all users share. This makes the design responsive to organisational roles within an academic institution and supports role-based access and accountability.",
    "The flowchart is equally important because it presents the logic behind the system step by step. It helps to describe the logical sequence of activities carried out in the platform. It explains the exact route each request follows from start to finish. This includes authentication, dashboard access, validation, data retrieval, storage operations, and response generation. A flowchart not only clarifies technical implementation but also helps during testing, because each step corresponds to a potential test case. This link between design and testing is one reason why the system analysis phase is so valuable.",
    "The design of the system also takes usability seriously. Users of the platform must not be confused by overloaded screens or complicated forms. The interface is designed to be clean, easy to navigate, and logically arranged. Labels, prompts, navigation menus, and clear buttons improve usability and reduce the time needed for users to learn the system. This is important because academic communities include people with different technical abilities, and the platform must be accessible to all of them.",
    "In addition, the input design includes effective validation to prevent errors. For example, empty required fields are rejected, incorrect email formats are discarded, password confirmation is checked, and file types are restricted when uploads occur. These checks improve data quality and reduce maintenance problems after deployment. The output design then confirms to users that their actions have been accepted, whether by showing a successful message, an updated dashboard, or a final output on the screen.",
    "In practical terms, the database design enables all of these activities to function smoothly. The ODFEL database is designed around the real operations of the academic community; therefore, it stores information that is needed for regular tasks rather than purely administrative data. This ensures that the system can serve both social and academic purposes in a single platform. It also makes the platform adaptable to institutional growth and development.",
    "The system design therefore results in a balanced and realistic project architecture. It supports user interactions, secures information, organizes data, and ensures that users receive timely responses. It is a product of the analysis stage in which the real-world problem and the system requirements were transformed into a technical plan. This plan is then used to implement the actual system in Chapter Four.",
    "This chapter is also valuable to the reader because it explains how the project works at a conceptual level, allowing stakeholders to understand the application before seeing the implementation. The diagrams and structure help to visualize the model and present the project in a professional academic format. By combining technical detail with understandable explanations, the chapter meets the standard of a project write-up and demonstrates the developer’s understanding of systems design.",
    "The ODFEL social media platform is therefore presented as a well-thought-out system that addresses a real problem in academic communication. It does not repeat the limitations of existing systems but instead offers a better structure for user interaction, data organization, and digital engagement. This makes it an effective solution for modern academic institutions and a meaningful ND project topic.",
    "In the design of any information system, the identification of user roles is important because different users interact with the system in different ways. In the ODFEL platform, the student, lecturer, and administrator share a common digital environment but each has a unique range of responsibilities. This role-based design ensures that system permissions are aligned with organisational structure. It also supports accountability because each action can be traced to a user category or user identity. The system therefore integrates both social and institutional functions in a controlled manner.",
    "A student may need to create a profile, apply for access, interact with classmates, and access learning materials. A lecturer may need to publish important academic notices, approve group discussions, and monitor classroom activities. An administrator may need to review user accounts, maintain records, resolve platform issues, and manage content quality. These responsibilities are not equal, but together they form a complete academic communication ecosystem. The platform’s design takes this into account and ensures that every role is supported effectively.",
    "Social features such as comment and likes encourage participation and boost the sense of belonging within an academic community. These features are especially useful on a platform designed to support student engagement. Through public posts and private messages, users can communicate both formally and informally. The design ensures that such communication is not chaotic or unstructured. Instead, it is channelled into features that can be monitored, stored, and managed by the institution.",
    "The system model also includes the retrieval and storage of information. When a student views the feed, the system pulls posts stored in the database and displays them in a friendly format. When a lecturer uploads a resource, the system stores the file and also records metadata about it. When a message is sent, the system stores it in the messages table and notifies the recipient. In each case, the model shows the same underlying process: user action, validation, data processing, storage, and output.",
    "This structured logic is what makes the platform effective and reliable. It stops the project from becoming a collection of unrelated screens and instead turns it into a coherent system with proper data flow. This is a core requirement of a well-developed software system. Each component has purpose, and the platform is therefore stronger than the sum of its individual features.",
    "The use case diagram and flowchart also help the technical writing by providing diagrams that are often required in final year projects. These visuals make the project more presentable and improve the reader’s understanding of the system. The diagrams also show that the project was planned systematically and professionally. Since the project is being submitted as a final academic write-up, such visual representations are important for making the documentation look complete and academically sound.",
    "In a student project, the design of the input and output forms should reflect practical and realistic usage patterns. The input elements should be accessible and not overloaded with unnecessary fields. The output elements should be concise and relevant, presenting only the information needed by the user. This approach reduces complexity and ensures that all pages serve a purpose. In the ODFEL platform, both input and output design follow this principle, creating a cleaner and more professional user experience.",
    "The database design extends beyond simple record storage. It represents the relationships among data entities and supports advanced operations such as search, sorting, filtering, and reporting. For example, user messages can be retrieved by date or conversation, resources can be searched by title or type, and posts can be sorted by recent activity. These data operations are useful for academic management and improve the functionality of the platform. The design therefore supports not just communication but operational efficiency.",
    "Another important reason for having a robust database structure is that the system may eventually be expanded to include more modules. Future improvements may include event management, assignment submissions, student analytics, or admin reporting. With a well-planned database and modular architecture, these features can be added without replacing the whole system. This is one of the advantages of using structured, relational database design and a layered architecture in the project.",
    "The analysis and design of the ODFEL platform are therefore rooted in a clear understanding of academic communication needs. The project is not merely a social media application but a tool for improving information flow, collaboration, and institutional engagement. It integrates important systems such as posts, communication, scheduling, resources, and access control into one environment. This approach makes it an effective and meaningful project choice for a National Diploma (ND) level final-year submission.",
    "The existing system tends to separate communication functions into multiple tools, which leads to poor organisation and poor traceability. A student may receive an announcement in class, a reminder through text messages, and a study note through a WhatsApp group, while the lecturer may also send a separate email. These channels fail to create a single source of truth for academic information. The ODFEL platform eliminates this problem by providing a single interaction environment where all communications can be centralized and stored systematically. This improves clarity and reduces confusion among users.",
    "A centralised platform also creates better opportunities for academic records. For example, the system can keep a history of posts, messages, announcements, resources, and schedule changes. These records are useful when students need to refer back to earlier updates or when administrators need to review institutional communication. Without such records, institutions lose accountability and transparency. The proposed design therefore supports both communication and administration more effectively than the existing fragmented system.",
    "In addition to the major functional modules, system design also includes the business rules that guide interactions. For example, only registered users can create a post, only authenticated users can send messages, and only administrators may be assigned full control over the platform. These rules define the system’s behavior and protect it from misuse. They also ensure that the project reflects a realistic institutional structure and not a free-for-all social environment.",
    "This level of planning is important because academic platforms must protect data and preserve trust. The system should not allow arbitrary user actions that could expose sensitive data or break the logic of the application. With proper validation and role-based access, the platform becomes more secure and more professional. The design of the ODFEL platform is therefore not just about adding features but also about creating a safe and coherent digital space for academic interaction.",
    "System design also helps in forecasting user expectations. When a user logs in, they expect a dashboard that provides the things they need quickly. When a user uploads a file, they expect a clear confirmation and a way to view the file later. When a user sends a message, they expect the recipient to receive it. These expectations are reflected in the system model and output design. This makes the platform intuitive and user-friendly.",
    "The project uses a combination of technical and design thinking to achieve this. It is not enough to write code; the developer must also understand how users think, what tasks they need to accomplish, and what information they expect to see. This user-centered focus is a critical requirement in successful information system design and is reflected throughout the ODFEL project.",
    "The analysis and design chapter is therefore a document of intellectual and technical preparation. It explains the problem, the current weakness of the system, the proposed solution, and the strategy for building it. It also introduces the design tools that will guide the implementation phase. This makes it a fundamental chapter in the academic write-up and a central reference point for the rest of the project documentation.",
    "At the end of Chapter Three, the reader should understand the architecture of the ODFEL platform, the duties of the actors, the interaction flow, and the database structure that supports the application. These details provide a complete picture of the proposed system and show that the project is technically grounded. The chapter therefore sets the stage for Chapter Four, where implementation will be explained by showing the actual deployment steps, configuration, testing methods, and maintenance approach.",
]

# Final document assembly

doc = Document()
sec = doc.sections[0]
sec.top_margin = Inches(0.8)
sec.bottom_margin = Inches(0.8)
sec.left_margin = Inches(1.0)
sec.right_margin = Inches(1.0)

# CHAPTER 3 title
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('CHAPTER THREE')
r.bold = True
r.font.name = 'Times New Roman'
r.font.size = Pt(14)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('SYSTEM ANALYSIS AND DESIGN')
r.bold = True
r.font.name = 'Times New Roman'
r.font.size = Pt(14)

headings = [
    '3.1 Introduction',
    '3.2 Description of the Existing System',
    '3.3 Description of the Proposed System',
    '3.4 System Design',
    '3.4.1 Input Design',
    '3.4.2 Output Design',
    '3.4.3 Database Design',
    '3.5 System Model',
    '3.5.1 Use Case Diagram',
    '3.5.2 System Flowchart',
]

ranges = [
    (0, 12),
    (12, 25),
    (25, 38),
    (38, 46),
    (46, 54),
    (54, 62),
    (62, 80),
    (80, 88),
    (88, 96),
    (96, 104),
]

for heading, rng in zip(headings, ranges):
    add_heading(doc, heading)
    for p_text in chapter3_paragraphs[rng[0]:rng[1]]:
        add_text(doc, p_text)

# Insert images in chapter 3 in the proper positions
p = doc.add_paragraph('Figure 3.1: Use Case Diagram for the ODFEL Social Media Platform')
doc.add_picture(str(image_dir / 'figure_3_1_use_case_diagram.png'), width=Inches(6.5))

p = doc.add_paragraph('Figure 3.2: System Flowchart for the ODFEL Social Media Platform')
doc.add_picture(str(image_dir / 'figure_3_2_system_flowchart.png'), width=Inches(6.5))

p = doc.add_paragraph('Figure 3.3: Database Design Structure for the ODFEL Social Media Platform')
doc.add_picture(str(image_dir / 'figure_3_3_database_design.png'), width=Inches(6.8))

# Add chapter 4 after chapter 3
p = doc.add_page_break()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('CHAPTER FOUR')
r.bold = True
r.font.name = 'Times New Roman'
r.font.size = Pt(14)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('SYSTEM IMPLEMENTATION AND DOCUMENTATION')
r.bold = True
r.font.name = 'Times New Roman'
r.font.size = Pt(14)

chapter4_sections = {
    '4.1 Introduction': chapter4_paragraphs[:5],
    '4.2 System Requirements': chapter4_paragraphs[5:8],
    '4.2.1 Hardware Requirements': chapter4_paragraphs[8:11],
    '4.2.2 Software Requirements': chapter4_paragraphs[11:14],
    '4.3 System Implementation': chapter4_paragraphs[14:18],
    '4.3.1 Installation Procedure': chapter4_paragraphs[18:21],
    '4.3.2 User Guide': chapter4_paragraphs[21:24],
    '4.4 System Testing': chapter4_paragraphs[24:28],
    '4.4.1 User Acceptance Testing': chapter4_paragraphs[28:32],
    '4.5 System Maintenance': chapter4_paragraphs[32:36],
}

for heading, paras in chapter4_sections.items():
    add_heading(doc, heading)
    for p_text in paras:
        add_text(doc, p_text)

outfile = root / 'ODFEL_Project_Chapters_3_4.docx'
doc.save(outfile)
print(f'Created file: {outfile}')
print('All figure images saved inside chapter3_images folder.')
