const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const diseases = require(path.join(__dirname, 'data', 'diseases.json'));

const app = express();
const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGODB_DB || 'disease_app';
let predictionsCollection = null;

const indexHtml = `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Өвчин таамаглагч</title>
  <style>
    :root {
      --bg: #f2f7fb;
      --surface: #ffffff;
      --text: #1f2937;
      --muted: #6b7280;
      --accent: #2563eb;
      --accent-soft: #dbeafe;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Inter, system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
    }

    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px;
    }

    header {
      text-align: center;
      margin-bottom: 24px;
    }

    header h1 {
      margin: 0;
      font-size: 2.1rem;
    }

    header p {
      color: var(--muted);
    }

    main {
      display: grid;
      gap: 24px;
    }

    .field-row {
      display: grid;
      gap: 8px;
      margin-bottom: 16px;
    }

    .admin-link {
      display: inline-block;
      margin-top: 10px;
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
    }

    .admin-link:hover {
      text-decoration: underline;
    }

    .field-row label {
      font-weight: 600;
    }

    input[type="number"], select {
      width: 120px;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      font-size: 1rem;
    }

    .symptoms-section {
      background: var(--surface);
      border: 1px solid #e5e7eb;
      border-radius: 18px;
      padding: 18px;
    }

    .symptoms-section h2 {
      margin-top: 0;
    }

    .symptom-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }

    .symptom-grid label {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 12px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      cursor: pointer;
    }

    button[type="submit"] {
      width: 100%;
      padding: 14px 16px;
      border: none;
      border-radius: 14px;
      background: var(--accent);
      color: white;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
    }

    button[type="submit"]:hover {
      background: #1d4ed8;
    }

    .result-box {
      background: var(--surface);
      border: 1px solid #e5e7eb;
      border-radius: 18px;
      padding: 18px;
    }

    #result-content {
      color: var(--muted);
    }

    .prediction-item {
      margin-bottom: 18px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      background: #f8fbff;
    }

    .prediction-item h3 {
      margin: 0 0 8px;
    }

    .primary-prediction {
      border-color: #f97316;
      background: linear-gradient(90deg, #fff7ed, #fff3e0);
      box-shadow: 0 8px 22px rgba(249,115,22,0.10);
    }

    .prediction-item small {
      color: var(--muted);
    }

    .match-list {
      margin: 10px 0 0;
      padding-left: 18px;
    }

    .error {
      color: #b91c1c;
    }

    @media (max-width: 640px) {
      .container {
        padding: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Өвчин таах туслах</h1>
      <p>Нас, хүйс, шинж тэмдгээ сонгож үр дүнг авна уу.</p>
      <p style="color:#b91c1c; font-weight:600;">Энэ систем нь эмчийн оношилгоог орлохгүй, зөвхөн урьдчилсан мэдээлэл олгох зорилготой.</p>
      <p><a class="admin-link" href="/logs">Таамаглалын түүхийг үзэх</a></p>
    </header>

    <main>
      <form id="prediction-form">
        <div class="field-row">
          <label for="age">Нас</label>
          <input type="number" id="age" name="age" min="1" max="120" value="30" required />
        </div>

        <div class="field-row">
          <label for="gender">Хүйс</label>
          <select id="gender" name="gender" required>
            <option value="all">Бүгд</option>
            <option value="male">Эрэгтэй</option>
            <option value="female">Эмэгтэй</option>
          </select>
        </div>

        <div class="field-row">
          <label for="categoryFilter">Өвчний төрөл</label>
          <select id="categoryFilter" name="categoryFilter">
            <option value="all">Бүгд</option>
            <option value="Easily Contracted">Шуурхай</option>
            <option value="Chronic">Удаан үргэлжлэх</option>
          </select>
        </div>

        <div class="field-row">
          <label for="symptom-search">Шинж тэмдэг хайх</label>
          <input type="text" id="symptom-search" placeholder="Жишээ нь: ханиад, өвдөх" />
        </div>

        <div class="field-row">
          <label for="maxResults">Үр дүнгийн тоо</label>
          <select id="maxResults" name="maxResults">
            <option value="3">3 үр дүн</option>
            <option value="4">4 үр дүн</option>
            <option value="5">5 үр дүн</option>
            <option value="6">6 үр дүн</option>
            <option value="7">7 үр дүн</option>
            <option value="8" selected>8 үр дүн</option>
          </select>
        </div>

        <section class="symptoms-section">
          <h2>Шинж тэмдэг</h2>
          <div class="symptom-grid">
            <label><input type="checkbox" name="symptoms" value="dizziness" /> Толгой эргэх / Тэнцвэргүй байдал</label>
            <label><input type="checkbox" name="symptoms" value="headache" /> Толгой өвчин</label>
            <label><input type="checkbox" name="symptoms" value="tinnitus" /> Чих шуугих</label>
            <label><input type="checkbox" name="symptoms" value="dry mouth" /> Хуурай ам</label>
            <label><input type="checkbox" name="symptoms" value="dry tongue" /> Хуурай хэл</label>
            <label><input type="checkbox" name="symptoms" value="blurred vision" /> Хараа бүдэгших</label>
            <label><input type="checkbox" name="symptoms" value="toothache" /> Шүд өвдөх</label>
            <label><input type="checkbox" name="symptoms" value="yawning" /> Дараалсан залгилах / ядралт</label>
            <label><input type="checkbox" name="symptoms" value="fatigue" /> Тасралтгүй ядрах</label>
            <label><input type="checkbox" name="symptoms" value="chest tightness" /> Цээж шахагдах / амьсгал давчдах</label>
            <label><input type="checkbox" name="symptoms" value="palpitations" /> Зүрх дэлсэх</label>
            <label><input type="checkbox" name="symptoms" value="retching" /> Хуурай бөөлжих</label>
            <label><input type="checkbox" name="symptoms" value="bloating" /> Живхрэх / хэвлий өвдөлт</label>
            <label><input type="checkbox" name="symptoms" value="rumbling" /> Хоол боловсруулах эрхтний дүнгэнэх</label>
            <label><input type="checkbox" name="symptoms" value="talkative" /> Их ярьдаг байх</label>
            <label><input type="checkbox" name="symptoms" value="joint pain" /> Явах үе үе үе үеү өвдөх</label>
            <label><input type="checkbox" name="symptoms" value="back stiffness" /> Доод нуруу хөших</label>
            <label><input type="checkbox" name="symptoms" value="chills" /> Хүйт өртөж хөлрөх</label>
            <label><input type="checkbox" name="symptoms" value="insomnia" /> Нойргүйдэл</label>
            <label><input type="checkbox" name="symptoms" value="dry cough" /> Хуурай ханиалгах</label>
            <label><input type="checkbox" name="symptoms" value="anxiety" /> Сэтгэл түгшилт / хэт санаа зовох</label>
          </div>
        </section>

        <button type="submit">Таамаглах</button>
      </form>

      <section id="result" class="result-box">
        <h2>Таамаглалын үр дүн</h2>
        <div id="result-content">Шинж тэмдгээ оруулж “Таамаглах” товчийг дарна уу.</div>
      </section>
    </main>
  </div>

  <script>
    const form = document.getElementById('prediction-form');
    const resultContent = document.getElementById('result-content');
    const symptomSearch = document.getElementById('symptom-search');

    symptomSearch.addEventListener('input', () => {
      const query = symptomSearch.value.trim().toLowerCase();
      document.querySelectorAll('.symptom-grid label').forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = text.includes(query) ? '' : 'none';
      });
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const formData = new FormData(form);
      const age = formData.get('age');
      const gender = formData.get('gender');
      const categoryFilter = formData.get('categoryFilter') || 'all';
      const symptoms = formData.getAll('symptoms');
      const maxResults = formData.get('maxResults') || 3;

      resultContent.innerHTML = '<p>Таамаглал уншиж байна...</p>';

      try {
        const response = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ age, gender, categoryFilter, symptoms, maxResults })
        });

        const data = await response.json();
        if (!response.ok) {
          const p = document.createElement('p');
          p.className = 'error';
          p.textContent = data.error || 'Таамаг амжилтгүй боллоо.';
          resultContent.innerHTML = '';
          resultContent.appendChild(p);
          return;
        }

        if (!data.predictions.length) {
          resultContent.innerHTML = '<p>Ихэнх магадлалтай өвчин олдсонгүй. Шинж тэмдэг эсвэл насыг өөрчлөн дахин оролдоно уу.</p>';
          return;
        }

        const topProbability = data.predictions[0].probability;
        const secondProbability = data.predictions[1]?.probability || 0;
        // Consider a disease "most likely" when top probability is greater than 35%
        // and it exceeds the runner-up by at least 10 percentage points.
        const hasStrongPrimary = topProbability > 0.35 && topProbability - secondProbability >= 0.10;
        const primaryName = hasStrongPrimary ? data.predictions[0].displayName || data.predictions[0].name : null;

        resultContent.innerHTML = '';
        if (!hasStrongPrimary) {
          const note = document.createElement('p');
          note.style.color = '#b45309';
          note.style.marginBottom = '16px';
          note.textContent = 'Эдгээр таамаглалын итгэлтэй байдал бага байна. Илүү тодорхой шинж тэмдэг оруулна уу.';
          resultContent.appendChild(note);
        }

        data.predictions.forEach(prediction => {
          const nameLabel = prediction.displayName || prediction.name;
          const item = document.createElement('div');
          item.className = 'prediction-item' + (nameLabel === primaryName ? ' primary-prediction' : '');

          const title = document.createElement('h3');
          title.textContent = nameLabel;
          if (nameLabel === primaryName) {
            const small = document.createElement('small');
            small.textContent = ' (хамгийн магадлалтай)';
            const percent = document.createElement('small');
            percent.style.marginLeft = '8px';
            percent.style.color = '#92400e';
            percent.textContent = ' — Итгэл: ' + (prediction.probability * 100).toFixed(1) + '%';
            title.appendChild(small);
            title.appendChild(percent);
          }
          item.appendChild(title);

          const category = document.createElement('p');
          const categoryLabel = document.createElement('strong');
          categoryLabel.textContent = 'Төрөл:';
          category.appendChild(categoryLabel);
          category.appendChild(document.createTextNode(' ' + prediction.category));
          item.appendChild(category);

          const description = document.createElement('p');
          description.textContent = prediction.description;
          item.appendChild(description);

          const matched = document.createElement('p');
          const matchedLabel = document.createElement('strong');
          matchedLabel.textContent = 'Таарах шинж тэмдэг:';
          matched.appendChild(matchedLabel);
          matched.appendChild(document.createTextNode(' ' + prediction.matchedSymptoms.join(', ')));
          item.appendChild(matched);

          const probability = document.createElement('p');
          const probabilityLabel = document.createElement('strong');
          probabilityLabel.textContent = 'Магадлал:';
          probability.appendChild(probabilityLabel);
          probability.appendChild(document.createTextNode(' ' + (prediction.probability * 100).toFixed(1) + '%'));
          item.appendChild(probability);

          const advice = document.createElement('p');
          const adviceLabel = document.createElement('strong');
          adviceLabel.textContent = 'Анхны тусламж / Зөвлөгөө:';
          advice.appendChild(adviceLabel);
          advice.appendChild(document.createTextNode(' ' + prediction.advice));
          item.appendChild(advice);

          // Always advise to see a doctor when needed after first-aid
          const follow = document.createElement('p');
          follow.style.marginTop = '6px';
          follow.style.color = '#b91c1c';
          follow.style.fontWeight = '600';
          follow.textContent = 'Хэрэв шаардлагатай бол эмчид заавал үзүүлнэ үү.';
          item.appendChild(follow);

          resultContent.appendChild(item);
        });
      } catch (error) {
        resultContent.innerHTML = '<p class="error">Сүлжээний алдаа гарлаа.</p>';
      }
    });
  </script>
</body>
</html>`;

const logsHtml = `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Таамаглалын түүх</title>
  <style>
    :root {
      --bg: #f2f7fb;
      --surface: #ffffff;
      --text: #1f2937;
      --muted: #6b7280;
      --accent: #2563eb;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Inter, system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
    }

    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px;
    }

    header {
      text-align: center;
      margin-bottom: 24px;
    }

    header h1 {
      margin: 0;
      font-size: 2.1rem;
    }

    header p {
      color: var(--muted);
    }

    .admin-link {
      display: inline-block;
      margin-top: 10px;
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
    }

    .admin-link:hover {
      text-decoration: underline;
    }

    .prediction-item {
      margin-bottom: 18px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      background: #f8fbff;
    }

    .prediction-item h3 {
      margin: 0 0 8px;
    }

    .error {
      color: #b91c1c;
    }

    details {
      margin-top: 10px;
    }

    @media (max-width: 640px) {
      .container {
        padding: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Таамаглалын түүх</h1>
      <p>Сүүлд гаргасан таамаглалууд MongoDB-д хадгалагдсан.</p>
      <p><a class="admin-link" href="/">Таамаглал руу буцах</a></p>
    </header>

    <main>
      <div id="logs-container">
        <p>Түүх уншиж байна...</p>
      </div>
    </main>
  </div>

  <script>
    async function loadLogs() {
      const container = document.getElementById('logs-container');
      try {
        const response = await fetch('/api/logs');
        const data = await response.json();

        if (!response.ok) {
          container.innerHTML = '<p class="error">' + (data.error || 'Түүх уншихад алдаа гарлаа.') + '</p>';
          return;
        }

        if (!data.logs.length) {
          container.innerHTML = '<p>Одоогоор түүх байхгүй.</p>';
          return;
        }

        container.innerHTML = data.logs.map(log =>
          '<div class="prediction-item">' +
            '<h3>' + new Date(log.created_at).toLocaleString() + '</h3>' +
            '<p><strong>Нас:</strong> ' + log.age + ' | <strong>Хүйс:</strong> ' + log.gender + '</p>' +
            '<p><strong>Шинж тэмдэг:</strong> ' + log.symptoms.join(', ') + '</p>' +
            '<p><strong>Топ таамаглал:</strong> ' + log.top_prediction + '</p>' +
            '<details>' +
              '<summary>Таамаглал үзэх</summary>' +
              '<ul>' +
                log.predictions.map(pred =>
                  '<li><strong>' + pred.name + '</strong> (' + (pred.probability * 100).toFixed(1) + '%) - ' + pred.category + '</li>'
                ).join('') +
              '</ul>' +
            '</details>' +
          '</div>'
        ).join('');
      } catch (error) {
        container.innerHTML = '<p class="error">Түүхийг ачааллахад сүлжээний алдаа гарлаа.</p>';
      }
    }

    loadLogs();
  </script>
</body>
</html>`;

app.use(express.json());

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function scoreDisease(disease, selectedSymptoms, age, gender) {
  const symptomMatches = disease.keywords.filter(keyword => selectedSymptoms.includes(keyword));
  const matchCount = symptomMatches.length;
  const kwCount = Math.max(1, (Array.isArray(disease.keywords) ? disease.keywords.length : 1));
  let score = matchCount + (matchCount / kwCount);

  if (disease.ageRange && disease.ageRange !== 'all') {
    const ar = String(disease.ageRange).toLowerCase();
    if (ar === 'adult') {
      if (age < 18) score -= 0.5; else score += 0.3;
    } else if (ar === 'senior') {
      if (age < 45) score -= 0.5; else score += 0.3;
    } else if (ar === 'child') {
      if (age >= 18) score -= 0.5; else score += 0.3;
    }
  }

  if (disease.gender && disease.gender !== 'all') {
    if (String(disease.gender).toLowerCase() === String(gender).toLowerCase()) {
      score += 0.3;
    } else {
      score -= 0.3;
    }
  }

  return { ...disease, score, matchedSymptoms: symptomMatches };
}

function getAdvice(disease) {
  if (disease.advice) return disease.advice;
  const kws = (disease.keywords || []).map(k => String(k).toLowerCase());

  if (kws.includes('chest tightness') || kws.includes('palpitations') || kws.includes('palpitation') || kws.includes('heart palpitations')) {
    return 'Хэвлийгээр өвдөх, амьсгаадах, эсвэл бөөлжих нь удаан үргэлжилбэл нэн даруй эмчийн тусламж авна уу.';
  }
  if (kws.includes('fever') || kws.includes('chronic fever')) {
    return 'Халууралт өндөр (38°C-с дээш) эсвэл удаан үргэлжлвэл эмчид хандаж, бүлээн шингэн ихээр ууж, амарна уу.';
  }
  if (kws.includes('dry cough') || kws.includes('cough') || kws.includes('phlegm') || kws.includes('breathing')) {
    return 'Ханиад, амьсгал давчдах шинж бол бүрэн амарч, шингэн сайн ууж, хэрвээ удаан байвал эмчид үзүүл.';
  }
  if (kws.includes('bloating') || kws.includes('stomach pain') || kws.includes('nausea') || kws.includes('retching')) {
    return 'Ходоод өвдөж, дотор огшоод байвал түргэн хоолноос зайлсхийж, тунгалаг шингэн ууж, хэрвээ бөөлжих, цус гарах зэрэг шинж байвал эмчээс зөвлөгөө ав.';
  }
  if (kws.includes('joint pain') || kws.includes('back stiffness') || kws.includes('stiffness')) {
    return 'Өвчилсөн хэсгийг амрааж, дулаан эсвэл хүйтэн жин тавь; өвчин хүчтэй байвал эсвэл хэд хоногоос илүү үргэлжилбэл эмчид үзүүл.';
  }
  if (kws.includes('dizziness') || kws.includes('vertigo') || kws.includes('tinnitus')) {
    return 'Толгой эргэх үед сууж эсвэл хэвтээд, жолоо барихгүй, өндөрт гарахгүй бай; шинж удаан үргэлжилбэл эмчээс зөвлөгөө ав.';
  }

  return 'Шинж тэмдэг хүчтэй, муудаж байгаа эсвэл санаа зовоосой бол эмчид хандаж, амарсан ба шингэн сайн ууж байгаарай.';
}

app.post('/api/predict', (req, res) => {
  const { age, gender, categoryFilter } = req.body;
  let { maxResults, symptoms } = req.body;
  const ageNumber = Number(age);
  const selectedSymptoms = Array.isArray(symptoms)
    ? symptoms.map(normalizeText)
    : [];
  const normalizedGender = normalizeText(gender || 'all');
  const normalizedCategory = normalizeText(categoryFilter || 'all');

  if (!selectedSymptoms.length) {
    return res.status(400).json({ error: 'Заавал нэг шинж тэмдэг сонгоно уу.' });
  }

  maxResults = Number(maxResults) || 3;
  if (maxResults < 3) maxResults = 3;
  if (maxResults > 8) maxResults = 8;

  const scored = diseases
    .filter(disease => normalizedCategory === 'all' || normalizeText(disease.category) === normalizedCategory)
    .map(disease => scoreDisease(disease, selectedSymptoms, ageNumber, normalizedGender))
    .map(item => ({ ...item, score: Math.max(0, item.score) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  if (!scored.length) {
    return res.json({ predictions: [] });
  }

  const total = scored.reduce((s, it) => s + it.score, 0) || 1;
  const top = scored.slice(0, maxResults).map(item => ({
    name: item.name,
    displayName: item.displayName || item.name,
    category: item.category,
    description: item.description,
    matchedSymptoms: item.matchedSymptoms,
    score: item.score,
    probability: +(item.score / total).toFixed(3),
    advice: item.advice || getAdvice(item)
  }));

  const topPrediction = top[0].displayName;
  const logItem = {
    created_at: new Date(),
    age: ageNumber,
    gender: normalizedGender,
    symptoms: selectedSymptoms,
    top_prediction: topPrediction,
    predictions: top
  };

  if (predictionsCollection) {
    predictionsCollection.insertOne(logItem).catch(err => {
      console.error('MongoDB insert error:', err);
    });
  }

  res.json({ predictions: top, primary: top[0] });
});

app.get('/api/logs', async (req, res) => {
  if (!predictionsCollection) {
    return res.status(500).json({ error: 'MongoDB холбогдоогүй байна.' });
  }

  try {
    const rows = await predictionsCollection.find({}).sort({ created_at: -1 }).limit(20).toArray();
    res.json({ logs: rows });
  } catch (err) {
    res.status(500).json({ error: 'Түүхийг татахад амжилтгүй боллоо.' });
  }
});

app.get('/logs', (req, res) => {
  res.type('html').send(logsHtml);
});

app.get('*', (req, res) => {
  res.type('html').send(indexHtml);
});

async function initDatabase() {
  try {
    const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db(mongoDbName);
    predictionsCollection = db.collection('prediction_logs');
    await predictionsCollection.createIndex({ created_at: -1 });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    predictionsCollection = null;
  }
}

async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
