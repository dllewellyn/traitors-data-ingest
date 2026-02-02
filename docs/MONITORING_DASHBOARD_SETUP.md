# Monitoring Dashboard Setup

This document outlines the steps to set up Google Cloud Monitoring dashboards for the Traitors application.

## 1. Create Log-based Metrics

We use Log-based metrics to extract useful counters from structured logs.

### A. API Request Count (`api/request_count`)

1.  Go to **Logging** > **Log-based Metrics** in the Google Cloud Console.
2.  Click **Create Metric**.
3.  **Metric Type**: Counter.
4.  **Log Metric Name**: `api/request_count`.
5.  **Filter Selection**:
    ```text
    resource.type="cloud_function"
    jsonPayload.message="Request processed"
    ```
6.  **Labels** (Optional but recommended):
    *   `method`: `jsonPayload.method`
    *   `status`: `jsonPayload.status`
7.  Click **Create Metric**.

### B. API Error Rate (`api/error_rate`)

1.  Click **Create Metric**.
2.  **Metric Type**: Counter.
3.  **Log Metric Name**: `api/error_rate`.
4.  **Filter Selection**:
    ```text
    resource.type="cloud_function"
    severity="ERROR"
    ```
5.  Click **Create Metric**.

### C. Ingestion Run Count (`ingestion/run_count`)

1.  Click **Create Metric**.
2.  **Metric Type**: Counter.
3.  **Log Metric Name**: `ingestion/run_count`.
4.  **Filter Selection**:
    ```text
    resource.type="cloud_function"
    jsonPayload.message="Ingestion completed successfully"
    ```
    *Alternatively, to count attempts (including failures), use `jsonPayload.message="Ingestion triggered manually"`.*
5.  Click **Create Metric**.

## 2. Dashboard Configuration

Once metrics are created, set up a dashboard to visualize them.

1.  Go to **Monitoring** > **Dashboards**.
2.  Click **Create Dashboard**.
3.  Name the dashboard: `Traitors API & Ingestion`.

### Widget 1: API Request Traffic

1.  Click **Add Widget** > **Line Chart**.
2.  **Metric**: Select `logging/user/api/request_count`.
3.  **Aggregator**: Sum.
4.  **Title**: "API Requests per Minute".
5.  Save.

### Widget 2: API Errors

1.  Click **Add Widget** > **Line Chart**.
2.  **Metric**: Select `logging/user/api/error_rate`.
3.  **Aggregator**: Sum.
4.  **Title**: "API Errors".
5.  Save.

### Widget 3: Ingestion Success (Scorecard)

1.  Click **Add Widget** > **Scorecard**.
2.  **Metric**: Select `logging/user/ingestion/run_count`.
3.  **Time Range**: Last 7 Days (or as desired).
4.  **Title**: "Ingestion Runs (Last 7 Days)".
5.  Save.

## 3. Alerts (Optional)

You can also set up alerting policies based on `api/error_rate` exceeding a threshold (e.g., > 1 error per minute).
