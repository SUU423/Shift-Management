import { db, doc, setDoc, collection, getDocs } from "./firebase.js";

export const loadEmployeeList = async () => {
    const empList = document.getElementById('emp-list');
    empList.innerHTML = '';
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `
                   <span class="emp-name">【${data.name}】</span>
                   <span class="emp-id">ID: ${data.employeeId}</span>
                   <span class="emp-pass">パスワード: ${data.password}</span> `;
            empList.appendChild(li);
        });
    } catch (error) {
        console.error("リスト読み込みエラー:", error);
    }
};

loadEmployeeList();