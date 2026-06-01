import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BlogList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // В реальном приложении здесь будет запрос к API
    // Для демо создадим моковые данные, так как бэкенд может быть не запущен
    const fetchArticles = async () => {
      try {
        // const response = await axios.get('/api/blog');
        // setArticles(response.data);
        
        // Моки
        setArticles([
          { slug: 'kak-vernut-dengi-za-onlajn-kurs-2026', title: 'Как вернуть деньги за онлайн-курс 2026', summary: 'Пошаговая инструкция по возврату средств за обучение.' },
          { slug: 'pretenziya-k-wildberries-za-uteryu-tovara-obrazec', title: 'Претензия к Wildberries за утерю товара', summary: 'Что делать, если маркетплейс потерял вашу поставку.' }
        ]);
      } catch (error) {
        console.error("Error fetching blog articles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center text-primary">База знаний ИИ-Юриста</h1>
      <p className="text-xl text-center text-muted-foreground mb-12">
        Полезные статьи и инструкции по решению юридических проблем в 2026 году.
      </p>

      {loading ? (
        <div className="text-center">Загрузка...</div>
      ) : (
        <div className="grid gap-8">
          {articles.map(article => (
            <div key={article.slug} className="bg-card p-6 rounded-lg shadow-sm border border-border hover:border-primary transition-colors">
              <h2 className="text-2xl font-semibold mb-2">
                <Link to={`/blog/${article.slug}`} className="hover:text-primary">
                  {article.title}
                </Link>
              </h2>
              <p className="text-muted-foreground mb-4">{article.summary}</p>
              <Link to={`/blog/${article.slug}`} className="text-primary font-medium flex items-center">
                Читать далее <span className="ml-1">→</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;
