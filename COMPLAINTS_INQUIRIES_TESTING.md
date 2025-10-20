# Quick Testing Guide - Complaints & Inquiries

## Prerequisites
1. ✅ Backend running: `cd backend && npm run start:dev`
2. ✅ Mobile app running: `cd mobile-customer && npm run start:clear`
3. ✅ User logged in with active profile (CHILD or STAFF)
4. ✅ PostgreSQL database running

## Test 1: Submit a Complaint

### Steps:
1. Open mobile-customer app
2. Navigate to **Menu** → **Complaint and Inquiries**
3. Tap **"Add Complaint"** button at the bottom
4. Select **Category** (e.g., "System")
5. Enter **Description**: "Test complaint - system not working properly"
6. Tap **"Submit Complaint"**

### Expected Results:
✅ Loading indicator appears on submit button
✅ Success alert: "Complaint submitted successfully"
✅ Form resets and navigates back to list
✅ New complaint appears in the Complaints tab with:
   - Yellow badge showing "PENDING"
   - Correct description
   - Today's date and time

## Test 2: Submit an Inquiry

### Steps:
1. From Complaint and Inquiries screen
2. Tap **"Add Inquiry"** button at the bottom
3. Switch to **Inquiries** tab at the top
4. Tap **"Add Inquiry"** button
5. Select **Category** (e.g., "Payment")
6. Enter **Description**: "How do I update my payment method?"
7. Tap **"Submit Inquiry"**

### Expected Results:
✅ Success alert: "Inquiry submitted successfully"
✅ New inquiry appears in Inquiries tab with:
   - Yellow badge showing "PENDING"
   - Correct description
   - Today's date and time

## Test 3: View Complaints by Status

### Setup (in Database or Backend):
1. Create records with different statuses:
   - Some with status = 'PENDING'
   - Some with status = 'IN_PROGRESS'
   - Some with status = 'RESOLVED'

### Steps:
1. Navigate to Complaint and Inquiries screen
2. Check the order of complaints

### Expected Results:
✅ Complaints appear in this order:
   1. All PENDING (yellow badge) - newest first
   2. All IN_PROGRESS (blue badge) - newest first
   3. All RESOLVED (green badge) - newest first

## Test 4: Profile Filtering

### Steps:
1. Create complaints for Profile A (e.g., CHILD)
2. Switch to Profile B (different CHILD or STAFF)
3. Navigate to Complaint and Inquiries
4. Check what complaints appear

### Expected Results:
✅ Only complaints for Profile B appear
✅ Profile A's complaints are NOT visible
✅ Each profile sees only their own submissions

## Test 5: Expand/Collapse Cards

### Steps:
1. Navigate to Complaint and Inquiries screen
2. Find a complaint with long description
3. Tap on the card header (where the ID is shown)
4. Tap again

### Expected Results:
✅ First tap: Description expands to show full text
✅ Second tap: Description collapses to 2 lines
✅ Arrow icon toggles (down ↔ up)

## Test 6: Tab Switching

### Steps:
1. Navigate to Complaint and Inquiries screen
2. Observe the Complaints tab (default)
3. Tap **Inquiries** tab
4. Tap **Complaints** tab

### Expected Results:
✅ Complaints tab shows only COMPLAINT type records
✅ Inquiries tab shows only INQUIRY type records
✅ Active tab has yellow underline
✅ "Add Complaint" / "Add Inquiry" button text changes

## Test 7: Error Handling

### Steps:
1. Stop the backend server
2. Open Complaint and Inquiries screen
3. Try to submit a complaint

### Expected Results:
✅ Loading indicator appears
✅ Error alert: "Failed to fetch data" or similar
✅ Red error message appears on screen
✅ Submit fails with error alert

## Test 8: Validation

### Steps:
1. Navigate to Add Complaint/Inquiry
2. Leave category empty
3. Leave description empty
4. Tap Submit

### Expected Results:
✅ Red error text: "Please select a category"
✅ Red error text: "Description is required"
✅ Form does NOT submit

### Steps 2:
1. Fill category but leave description empty
2. Tap Submit

### Expected Results:
✅ Only description error shows
✅ Form does NOT submit

## Test 9: Auto-Refresh

### Steps:
1. Open Complaint and Inquiries screen
2. Note the current complaints
3. Navigate to Add Complaint
4. Submit a new complaint
5. Navigate back (automatically)

### Expected Results:
✅ New complaint immediately appears in list
✅ No manual refresh needed
✅ List is sorted correctly with new item

## Test 10: See More Button

### Setup:
Create more than 3 complaints/inquiries for active profile

### Steps:
1. Navigate to Complaint and Inquiries
2. Check initial display
3. Tap "see more" button
4. Switch tabs

### Expected Results:
✅ Initially shows only 3 items
✅ "see more" button appears if > 3 items
✅ After tapping, all items appear
✅ Button behavior is independent per tab

## API Testing with Postman

### 1. Create Complaint
```
POST http://localhost:3000/complaints-inquiries
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_TOKEN

Body:
{
  "senderId": 1,
  "senderUserType": "CHILD",
  "type": "COMPLAINT",
  "description": "Test complaint from Postman",
  "category": "SYSTEM"
}
```

### 2. Get Complaints
```
GET http://localhost:3000/complaints-inquiries/sender/1?senderUserType=CHILD
Headers:
  Authorization: Bearer YOUR_TOKEN
```

## Database Verification

### Check Created Records:
```sql
SELECT * FROM "ComplaintsInquiries" 
ORDER BY status, "createdAt" DESC;
```

### Check by Sender:
```sql
SELECT * FROM "ComplaintsInquiries" 
WHERE "senderId" = 1 
  AND "senderUserType" = 'CHILD'
ORDER BY status, "createdAt" DESC;
```

### Update Status (for testing):
```sql
UPDATE "ComplaintsInquiries"
SET status = 'IN_PROGRESS'
WHERE id = 1;

UPDATE "ComplaintsInquiries"
SET status = 'RESOLVED'
WHERE id = 2;
```

## Common Issues & Solutions

### Issue: "No active profile or authentication token"
**Solution:** Ensure user is logged in and has selected a profile

### Issue: Backend returns 401 Unauthorized
**Solution:** Check accessToken is valid and not expired

### Issue: Wrong complaints showing
**Solution:** Verify `senderId` and `senderUserType` match active profile

### Issue: Status badge not colored
**Solution:** Check status value is exactly: PENDING, IN_PROGRESS, or RESOLVED

### Issue: Data not refreshing
**Solution:** Check `useFocusEffect` is working, or navigate away and back

## Performance Testing

### Load Test:
1. Create 50+ complaints for one profile
2. Navigate to screen
3. Check load time and scroll performance

### Expected:
✅ Loads within 2-3 seconds
✅ Smooth scrolling
✅ No lag when expanding cards

## Success Checklist

- [ ] Can create complaint with all categories
- [ ] Can create inquiry with all categories
- [ ] Complaints and inquiries appear in correct tabs
- [ ] Status badges show with correct colors
- [ ] Sorting works (PENDING → IN_PROGRESS → RESOLVED)
- [ ] Form validation works
- [ ] Error messages display correctly
- [ ] Profile filtering works (only see own items)
- [ ] Auto-refresh on return to screen
- [ ] Expand/collapse works
- [ ] Loading indicators appear
- [ ] Backend endpoints respond correctly

---

**Ready to Test!** 🚀
