import { User } from '../types';

export const mockLogin = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock authentication logic
  if (email === 'admin@devtasker.com' && password === 'admin123') {
    return {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'admin@devtasker.com',
        role: 'admin',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
      token: 'mock-jwt-token-admin',
    };
  } else if (email === 'user@devtasker.com' && password === 'user123') {
    return {
      user: {
        id: '2',
        name: 'Jane Smith',
        email: 'user@devtasker.com',
        role: 'member',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
      token: 'mock-jwt-token-user',
    };
  } else {
    throw new Error('Invalid credentials');
  }
};

export const mockSignUp = async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock signup logic
  const user: User = {
    id: Date.now().toString(),
    name,
    email,
    role: 'member',
  };
  
  return {
    user,
    token: `mock-jwt-token-${user.id}`,
  };
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  return { isValid: true, message: '' };
};