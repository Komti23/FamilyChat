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

function wrapTextByCharacters(text, maxCharsPerLine = 30) {
  let result = '';
  for (let i = 0; i < text.length; i += maxCharsPerLine) {
    result += text.slice(i, i + maxCharsPerLine) + '\n';
  }
  return result.trim();
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

  // Парсим эмодзи и переносим строки
  const parsedText = wrapTextByCharacters(parseEmojis(msg.text), 30);
  textSpan.textContent = `${msg.role}: ${parsedText}`;

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

  // Анимация появления (CSS-класс)
  div.classList.add('fade-in');

  // Автопрокрутка вниз
  container.scrollTop = container.scrollHeight;
}

function parseEmojis(text) {
  const emojisMap = {
    ':)': '😊',
    ':-)': '😊',
    ':(': '😞',
    ':-(': '😞',
    ':D': '😄',
    ':-D': '😄',
    ':P': '😛',
    ':-P': '😛',
    ';)': '😉',
    ';-)': '😉',
    ':o': '😮',
    ':-o': '😮',
    ':|': '😐',
    ':-|': '😐',
    ':/': '😕',
    ':-/': '😕',
    ':*': '😘',
    ':-*': '😘',
    '<3': '❤️'
  };

  for (const [key, emoji] of Object.entries(emojisMap)) {
    const regex = new RegExp(escapeRegExp(key), 'g');
    text = text.replace(regex, emoji);
  }
  return text;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Предотвращаем отправку формы по Enter, чтобы избежать дублирования
document.getElementById('messageInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

const messagesContainer = document.getElementById('messages');
const shownMessages = new Set();

db.ref('messages').on('child_added', snap => {
  const msg = snap.val();
  const key = snap.key;

  if (shownMessages.has(key)) return;
  shownMessages.add(key);

  showMessage(msg, key);

  if (msg.role !== role && document.hidden && Notification.permission === 'granted') {
    new Notification(`${msg.role}: ${msg.text}`);
  }
});

db.ref('messages').on('child_removed', snap => {
  const removedKey = snap.key;
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

// Запрашиваем разрешение на уведомления
document.addEventListener('DOMContentLoaded', () => {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
});
