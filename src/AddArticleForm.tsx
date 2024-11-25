// pages/BulkEdit.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const BulkEdit: React.FC = () => {
  const { regulationId } = useParams();
  const navigate = useNavigate();
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [selectedRegulation, setSelectedRegulation] = useState<number | null>(null);
  const [isFold, setIsFold] = useState<Boolean>(false); // State for collapsible content
  const [foldSet, setFoldSet] = useState<Set<string>>(new Set()); // State for collapsible content
  const [articles, setArticles] = useState<Article[]>([initialArticle as Article]);
  const [tempArticles, setTempArticles] = useState<Article[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkEditMode, setBulkEditMode] = useState<boolean>(false);
  const [bulkEditText, setBulkEditText] = useState<string>('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [deleteConfirm, setdeleteConfirm] = useState<boolean>(true);

  useEffect(() => {
    if (regulationId) {
      setSelectedRegulation(Number(regulationId));
    }
  }, [regulationId]);

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
    
    if (!isFold) {
      keys.forEach((key) => {
        if (!tempArticles.some((article) => article[key as keyof Article])) {
          newSet.add(key);
        }
      });
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
        const response = await fetch(`${API_URL}/api/regulations`);
        const data = await response.json();
        setRegulations(data);
      } catch (error) {
        console.error('Error fetching regulations:', error);
      }
    }

    fetchRegulations();
  }, []);

  // Fetch Articles when a regulation is selected
  async function fetchArticles() {
    if (selectedRegulation !== null) {
      try {
        const response = await fetch(`${API_URL}/api/regulations?law_number=${selectedRegulation}`);
        const data = await response.json();
        
        setArticles(data.articles);
      } catch (error) {
        console.error('Error fetching Articles:', error);
      }
    }
  }

  useEffect(() => {
    fetchArticles();
  }, [selectedRegulation]);

  useEffect(() => {
    setTempArticles(articles);
  }, [articles]);

  const handleInputChange = (targetId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newArticles = tempArticles.map((article) => {
      if (article.uuid === targetId) {
        let newValue: string | number = value;
        if (!isNaN(Number(value))) newValue = Number(value);
        if (newValue === 0) newValue = '';
        return {
          ...article,
          [name]: newValue,
        };
      }
      return article;
    });
    setTempArticles(newArticles);
  };

  const handleRemoveRow = async (uuid: string) => {
    if (deleteConfirm) {
      const confirmDelete = window.confirm('確定要刪除這條文章嗎？');
      if (!confirmDelete) {
        return;
      }
    }

    // 顯示載入中的 toast
    const loadingToast = toast.loading('正在刪除...');

    try {
      const response = await fetch(`${API_URL}/api/delete-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid: uuid ?? undefined }),
      });

      // 先更新本地狀態
      handleDelete(uuid);

      if (response.ok) {
        // 成功時更新 toast
        toast.success('條文已成功刪除', {
          id: loadingToast,
        });
      } else {
        // 如果 API 回傳錯誤
        throw new Error('刪除失敗');
      }
    } catch (error) {
      // 發生錯誤時更新 toast
      toast.error('刪除失敗，請稍後再試', {
        id: loadingToast,
      });
      console.error('Error deleting article:', error);
    }
  };

  const handleUpdateRow = async (uuid: string) => {
    const article = tempArticles
      .filter((article) => article.uuid === uuid)
      .map((article) => ({ ...article, id: generateId(article) })); // 更新時才update id

    try {
      const response = await fetch(`${API_URL}/api/bulk-update-articles/${selectedRegulation}`, {
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
      fetchArticles(); //刷新頁面
    } catch (error) {
      console.error('Error updating article:', error);
    }
  };

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const renderPreview = () => {
    return (
      <div className="preview-container">
        {tempArticles.sort((a, b) => a.id > b.id ? 1 : -1).map((article, index) => (
          <div key={index} className="preview-item p-4 border-b">
            <div className="text-lg font-bold">
              {article.chapter_id && `第${article.chapter_id}章`}
              {article.article_id && ` 第${article.article_id}條`}
              {article.sub_article_id && `-${article.sub_article_id}`}
            </div>
            <div className="mt-2">{article.content}</div>
          </div>
        ))}
      </div>
    );
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    const confirmDelete = window.confirm(`確定要刪除選中的 ${selectedItems.size} 條記錄嗎？`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/bulk-delete-articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuids: Array.from(selectedItems) }),
      });

      if (response.ok) {
        alert('批量刪除成功！');
        setSelectedItems(new Set());
        fetchArticles();
      }
    } catch (error) {
      console.error('Error bulk deleting articles:', error);
    }
  };

  const handleBulkEdit = () => {
    setBulkEditMode(true);
    // 將所有資料轉換為純文字格式
    const textData = tempArticles
      .sort((a, b) => {
        // 依序比较各个层级
        if ((a.code ?? 0) !== (b.code ?? 0)) {
          return (a.code ?? 0) - (b.code ?? 0);
        }
        if ((a.chapter_id ?? 0) !== (b.chapter_id ?? 0)) {
          return (a.chapter_id ?? 0) - (b.chapter_id ?? 0);
        }
        if ((a.article_id ?? 0) !== (b.article_id ?? 0)) {
          return (a.article_id ?? 0) - (b.article_id ?? 0);
        }
        if ((a.sub_article_id ?? 0) !== (b.sub_article_id ?? 0)) {
          return (a.sub_article_id ?? 0) - (b.sub_article_id ?? 0);
        }
        if ((a.section_id ?? 0) !== (b.section_id ?? 0)) {
          return (a.section_id ?? 0) - (b.section_id ?? 0);
        }
        if ((a.clause_id ?? 0) !== (b.clause_id ?? 0)) {
          return (a.clause_id ?? 0) - (b.clause_id ?? 0);
        }
        if ((a.item_id ?? 0) !== (b.item_id ?? 0)) {
          return (a.item_id ?? 0) - (b.item_id ?? 0);
        }
        if ((a.sub_item_id ?? 0) !== (b.sub_item_id ?? 0)) {
          return (a.sub_item_id ?? 0) - (b.sub_item_id ?? 0);
        }
        return 0;
      })
      .map(article => {
        const fields = [
          article.uuid,
          article.code,
          article.chapter_id,
          article.article_id,
          article.sub_article_id,
          article.section_id,
          article.clause_id,
          article.item_id,
          article.sub_item_id,
          article.content
        ];
        return fields.join('\t');
      })
      .join('\n');
    setBulkEditText(textData);
  };

  const handleBulkEditSave = async () => {
    try {
      const rows = bulkEditText.split('\n').filter(row => row.trim());
      const newArticles = rows.map(row => {
        const [
          uuid,
          code,
          chapter_id,
          article_id,
          sub_article_id,
          section_id,
          clause_id,
          item_id,
          sub_item_id,
          content
        ] = row.split('\t');

        const article = {
          ...initialArticle,
          uuid: uuid && isValidUUID(uuid) ? uuid : generateUUID(),
          code: code ? Number(code) : undefined,
          chapter_id: chapter_id ? Number(chapter_id) : undefined,
          article_id: article_id ? Number(article_id) : undefined,
          sub_article_id: sub_article_id ? Number(sub_article_id) : undefined,
          section_id: section_id ? Number(section_id) : undefined,
          clause_id: clause_id ? Number(clause_id) : undefined,
          item_id: item_id ? Number(item_id) : undefined,
          sub_item_id: sub_item_id ? Number(sub_item_id) : undefined,
          content: content || '',
          law_number: selectedRegulation ?? undefined
        };
        
        // 生成 id
        return { ...article, id: generateId(article) };
      });

      // 先更新前端狀態
      setTempArticles(newArticles);
      
      // 發送到後端
      try {
        const response = await fetch(`${API_URL}/api/bulk-update-articles/${selectedRegulation}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newArticles),
        });

        if (response.ok) {
          alert('批量更新成功！');
          setBulkEditMode(false);
          fetchArticles(); // 重新獲取最新數據
        } else {
          console.log(newArticles);
          alert('批量更新失敗，請檢查數據格式');
        }
      } catch (error) {
        console.error('Error updating articles:', error);
        alert('更新過程中發生錯誤');
      }
    } catch (error) {
      alert('格式錯誤，請檢查輸入格式');
      console.error('Bulk edit error:', error);
    }
  };

  // 添加新的處理函數
  const handleSaveAll = async () => {
    // 找出所有被修改過的條文
    const modifiedArticles = tempArticles.filter((tempArticle, index) => {
      const originalArticle = articles[index];
      return JSON.stringify(tempArticle) !== JSON.stringify(originalArticle);
    });

    if (modifiedArticles.length === 0) {
      alert('沒有需要儲存的修改');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/bulk-update-articles/${selectedRegulation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modifiedArticles),
      });

      if (response.ok) {
        alert('所有修改已成功儲存！');
        fetchArticles(); // 重新獲取資料
      } else {
        alert('儲存失敗，請稍後再試');
      }
    } catch (error) {
      console.error('Error saving all changes:', error);
      alert('儲存過程中發生錯誤');
    }
  };

  // 添加向上插入一列的函數
  const handleInsertAbove = (uuid: string) => {
    const currentArticle = tempArticles.find(article => article.uuid === uuid);
    if (!currentArticle) return;
    
    const newArticle = { ...initialArticle,
      // 如果 編 不為空值 且 章 為空值 則 設定 編為 前項的編+1
      code: (currentArticle?.code ?? 0) && !currentArticle?.chapter_id ? (currentArticle?.code ?? 0) : currentArticle?.code,
      // 如果 章 不為空值 且 條 為空值 則 設定 章為 前項的章+1
      chapter_id: (currentArticle?.chapter_id ?? 0) && !currentArticle?.article_id ? (currentArticle?.chapter_id ?? 0) : currentArticle?.chapter_id,
      // 如果 條 不為空值 則 設定 條為 前項的條+1
      article_id: (currentArticle?.article_id ?? 0) && !(currentArticle?.sub_article_id ?? 0) && !currentArticle?.section_id ? (currentArticle?.article_id ?? 0) : currentArticle?.article_id,
      // 如果 條次 不為空值 則 設定 條次為 前項的條次+1
      sub_article_id: (currentArticle?.sub_article_id ?? 0) && !currentArticle?.section_id ? (currentArticle?.sub_article_id ?? 0) : currentArticle?.sub_article_id,
      // 如果 項 不為空值 則 設定 項為 前項的項+1
      section_id: (currentArticle?.section_id ?? 0) && !currentArticle?.clause_id ? (currentArticle?.section_id ?? 0) : currentArticle?.section_id,
      // 如果 款 不為空值 則 設定 款為 前項的款+1
      clause_id: (currentArticle?.clause_id ?? 0) && !currentArticle?.item_id ? (currentArticle?.clause_id ?? 0) : currentArticle?.clause_id,
      // 如果 目 不為空值 則 設定 目為 前項的目+1
      item_id: (currentArticle?.item_id ?? 0) && !currentArticle?.sub_item_id ? (currentArticle?.item_id ?? 0) : currentArticle?.item_id,
      // 如果 目之 不為空值 則 設定 目之為 前項的目之+1
      sub_item_id: (currentArticle?.sub_item_id ?? undefined) && (currentArticle?.sub_item_id ?? 0),
      uuid: generateUUID(),
      law_number: selectedRegulation ?? 4999 // 4999作為錯誤值
    };
    
    setTempArticles([...tempArticles, {...newArticle, id: generateId(newArticle)}]);
  };

  // 添加向下插入一列的函數
  const handleInsertBelow = (uuid: string) => {
    const currentArticle = tempArticles.find(article => article.uuid === uuid);
    if (!currentArticle) return;
    
    const newArticle = { ...initialArticle,
      // 如果 編 不為空值 且 章 為空值 則 設定 編為 前項的編+1
      code: (currentArticle?.code ?? 0) && !currentArticle?.chapter_id ? (currentArticle?.code ?? 0) : currentArticle?.code,
      // 如果 章 不為空值 且 條 為空值 則 設定 章為 前項的章+1
      chapter_id: (currentArticle?.chapter_id ?? 0) && !currentArticle?.article_id ? (currentArticle?.chapter_id ?? 0) : currentArticle?.chapter_id,
      // 如果 條 不為空值 則 設定 條為 前項的條+1
      article_id: (currentArticle?.article_id ?? 0) && !(currentArticle?.sub_article_id ?? 0) && !currentArticle?.section_id ? (currentArticle?.article_id ?? 0) : currentArticle?.article_id,
      // 如果 條次 不為空值 則 設定 條次為 前項的條次+1
      sub_article_id: (currentArticle?.sub_article_id ?? 0) && !currentArticle?.section_id ? (currentArticle?.sub_article_id ?? 0) : currentArticle?.sub_article_id,
      // 如果 項 不為空值 則 設定 項為 前項的項+1
      section_id: (currentArticle?.section_id ?? 0) && !currentArticle?.clause_id ? (currentArticle?.section_id ?? 0) : currentArticle?.section_id,
      // 如果 款 不為空值 則 設定 款為 前項的款+1
      clause_id: (currentArticle?.clause_id ?? 0) && !currentArticle?.item_id ? (currentArticle?.clause_id ?? 0) : currentArticle?.clause_id,
      // 如果 目 不為空值 則 設定 目為 前項的目+1
      item_id: (currentArticle?.item_id ?? 0) && !currentArticle?.sub_item_id ? (currentArticle?.item_id ?? 0) : currentArticle?.item_id,
      // 如果 目之 不為空值 則 設定 目之為 前項的目之+1
      sub_item_id: (currentArticle?.sub_item_id ?? undefined) && (currentArticle?.sub_item_id ?? 0),
      uuid: generateUUID(),
      law_number: selectedRegulation ?? 4999 // 4999作為錯誤值
    };
    
    setTempArticles([...tempArticles, {...newArticle, id: generateId(newArticle)}]);
  };

  // 檢查是否有重複的條文
  const isDuplicate = (article: Article, index: number) => {
    return tempArticles.some((compareArticle, compareIndex) => {
      if (index === compareIndex) return false; // 不與自己比較
      
      return (
        (article.code ?? 0) === (compareArticle.code ?? 0) &&
        (article.chapter_id ?? 0) === (compareArticle.chapter_id ?? 0) &&
        (article.article_id ?? 0) === (compareArticle.article_id ?? 0) &&
        (article.sub_article_id ?? 0) === (compareArticle.sub_article_id ?? 0) &&
        (article.section_id ?? 0) === (compareArticle.section_id ?? 0) &&
        (article.clause_id ?? 0) === (compareArticle.clause_id ?? 0) &&
        (article.item_id ?? 0) === (compareArticle.item_id ?? 0) &&
        (article.sub_item_id ?? 0) === (compareArticle.sub_item_id ?? 0)
      );
    });
  };

  const handleDeleteConfirmChange = () => {
    setdeleteConfirm(!deleteConfirm);
  };

  // 添加 UUID 驗證函數
  function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // 新增切換編輯模式的處理函數
  const toggleBulkEditMode = () => {
    if (bulkEditMode) {
      // 從純文字模式切換回一般模式
      try {
        const rows = bulkEditText.split('\n').filter(row => row.trim());
        const newArticles = rows.map(row => {
          const [
            uuid,
            code,
            chapter_id,
            article_id,
            sub_article_id,
            section_id,
            clause_id,
            item_id,
            sub_item_id,
            content
          ] = row.split('\t');

          return {
            ...initialArticle,
            uuid: uuid && isValidUUID(uuid) ? uuid : generateUUID(),
            code: code ? Number(code) : undefined,
            chapter_id: chapter_id ? Number(chapter_id) : undefined,
            article_id: article_id ? Number(article_id) : undefined,
            sub_article_id: sub_article_id ? Number(sub_article_id) : undefined,
            section_id: section_id ? Number(section_id) : undefined,
            clause_id: clause_id ? Number(clause_id) : undefined,
            item_id: item_id ? Number(item_id) : undefined,
            sub_item_id: sub_item_id ? Number(sub_item_id) : undefined,
            content: content || '',
            law_number: selectedRegulation ?? undefined,
            id: '' // 稍後會生成
          };
        });

        // 為每個條文生成 id
        const articlesWithIds = newArticles.map(article => ({
          ...article,
          id: generateId(article)
        }));

        setTempArticles(articlesWithIds);
      } catch (error) {
        alert('格式錯誤，無法切換回一般模式');
        console.error('Error parsing bulk edit text:', error);
        return; // 如果解析失敗，不切換模式
      }
    }
    setBulkEditMode(!bulkEditMode);
  };

  // 檢查條文是否被修改過
  const isArticleModified = (article: Article, uuid: string) => {
    const originalArticle = articles.find(a => a.uuid === uuid);
    if (!originalArticle) return true; // 新增的條文
    
    // 將 undefined 和 null 轉換為 0 進行比較
    const normalize = (value: number | undefined | null | '') => (!value ? 0 : value);
    // 比較所有相關欄位
    return (
      normalize(article.code) !== normalize(originalArticle.code) ||
      normalize(article.chapter_id) !== normalize(originalArticle.chapter_id) ||
      normalize(article.article_id) !== normalize(originalArticle.article_id) ||
      normalize(article.sub_article_id) !== normalize(originalArticle.sub_article_id) ||
      normalize(article.section_id) !== normalize(originalArticle.section_id) ||
      normalize(article.clause_id) !== normalize(originalArticle.clause_id) ||
      normalize(article.item_id) !== normalize(originalArticle.item_id) ||
      normalize(article.sub_item_id) !== normalize(originalArticle.sub_item_id) ||
      String(article.content) !== String(originalArticle.content)
    );
  };

  // 添加復原功能
  const handleRestore = (article: Article) => {
    const originalArticle = articles.find(a => a.uuid === article.uuid);
    
    if (!originalArticle) return;
    
    const newArticles = tempArticles.map(a => {
      if (a.uuid === article.uuid) {
        return {
          ...originalArticle,
          uuid: originalArticle.uuid // 確保 UUID 不變
        };
      }
      return a;
    });
    
    setTempArticles(newArticles);
    toast.success('已復原到修改前狀態');
  };

  // 在渲染条文之前添加这个函数
  const getModifiedFields = (article: Article, uuid: string) => {
    const originalArticle = articles.find(a => a.uuid === uuid);
    if (!originalArticle) return [];
    
    const fields = [
      { key: 'code', label: '編' },
      { key: 'chapter_id', label: '章' },
      { key: 'article_id', label: '條' },
      { key: 'sub_article_id', label: '條之' },
      { key: 'section_id', label: '項' },
      { key: 'clause_id', label: '款' },
      { key: 'item_id', label: '目' },
      { key: 'sub_item_id', label: '目之' },
      { key: 'content', label: '內容' }
    ];
    
    return fields.filter(f => article[f.key as keyof Article] !== originalArticle[f.key as keyof Article]);
  };

  const handleDelete = (uuid: string) => {
    const newArticles = tempArticles.filter(article => article.uuid !== uuid);
    setTempArticles(newArticles);
  };

  return (
    <div className='m-4'>
      <Toaster 
        position="top-right"
        toastOptions={{
          // 設定預設樣式
          success: {
            duration: 3000,
            style: {
              background: 'green',
              color: 'white',
            },
          },
          error: {
            duration: 3000,
            style: {
              background: 'red',
              color: 'white',
            },
          },
          loading: {
            style: {
              background: 'yellow',
              color: 'black',
            },
          },
        }}
      />
      {selectedItems.size > 0 && (
        <div className="fixed bottom-4 right-4 bg-white p-4 shadow-lg rounded-lg">
          <span className="mr-4">已選擇 {selectedItems.size} 項</span>
          <button
            onClick={handleBulkDelete}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            批量刪除
          </button>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate('/')}
          className="bg-gray-500 text-white px-4 py-2 rounded mr-4"
        >
          返回法規管理
        </button>
        <h1>純文字模式</h1>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={deleteConfirm}
              onChange={handleDeleteConfirmChange}
            />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-900">刪除重複確認</span>
          </label>
          <button 
            onClick={handleSaveAll}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            全部儲存
          </button>
          <button 
            onClick={togglePreviewMode}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isPreviewMode ? '返回編輯' : '預覽'}
          </button>
          <button 
            onClick={bulkEditMode ? toggleBulkEditMode : handleBulkEdit}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            {bulkEditMode ? '返回一般模式' : '切換純文字模式'}
          </button>
        </div>
      </div>
      
      {isPreviewMode ? renderPreview() : (
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
              {isFold ? '展開內容' : '摺疊內容'}
            </button>
          </div>
          
          {bulkEditMode ? (
            <div className="mb-4">
              <textarea
                value={bulkEditText}
                onChange={(e) => setBulkEditText(e.target.value)}
                className="w-full h-[600px] p-4 border rounded font-mono"
                style={{ whiteSpace: 'pre' }}
              />
            </div>
          ) : (
            <div>
              <div className="mb-4 border-b pb-4">
                <div className="flex gap-1">
                  {!foldSet.has('code') && (
                    <div className='w-12'>
                      <label>編</label>
                    </div>
                  )}
                  {!foldSet.has('chapter_id') && (
                  <div className='w-12'>
                    <label>章</label>
                  </div>
                  )}
                  {!foldSet.has('article_id') && (
                  <div className='w-12'>
                    <label>條</label>
                  </div>
                  )}
                  {!foldSet.has('sub_article_id') && (
                    <div className='w-12'>
                      <label>條之</label>
                    </div>
                  )}
                  {!foldSet.has('section_id') && (
                    <div className='w-12'>
                      <label>項</label>
                    </div>
                  )}
                  {!foldSet.has('clause_id') && (
                    <div className='w-12'>
                      <label>款</label>
                    </div>
                  )}
                  {!foldSet.has('item_id') && (
                    <div className='w-12'>
                      <label>目</label>
                    </div>
                  )}
                  {!foldSet.has('sub_item_id') && (
                    <div className='w-12'>
                      <label>目之</label>
                    </div>
                  )}
                  <div className='w-[800px]'>
                    <label>條文內容</label>
                  </div> 
                </div>
              </div>

              {tempArticles
                .sort((a, b) => {
                  // 依序比較各個層級
                  // 編
                  if ((a.code ?? 0) !== (b.code ?? 0)) {
                    return (a.code ?? 0) - (b.code ?? 0);
                  }
                  // 章
                  if ((a.chapter_id ?? 0) !== (b.chapter_id ?? 0)) {
                    return (a.chapter_id ?? 0) - (b.chapter_id ?? 0);
                  }
                  // 條
                  if ((a.article_id ?? 0) !== (b.article_id ?? 0)) {
                    return (a.article_id ?? 0) - (b.article_id ?? 0);
                  }
                  // 條之
                  if ((a.sub_article_id ?? 0) !== (b.sub_article_id ?? 0)) {
                    return (a.sub_article_id ?? 0) - (b.sub_article_id ?? 0);
                  }
                  // 項
                  if ((a.section_id ?? 0) !== (b.section_id ?? 0)) {
                    return (a.section_id ?? 0) - (b.section_id ?? 0);
                  }
                  // 款
                  if ((a.clause_id ?? 0) !== (b.clause_id ?? 0)) {
                    return (a.clause_id ?? 0) - (b.clause_id ?? 0);
                  }
                  // 目
                  if ((a.item_id ?? 0) !== (b.item_id ?? 0)) {
                    return (a.item_id ?? 0) - (b.item_id ?? 0);
                  }
                  // 目之
                  if ((a.sub_item_id ?? 0) !== (b.sub_item_id ?? 0)) {
                    return (a.sub_item_id ?? 0) - (b.sub_item_id ?? 0);
                  }
                  // 條文內容空白優先
                  if (a.content !== b.content) {
                    return a.content.length + b.content.length;
                  }

                  return 0;
                })
                .map((article, index) => {
                  const isDuplicateArticle = isDuplicate(article, index);
                  const isModified = isArticleModified(article, article.uuid);
                  
                  const modifiedFields = getModifiedFields(article, article.uuid);
                  
                  return (
                    <div key={article.uuid} className="border-b">
                      <div 
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className="flex gap-1 items-center"
                      >
                        <div className={"flex gap-1"}>
                          {!foldSet.has('code') && (
                            <div className='w-12'>
                              <input 
                                type="number" 
                                id="code" 
                                name="code"
                                className={`bg-gray-50 border ${isDuplicateArticle ? 'border-red-300' : isModified ? 'border-orange-300' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                                value={article.code}
                                onChange={(e) => handleInputChange(article.uuid, e)}
                                placeholder="編"
                              />
                            </div>
                          )}
                          {!foldSet.has('chapter_id') && (
                          <div className='w-12'>
                            <input 
                              type="number" 
                              id="chapter_id"
                              name="chapter_id"
                              className={`bg-gray-50 border ${isDuplicateArticle ? 'border-red-300' : isModified ? 'border-orange-300' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                              value={article.chapter_id}
                              onChange={(e) => handleInputChange(article.uuid, e)}
                              placeholder="章"
                            />
                          </div>
                          )}
                          {!foldSet.has('article_id') && (
                          <div className='w-12'>
                            <input 
                              type="number" 
                              id="article_id" 
                              name="article_id"
                              className={`bg-gray-50 border ${isDuplicateArticle ? 'border-red-300' : isModified ? 'border-orange-300' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                              value={article.article_id}
                              onChange={(e) => handleInputChange(article.uuid, e)}
                              placeholder="條"
                            />
                          </div>
                          )}
                          {!foldSet.has('sub_article_id') && (
                          <div className='w-12'>
                            <input 
                              type="number" 
                              id="sub_article_id" 
                              name="sub_article_id"
                              className={`bg-gray-50 border ${isDuplicateArticle ? 'border-red-300' : isModified ? 'border-orange-300' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                              value={article.sub_article_id}
                              onChange={(e) => handleInputChange(article.uuid, e)}
                              placeholder="條之"
                            />
                          </div>
                          )}
                          {!foldSet.has('section_id') && (
                          <div className='w-12'>
                            <input 
                              type="number" 
                              id="section_id" 
                              name="section_id"
                              className={`bg-gray-50 border ${isDuplicateArticle ? 'border-red-300' : isModified ? 'border-orange-300' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                              value={article.section_id}
                              onChange={(e) => handleInputChange(article.uuid, e)}
                              placeholder="項"
                            />
                          </div>
                          )}
                          {!foldSet.has('clause_id') && (
                          <div className='w-12'>
                            <input 
                              type="number" 
                              id="clause_id" 
                              name="clause_id"
                              className={`bg-gray-50 border ${isDuplicateArticle ? 'border-red-300' : isModified ? 'border-orange-300' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                              value={article.clause_id}
                              onChange={(e) => handleInputChange(article.uuid, e)}
                              placeholder="款"
                            />
                          </div>
                          )}
                          {!foldSet.has('item_id') && (
                          <div className='w-12'>
                            <input 
                              type="number" 
                              id="item_id" 
                              name="item_id"
                              className={`bg-gray-50 border ${isDuplicateArticle ? 'border-red-300' : isModified ? 'border-orange-300' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                              value={article.item_id}
                              onChange={(e) => handleInputChange(article.uuid, e)}
                              placeholder="目"
                            />
                          </div>
                          )}
                          {!foldSet.has('sub_item_id') && (
                          <div className='w-12'>
                            <input 
                              type="number" 
                              id="sub_item_id" 
                              name="sub_item_id"
                              className={`bg-gray-50 border ${isDuplicateArticle ? 'border-red-300' : isModified ? 'border-orange-300' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                              value={article.sub_item_id}
                              onChange={(e) => handleInputChange(article.uuid, e)}
                              placeholder="目之○"
                            />
                          </div>
                          )}
                          <div className='w-[1000px]'>
                            <input
                              type="text"
                              id="content"
                              name="content"
                              className={`bg-gray-50 border ${isDuplicateArticle ? 'border-red-300' : isModified ? 'border-orange-300' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                              value={article.content}
                              onChange={(e) => handleInputChange(article.uuid, e)}
                              placeholder="條文內容"
                            />
                          </div>
                          <div 
                            className="relative flex items-center gap-2"
                          >
                            {hoveredIndex === index && (
                              <>
                                <button
                                  type="button"
                                  className="bg-red-500 text-white px-4 py-2 rounded-md text-sm opacity-70 hover:opacity-100"
                                  onClick={() => handleRemoveRow(article?.uuid)}
                                >
                                  刪除
                                </button>
                                {/* <button
                                  type="button"
                                  className="bg-blue-500 text-white px-2 py-2 rounded-md text-sm opacity-70 hover:opacity-100"
                                  onClick={() => handleInsertAbove(article?.uuid)}
                                >
                                  向上插入
                                </button> */}
                                <button
                                  type="button"
                                  className="bg-blue-500 text-white px-2 py-2 rounded-md text-sm opacity-70 hover:opacity-100"
                                  onClick={() => handleInsertBelow(article?.uuid)}
                                >
                                  向下插入
                                </button>
                              {isModified && modifiedFields.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleRestore(article)}
                                  className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm opacity-70 hover:opacity-100"
                                  title="復原到修改前狀態"
                                >
                                  復原
                                </button>
                              )}
                              </>
                            )}
                          </div>
                          {isDuplicateArticle && (
                            <div className="text-red-500 text-sm ml-2 flex items-center">
                              警告：此條文編號與其他條文重複
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default BulkEdit;
