import React, { useEffect, useState } from 'react';

interface Law {
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

function SelectLaw() {
  const [select_law, setSelectLaw] = useState<number>(0);
  const [articles, setArticles] = useState<Law[]>([]);
  const [regulationName, setRegulationName] = useState<string>('');
  const [chaptersToShow, setChaptersToShow] = useState<Set<number>>(new Set());
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  async function fetchArticles() {
    try {
      // Fetch the regulation name for law_number 0
      const regResponse = await fetch('http://localhost:3000/api/regulations');
      const regResult = await regResponse.json();
      // Filter articles to include only those with law_number 0
      const filteredArticles = regResult.articles.filter((article: Law) => {
        return article.content.includes(searchKeyword);
      });
      setArticles(filteredArticles);
      setRegulationName(regResult.regulation_name);

      // Calculate which chapters should be shown
      const chapters = new Set<number>();
      filteredArticles.forEach((article: Law) => {
        chapters.add(article.chapter_id);
      });

      setChaptersToShow(chapters);
    } catch (error) {
      console.error('Error fetching articles:', error);
      // Handle the error here, e.g. show an error message to the user
    }
  }

  useEffect(() => {
    fetchArticles();
  }, [searchKeyword]);

  const displayedChapters = new Set<number>();
  const displayedArticles = new Set<number>();
  const displayedSections = new Set<number|null>();

  return (
    <div className='mx-12'>
      <input
        type='number'
        value={select_law}
        onChange={(e) => setSelectLaw(parseInt(e.target.value))}
      />
      <input
        type='text'
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
      />
      <button onClick={fetchArticles}>搜尋</button>
      {articles ? (
        <>
          <h1>{regulationName}</h1>
          {articles.map((article) => {
            // Check if the chapter has already been displayed
            const showChapterTitle = !displayedChapters.has(article.chapter_id);
            const showArticle = !displayedArticles.has(article.article_id);
            const showSection = !displayedSections.has(article.article_id * 10 + (article.section_id ? article.section_id : 0));

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
              <div key={article.id}>
                {showChapterTitle && <div className='font-black'>第 {article.chapter_id} 章</div>}
                <div className='flex'>
                  <div className='w-20 text-right mr-4'>{showArticle && (`第 ${article.article_id}` + (article.sub_article_id !== null ? `-${article.sub_article_id}` : '') + ` 條`)}</div>
                  <div className='flex'>
                    <div className='w-4'>{showSection && article.section_id}</div>
                    <div className='w-[480px]'>{article.content}</div>
                  </div>
                </div>
                <br />
              </div>
            );
          })}
        </>
      ) : null }
    </div>
  );
};

export default SelectLaw;