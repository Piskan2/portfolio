export interface Profile {
  name: string;
  role: string;
  currentCompany: string;
  location: string;
  yearsExperience: string;
  careerStart: string;
  summary: string[];
  education: { degree: string; institution: string; years: string }[];
}

export interface Project {
  title: string;
  company: string;
  period: string;
  description: string;
  stack: string[];
  source: string;
}

export interface Writing {
  title: string;
  date: string;
  excerpt: string;
  href: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  period: string;
  location: string;
  website?: string;
  description: string;
  achievements: string[];
  techStack: string[];
}

export interface Skill {
  name: string;
  primary?: boolean;
}

export interface SkillGroup {
  title: string;
  skills: Skill[];
}

export interface Cert {
  name: string;
  issuer: string;
}

export interface Contact {
  linkedin: string;
  label: string;
}

export const profile: Profile = {
  name: 'Petr Novák',
  role: 'Full Stack Engineer & AI Specialist',
  currentCompany: 'Inflection AI',
  location: 'Prague, Czech Republic',
  yearsExperience: '9+',
  careerStart: '2016-01',
  summary: [
    "I'm a Full Stack Engineer currently at Inflection AI, where I build and maintain the infrastructure that powers production AI agent systems. My work sits at the intersection of backend reliability, LLM tooling, and developer experience.",
    'My background spans 9+ years across startups and scale-ups — from early-stage product integrations to high-traffic distributed systems. I have a deep affinity for clean architecture, async-first design, and shipping systems that genuinely hold up under load.',
    "Outside of work I explore open-source AI tooling and keep a close eye on how developer tooling is evolving. I'm especially interested in system design, reliability, and the kind of engineering decisions that make complex systems feel simple to use."
  ],
  education: [
    {
      degree: 'Ing. Applied Informatics',
      institution: 'Prague University of Economics and Business',
      years: '2019–2021'
    },
    {
      degree: 'Bc. Information Technology',
      institution: 'University of Pardubice',
      years: '2014–2019'
    }
  ]
}

export const contact: Contact = {
  linkedin: 'https://linkedin.com/in/pe-nov',
  label: 'linkedin.com/in/pe-nov'
}

export const certs: Cert[] = [
  {
    name: 'CCNA 1–4 Routing & Switching',
    issuer: 'Cisco'
  }
]

export const writing: Writing[] = []

export const projects: Project[] = [
  {
    title: 'Enterprise AI Chat Interface',
    company: 'Inflection AI',
    period: 'Nov 2024 – Present',
    description:
      'Enterprise chat interface for an AI platform supporting secure collaborative interactions. It forms the user-facing layer of Inflection AI’s production AI agent infrastructure.',
    stack: ['Python', 'React', 'Azure Entra ID', 'Kubernetes', 'CI/CD'],
    source: 'portfolio/src/components/ExperienceSection.tsx:24'
  },
  {
    title: 'Multi-Agent Orchestration Backend',
    company: 'Inflection AI',
    period: 'Nov 2024 – Present',
    description:
      'AI backend acting as an orchestration layer over multiple specialized agents. It resolves complex queries by coordinating specialized agents within production AI agent infrastructure.',
    stack: ['Python', 'React', 'Azure Entra ID', 'Kubernetes', 'CI/CD'],
    source: 'portfolio/src/components/ExperienceSection.tsx:25'
  },
  {
    title: 'Anomaly Detection Platform',
    company: 'BoostKPI',
    period: 'Oct 2023 – Nov 2024',
    description:
      'Anomaly detection system for BigQuery datasets, covering full-stack architecture and data integrations. It was improved with 10+ integrations for external data sources and a company-wide migration from EmberJS to React.',
    stack: ['React', 'BigQuery', 'Kubernetes', 'GitHub Actions', 'TypeScript'],
    source: 'portfolio/src/components/ExperienceSection.tsx:37–42'
  },
  {
    title: 'B2B Proposal Management App',
    company: 'T-Mobile Czech Republic',
    period: 'May 2023 – Oct 2023',
    description:
      'Advanced B2B web application for business proposal management at T-Mobile Czech Republic. It included end-to-end DevOps configuration for Jenkins and GitLab pipelines, including the migration of core DevOps processes from Jenkins to GitLab CI/CD.',
    stack: ['React', 'Node.js', 'Jenkins', 'GitLab CI/CD', 'Java'],
    source: 'portfolio/src/components/ExperienceSection.tsx:51–55'
  }
]

export const experience: ExperienceEntry[] = [
  {
    company: 'Inflection AI',
    role: 'Full Stack Engineer',
    period: 'Nov 2024 – Present',
    location: 'Prague',
    website: 'https://inflection.ai/',
    description:
      'Building production AI agent infrastructure: anomaly detection in external data lakes, system architecture, full-stack development, CI/CD, Kubernetes, advanced AI agents with Python.',
    achievements: [
      'Designed and implemented end-to-end chat interface for enterprise AI platform with secure collaborative interactions',
      'Built AI backend as orchestration layer over multiple specialized agents for complex query resolution',
      'Integrated Azure Entra ID for centralized identity and access management',
      'Improved frontend scalability with reusable React components and refactored legacy code'
    ],
    techStack: ['Python', 'React', 'Azure Entra ID', 'Kubernetes', 'CI/CD']
  },
  {
    company: 'BoostKPI',
    role: 'Full Stack Engineer',
    period: 'Oct 2023 – Nov 2024',
    location: 'Prague',
    website: 'https://boostkpi.com/',
    description:
      'Improved anomaly detection system for BigQuery datasets, managing full-stack architecture and data integrations.',
    achievements: [
      'Led company-wide migration from EmberJS to React',
      'Enhanced CI/CD pipelines using Kubernetes and GitHub Actions',
      'Engineered 10+ integrations with external data sources'
    ],
    techStack: ['React', 'BigQuery', 'Kubernetes', 'GitHub Actions', 'TypeScript']
  },
  {
    company: 'T-Mobile Czech Republic',
    role: 'Full Stack Engineer',
    period: 'May 2023 – Oct 2023',
    location: 'Prague',
    website: 'https://www.t-mobile.cz/info/en',
    description:
      'Developed advanced B2B web application for business proposal management; owned end-to-end DevOps configuration for Jenkins and GitLab pipelines.',
    achievements: ['Led migration of core DevOps processes from Jenkins to GitLab CI/CD'],
    techStack: ['React', 'Node.js', 'Jenkins', 'GitLab CI/CD', 'Java']
  },
  {
    company: 'BoostKPI (Blindspot Solutions)',
    role: 'Full Stack Engineer',
    period: 'Apr 2021 – May 2023',
    location: 'Prague',
    website: 'https://blindspot.ai/',
    description:
      'Developed anomaly detection system for BigQuery, improved notification platform, and built integrations for external data warehouses.',
    achievements: [
      'Developed on-demand reservation system integrated into core service, cutting costs by 50%',
      'Designed notification system delivering updates via Email, Slack, and Microsoft Teams'
    ],
    techStack: ['Python', 'BigQuery', 'Kubernetes', 'Slack API', 'Email APIs']
  },
  {
    company: 'Citrix',
    role: 'Java Backend Engineer',
    period: 'Sep 2020 – Mar 2021',
    location: 'Prague',
    website: 'https://www.citrix.com/',
    description: 'Maintained and improved SOAP and REST API connectors for cloud services in Citrix Workspace.',
    achievements: ['Enhanced SOAP/REST API connectors for cloud services in Citrix Workspace'],
    techStack: ['Java', 'Spring Boot', 'SOAP', 'REST', 'AWS']
  },
  {
    company: 'GEM System – Dr.Max',
    role: 'Java Backend Engineer',
    period: 'Feb 2020 – Sep 2020',
    location: 'Prague',
    website: 'https://www.gemsystem.cz/',
    description:
      'Improved core integration platform enabling communication for pharmacies, stock, e-shop, and logistics across Europe.',
    achievements: ['Enhanced core integration platform for pharmacy and logistics systems across Europe'],
    techStack: ['Java', 'Spring Boot', 'PL/SQL', 'REST API']
  },
  {
    company: 'Citrix',
    role: 'Java Backend Engineer',
    period: 'Aug 2019 – Jan 2020',
    location: 'Prague',
    website: 'https://www.citrix.com/',
    description: 'Maintained SOAP and REST connectors for cloud services in Citrix Workspace software.',
    achievements: ['Maintained and improved SOAP/REST connectors for Citrix Workspace'],
    techStack: ['Java', 'Spring Boot', 'SOAP', 'REST']
  },
  {
    company: 'Travel Agency Fischer',
    role: 'Java Backend Engineer',
    period: 'Sep 2018 – Jul 2019',
    location: 'Prague',
    description:
      "Developed end-to-end integration with partner travel agencies into CK Fischer's Spring-based system.",
    achievements: [
      'Designed microservices-based connectors integrating SOAP and REST APIs with partner agencies',
      'Automated data exchange, improving efficiency and revenue'
    ],
    techStack: ['Java', 'Spring Boot', 'SOAP', 'REST', 'Microservices']
  },
  {
    company: 'Unicorn Systems a.s.',
    role: 'Java Backend Engineer',
    period: 'Jan 2016 – Jun 2017',
    location: 'Hradec Králové',
    website: 'https://unicornsystems.eu/',
    description:
      'Developed price coupling system for short-term electricity markets across 4MMC region and Central Europe.',
    achievements: ['Developed and maintained price coupling system for European electricity markets'],
    techStack: ['Java', 'Spring', 'PL/SQL', 'SQL']
  }
]

export const displayedExperienceCount = 3

export const skillGroups: SkillGroup[] = [
  {
    title: 'Backend & Cloud',
    skills: [
      { name: 'Java / Spring Boot', primary: true },
      { name: 'Python', primary: true },
      { name: 'Node.js' },
      { name: 'RESTful APIs' },
      { name: 'Microservices' },
      { name: 'AWS & GCP' }
    ]
  },
  {
    title: 'Frontend',
    skills: [
      { name: 'React / Next.js', primary: true },
      { name: 'TypeScript', primary: true },
      { name: 'Ember.js' },
      { name: 'Tailwind CSS' },
      { name: 'HTML5 / CSS3' }
    ]
  },
  {
    title: 'Databases',
    skills: [
      { name: 'PostgreSQL / MySQL', primary: true },
      { name: 'Oracle SQL / PL-SQL' },
      { name: 'MongoDB' },
      { name: 'Redis' },
      { name: 'BigQuery' }
    ]
  },
  {
    title: 'DevOps & CI/CD',
    skills: [
      { name: 'Docker / Kubernetes', primary: true },
      { name: 'GitHub Actions / GitLab CI' },
      { name: 'Jenkins' },
      { name: 'Linux Operations' }
    ]
  },
  {
    title: 'AI & Data',
    skills: [
      { name: 'AI Agent Orchestration', primary: true },
      { name: 'LangChain' },
      { name: 'Anomaly Detection' },
      { name: 'Data Pipeline Design' }
    ]
  },
  {
    title: 'Tools & Platforms',
    skills: [
      { name: 'Git / SVN' },
      { name: 'Jira / Confluence' },
      { name: 'SonarQube' },
      { name: 'Networking (CCNA)' }
    ]
  }
]
