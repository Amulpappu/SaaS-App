# ✅ Windows - Generate Secrets Without OpenSSL

Since `openssl` isn't installed on your Windows, here are 3 options:

---

## Option 1: Use Online Generator (EASIEST - No Installation)

### For SECRET_KEY (64 characters):

1. Go to: **https://www.browserling.com/tools/random-hex**
2. Enter: `32` in the "length" field
3. Click "Generate"
4. Copy the output
5. **This is your SECRET_KEY**

### For POSTGRES_PASSWORD (32 characters):

1. Go to same site: https://www.browserling.com/tools/random-hex
2. Enter: `16` in the "length" field
3. Click "Generate"
4. Copy the output
5. **This is your POSTGRES_PASSWORD**

**✅ DONE! Skip to Step 2**

---

## Option 2: Install OpenSSL (If You Want CLI)

### Using Chocolatey (Package Manager):

1. **Install Chocolatey** (if you don't have it):
   - Open PowerShell as Administrator
   - Paste this command:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   Invoke-WebRequest -Uri https://chocolatey.org/install.ps1 -UseBasicParsing | Invoke-Expression
   ```

2. **Install OpenSSL**:
   ```powershell
   choco install openssl
   ```

3. **Restart PowerShell** and try:
   ```powershell
   openssl rand -hex 32
   openssl rand -hex 16
   ```

---

## Option 3: Install Git Bash (Recommended)

Git comes with OpenSSL built-in!

### Steps:

1. Download Git: **https://git-scm.com/download/win**
2. Install (just keep clicking Next)
3. After install, right-click anywhere
4. Select **"Git Bash Here"**
5. Now run:
   ```bash
   openssl rand -hex 32
   openssl rand -hex 16
   ```

**This is the easiest for Windows users!**

---

## Option 4: Use Python (If You Have It Installed)

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
python -c "import secrets; print(secrets.token_hex(16))"
```

---

## Option 5: Use PowerShell Native (No Installation)

```powershell
# SECRET_KEY (64 chars)
-join (1..32 | ForEach-Object {'{0:x}' -f (Get-Random -Maximum 16)})

# POSTGRES_PASSWORD (32 chars)
-join (1..16 | ForEach-Object {'{0:x}' -f (Get-Random -Maximum 16)})
```

---

## ⭐ RECOMMENDED FOR YOU

**Use Option 1 (Online Generator)** - Fastest, no installation needed!

1. Visit: https://www.browserling.com/tools/random-hex
2. Generate 32-char string → Copy → Save as SECRET_KEY
3. Generate 16-char string → Copy → Save as POSTGRES_PASSWORD
4. Done! Move to Step 2

---

## What You Should Have Now

```
SECRET_KEY: [64 character string you copied/generated]
POSTGRES_PASSWORD: [32 character string you copied/generated]
```

**Example (these are fake):**
```
SECRET_KEY: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4
POSTGRES_PASSWORD: f1e2d3c4b5a6g7h8i9j0k1l2m3n4o5p6
```

---

## Next: Step 2

Now go to **Step 2** and get your Stripe keys:
- https://dashboard.stripe.com/apikeys
