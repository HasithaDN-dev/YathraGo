# Role Search & Filter Implementation

## Overview
Added a powerful search bar with role filtering capabilities above the pie chart in the Role Management page. Users can now search across all users by name, email, user ID, or mobile number, and filter results by specific roles.

## Features Implemented

### 1. Global Search Bar
- **Location**: Right panel, above the pie chart
- **Search Fields**: 
  - Name
  - Email
  - User ID
  - Mobile Number
- **Real-time Search**: 500ms debounce for optimal performance
- **Search Indicator**: Loading spinner while searching

### 2. Role Filter Dropdown
- **Filter Options**: 
  - All Roles (default)
  - Individual roles with user counts
- **Quick Clear**: Clear filter button when a specific role is selected

### 3. Dynamic Pie Chart Updates
- Chart automatically updates based on search results
- Shows distribution of roles in search results
- Adapts to role filter selection

### 4. Search Results Summary
- Displays count of matched users
- Shows search query in summary
- Clear search button for quick reset

## Backend API

### New Endpoint: Search Users

```http
GET /admin/users/search?query=john&roleType=DRIVER
```

**Query Parameters:**
- `query` (required): Search term (name, email, mobile, user ID)
- `roleType` (optional): Filter by specific role type

**Response:**
```json
{
  "results": [
    {
      "id": "DRV001",
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "+94771234567",
      "address": "123 Main St",
      "status": "Active",
      "joinDate": "2024-01-15",
      "userType": "DRIVER"
    }
  ],
  "totalResults": 1,
  "searchQuery": "john",
  "roleType": "DRIVER"
}
```

### Search Logic

The search endpoint:
1. Accepts a search query and optional role type
2. Searches across specified role types (or all if not specified)
3. Matches against: name, email, mobile, and user ID
4. Returns aggregated results with user type information

### Files Modified

**Backend:**
- `backend/src/admin/users/users.controller.ts`
  - Added `searchUsers()` endpoint
- `backend/src/admin/users/users.service.ts`
  - Added `searchUsers(query, roleType?)` method
  - Implements cross-role searching with filtering

**Frontend:**
- `web-dashboard/app/admin/roles/page.tsx`
  - Added search state management
  - Implemented debounced search
  - Updated UI with search bar and role filter
  - Dynamic chart updates based on search

## UI Components

### Search Bar
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
  <Input
    type="text"
    placeholder="Search by name, email, user ID, or mobile number..."
    value={globalSearchQuery}
    onChange={(e) => setGlobalSearchQuery(e.target.value)}
    className="pl-10 w-full"
  />
  {isSearching && (
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
    </div>
  )}
</div>
```

### Role Filter Dropdown
```tsx
<select
  value={selectedRoleFilter}
  onChange={(e) => setSelectedRoleFilter(e.target.value)}
  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
>
  <option value="all">All Roles</option>
  {roles.filter(r => r.userCount > 0).map((role, index) => (
    <option key={index} value={role.name}>
      {role.name} ({role.userCount})
    </option>
  ))}
</select>
```

### Search Results Summary
```tsx
{(globalSearchQuery || selectedRoleFilter !== "all") && (
  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
    <p className="text-sm text-gray-700">
      {globalSearchQuery && searchResults.length > 0
        ? `Found ${searchResults.length} user(s) matching "${globalSearchQuery}"`
        : globalSearchQuery && searchResults.length === 0
        ? `No users found matching "${globalSearchQuery}"`
        : selectedRoleFilter !== "all" 
        ? `Showing ${filteredTotalUsers} users in ${selectedRoleFilter}`
        : `Showing ${filteredTotalUsers} users`}
    </p>
    {globalSearchQuery && (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setGlobalSearchQuery("")}
      >
        Clear search
      </Button>
    )}
  </div>
)}
```

## State Management

### Frontend State Variables
```tsx
const [globalSearchQuery, setGlobalSearchQuery] = useState("");
const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
const [searchResults, setSearchResults] = useState<UserData[]>([]);
const [isSearching, setIsSearching] = useState(false);
```

### Debounced Search Effect
```tsx
useEffect(() => {
  const searchUsers = async () => {
    if (!globalSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const roleParam = selectedRoleFilter !== "all" 
        ? `&roleType=${roles.find(r => r.name === selectedRoleFilter)?.userType || ''}`
        : '';
      
      const response = await fetch(
        `http://localhost:3000/admin/users/search?query=${encodeURIComponent(globalSearchQuery)}${roleParam}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debounceTimer = setTimeout(() => {
    searchUsers();
  }, 500); // 500ms debounce

  return () => clearTimeout(debounceTimer);
}, [globalSearchQuery, selectedRoleFilter, roles]);
```

## Chart Updates

### Dynamic Data Calculation
```tsx
const filteredRolesForChart = useMemo(() => {
  let filtered = roles;

  // If searching, use search results to calculate role distribution
  if (globalSearchQuery.trim() && searchResults.length > 0) {
    // Count users by role from search results
    const roleCounts: Record<string, number> = {};
    searchResults.forEach((user) => {
      const roleName = roles.find(r => r.userType === user.userType)?.name;
      if (roleName) {
        roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
      }
    });

    // Return chart data based on search results
    return Object.entries(roleCounts).map(([name, count]) => {
      const roleData = roles.find(r => r.name === name);
      return {
        name,
        value: count,
        color: roleData?.color || '#gray',
      };
    });
  }

  // Filter by selected role
  if (selectedRoleFilter !== "all") {
    filtered = filtered.filter(role => role.name === selectedRoleFilter);
  }

  return filtered.filter(role => role.userCount > 0).map(role => ({
    name: role.name,
    value: role.userCount,
    color: role.color
  }));
}, [roles, selectedRoleFilter, globalSearchQuery, searchResults]);
```

## User Interface Flow

### 1. Default View
- Shows all roles in pie chart
- Search bar empty
- Role filter set to "All Roles"
- Total users count displayed

### 2. Search Flow
1. User types in search bar
2. 500ms debounce delay
3. Loading spinner appears
4. API call to search endpoint
5. Results populate searchResults state
6. Pie chart updates with search results distribution
7. Summary shows "Found X users matching [query]"

### 3. Role Filter Flow
1. User selects specific role from dropdown
2. Chart filters to show only that role
3. "Clear Filter" button appears
4. Summary shows "Showing X users in [role]"

### 4. Combined Search + Filter
1. User enters search query
2. User selects specific role
3. Search restricted to that role type
4. Chart shows role distribution of filtered results
5. Summary combines both filters

### 5. Clear Actions
- **Clear Search**: Clears search query, keeps role filter
- **Clear Filter**: Resets to "All Roles", keeps search query
- Both can be cleared independently

## Testing Guide

### Test Search Functionality

**1. Test Basic Search:**
```bash
# Search by name
curl "http://localhost:3000/admin/users/search?query=john"

# Search by email
curl "http://localhost:3000/admin/users/search?query=example@email.com"

# Search by mobile
curl "http://localhost:3000/admin/users/search?query=0771234567"

# Search by user ID
curl "http://localhost:3000/admin/users/search?query=DRV001"
```

**2. Test Role-Specific Search:**
```bash
# Search drivers only
curl "http://localhost:3000/admin/users/search?query=john&roleType=DRIVER"

# Search customers only
curl "http://localhost:3000/admin/users/search?query=silva&roleType=CUSTOMER"
```

**3. Test UI Search:**
1. Navigate to Admin → Roles page
2. Type "john" in search bar
3. Verify loading spinner appears
4. Verify results appear after 500ms
5. Verify pie chart updates
6. Verify summary shows match count

**4. Test Role Filter:**
1. Select "Drivers" from dropdown
2. Verify chart shows only drivers
3. Verify "Clear Filter" button appears
4. Click "Clear Filter"
5. Verify chart resets to all roles

**5. Test Combined:**
1. Enter "silva" in search
2. Select "Customers" from filter
3. Verify results show only customers named silva
4. Verify chart reflects filtered results

## Performance Considerations

### Debouncing
- 500ms delay prevents excessive API calls
- Improves server performance
- Better user experience (no flickering)

### Search Optimization
- Backend searches across specific role types
- Frontend filters and aggregates results
- Minimal data transfer

### Memoization
- `filteredRolesForChart` uses useMemo
- `filteredTotalUsers` uses useMemo
- Prevents unnecessary recalculations

## Future Enhancements

### Potential Improvements
1. **Advanced Filters**:
   - Date range filter (join date)
   - Status filter (Active/Inactive)
   - Multiple role selection

2. **Search History**:
   - Save recent searches
   - Quick access to common queries

3. **Export Results**:
   - Export search results to CSV
   - Generate reports based on search

4. **Auto-suggestions**:
   - Show suggested searches as user types
   - Autocomplete user names

5. **Saved Filters**:
   - Save custom filter combinations
   - Quick preset filters

## Known Limitations

1. **Search Scope**: Currently searches exact matches (case-insensitive)
2. **Performance**: Searching all roles may be slow with large datasets
3. **Pagination**: Search results not paginated (loads all matches)

## Summary

✅ **Implemented:**
- Global search across all user fields
- Role-based filtering
- Dynamic pie chart updates
- Real-time search with debouncing
- Clear search and filter actions
- Search results summary
- Loading indicators

✅ **Backend:**
- New `/admin/users/search` endpoint
- Cross-role search capability
- Optional role filtering

✅ **Frontend:**
- Clean, intuitive UI
- Responsive design
- Proper error handling
- State management with React hooks

The search and filter feature is now fully functional and ready for use!
