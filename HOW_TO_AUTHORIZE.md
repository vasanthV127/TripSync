# 🔐 How to Use Authorization in Swagger UI

## ⚠️ Common Issue: "Not authenticated" Error

If you're seeing `{"detail": "Not authenticated"}`, it means **the token is not being sent with your request**.

---

## ✅ Correct Way to Authenticate in Swagger UI

### **Step 1: Login and Get Your Token**

1. Open http://localhost:8000/docs
2. Scroll to **POST /api/login**
3. Click **"Try it out"**
4. Enter credentials:
   ```json
   {
     "email": "student1@example.com",
     "password": "default"
   }
   ```
5. Click **"Execute"**
6. In the response, you'll see:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "role": "student"
   }
   ```
7. **COPY THE TOKEN VALUE** (the long string after "token":)

---

### **Step 2: Click the "Authorize" Button** 🔒

1. Look at the **TOP RIGHT** of the Swagger UI page
2. You'll see a button that says **"Authorize"** with a padlock icon 🔓
3. **CLICK IT**

---

### **Step 3: Paste Your Token**

1. A popup will appear with a field labeled **"Value"**
2. **PASTE YOUR TOKEN** into this field
   - ⚠️ **DO NOT** type "Bearer " before it
   - Just paste the token itself: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Click **"Authorize"**
4. Click **"Close"**

---

### **Step 4: Now You Can Use Protected Endpoints**

After authorizing, you'll see:
- 🔒 Padlock icons on protected endpoints change to **locked/filled**
- All requests will **automatically include** your token

**Now try:**
1. Scroll to **GET /api/students/profile**
2. Click **"Try it out"**
3. **Leave the `roll_no` field EMPTY** (students see their own profile automatically)
4. Click **"Execute"**

✅ **It should work now!**

---

## 🚫 What NOT to Do

❌ **DON'T** try to pass the token in the request body or parameters
❌ **DON'T** manually type "Bearer " when pasting the token
❌ **DON'T** skip the "Authorize" button step

---

## 🔄 If You Still Get "Not authenticated"

1. **Refresh the page** (http://localhost:8000/docs)
2. **Login again** to get a fresh token
3. **Click "Authorize"** button again
4. **Paste the new token**
5. Try the endpoint again

---

## 📱 Testing with Other Tools (Postman, curl, etc.)

If you're NOT using Swagger UI:

### Postman:
1. Go to "Authorization" tab
2. Select "Bearer Token"
3. Paste your token

### curl:
```bash
curl -X GET "http://localhost:8000/api/students/profile" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### PowerShell:
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}
Invoke-RestMethod -Uri "http://localhost:8000/api/students/profile" -Headers $headers
```

---

## 🎯 Quick Test Flow

1. **Login**: POST /api/login → Get token
2. **Authorize**: Click 🔓 button at top → Paste token → Authorize
3. **Test**: GET /api/students/profile → Should see your profile!

---

## 💡 Pro Tip

The "Authorize" button sets the token **for all endpoints** at once. You only need to do it once per session!

---

## 🆘 Still Not Working?

Check:
- ✅ Token was copied completely (very long string)
- ✅ You clicked "Authorize" button (top right)
- ✅ Page was refreshed after authorization
- ✅ No "Bearer " prefix when pasting token
