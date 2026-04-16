// Simple client-side auth demo using localStorage
(function () {
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem('users') || '[]');
    } catch (e) { return []; }
  }
  function saveUsers(users) { localStorage.setItem('users', JSON.stringify(users)); }

  function showMessage(el, text, ok) {
    if (!el) return;
    el.textContent = text;
    el.style.color = ok ? '#b7d4a0' : '#f4b6b6';
  }

  // Register
  var regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = regForm.querySelector('#name').value.trim();
      var email = regForm.querySelector('#email').value.trim().toLowerCase();
      var pass = regForm.querySelector('#password').value;
      var conf = regForm.querySelector('#confirm').value;
      var msg = document.getElementById('reg-message');
      if (!name || !email || !pass) { showMessage(msg, 'Vui lòng điền đủ thông tin', false); return; }
      if (pass !== conf) { showMessage(msg, 'Mật khẩu không khớp', false); return; }
      var users = getUsers();
      if (users.find(u => u.email === email)) { showMessage(msg, 'Email đã được đăng ký', false); return; }
      users.push({ name: name, email: email, password: pass });
      saveUsers(users);
      showMessage(msg, 'Đăng ký thành công — chuyển tới trang đăng nhập...', true);
      setTimeout(function () { window.location.href = 'login.html'; }, 1200);
    });
  }

  // Login
  var loginForm = document.querySelector('.login-form');
  if (loginForm && document.location.pathname.endsWith('login.html')) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = loginForm.querySelector('#email').value.trim().toLowerCase();
      var pass = loginForm.querySelector('#password').value;
      var users = getUsers();
      var user = users.find(u => u.email === email && u.password === pass);
      var msg = document.getElementById('reg-message') || document.getElementById('login-message');
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify({ email: user.email, name: user.name }));
        showMessage(msg, 'Đăng nhập thành công — chuyển tới trang chủ...', true);
        setTimeout(function () { window.location.href = 'index.html'; }, 900);
      } else {
        showMessage(msg, 'Email hoặc mật khẩu không đúng', false);
      }
    });
  }

  // Forgot password
  var forgotForm = document.getElementById('forgot-form');
  if (forgotForm) {
    var resetArea = document.getElementById('reset-area');
    var messageEl = document.getElementById('forgot-message');
    forgotForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = forgotForm.querySelector('#email').value.trim().toLowerCase();
      var users = getUsers();
      var user = users.find(u => u.email === email);
      if (!resetArea.style.display || resetArea.style.display === 'none') {
        if (!user) { showMessage(messageEl, 'Không tìm thấy email', false); return; }
        showMessage(messageEl, 'Email hợp lệ — nhập mật khẩu mới', true);
        resetArea.style.display = 'block';
        return;
      }
      // second step: set new password
      var newp = forgotForm.querySelector('#newpass').value;
      var conf = forgotForm.querySelector('#confirmnew').value;
      if (!newp) { showMessage(messageEl, 'Nhập mật khẩu mới', false); return; }
      if (newp !== conf) { showMessage(messageEl, 'Mật khẩu không khớp', false); return; }
      // update
      user.password = newp;
      saveUsers(users);
      showMessage(messageEl, 'Đổi mật khẩu thành công — chuyển tới đăng nhập...', true);
      setTimeout(function () { window.location.href = 'login.html'; }, 900);
    });
  }

})();
