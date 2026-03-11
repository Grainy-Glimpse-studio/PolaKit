import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PixelButton, PixelPanel, PixelCanvas } from '@/components/pixel-ui';

// Simple markdown to HTML converter for basic formatting
function renderMarkdown(md: string): string {
  return md
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="font-[\'Press_Start_2P\'] text-[10px] text-pixel-text mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-[\'Press_Start_2P\'] text-xs text-pixel-text mt-4 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-[\'Press_Start_2P\'] text-sm text-pixel-text mb-3">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">$1</a>')
    // List items
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Paragraphs (lines that aren't headers or list items)
    .replace(/^(?!<[hl]|<li)(.+)$/gm, '<p class="mb-2">$1</p>')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Wrap consecutive li elements in ul
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="mb-3">$&</ul>');
}

export function About() {
  const navigate = useNavigate();
  const [aboutMe, setAboutMe] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/about-me.md')
      .then(res => res.text())
      .then(text => {
        setAboutMe(text);
        setLoading(false);
      })
      .catch(() => {
        setAboutMe('# About Me\n\nContent coming soon...');
        setLoading(false);
      });
  }, []);

  return (
    <PixelCanvas showToolbar={false}>
      <div className="min-h-screen bg-pixel-bg p-4 md:p-8">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-6">
          <button
            onClick={() => navigate('/')}
            className="
              inline-flex items-center gap-2 px-3 py-2
              border-2 border-pixel-border bg-white
              hover:bg-gray-100 transition-colors
              pixel-body
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Project Info */}
          <PixelPanel>
            <div className="p-6 space-y-6">
              {/* Logo / Title */}
              <div className="text-center">
                <h1 className="font-['Press_Start_2P'] text-xl text-pixel-text mb-2">
                  PolaKit
                </h1>
                <p className="pixel-body text-gray-600">
                  Tools for instant photo processing
                </p>
              </div>

              {/* Description */}
              <div className="pixel-body text-gray-700 text-left">
                <p>
                  A collection of tools to process, layout, and print instant photos (Polaroid, Instax, etc.)
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h2 className="font-['Press_Start_2P'] text-xs text-pixel-text">Features</h2>
                <div className="grid grid-cols-1 gap-2 text-left">
                  <div className="flex items-center gap-3 p-2 border-2 border-pixel-border bg-yellow-50">
                    <div
                      className="w-4 h-4 border border-black/20"
                      style={{ backgroundColor: '#fdc800' }}
                    />
                    <div className="pixel-body">
                      <span className="font-bold">Cropper</span>
                      <span className="text-gray-500 ml-2">Remove borders & fix perspective</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 border-2 border-pixel-border bg-orange-50">
                    <div
                      className="w-4 h-4 border border-black/20"
                      style={{ backgroundColor: '#f97316' }}
                    />
                    <div className="pixel-body">
                      <span className="font-bold">Blur BG</span>
                      <span className="text-gray-500 ml-2">Create blurred backgrounds</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 border-2 border-pixel-border bg-cyan-50">
                    <div
                      className="w-4 h-4 border border-black/20"
                      style={{ backgroundColor: '#00a3e2' }}
                    />
                    <div className="pixel-body">
                      <span className="font-bold">Print</span>
                      <span className="text-gray-500 ml-2">Arrange & print your photos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="space-y-2">
                <h2 className="font-['Press_Start_2P'] text-xs text-pixel-text">Tech</h2>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Tailwind', 'Canvas API'].map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 pixel-body text-xs border-2 border-pixel-border bg-gray-100"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Privacy */}
              <div className="p-3 border-2 border-dashed border-green-400 bg-green-50">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <div>
                    <span className="pixel-body font-bold text-green-700">
                      100% Local Processing
                    </span>
                    <p className="pixel-body text-xs text-green-600">
                      Your photos never leave your device
                    </p>
                  </div>
                </div>
              </div>

              {/* Built with Claude Code */}
              <div className="p-3 border-2 border-dashed border-purple-400 bg-purple-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-purple-600" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="pixel-body font-bold text-purple-700">
                      Built with Claude Code
                    </span>
                    <p className="pixel-body text-xs text-purple-600">
                      Powered by Claude Opus 4.5
                    </p>
                  </div>
                </div>
              </div>

              {/* Version & Links */}
              <div className="flex items-center justify-between">
                <span className="pixel-body text-gray-500 text-sm">v1.0.0</span>
                <a
                  href="https://github.com/Grainy-Glimpse-studio/PolaKit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex items-center gap-2 px-3 py-2
                    border-2 border-pixel-border bg-white
                    hover:bg-gray-100 transition-colors
                    pixel-body text-sm
                  "
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
          </PixelPanel>

          {/* Right: About Me */}
          <PixelPanel>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="pixel-body text-gray-500">Loading...</div>
                </div>
              ) : (
                <div
                  className="pixel-body text-gray-700 prose-sm"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(aboutMe) }}
                />
              )}
            </div>
          </PixelPanel>
        </div>

        {/* Footer hint */}
        <p className="pixel-body text-xs text-gray-400 text-center mt-6">
          Tip: Double-click a pixel ball to come back here
        </p>
      </div>
    </PixelCanvas>
  );
}
