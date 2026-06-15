"""
Merge an imported diseases JSON into the main `data/diseases.json`.

Usage:
  python scripts/merge_diseases.py --source data/diseases_from_kaggle.json --target data/diseases.json

The script creates a timestamped backup of the target file and writes the merged
result back to the target path.

Merging rules (simple heuristics):
- Match existing records by normalized `name` (lowercase, stripped).
- Merge `keywords` as a unique union.
- Prefer the longer `description` if one exists; otherwise keep existing.
- Keep existing `category` unless target has 'Imported'.
- For `ageRange` and `gender`, prefer non-'all' values.
"""
import argparse
import json
import os
import shutil
import datetime


def normalize_name(name):
    return (name or '').strip().lower()


def ensure_list(x):
    if x is None:
        return []
    if isinstance(x, list):
        return [str(i).strip().lower() for i in x if i is not None]
    return [str(x).strip().lower()]


def merge_records(target, source):
    merged = dict(target)

    # Merge keywords
    tkw = set(ensure_list(target.get('keywords')))
    skw = set(ensure_list(source.get('keywords')))
    merged['keywords'] = sorted(list(tkw.union(skw)))

    # Description: prefer longer
    td = (target.get('description') or '').strip()
    sd = (source.get('description') or '').strip()
    merged['description'] = td if len(td) >= len(sd) else sd

    # Category: keep target unless target is 'Imported' or empty
    tc = (target.get('category') or '').strip()
    sc = (source.get('category') or '').strip()
    if not tc or tc.lower() == 'imported':
        merged['category'] = sc or tc
    else:
        merged['category'] = tc

    # ageRange and gender: prefer non-'all' values
    for key in ('ageRange', 'age_range', 'ageRange'):
        # normalize to 'ageRange'
        pass

    # use explicit keys
    ta = target.get('ageRange', target.get('age_range', 'all'))
    sa = source.get('ageRange', source.get('age_range', 'all'))
    merged['ageRange'] = ta if (ta and str(ta).lower() != 'all') else (sa or 'all')

    tg = target.get('gender', 'all')
    sg = source.get('gender', 'all')
    merged['gender'] = tg if (tg and str(tg).lower() != 'all') else (sg or 'all')

    # keep name and other fields from target unless missing
    merged['name'] = target.get('name') or source.get('name')

    return merged


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', required=True, help='Imported JSON file to merge (list of records)')
    parser.add_argument('--target', default='data/diseases.json', help='Target diseases JSON to merge into')
    parser.add_argument('--out', help='Optional output path (if not provided will overwrite target)')
    args = parser.parse_args()

    if not os.path.exists(args.source):
        raise SystemExit(f'Source file not found: {args.source}')
    if not os.path.exists(args.target):
        raise SystemExit(f'Target file not found: {args.target}')

    with open(args.target, 'r', encoding='utf-8') as f:
        target_list = json.load(f)
    with open(args.source, 'r', encoding='utf-8') as f:
        source_list = json.load(f)

    # Index target by normalized name
    index = {normalize_name(item.get('name')): item for item in target_list}
    added = 0
    merged_count = 0

    for src in source_list:
        key = normalize_name(src.get('name'))
        if not key:
            continue
        if key in index:
            index[key] = merge_records(index[key], src)
            merged_count += 1
        else:
            index[key] = src
            added += 1

    merged_list = list(index.values())

    # Backup target
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    backup_path = args.target + f'.bak.{timestamp}'
    shutil.copyfile(args.target, backup_path)

    out_path = args.out or args.target
    with open(out_path, 'w', encoding='utf-8') as fw:
        json.dump(merged_list, fw, ensure_ascii=False, indent=2)

    print(f'Backup created: {backup_path}')
    print(f'Wrote merged file: {out_path} (added {added}, merged {merged_count}, total {len(merged_list)})')


if __name__ == '__main__':
    main()
