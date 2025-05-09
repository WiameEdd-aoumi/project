const wrapper=document.querySelector(".wrapper");
const loginLink=document.querySelector(".login-link");
const registerLink=document.querySelector(".register-link");
const btnPopup=document.querySelector('.btnlogin-popup');
const iconClose = document.querySelector('.icon-close'); 
const loginForm = document.querySelector('#loginForm');
const registerForm = document.querySelector('#register-form');



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
        credentials:'include',
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      //localStorage.setItem('token', data.token);
      //localStorage.setItem('user', JSON.stringify(data.user));
      
    
      if (data.role === 'teacher') {
        window.location.href = 'Tdashboard';
      } else {
        window.location.href = 'Sdashboard';
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message);
    }
   
    });
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.querySelector('#registerForm input[name="name"]').value;
      const email = document.querySelector('#registerForm input[name="email"]').value;
      const password = document.querySelector('#registerForm input[name="password"]').value;
      const sexe = document.querySelector('#registerForm input[name="sexe"]').value;
      const etablissement = document.querySelector('#registerForm input[name="etablissement"]').value;
      const dateNaissance = document.querySelector('#registerForm input[name="dateNaissance"]').value;
      const filiere = document.querySelector('#registerForm input[name="filiere"]').value;
      const role = document.querySelector('#registerForm input[name="role"]').value;
    
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            password,
            sexe,
            etablissement,
            dateNaissance,
            filiere,
            role
          })
        });
    
        const data = await res.json();
        console.log(data);
    
        if (!res.ok) {
          throw new Error(data.message || 'Registration failed');
        }
    
        // Rediriger après registration selon le rôle
        if (data.role === 'teacher') {
          window.location.href = '/Tdashboard';
        } else {
          window.location.href = '/Sdashboard';
        }
    
      } catch (error) {
        console.error('Registration error:', error);
        alert(error.message);
      }
    });
    
    



