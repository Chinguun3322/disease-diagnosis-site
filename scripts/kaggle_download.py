"""
Simple Kaggle dataset downloader.
Usage:
  pip install kaggle
  place your kaggle.json in %USERPROFILE%/.kaggle/kaggle.json

  python scripts/kaggle_download.py --dataset username/dataset-name --out data

This will download and unzip the dataset into the `data/` folder.
"""
import argparse
import os
from kaggle.api.kaggle_api_extended import KaggleApi


def main():
    parser = argparse.ArgumentParser(description='Download Kaggle dataset and unzip')
    parser.add_argument('--dataset', required=True, help='Kaggle dataset identifier (owner/dataset-name)')
    parser.add_argument('--out', default='data', help='Output folder')
    args = parser.parse_args()

    out_dir = os.path.abspath(args.out)
    os.makedirs(out_dir, exist_ok=True)

    api = KaggleApi()
    api.authenticate()

    print(f'Downloading dataset {args.dataset} into {out_dir}...')
    api.dataset_download_files(args.dataset, path=out_dir, unzip=True, quiet=False)
    print('Done.')


if __name__ == '__main__':
    main()
