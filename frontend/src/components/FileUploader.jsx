import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { notify } from '../App';

const FileUploader = ({ onFiles, initialFiles = [] }) => {
  const [files, setFiles] = useState([]);
  
  // Инициализация с начальными файлами
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      setFiles(initialFiles);
    }
  }, [initialFiles]);

  const onDrop = useCallback(acceptedFiles => {
    console.log('Файлы перетащены:', acceptedFiles);
    
    if (acceptedFiles && acceptedFiles.length > 0) {
      // Обновляем состояние файлов
      const newFiles = [...files, ...acceptedFiles];
      setFiles(newFiles);
      
      // Вызываем функцию с новыми файлами
      onFiles(newFiles);
      
      // Показываем уведомление
      notify.success(`Файл${acceptedFiles.length > 1 ? 'ы' : ''} успешно добавлен${acceptedFiles.length > 1 ? 'ы' : ''}`);
    } else {
      console.warn('Нет принятых файлов');
    }
  }, [files, onFiles]);

  // Удаление файла из списка
  const removeFile = (indexToRemove) => {
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(newFiles);
    onFiles(newFiles);
    notify.info('Файл удален из списка');
  };

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({ 
    onDrop,
    // Добавляем обработчики событий для отладки
    onDragEnter: () => console.log('Файл над областью загрузки'),
    onDragLeave: () => console.log('Файл покинул область загрузки'),
    onDropAccepted: files => console.log('Файлы приняты:', files),
    onDropRejected: fileRejections => console.log('Файлы отклонены:', fileRejections),
    // Отключаем проверку MIME типов для принятия любых файлов
    accept: undefined,
    // Разрешаем загрузку нескольких файлов
    multiple: true
  });

  // Стили для области перетаскивания
  const dropzoneStyle = {
    border: '2px dashed #aaa',
    padding: 20,
    margin: '10px 0',
    backgroundColor: isDragActive ? 
      (isDragAccept ? '#e8f5e9' : isDragReject ? '#ffebee' : '#f0f8ff') : 
      'transparent',
    borderColor: isDragActive ? 
      (isDragAccept ? '#4caf50' : isDragReject ? '#f44336' : '#4a90e2') : 
      '#aaa',
    transition: 'all 0.2s ease',
    textAlign: 'center',
    cursor: 'pointer',
    outline: 'none',
    borderRadius: '4px'
  };

  return (
    <div>
      <div 
        {...getRootProps()} 
        style={dropzoneStyle}
      >
        <input {...getInputProps()} />
        <p style={{ margin: 0 }}>
          {isDragActive
            ? (isDragAccept 
                ? 'Отпустите файлы, чтобы загрузить их...' 
                : 'Некоторые файлы не могут быть загружены...')
            : 'Перетащите файлы сюда или нажмите для выбора'}
        </p>
        <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
          Поддерживаются файлы любого типа и размера
        </p>
      </div>
      
      {/* Список загруженных файлов */}
      {files.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <h4 style={{ margin: '10px 0' }}>Загруженные файлы ({files.length}):</h4>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {files.map((file, index) => (
              <li 
                key={index} 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  marginBottom: '5px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span role="img" aria-label="Файл" style={{ marginRight: '10px' }}>
                    📄
                  </span>
                  <div>
                    <div>{file.name || file.split('/').pop()}</div>
                    {file.size && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(index)}
                  style={{
                    backgroundColor: '#ff5252',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FileUploader;