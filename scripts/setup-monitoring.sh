#!/bin/bash
set -e

# setup-monitoring.sh
#
# This script sets up Google Cloud Monitoring Alert Policies for the Cloud Functions.
# It is designed to be idempotent and suitable for CI/CD execution.
#
# Usage: ./scripts/setup-monitoring.sh [NOTIFICATION_CHANNEL_ID]

PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo $GCP_PROJECT)
NOTIFICATION_CHANNEL_ID=$1

if [ -z "$PROJECT_ID" ]; then
  echo "Error: No Google Cloud project selected."
  echo "Set GCP_PROJECT environment variable or run 'gcloud config set project <PROJECT_ID>'."
  exit 1
fi

echo "Setting up monitoring for project: $PROJECT_ID"

POLICY_DISPLAY_NAME="Cloud Functions Errors"

# Check if policy already exists
EXISTING_POLICY=$(gcloud alpha monitoring policies list --format="value(name)" --filter="displayName=\"$POLICY_DISPLAY_NAME\"" --limit=1)

# Define the policy structure in a temporary file
POLICY_FILE=$(mktemp)

# Construct JSON content
cat <<EOF > "$POLICY_FILE"
{
  "displayName": "$POLICY_DISPLAY_NAME",
  "documentation": {
    "content": "Alerts when a Cloud Function logs an error.",
    "mimeType": "text/markdown"
  },
  "combiner": "OR",
  "conditions": [
    {
      "displayName": "Function Error Logged",
      "conditionMatchedLog": {
        "filter": "resource.type=\"cloud_function\" AND severity>=\"ERROR\""
      }
    }
  ]
EOF

# Add notification channels if provided
if [ -n "$NOTIFICATION_CHANNEL_ID" ]; then
  # Rewrite file to include notification channels
  cat <<EOF > "$POLICY_FILE"
{
  "displayName": "$POLICY_DISPLAY_NAME",
  "documentation": {
    "content": "Alerts when a Cloud Function logs an error.",
    "mimeType": "text/markdown"
  },
  "combiner": "OR",
  "conditions": [
    {
      "displayName": "Function Error Logged",
      "conditionMatchedLog": {
        "filter": "resource.type=\"cloud_function\" AND severity>=\"ERROR\""
      }
    }
  ],
  "notificationChannels": [
    "$NOTIFICATION_CHANNEL_ID"
  ]
}
EOF
else
  # Close the JSON object if no channel
  echo "}" >> "$POLICY_FILE"
fi

if [ -n "$EXISTING_POLICY" ]; then
  echo "Updating existing Alert Policy: $EXISTING_POLICY..."
  gcloud alpha monitoring policies update "$EXISTING_POLICY" --policy-from-file="$POLICY_FILE"
else
  echo "Creating new Alert Policy..."
  gcloud alpha monitoring policies create --policy-from-file="$POLICY_FILE"
fi

# Cleanup
rm "$POLICY_FILE"

echo "Alert Policy setup completed."
