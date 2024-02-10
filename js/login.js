const signInBtnLink = document.querySelector('.signInBtn-link');
const signUpBtnLink = document.querySelector('.signUpBtn-link');
const wrapper = document.querySelector('.wrapper');
const api = 'http://localhost:8080';

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
            // Registro bem-sucedido, você pode redirecionar o usuário para a página de login
            window.location.href = '/login.html';
        } else {
            // Algo deu errado, você pode mostrar uma mensagem de erro
            console.error('Registration failed');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});