import React, { useEffect, useState } from 'react';

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

function SelectLaw() {
  const [select_law, setSelectLaw] = useState<number|undefined>(undefined);
  const [articles, setArticles] = useState<Article[]>([]);
  const [Regulation, setRegulation] = useState<Regulation[]>([]);
  const [chaptersToShow, setChaptersToShow] = useState<Set<number>>(new Set());
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  async function fetchArticles() {
    try {
      // Fetch the regulation name for law_number 0
      const regResponse = await fetch(`${API_URL}/api/regulations`);
      const regResult = await regResponse.json();

      // 搜尋功能
      const filteredArticles = regResult.map((reg: Regulation) => {
        return {
          ...reg,
          articles: reg.articles.filter((article: Article) => article.content.includes(searchKeyword))
        };
      });
      setRegulation(filteredArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      // Handle the error here, e.g. show an error message to the user
    }
  }

  useEffect(() => {
    fetchArticles();
  }, [searchKeyword]);
  console.log(select_law);

  const displayedChapters = new Set<number>();
  const displayedArticles = new Set<number>();
  const displayedSections = new Set<number|null>();

  return (
    <div className='mx-12 my-4'>
      <div className='flex justify-center'> 
        <form className="w-96 max-w-md">   
            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </div>
                <input type="search" id="default-search" 
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Keyword"
                  />
                <button type="submit" onClick={fetchArticles} className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">搜尋</button>
            </div>
        </form>
        {Regulation ? (
          <select
          value={select_law}
          onChange={(e) => setSelectLaw(parseInt(e.target.value))}
          className='w-96 ml-4'
          >
            <option value={undefined}>請選擇法規</option>
            {Regulation.map((reg) => (
              <option key={reg.regulation_number} value={reg.regulation_number}>
                {reg.regulation_name}
              </option>
            ))}
          </select>
        ) : null
      }
    </div>

      {Regulation.filter((reg) => isNaN(select_law ?? NaN) || reg.regulation_number === select_law).map((reg) => (
        <div 
        key={reg.regulation_number}
        className='w-[800px] mx-auto'
        >
          <div className='text-center text-blue-600 text-lg my-4'>{reg.regulation_name}</div>
          {reg.articles.map((article) => {
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
      ))}
    </div>
  );
};

export default SelectLaw;