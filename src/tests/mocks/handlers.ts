import { rest } from 'msw';

export const handlers = [
  rest.post('https://api.openai.com/v1/chat/completions', (req, res, ctx) => {
    return res(
      ctx.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
                skills: ['JavaScript', 'React'],
                experience: [{
                  title: 'Developer',
                  company: 'Tech Co',
                  duration: '2020-2024',
                  description: 'Full stack development'
                }],
                education: [{
                  degree: 'BS Computer Science',
                  school: 'University',
                  year: '2020'
                }]
              })
            }
          }
        ]
      })
    );
  }),

  rest.post('https://api.affinda.com/v3/resumes', (req, res, ctx) => {
    return res(
      ctx.json({
        data: {
          skills: ['JavaScript', 'React'],
          workExperience: [{
            jobTitle: 'Developer',
            organization: 'Tech Co',
            dates: {
              startDate: '2020-01',
              endDate: '2024-01'
            },
            jobDescription: 'Full stack development'
          }],
          education: [{
            accreditation: {
              education: 'BS Computer Science'
            },
            organization: 'University',
            dates: {
              completionDate: '2020'
            }
          }]
        }
      })
    );
  }),
];