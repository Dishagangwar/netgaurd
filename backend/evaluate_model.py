import joblib
import pandas as pd
import os
import glob
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split

def evaluate_latest_model():
    print("--- NETGUARD AI: MODEL EVALUATION ---")
    
    # 1. Automatically find the latest .pkl file
    model_files = glob.glob("xgboost_netguard_v2_*.pkl")
    if not model_files:
        print("[ERROR] No model (.pkl) files found in the current directory.")
        return
    
    latest_model = max(model_files, key=os.path.getctime)
    print(f"[INFO] Evaluating latest model: {latest_model}")
    model = joblib.load(latest_model)
    
    # 2. Load the dataset
    csv_path = '../data/master_train.csv'
    if not os.path.exists(csv_path):
        print(f"[ERROR] Data file not found at {csv_path}")
        return

    df = pd.read_csv(csv_path)
    feature_cols = ['location', 'severity_type', 'num_events', 'num_resources', 'total_log_volume']
    
    X = df[feature_cols]
    y = df['fault_severity']

    # 3. Create the test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 4. Predict
    y_pred = model.predict(X_test)
    
    # 5. Metrics
    accuracy = accuracy_score(y_test, y_pred)
    conf_matrix = confusion_matrix(y_test, y_pred)
    class_report = classification_report(y_test, y_pred, zero_division=0)

    print(f"\nModel Accuracy on Test Split: {accuracy * 100:.2f}%\n")
    print("Detailed Classification Report:")
    print(class_report)
    
    # 6. Plot Confusion Matrix
    plt.figure(figsize=(6, 5))
    sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues', cbar=False)
    plt.title(f'XGBoost Confusion Matrix (Acc: {accuracy*100:.2f}%)')
    plt.xlabel('Predicted Severity')
    plt.ylabel('Actual Severity')
    plt.tight_layout()
    
    plot_name = 'confusion_matrix_plot.png'
    plt.savefig(plot_name)
    print(f"\n[INFO] Saved confusion matrix visualization as '{plot_name}'")

if __name__ == '__main__':
    evaluate_latest_model()
    