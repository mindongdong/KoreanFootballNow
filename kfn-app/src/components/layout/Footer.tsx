import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="w-full bg-kfn-dark text-white">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Newsletter CTA */}
        <div className="py-12 border-b border-white/10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kfn-red/20 text-kfn-red text-xs font-bold tracking-wide uppercase mb-4">
              <Mail className="w-3.5 h-3.5" />
              Newsletter
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
              매주 받아보는 해외 현지 반응 요약
            </h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-lg mx-auto">
              코리안리거의 해외 반응과 핵심 데이터를 AI가 요약하여 매주 메일함으로 발송합니다.
              노이즈 없이, 팩트만.
            </p>

            {subscribed ? (
              <div className="flex items-center justify-center gap-2 text-green-400 font-semibold animate-[fadeIn_0.3s_ease]">
                <CheckCircle className="w-5 h-5" />
                <span>구독 신청이 완료되었습니다!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="이메일 주소를 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-kfn-red/50 focus:border-kfn-red/50 transition-all"
                  required
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-kfn-red hover:bg-kfn-red/90 text-white rounded-lg font-semibold text-sm transition-all hover:shadow-lg hover:shadow-kfn-red/25 active:scale-[0.98]"
                >
                  <span>구독하기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-kfn-red">KFN</span>
            <span>Korean Football Now</span>
          </div>
          <p>&copy; 2026 KFN. AI-powered Korean football media platform.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
