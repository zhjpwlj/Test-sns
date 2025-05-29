// 获取元素
const loginBtn = document.getElementById("login-btn");
const nightModeBtn = document.getElementById("night-mode-btn");
const postContent = document.getElementById("post-content");
const postBtn = document.getElementById("post-btn");
const contentSection = document.getElementById("content-section");
const authSection = document.getElementById("auth-section");

// Firebase 身份验证
const provider = new firebase.auth.GoogleAuthProvider();

loginBtn.addEventListener('click', () => {
  firebase.auth().signInWithPopup(provider).then((result) => {
    console.log("User signed in:", result.user);
    authSection.style.display = "none";
    contentSection.style.display = "block";
  }).catch((error) => {
    console.error("Error signing in:", error);
  });
});

nightModeBtn.addEventListener('click', () => {
  document.body.classList.toggle("dark-mode");
});

postBtn.addEventListener('click', () => {
  const user = firebase.auth().currentUser;
  const content = postContent.value;

  if (user && content) {
    postToGoogleSheets(user.displayName, content);
  } else {
    alert("Please login and write something.");
  }
});

// 将帖子保存到 Google Sheets
function postToGoogleSheets(user, content) {
  const url = 'YOUR_GOOGLE_SCRIPT_URL'; // 替换为你的 Google Script 部署 URL
  const data = { user: user, content: content };

  fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => response.text())
    .then(data => {
      console.log("Post submitted: ", data);
      alert("Your post has been shared!");
      postContent.value = ''; // 清空输入框
    }).catch(error => {
      console.log("Error submitting post: ", error);
    });
}
