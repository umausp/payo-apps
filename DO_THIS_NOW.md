# Fix Network Error - DO THIS NOW

## 🚨 You're getting: `[API Error] undefined Network Error`

## ✅ Quick Fix (3 Steps)

### Step 1: Check Backend is Running

```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-backend
pm2 list
```

**All services should say `online`.**

**If any are stopped:**
```bash
pm2 restart all
```

---

### Step 2: Rebuild the App

**The fix is already in your code, but you MUST rebuild:**

```bash
# Stop Metro if running (CMD+C)

# Start with cache clear
npm start -- --reset-cache

# In ANOTHER terminal:
npm run ios
# OR
npm run android
```

**⚠️ DON'T skip the `--reset-cache` part!**

---

### Step 3: Test It

**Open the app, go to:**

Settings → Developer → Test Backend Connection

**Should show:**
```
Auth: Online ✓
Wallet: Online ✓
Payment: Online ✓
```

**If it shows "Online ✓" → You're fixed! ✅**

**If it shows "Offline ✗" → See troubleshooting below.**

---

## 🐛 Still Not Working?

### Quick Checks:

**1. Is backend actually running?**
```bash
curl http://localhost:3001/health
```
Should return: `{"status":"ok"}`

**2. Check the console when app starts:**

You should see:
```
🌐 API CONFIGURATION
Platform: ios (or android)
API URLs:
  Auth Service: http://localhost:3001  (or http://10.0.2.2:3001 on Android)
```

**3. Try logging in and watch the console:**

Should see:
```
[API Request] POST http://localhost:3001/challenge
[API Response] 200 ...
```

**If you see that → It's working!**

---

## 📱 Testing on Physical Device?

**Get your Mac's IP:**
```bash
ipconfig getifaddr en0
```

**Edit:** `src/constants/index.ts`

**Find and uncomment this line (around line 25):**
```typescript
// return 'http://192.168.1.10';  // ← PUT YOUR IP HERE
```

**Change to:**
```typescript
return 'http://192.168.1.YOUR_IP_HERE';  // ← YOUR ACTUAL IP
```

**Then rebuild.**

---

## 🆘 Still Broken?

**Collect this info:**

1. Platform: iOS Simulator / Android Emulator / Physical Device
2. Backend status: Copy output of `pm2 list`
3. Curl test: `curl http://localhost:3001/health` (paste result)
4. Console logs: Copy the "API CONFIGURATION" section when app starts
5. Error logs: Settings → Developer → View API Logs (screenshot)

**Share this for help.**

---

## ✅ It Works!

**You'll know it's fixed when:**
- Login succeeds without errors
- Dashboard shows balance
- "Test Backend Connection" shows all online ✓

---

**Need more details?** See `NETWORK_FIX_APPLIED.md`

**Happy debugging! 🚀**
