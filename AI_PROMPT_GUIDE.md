# AI Prompt Guide for ClappCode

## Overview
This guide outlines the prompting strategy for AI interactions in the job application automation system.

## Resume Parsing

### Input Format
```typescript
interface ResumeInput {
  text: string;
  format: 'pdf' | 'doc' | 'docx' | 'text';
  sections?: string[];
}
```

### System Prompt
```
You are a professional resume parser. Extract structured information from resumes while maintaining:
1. Accurate section identification
2. Consistent formatting
3. Key information preservation
4. Professional terminology
```

### Example Prompt
```
Parse the following resume into structured data including:
- Personal Information
- Work Experience
- Education
- Skills
- Projects
- Certifications

Resume Text:
[resume_content]
```

## Job Matching

### Input Format
```typescript
interface MatchInput {
  resume: ParsedResume;
  jobDescription: string;
  preferences: JobPreferences;
}
```

### System Prompt
```
You are an expert job matcher. Analyze the compatibility between resumes and job descriptions by:
1. Identifying key requirements
2. Matching skills and experience
3. Considering preferences
4. Calculating match scores
```

### Example Prompt
```
Calculate the match score between this resume and job description:
1. Identify matching skills
2. Compare experience levels
3. Consider location preferences
4. Evaluate overall fit

Resume: [parsed_resume]
Job: [job_description]
```

## Cover Letter Generation

### Input Format
```typescript
interface CoverLetterInput {
  resume: ParsedResume;
  job: JobDescription;
  style: 'professional' | 'creative' | 'technical';
}
```

### System Prompt
```
You are a professional cover letter writer. Create personalized cover letters that:
1. Match company culture
2. Highlight relevant experience
3. Show enthusiasm
4. Maintain professionalism
```

### Example Prompt
```
Generate a cover letter for this position:
1. Use the candidate's relevant experience
2. Address key job requirements
3. Match company tone
4. Include a compelling call to action

Resume: [parsed_resume]
Job: [job_description]
Company: [company_name]
```

## Resume Optimization

### Input Format
```typescript
interface OptimizationInput {
  resume: ParsedResume;
  targetJob: JobDescription;
  keywords: string[];
}
```

### System Prompt
```
You are a resume optimization expert. Enhance resumes to:
1. Target specific roles
2. Incorporate relevant keywords
3. Highlight matching skills
4. Maintain authenticity
```

### Example Prompt
```
Optimize this resume for the target position:
1. Incorporate relevant keywords
2. Emphasize matching experience
3. Adjust formatting
4. Maintain truthfulness

Resume: [current_resume]
Target Job: [job_description]
Keywords: [keyword_list]
```

## Email Templates

### Input Format
```typescript
interface EmailInput {
  type: 'welcome' | 'application' | 'follow_up';
  recipient: UserProfile;
  context: EmailContext;
}
```

### System Prompt
```
You are a professional email composer. Create emails that are:
1. Clear and concise
2. Professional in tone
3. Action-oriented
4. Properly formatted
```

### Example Prompt
```
Generate an email for this scenario:
1. Use appropriate tone
2. Include necessary information
3. Add clear call-to-action
4. Maintain branding

Type: [email_type]
Recipient: [user_profile]
Context: [email_context]
```

## Error Messages

### Input Format
```typescript
interface ErrorInput {
  code: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high';
}
```

### System Prompt
```
You are a user-friendly error message generator. Create messages that:
1. Explain the issue clearly
2. Provide solution steps
3. Use appropriate tone
4. Maintain user confidence
```

### Example Prompt
```
Generate a user-friendly error message:
1. Explain what happened
2. Suggest next steps
3. Use appropriate tone
4. Provide support options

Error: [error_code]
Context: [error_context]
Severity: [error_severity]
```

## Best Practices

### General Guidelines
1. Be specific and detailed
2. Use consistent formatting
3. Include examples
4. Maintain professional tone

### Response Format
1. Clear structure
2. Consistent sections
3. Actionable items
4. Error handling

### Context Preservation
1. Maintain user preferences
2. Consider job requirements
3. Respect privacy
4. Follow brand guidelines

## Version Control
- Version: 1.0.0
- Last Updated: 2024-02-14
- Status: Production