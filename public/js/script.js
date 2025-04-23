const wrapper=document.querySelector(".wrapper");
const loginLink=document.querySelector(".login-link");
const registerLink=document.querySelector(".register-link");
const btnPopup=document.querySelector('.btnlogin-popup');
const iconClose = document.querySelector('.icon-close'); 
const loginForm = document.querySelector('#loginForm');
const registerForm = document.querySelector('.register-form');



registerLink.addEventListener('click',()=>{
    wrapper.classList.add('active');

});

loginLink.addEventListener('click',()=>{
    wrapper.classList.remove('active');
});

btnPopup.addEventListener('click',()=>{
    wrapper.classList.add('active-popup');
});
iconClose.addEventListener('click', () => {
    wrapper.classList.remove('active-popup');
    wrapper.classList.remove('active');
});

// In your login.js or teacher.js
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;
  
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      //localStorage.setItem('token', data.token);
      //localStorage.setItem('user', JSON.stringify(data.user));
      
    
      if (data.user.role === 'teacher') {
        window.location.href = 'upload.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message);
    }
    fetch('/login', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      if (data.redirectTo) {
        window.location.href = data.redirectTo;
      }
    });
    
  });


