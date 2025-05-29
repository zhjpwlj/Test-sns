// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Night mode toggle
const nightModeBtn = document.getElementById("night-mode-btn");
nightModeBtn.addEventListener("click", toggleNightMode);

function toggleNightMode() {
  document.body.classList.toggle("night-mode");
}

// Google Login
const loginBtn = document.getElementById("login-btn");
loginBtn.addEventListener("click", function () {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      console.log("User signed in: ", user);
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("content-section").style.display = "block";
    })
    .catch((error) => {
      console.error("Error during Google login: ", error);
    });
});

// Handle logout
function logout() {
  auth.signOut().then(() => {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("content-section").style.display = "none";
  }).catch((error) => {
    console.error("Error during logout: ", error);
  });
}

// Post submission
const postBtn = document.getElementById("post-btn");
postBtn.addEventListener("click", function () {
  const postContent = document.getElementById("post-content").value;
  if (postContent.trim() !== "") {
    // You can integrate Firebase Firestore to store posts or Google Drive API to upload
    const postElement = document.createElement("div");
    postElement.classList.add("post");
    postElement.textContent = postContent;
    document.getElementById("posts-list").appendChild(postElement);
    document.getElementById("post-content").value = ""; // Clear the text area
  }
});

// Firebase Authentication State Change
auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("content-section").style.display = "block";
  } else {
    // User is signed out
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("content-section").style.display = "none";
  }
});

// Google Drive Upload
let gapiLoaded = false;
let auth2 = null;

// Load Google API Client
function loadGAPIClient() {
  gapi.load("client:auth2", initClient);
}

// Initialize the Google API client
function initClient() {
  gapi.client.init({
    apiKey: 'YOUR_GOOGLE_API_KEY',
    clientId: 'YOUR_OAUTH_CLIENT_ID',
    scope: 'https://www.googleapis.com/auth/drive.file',
  }).then(() => {
    auth2 = gapi.auth2.getAuthInstance();
    gapiLoaded = true;
    console.log("Google API Client initialized!");
  });
}

// Google Login for Drive
document.getElementById('login-btn').addEventListener('click', function () {
  if (!gapiLoaded) {
    loadGAPIClient();
  } else {
    auth2.signIn().then(function (googleUser) {
      console.log('User signed in: ', googleUser.getBasicProfile().getName());
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("content-section").style.display = "block";
    });
  }
});

// File Upload
function uploadFile(file) {
  const metadata = {
    name: file.name,
    mimeType: file.type
  };

  const formData = new FormData();
  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  formData.append("file", file);

  const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
  
  fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: new Headers({
      "Authorization": "Bearer " + accessToken
    }),
    body: formData
  }).then(response => response.json())
    .then(data => {
      console.log("File uploaded: ", data);
      const fileId = data.id;
      getFileLink(fileId);
    })
    .catch(error => {
      console.error("Upload failed: ", error);
    });
}

function getFileLink(fileId) {
  const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
  fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,webViewLink`, {
    method: 'GET',
    headers: new Headers({
      'Authorization': 'Bearer ' + accessToken
    })
  }).then(response => response.json())
    .then(data => {
      const fileLink = data.webViewLink;
      console.log('File uploaded! You can access it at: ' + fileLink);
    }).catch(error => {
      console.error("Error fetching file link: ", error);
    });
}

// Show file input when Google login is successful
auth2.isSignedIn.listen(function (isSignedIn) {
  if (isSignedIn) {
    document.getElementById('file-input').style.display = 'block';
    document.getElementById('upload-btn').style.display = 'block';
  }
});

const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');

uploadBtn.addEventListener('click', function () {
  const file = fileInput.files[0];
  if (file) {
    uploadFile(file);
  } else {
    alert("Please select a file.");
  }
});
