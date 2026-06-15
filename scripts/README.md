Kaggle import helper scripts

Files:
- `kaggle_download.py`: Python script that uses the Kaggle API to download and unzip a dataset to `data/`.
- `csv_to_json.py`: Python script that converts a CSV into simplified JSON records compatible with `data/diseases.json`.

Quick setup:
1. Install Python packages (if not already):

```powershell
pip install kaggle
```

2. Create your Kaggle API token:
   - Go to https://www.kaggle.com → Account → Create New API Token
   - Save the downloaded `kaggle.json` into `%USERPROFILE%\.kaggle\kaggle.json`

3. Download a dataset:

```powershell
python scripts/kaggle_download.py --dataset owner/dataset-name --out data
```

4. Convert a CSV to JSON for import (adjust columns as needed):

```powershell
python scripts/csv_to_json.py --input data/yourfile.csv --output data/diseases_from_kaggle.json
```

5. Merge the resulting `data/diseases_from_kaggle.json` into `data/diseases.json` (manual or with script).

Notes:
- The CSV-to-JSON converter is simple and may need column mapping adjustments depending on dataset structure.
- If you prefer a Node.js importer, I can add one — tell me which datasets you'll use and I will adapt parsing rules.

Merge imported JSON
-------------------

After converting a CSV to `data/diseases_from_kaggle.json`, you can merge it into the main
`data/diseases.json` using the merge helper:

```powershell
python scripts/merge_diseases.py --source data/diseases_from_kaggle.json --target data/diseases.json
```

This creates a timestamped backup of `data/diseases.json` and writes the merged result back
to the target file. The merge uses simple heuristics for deduplication and keyword merging.
