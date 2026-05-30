const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);
    const from = message.from;
    const text = message.text?.body?.toLowerCase() || '';
    let reply = getReply(text);
    await sendMessage(from, reply);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

function getReply(text) {
  if (text.match(/שלום|היי|הי|בוקר|ערב|צהריים|hello|hi|hey/)) {
    return `שלום וברוכים הבאים להלבנטיני! 🌿\n\nבמה אפשר לעזור?\n1️⃣ שעות פתיחה\n2️⃣ הזמנת מקום\n3️⃣ תפריט\n4️⃣ משלוח / איסוף עצמי\n5️⃣ כשרות\n6️⃣ כתובת\n\nפשוט כתבו את מספר הנושא או את השאלה שלכם 😊`;
  }
  if (text.match(/פתוח|סגור|שעות|מתי|שעה|פתיחה|1/)) {
    return `אנחנו פתוחים כל ימות השבוע, כולל שבת ✅\n🕚 11:00 עד 23:00\n\nבן יהודה 170, תל אביב`;
  }
  if (text.match(/הזמנ|מקום|שולחן|reserve|book|2/)) {
    return `להזמנת מקום מראש:\n👉 https://ontopo.com/he/il/page/94384211\n\nמומלץ להזמין מראש, במיוחד בסופי שבוע 🙏`;
  }
  if (text.match(/תפריט|אוכל|מנה|מנות|menu|3/)) {
    return `הנה התפריטים שלנו 🍽️\n\n🥩 תפריט ערב: https://halevantini.co.il/תפריט/\n💼 תפריט עסקיות: https://halevantini.co.il/עסקיות/\n🍷 תפריט יינות: https://halevantini.co.il/תפריט-יינות/\n🥙 תפריט פיתות: https://halevantini.co.il/תפריט-פיתות/`;
  }
  if (text.match(/משלוח|לאסוף|איסוף|delivery|takeaway|4/)) {
    return `אפשר גם משלוח וגם איסוף עצמי! 🛵\n\nלהזמנה:\n👉 https://halevantini.food.co.il/`;
  }
  if (text.match(/כשר|כשרות|חלב|בשר|חזיר|5/)) {
    return `המסעדה אינה מחזיקה תעודת כשרות רבנית.\n\n✅ כל הבשר והמוצרים כשרים\n✅ אין חזיר או שרצים\n✅ יש מנות חלביות (סלטים וקינוחים)\n✅ פתוחים בשבת`;
  }
  if (text.match(/כתובת|איפה|נמצא|address|6/)) {
    return `אנחנו בבן יהודה 170, תל אביב 📍\n\nhttps://maps.google.com/?q=הלבנטיני+בן+יהודה+170+תל+אביב`;
  }
  return `תודה על הפנייה! 🌿\n\nנציג שלנו יחזור אליך בהקדם.\nלשאלות מהירות אפשר לכתוב:\n1️⃣ שעות פתיחה\n2️⃣ הזמנת מקום\n3️⃣ תפריט\n4️⃣ משלוח / איסוף\n5️⃣ כשרות\n6️⃣ כתובת`;
}

async function sendMessage(to, body) {
  await axios.post(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    { messaging_product: 'whatsapp', to, type: 'text', text: { body } },
    { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } }
  );
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot running on port ${PORT}`));
