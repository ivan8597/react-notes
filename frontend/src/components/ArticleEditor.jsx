import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../editor-styles.css';
import FileUploader from './FileUploader';
import { notify } from '../App';

// Настройки модулей ReactQuill
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],  // заголовки
    ['bold', 'italic', 'underline', 'strike'],   // форматирование текста
    [{ 'list': 'ordered'}, { 'list': 'bullet' }], // списки
    ['blockquote', 'code-block'],               // цитаты и код
    [{ 'indent': '-1'}, { 'indent': '+1' }],     // отступы
    [{ 'align': [] }],                          // выравнивание
    ['link'],                                   // ссылки
    ['clean']                                   // очистка форматирования
  ]
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'link',
  'blockquote', 'code-block',
  'align'
];

function ArticleEditor({ initialValue = '', initialTitle = '', initialImage = null, initialFiles = [], onSave }) {
  const [content, setContent] = useState(initialValue);
  const [title, setTitle] = useState(initialTitle);
  const [files, setFiles] = useState(initialFiles);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialImage ? `http://localhost:5001/${initialImage}` : null);
  const quillRef = useRef(null);

  // Обновляем файлы при изменении initialFiles
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      setFiles(initialFiles);
    }
  }, [initialFiles]);

  // Обработчик выбора изображения для обложки
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage);
      
      // Создаем URL для предпросмотра
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(selectedImage);
      
    
      notify.success('Изображение загружено');
    }
  };

  // Обработчик нажатия кнопки сохранения
  const handleSave = () => {
    if (!title.trim()) {
      notify.warning('Пожалуйста, введите заголовок статьи');
      return;
    }
    

    console.log('Сохранение статьи:', {
      title,
      content: content.substring(0, 50) + '...',
      files: files.length > 0 ? `${files.length} файлов` : 'нет файлов',
      image: image ? 'есть изображение' : 'нет изображения'
    });
    
    onSave({ title, content, files, image });
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="title" style={{ display: 'block', marginBottom: '5px' }}>Заголовок статьи:</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          placeholder="Введите заголовок статьи"
          required
        />
      </div>
      
      {/* Поле для загрузки изображения */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="image" style={{ display: 'block', marginBottom: '5px' }}>Изображение статьи:</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ marginBottom: '10px' }}
        />
        
        {/* Предпросмотр изображения */}
        {imagePreview && (
          <div style={{ marginTop: '10px' }}>
            <img 
              src={imagePreview} 
              alt="Предпросмотр" 
              style={{ maxWidth: '100%', maxHeight: '300px' }} 
            />
          </div>
        )}
      </div>
      
      <label style={{ display: 'block', marginBottom: '5px' }}>Содержание:</label>
      <div style={{ marginBottom: '30px' }}>
        <div className="quill-editor-container" style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
          <ReactQuill 
            ref={quillRef}
            value={content} 
            onChange={setContent} 
            modules={modules}
            formats={formats}
            theme="snow"
            style={{ 
              minHeight: '300px',
              fontSize: '16px',
              backgroundColor: '#fff'
            }}
          />
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          Используйте панель инструментов для форматирования текста. Доступны: заголовки, жирный, курсив, подчеркнутый текст, списки, цитаты и блоки кода.
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Файлы статьи:
          {files.length > 0 && (
            <span style={{ 
              marginLeft: '10px',
              fontSize: '14px',
              color: '#4CAF50',
              fontWeight: 'normal'
            }}>
              {files.length} {files.length === 1 ? 'файл добавлен' : 
                (files.length >= 2 && files.length <= 4) ? 'файла добавлено' : 'файлов добавлено'}
            </span>
          )}
        </label>
        <FileUploader 
          onFiles={setFiles} 
          initialFiles={initialFiles}
        />
      </div>
      
      <button 
        onClick={handleSave}
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          backgroundColor: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Сохранить
      </button>
    </div>
  );
}

export default ArticleEditor;