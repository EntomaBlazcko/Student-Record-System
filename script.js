let idCounter = parseInt(localStorage.getItem('idCounter')) || 1000;
let storedUsers = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = null;
let persons = [];

const loginForm = document.getElementById('loginForm');
const registrationForm = document.getElementById('registrationForm');
const crudSection = document.getElementById('crudSection');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const logoutBtn = document.getElementById('logoutBtn');

const $submit = document.getElementById('submit');
const $update = document.getElementById('update');
const $file = document.getElementById('file');
const $preview = document.getElementById('preview');

const PAGE_SIZE = 5;
let currentPage = 1;

function clearLoginForm() {
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

function clearRegistrationForm() {
    document.getElementById('regUsername').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regConfirmPassword').value = '';
}

function clearCrudForm() {
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('course').value = '';
    document.getElementById('section').value = '';
    document.getElementById('file').value = '';
    document.getElementById('index').value = '';
    document.getElementById('preview').src = '';
}

document.getElementById('firstName').addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
});

document.getElementById('lastName').addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
});

document.getElementById('course').addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z]/g, '').slice(0, 4);
});

document.getElementById('section').addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3);
});



window.addEventListener('load', () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        document.getElementById('usernameDisplay').textContent = `Welcome, ${currentUser.username}`;
        loginForm.style.display = 'none';
        crudSection.style.display = 'block';
        loadUserData();
    }
});

showRegister.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registrationForm.style.display = 'block';
    clearLoginForm();
});

showLogin.addEventListener('click', () => {
    registrationForm.style.display = 'none';
    loginForm.style.display = 'block';
    clearRegistrationForm();
});

loginBtn.addEventListener('click', () => {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    const user = storedUsers.find(user => user.username === username && user.password === password);

    if (user) {
        currentUser = user;
        document.getElementById('usernameDisplay').textContent = `Welcome, ${currentUser.username}`;
        alert('Login Successful');
        loginForm.style.display = 'none';
        crudSection.style.display = 'block';
        clearLoginForm();
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        loadUserData();
    } else {
        alert('Invalid username or password');
    }
});

registerBtn.addEventListener('click', () => {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (username && email && password && confirmPassword) {
        if (username.length < 8) {
            alert('Username must be at least 8 characters long');
            return;
        }
        if (password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }
        if (!emailPattern.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        if (password === confirmPassword) {
            if (storedUsers.some(user => user.username === username)) {
                alert('Username already exists');
            } else {
                storedUsers.push({ username, email, password });
                localStorage.setItem('users', JSON.stringify(storedUsers));
                alert('Registration Successful');
                registrationForm.style.display = 'none';
                loginForm.style.display = 'block';
                clearRegistrationForm();
            }
        } else {
            alert('Passwords do not match');
        }
    } else {
        alert('Please fill in all fields');
    }
});

logoutBtn.addEventListener('click', () => {
    crudSection.style.display = 'none';
    loginForm.style.display = 'block';
    clearLoginForm();
    clearCrudForm();
    document.getElementById('usernameDisplay').textContent = '';
    currentUser = null;
    localStorage.removeItem('currentUser');
    persons = [];
});

$file.onchange = function (e) {
    let files = e.target.files;
    let file = files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            $preview.src = reader.result;
        };
        reader.readAsDataURL(file);
    }
};


function handleFormSubmit() {
    let firstName = document.getElementById('firstName').value.trim();
    let lastName = document.getElementById('lastName').value.trim();
    let course = document.getElementById('course').value.trim();
    let section = document.getElementById('section').value.trim();
    let picture = $preview.src;
    let index = document.getElementById('index').value;

    if (!firstName || !lastName || !course || !section) {
        alert('All fields are required!');
        return;
    }

    
    const duplicateRecord = persons.some(person => person.firstName === firstName && person.lastName === lastName);
    if (duplicateRecord) {
        alert('This student record already exists!');
        return;
    }

    if (index === '') {
        persons.push({ id: idCounter++, firstName, lastName, course, section, picture });
        localStorage.setItem('idCounter', idCounter);
        alert('Record added successfully!');
    } else {
    index = parseInt(index);
    let existingRecord = persons[index];
    persons[index] = {
        id: existingRecord.id,
        firstName,
        lastName,
        course,
        section,
        picture
    };
    alert('Record updated successfully!');
}


    storeUserData();
    populateTable();
    clearCrudForm();
    document.getElementById('index').value = '';

    $submit.style.display = 'inline';
    $update.style.display = 'none';
    $submit.textContent = 'Add New';
    $update.textContent = 'Update Record';
}

$submit.onclick = handleFormSubmit;
$update.onclick = handleFormSubmit;

function populateTable() {
    let tbody = document.querySelector('tbody');
    let startIdx = (currentPage - 1) * PAGE_SIZE;
    let endIdx = startIdx + PAGE_SIZE;
    let currentPageData = persons.slice(startIdx, endIdx);

    let rows = currentPageData.map((person, i) => `
        <tr>
            <td>${startIdx + i + 1}</td>
            <td>SRS - ${person.id}</td>
            <td>${person.firstName}</td>
            <td>${person.lastName}</td>
            <td>${person.course}</td>
            <td>${person.section}</td>
            <td><img src="${person.picture}" style="height: 50px;"></td>
            <td>
                <button onclick="editPerson(${startIdx + i});">Edit</button>
                <button onclick="deletePerson(${startIdx + i});">Delete</button>
            </td>
        </tr>
    `).join('');

    tbody.innerHTML = rows || '<tr><td colspan="8" style="text-align:center;">No records found</td></tr>';

    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${Math.ceil(persons.length / PAGE_SIZE)}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === Math.ceil(persons.length / PAGE_SIZE);
}

document.getElementById('prevPage').onclick = function () {
    if (currentPage > 1) {
        currentPage--;
        populateTable();
    }
};

document.getElementById('nextPage').onclick = function () {
    if (currentPage < Math.ceil(persons.length / PAGE_SIZE)) {
        currentPage++;
        populateTable();
    }
};

function storeUserData() {
    if (currentUser) {
        localStorage.setItem('persons_' + currentUser.username, JSON.stringify(persons));
    }
}

function loadUserData() {
    if (currentUser) {
        persons = JSON.parse(localStorage.getItem('persons_' + currentUser.username)) || [];
        persons.forEach((person, index) => {
            if (!person.id) {
                person.id = idCounter++;
            }
        });
        localStorage.setItem('idCounter', idCounter);
        storeUserData();
        populateTable();
    }
}

window.editPerson = function (index) {
    let person = persons[index];
    document.getElementById('index').value = index;
    document.getElementById('firstName').value = person.firstName;
    document.getElementById('lastName').value = person.lastName;
    document.getElementById('course').value = person.course;
    document.getElementById('section').value = person.section;
    document.getElementById('preview').src = person.picture;

    $submit.style.display = 'none';
    $update.style.display = 'inline';
    $update.textContent = 'Update Record';
};

window.deletePerson = function (index) {
    if (confirm('Are you sure you want to delete this record?')) {
        persons.splice(index, 1);
        storeUserData();
        populateTable();
    }
};

if (currentUser) {
    loadUserData();
}
