# 🚨 SECURITY NOTICE

## Service Account Key Removed

The Google Cloud service account key has been removed from this repository for security reasons.

### To restore Google Cloud Vision functionality:

1. **Create a new service account key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to IAM & Admin > Service Accounts
   - Create or select your service account
   - Generate a new JSON key file

2. **Secure the key file:**
   ```bash
   # Place the key file outside your project directory
   mkdir ~/.config/gcloud
   mv your-service-account-key.json ~/.config/gcloud/
   ```

3. **Update environment variables:**
   ```bash
   # In your .env.local file
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   ```

4. **Alternative: Use environment-based authentication:**
   ```bash
   # Install Google Cloud CLI and authenticate
   gcloud auth application-default login
   ```

## ⚠️ NEVER commit service account keys to version control!

The `.gitignore` file has been updated to prevent this in the future.