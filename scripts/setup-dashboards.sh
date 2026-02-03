#!/bin/bash
set -e

# setup-dashboards.sh
#
# This script sets up the Google Cloud Monitoring Dashboard for the Traitors API.
# It is designed to be idempotent and suitable for CI/CD execution.

PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo $GCP_PROJECT)

if [ -z "$PROJECT_ID" ]; then
  echo "Error: No Google Cloud project selected."
  echo "Set GCP_PROJECT environment variable or run 'gcloud config set project <PROJECT_ID>'."
  exit 1
fi

echo "Setting up dashboards for project: $PROJECT_ID"

DASHBOARD_DISPLAY_NAME="Traitors API Health"
DASHBOARD_FILE=$(mktemp)

# Construct Dashboard JSON
cat <<EOF > "$DASHBOARD_FILE"
{
  "displayName": "$DASHBOARD_DISPLAY_NAME",
  "gridLayout": {
    "columns": "2",
    "widgets": [
      {
        "title": "Function Invocations",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_function\" metric.type=\"cloudfunctions.googleapis.com/function/execution_count\"",
                  "aggregation": {
                    "perSeriesAligner": "ALIGN_RATE"
                  }
                }
              },
              "plotType": "LINE"
            }
          ],
          "timeshiftDuration": "0s",
          "yAxis": {
            "label": "y1Axis",
            "scale": "LINEAR"
          }
        }
      },
      {
        "title": "Execution Time (95th Percentile)",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_function\" metric.type=\"cloudfunctions.googleapis.com/function/execution_times\"",
                  "aggregation": {
                    "perSeriesAligner": "ALIGN_PERCENTILE_95"
                  }
                }
              },
              "plotType": "LINE"
            }
          ],
          "timeshiftDuration": "0s",
          "yAxis": {
            "label": "y1Axis",
            "scale": "LINEAR"
          }
        }
      },
      {
        "title": "Data Quality Warnings",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_function\" AND severity=\"WARNING\"",
                  "aggregation": {
                    "perSeriesAligner": "ALIGN_COUNT"
                  }
                }
              },
              "plotType": "STACKED_BAR"
            }
          ],
          "timeshiftDuration": "0s",
          "yAxis": {
            "label": "y1Axis",
            "scale": "LINEAR"
          }
        }
      },
      {
        "title": "Ingestion Errors",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_function\" AND severity>=\"ERROR\"",
                  "aggregation": {
                    "perSeriesAligner": "ALIGN_COUNT"
                  }
                }
              },
              "plotType": "STACKED_BAR"
            }
          ],
          "timeshiftDuration": "0s",
          "yAxis": {
            "label": "y1Axis",
            "scale": "LINEAR"
          }
        }
      }
    ]
  }
}
EOF

# Note: gcloud monitoring dashboards create does not support idempotent "create or update" by name easily.
# It usually creates a new one with a random ID if just passed a file.
# To make it idempotent, we should list and update if exists, or create.
# However, `gcloud monitoring dashboards list` output parsing is complex without jq.
# Since dashboards are config, replacing it (delete then create, or update known ID) is standard.
# But we don't have a stable ID.
# Strategy: Attempt to find dashboard by Display Name (this is tricky as API doesn't filter by display name easily).
# For simplicity in this shell script without jq, we will just CREATE it.
# Warning: This might create duplicates if run repeatedly.
# Better approach for CI: Use Terraform or Deployment Manager.
# Given the constraints (bash script), we will try to list and filter with grep.

# List dashboards, grep for display name. If found, we might skip or warn.
# Since we can't easily extract the ID to update without jq, we'll implement a "Check if exists" logic.

if gcloud monitoring dashboards list --format="value(displayName)" | grep -q "^$DASHBOARD_DISPLAY_NAME$"; then
  echo "Dashboard '$DASHBOARD_DISPLAY_NAME' already exists."
  echo "Skipping creation to avoid duplicates. (To update, delete manually or use Terraform)."
else
  echo "Creating Dashboard..."
  gcloud monitoring dashboards create --config-from-file="$DASHBOARD_FILE"
fi

rm "$DASHBOARD_FILE"
echo "Dashboard setup completed."
