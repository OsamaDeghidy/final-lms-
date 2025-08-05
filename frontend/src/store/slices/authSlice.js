import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock user data
const MOCK_USERS = [{
  id: 1,
  name: 'Esraa Ahmed',
  email: 'esraaahmed00.ea@gmail.com',
  role: 'student',
  avatar: 'https://i.pravatar.cc/150?img=32',
  token: 'mock-jwt-token-for-testing'
}];

const MOCK_USER = MOCK_USERS[0];

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const userExists = MOCK_USERS.some(user => user.email === userData.email);
      if (userExists) {
        return rejectWithValue('User with this email already exists');
      }
      
      // Create new user
      const newUser = {
        id: MOCK_USERS.length + 1,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        role: userData.userType.toLowerCase(),
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
        token: `mock-jwt-token-${Date.now()}`,
        ...(userData.userType === 'Organization' && { organizationName: userData.organizationName }),
        ...(userData.userType === 'Instructor' && { bio: userData.bio })
      };
      
      // Add to mock users array
      MOCK_USERS.push(newUser);
      
      // Store token in localStorage
      localStorage.setItem('token', newUser.token);
      
      // Return user data without sensitive info
      const { password, confirmPassword, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Static accounts for login
export const STATIC_ACCOUNTS = {
  'admin@example.com': {
    id: 'admin-123',
    email: 'admin@example.com',
    name: 'مدير النظام',
    role: 'admin',
    password: '123456',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=random',
    token: 'mock-token-admin-123'
  },
  'teacher@example.com': {
    id: 'teacher-123',
    email: 'teacher@example.com',
    name: 'معلم نموذجي',
    role: 'teacher',
    password: '123456',
    avatar: 'https://ui-avatars.com/api/?name=Teacher+User&background=random',
    token: 'mock-token-teacher-123'
  },
  'student@example.com': {
    id: 'student-123',
    email: 'student@example.com',
    name: 'طالب نموذجي',
    role: 'student',
    password: '123456',
    avatar: 'https://ui-avatars.com/api/?name=Student+User&background=random',
    token: 'mock-token-student-123'
  }
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { email, password } = credentials;
      const userAccount = STATIC_ACCOUNTS[email];
      
      // Check if user exists and password matches
      if (userAccount && userAccount.password === password) {
        // Store token in localStorage
        localStorage.setItem('token', userAccount.token);
        localStorage.setItem('user', JSON.stringify(userAccount));
        localStorage.setItem('userRole', userAccount.role);
        
        // Return user data without password
        const { password: _, ...userWithoutPassword } = userAccount;
        return userWithoutPassword;
      }
      
      return rejectWithValue('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || 'فشل تسجيل الدخول';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || 'فشل إنشاء الحساب';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
