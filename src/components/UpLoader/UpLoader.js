import './UpLoader.css';
import { useDropzone } from 'react-dropzone';
import preloader from '../../images/preloader.gif'
import { useState, useEffect } from 'react';

function UpLoader(props) {

  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    maxFiles: 100
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  const files = selectedFiles.map(file => {

    function handleDeleteFile() {
      deleteFile(file)
    }

    return (
      <li className='uploader__file' key={file.path}>
        <div className='uploader__file-info'>
          <p className='uploader__file-name'>{file.path}</p>
          <p className='uploader__file-size'>{(file.size / 1000000).toFixed(3)} Мб</p>
        </div>
        <button className='uploader__delete-btn' type='button' aria-label='delete-btn' onClick={handleDeleteFile}></button>
      </li>
    )
  });

  useEffect(() => {
    if ((props.isServerError || props.isUploadSuccess || props.isAuthErro) && acceptedFiles.length === 0) {
      props.deleteUploadInfo();
    }
  }, [acceptedFiles.length])

  useEffect(() => {
    console.log(acceptedFiles);
    if (acceptedFiles.length !== 0) {
      setSelectedFiles((currentFiles) => currentFiles.concat([...acceptedFiles]).filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.path === value.path))))
    }
  }, [acceptedFiles])

  console.log(selectedFiles);

  function onSubmit() {
    const data = new FormData();
    selectedFiles.map((file) => {
      data.append('files', file);
    });

    props.upload(data);
  }

  function deleteFile(file) {
    setSelectedFiles((currentFiles) => currentFiles.filter((currentFile) => currentFile.path !== file.path));
  }

  return (
    <section className='uploader'>
      <div {...getRootProps({
        className: `uploader__dropzone
      ${isDragAccept ? 'uploader__dropzone_acceptStyle' : ''}
      ${isDragReject ? 'uploader__dropzone_rejectStyle' : ''}`
      })}>
        <input {...getInputProps()} />
        <h2 className='uploader__dropzone-title'>Перетащите файлы в эту область или нажмите, чтобы выбрать их</h2>
        <em className='uploader__dropzone-rule'>(Максимальное количество файлов - 100)</em>
      </div>
      {props.isLoading
        ?
        <img className='uploader__preloader' src={preloader} alt='иконка загрузки' />
        :
        <button className={`uploader__button ${acceptedFiles.length !== 0 ? '' : 'uploader__button_disabled'} ${props.isUploadSuccess ? 'uploader__button_disabled' : ''}`} type='submit' onClick={onSubmit}>Загрузить файлы на Я.Диск</button>
      }
      {props.isUploadSuccess && <p className='uploader__success-text'>Файлы успешно загружены</p>}
      {props.isServerError && <p className='uploader__error'>Что-то пошло не так</p>}
      {props.isAuthError && <p className='uploader__error'>Ошибка авторизации</p>}
      {!props.isUploadSuccess &&
        <aside className='uploader__files'>
          {selectedFiles.length === 0
            ?
            ''
            :
            <h3 className='uploader__files-title'>Список выбранных файлов</h3>
          }
          <ul className='uploader__filelist'>{files}</ul>
        </aside>
      }
      {
        fileRejections.length === 0
          ?
          ''
          :
          <p className='uploader__error'>Ошибка. Превышено максимально количество файлов</p>
      }
    </section>
  );
}

export default UpLoader;
