import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Article {
  id: number;
  code: string;
  chapter_id: number;
  article_id: number;
  sub_article_id: number | null;
  section_id: number | null;
  clause_id: number | null;
  item_id: number | null;
  sub_item_id: number | null;
  content: string;
  law_number: number;
}

interface Regulation {
  regulation_number: number;
  regulation_name: string;
  articles: Article[];
}

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function RegulationView() {
  const { regulation_number } = useParams();
  const [regulation, setRegulation] = useState<Regulation | null>(null);

  useEffect(() => {
    async function fetchRegulation() {
      try {
        const regResponse = await fetch(`${API_URL}/api/regulations?law_number=${regulation_number}`);
        const regulations = await regResponse.json();
        
        if (regulations && regulations.articles) {
          regulations.articles.sort((a: Article, b: Article) => {
            if (a.chapter_id !== b.chapter_id) {
              return a.chapter_id - b.chapter_id;
            }
            if (a.article_id !== b.article_id) {
              return a.article_id - b.article_id;
            }
            if (a.sub_article_id !== b.sub_article_id) {
              return (a.sub_article_id || 0) - (b.sub_article_id || 0);
            }
            if (a.section_id !== b.section_id) {
              return (a.section_id || 0) - (b.section_id || 0);
            }
            if (a.clause_id !== b.clause_id) {
              return (a.clause_id || 0) - (b.clause_id || 0);
            }
            if (a.item_id !== b.item_id) {
              return (a.item_id || 0) - (b.item_id || 0);
            }
            return (a.sub_item_id || 0) - (b.sub_item_id || 0);
          });
        }
        
        setRegulation(regulations || null);
      } catch (error) {
        console.error('Error fetching regulation:', error);
      }
    }
    fetchRegulation();
  }, [regulation_number]);

  const displayedChapters = new Set<number>();
  const displayedArticles = new Set<number>();
  const displayedSections = new Set<number|null>();

  if (!regulation) return <div>載入中...</div>;

  return (
    <div className='mx-12 my-4'>
      <div className='w-[800px] mx-auto'>
        <div className='text-center text-blue-600 text-lg my-4'>{regulation.regulation_name}</div>
        
        {regulation.articles.map((article) => {
          console.log(article);
          const showChapterTitle = !displayedChapters.has(article.law_number * 10000 + article.chapter_id) && article.chapter_id !== null;
          const showArticle = !displayedArticles.has(article.law_number * 10000 + article.article_id) && article.article_id !== null;
          const showSection = !displayedSections.has(article.law_number * 10000 + article.article_id * 10 + (article.section_id ? article.section_id : 0)) && article.section_id !== null;

          if (showChapterTitle) {
            displayedChapters.add(article.law_number * 10000 + article.chapter_id);
          }

          if (showArticle) {
            displayedArticles.add(article.law_number * 10000 + article.article_id);
          }

          if (showSection) {
            displayedSections.add(article.law_number * 10000 + article.article_id * 10 + (article.section_id ? article.section_id : 0));
          }

          return (
            <div
              key={article.id}
              className='flex flex-col'
            >
              {showChapterTitle && <div className='font-black'>第 {article.chapter_id} 章</div>}
              <div className='flex justify-center'>
                <div className='flex-none w-24 text-right mr-4'>{showArticle && (`第 ${article.article_id}` + (article.sub_article_id ? `-${article.sub_article_id}` : '') + ` 條`)}</div>
                <div className='grow flex'>
                  <div className='min-w-4'>{showSection && article.section_id}</div>
                  <div className='text-pretty'>{article.content}</div>
                </div>
              </div>
              <br />
            </div>
        )})}
      </div>
    </div>
  );
}

export default RegulationView; 