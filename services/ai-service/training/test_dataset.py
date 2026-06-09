import pandas as pd

df = pd.read_csv("../data/processed/merlin_scoring_dataset_v2.csv")

print(df.shape)
print(df.head())