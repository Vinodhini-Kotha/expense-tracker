

window.onload = function() {
  let users = JSON.parse(localStorage.getItem("users")) || {};
  let currentUser = localStorage.getItem("currentUser");
  if (currentUser && users[currentUser]) {
    let userObj = users[currentUser];
    let savedDay = userObj.day || new Date().getDate();
    let today = new Date().getDate();

    if (savedDay !== today) {
      moveTodayToYesterday(userObj);
      userObj.day = today;
      users[currentUser] = userObj;
      localStorage.setItem("users", JSON.stringify(users));
    }

    showDashboard();
  } else {
    showLogin();
  }
};

function showLogin() {
  document.getElementById("introPage").style.display = "flex";
  document.getElementById("dashboard").style.display = "none";

  let users = JSON.parse(localStorage.getItem("users")) || {};
  let existingList = document.getElementById("existingUsers");
  existingList.innerHTML = "";
  let keys = Object.keys(users);
  if (keys.length === 0) {
    existingList.innerHTML = "<em>No users yet.</em>";
    return;
  }
  keys.forEach(user => {
    let btn = document.createElement("button");
    btn.textContent = user;
    btn.style.marginRight = "7px";
    btn.style.marginBottom = "7px";
    btn.style.background = "#e8effa";
    btn.style.color = "#4b4b58";
    btn.style.border = "1px solid #bbb";
    btn.style.borderRadius = "7px";
    btn.style.padding = "8px 15px";
    btn.style.cursor = "pointer";
    btn.onclick = function() {
      localStorage.setItem("currentUser", user);
      showDashboard();
    };
    existingList.appendChild(btn);
  });
}

document.getElementById('continueBtn').onclick = function() {
  let name = document.getElementById('nameInput').value.trim();
  let budget = parseFloat(document.getElementById('budgetInput').value);
  if (!name || !budget || budget <= 0) {
    alert("Please enter name & valid budget!");
    return;
  }
  let users = JSON.parse(localStorage.getItem("users")) || {};
  if (!users[name]) {
    users[name] = {
      userName: name,
      userBudget: budget,
      remainAmount: budget,
      todaySpent: 0,
      yesterdaySpent: 0,
      streak: 0,
      day: new Date().getDate()
    };
    localStorage.setItem("users", JSON.stringify(users));
  }
  localStorage.setItem("currentUser", name);
  showDashboard();

  document.getElementById('nameInput').value = "";
  document.getElementById('budgetInput').value = "";
};

function showDashboard() {
  document.getElementById("introPage").style.display = "none";
  document.getElementById("dashboard").style.display = "flex";
  let users = JSON.parse(localStorage.getItem("users")) || {};
  let currentUser = localStorage.getItem("currentUser");
  if (!users[currentUser]) {
    showLogin();
    return;
  }
  let userObj = users[currentUser];
  document.getElementById("greet").textContent = "Hi " + userObj.userName;
  document.getElementById("remainAmount").textContent = "₹" + userObj.remainAmount.toFixed(2);
  document.getElementById("streakCount").textContent = userObj.streak;
  document.getElementById("todayTotal").textContent = "₹" + userObj.todaySpent.toFixed(2);
  document.getElementById("yesterdayspend").textContent = "₹" + userObj.yesterdaySpent.toFixed(2);

  let perDay = userObj.userBudget / 30;
  let daysLeft = 30 - (userObj.day || new Date().getDate());
  let idealRemain = daysLeft * perDay;
  let percent = (userObj.remainAmount / idealRemain) * 100;

  let bar = document.getElementById("remainBar");
  bar.style.width = Math.min(percent, 100) + "%";
  bar.classList.remove("green", "orange", "red");
  if (percent >= 85) bar.classList.add("green");
  else if (percent >= 75) bar.classList.add("orange");
  else bar.classList.add("red");
}

function getUserData() {
  let users = JSON.parse(localStorage.getItem("users")) || {};
  let currentUser = localStorage.getItem("currentUser");
  return { users, currentUser, userObj: users[currentUser] };
}

function setUserData(userObj) {
  let users = JSON.parse(localStorage.getItem("users")) || {};
  users[userObj.userName] = userObj;
  localStorage.setItem("users", JSON.stringify(users));
}

function addExpense(type) {
  let { users, currentUser, userObj } = getUserData();
  let amt = prompt("Enter amount spent on " + type + ":", "0");
  if (amt === null) return;
  amt = parseFloat(amt);
  if (isNaN(amt) || amt < 0) {
    alert("Please enter valid number!");
    return;
  }
  userObj.todaySpent += amt;
  setUserData(userObj);
  document.getElementById("todayTotal").textContent = "₹" + userObj.todaySpent.toFixed(2);
  showDashboard();
}

function showOther() {
  document.getElementById("otherSuggestBox").style.display = "block";
}

function closeOther() {
  document.getElementById("otherSuggestBox").style.display = "none";
}

function showCustom() {
  document.getElementById("modalBackdrop").style.display = "block";
  document.getElementById("customBox").style.display = "flex";
}

function closeCustom() {
  document.getElementById("modalBackdrop").style.display = "none";
  document.getElementById("customBox").style.display = "none";
}

function submitCustom() {
  let { userObj } = getUserData();
  let name = document.getElementById("customName").value.trim();
  let amt = parseFloat(document.getElementById("customAmt").value);
  if (!name || isNaN(amt) || amt < 0) {
    alert("Enter valid name and amount!");
    return;
  }
  userObj.todaySpent += amt;
  setUserData(userObj);
  document.getElementById("todayTotal").textContent = "₹" + userObj.todaySpent.toFixed(2);
  document.getElementById("customName").value = "";
  document.getElementById("customAmt").value = "";
  closeCustom();
  showDashboard();
}

function moveTodayToYesterday(userObj) {
  userObj.yesterdaySpent = userObj.todaySpent;
  userObj.remainAmount -= userObj.todaySpent;
  userObj.todaySpent = 0;
  let perDay = userObj.userBudget / 30;
  let day = userObj.day || new Date().getDate();
  let daysLeft = 30 - day;
  let idealRemain = daysLeft * perDay;
  let percent = (userObj.remainAmount / idealRemain) * 100;
  if (percent >= 85) userObj.streak = (userObj.streak || 0) + 1;
  else userObj.streak = 0;
}

function endDay() {
  let { users, currentUser, userObj } = getUserData();
  moveTodayToYesterday(userObj);
  let day = userObj.day || new Date().getDate();
  day++;
  if (day > 30) day = 1;
  userObj.day = day;
  users[currentUser] = userObj;
  localStorage.setItem("users", JSON.stringify(users));
  document.getElementById("yesterdayspend").textContent = "₹" + userObj.yesterdaySpent.toFixed(2);
  document.getElementById("remainAmount").textContent = "₹" + userObj.remainAmount.toFixed(2);
  document.getElementById("todayTotal").textContent = "₹0";
  document.getElementById("streakCount").textContent = userObj.streak;
  let perDay = userObj.userBudget / 30;
  let daysLeft = 30 - day;
  let idealRemain = daysLeft * perDay;
  let percent = (userObj.remainAmount / idealRemain) * 100;
  let bar = document.getElementById("remainBar");
  bar.style.width = Math.min(percent, 100) + "%";
  bar.classList.remove("green", "orange", "red");
  if (percent >= 85) bar.classList.add("green");
  else if (percent >= 75) bar.classList.add("orange");
  else bar.classList.add("red");
}

function autoEndDay() {
  var now = new Date();
  if (now.getHours() === 23 && now.getMinutes() === 59) {
    endDay();
  }
}
setInterval(autoEndDay, 60000);

document.getElementById('logoutBtn').onclick = function() {
  localStorage.removeItem("currentUser");
  showLogin();
};             

