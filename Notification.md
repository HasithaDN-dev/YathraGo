# YathraGo Notification System

## Overview
The YathraGo notification system enables real-time, profile-aware notifications for parents, children, staff, drivers, and admins. It uses Firebase Cloud Messaging (FCM) for push delivery and a robust backend/frontend integration to ensure users receive timely alerts both in-app and as device notifications.

---

## Technologies Used
- **NestJS** (Backend API)
- **Prisma ORM** (Database access)
- **PostgreSQL** (Database)
- **Firebase Admin SDK** (Push notification delivery via FCM)
- **Expo Notifications** (Frontend push notification handling)
- **React Native + Expo** (Mobile app)
- **Zustand** (Frontend state management)

---

## Data Model
- **Notification Table:**
  - Stores all notifications with sender, message, type, receiver (profile type), receiverId (profile ID), and timestamps.
- **User Tables:**
  - `Customer`, `Driver`, `Webuser`, `BackupDriver` each have an `fcmToken` field to store the device's push token.

---

## Notification Flow

### 1. Device Registration
- When a user logs in on the mobile app, the app registers for push notifications using Expo Notifications.
- The app obtains an FCM/Expo push token and sends it to the backend via a dedicated API endpoint.
- The backend stores this token in the user's profile table (e.g., `Customer.fcmToken`).

### 2. Sending a Notification
- A notification is triggered (e.g., payment received, school alert, ride update) via the backend API (`POST /notifications`).
- The backend:
  1. Stores the notification in the `Notification` table with the correct `receiver` (profile type) and `receiverId` (profile ID).
  2. Looks up the recipient's FCM token from the appropriate user table.
  3. Sends a push notification via Firebase Cloud Messaging (FCM) to the device.

### 3. Receiving a Notification
- If the app is in the background or closed, the device receives a system tray notification with sound (in standalone/dev builds).
- If the app is open, the notification tab auto-refreshes and displays the new notification in real time.
- All notifications are always available in the in-app notification tab, filtered by the active profile (parent, child, staff, etc.).

### 4. Profile-Aware Delivery
- The system supports multiple profiles per user (parent, child, staff).
- Each notification is targeted using `receiver` (e.g., CUSTOMER) and `receiverId` (e.g., child_id or customer_id).
- Switching profiles in the app updates the notification tab to show only relevant notifications.

---

## API Endpoints
- `POST /notifications` — Send a notification (stores in DB and pushes via FCM)
- `GET /notifications?receiver=...&receiverId=...` — Fetch notifications for a specific profile
- `PUT /notifications/fcm-token/:customerId` — Update/store the device's FCM token for a customer

---

## Example Notification Flow
1. Parent logs in, app registers and sends FCM token to backend.
2. Admin sends a payment alert to the parent (`receiver: CUSTOMER, receiverId: 2`).
3. Backend stores the notification and sends a push via FCM to the parent's device.
4. Parent receives a system tray notification (if app is built, not Expo Go) and sees the alert in the notification tab.
5. Parent switches to child profile; notification tab updates to show only child-specific notifications.

---

## Notes
- **Expo Go Limitation:** Push notifications (system tray, sound) only work in standalone or dev builds, not in Expo Go.
- **All notifications are stored in the database** and can be retrieved for any profile at any time.
- **Push delivery is real-time** if the device is registered and has a valid FCM token.

---

## Summary
The YathraGo notification system provides robust, real-time, and profile-aware notifications using modern cloud and mobile technologies, ensuring users never miss important updates.