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

function RegulationView() {
  const { regulation_number } = useParams();
  const [regulation, setRegulation] = useState<Regulation | null>(null);

  useEffect(() => {
    async function fetchRegulation() {
      try {
        const regResponse = await fetch(`http://localhost:3000/api/regulations?law_number=${regulation_number}`);
        const regulations = await regResponse.json();
        setRegulation(regulations || null);
        console.log(regulations);
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
          const showChapterTitle = !displayedChapters.has(article.chapter_id) && article.chapter_id !== null;
          const showArticle = !displayedArticles.has(article.article_id) && article.article_id !== null;
          const showSection = !displayedSections.has(article.article_id * 10 + (article.section_id ? article.section_id : 0)) && article.section_id !== null;

          if (showChapterTitle) {
            displayedChapters.add(article.chapter_id);
          }
          if (showArticle) {
            displayedArticles.add(article.article_id);
          }
          if (showSection) {
            displayedSections.add(article.article_id * 10 + (article.section_id ? article.section_id : 0));
          }

          return (
            <div key={article.id} className='flex flex-col'>
              {showChapterTitle && <div className='font-black'>第 {article.chapter_id} 章</div>}
              <div className='flex justify-center'>
                <div className='flex-none w-24 text-right mr-4'>
                  {showArticle && (`第 ${article.article_id}` + (article.sub_article_id ? `-${article.sub_article_id}` : '') + ` 條`)}
                </div>
                <div className='grow flex'>
                  <div className='min-w-4'>{showSection && article.section_id}</div>
                  <div className='text-pretty'>{article.content}</div>
                </div>
              </div>
              <br />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RegulationView; 