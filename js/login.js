const signInBtnLink = document.querySelector('.signInBtn-link');
const signUpBtnLink = document.querySelector('.signUpBtn-link');
const wrapper = document.querySelector('.wrapper');
const api = 'https://quizzmaster-a405941b4ff4.herokuapp.com';

signUpBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');
});

signInBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');
});

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('loginUsername').value;
    var password = document.getElementById('loginPassword').value;

    fetch(`${api}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            login: username,
            password: password,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Usuário não existe');
        }
        return response.json();
    })
    .then(data => {

        localStorage.setItem('token', data.token);
        localStorage.setItem('loggedIn', true);

        window.location.href = '/index.html';
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});


document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('registerUsername').value;
    var email = document.getElementById('registerEmail').value;
    var password = document.getElementById('registerPassword').value;

    fetch(`${api}/auth/register`, { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            login: username,
            email: email,
            password: password,
        }),
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/login.html';
        } else {
            console.error('Registration failed');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});