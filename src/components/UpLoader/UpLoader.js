import './UpLoader.css';
import { useDropzone } from 'react-dropzone';
import preloader from '../../images/preloader.gif'
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgressbar } from "react-circular-progressbar";
import {
  ADD_FILES,
  REMOVE_All_FILES,
  REMOVE_FILE,
  IS_MAX_FILES
} from '../../utils/constants';
import "react-circular-progressbar/dist/styles.css";

function UpLoader(props) {

  const dispatch = useDispatch();

  const selectedFiles = useSelector(state => state.selectedFiles.selectedFiles);
  const isMaxFiles = useSelector(state => state.maxFiles.isMaxFiles);
  const isLoading = useSelector(state => state.loading.isLoading);
  const isUploadSuccess = useSelector(state => state.uploadSuccess.isUploadSuccess);
  const isServerError = useSelector(state => state.serverError.isServerError);
  const isAuthError = useSelector(state => state.authError.isAuthError);
  const [progress, setProgress] = useState();
  console.log( progress)

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragAccept,
    isDragReject,
  } = useDropzone();

  const maxFiles = 100;
  const config = {
    onUploadProgress: (progressEvent) =>
      setProgress(
        parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100))
      ),
  };

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
        <div className="dropzone-progressbar">
          <CircularProgressbar
            value={progress ? progress : 0}
            strokeWidth="15"
            styles={progress == 0 && { path: { stroke: "#77b300" } }}
          />
        </div>
        <button className={`uploader__delete-btn ${isLoading ? 'uploader__delete-btn_invisible' : ''}`} type='button' aria-label='delete-btn' onClick={handleDeleteFile}></button>
      </li>
    )
  });

  useEffect(() => {
    if ((isServerError || isUploadSuccess || isAuthError) && acceptedFiles.length === 0) {
      props.deleteUploadInfo();
    }
  }, [acceptedFiles.length])

  useEffect(() => {
    if (acceptedFiles.length !== 0) {
      addSelectedFilesAction(acceptedFiles)
    }
  }, [acceptedFiles])

  useEffect(() => {
    if (selectedFiles.length <= maxFiles || selectedFiles.length === 0) {
      setIsMaxFilesAction(false);
    } else {
      setIsMaxFilesAction(true);
    }
  }, [selectedFiles.length])

  useEffect(() => {
    if (isUploadSuccess) {
      removeSelectedFilesAction();
    }
  }, [isUploadSuccess])

  function addSelectedFilesAction(acceptedFiles) {
    dispatch({ type: ADD_FILES, payload: acceptedFiles })
  }

  function removeSelectedFilesAction() {
    dispatch({ type: REMOVE_All_FILES, payload: [] })
  }

  function removeSelectedFileAction(file) {
    dispatch({ type: REMOVE_FILE, payload: file.path })
  }

  function setIsMaxFilesAction(condition) {
    dispatch({ type: IS_MAX_FILES, payload: condition })
  }

  function onSubmit() {
    props.deleteAuthError();
    const data = new FormData();

    selectedFiles.map((file) => {
      data.append('files', file);
    });
    props.upload(data, config);
  }

  function deleteFile(file) {
    removeSelectedFileAction(file);
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
      {isLoading
        ?
        <img className='uploader__preloader' src={preloader} alt='иконка загрузки' />
        :
        <button className={
          `uploader__button
        ${(selectedFiles.length !== 0 && selectedFiles.length <= maxFiles && !isUploadSuccess) ? '' : 'uploader__button_disabled'}`
        } type='submit' onClick={onSubmit}>Загрузить файлы на Я.Диск</button>
      }
      {isUploadSuccess && <p className='uploader__success-text'>Файлы успешно загружены</p>}
      {isServerError && <p className='uploader__error'>Что-то пошло не так</p>}
      {isAuthError && <p className='uploader__error'>Ошибка авторизации</p>}
      {!isUploadSuccess &&
        <aside className='uploader__files'>
          {
            selectedFiles.length === 0
              ?
              ''
              :
              <h3 className='uploader__files-title'>Список выбранных файлов</h3>
          }
          <ul className='uploader__filelist'>{files}</ul>
        </aside>
      }
      {
        !isMaxFiles
          ?
          ''
          :
          <p className='uploader__error'>Ошибка. Превышено максимально количество файлов</p>
      }
    </section>
  );
}

export default UpLoader;
