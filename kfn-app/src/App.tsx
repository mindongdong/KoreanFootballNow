import React from 'react';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ArticleList from './components/news/ArticleList';
import ArticleView from './components/news/ArticleView';
import EvidenceView from './components/news/EvidenceView';
import StatsDashboard from './components/stats/StatsDashboard';
import ScrollToTop from './components/common/ScrollToTop';
import { loadArticles } from './utils/articleLoader';
import type { Article } from './types';

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
      onShowEvidence={() => navigate(`/news/${articleId}/evidence`)}
    />
  );
}

function EvidenceViewPage({ articles }: { articles: Article[] }) {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const article = articles.find((a) => a.id === articleId);

  if (!article) {
    return <Navigate to="/news" replace />;
  }

  return (
    <EvidenceView
      article={article}
      onBack={() => navigate(`/news/${articleId}`)}
    />
  );
}

function App() {
  const articles = loadArticles();

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <Navbar />
      <ScrollToTop />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/news" replace />} />
          <Route path="/news" element={<ArticleList articles={articles} />} />
          <Route path="/news/:articleId" element={<ArticleViewPage articles={articles} />} />
          <Route path="/news/:articleId/evidence" element={<EvidenceViewPage articles={articles} />} />
          <Route path="/stats/*" element={<StatsDashboard />} />
          <Route path="*" element={<Navigate to="/news" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
