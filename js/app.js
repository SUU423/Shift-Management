import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, collection, getDocs } from "./firebase.js";
import { loadEmployeeList } from "./db.js";

//ログイン機能
document.getElementById("btn-login").addEventListener("click", async () => {
    const loginid = document.getElementById("login-id").value;
    const password = document.getElementById("login-password").value;
    const loginText = document.getElementById("login-error");
    if (loginid === '' || password === '') {
        loginText.textContent = "値を入力してください";
        return;
    }
    const loginEmail = loginid + "@shift.local";

    try {
        loginText.textContent = "ログイン中";
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
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
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginView.classList.add('hidden');
        myshiftView.classList.remove('hidden');
        btnNav.classList.remove('hidden');
        console.log("現在ログイン中です:", user.email);
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



