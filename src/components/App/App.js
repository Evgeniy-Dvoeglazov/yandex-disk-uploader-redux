import './App.css';
import Header from '../Header/Header';
import UpLoader from '../UpLoader/UpLoader'
import Footer from '../Footer/Footer';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import EmptyPage from '../EmptyPage/EmptyPage';
import { apiDisk } from '../../utils/DiskApi';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  IS_LOADING,
  IS_UPLOAD_SUCCESS,
  IS_SERVER_ERROR,
  IS_AUTH,
  TOKEN,
  AUTH_ERROR
} from '../../utils/constants';

function App() {

  const dispatch = useDispatch();

  const isAuth = useSelector(state => state.auth.isAuth);
  const tokenInfo = useSelector(state => state.token.tokenInfo);

  function setIsLoadingAction(condition) {
    dispatch({ type: IS_LOADING, payload: condition })
  }

  function setIsUploadSuccessAction(condition) {
    dispatch({ type: IS_UPLOAD_SUCCESS, payload: condition })
  }

  function setIsServerErrorAction(condition) {
    dispatch({ type: IS_SERVER_ERROR, payload: condition })
  }

  function setIsAuthAction(condition) {
    dispatch({ type: IS_AUTH, payload: condition })
  }

  function addTokenAction(token) {
    dispatch({ type: TOKEN, payload: token })
  }

  function setIsAuthErrorAction(condition) {
    dispatch({ type: AUTH_ERROR, payload: condition })
  }

  function uploadFiles(data, tokenData) {

    const uploadfile = data.getAll('files');

    uploadfile.forEach((file) => {
      setIsLoadingAction(true);
      apiDisk.getUrl(file, tokenData)
        .then((res) => {
          setIsLoadingAction(true);
          apiDisk.uploadFiles(res.href, file)
            .then(() => {
              setIsUploadSuccessAction(true);
            })
            .catch((err) => {
              console.log(err);
              setIsServerErrorAction(true);
            })
            .finally(() => {
              setIsLoadingAction(false);
            });
        })
        .catch((err) => {
          console.log(err);
          setIsServerErrorAction(true);
          setIsLoadingAction(false);
        })
    })
  }

  function upload(data, config) {

    setIsLoadingAction(true);
    if (!isAuth) {
      window.YaAuthSuggest.init(
        {
          client_id: '7f347035f6f1453e910bd1e138b3e6f9',
          response_type: 'token',
          redirect_uri: 'https://yandex-disk-uploader.vercel.app/empty-page'
        },
        'https://yandex-disk-uploader.vercel.app', config
      )
        .then(({
          handler
        }) => handler())
        .then(tokenData => {
          console.log('Сообщение с токеном', tokenData);
          uploadFiles(data, tokenData);
          addTokenAction(tokenData);
          setIsAuthAction(true);
        })
        .catch(error => {
          console.log('Обработка ошибки', error);
          setIsAuthErrorAction(true);
          setIsLoadingAction(false);
        });
    }
    else {
      uploadFiles(data, tokenInfo);
    }
  }

  function deleteUploadInfo() {
    setIsUploadSuccessAction(false);
    setIsServerErrorAction(false);
    setIsAuthErrorAction(false);
  }

  function deleteAuthError() {
    setIsAuthErrorAction(false);
  }

  return (
    <div className='app'>
      <Routes>
        <Route path='/' element={
          <>
            <Header />
            <UpLoader
              upload={upload}
              deleteUploadInfo={deleteUploadInfo}
              deleteAuthError={deleteAuthError}
            />
            <Footer />
          </>
        } />
        <Route path='/empty-page' element={
          <EmptyPage />
        } />
        <Route path='*' element={
          <NotFoundPage />
        } />
      </Routes>
    </div>
  );
}

export default App;
