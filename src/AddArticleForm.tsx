import React, { useState } from 'react';

const customFieldNames: { [key: string]: string } = {
  id: '永久編號',
  code: '編號',
  chapter_id: '章節號',
  article_id: '條次',
  sub_article_id: '條次號',
  section_id: '款次',
  clause_id: '項次',
  item_id: '目次',
  sub_item_id: '目次號',
  content: '內容',
  law_number: '法律編號',
};

function BulkAddArticleForm() {
  const initialArticle = {
    id: '',
    code: '',
    chapter_id: '',
    article_id: '',
    sub_article_id: '',
    section_id: '',
    clause_id: '',
    item_id: '',
    sub_item_id: '',
    content: '',
    law_number: '',
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

  const [articles, setArticles] = useState<{ [key: string]: string }[]>([initialArticle]);

  const generateId = (article: { [key: string]: string }) => {
    const fields = [
      article.law_number.padStart(digits['law_number'], '0'),
      article.code.padStart(digits['code'], '0'),
      article.chapter_id.padStart(digits['chapter_id'], '0'),
      article.article_id.padStart(digits['article_id'], '0'),
      article.sub_article_id.padStart(digits['sub_article_id'], '0'),
      article.section_id.padStart(digits['section_id'], '0'),
      article.clause_id.padStart(digits['clause_id'], '0'),
      article.item_id.padStart(digits['item_id'], '0'),
      article.sub_item_id.padStart(digits['sub_item_id'], '0'),
    ];
    const paddedFields = fields.map((field) => field || '0'.repeat(digits[field as keyof typeof digits]));
    return 'A' + paddedFields.join('');
  };

  const handleInputChange = (index: number, e: any) => {
    const { name, value } = e.target;
    const newArticles = [...articles];
    newArticles[index][name] = value;
    newArticles[index].id = generateId(newArticles[index]);
    setArticles(newArticles);
  };

  const handleAddRow = () => {
    setArticles([
      ...articles,
      {...initialArticle, id: generateId(initialArticle)},
    ]);
  };

  const handleRemoveRow = (index: number) => {
    const newArticles = [...articles];
    newArticles.splice(index, 1);
    setArticles(newArticles);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/bulk-add-articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articles),
      });

      if (response.ok) {
        alert('Articles added successfully!');
        setArticles([initialArticle]);
      } else {
        alert('Failed to add articles.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className=" mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Bulk Add New Articles</h2>
      <form onSubmit={handleSubmit}>
        {articles.map((article, index) => (
          <div key={index} className="mb-6 border-b pb-4">
            <div className="grid grid-cols-11 gap-4">
              {Object.keys(article).map((key) => (
                <div key={key} className="mb-4">
                  <label className="block text-gray-700 mb-2 capitalize" htmlFor={`${key}-${index}`}>
                  {customFieldNames[key]}
                  </label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    type="text"
                    id={`${key}-${index}`}
                    name={key}
                    value={article[key]}
                    onChange={(e) => handleInputChange(index, e)}
                    maxLength={digits[key]} // Set maxLength based on the digits object
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded-md"
              onClick={() => handleRemoveRow(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="bg-green-500 text-white px-4 py-2 rounded-md mb-4"
          onClick={handleAddRow}
        >
          Add Another Article
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          type="submit"
        >
          Submit All Articles
        </button>
      </form>
    </div>
  );
}

export default BulkAddArticleForm;
