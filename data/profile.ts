export const profile = {
  name: "Muhammad Faruq Arkaan",
  nickname: "Arkaan",
  role: "IT Support | Web Developer | Graphic Designer",
  tagline: "A fresh graduate eager to grow at the intersection of IT Support, Web Development, and Graphic Design",
  description:
    "A fresh Computer Science graduate from Universitas Lampung with a passion spanning IT support, web development, and graphic design. I enjoy exploring new technologies, solving technical problems, and turning ideas into clean, functional digital solutions and I'm currently looking for the right opportunity to grow and make a meaningful contribution.",
  avatarUrl: "/prof.webp",
  aboutImage: "/ab.webp",
  resumeUrl: "/CV_Muhammad Faruq Arkaan.pdf",
  location: "Bandar Lampung, Indonesia",
  socials: [
    { name: "LinkedIn", url: "https://www.linkedin.com/in/muhammad-faruq-arkaan-677b46293/", icon: "linkedin" },
    { name: "GitHub", url: "https://github.com/Arkaan16", icon: "github" },
    { name: "Instagram", url: "https://www.instagram.com/faruqarkaann/", icon: "instagram" },
    { name: "Spotify", url: "https://open.spotify.com/user/31ppnsf6kg2vxh5rcfc3gxn4i7au?si=51994cb63d6d416e", icon: "spotify" },
    { name: "Email", url: "mailto:muhammadfaruqarkaan16@gmail.com", icon: "email" },
  ],
};

export const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Journey", href: "#timeline" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
] as const;

export const education = [
  {
    id: 1,
    institution: "Universitas Lampung",
    degree: "Bachelor of Computer Science",
    field: "Computer Science",
    period: "2022 - 2026",
    gpa: "3.91",
  },
  {
    id: 2,
    institution: "SMA Perintis 2 Bandar Lampung",
    degree: "Science Major",
    field: "Natural Sciences",
    period: "2019 - 2022",
    score: "85.78",
  },
];

export const organizations = [
  {
    id: 1,
    name: "Himpunan Mahasiswa Jurusan Ilmu Komputer",
    role: "Media and Information Division Member",
    period: "February 2024 - December 2024",
    description:
      "Served as a staff member of the Media and Information Division, designing 20+ monthly recap feeds to boost social media engagement. Led the HIMAKOM website team, managing content updates and a full website redesign. Served as Web Division Coordinator for The Computer Science Showdown, HIMAKOM's flagship annual event.",
  },
];

export const experience = [
  {
    id: 1,
    company: "PT. Bukit Asam Tbk Tarahan Port",
    role: "Full Stack Developer (Research Project)",
    period: "December 2025 - February 2026",
    description:
      "Designed and developed SIMA (Sistem Manajemen Aset), a web-based asset management system for company assets using Laravel 12 and Livewire 3 with a reactive, SPA-like user experience styled with Tailwind CSS v4. Implemented strict Role-Based Access Control (RBAC) to separate Administrator and Employee permissions, ensuring data integrity and operational security. Built full CRUD functionality for asset, user, and master data management using Laravel Policies (AssetPolicy, MaintenancePolicy) and middleware-based authorization. Developed role-based dashboards with global statistics for Admins and personalized task views for Employees, along with QR code scanning for asset tracking and a tiered reporting system.",
  },
  {
    id: 2,
    company: "PT. Bukit Asam Tbk Tarahan Port",
    role: "IT Staff",
    period: "February 2025 - June 2025",
    description:
      "Performed installation, configuration, and maintenance of network infrastructure within the port's operational environment. Assisted in hardware and software troubleshooting to support smooth daily operations. Built the backend of an E-Logbook system using Laravel 10 and MySQL, fully digitalizing guest record-keeping to improve efficiency and security. Developed a secure RBAC (Role-Based Access Control) system for 4 user roles with real-time notifications to speed up visitor verification.",
  },
  {
    id: 3,
    company: "Universitas Lampung",
    role: "Teaching Assistant — Artificial Intelligence",
    period: "February 2025 - June 2025",
    description:
      "Assisted students in Machine Learning, NLP, Deep Learning, and computational logic concepts.",
  },
  {
    id: 4,
    company: "Himpunan Mahasiswa Ilmu Komputer",
    role: "Website Coordinator",
    period: "June 2024 - August 2024",
    description:
      "Led the development of the web application for The Computer Science Showdown (CSS), an annual competition event organized by the Computer Science Student Association (Himpunan Mahasiswa Ilmu Komputer). Coordinated the website team and streamlined the registration process for participants by building a platform to manage event sign-ups, participant details, and competition schedules. Enhanced the overall experience for both competitors and organizers by leveraging modern web technologies, ensuring smooth event management and a seamless, user-friendly registration flow.",
  },
  {
    id: 5,
    company: "Universitas Lampung",
    role: "Teaching Assistant — Multimedia",
    period: "August 2024 - December 2024",
    description:
      "Assisted students in mastering multimedia software including Adobe Photoshop, Blender, CorelDRAW, Adobe Premiere, and Pivot Animator for design and animation projects.",
  },
];

export const projects = [
  {
    id: 1,
    title: "Computer Science Showdown",
    description: "A web application for managing competition registration, participant details, and event schedules for an annual Computer Science Student Association event.",
    thumbnail: "/projects/1736056777951.jpg",
    tags: ["Next.js", "React.js", "Tailwind CSS", "Prisma ORM", "Google API", "PostgreSQL"],
    sourceUrl: "https://github.com/vexra/css",
  },
  {
    id: 2,
    title: "SIG Lampung Selatan",
    description: "A Geographic Information System (GIS) web application for analyzing the distribution of hospitals in South Lampung, featuring interactive maps for exploring hospital locations by region and distance to support better healthcare accessibility decisions.",
    thumbnail: "/projects/1736055584675.jpg",
    tags: ["Laravel", "Tailwind CSS", "Leaflet.js", "JSON", "JavaScript"],
    sourceUrl: "https://github.com/Arkaan16/SIG-Analisis-Sebaran-Rumah-Sakit-Kabupaten-Lampung-Selatan",
  },
  {
    id: 3,
    title: "ExpertSkinCF",
    description: "A web-based expert system that helps women diagnose skin conditions and receive personalized aesthetic care recommendations, using the Certainty Factor method to deliver accurate and reliable diagnoses based on user-provided symptoms.",
    thumbnail: "/projects/1736174349635.jpg",
    tags: ["Laravel", "Tailwind CSS", "PHP", "MySQL", "Chatbot"],
    sourceUrl: "https://github.com/rifqee23/ExpertSkinCF",
  },
  {
    id: 4,
    title: "SIMA - Sistem Manajemen Aset",
    description: "A web-based asset management system for PT Bukit Asam Tbk, implementing strict Role-Based Access Control (RBAC) to separate Administrator and Employee permissions. Features a reactive, SPA-like interface with layered security using Laravel Policies, middleware, and role-based Livewire component authorization, along with QR code scanning for assets and tiered reporting.",
    thumbnail: "/projects/sima.png",
    tags: ["Laravel 12", "Livewire 3", "Tailwind CSS v4", "MySQL", "Proxmox", "Nginx"],
    sourceUrl: "https://gitlab.tarahanport.id/Arkaan16/sima",
  },
  {
    id: 5,
    title: "E-Logbook PT Bukit Asam Tbk Tarahan Port",
    description: "A web-based application that digitalizes and automates guest logbook management at PT Bukit Asam Tbk Tarahan Port Unit, replacing the manual recording system to improve efficiency, security, and accuracy. Implements role-based workflows for Admin, Security, Receptionist, and Guest with real-time notifications for guest verification, entry/departure confirmation, and Excel report generation.",
    thumbnail: "/projects/el.jpg",
    tags: ["Laravel 10", "Tailwind CSS", "MySQL", "Laravel Sanctum"],
    sourceUrl: "https://gitlab.tarahanport.id/Arkaan16/e-logbook-bukitasam-peltar",
  },
];

export const tools = [
  { name: "VS Code", icon: "vscode" },
  { name: "Git", icon: "git" },
  { name: "GitHub", icon: "github" },
  { name: "GitLab", icon: "gitlab" },
  { name: "Postman", icon: "postman" },
  { name: "Figma", icon: "figma" },
  { name: "Adobe Photoshop", icon: "adobephotoshop" },
  { name: "Canva", icon: "canva" },
  { name: "Laragon", icon: "laragon" },
  { name: "Vercel", icon: "vercel" },
];

export const hardSkills = [
  { name: "Laravel", level: 80 },
  { name: "React.js / Next.js", level: 50 },
  { name: "Livewire", level: 80 },
  { name: "Tailwind CSS", level: 80 },
  { name: "JavaScript / TypeScript", level: 50 },
  { name: "MySQL", level: 80 },
  { name: "Git & Version Control", level: 80 },
  { name: "Network Administration", level: 30 },
];

export const softSkills = [
  "Communication",
  "Teamwork",
  "Leadership",
  "Problem Solving",
  "Time Management",
  "Adaptability",
  "Creativity",
  "Mentoring & Teaching",
];

export const designProjects = [
  { id: 1, title: "Brand Identity", image: "/designs/a.webp", width: 4940, height: 2707, wide: true },
  { id: 2, title: "UI Design", image: "/designs/b.webp", width: 1920, height: 1080, wide: true },
  { id: 3, title: "Poster", image: "/designs/c.webp", width: 1080, height: 1350, wide: false },
  {
    id: 4,
    title: "Illustration",
    image: "/designs/gfx ditt Copy 2 [F773FE8].webp",
    width: 1080,
    height: 1350,
    wide: false,
  },
  {
    id: 5,
    title: "Packaging",
    image: "/designs/Project [1FAD9C7].webp",
    width: 1080,
    height: 1080,
    wide: false,
  },
  {
    id: 6,
    title: "Social Media",
    image: "/designs/Project [2F46939].webp",
    width: 1080,
    height: 1080,
    wide: false,
  },
  {
    id: 7,
    title: "Design work 07",
    image: "/designs/Project [6E4B937].webp",
    width: 2560,
    height: 1440,
    wide: true,
  },
  { id: 8, title: "Design work 08", image: "/designs/p.webp", width: 1080, height: 1074, wide: false },
  { id: 9, title: "Design work 09", image: "/designs/k.webp", width: 1080, height: 1131, wide: false },
  {
    id: 10,
    title: "Design work 10",
    image: "/designs/Project 12 Copy [C4FC243].webp",
    width: 1080,
    height: 1350,
    wide: false,
  },
  {
    id: 11,
    title: "Design work 11",
    image: "/designs/Project 13 [77ACC14].webp",
    width: 1080,
    height: 1350,
    wide: false,
  },
  {
    id: 12,
    title: "Design work 12",
    image: "/designs/Project 20 Copy [EE54AC3].webp",
    width: 736,
    height: 981,
    wide: false,
  },
  {
    id: 13,
    title: "Design work 13",
    image: "/designs/Project 29 [60D8A9C].webp",
    width: 1080,
    height: 1080,
    wide: false,
  },
  {
    id: 14,
    title: "Design work 14",
    image: "/designs/Project Copy 2 [6C10CDF].webp",
    width: 1440,
    height: 1800,
    wide: false,
  },
  { id: 15, title: "Design work 15", image: "/designs/f.webp", width: 2100, height: 2790, wide: false },
];

export const contactEmail = "muhammadfaruqarkaan16@gmail.com";
