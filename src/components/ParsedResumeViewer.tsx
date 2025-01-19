import React from 'react';
import { FileText, Download, Code } from 'lucide-react';
import { toast } from '../lib/toast';

interface ParsedResumeViewerProps {
  content: any;
  onClose: () => void;
}

export default function ParsedResumeViewer({ content, onClose }: ParsedResumeViewerProps) {
  const handleDownload = () => {
    try {
      const dataStr = JSON.stringify(content, null, 2);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-cyber-light rounded-lg p-6 border border-neon-pink shadow-neon-glow max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-neon-cyan" />
            <h2 className="text-lg font-medium text-white">Parsed Resume</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-neon-cyan hover:text-neon-pink transition-colors"
              title="Download JSON"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Skills */}
          {content.skills?.length > 0 && (
            <div>
              <h3 className="text-neon-cyan font-medium mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {content.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-cyber-darker rounded-full text-sm text-white border border-neon-pink"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {content.experience?.length > 0 && (
            <div>
              <h3 className="text-neon-cyan font-medium mb-2">Experience</h3>
              <div className="space-y-4">
                {content.experience.map((exp: any, index: number) => (
                  <div key={index} className="border-l-2 border-neon-pink pl-4">
                    <h4 className="text-white font-medium">{exp.title}</h4>
                    <p className="text-sm text-gray-400">{exp.company}</p>
                    <p className="text-sm text-gray-400">{exp.duration}</p>
                    <p className="text-sm text-gray-300 mt-1">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {content.education?.length > 0 && (
            <div>
              <h3 className="text-neon-cyan font-medium mb-2">Education</h3>
              <div className="space-y-4">
                {content.education.map((edu: any, index: number) => (
                  <div key={index} className="border-l-2 border-neon-pink pl-4">
                    <h4 className="text-white font-medium">{edu.degree}</h4>
                    <p className="text-sm text-gray-400">{edu.school}</p>
                    <p className="text-sm text-gray-400">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw JSON View */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code className="h-4 w-4 text-neon-cyan" />
              <h3 className="text-neon-cyan font-medium">Raw Data</h3>
            </div>
            <pre className="bg-cyber-darker p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}