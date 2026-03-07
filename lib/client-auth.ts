// Client-side authentication using localStorage
export const clientAuth = {
  // Store user data in localStorage
  signup: (email: string, password: string, name: string) => {
    if (typeof window === 'undefined') {
      throw new Error('Not available on server');
    }
    
    try {
      const usersData = localStorage.getItem('users');
      let users = [];
      
      if (usersData) {
        try {
          users = JSON.parse(usersData);
        } catch {
          users = [];
        }
      }
      
      // Ensure users is an array
      if (!Array.isArray(users)) {
        users = [];
      }
      
      // Check if user already exists
      if (users.find((u: any) => u.email === email)) {
        throw new Error('User already exists');
      }
      
      // Add new user
      const newUser = { email, password, name, id: Date.now().toString() };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Set current user
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      return newUser;
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.message === 'User already exists') {
        throw error;
      }
      throw new Error('Signup failed: ' + error.message);
    }
  },

  // Login user
  login: (email: string, password: string) => {
    if (typeof window === 'undefined') {
      throw new Error('Not available on server');
    }
    
    try {
      const usersData = localStorage.getItem('users');
      let users = [];
      
      if (usersData) {
        try {
          users = JSON.parse(usersData);
        } catch {
          users = [];
        }
      }
      
      // Ensure users is an array
      if (!Array.isArray(users)) {
        users = [];
      }
      
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'Invalid credentials') {
        throw error;
      }
      throw new Error('Login failed: ' + error.message);
    }
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      // Clear invalid data
      localStorage.removeItem('currentUser');
      return null;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('currentUser');
  },

  // Check if logged in
  isLoggedIn: () => {
    try {
      return !!localStorage.getItem('currentUser');
    } catch (error) {
      return false;
    }
  }
};