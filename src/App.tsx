import { useEffect } from 'react';
import { Calculator, Github } from 'lucide-react';
import LLMVRAMCalculator from './components/LlmGpuVramCalculator';

function App() {
  useEffect(() => {
    document.title = 'LLM GPU VRAM Calculator - VRAM requirements and performance estimation for LLM inference';

    const description = 'Calculate GPU memory requirements and performance for Large Language Models. Professional hardware calculator for AI developers.';
    const metaDescription = document.querySelector('meta[name="description"]');

    if (metaDescription) {
      metaDescription.setAttribute('content', description);
      return;
    }

    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = description;
    document.head.appendChild(meta);
  }, []);

  return (
    <div className="app-shell flex flex-col min-h-screen">
      <header className="app-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="wrap-anywhere text-xl font-semibold leading-tight text-gray-900">LLM GPU VRAM Calculator</h1>
                <p className="wrap-anywhere text-sm leading-snug text-gray-500">VRAM requirements and performance estimation for LLM inference</p>
              </div>
            </div>

            <a
              href="https://github.com/jryaonj/llm-gpu-vram-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        <LLMVRAMCalculator />
      </main>

      <footer className="bg-white/80 border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500">
              <span>© 2025 LLM GPU VRAM Calculator</span>
              <span className="text-gray-300">•</span>
              <a href="https://jryaonj.github.io" target="_blank" rel="noopener noreferrer" className="hover:underline">
                jryaonj
              </a>
              <span className="text-gray-300">•</span>
              <span>Calculations for AI developers</span>
              <span className="text-gray-300">•</span>
              <span>Built with Codex assistance</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500">
              <span>Powered by</span>
              <a href="https://react.dev" className="font-medium text-blue-600 hover:underline">React</a>
              <span className="text-gray-300">•</span>
              <a href="https://daisyui.com" className="font-medium text-blue-500 hover:underline">DaisyUI</a>
              <span className="text-gray-300">•</span>
              <a href="https://cursor.com" className="font-medium text-blue-500 hover:underline">CursorAI</a>
              <span className="text-gray-300">•</span>
              <a href="https://openai.com/codex/" className="font-medium text-blue-500 hover:underline">Codex</a>
              <span className="text-gray-300">•</span>
              <a href="https://openai.com/" className="font-medium text-blue-500 hover:underline">GPT</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
