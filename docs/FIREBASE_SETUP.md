# Firebase Setup Guide

This guide walks through setting up Firebase deployment credentials and infrastructure for the Traitors Data project.

## Prerequisites

1. **Google Cloud SDK** installed and configured
   ```bash
   gcloud --version
   ```

2. **Firebase CLI** installed
   ```bash
   npm install -g firebase-tools
   firebase --version
   ```

3. **Firebase Project** created at [Firebase Console](https://console.firebase.google.com/)

## Step 1: Create Service Account Credentials

The project includes a script to create a service account with minimum required permissions:

```bash
./scripts/setup-firebase-credentials.sh YOUR_PROJECT_ID
```

This creates a service account with the following roles:

| Role | Purpose |
|------|---------|
| `roles/firebasehosting.admin` | Deploy to Firebase Hosting |
| `roles/cloudfunctions.developer` | Deploy Cloud Functions |
| `roles/iam.serviceAccountUser` | Required for function deployment |
| `roles/cloudbuild.builds.editor` | Build functions during deployment |
| `roles/storage.objectAdmin` | Upload hosting files to Cloud Storage |
| `roles/run.invoker` | Invoke Cloud Functions Gen 2 |

### Manual Setup (Alternative)

If you prefer manual setup:

```bash
PROJECT_ID="your-firebase-project-id"
SERVICE_ACCOUNT_NAME="firebase-deploy"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Create service account
gcloud iam service-accounts create ${SERVICE_ACCOUNT_NAME} \
  --display-name="Firebase Deployment Service Account" \
  --project=${PROJECT_ID}

# Grant roles (see script for full list)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/firebasehosting.admin"

# Create key
gcloud iam service-accounts keys create firebase-deploy-key.json \
  --iam-account=${SERVICE_ACCOUNT_EMAIL} \
  --project=${PROJECT_ID}
```

## Step 2: Secure the Credentials

**CRITICAL**: Never commit service account keys to version control.

```bash
# Verify .gitignore includes credentials (already configured in project)
grep firebase-deploy-key.json .gitignore
```

## Step 3: Configure Local Environment

Set the environment variable for local development:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/firebase-deploy-key.json"
```

Add to your shell profile for persistence:

```bash
echo 'export GOOGLE_APPLICATION_CREDENTIALS="/path/to/traitors-data-ingest-1/firebase-deploy-key.json"' >> ~/.zshrc
```

## Step 4: Initialize Firebase

```bash
# Authenticate with Firebase CLI
firebase login

# Initialize Firebase in the project
firebase init

# Select:
# - Hosting
# - Functions (TypeScript)
# - Emulators (Hosting, Functions)
```

## Step 5: Configure for GitHub Actions

For CI/CD deployment, add the service account key as a GitHub secret:

1. Copy the entire content of `firebase-deploy-key.json`
   ```bash
   cat firebase-deploy-key.json | pbcopy  # macOS
   ```

2. Go to GitHub repository → Settings → Secrets and variables → Actions

3. Create new secret:
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: (paste the JSON content)

4. Use in workflow:
   ```yaml
   - name: Deploy to Firebase
     env:
       GOOGLE_APPLICATION_CREDENTIALS: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
     run: |
       echo "$GOOGLE_APPLICATION_CREDENTIALS" > firebase-key.json
       export GOOGLE_APPLICATION_CREDENTIALS=firebase-key.json
       firebase deploy
   ```

## Security Best Practices

### Principle of Least Privilege

The service account has been configured with minimal permissions required for deployment. If additional permissions are needed, add them explicitly:

```bash
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/SPECIFIC_ROLE"
```

### Key Rotation

Rotate service account keys periodically (recommended: every 90 days):

```bash
# List existing keys
gcloud iam service-accounts keys list \
  --iam-account=${SERVICE_ACCOUNT_EMAIL}

# Delete old key
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=${SERVICE_ACCOUNT_EMAIL}

# Create new key
gcloud iam service-accounts keys create firebase-deploy-key.json \
  --iam-account=${SERVICE_ACCOUNT_EMAIL}
```

### Audit Logging

Monitor service account usage:

```bash
# View service account activity
gcloud logging read "protoPayload.authenticationInfo.principalEmail=${SERVICE_ACCOUNT_EMAIL}" \
  --limit 50 \
  --format json
```

## Troubleshooting

### Permission Denied Errors

If deployment fails with permission errors:

1. Verify the service account has all required roles:
   ```bash
   gcloud projects get-iam-policy ${PROJECT_ID} \
     --flatten="bindings[].members" \
     --filter="bindings.members:serviceAccount:${SERVICE_ACCOUNT_EMAIL}"
   ```

2. Check if APIs are enabled:
   ```bash
   gcloud services list --enabled --project=${PROJECT_ID}
   ```

3. Enable required APIs:
   ```bash
   gcloud services enable cloudfunctions.googleapis.com \
     cloudbuild.googleapis.com \
     firebasehosting.googleapis.com \
     --project=${PROJECT_ID}
   ```

### Key File Not Found

Ensure the environment variable points to the correct path:

```bash
echo $GOOGLE_APPLICATION_CREDENTIALS
ls -la $GOOGLE_APPLICATION_CREDENTIALS
```

## Next Steps

After credentials are configured:

1. ✅ [Set up Firebase Emulator Suite](../TASKS.md#phase-0-local-testing-infrastructure-do-this-first)
2. ✅ Test local deployment with emulators
3. ✅ Deploy to production

## References

- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [Google Cloud IAM Roles](https://cloud.google.com/iam/docs/understanding-roles)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)
