# Monitoring and Dashboard Setup

This guide outlines how to create log-based metrics and a monitoring dashboard for the Traitors API in the Google Cloud Console.

## 1. Create Log-Based Metrics

Navigate to **Logs Explorer** in the Google Cloud Console. For each metric below, use the "Create Metric" action.

### a. API Request Count
- **Metric Name**: `api_request_count`
- **Description**: The total number of requests to the API.
- **Filter**:
  ```
  resource.type="cloud_function"
  resource.labels.function_name="api"
  jsonPayload.message="Request processed"
  ```

### b. API Error Rate
- **Metric Name**: `api_error_count`
- **Description**: The number of API requests that resulted in a 5xx server error.
- **Filter**:
  ```
  resource.type="cloud_function"
  resource.labels.function_name="api"
  jsonPayload.message="Request processed"
  jsonPayload.status >= 500
  ```

### c. P95 Latency
- **Metric Type**: Distribution
- **Metric Name**: `api_latency`
- **Description**: The distribution of API request latencies.
- **Filter**:
  ```
  resource.type="cloud_function"
  resource.labels.function_name="api"
  jsonPayload.message="Request processed"
  ```
- **Field Name**: `jsonPayload.durationMs`

## 2. Create a Monitoring Dashboard

Navigate to **Dashboards** under Cloud Monitoring and create a new dashboard.

### a. API Request Rate Chart
- **Title**: API Request Rate
- **Chart Type**: Line
- **Metric**: `logging/user/api_request_count`
- **Aggregation**: `sum`

### b. Server Error Rate Chart
- **Title**: Server Error Rate (5xx)
- **Chart Type**: Line
- **Metric**: `logging/user/api_error_count`
- **Aggregation**: `sum`

### c. P95 Latency Chart
- **Title**: 95th Percentile Latency
- **Chart Type**: Line
- **Metric**: `logging/user/api_latency`
- **Aggregation**: `95th percentile`
