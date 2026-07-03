// Authentication Module
const Auth = {
  // Check if user is logged in
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  // Get current user data
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Login handler
  async login(email, password) {
    try {
      const response = await API.login(email, password);
      const { data } = response;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Logout handler
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  },

  // Initialize auth check
  init() {
    if (!this.isLoggedIn()) {
      const currentPage = window.location.pathname;
      if (!currentPage.includes('login.html')) {
        window.location.href = 'login.html';
      }
      return false;
    }
    return true;
  },

  // Update header user info
  updateHeaderUser() {
    const user = this.getUser();
    if (!user) return;

    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    const userAvatarEl = document.getElementById('userAvatar');

    if (userNameEl) userNameEl.textContent = user.name;
    if (userRoleEl) userRoleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    if (userAvatarEl) userAvatarEl.textContent = user.name.charAt(0).toUpperCase();
  },

  // Handle login form
  handleLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('loginError');
      const submitBtn = form.querySelector('button[type="submit"]');

      // Reset error
      if (errorEl) errorEl.style.display = 'none';
      
      // Disable button and show loading
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

      const result = await this.login(email, password);

      if (result.success) {
        window.location.href = 'dashboard.html';
      } else {
        if (errorEl) {
          errorEl.textContent = result.message;
          errorEl.style.display = 'block';
        }
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
      }
    });
  },
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check if on login page
  if (window.location.pathname.includes('login.html')) {
    Auth.handleLoginForm();
    return;
  }

  // Protected pages
  if (!Auth.init()) return;
  Auth.updateHeaderUser();
});