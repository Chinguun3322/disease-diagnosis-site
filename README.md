# Disease Diagnosis Site

Simple Node.js + Express application for selecting age, gender, and symptoms to predict possible disease categories.

## Local setup

```powershell
cd C:\Users\Dell\disease-diagnosis-site
npm install
npm start
```

Open `http://localhost:3000`.

## Files to upload to GitHub

- `app.js`
- `package.json`
- `README.md`
- `.gitignore`
- `render.yaml`
- `data/diseases.json`
- `public/index.html`
- `public/style.css`
- `public/script.js`
- `public/logs.html`
- `scripts/kaggle_download.py`
- `scripts/csv_to_json.py`
- `scripts/merge_diseases.py`
- `scripts/README.md`

## Notes

- Do not upload `node_modules/`.
- Do not upload `data/*.db`.
- Set `MONGODB_URI` and `MONGODB_DB` when deploying to Render or running with MongoDB.
