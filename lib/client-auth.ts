// Client-side authentication using localStorage
export const clientAuth = {
  // Store user data in localStorage
  signup: (email: string, password: string, name: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
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
  },

  // Login user
  login: (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  },

  // Get current user
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('currentUser');
  },

  // Check if logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('currentUser');
  }
};