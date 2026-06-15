"""
Convert a CSV (from Kaggle or elsewhere) to a simplified diseases JSON file suitable
for `data/diseases.json` merging.

Usage:
  python scripts/csv_to_json.py --input data/file.csv --output data/diseases_from_kaggle.json

The script will try to map common column names: disease|diagnosis|name, symptoms|symptom,
age|age_range, gender.
"""
import argparse
import csv
import json
import os

COMMON_NAME = ['disease', 'diagnosis', 'name', 'condition']
COMMON_SYMPTOMS = ['symptoms', 'symptom', 'clinical_features']
COMMON_AGE = ['age', 'age_range', 'ageRange']
COMMON_GENDER = ['gender', 'sex']


def find_column(fieldnames, candidates):
    for c in candidates:
        for f in fieldnames:
            if f.lower() == c.lower():
                return f
    return None


def split_symptoms(value):
    if not value:
        return []
    for sep in [';', '|', ',', '\\n']:
        if sep in value:
            parts = [p.strip().lower() for p in value.split(sep) if p.strip()]
            return parts
    return [value.strip().lower()]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', default='data/diseases_from_kaggle.json')
    args = parser.parse_args()

    if not os.path.exists(args.input):
        raise SystemExit('Input CSV not found: ' + args.input)

    with open(args.input, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []

        name_col = find_column(fieldnames, COMMON_NAME)
        sympt_col = find_column(fieldnames, COMMON_SYMPTOMS)
        age_col = find_column(fieldnames, COMMON_AGE)
        gender_col = find_column(fieldnames, COMMON_GENDER)

        out = []
        for row in reader:
            name = row.get(name_col) if name_col else next((row.get(fn) for fn in fieldnames if row.get(fn)), None)
            name = (name or 'Unknown').strip()
            sympt_text = row.get(sympt_col, '') if sympt_col else ''
            keywords = split_symptoms(sympt_text)
            ageRange = row.get(age_col, 'all') if age_col else 'all'
            gender = row.get(gender_col, 'all') if gender_col else 'all'

            item = {
                'name': name,
                'category': 'Imported',
                'description': row.get('description') or row.get('desc') or '',
                'keywords': keywords,
                'ageRange': ageRange,
                'gender': gender
            }
            out.append(item)

    with open(args.output, 'w', encoding='utf-8') as fw:
        json.dump(out, fw, ensure_ascii=False, indent=2)

    print(f'Wrote {len(out)} records to {args.output}')


if __name__ == '__main__':
    main()
