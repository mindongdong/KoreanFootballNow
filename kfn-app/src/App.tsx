import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ArticleList from './components/news/ArticleList';
import ArticleView from './components/news/ArticleView';
import ScrollToTop from './components/common/ScrollToTop';
import { loadArticles } from './utils/articleLoader';
import type { Article } from './types';

const HomePage = React.lazy(() => import('./pages/HomePage'));
const PlayerListPage = React.lazy(() => import('./pages/PlayerListPage'));
const PlayerDetailPage = React.lazy(() => import('./pages/PlayerDetailPage'));

function ArticleViewPage({ articles }: { articles: Article[] }) {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const article = articles.find((a) => a.id === articleId);

  if (!article) {
    return <Navigate to="/news" replace />;
  }

  return (
    <ArticleView
      article={article}
      onBack={() => navigate('/news')}
    />
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-kfn-red border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  const articles = loadArticles();

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <Navbar />
      <ScrollToTop />

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/players" element={<PlayerListPage />} />
            <Route path="/player/:id" element={<PlayerDetailPage />} />
            <Route path="/news" element={<ArticleList articles={articles} />} />
            <Route path="/news/:articleId" element={<ArticleViewPage articles={articles} />} />
            {/* v1 호환: 기존 URL 리다이렉트 */}
            <Route path="/stats/*" element={<Navigate to="/players" replace />} />
            <Route path="/news/:articleId/evidence" element={<Navigate to="/news" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;
