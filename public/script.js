const form = document.getElementById('prediction-form');
const resultContent = document.getElementById('result-content');

form.addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(form);
  const age = formData.get('age');
  const gender = formData.get('gender');
  const symptoms = formData.getAll('symptoms');
  const maxResults = formData.get('maxResults') || 3;

  resultContent.innerHTML = '<p>Loading prediction...</p>';

  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age, gender, symptoms, maxResults })
    });

    const data = await response.json();
    if (!response.ok) {
      resultContent.innerHTML = `<p class="error">${data.error || 'Prediction failed.'}</p>`;
      return;
    }

    if (!data.predictions.length) {
      resultContent.innerHTML = '<p>No likely conditions found. Try adjusting symptoms or age.</p>';
      return;
    }

    const primaryName = data.primary ? data.primary.name : data.predictions[0].name;

    resultContent.innerHTML = data.predictions.map((prediction, idx) => `
      <div class="prediction-item ${prediction.name === primaryName ? 'primary-prediction' : ''}">
        <h3>${prediction.name} ${prediction.name === primaryName ? '<small>(Most likely)</small>' : ''}</h3>
        <p><strong>Category:</strong> ${prediction.category}</p>
        <p>${prediction.description}</p>
        <p><strong>Matched symptoms:</strong> ${prediction.matchedSymptoms.join(', ')}</p>
        <p><strong>Probability:</strong> ${(prediction.probability * 100).toFixed(1)}%</p>
        <p><strong>First aid / Advice:</strong> ${prediction.advice}</p>
      </div>
    `).join('');
  } catch (error) {
    resultContent.innerHTML = '<p class="error">Network error occurred.</p>';
  }
});
