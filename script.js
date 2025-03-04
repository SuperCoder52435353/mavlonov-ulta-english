let users = JSON.parse(localStorage.getItem('users')) || [];
let reports = JSON.parse(localStorage.getItem('reports')) || [];
let currentUser = null;
let usedWords = JSON.parse(localStorage.getItem('usedWords')) || { A1: [], B1: [], B2: [], C1: [], C2: [] };
let activeTests = JSON.parse(localStorage.getItem('activeTests')) || []; // Real vaqtda monitoring uchun

// So‘zlar bazasi (Har bir daraja uchun namunaviy 5 ta so‘z, 50 ta bo‘lishi kerak edi, ammo uzun bo‘lmasligi uchun qisqa qildim)
const words = {
    A1: [
        { word: "apple", correct: "olma", options: ["suyak", "olma", "yer", "nok"] },
        { word: "cat", correct: "mushuk", options: ["it", "mushuk", "quyon", "ekin"] },
        { word: "dog", correct: "it", options: ["mushuk", "it", "quyon", "ekin"] },
        { word: "book", correct: "kitob", options: ["qalam", "kitob", "stol", "uy"] },
        { word: "pen", correct: "qalam", options: ["kitob", "qalam", "daftar", "stul"] }
    ],
    B1: [
        { word: "freedom", correct: "erkinlik", options: ["qullik", "erkinlik", "dovon", "qamoq"] },
        { word: "travel", correct: "sayohat", options: ["ish", "sayohat", "uy", "maktab"] },
        { word: "happy", correct: "baxtli", options: ["xafa", "baxtli", "qayg‘uli", "kasal"] },
        { word: "school", correct: "maktab", options: ["uy", "maktab", "bog‘", "do‘kon"] },
        { word: "friend", correct: "do‘st", options: ["dushman", "do‘st", "o‘qituvchi", "qarindosh"] }
    ],
    B2: [
        { word: "challenge", correct: "qiyinchilik", options: ["osonlik", "qiyinchilik", "muvaffaqiyat", "foyda"] },
        { word: "success", correct: "muvaffaqiyat", options: ["qiyinchilik", "muvaffaqiyat", "yutqazish", "xato"] },
        { word: "effort", correct: "harakat", options: ["dangasalik", "harakat", "tinchlik", "uyqu"] },
        { word: "beauty", correct: "go‘zallik", options: ["xunuklik", "go‘zallik", "qorong‘ulik", "yomonlik"] },
        { word: "nature", correct: "tabiat", options: ["shahar", "tabiat", "uy", "maktab"] }
    ],
    C1: [
        { word: "meticulous", correct: "sinchkov", options: ["shoshqaloq", "sinchkov", "dangasa", "tez"] },
        { word: "profound", correct: "chuqur", options: ["sayoz", "chuqur", "oddiy", "yengil"] },
        { word: "eloquent", correct: "notiq", options: ["soqov", "notiq", "jim", "qoloq"] },
        { word: "obscure", correct: "noaniq", options: ["aniq", "noaniq", "ravshan", "ochik"] },
        { word: "articulate", correct: "aniq ifodalovchi", options: ["noaniq", "aniq ifodalovchi", "jim", "qoloq"] }
    ],
    C2: [
        { word: "ephemeral", correct: "vaqtinchalik", options: ["doimiy", "vaqtinchalik", "uzun", "kuchli"] },
        { word: "ubiquitous", correct: "hamma joyda", options: ["kamdan-kam", "hamma joyda", "maxsus", "yashirin"] },
        { word: "quixotic", correct: "xayolparast", options: ["realist", "xayolparast", "oddiy", "qat’iy"] },
        { word: "plethora", correct: "ko‘plab", options: ["kam", "ko‘plab", "oddiy", "yagona"] },
        { word: "venerable", correct: "hurmatli", options: ["yosh", "hurmatli", "oddiy", "nohurmat"] }
    ]
};

// Kirish funksiyasi
function kirish() {
    let ism = document.getElementById('ism').value.trim();
    let familya = document.getElementById('familya').value.trim();
    let yosh = document.getElementById('yosh').value;
    let adminCode = document.getElementById('adminCode').value;
    let adminCodeSection = document.getElementById('adminCodeSection');
    let yoshSection = document.getElementById('yoshSection');
    let error = document.getElementById('error');

    // Admin tekshiruvi
    if (ism === "Abduraxmon" && familya === "Admin") {
        yoshSection.style.display = 'none';
        adminCodeSection.style.display = 'block';

        if (adminCode !== "PASSWORDABDURAXMON") {
            error.textContent = "Noto‘g‘ri admin kod!";
            return;
        }
        currentUser = { ism, familya, role: "admin", loginTime: new Date().toLocaleString() };
        showAdminPanel();
    } else {
        yoshSection.style.display = 'block';
        adminCodeSection.style.display = 'none';

        // Validatsiya
        if (!/^[a-zA-Z]+$/.test(ism) || !/^[a-zA-Z]+$/.test(familya)) {
            error.textContent = "Iltimos, ism va familyaga faqat harflar kiriting!";
            return;
        }
        if (!yosh) {
            error.textContent = "Iltimos, yoshingizni kiriting!";
            return;
        }

        currentUser = users.find(u => u.ism === ism && u.familya === familya) || { 
            ism, 
            familya, 
            yosh, 
            results: [], 
            loginTime: new Date().toLocaleString(), 
            lastActivity: new Date().toLocaleString() 
        };
        if (!users.some(u => u.ism === ism && u.familya === familya)) {
            users.push(currentUser);
        } else {
            currentUser.lastActivity = new Date().toLocaleString();
            users = users.map(u => (u.ism === ism && u.familya === familya ? currentUser : u));
        }
        localStorage.setItem('users', JSON.stringify(users));
        showMainContent();
    }
    document.getElementById('loginForm').style.display = 'none';
}

// Asosiy kontentni ko‘rsatish
function showMainContent() {
    document.getElementById('mainContent').style.display = 'block';
    let profile = document.getElementById('userProfile');
    profile.innerHTML = `
        <h3 class="text-center text-primary">Profil</h3>
        <p><strong>Ism:</strong> ${currentUser.ism}</p>
        <p><strong>Familya:</strong> ${currentUser.familya}</p>
        <p><strong>Yosh:</strong> ${currentUser.yosh}</p>
        <p><strong>Kirish Vaqti:</strong> ${currentUser.loginTime}</p>
        <p><strong>Oxirgi Faoliyat:</strong> ${currentUser.lastActivity}</p>
        <p><strong>Natijalar:</strong> ${currentUser.results.map(r => `${r.level}: ${r.score}/30`).join(", ")}</p>
        <small class="text-muted d-block text-center">Creator: Movlonov Admin Abduraxmon</small>
    `;
}

// Testni boshlash
function startTest(level) {
    document.getElementById('playlists').style.display = 'none';
    let testSection = document.getElementById('testSection');
    testSection.style.display = 'block';
    let testWords = words[level].filter(w => !usedWords[level].includes(w.word));
    let questionCount = 0;
    let score = 0;

    // Real vaqtda monitoring uchun
    activeTests.push({ user: `${currentUser.ism} ${currentUser.familya}`, level, currentQuestion: 0, score: 0 });
    localStorage.setItem('activeTests', JSON.stringify(activeTests));

    function showQuestion() {
        if (questionCount >= 30 || testWords.length === 0) {
            currentUser.results.push({ level, score });
            currentUser.lastActivity = new Date().toLocaleString();
            users = users.map(u => (u.ism === currentUser.ism && u.familya === currentUser.familya ? currentUser : u));
            localStorage.setItem('users', JSON.stringify(users));

            // Test tugaganda aktiv testlardan o‘chirish
            activeTests = activeTests.filter(t => t.user !== `${currentUser.ism} ${currentUser.familya}`);
            localStorage.setItem('activeTests', JSON.stringify(activeTests));

            testSection.innerHTML = `<h3 class="text-center">Test tugadi! Natija: ${score}/30</h3>`;
            setTimeout(() => {
                testSection.style.display = 'none';
                document.getElementById('playlists').style.display = 'block';
                showMainContent();
            }, 2000);
            return;
        }

        let word = testWords[Math.floor(Math.random() * testWords.length)];
        usedWords[level].push(word.word);
        localStorage.setItem('usedWords', JSON.stringify(usedWords));

        // Real vaqtda monitoring uchun yangilash
        activeTests = activeTests.map(t => {
            if (t.user === `${currentUser.ism} ${currentUser.familya}`) {
                return { ...t, currentQuestion: questionCount + 1, score };
            }
            return t;
        });
        localStorage.setItem('activeTests', JSON.stringify(activeTests));

        testSection.innerHTML = `
            <h3 class="text-center">Savol ${questionCount + 1}/30</h3>
            <div class="progress mb-3">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${(questionCount / 30) * 100}%" aria-valuenow="${questionCount}" aria-valuemin="0" aria-valuemax="30"></div>
            </div>
            <p class="text-center">${word.word} - bu nima?</p>
            <div class="d-flex flex-wrap justify-content-center">
                ${word.options.map((opt, idx) => `
                    <button class="btn btn-outline-primary m-2" onclick="checkAnswer('${opt}', '${word.correct}', ${idx})">${opt}</button>
                `).join("")}
            </div>
        `;
        questionCount++;
    }

    window.checkAnswer = (selected, correct, idx) => {
        if (selected === correct) score++;
        showQuestion();
    };

    showQuestion();
}

// Admin panel
function showAdminPanel() {
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';

    // Foydalanuvchilar statistikasi
    let stats = document.getElementById('adminStats');
    stats.innerHTML = `
        <h4>Foydalanuvchilar Statistikasi</h4>
        ${users.map(u => `
            <div class="card p-3 mb-2">
                <p><strong>${u.ism} ${u.familya}:</strong> Kirish: ${u.loginTime || 'Noma’lum'}, Oxirgi Faoliyat: ${u.lastActivity || 'Noma’lum'}</p>
                <p><strong>Natijalar:</strong> ${u.results.map(r => `${r.level}: ${r.score}/30`).join(", ") || "Hali test ishlamagan"}</p>
            </div>
        `).join("")}
    `;

    // Xabarlar
    let adminReports = document.getElementById('adminReports');
    adminReports.innerHTML = `
        <h4>Xabarlar</h4>
        ${reports.map(r => `
            <div class="alert alert-info">${r.user}: ${r.message}</div>
        `).join("")}
    `;

    // Online Monitoring
    let onlineMonitoring = document.getElementById('onlineMonitoring');
    onlineMonitoring.innerHTML = `
        <h4>Online Monitoring</h4>
        ${activeTests.map(t => `
            <div class="alert alert-success">${t.user} hozir ${t.level} darajadagi testda. Joriy savol: ${t.currentQuestion}, Ball: ${t.score}</div>
        `).join("") || "<p>Hozirda faol test yo‘q.</p>"}
    `;

    // Foydalanuvchilar ro‘yxati
    let userList = document.getElementById('userList');
    userList.innerHTML = `
        <h4>Foydalanuvchilar Ro‘yxati</h4>
        ${users.map((u, idx) => `
            <div class="card p-3 mb-2">
                <p><strong>${u.ism} ${u.familya}</strong></p>
                <p>Kirish: ${u.loginTime || 'Noma’lum'}</p>
                <p>Natijalar: ${u.results.map(r => `${r.level}: ${r.score}/30`).join(", ") || "Hali test ishlamagan"}</p>
                <button class="btn btn-danger btn-sm" onclick="deleteUser(${idx})">O‘chirish</button>
                <button class="btn btn-warning btn-sm" onclick="blockUser(${idx})">Bloklash</button>
                <button class="btn btn-info btn-sm" onclick="editUserResults(${idx})">Natijalarni Tahrirlash</button>
            </div>
        `).join("")}
    `;
}

// Adminstratorga xabar yuborish
function reportToAdmin() {
    let message = prompt("Adminstratorga xabar yuboring:");
    if (message) {
        reports.push({ user: `${currentUser.ism} ${currentUser.familya}`, message });
        localStorage.setItem('reports', JSON.stringify(reports));
        alert("Xabar yuborildi!");
    }
}

// Foydalanuvchilarni o‘chirish
function deleteUser(index) {
    if (confirm("Bu foydalanuvchini o‘chirishni xohlaysizmi?")) {
        users.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        showAdminPanel();
    }
}

// Foydalanuvchilarni bloklash (namunaviy, keyinchalik kengaytirish mumkin)
function blockUser(index) {
    alert("Bu foydalanuvchi bloklandi (funksiya namunaviy).");
}

// Natijalarni tahrirlash
function editUserResults(index) {
    let newResult = prompt("Yangi natijani kiriting (masalan, B1: 25/30):");
    if (newResult) {
        let [level, score] = newResult.split(":");
        score = score.split("/")[0].trim();
        users[index].results.push({ level: level.trim(), score: parseInt(score) });
        localStorage.setItem('users', JSON.stringify(users));
        showAdminPanel();
    }
}

// Barcha foydalanuvchilarni o‘chirish
function clearAllUsers() {
    if (confirm("Barcha foydalanuvchilarni o‘chirishni xohlaysizmi?")) {
        users = [];
        localStorage.setItem('users', JSON.stringify(users));
        showAdminPanel();
    }
}