import pandas as pd
from xgboost import XGBClassifier
import joblib
import time

# YEH LINE MISSING THI TERE CODE MEIN 👇
from sklearn.utils.class_weight import compute_sample_weight 

print("starting model training on master dataset...")

# load data
df = pd.read_csv('../data/master_train.csv')

X = df[['location', 'severity_type', 'num_events', 'num_resources', 'total_log_volume']]
y = df['fault_severity']

print("features ->", list(X.columns))

# --- THE MAGIC FOR RECALL IMPROVEMENT ---
print("calculating balanced sample weights to fix class imbalance...")
sample_weights = compute_sample_weight(
    class_weight='balanced',
    y=y
)
# ----------------------------------------

# model setup
model = XGBClassifier(
    n_estimators=100, 
    max_depth=6, 
    learning_rate=0.1, 
    random_state=42
)

print("training xgb with class weights... wait")

# Pass the calculated weights into the fit function
model.fit(X, y, sample_weight=sample_weights) 

timestamp = int(time.time())
model_filename = f"xgboost_netguard_v2_{timestamp}.pkl"
joblib.dump(model, model_filename)

print("done. saved as:", model_filename)