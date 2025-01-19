import React from 'react';
import { Download, Code, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ParsedResumeDisplayProps {
  parsedContent: any;
  parsingError?: string;
  isAffinda: boolean;
}

export default function ParsedResumeDisplay({ parsedContent, parsingError, isAffinda }: ParsedResumeDisplayProps) {
  const handleDownloadJSON = () => {
    try {
      const dataStr = JSON.stringify(parsedContent, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'parsed-resume.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to download parsed resume');
    }
  };

  if (parsingError) {
    return (
      <div className="mt-4 bg-red-500 bg-opacity-10 rounded-lg p-4 border border-red-500">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Resume Parsing Failed</p>
            <p className="text-sm mt-1">{parsingError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!parsedContent) {
    return null;
  }

  return (
    <div className="mt-4 bg-cyber-darker rounded-lg p-4 border border-neon-cyan">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-neon-cyan" />
          <div>
            <h3 className="text-white font-medium">Parsed Resume Data</h3>
            <p className="text-xs text-gray-400">
              {isAffinda ? 'Parsed by Affinda' : 'Parsed using local parser'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAffinda && (
            <div className="flex items-center gap-1 text-green-500 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Professional Parser</span>
            </div>
          )}
          <button
            onClick={handleDownloadJSON}
            className="p-2 text-neon-cyan hover:text-neon-pink transition-colors"
            title="Download JSON"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Skills */}
        {parsedContent.skills?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-neon-cyan mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {parsedContent.skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-cyber-light rounded-full text-white border border-neon-pink"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {parsedContent.experience?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-neon-cyan mb-2">Experience</h4>
            <div className="space-y-3">
              {parsedContent.experience.map((exp: any, index: number) => (
                <div key={index} className="border-l-2 border-neon-pink pl-4">
                  <h5 className="text-white font-medium">{exp.title}</h5>
                  <p className="text-sm text-gray-400">{exp.company}</p>
                  <p className="text-sm text-gray-400">{exp.duration}</p>
                  <p className="text-sm text-gray-300 mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {parsedContent.education?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-neon-cyan mb-2">Education</h4>
            <div className="space-y-3">
              {parsedContent.education.map((edu: any, index: number) => (
                <div key={index} className="border-l-2 border-neon-pink pl-4">
                  <h5 className="text-white font-medium">{edu.degree}</h5>
                  <p className="text-sm text-gray-400">{edu.school}</p>
                  <p className="text-sm text-gray-400">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parser Info */}
        <div className="mt-6 pt-4 border-t border-cyber-light">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Parser: {isAffinda ? 'Affinda Professional' : 'Local Fallback'}</span>
            <span>Sections: {Object.keys(parsedContent).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}