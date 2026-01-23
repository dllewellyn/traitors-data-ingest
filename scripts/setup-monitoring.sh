#!/bin/bash
set -e

# setup-monitoring.sh
#
# This script sets up Google Cloud Monitoring Alert Policies for the Cloud Functions.
# It requires the `gcloud` CLI to be installed and authenticated with a project selected.
#
# Usage: ./scripts/setup-monitoring.sh [NOTIFICATION_CHANNEL_ID]

PROJECT_ID=$(gcloud config get-value project)
NOTIFICATION_CHANNEL_ID=$1

if [ -z "$PROJECT_ID" ]; then
  echo "Error: No Google Cloud project selected."
  echo "Run 'gcloud config set project <PROJECT_ID>' first."
  exit 1
fi

echo "Setting up monitoring for project: $PROJECT_ID"

# Define the policy structure in a temporary file
POLICY_FILE=$(mktemp)

# Start JSON construction
cat <<EOF > "$POLICY_FILE"
{
  "displayName": "Cloud Functions Errors",
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
  # We need to append the notification channels to the JSON
  # Using jq would be cleaner, but we avoid dependencies.
  # We'll just edit the file end or use strict formatting.

  # Remove the last closing brace and append channels
  # (Simplistic approach assuming the format above)

  # Actually, let's just rewrite the whole file with the channel included if present
  cat <<EOF > "$POLICY_FILE"
{
  "displayName": "Cloud Functions Errors",
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
  # Close the JSON object
  echo "}" >> "$POLICY_FILE"
fi

echo "Creating Alert Policy from definition..."
cat "$POLICY_FILE"

# Execute the command
gcloud alpha monitoring policies create --policy-from-file="$POLICY_FILE"

# Cleanup
rm "$POLICY_FILE"

echo "Alert Policy setup initiated."
