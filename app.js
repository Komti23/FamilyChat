const firebaseConfig = {
  apiKey: "AIzaSyAIZ9mC1YZ15fbIKNJlwhvI5Gg9I0QdCBo",
  authDomain: "familychat2-e224d.firebaseapp.com",
  databaseURL: "https://familychat2-e224d-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "familychat2-e224d",
  storageBucket: "familychat2-e224d.appspot.com",
  messagingSenderId: "482956995855",
  appId: "1:482956995855:web:eea0050d7081a9b9a3227a",
  measurementId: "G-LLHFZBTRNT"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let role = "";

function enterChat() {
  const selected = document.getElementById('role').value;
  if (!selected || selected === 'Выберите роль') {
    alert("Пожалуйста, выберите роль");
    return;
  }
  role = selected;
  document.getElementById('login').style.display = 'none';
  document.getElementById('chat').style.display = 'flex';

  if (role === 'Админ') {
    document.getElementById('clearBtn').style.display = 'inline-block';
  }
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text) return;
  db.ref('messages').push({
    role: role,
    text: text,
    time: Date.now()
  });
  input.value = '';
}

function showMessage(msg, key) {
  const container = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `message ${msg.role}`;
  div.dataset.key = key;

  const textSpan = document.createElement('span');
  textSpan.className = 'message-text';
  textSpan.textContent = `${msg.role}: ${msg.text}`;
  div.appendChild(textSpan);

  if (role === msg.role) {
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = 'Удалить';
    delBtn.onclick = () => {
      if (confirm("Удалить это сообщение?")) {
        db.ref('messages/' + key).remove()
          .catch(err => alert("Ошибка удаления: " + err.message));
      }
    };
    div.appendChild(delBtn);
  }

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

const messagesContainer = document.getElementById('messages');

db.ref('messages').on('child_added', snapshot => {
  showMessage(snapshot.val(), snapshot.key);
});

db.ref('messages').on('child_removed', snapshot => {
  const removedKey = snapshot.key;
  const children = messagesContainer.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.dataset && child.dataset.key === removedKey) {
      messagesContainer.removeChild(child);
      break;
    }
  }
});

document.getElementById('clearBtn').onclick = () => {
  if (confirm("Вы действительно хотите очистить весь чат?")) {
    db.ref('messages').remove()
      .catch(err => alert("Ошибка очистки чата: " + err.message));
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
});
