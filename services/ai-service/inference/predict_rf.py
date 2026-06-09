import joblib

model = joblib.load(
    "../models/random_forest/model.pkl"
)

vectorizer = joblib.load(
    "../models/random_forest/vectorizer.pkl"
)

sample = """
CEFR Level: B1

Answer:
Ich habe gestern meine Freunde besucht und wir haben zusammen Fußball gespielt.
"""

x = vectorizer.transform([sample])

score = model.predict(x)

print("Predicted Score:", score[0])