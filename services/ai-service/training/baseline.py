import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

import numpy as np

# Load Dataset
df = pd.read_csv(
    "../data/processed/merlin_scoring_dataset_v2.csv"
)

# Split
train_df, test_df = train_test_split(
    df,
    test_size=0.2,
    random_state=42
)

# Vectorize
vectorizer = TfidfVectorizer(
    max_features=5000
)

X_train = vectorizer.fit_transform(
    train_df["model_input"]
)

X_test = vectorizer.transform(
    test_df["model_input"]
)

# Labels
y_train = train_df["score"]
y_test = test_df["score"]

# Model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

# Predict
predictions = model.predict(X_test)

# Metrics
mae = mean_absolute_error(
    y_test,
    predictions
)

mse = mean_squared_error(
    y_test,
    predictions
)

rmse = np.sqrt(mse)

r2 = r2_score(
    y_test,
    predictions
)

print("MAE:", mae)
print("RMSE:", rmse)
print("R²:", r2)