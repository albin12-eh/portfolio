import { SkillCategory, ProjectItem, ExperienceItem } from "./types";

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Frontend",
    items: [
      { name: "React", percentage: 85 },
      { name: "CSS & Tailwind CSS", percentage: 82 },
      { name: "Flutter", percentage: 80 }
    ]
  },
  {
    title: "Backend",
    items: [
      { name: "Node.js", percentage: 82 },
      { name: "Express.js", percentage: 78 },
      { name: "MySQL", percentage: 75 }
    ]
  },
  {
    title: "Tooling",
    items: [
      { name: "GitHub", percentage: 88 },
      { name: "Git", percentage: 85 },
      { name: "AWS", percentage: 75 }
    ]
  }
];

export const PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    num: "01",
    title: "Shopee",
    status: "live",
    description: "Developed a Flutter-based supermarket application with Firebase Authentication, Firestore, real-time product management, shopping cart, and order checkout functionality.",
    tags: ["Flutter", "Firebase", "Firestore"],
    liveUrl: "#",
    sourceUrl: "#"
  },
  {
    id: "proj-2",
    num: "02",
    title: "CareerConnect",
    status: "live",
    description: "Built a full-stack job portal using React and Node.js, enabling users to search and apply for jobs while recruiters can post and manage job openings.",
    tags: ["React", "Node.js", "MongoDB"],
    liveUrl: "#",
    sourceUrl: "#"
  },
  {
    id: "proj-3",
    num: "03",
    title: "SwiftChat",
    status: "live",
    description: "Built a real-time chat application using React and Node.js, enabling users to exchange instant messages with live updates powered by Socket.io.",
    tags: ["React", "Node.js", "Socket.io"],
    notesUrl: "#",
    sourceUrl: "#"
  },
  {
    id: "proj-4",
    num: "04",
    title: "Expense Tracker",
    status: "in progress",
    description: "Built a full-stack expense tracker using React and Node.js, allowing users to record income and expenses, categorize transactions, and track their financial activity.",
    tags: ["React", "Node.js", "MongoDB"],
    liveUrl: "#",
    sourceUrl: "#"
  }
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: "exp-1",
    hash: "#8b5cf6",
    date: "2025 - 2027",
    title: "Master of Computer Applications (MCA)",
    org: "Mar Thoma Institute of Information Technology, Ayur (MIIT)",
    description: "Pursuing advanced studies in computer applications with a focus on software development, databases, and modern web technologies."
  },
  {
    id: "exp-2",
    hash: "#7c30bd",
    date: "2026 — 1 months",
    title: "AWS Cloud Practitioner Intern",
    org: "Trinity Technologies",
    description: "Learned the fundamentals of AWS cloud services, including EC2, S3, IAM, and VPC. Created and managed basic cloud resources, practiced secure access management, and gained hands-on experience with cloud deployment and monitoring while following AWS best practices."
  },
  {
    id: "exp-3",
    hash: "#561e88",
    date: "2025 — 6 months",
    title: "Full Stack Development Intern",
    org: "Mashup Stack",
    description: "Built 2 internal tools using React and Node.js. Worked directly with a senior engineer to learn production practices, code review, and Git workflows."
  },
  {
    id: "exp-4",
    hash: "#a1e92f",
    date: "2021 - 2024",
    title: "Bachelor of Computer Applications (BCA)",
    org: "Don Bosco College, Kottiyam",
    description: "Graduated in 2024. Final-year project: a full-stack web app, covering both frontend and backend."
  },
  {
    id: "exp-5",
    hash: "#87c91d",
    date: "2019 - 2021",
    title: "Higher Secondary (Plus Two)",
    org: "Vivekananda Higher Secondary School, Poredom",
    description: "Completed higher secondary education with a strong foundation in academics and preparation for higher studies."
  }
];
