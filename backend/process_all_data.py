import pandas as pd
import os

print("starting data merge script...")

try:
    
    train = pd.read_csv('../data/train.csv')
    severity= pd.read_csv('../data/severity_type.csv')
    events = pd.read_csv('../data/event_type.csv')
    resources = pd.read_csv('../data/resource_type.csv')
    logs = pd.read_csv('../data/log_feature.csv')

    # errors='coerce' turns anything that isn't a valid number into NaN
    # instead of crashing the whole script. dropna() then removes those
    # bad rows so one messed-up entry doesn't take down the whole merge.
    train['location'] = pd.to_numeric(
        train['location'].str.extract(r'(\d+)')[0], errors='coerce'
    )
    train = train.dropna(subset=['location'])
    train['location'] = train['location'].astype(int)

    severity['severity_type'] = pd.to_numeric(
        severity['severity_type'].str.extract(r'(\d+)')[0], errors='coerce'
    )
    severity = severity.dropna(subset=['severity_type'])
    severity['severity_type'] = severity['severity_type'].astype(int)

    merged_df = pd.merge(train, severity, on='id', how='left')


    event_counts = events.groupby('id').size().reset_index(name='num_events')
    merged_df = pd.merge(merged_df, event_counts, on='id', how='left')


    resource_counts = resources.groupby('id').size().reset_index(name='num_resources')
    merged_df= pd.merge(merged_df, resource_counts, on='id', how='left')


    log_volume = logs.groupby('id')['volume'].sum().reset_index(name='total_log_volume')
    merged_df = pd.merge(merged_df, log_volume, on='id', how='left')



    
    merged_df = merged_df.fillna(0)

    
    for col in merged_df.columns:
        merged_df[col] = merged_df[col].astype(int)

    output_path = '../data/master_train.csv'
    merged_df.to_csv(output_path, index=False)

    print("merge complete. saved to", output_path)
    print("cols:", list(merged_df.columns))
    print("total rows ->", len(merged_df))

except FileNotFoundError as e:
    print("file not found err:", e)
