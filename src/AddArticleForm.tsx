// pages/BulkEdit.tsx
import React, { useState, useEffect } from 'react';

interface Article {
  uuid: string;
  code?:  number;
  chapter_id?: number;
  article_id?: number;
  sub_article_id?:  number;
  section_id?:  number;
  clause_id?:  number;
  item_id?:  number;
  sub_item_id?:  number
  content: string;
  law_number?:  number;
  id: string;
};

interface Regulation {
  regulation_number: number;
  regulation_name: string;
  authority: string;
}

const initialArticle: Article = {
  uuid: '',
  code: undefined,
  chapter_id: undefined,
  article_id: undefined,
  sub_article_id: undefined,
  section_id: undefined,
  clause_id: undefined,
  item_id: undefined,
  sub_item_id: undefined,
  content: '',
  law_number: undefined,
  id: '',
};

const digits: { [key: string]: number } = {
  law_number: 3,
  code: 2,
  chapter_id: 2,
  article_id: 3,
  sub_article_id: 2,
  section_id: 2,
  clause_id: 2,
  item_id: 2,
  sub_item_id: 2,
}

const BulkEdit: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [selectedRegulation, setSelectedRegulation] = useState<number | null>(null);
  const [isFold, setIsFold] = useState<Boolean>(false); // State for collapsible content
  const [foldSet, setFoldSet] = useState<Set<string>>(new Set()); // State for collapsible content
  const [articles, setArticles] = useState<Article[]>([initialArticle as Article]);

  function generateUUID() {
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  // 做收合展開的功能
  const handleFold = () => {
    const keys = ['code', 'chapter_id', 'article_id', 'sub_article_id', 'section_id', 'clause_id', 'item_id', 'sub_item_id'];
    const newSet = new Set<string>(); // Provide the correct type for the newSet variable
    
    if (isFold) {
      keys.forEach((key) => {
        if (articles.some((article) => article[key as keyof Article])) {
          newSet.add(key);
        }
      });
    } else {
      keys.forEach((key) => newSet.add(key));
    }

    setFoldSet(newSet);
    setIsFold(isFold => !isFold);
  }

  const generateId = (article: Article) => {
    const fields = [
      String(article.law_number ?? 0).padStart(digits['law_number'], '0'),
      String(article.code ?? 0).padStart(digits['code'], '0'),
      String(article.chapter_id ?? 0).padStart(digits['chapter_id'], '0'),
      String(article.article_id ?? 0).padStart(digits['article_id'], '0'),
      String(article.sub_article_id ?? 0).padStart(digits['sub_article_id'], '0'),
      String(article.section_id ?? 0).padStart(digits['section_id'], '0'),
      String(article.clause_id ?? 0).padStart(digits['clause_id'], '0'),
      String(article.item_id ?? 0).padStart(digits['item_id'], '0'),
      String(article.sub_item_id ?? 0).padStart(digits['sub_item_id'], '0'),
    ];
    const paddedFields = fields.map((field) => field || '0'.repeat(digits[field as keyof typeof digits]));
    return 'A' + paddedFields.join('');
  };

  useEffect(() => {
    // Fetch regulations for selection
    async function fetchRegulations() {
      try {
        const response = await fetch('http://localhost:3000/api/regulations');
        const data = await response.json();
        setRegulations(data);
      } catch (error) {
        console.error('Error fetching regulations:', error);
      }
    }

    fetchRegulations();
  }, []);

  useEffect(() => {
    // Fetch articles when a regulation is selected
    async function fetchArticles() {
      if (selectedRegulation !== null) {
        try {
          const response = await fetch(`http://localhost:3000/api/regulations?law_number=${selectedRegulation}`);
          const data = await response.json();
          
          setArticles(data.articles);
        } catch (error) {
          console.error('Error fetching articles:', error);
        }
      }
    }

    fetchArticles();
  }, [selectedRegulation]);

  const handleInputChange = (targetId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newArticles = articles.map((article) => {
      if (article.uuid === targetId) {
        let newValue: string | number = value;
        if (!isNaN(Number(value))) newValue = Number(value);
        if (newValue === 0) newValue = '';
        return {
          ...article,
          [name]: newValue,
          id: generateId(article),
        };
      }
      return article;
    });
    setArticles(newArticles);
  };

  const handleAddRow = () => {
    setArticles([...articles, 
      { ...initialArticle,
        // 如果 編 不為空值 且 章 為空值 則 設定 編為 前項的編+1
        code: (articles[articles.length - 1]?.code ?? 0) && !articles[articles.length - 1]?.chapter_id ? (articles[articles.length - 1]?.code ?? 0) + 1 : articles[articles.length - 1]?.code,
        // 如果 章 不為空值 且 條 為空值 則 設定 章為 前項的章+1
        chapter_id: (articles[articles.length - 1]?.chapter_id ?? 0) && !articles[articles.length - 1]?.article_id ? (articles[articles.length - 1]?.chapter_id ?? 0) + 1 : articles[articles.length - 1]?.chapter_id,
        // 如果 條 不為空值 則 設定 條為 前項的條+1
        article_id: (articles[articles.length - 1]?.article_id ?? 0) && !articles[articles.length - 1]?.section_id ? (articles[articles.length - 1]?.article_id ?? 0) + 1 : articles[articles.length - 1]?.article_id,
        // 如果 條次 不為空值 則 設定 條次為 前項的條次+1
        sub_article_id: (articles[articles.length - 1]?.sub_article_id ?? 0) && !articles[articles.length - 1]?.section_id ? (articles[articles.length - 1]?.sub_article_id ?? 0) + 1 : articles[articles.length - 1]?.sub_article_id,
        // 如果 項 不為空值 則 設定 項為 前項的項+1
        section_id: (articles[articles.length - 1]?.section_id ?? 0) && !articles[articles.length - 1]?.clause_id ? (articles[articles.length - 1]?.section_id ?? 0) + 1 : articles[articles.length - 1]?.section_id,
        // 如果 款 不為空值 則 設定 款為 前項的款+1
        clause_id: (articles[articles.length - 1]?.clause_id ?? 0) && !articles[articles.length - 1]?.item_id ? (articles[articles.length - 1]?.clause_id ?? 0) + 1 : articles[articles.length - 1]?.clause_id,
        // 如果 目 不為空值 則 設定 目為 前項的目+1
        item_id: (articles[articles.length - 1]?.item_id ?? 0) && !articles[articles.length - 1]?.sub_item_id ? (articles[articles.length - 1]?.item_id ?? 0) + 1 : articles[articles.length - 1]?.item_id,
        // 如果 目之 不為空值 則 設定 目之為 前項的目之+1
        sub_item_id: (articles[articles.length - 1]?.sub_item_id ?? undefined) && (articles[articles.length - 1]?.sub_item_id ?? 0) + 1,
        uuid: generateUUID(),
        law_number: selectedRegulation ?? 4999 // 4999作為錯誤值
      }]
    );
  };

  const handleRemoveRow = async (index: number, uuid: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this article?');
    if (!confirmDelete) {
      return;
    }

    const newArticles = [...articles];
    newArticles.splice(index, 1);
    setArticles(newArticles);

    try {
      const response = await fetch(`http://localhost:3000/api/delete-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid: uuid ?? undefined }),
      });

      if (response.ok) {
        alert('Article deleted successfully!');
      } else {
        alert('Failed to delete article.');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handleUpdateRow = async (uuid: string) => {
    const article = articles.find((article) => article.uuid === uuid);
    try {
      const response = await fetch('http://localhost:3000/api/bulk-update-articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      });

      if (response.ok) {
        alert('Article updated successfully!');
      } else {
        alert('Failed to update article.');
      }
    } catch (error) {
      console.error('Error updating article:', error);
    }
  }

  return (
    <div className='m-4'>
      <h1>批量編輯</h1>
      <form>
        <div className="mb-4">
          <label htmlFor="regulation-select">選擇法規:</label>
          <select
            id="regulation-select"
            value={selectedRegulation ?? ''}
            onChange={(e) => setSelectedRegulation(Number(e.target.value))}
          >
            <option value="" disabled>選擇法規</option>
            {regulations.map((regulation) => (
              <option key={regulation.regulation_number} value={regulation.regulation_number}>
                {regulation.regulation_name}
              </option>
            ))}
          </select>
          <button type="button" onClick={handleFold} className="mb-4 bg-green-500 text-white px-4 py-2 rounded">
            {isFold ? '摺疊內容' : '展開內容'}
          </button>
        </div>
        
        <div className="mb-4 border-b pb-4">
          <div className="flex gap-1">
            <div className='w-20'>
              <label>永久編號</label>
            </div>
            {foldSet.has('code') && (
              <div className='w-12'>
                <label>編</label>
              </div>
            )}
            {foldSet.has('chapter_id') && (
            <div className='w-12'>
              <label>章</label>
            </div>
            )}
            {foldSet.has('article_id') && (
            <div className='w-12'>
              <label>條</label>
            </div>
            )}
            {foldSet.has('sub_article_id') && (
              <div className='w-12'>
                <label>條之</label>
              </div>
            )}
            {foldSet.has('section_id') && (
              <div className='w-12'>
                <label>項</label>
              </div>
            )}
            {foldSet.has('clause_id') && (
              <div className='w-12'>
                <label>款</label>
              </div>
            )}
            {foldSet.has('item_id') && (
              <div className='w-12'>
                <label>目</label>
              </div>
            )}
            {foldSet.has('sub_item_id') && (
              <div className='w-12'>
                <label>目之</label>
              </div>
            )}
            <div className='w-[800px]'>
              <label>條文內容</label>
            </div> 
            <div className='w-20'>
              <label>法律編號</label>
            </div>
          </div>
        </div>

        {articles.map((article, index) => (
          <div key={index} className="border-b ">
            <div className="flex gap-1">
              <div className='w-20'>
                <input 
                  type="text" 
                  id="id"
                  name="id"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={article.uuid}
                  placeholder="UUID"
                  disabled
                />
              </div>
              {foldSet.has('code') && (
              <div className='w-12'>
                <input 
                  type="number" 
                  id="code" 
                  name="code"
                  className="bg-gray-50 border border -gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={article.code}
                  onChange={(e) => handleInputChange(article.uuid, e)}
                  placeholder="編"
                />
              </div>
              )}
              {foldSet.has('chapter_id') && (
              <div className='w-12'>
                <input 
                  type="number" 
                  id="chapter_id"
                  name="chapter_id"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={article.chapter_id}
                  onChange={(e) => handleInputChange(article.uuid, e)}
                  placeholder="章"
                />
              </div>
              )}
              {foldSet.has('article_id') && (
              <div className='w-12'>
                <input 
                  type="number" 
                  id="article_id" 
                  name="article_id"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={article.article_id}
                  onChange={(e) => handleInputChange(article.uuid, e)}
                  placeholder="條"
                />
              </div>
              )}
              {foldSet.has('sub_article_id') && (
              <div className='w-12'>
                <input 
                  type="number" 
                  id="sub_article_id" 
                  name="sub_article_id"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={article.sub_article_id}
                  onChange={(e) => handleInputChange(article.uuid, e)}
                  placeholder="條之"
                />
              </div>
              )}
              {foldSet.has('section_id') && (
              <div className='w-12'>
                <input 
                  type="number" 
                  id="section_id" 
                  name="section_id"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={article.section_id}
                  onChange={(e) => handleInputChange(article.uuid, e)}
                  placeholder="項"
                />
              </div>
              )}
              {foldSet.has('clause_id') && (
              <div className='w-12'>
                <input 
                  type="number" 
                  id="clause_id" 
                  name="clause_id"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={article.clause_id}
                  onChange={(e) => handleInputChange(article.uuid, e)}
                  placeholder="款"
                />
              </div>
              )}
              {foldSet.has('item_id') && (
              <div className='w-12'>
                <input 
                  type="number" 
                  id="item_id" 
                  name="item_id"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={article.item_id}
                  onChange={(e) => handleInputChange(article.uuid, e)}
                  placeholder="目"
                />
              </div>
              )}
              {foldSet.has('sub_item_id') && (
              <div className='w-12'>
                <input 
                  type="number" 
                  id="sub_item_id" 
                  name="sub_item_id"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={article.sub_item_id}
                  onChange={(e) => handleInputChange(article.uuid, e)}
                  placeholder="目之○"
                />
              </div>
              )}
              <div className='w-[800px]'>
                <input
                  type="text"
                  id="content"
                  name="content"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={article.content}
                  onChange={(e) => handleInputChange(article.uuid, e)}
                  placeholder="條文內容"
                />
              </div>
              <div className='w-20'>
                <input
                  type="number"
                  id="law_number"
                  name="law_number"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={article.law_number}
                  onChange={(e) => handleInputChange(article.uuid, e)}
                  placeholder="Law Number"
                  disabled
                />
              </div>
              <button
                type="button"
                className="bg-red-500 text-white px-4 py-2 rounded-md"
                onClick={() => handleRemoveRow(index, article.uuid)}
                >
                Remove Row
              </button>
              <button 
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={() => handleUpdateRow(article.uuid)}
              >
                Save
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="bg-green-500 text-white px-4 py-2 rounded-md mb-4"
          onClick={handleAddRow}
        >
          Add Another Row
        </button>
      </form>
    </div>
  );
};

export default BulkEdit;
