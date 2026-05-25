import { useEffect, useState } from 'react';
import { Calculator, Github, Globe2 } from 'lucide-react';
import LLMVRAMCalculator from './components/LlmGpuVramCalculator';

type Locale = 'en_US' | 'zh_CN';

const appTranslations = {
  en_US: {
    title: 'LLM GPU VRAM Calculator',
    subtitle: 'VRAM requirements and performance estimation for LLM inference',
    metaTitle: 'LLM GPU VRAM Calculator - VRAM requirements and performance estimation for LLM inference',
    metaDescription: 'Calculate GPU memory requirements and performance for Large Language Models. Professional hardware calculator for AI developers.',
    github: 'GitHub',
    language: 'Language',
    calculations: 'Calculations for AI developers',
    builtWith: 'Built with Codex assistance',
    poweredBy: 'Powered by',
  },
  zh_CN: {
    title: 'LLM GPU 显存计算器',
    subtitle: '面向 LLM 推理的显存需求与性能估算',
    metaTitle: 'LLM GPU 显存计算器 - 面向 LLM 推理的显存需求与性能估算',
    metaDescription: '计算大语言模型在不同 GPU 配置下的显存需求与推理性能，服务 AI 开发者的硬件规划工具。',
    github: 'GitHub',
    language: '语言',
    calculations: '面向 AI 开发者的估算工具',
    builtWith: '由 Codex 协助构建',
    poweredBy: '技术支持',
  },
} as const;

function App() {
  const [locale, setLocale] = useState<Locale>('en_US');
  const t = appTranslations[locale];

  useEffect(() => {
    document.title = t.metaTitle;
    document.documentElement.lang = locale === 'zh_CN' ? 'zh-CN' : 'en-US';
    document.documentElement.dataset.locale = locale;

    const metaDescription = document.querySelector('meta[name="description"]');

    if (metaDescription) {
      metaDescription.setAttribute('content', t.metaDescription);
      return;
    }

    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = t.metaDescription;
    document.head.appendChild(meta);
  }, [locale, t.metaDescription, t.metaTitle]);

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
                <h1 className="wrap-anywhere text-xl font-semibold leading-tight text-gray-900">{t.title}</h1>
                <p className="wrap-anywhere text-sm leading-snug text-gray-500">{t.subtitle}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label={t.language}
                title={t.language}
                data-locale={locale}
                className="header-icon-action header-language-toggle"
                onClick={() => setLocale((current) => current === 'en_US' ? 'zh_CN' : 'en_US')}
              >
                <Globe2 className="h-4 w-4" />
                <span className="text-sm">EN/中</span>
              </button>
              <a
                href="https://github.com/jryaonj/llm-gpu-vram-calculator"
                target="_blank"
                rel="noopener noreferrer"
                className="header-icon-action"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">{t.github}</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        <LLMVRAMCalculator locale={locale} />
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
              <span>{t.calculations}</span>
              <span className="text-gray-300">•</span>
              <span>{t.builtWith}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500">
              <span>{t.poweredBy}</span>
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
