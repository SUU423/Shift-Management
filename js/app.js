import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, collection, getDocs, getDoc, deleteDoc } from "./firebase.js";
import { loadEmployeeList, MYshift, } from "./db.js";


//ログイン機能
document.getElementById("btn-login").addEventListener("click", async () => {
    const loginId = document.getElementById("login-id").value;
    const password = document.getElementById("login-password").value;
    const loginText = document.getElementById("login-error");
    //入力チェック
    if (loginId === '' || password === '') {
        loginText.textContent = "値を入力してください";
        return;
    }
    const loginEmail = loginId + "@shift.local";
    //ログイン
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
//ログイン状態の監視
onAuthStateChanged(auth, async (user) => {
    //HTMLの表示切替
    if (user) {
        loginView.classList.add('hidden');
        myshiftView.classList.remove('hidden');
        btnNav.classList.remove('hidden');
        adminView.classList.add('hidden');
        console.log("現在ログイン中です:", user.email);
        //管理者と一般の識別＆HTMLの表示切替
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            const userData = userDocSnap.data();
            const UserName = userData.name;
            const tabAdmin = document.getElementById("tab-admin");
            if (userData.role === "管理者") {
                tabAdmin.classList.remove("hidden");
            } else {
                tabAdmin.classList.add("hidden");
            }
            //ログイン名を表示
            document.getElementById("user-name").textContent = UserName;
            //マイシフトとカレンダーの作成関数の実行
            currentUserName = UserName;
            myGlobalShifts = await MYshift(currentUserName);
            renderCalendar(currentYear, currentMonth, myGlobalShifts);
        } catch (error) {
            console.error("権限チェックエラー:", error);
        }
        //HTMLの表示切替
    } else {
        loginView.classList.remove('hidden');
        myshiftView.classList.add('hidden');
        allshiftView.classList.add('hidden');
        adminView.classList.add('hidden');
        btnNav.classList.add('hidden');

    }
});


//ボタンによるHTMLの表示切替
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
    //入力チェック
    if (NewUserPassword.length < 6) {
        alert("パスワードは6文字以上にしてください");
        return;
    }
    //サインアップ
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, NewUserEmail, NewUserPassword);
        const user = userCredential.user;
        //データベースにも情報を保存
        await setDoc(doc(db, "users", user.uid), {
            name: NewUserName,
            employeeId: NewUserId,
            password: NewUserPassword,
            role: "一般"
        });
        //サインアップすると自動でログインしてしまうので強制ログアウト
        alert('従業員を追加しました。セキュリティのためログアウトします');
        await signOut(auth);
        window.location.reload();
    } catch (error) {
        console.error("登録エラー:", error.message);
        alert('エラーが発生しました: ' + error.message);
    }
});


//従業員編集＆ポジション編集ボタン制御
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


//カレンダーの描画関数
const renderCalendar = (year, month, shiftList = []) => {
    const Calendargrid = document.getElementById("calendar-grid");
    Calendargrid.innerHTML = "";
    // その月の1日が何曜日かを取得
    const firstDay = new Date(year, month - 1, 1).getDay();
    // その月が何日まであるかを取得
    const lastDate = new Date(year, month, 0).getDate();
    // 1日が始まる曜日まで、空のマスを作る
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        Calendargrid.appendChild(emptyCell);
    }
    // 1日から最終日までのマスを作る
    for (let day = 1; day <= lastDate; day++) {
        const dayCell = document.createElement("div");
        dayCell.className = "day-cell";
        dayCell.textContent = day;
        // 受け取った配列の中に、作ろうとしているマスと一致する日付があるかチェック！
        const hasShift = shiftList.some((shift) => {
            // 文字列を数値にして比較する
            return parseInt(shift.year) === year &&
                parseInt(shift.month) === month &&
                parseInt(shift.day) === day;
        });

        if (hasShift) {
            // 一致したら印をつける
            const dot = document.createElement("div");
            dot.className = "shift-dot";
            dayCell.appendChild(dot);
            dayCell.classList.add("selected");
        }

        // カレンダークリック時の動作
        dayCell.addEventListener("click", () => {
            if (typeof renderAllShiftTimeline === "function") {
                renderAllShiftTimeline(year, month, day, "popup-shift-grid-body");
            }
            document.getElementById("popup-date-title").textContent = `${year}年 ${month}月 ${day}日の全体シフト`;
            document.getElementById("shift-popup").classList.remove("hidden");
             document.getElementById("btn-nav").classList.add("hidden");
        });

        Calendargrid.appendChild(dayCell);
    }
};

//ポップアップを閉じる
document.getElementById("close-popup-btn").addEventListener("click", () => {
    document.getElementById("shift-popup").classList.add("hidden");
    document.getElementById("btn-nav").classList.remove("hidden");
});

//?
let currentUserName = "";
let myGlobalShifts = [];

//現在の日付を表示＆カレンダー描画関数の実行
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
const monthYearText = document.getElementById("month-year");
monthYearText.textContent = `${currentYear}年 ${currentMonth}月`;
renderCalendar(currentYear, currentMonth, myGlobalShifts);

//ボタンを押して月を切り替える
document.getElementById("prev-month").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }
    monthYearText.textContent = `${currentYear}年 ${currentMonth}月`;
    renderCalendar(currentYear, currentMonth, myGlobalShifts);
});
document.getElementById("next-month").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    }
    monthYearText.textContent = `${currentYear}年 ${currentMonth}月`;
    renderCalendar(currentYear, currentMonth, myGlobalShifts);
});


//全体シフト表示
// タイムラインの基準（一番左端）の時間を「9時」とする
const TIMELINE_START_HOUR = 5.6;
// 1分を何ピクセルで表現するか（例: 2なら、1時間＝120px幅になる）
const PIXELS_PER_MINUTE = 1;

//シフト時間を描画するための計算
const calcShiftBar = (startTime, endTime) => {
    // 09:30を9と30の数字に分ける
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    // すべて分に統一する
    const startTotalMins = (startH * 60) + startM;
    const endTotalMins = (endH * 60) + endM;
    const timelineStartMins = TIMELINE_START_HOUR * 60; // 9:00 = 540分

    // ピクセル数に変換
    // 左からの位置 ＝ (シフト開始時間 － タイムライン開始時間) × 1分あたりのpx
    const leftPx = (startTotalMins - timelineStartMins) * PIXELS_PER_MINUTE;
    // バーの長さ ＝ (終了時間 － 開始時間) × 1分あたりのpx
    const widthPx = (endTotalMins - startTotalMins) * PIXELS_PER_MINUTE;
    // 計算結果をオブジェクトとして返す
    return { left: leftPx, width: widthPx };
};


const selYear = document.getElementById("sel-year");
const selMonth = document.getElementById("sel-month");
const selDay = document.getElementById("sel-day");


//シフト表の作成
export const renderAllShiftTimeline = async (targetYear, targetMonth, targetDay, tbodyId) => {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = "<tr><td colspan='17' style='text-align: center;'>読み込み中...</td></tr>";
    //シフトデータを取得
    try {
        //色指定用にポジションカラーを取得
        const posSnapshot = await getDocs(collection(db, "positions"));
        const positionColors = {};
        posSnapshot.forEach((doc) => {
            const data = doc.data();
            //  positionColors["部品"] = "#348002"; を作成
            positionColors[data.PositionName] = data.PositionColor;
        });
        //シフトを一時すべて取得し配列に入れる
        const querySnapshot = await getDocs(collection(db, "shifts"));
        const shiftsOfDay = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            //  選んだ日付と一致するシフトだけを配列に入れる。Firestore側のデータも数値に変換して比較する
            if (parseInt(data.year) === targetYear &&
                parseInt(data.month) === targetMonth &&
                parseInt(data.day) === targetDay) {
                shiftsOfDay.push({ id: doc.id, ...data });
            }
        });
        tbody.innerHTML = "";

        //該当するシフトが無かった時の代替メッセージ
        if (shiftsOfDay.length === 0) {
            tbody.innerHTML = "<tr><td colspan='17' style='text-align: center; color: #666;'>この日のシフトはありません</td></tr>";
            return;
        }

        const shiftsByEmployee = {};
        // シフトの数だけ行（tr）を作る
        shiftsOfDay.forEach((shift) => {
            const name = shift.employeeName;
            // まだその人の配列が無ければ、空の配列を作る
            if (!shiftsByEmployee[name]) {
                shiftsByEmployee[name] = [];
            }
            // その人の配列にシフトを追加していく
            shiftsByEmployee[name].push(shift);
        });

        //まとめた人ごとの配列をループして、1人につき1行（tr）だけ作る
        Object.keys(shiftsByEmployee).forEach((employeeName) => {
            // その人のシフトを全部出す
            const personShifts = shiftsByEmployee[employeeName];
            //HTMLの作成
            const tr = document.createElement("tr");
            const nameTd = document.createElement("td");
            nameTd.className = "col-name";
            nameTd.textContent = employeeName;
            tr.appendChild(nameTd);

            // 6:00のマスを作る（すべてのバーを配置する基準点）
            const startTd = document.createElement("td");
            startTd.className = "col-start";

            // その人のシフトの数だけループして、同じstartTdの中にバーをどんどん追加する
            personShifts.forEach((shift) => {

                //時間が未設定のシフトは弾く
                if (!shift.startTime || !shift.endTime) {
                    console.warn("時間が未設定のシフトデータをスキップしました:", shift);
                    return; // 描画処理をスキップして次のシフトへ
                }
                const barStyle = calcShiftBar(shift.startTime, shift.endTime);
                const bar = document.createElement("div");
                bar.className = "shift-bar";
                bar.style.left = `${barStyle.left}px`;
                bar.style.width = `${barStyle.width}px`;
                bar.textContent = shift.position;
                // ポジションごとの色分け
                bar.style.backgroundColor = positionColors[shift.position] || "#95a5a6";

                //シフト削除用のイベントリスナー
                bar.addEventListener("click", async () => {
                    const isDelete = window.confirm(`${employeeName}さんの ${shift.startTime}〜${shift.endTime} のシフトを削除しますか？`);
                    if (isDelete) {
                        try {
                            await deleteDoc(doc(db, "shifts", shift.id));
                            renderAllShiftTimeline(targetYear, targetMonth, targetDay, tbodyId);
                        } catch (error) {
                            console.error("削除エラー:", error);
                            alert("削除に失敗しました。");
                        }
                    }
                });

                // 完成したバーをマスの中に追加
                startTd.appendChild(bar);
            });

            // バーが全部入ったマスを行に追加
            tr.appendChild(startTd);

            // 残りの 7:00〜21:00 までの空マスを作る
            for (let i = 0; i < 15; i++) {
                const emptyTd = document.createElement("td");
                tr.appendChild(emptyTd);
            }

            // 1人分の完成した行をテーブルに追加
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("全体シフト取得エラー:", error);
        tbody.innerHTML = "<tr><td colspan='17' style='text-align: center; color: red;'>エラーが発生しました</td></tr>";
    }
};

// 管理者タブ用の呼び出し処理
export const updateAdminTimeline = () => {
    const valYear = selYear.value;
    const valMonth = selMonth.value;
    const valDay = selDay.value;

    //入力チェック
    if (!valYear || !valMonth || !valDay) return;

    //日本語の文字から数字だけを抜き出し、管理者用テーブルのIDと一緒に渡す
    renderAllShiftTimeline(
        parseInt(valYear),
        parseInt(valMonth),
        parseInt(valDay),
        "shift-grid-body"
    );
};

// ドロップダウンが変更されたら、上の呼び出し役を発動させる
document.getElementById("sel-year").addEventListener("change", updateAdminTimeline);
document.getElementById("sel-month").addEventListener("change", updateAdminTimeline);
document.getElementById("sel-day").addEventListener("change", updateAdminTimeline);

//ポップアップを閉じる
document.getElementById("close-popup-btn").addEventListener("click", () => {
    document.getElementById("shift-popup").classList.add("hidden");
});

// シフト作成タブの日付を今日の日付にする
const setTodayToAdminDropdown = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const selYear = document.getElementById("sel-year");
    const selMonth = document.getElementById("sel-month");
    const selDay = document.getElementById("sel-day");
    if (selYear && selMonth && selDay) {
        selYear.value = `${currentYear}年`;
        selMonth.value = `${currentMonth}月`;
        selDay.value = `${currentDay}日`;
    }
    if (typeof updateAdminTimeline === "function") {
        updateAdminTimeline();
    }
};
window.addEventListener("DOMContentLoaded", setTodayToAdminDropdown);