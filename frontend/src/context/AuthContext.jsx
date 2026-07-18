import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const normalizeDoctor = (doctorData) => {
  if (!doctorData) return null;
  const isActive = doctorData.isActive ?? doctorData.active ?? false;
  return {
    ...doctorData,
    isActive,
    role: doctorData.role || 'Doctor',
  };
};

export const AuthProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from sessionStorage
    const token = sessionStorage.getItem('accessToken');
    const storedDoctor = sessionStorage.getItem('doctor');
    if (token && storedDoctor) {
      try {
        setDoctor(normalizeDoctor(JSON.parse(storedDoctor)));
      } catch (e) {
        sessionStorage.removeItem('doctor');
      }
    }
    setLoading(false);
  }, []);

  const register = useCallback(async (data) => {
    const response = await api.post('/auth/register', data);
    const { accessToken, doctor: doctorData } = response.data.data || {};
    const nextDoctor = normalizeDoctor(doctorData);
    if (accessToken) {
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('doctor', JSON.stringify(nextDoctor));
      setDoctor(nextDoctor);
    }
    return nextDoctor;
  }, []);

  const login = useCallback(async (data) => {
    const response = await api.post('/auth/login', data);
    const { accessToken, doctor: doctorData } = response.data.data;
    const nextDoctor = normalizeDoctor(doctorData);
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('doctor', JSON.stringify(nextDoctor));
    setDoctor(nextDoctor);
    return nextDoctor;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Logout even if API fails
    } finally {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('doctor');
      setDoctor(null);
    }
  }, []);

  const updateDoctor = useCallback((updatedDoctor) => {
    const nextDoctor = normalizeDoctor(updatedDoctor);
    setDoctor(nextDoctor);
    sessionStorage.setItem('doctor', JSON.stringify(nextDoctor));
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await api.get('/doctor/profile');
      const updatedDoctor = response.data.data;
      updateDoctor(updatedDoctor);
      return updatedDoctor;
    } catch (e) {
      console.error('Failed to refresh profile:', e);
    }
  }, [updateDoctor]);

  const isAuthenticated = !!doctor;

  return (
    <AuthContext.Provider value={{
      doctor,
      loading,
      isAuthenticated,
      register,
      login,
      logout,
      updateDoctor,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
