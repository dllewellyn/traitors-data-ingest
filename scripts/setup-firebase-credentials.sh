#!/bin/bash
set -e

# Firebase Deployment Service Account Setup
# This script creates a service account with minimum required permissions
# for Firebase Hosting and Cloud Functions deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if project ID is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Project ID is required${NC}"
  echo "Usage: ./setup-firebase-credentials.sh YOUR_PROJECT_ID"
  echo ""
  echo "To find your Firebase project ID:"
  echo "  1. Go to Firebase Console: https://console.firebase.google.com/"
  echo "  2. Select your project"
  echo "  3. Project ID is shown in project settings"
  exit 1
fi

PROJECT_ID="$1"
SERVICE_ACCOUNT_NAME="firebase-deploy"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
KEY_FILE="firebase-deploy-key.json"

echo -e "${GREEN}🔧 Setting up Firebase deployment credentials...${NC}"
echo "Project ID: ${PROJECT_ID}"
echo "Service Account: ${SERVICE_ACCOUNT_EMAIL}"
echo ""

# Verify gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}❌ gcloud CLI not found. Please install it first.${NC}"
  echo "Visit: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Set the project
echo -e "${YELLOW}Setting project...${NC}"
gcloud config set project ${PROJECT_ID}

# Create the service account
echo -e "${YELLOW}Creating service account...${NC}"
gcloud iam service-accounts create ${SERVICE_ACCOUNT_NAME} \
  --display-name="Firebase Deployment Service Account" \
  --description="Service account for Firebase Hosting and Cloud Functions deployment" \
  --project=${PROJECT_ID} || echo "Service account may already exist"

# Grant minimum required permissions
echo -e "${YELLOW}Granting permissions...${NC}"

# Firebase Hosting Admin - for hosting deployments
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/firebasehosting.admin" \
  --condition=None

# Cloud Functions Developer - for function deployments
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/cloudfunctions.developer" \
  --condition=None

# Service Account User - required to deploy functions
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/iam.serviceAccountUser" \
  --condition=None

# Cloud Build Editor - for building functions
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/cloudbuild.builds.editor" \
  --condition=None

# Storage Object Admin - for hosting file uploads
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/storage.objectAdmin" \
  --condition=None

# Cloud Run Invoker - for Cloud Functions Gen 2
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/run.invoker" \
  --condition=None

# Create and download the key
echo -e "${YELLOW}Creating service account key...${NC}"
gcloud iam service-accounts keys create ${KEY_FILE} \
  --iam-account=${SERVICE_ACCOUNT_EMAIL} \
  --project=${PROJECT_ID}

echo ""
echo -e "${GREEN}✅ Service account created: ${SERVICE_ACCOUNT_EMAIL}${NC}"
echo -e "${GREEN}✅ Credentials saved to: ${KEY_FILE}${NC}"
echo ""
echo -e "${YELLOW}⚠️  SECURITY IMPORTANT:${NC}"
echo "  1. Add ${KEY_FILE} to .gitignore (preventing accidental commit)"
echo "  2. Keep this file secure and never commit to version control"
echo "  3. For GitHub Actions, add the key content as a repository secret:"
echo "     - Go to: Settings → Secrets and variables → Actions"
echo "     - Name: FIREBASE_SERVICE_ACCOUNT"
echo "     - Value: (paste entire content of ${KEY_FILE})"
echo ""
echo -e "${GREEN}📋 Roles granted:${NC}"
echo "  • Firebase Hosting Admin (hosting deployments)"
echo "  • Cloud Functions Developer (function deployments)"
echo "  • Service Account User (required for functions)"
echo "  • Cloud Build Editor (build functions)"
echo "  • Storage Object Admin (upload hosting files)"
echo "  • Cloud Run Invoker (Cloud Functions Gen 2)"
echo ""
echo -e "${GREEN}🚀 Next steps:${NC}"
echo "  1. Run: echo '${KEY_FILE}' >> .gitignore"
echo "  2. Set environment variable: export GOOGLE_APPLICATION_CREDENTIALS=\$(pwd)/${KEY_FILE}"
echo "  3. Authenticate Firebase CLI: firebase login:ci"
echo "  4. Initialize Firebase: firebase init"
