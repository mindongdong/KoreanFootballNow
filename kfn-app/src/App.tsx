import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ArticleList from './components/news/ArticleList';
import ArticleView from './components/news/ArticleView';
import EvidenceView from './components/news/EvidenceView';
import StatsDashboard from './components/stats/StatsDashboard';
import { mockArticles } from './data/mockArticles';
import type { Article, MainView, NewsView } from './types';

function App() {
  const [mainView, setMainView] = useState<MainView>('news');
  const [newsView, setNewsView] = useState<NewsView>('list');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const handleViewChange = (view: MainView) => {
    setMainView(view);
    if (view === 'news') {
      setNewsView('list');
      setSelectedArticle(null);
    }
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setNewsView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setNewsView('list');
    setSelectedArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowEvidence = () => {
    setNewsView('evidence');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToArticle = () => {
    setNewsView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <Navbar activeView={mainView} onViewChange={handleViewChange} />

      <main className="flex-1">
        {mainView === 'news' && (
          <>
            {newsView === 'list' && (
              <ArticleList articles={mockArticles} onArticleClick={handleArticleClick} />
            )}
            {newsView === 'article' && selectedArticle && (
              <ArticleView
                article={selectedArticle}
                onBack={handleBackToList}
                onShowEvidence={handleShowEvidence}
              />
            )}
            {newsView === 'evidence' && selectedArticle && (
              <EvidenceView article={selectedArticle} onBack={handleBackToArticle} />
            )}
          </>
        )}

        {mainView === 'stats' && <StatsDashboard />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
