# Store Submission Checklist — Glowmax

Danh sách những việc phải làm trước khi submit lên App Store và Google Play.  
Trạng thái dựa trên code tại thời điểm tạo file (2026-05-10).

---

## 🔴 BUG NGHIÊM TRỌNG — phải sửa trước khi build

### 1. `paywall.tsx` import `supabase` đã bị xoá

**File:** `frontend/app/(main)/paywall.tsx:30`  
**Lỗi:** Import và gọi `supabase.auth.getUser()` trong khi `lib/supabase.ts` không còn tồn tại.

```ts
// Dòng 30 — sẽ crash ngay khi render PaywallScreen
import { supabase } from '../../lib/supabase';
// ...
const { data: { user } } = await supabase.auth.getUser(); // line 85
```

**Sửa:** Thay bằng `getAccessToken()` + `isAnonymousToken()` từ `lib/tokenUtils.ts`:

```ts
import { getAccessToken, isAnonymousToken } from '../../lib/tokenUtils';
// ...
const token = await getAccessToken();
if (token && !isAnonymousToken(token)) {
  setStep('purchase');
}
```

---

## 🔴 BẮT BUỘC — App Store sẽ reject nếu thiếu

### 2. Apple Sign-In chưa implement

**Quy tắc App Store 4.8:** Nếu app cho phép đăng nhập bằng third-party (Google), **bắt buộc phải có Apple Sign-In**.

**Hiện tại:** `lib/auth.ts` → `signInWithApple()` trả về error cứng `"Đăng nhập Apple chỉ hỗ trợ trên iOS."` và không thực sự gọi backend.

**Việc cần làm:**
- [ ] Đăng ký trên Apple Developer Console: tạo App ID, bật "Sign In with Apple"
- [ ] Implement `AuthService.handleOAuthCallback("apple", ...)` trên backend (skeleton đã có, chỉ cần điền logic verify Apple JWT)
- [ ] Test thực tế trên device iOS (simulator không support Apple Sign-In)
- [ ] Entitlement `com.apple.developer.applesignin` đã có trong `app.json` ✅

### 3. Privacy Policy bắt buộc

App dùng camera, phân tích khuôn mặt, in-app purchase → **cả 2 store đều yêu cầu URL privacy policy**.

**Việc cần làm:**
- [ ] Viết Privacy Policy (đặc biệt ghi rõ: dữ liệu khuôn mặt không lưu trữ, gửi lên OpenAI để phân tích)
- [ ] Host lên URL công khai (có thể dùng Notion, GitHub Pages, hoặc page trên website)
- [ ] Thêm URL vào App Store Connect khi submit
- [ ] Thêm URL vào Google Play Console khi submit
- [ ] Hiển thị link trong app (ví dụ: trong màn hình onboarding hoặc profile)

### 4. Giá gói subscription không hiển thị thực tế

**File:** `frontend/app/(main)/paywall.tsx` — paywall card hardcode text `"TIẾT KIỆM 80%"` mà không lấy giá thực từ RevenueCat.

**Yêu cầu của cả 2 store:** Phải hiển thị **giá tiền thực tế** (VD: "299.000 ₫/tuần") trước khi user nhấn mua.

**Sửa:** Dùng `Purchases.getOfferings()` để lấy `pkg.product.priceString` và render ra UI.

---

## 🟡 CẦU HÌNH — phải xong trước khi build production

### 5. RevenueCat — cấu hình sản phẩm

- [ ] Tạo tài khoản RevenueCat, kết nối App Store Connect + Google Play
- [ ] Tạo 2 sản phẩm subscription trong App Store Connect: `glowmax_weekly`, `glowmax_yearly`
- [ ] Tạo 2 sản phẩm subscription trong Google Play Console: `glowmax_weekly`, `glowmax_yearly`
- [ ] Tạo Entitlement `premium` trong RevenueCat dashboard, gán 2 sản phẩm trên vào
- [ ] Điền vào `frontend/.env.local`:
  ```
  EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxx
  EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxx
  ```
- [ ] Test purchase flow với Sandbox account (iOS) / Test account (Android)

### 6. Google OAuth — Client IDs

- [ ] Tạo OAuth Client cho **iOS** (type: iOS application) trong Google Cloud Console
- [ ] Tạo OAuth Client cho **Android** (type: Android application, cần SHA-1 fingerprint của signing key)
- [ ] Điền vào `frontend/.env.local`:
  ```
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=xxxx.apps.googleusercontent.com
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=xxxx.apps.googleusercontent.com
  ```
- [ ] Thêm redirect URI `glowmax://auth/callback` vào Authorized redirect URIs trong Google Cloud Console
- [ ] Điền vào backend `.env`: `GOOGLE_CLIENT_ID=xxxx` (dùng để verify `aud` trong id_token)

### 7. Backend production

- [ ] Backend đã deploy và accessible tại URL production
- [ ] `EXPO_PUBLIC_API_BASE_URL` trong `frontend/.env.local` trỏ đúng URL production (không phải localhost)
- [ ] Backend `.env` đã cấu hình đầy đủ (xem `docs/SECURITY.md` mục Checklist Production)
- [ ] CORS: `CORS_ALLOWED_ORIGINS=glowmax://` (bỏ localhost)

### 8. EAS / Signing

- [ ] Đăng nhập `eas-cli`: `eas login`
- [ ] **iOS:** Upload Distribution Certificate + Provisioning Profile vào EAS, hoặc để EAS tự tạo (`eas credentials`)
- [ ] **Android:** Tạo keystore production (`eas credentials`), lưu keystore an toàn — **mất keystore = không thể update app trên Play**
- [ ] Lấy SHA-1 fingerprint của keystore để điền vào Google Cloud Console (bước 6)

---

## 🟡 NỘI DUNG APP — cần có trước khi submit review

### 9. Screenshots và metadata

**App Store** (dùng Xcode / Transporter / EAS Submit):
- [ ] Screenshots cho iPhone 6.9" (iPhone 16 Pro Max) — bắt buộc
- [ ] Screenshots cho iPhone 6.5" (iPhone 14 Plus) — bắt buộc
- [ ] Screenshots cho iPad 13" — nếu `supportsTablet: true` (đã bật trong app.json)
- [ ] App description, keywords, category

**Google Play:**
- [ ] Screenshots điện thoại (ít nhất 2)
- [ ] Feature graphic 1024×500
- [ ] App description (tiếng Anh bắt buộc, thêm tiếng Việt)
- [ ] Điền **Data Safety form**: khai báo camera access, face data, in-app purchases

### 10. App icon và splash

Kiểm tra các file asset đúng kích thước:
- [ ] `assets/icon.png` — 1024×1024, không có góc bo (store sẽ tự bo)
- [ ] `assets/adaptive-icon.png` — Android adaptive icon foreground, 1024×1024, nội dung trong vùng 66% trung tâm
- [ ] `assets/splash-icon.png` — splash screen image

### 11. Version number

Hiện tại: `version: "1.0.0"`, `buildNumber: "1"`, `versionCode: 1`

`eas.json` đã cấu hình `autoIncrement: true` cho production build — EAS sẽ tự tăng `buildNumber`/`versionCode` mỗi lần build. Không cần sửa tay.

---

## 🟢 ĐÃ SẴN SÀNG

Những thứ đã làm đúng, không cần thay đổi:

| Hạng mục | Chi tiết |
|---|---|
| Bundle ID / Package | `com.glowmax.app` (cả iOS và Android) |
| Deep link scheme | `glowmax://` — cấu hình trong `app.json` |
| Permission strings | Camera, photo library, media library — đã có tiếng Việt |
| Restore purchases button | Có trong paywall (`KHÔI PHỤC GÓI ĐÃ MUA`) |
| Apple Sign-In entitlement | `com.apple.developer.applesignin` trong `app.json` |
| Dark mode | `userInterfaceStyle: "dark"` |
| Orientation lock | `portrait` only |
| Edge-to-edge (Android) | `edgeToEdgeEnabled: true` |
| New Architecture | `newArchEnabled: true` |
| EAS build profiles | `development`, `preview`, `production` đã cấu hình |
| Splash background | `#0A0C0E` khớp với app theme |

---

## Thứ tự thực hiện đề xuất

```
1. Sửa bug paywall.tsx (30 phút)
2. Triển khai backend production + cấu hình env
3. Cấu hình Google Cloud Console (OAuth Client IDs)
4. Implement Apple Sign-In backend + test iOS
5. Tạo RevenueCat account, cấu hình products, test purchase sandbox
6. Sửa paywall hiển thị giá thực từ RevenueCat
7. Viết + host Privacy Policy
8. Chụp screenshots
9. eas build --profile production --platform all
10. Submit lên App Store Connect + Google Play Console
```
