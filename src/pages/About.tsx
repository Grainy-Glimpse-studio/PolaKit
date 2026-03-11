import { useNavigate } from 'react-router-dom';
import { PixelButton, PixelPanel, PixelCanvas } from '@/components/pixel-ui';

export function About() {
  const navigate = useNavigate();

  return (
    <PixelCanvas showToolbar={false}>
      <div className="min-h-screen bg-pixel-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <PixelPanel className="text-center">
            <div className="p-6 space-y-6">
              {/* Logo / Title */}
              <div>
                <h1 className="font-['Press_Start_2P'] text-2xl text-pixel-text mb-2">
                  PolaKit
                </h1>
                <p className="pixel-body text-gray-600">
                  Tools for instant photo processing
                </p>
              </div>

              {/* Description */}
              <div className="pixel-body text-gray-700 text-left space-y-2">
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
                <div className="flex flex-wrap gap-2 justify-center">
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
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-600"
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
                  <span className="pixel-body font-bold text-green-700">
                    100% Local Processing
                  </span>
                </div>
                <p className="pixel-body text-xs text-green-600 mt-1">
                  Your photos never leave your device
                </p>
              </div>

              {/* Version & Links */}
              <div className="space-y-3">
                <div className="pixel-body text-gray-500 text-sm">
                  v1.0.0
                </div>
                <div className="flex justify-center gap-3">
                  <a
                    href="https://github.com/nicekate/PolaKit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex items-center gap-2 px-3 py-2
                      border-2 border-pixel-border bg-white
                      hover:bg-gray-100 transition-colors
                      pixel-body
                    "
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                </div>
              </div>

              {/* Back Button */}
              <div className="pt-4">
                <PixelButton
                  variant="primary"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  Back to Home
                </PixelButton>
              </div>
            </div>
          </PixelPanel>

          {/* Easter egg hint */}
          <p className="pixel-body text-xs text-gray-400 text-center mt-4">
            Tip: Double-click a pixel ball to come back here
          </p>
        </div>
      </div>
    </PixelCanvas>
  );
}
