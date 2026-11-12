import { db, doc, setDoc, collection, getDocs, deleteDoc, addDoc, query, where } from "./firebase.js";
import{renderAllShiftTimeline} from "./app.js";

//従業員情報を取得
export const loadEmployeeList = async () => {
    const empList = document.getElementById('emp-list');
    const EmployeeSelect = document.getElementById('employee-select');
    empList.innerHTML = '';
    EmployeeSelect.innerHTML = '';
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `
                   <span class="emp-name">【${data.name}】</span>
                   <span class="emp-id">ID: ${data.employeeId}</span>
                   <span class="emp-pass">パスワード: ${data.password}</span> 
                   <button class="btn-delete-emp" id="${doc.id}"><i class="fa-solid fa-trash"></i></button>`;
            const deleteBtn = li.querySelector('.btn-delete-emp');
            deleteBtn.addEventListener('click', () => {
                deleteEmployee(doc.id);
            });
            const option2 = document.createElement('option');
            option2.innerHTML = ` <option value="${data.name}">${data.name}</option>`;
            empList.appendChild(li);
            EmployeeSelect.appendChild(option2);
        });
    } catch (error) {
        console.error("リスト読み込みエラー:", error);
    }
};
loadEmployeeList();


//従業員情報を削除
const deleteEmployee = async (id) => {
    try {
        await deleteDoc(doc(db, "users", id));
        loadEmployeeList();
        alert("従業員情報を削除しました");
    } catch (error) {
        alert("削除に失敗しました");
    }
};

//ポジションの追加
document.getElementById('btn-add-position').addEventListener("click", async () => {
    try {
        const PositionName = document.getElementById('position-name').value;
        const PositionColor = document.getElementById('position-color').value;
        await addDoc(collection(db, "positions"), {
            PositionName: PositionName,
            PositionColor: PositionColor,
        })
        document.getElementById('position-color').textContent = '';
        document.getElementById('position-name').textContent = '';
        loadPositionList();
    } catch (error) {
        console.error("ポジション追加エラー:", error);
    }
});

//ポジションの取得
export const loadPositionList = async () => {
    const PositionList = document.getElementById('show-position');
    const ShiftSelect = document.getElementById('shift-select');
    PositionList.innerHTML = '';
    ShiftSelect.innerHTML = '';
    try {
        const aaa = await getDocs(collection(db, "positions"));
        aaa.forEach((pos) => {
            const dataPosition = pos.data();
            const div = document.createElement('div');
            div.innerHTML = `
                <span class="position-badge" style="background-color:${dataPosition.PositionColor}">${dataPosition.PositionName}</span>
                <button class="btn-delete-pos"><i class="fa-solid fa-trash"></i></button>`;

            const option = document.createElement('option');
            option.innerHTML = `
                <option value="${dataPosition.PositionName}"><span class="color-box" style="background:${dataPosition.PositionColor}">
                </span>${dataPosition.PositionName}</option>`

            const deleteBtn2 = div.querySelector('.btn-delete-pos');
            deleteBtn2.addEventListener('click', () => {
                deletePosition(pos.id);
            });
            PositionList.appendChild(div);
            ShiftSelect.appendChild(option);
        });
    } catch (error) {
        console.error("リスト読み込みエラー:", error);
    }
};
loadPositionList();

//ポジションの削除
export const deletePosition = async (id) => {
    try {
        await deleteDoc(doc(db, "positions", id));
        loadPositionList();
        alert("ポジションを削除しました");
    } catch (error) {
        alert("削除に失敗しました");
    }
};


//シフトの追加
document.getElementById("btn-save-shift").addEventListener("click", async () => {
    const year = document.getElementById("sel-year").value;
    const month = document.getElementById("sel-month").value;
    const day = document.getElementById("sel-day").value;
    const employee = document.getElementById("employee-select").value;
    const position = document.getElementById("shift-select").value;
    const startTime = document.getElementById("start-time").value;
    const endTime = document.getElementById("end-time").value;

    if (!year || !month || !day || !employee || !position || !startTime || !endTime) {
        alert("すべての項目を入力または選択してください");
        return;
    }
    const shiftData = {
        fullDate: `${year}-${month}-${day}`,
        year: year,
        month: month,
        day: day,
        employeeName: employee,
        position: position,
        startTime: startTime,
        endTime: endTime
    };
    try {
        await addDoc(collection(db, "shifts"), shiftData);
        alert("シフトを保存しました！");
        renderAllShiftTimeline();
    } catch (error) {
        console.error("シフト保存エラー:", error);
        alert("保存に失敗しました");
    }
});

//シフトの取得
export const MYshift = async (UserName) => {
    const MyShiftLIst = document.getElementById("myshift-list");
    MyShiftLIst.textContent = "";
    try {
        const bbb = await getDocs(query(collection(db, "shifts"), where("employeeName", "==", UserName)));
        if (bbb.empty) {
            MyShiftLIst.innerHTML = "<p style='color: #666; text-align: center;'>現在確定しているシフトはありません</p>";
            return;
        }
        //日付順に並べ替える
        const shiftsArray = [];
        bbb.forEach((shift) => {
            shiftsArray.push(shift.data());
        });
        shiftsArray.sort((a, b) => {
            // parseInt() を使って「2024年」や「1月」という文字から数字だけを抽出する
            const yearA = parseInt(a.year);
            const monthA = parseInt(a.month);
            const dayA = parseInt(a.day);
            const yearB = parseInt(b.year);
            const monthB = parseInt(b.month);
            const dayB = parseInt(b.day);
            // ① まず「年」を比べる（違ったらここで並べ替え完了）
            if (yearA !== yearB) {
                return yearA - yearB;
            }
            // ② 年が同じなら「月」を比べる
            if (monthA !== monthB) {
                return monthA - monthB;
            }
            // ③ 年も月も同じなら「日」で比べる
            return dayA - dayB;
        });
        shiftsArray.forEach((MYshiftData) => {
            const div3 = document.createElement("div");
            div3.innerHTML = `
            <span class="msd-m">${MYshiftData.month}/${MYshiftData.day}</span>
           <span class="msd-t">${MYshiftData.startTime}~${MYshiftData.endTime}</span>`;
            MyShiftLIst.appendChild(div3);
        })
        return shiftsArray;
    } catch (error) {
        console.error("シフト読み込みエラー:", error);
        return [];
    }
};
