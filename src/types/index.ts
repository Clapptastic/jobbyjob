export interface JobPreferences {
  keywords: string[];
  zipCode?: string;
  radius?: number;
  remote: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  resume?: {
    url: string;
    parsedContent: string;
  };
  linkedinUrl?: string;
  personalWebsite?: string;
  jobPreferences?: JobPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  requirements: string[];
  posted: string;
  source: string;
  sourceUrl?: string;
  active: boolean;
  matchScore?: number;
  matchReasons?: string[];
  createdAt: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  jobId: string;
  status: 'applied' | 'contacted' | 'rejected' | 'accepted';
  appliedAt: string;
  lastContactAt?: string;
  customizedResume?: string;
  notes?: string;
  createdAt: string;
  job?: Job;
}