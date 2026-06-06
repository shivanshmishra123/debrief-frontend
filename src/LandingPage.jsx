import React, { useEffect, useRef } from 'react';

export default function LandingPage({ onGetStarted, onLogin }) {
  const cardsRef = useRef([]);

  // Scroll reveal effect for feature cards
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1 }
    );

    cardsRef.current.forEach((el) => {
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff] text-[#0b1c30] font-[Inter]">

      {/* =============================== */}
      {/* TOP NAV BAR                     */}
      {/* =============================== */}
      <nav className="w-full sticky top-0 z-50 bg-[#f8f9ff] border-b border-[#E2E8F0]">
        <div className="flex justify-between items-center h-16 px-10 max-w-[1440px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#121212] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px]">insights</span>
            </div>
            <span className="text-lg font-bold text-[#121212]">Debrief.io</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-bold text-[#121212] border-b-2 border-[#006d35] h-16 flex items-center"
            >
              Features
            </a>
            <a
              href="#solutions"
              className="text-sm text-[#444748] hover:text-[#121212] transition-colors duration-200"
            >
              Solutions
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <button
              id="nav-login-btn"
              onClick={onLogin}
              className="hidden md:block text-sm text-[#0b1c30] hover:text-[#121212] transition-all font-medium"
            >
              Login
            </button>
            <button
              id="nav-get-started-btn"
              onClick={onGetStarted}
              className="bg-[#121212] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-black active:scale-95 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">

        {/* =============================== */}
        {/* HERO SECTION                    */}
        {/* =============================== */}
        <section
          className="pt-24 pb-16 px-6 md:px-10 overflow-hidden"
          style={{ background: 'radial-gradient(circle at 50% -20%, #eff4ff 0%, #f8f9ff 100%)' }}
        >
          <div className="max-w-[1440px] mx-auto text-center mb-24">
            {/* <div className="inline-flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-full px-4 py-1.5 mb-8 text-xs font-semibold text-[#006d35] shadow-sm">
              <span className="w-2 h-2 bg-[#006d35] rounded-full animate-pulse"></span>
              AI-Powered Meeting Intelligence — Now Live
            </div> */}

            <h1 className="text-4xl md:text-6xl font-bold text-[#121212] mb-6 max-w-4xl mx-auto leading-tight">
              Unlock the Hidden Intelligence in Every Conversation.
            </h1>

            <p className="text-lg md:text-xl text-[#444748] mx-auto mb-10 max-w-3xl leading-relaxed">
              Debrief.io uses precision AI to transcribe, analyze, and transform your meeting recordings into actionable assets — decisions, tasks, and searchable knowledge.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                id="hero-get-started-btn"
                onClick={onGetStarted}
                className="w-full sm:w-auto bg-[#121212] text-white px-8 py-4 rounded-xl text-base font-semibold hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all"
              >
                Get Started Free
              </button>
              <button
                id="hero-watch-demo-btn"
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-[#121212] text-base font-semibold px-8 py-4 rounded-xl hover:bg-[#e5eeff] transition-all"
              >
                <span className="material-symbols-outlined">play_circle</span>
                Watch Demo
              </button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="max-w-[1000px] mx-auto relative group px-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#6366F1] to-[#006d35] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div
              className="relative bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden ai-pulse"
              style={{ boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.05), 0px 2px 4px -1px rgba(0,0,0,0.03)' }}
            >
              {/* Fake Dashboard Header */}
              <div className="bg-[#121212] px-6 py-4 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                </div>
                <div className="flex-1 bg-white/10 rounded-md h-6 mx-4"></div>
                <span className="text-xs text-white/60 font-mono">debrief.io/dashboard</span>
              </div>

              {/* Dashboard Content Preview */}
              <div className="flex h-[320px] md:h-[400px]">
                {/* Sidebar */}
                <div className="w-[200px] bg-[#0d0d0d] flex flex-col p-4 gap-2 shrink-0 hidden md:flex">
                  <div className="flex items-center gap-2 px-3 py-2 mb-4">
                    <div className="w-6 h-6 bg-white rounded-md"></div>
                    <span className="text-white text-sm font-bold">Debrief.io</span>
                  </div>
                  {['Home', 'All Meetings', 'My Profile'].map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${i === 0 ? 'bg-white/10 text-white border-l-2 border-[#006d35]' : 'text-white/50'
                        }`}
                    >
                      <div className="w-4 h-4 bg-white/20 rounded"></div>
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-[#f8f9ff] p-6 overflow-hidden">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {['Total Meetings', 'Active Decisions', 'Hours Processed'].map((label, i) => (
                      <div key={label} className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-sm">
                        <div className="text-[10px] text-[#747878] uppercase font-semibold mb-2">{label}</div>
                        <div className="text-2xl font-bold text-[#121212]">{['12', '24', '8.5h'][i]}</div>
                        <div
                          className="text-[10px] font-semibold mt-1"
                          style={{ color: ['#006d35', '#6366F1', '#747878'][i] }}
                        >
                          {['▲ 100% transcribed', 'Drift tracking on', 'Avg 30m/session'][i]}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 bg-[#121212] rounded"></div>
                      <span className="text-xs font-bold">Process New Recording</span>
                    </div>
                    <div className="border-2 border-dashed border-[#c4c7c7] rounded-lg p-6 flex items-center justify-center">
                      <span className="text-xs text-[#747878]">Drop your audio file here...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =============================== */}
        {/* VALUE PROPOSITIONS              */}
        {/* =============================== */}
        <section id="features" className="py-24 px-6 md:px-10 bg-white">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#006d35]">Core Capabilities</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#121212] mt-3">
                Everything your meetings deserve
              </h2>
              <p className="text-[#444748] mt-4 max-w-xl mx-auto">
                A unified intelligence layer for every conversation your team has.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: 'transcribe',
                  color: '#121212',
                  textColor: 'white',
                  title: 'Deep Transcription',
                  desc: 'High-accuracy speech-to-text with speaker identification and proprietary noise-cancellation technology.',
                },
                {
                  icon: 'insights',
                  color: '#006d35',
                  textColor: 'white',
                  title: 'Smart Analysis',
                  desc: 'Automated summaries, sentiment tracking, and task extraction powered by the latest large language models.',
                },
                {
                  icon: 'database',
                  color: '#6366F1',
                  textColor: 'white',
                  title: 'Knowledge Retrieval',
                  desc: 'Search your entire meeting library and chat with your recordings to find answers in seconds.',
                },
              ].map((card, i) => (
                <div
                  key={card.title}
                  ref={(el) => (cardsRef.current[i] = el)}
                  className="group p-8 rounded-2xl bg-[#f8f9ff] border border-[#E2E8F0] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                    style={{ background: card.color }}
                  >
                    <span className="material-symbols-outlined text-white">{card.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#121212] mb-3">{card.title}</h3>
                  <p className="text-sm text-[#444748] leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =============================== */}
        {/* HOW IT WORKS                    */}
        {/* =============================== */}
        <section id="solutions" className="py-24 px-6 md:px-10 bg-[#f8f9ff]">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#6366F1]">Simple Workflow</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#121212] mt-3">
                From recording to insight in minutes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: '01', icon: 'cloud_upload', label: 'Upload Audio', desc: 'Drop your MP3, WAV, or M4A recording.' },
                { step: '02', icon: 'sync', label: 'Transcribe', desc: 'Whisper AI produces a precise transcript.' },
                { step: '03', icon: 'psychology', label: 'AI Extraction', desc: 'Gemini extracts decisions, tasks & insights.' },
                { step: '04', icon: 'search', label: 'Search & Chat', desc: 'Ask questions of your full meeting archive.' },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center p-6">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-[#121212] rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-white text-2xl">{item.icon}</span>
                    </div>
                    <span className="absolute -top-2 -right-2 bg-[#6366F1] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#121212] mb-2">{item.label}</h4>
                  <p className="text-sm text-[#444748]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =============================== */}
        {/* FINAL CTA SECTION              */}
        {/* =============================== */}
        <section className="py-24 px-6 md:px-10 bg-[#121212] text-white overflow-hidden relative">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-[#006d35] opacity-10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#6366F1] opacity-10 rounded-full blur-[100px]"></div>

          <div className="max-w-[1440px] mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to elevate your<br />meeting intelligence?
            </h2>
            <p className="text-base md:text-lg text-[#858383] mb-12 max-w-2xl mx-auto leading-relaxed">
              Join high-output teams at top-tier companies who use Debrief.io to turn talk into measurable progress.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                id="cta-get-started-btn"
                onClick={onGetStarted}
                className="bg-white text-[#121212] px-10 py-5 rounded-xl text-base font-bold hover:scale-105 active:scale-95 transition-transform"
              >
                Get Started Free
              </button>
              <button
                id="cta-login-btn"
                onClick={onLogin}
                className="border border-white/30 text-white px-10 py-5 rounded-xl text-base font-semibold hover:bg-white/10 active:scale-95 transition-all"
              >
                Login to Dashboard
              </button>
            </div>

            {/* Social Proof Logos */}
            <div className="mt-14 flex flex-wrap justify-center gap-8 opacity-40">
              {[
                { icon: 'domain', label: 'Global Corp' },
                { icon: 'rocket', label: 'Vertex Tech' },
                { icon: 'account_balance', label: 'Summit Finance' },
                { icon: 'storefront', label: 'NovaBrand' },
              ].map((brand) => (
                <div key={brand.label} className="flex items-center gap-2 grayscale">
                  <span className="material-symbols-outlined text-lg">{brand.icon}</span>
                  <span className="text-sm font-semibold">{brand.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* =============================== */}
      {/* FOOTER                          */}
      {/* =============================== */}
      <footer className="w-full bg-[#121212]">
        <div className="py-10 px-10 max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
              <span className="material-symbols-outlined text-[#121212] text-[14px]">insights</span>
            </div>
            <span className="text-base font-bold text-white">Debrief.io</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Security', 'Status', 'Contact'].map((link) => (
              <a key={link} href="#" className="text-xs text-[#858383] hover:text-[#71dc8e] transition-colors">
                {link}
              </a>
            ))}
          </div>
          <div className="text-xs text-white/50">© 2024 Debrief.io. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
