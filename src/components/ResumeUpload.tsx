import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { ResumeParserService } from '../lib/resumeParser';
import type { ParsedResume } from '../lib/resumeParser';

export default function ResumeUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // 1. Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(`${Date.now()}-${file.name}`, file);

      if (uploadError) throw uploadError;

      // 2. Parse with OpenResume
      const parser = ResumeParserService.getInstance();
      const parsed = await parser.parseResume(file);
      
      // 3. Validate parsed resume
      const isValid = await parser.validateResume(parsed);
      if (!isValid) {
        throw new Error('Resume validation failed. Please check the format.');
      }

      // 4. Store parsed data
      const { error: storeError } = await supabase
        .from('parsed_resumes')
        .insert({
          file_path: uploadData.path,
          parsed_data: parsed
        });

      if (storeError) throw storeError;

      setParsedResume(parsed);
      toast.success('Resume uploaded and parsed successfully');

    } catch (error: any) {
      console.error('Resume upload failed:', error);
      toast.error(error.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
      
      <div className="space-y-4">
        <label className="block">
          <span className="sr-only">Upload resume</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </label>

        {isUploading && (
          <div className="text-sm text-gray-500">
            Uploading and parsing resume...
          </div>
        )}

        {parsedResume && (
          <div className="mt-4 space-y-4">
            <h3 className="font-medium">Parsed Resume Data:</h3>
            
            {/* Basic Info */}
            <div>
              <h4 className="font-medium">Basic Information</h4>
              <p>{parsedResume.basics.name}</p>
              <p>{parsedResume.basics.email}</p>
              {parsedResume.basics.phone && <p>{parsedResume.basics.phone}</p>}
            </div>

            {/* Skills */}
            <div>
              <h4 className="font-medium">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {parsedResume.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Work Experience */}
            <div>
              <h4 className="font-medium">Work Experience</h4>
              <div className="space-y-2">
                {parsedResume.work.map((work, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <p className="font-medium">{work.position}</p>
                    <p className="text-sm text-gray-600">{work.company}</p>
                    <p className="text-sm text-gray-500">
                      {work.startDate} - {work.endDate || 'Present'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <h4 className="font-medium">Education</h4>
              <div className="space-y-2">
                {parsedResume.education.map((edu, index) => (
                  <div key={index}>
                    <p className="font-medium">{edu.institution}</p>
                    <p className="text-sm text-gray-600">
                      {edu.studyType} in {edu.area}
                    </p>
                    <p className="text-sm text-gray-500">
                      {edu.startDate} - {edu.endDate || 'Present'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}