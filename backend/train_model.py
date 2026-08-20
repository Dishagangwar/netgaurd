import pandas as pd
from xgboost import XGBClassifier
import joblib
import time

print("starting model training on master dataset...")

# load data
df = pd.read_csv('../data/master_train.csv')

# print(df.head())
# print("shape:", df.shape)


X= df[['location', 'severity_type', 'num_events', 'num_resources', 'total_log_volume']]
y = df['fault_severity']

print("features ->", list(X.columns))

# model setup
model = XGBClassifier(
    n_estimators=100, 
    max_depth=6, 
    learning_rate=0.1, 
    random_state = 42
)

print("training xgb... wait")
model.fit(X, y)

timestamp = int(time.time())
model_filename= f"xgboost_netguard_v2_{timestamp}.pkl"
joblib.dump(model, model_filename)

print("done. saved as:", model_filename)