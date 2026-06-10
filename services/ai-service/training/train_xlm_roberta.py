import pandas as pd

# Load dataset
df = pd.read_csv(
    "../data/processed/merlin_scoring_dataset_v2.csv"
)

print("Dataset Shape:", df.shape)

print("\nColumns:")
print(df.columns)

print("\nSample:")
print(df[["model_input", "score"]].head(3))

# Create Train/Test Split

from sklearn.model_selection import train_test_split

train_df, test_df = train_test_split(
    df,
    test_size=0.2,
    random_state=42
)

print("\nTraining:", len(train_df))
print("Testing:", len(test_df))

# Convert To Hugging Face Dataset

from datasets import Dataset

train_dataset = Dataset.from_pandas(
    train_df[["model_input", "score"]]
)

test_dataset = Dataset.from_pandas(
    test_df[["model_input", "score"]]
)

print(train_dataset)

# Load XLM-RoBERTa Tokenizer

from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained(
    "xlm-roberta-base"
)

print("Tokenizer loaded.")

# Tokenization Function

def tokenize_function(examples):
    return tokenizer(
        examples["model_input"],
        truncation=True,
        padding="max_length",
        max_length=512
    )

# Rename label column to "labels" for Hugging Face compatibility

train_dataset = train_dataset.rename_column(
    "score",
    "labels"
)

test_dataset = test_dataset.rename_column(
    "score",
    "labels"
)

print(train_dataset[0])

# Tokenize Datasets

tokenized_train = train_dataset.map(
    tokenize_function,
    batched=True
)

tokenized_test = test_dataset.map(
    tokenize_function,
    batched=True
)

print(tokenized_train)

# Load XLM-RoBERTa Model for Regression

from transformers import AutoModelForSequenceClassification

model = AutoModelForSequenceClassification.from_pretrained(
    "xlm-roberta-base",
    num_labels=1
)

print("Model loaded.")

# Define Training Arguments

from transformers import TrainingArguments

training_args = TrainingArguments(
    output_dir="../results/xlm_roberta",

    num_train_epochs=3,

    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,

    eval_strategy="epoch",

    save_strategy="epoch",

    logging_steps=10,

    learning_rate=2e-5,

    weight_decay=0.01
)

print("Training arguments created.")

# Prepare dataset for Trainer

tokenized_train = tokenized_train.remove_columns(
    ["model_input", "__index_level_0__"]
)

tokenized_test = tokenized_test.remove_columns(
    ["model_input", "__index_level_0__"]
)

tokenized_train.set_format("torch")
tokenized_test.set_format("torch")

print(tokenized_train[0])

# Add Metrics Function

import numpy as np
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

def compute_metrics(eval_pred):

    predictions, labels = eval_pred

    predictions = predictions.squeeze()

    mae = mean_absolute_error(
        labels,
        predictions
    )

    rmse = np.sqrt(
        mean_squared_error(
            labels,
            predictions
        )
    )

    r2 = r2_score(
        labels,
        predictions
    )

    return {
        "mae": mae,
        "rmse": rmse,
        "r2": r2
    }