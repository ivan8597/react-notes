import { jwtDecode } from "jwt-decode";


export const saveToken = (token) => {
  try {
    localStorage.setItem('token', token);
    console.log('Токен успешно сохранен в localStorage');
  } catch (error) {
    console.error('Ошибка при сохранении токена:', error);
  }
};


export const getToken = () => {
  try {
    const token = localStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Ошибка при получении токена:', error);
    return null;
  }
};


export const removeToken = () => {
  try {
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Ошибка при удалении токена:', error);
  }
};

// Проверка авторизован ли пользователь
export const isAuthenticated = () => {
  try {
    const token = getToken();
    if (!token) {
      console.log('Токен отсутствует - пользователь не авторизован');
      return false;
    }
    
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const isValid = decoded.exp > currentTime;
    
    if (!isValid) {
      console.log('Токен просрочен:', {
        expires: new Date(decoded.exp * 1000).toLocaleString(),
        now: new Date(currentTime * 1000).toLocaleString()
      });
    }
    
    return isValid;
  } catch (error) {
    console.error('Ошибка при проверке авторизации:', error);
    return false;
  }
};

// Получение ID пользователя из токена
export const getUserId = () => {
  try {
    const token = getToken();
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.userId;
  } catch (error) {
    console.error('Ошибка при получении ID пользователя:', error);
    return null;
  }
};