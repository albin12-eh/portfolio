export interface SkillItem {
  name: string;
  percentage: number;
}

export interface SkillCategory {
  title: string;
  items: SkillItem[];
}

export interface ProjectItem {
  id: string;
  num: string;
  title: string;
  status: "live" | "in progress";
  description: string;
  tags: string[];
  liveUrl?: string;
  sourceUrl?: string;
  notesUrl?: string;
}

export interface ExperienceItem {
  id: string;
  hash: string;
  date: string;
  title: string;
  org: string;
  description: string;
}
