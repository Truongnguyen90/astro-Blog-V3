# How to Find Your Supabase Anon Key

## STEP-BY-STEP GUIDE

### Step 1: Open Settings
Go to: https://embujgkwtuazdcmodqst.supabase.co/project/_/settings/api

### Step 2: What You Should See

You should see a page titled **"API Settings"** with these sections:

```
API Settings
├── Configuration
│   ├── Project URL
│   └── Project API keys  ← LOOK HERE!
│       ├── anon public   ← THIS IS WHAT WE NEED!
│       └── service_role
├── JWT Settings
└── Connection String     ← NOT THIS! (This is what you found)
```

### Step 3: Find "Project API keys" Section

Look for a section that says **"Project API keys"**

It will have TWO keys displayed:

1. **anon** (or "anon public")
   - Label: "anon" or "public"
   - Starts with: `eyJhbG...`
   - Length: ~200+ characters
   - **← THIS IS THE ONE WE NEED!**

2. **service_role**
   - Label: "service_role"
   - Starts with: `eyJhbG...`
   - Length: ~200+ characters
   - **← NOT this one!**

### Step 4: Copy the Anon Key

Click the copy button next to the **"anon"** or **"anon public"** key.

It should look something like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtYnVqZ2t3dHVhemRjbW9kcXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTU3NjAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### What You Found (NOT the anon key):

❌ `postgresql://postgres:...` - This is DATABASE connection string
❌ `sb_publishable_...` - This is NOT a Supabase anon key
❌ `sb_secret_...` - This is NOT a Supabase key

✅ What we need starts with: `eyJ...`

### Still Can't Find It?

Try going to the project home and looking for "Connect" or "API" section:
https://embujgkwtuazdcmodqst.supabase.co
