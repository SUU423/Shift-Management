import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, collection, getDocs, getDoc } from "./firebase.js";
import { loadEmployeeList } from "./db.js";

//ログイン機能
document.getElementById("btn-login").addEventListener("click", async () => {
    const loginId = document.getElementById("login-id").value;
    const password = document.getElementById("login-password").value;
    const loginText = document.getElementById("login-error");
    if (loginId === '' || password === '') {
        loginText.textContent = "値を入力してください";
        return;
    }
    const loginEmail = loginId + "@shift.local";
    try {
        loginText.textContent = "ログイン中";
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
        console.log(userCredential);
        const user = userCredential.user;
        loginText.textContent = '';
    } catch (error) {
        loginText.textContent = 'ログインに失敗しました'
    }
});

//ログイン状態の監視とページの切り替え
const loginView = document.getElementById("login-view");
const myshiftView = document.getElementById("myshift-view");
const allshiftView = document.getElementById("allshift-view");
const adminView = document.getElementById("admin-view");
const btnNav = document.getElementById('btn-nav');
onAuthStateChanged(auth, async (user) => {
    if (user) {
        loginView.classList.add('hidden');
        myshiftView.classList.remove('hidden');
        btnNav.classList.remove('hidden');
        adminView.classList.add('hidden');
        console.log("現在ログイン中です:", user.email);
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            const userData = userDocSnap.data();
            const tabAdmin = document.getElementById("tab-admin");
            if (userData.role === "管理者") {
                tabAdmin.classList.remove("hidden");
            } else {
                tabAdmin.classList.add("hidden");
            }
            //ログイン名を表示
            document.getElementById("user-name").textContent = userData.name;
        } catch (error) {
            console.error("権限チェックエラー:", error);
        }
    } else {
        loginView.classList.remove('hidden');
        myshiftView.classList.add('hidden');
        allshiftView.classList.add('hidden');
        adminView.classList.add('hidden');
        btnNav.classList.add('hidden');

    }
});

document.getElementById('myshift-tub').addEventListener("click", () => {
    loginView.classList.add('hidden');
    myshiftView.classList.remove('hidden');
    allshiftView.classList.add('hidden');
    adminView.classList.add('hidden');
    btnNav.classList.remove('hidden');
});
document.getElementById('allshiht-tub').addEventListener("click", () => {
    loginView.classList.add('hidden');
    myshiftView.classList.add('hidden');
    allshiftView.classList.remove('hidden');
    adminView.classList.add('hidden');
    btnNav.classList.remove('hidden');
});
document.getElementById('tab-admin').addEventListener("click", () => {
    loginView.classList.add('hidden');
    myshiftView.classList.add('hidden');
    allshiftView.classList.add('hidden');
    adminView.classList.remove('hidden');
    btnNav.classList.remove('hidden');
});

//ログアウト機能
document.getElementById('btn-logout').addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("ログアウトエラー:", error);
    }
});

//サインアップ機能
document.getElementById('btn-add-emp').addEventListener("click", async () => {
    const NewUserName = document.getElementById('new-emp-name').value;
    const NewUserId = document.getElementById('new-emp-id').value;
    const NewUserPassword = document.getElementById('new-emp-password').value;
    const NewUserEmail = NewUserId + "@shift.local";
    if (NewUserPassword.length < 6) {
        alert("パスワードは6文字以上にしてください");
        return;
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, NewUserEmail, NewUserPassword);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
            name: NewUserName,
            employeeId: NewUserId,
            password: NewUserPassword,
            role: "一般"
        });
        alert('従業員を追加しました。セキュリティのためログアウトします');
        await signOut(auth);
        window.location.reload();
    } catch (error) {
        console.error("登録エラー:", error.message);
        alert('エラーが発生しました: ' + error.message);
    }
});

//管理者画面のボタン制御
document.getElementById('emp-edit').addEventListener('click', () => {
    document.getElementById('emp-manage-card').style.display = 'block';
});
document.getElementById('position-edit').addEventListener('click', () => {
    document.getElementById('position-manage-card').style.display = 'block';
});
document.getElementById('close-btn').addEventListener('click', () => {
    document.getElementById('emp-manage-card').style.display = 'none';
});
document.getElementById('close-btn2').addEventListener('click', () => {
    document.getElementById('position-manage-card').style.display = 'none';
});

//カレンダーの描画
const renderCalendar = (year, month) => {
    const Calendargrid = document.getElementById("calendar-grid");
    Calendargrid.innerHTML = "";
    // ① その月の1日が何曜日かを取得 (0:日, 1:月, 2:火...)
    const firstDay = new Date(year, month - 1, 1).getDay();
    // ② その月が何日まであるかを取得 (次の月の0日目＝今月の最終日)
    const lastDate = new Date(year, month, 0).getDate();
    // ③ 1日が始まる曜日まで、空のマスを作る
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        Calendargrid.appendChild(emptyCell);
    }
    // ④ 1日から最終日までのマスを作る
    for (let day = 1; day <= lastDate; day++) {
        const dayCell = document.createElement("div");
        dayCell.className = "day-cell";
        dayCell.textContent = day;
        /*【応用】もしこの日にシフトが入っていれば、緑の点を追加する
        if (day === 9 || day === 10) { 
          const dot = document.createElement("div");
          dot.className = "shift-dot";
          dayCell.appendChild(dot);
          
          // 9日なら青枠にする
          if (day === 9) dayCell.classList.add("selected"); 
        }*/
        dayCell.addEventListener("click", () => {
            console.log(`${month}月${day}日がクリックされました`);
        });
        Calendargrid.appendChild(dayCell);
    }
};
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
const monthYearText = document.getElementById("month-year");
monthYearText.textContent = `${currentYear}年 ${currentMonth}月`;
renderCalendar(currentYear, currentMonth);
document.getElementById("prev-month").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }
    monthYearText.textContent = `${currentYear}年 ${currentMonth}月`;
    renderCalendar(currentYear, currentMonth);
});
document.getElementById("next-month").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    }
    monthYearText.textContent = `${currentYear}年 ${currentMonth}月`;
    renderCalendar(currentYear, currentMonth);
});




