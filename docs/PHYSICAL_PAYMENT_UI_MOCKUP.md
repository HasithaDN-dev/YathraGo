# Physical Payment UI Mockup

## 📱 Screen Layout

```
┌─────────────────────────────────────────┐
│  ←  Payments                            │  ← ScreenHeader
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Card Payment │ Physical Payment│   │  ← Toggle (Physical selected)
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Payments                │   │  ← Status Header
│  │  Current Status: OVERDUE        │   │     (Red background)
│  └─────────────────────────────────┘   │
│                                         │
│  Select Months to Pay                   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ October 2025              ✓     │   │  ← Selected
│  │ [OVERDUE]                       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ November 2025             ○     │   │  ← Not selected
│  │ [NOT CREATED]                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ December 2025                   │   │  ← Disabled
│  │ [AWAITING CONFIRMATION]         │   │     (No checkbox)
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ January 2026              ○     │   │
│  │ [NOT DUE]                       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ February 2026             ○     │   │
│  │ [NOT DUE]                       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     Proceed (1 month)           │   │  ← Action button
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Selected months will be         │   │  ← Info text
│  │ submitted to your driver for    │   │
│  │ confirmation. Pay the amount    │   │
│  │ directly to your driver.        │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎨 Color States

### Status Header Colors

#### PAID (Green)
```
┌─────────────────────────────────┐
│         Payments                │  
│  Current Status: Paid           │  ← Green background (#10B981)
└─────────────────────────────────┘
```

#### OVERDUE (Red)
```
┌─────────────────────────────────┐
│         Payments                │  
│  Current Status: Overdue        │  ← Red background
└─────────────────────────────────┘
```

#### GRACE_PERIOD (Yellow)
```
┌─────────────────────────────────┐
│         Payments                │  
│  Current Status: Grace Period   │  ← Yellow background
└─────────────────────────────────┘
```

#### AWAITING_CONFIRMATION (Orange)
```
┌─────────────────────────────────┐
│         Payments                │  
│  Current Status: Awaiting       │  ← Orange background
│       Confirmation              │      (#FF6B35)
└─────────────────────────────────┘
```

---

## 💳 Card Payment View

```
┌─────────────────────────────────────────┐
│  ←  Payments                            │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Card Payment │ Physical Payment│   │  ← Toggle (Card selected)
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Card Payment Summary           │   │
│  │                                 │   │
│  │  Monthly Amount:  Rs. 8,500.00  │   │
│  │                                 │   │
│  │  Total Payable:   Rs. 8,500.00  │   │
│  │                                 │   │
│  │  ┌───────────────────────────┐  │   │
│  │  │  💳 Pay with Card         │  │   │  ← Primary button
│  │  └───────────────────────────┘  │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔄 Interaction States

### Month Card States

#### 1. Selectable - Not Selected
```
┌─────────────────────────────────┐
│ October 2025              ○     │  ← Empty circle
│ [OVERDUE]                       │     Red badge
└─────────────────────────────────┘
```

#### 2. Selectable - Selected
```
┌─────────────────────────────────┐
│ October 2025              ✓     │  ← Filled checkmark
│ [OVERDUE]                       │     Red badge
└─────────────────────────────────┘  ← Navy border (2px)
```

#### 3. Non-Selectable (Disabled)
```
┌─────────────────────────────────┐
│ December 2025                   │  ← 50% opacity
│ [PAID]                          │     Green badge
└─────────────────────────────────┘     No checkbox
```

---

## 📊 Loading States

### Initial Load
```
┌─────────────────────────────────────────┐
│  ←  Payments                            │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Card Payment │ Physical Payment│   │
│  └─────────────────────────────────┘   │
│                                         │
│            🔄 Loading...                │  ← Spinner
│     Loading payment information...      │
│                                         │
└─────────────────────────────────────────┘
```

### Submitting Payment
```
│  ┌─────────────────────────────────┐   │
│  │     Proceed (2 months)          │   │  ← Button
│  └─────────────────────────────────┘   │
│                                         │
│            🔄                           │  ← Small spinner
│      Submitting payment...              │
```

---

## ⚠️ Empty State
```
┌─────────────────────────────────────────┐
│  ←  Payments                            │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Card Payment │ Physical Payment│   │
│  └─────────────────────────────────┘   │
│                                         │
│                                         │
│      No payment information             │
│            available                    │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎯 Status Badge Styles

All badges have: `px-3 py-1 rounded-full`

### PAID
```
┌────────┐
│ Paid   │  ← White text on green (#10B981)
└────────┘
```

### OVERDUE
```
┌──────────┐
│ Overdue  │  ← White text on red
└──────────┘
```

### GRACE_PERIOD
```
┌─────────────────┐
│ Grace Period    │  ← White text on yellow
└─────────────────┘
```

### AWAITING_CONFIRMATION
```
┌──────────────────────────┐
│ Awaiting Confirmation    │  ← White text on orange
└──────────────────────────┘
```

### NOT_DUE
```
┌──────────┐
│ Not Due  │  ← White text on navy (#143373)
└──────────┘
```

### CANCELLED
```
┌────────────┐
│ Cancelled  │  ← White text on gray
└────────────┘
```

---

## 🔔 Alert Examples

### Success Alert
```
┌─────────────────────────────────┐
│           Success               │
│                                 │
│  Payment submitted for driver   │
│  confirmation                   │
│                                 │
│            [ OK ]               │
└─────────────────────────────────┘
```

### Error Alert
```
┌─────────────────────────────────┐
│            Error                │
│                                 │
│  Failed to submit payment       │
│                                 │
│            [ OK ]               │
└─────────────────────────────────┘
```

### No Selection Alert
```
┌─────────────────────────────────┐
│        No Selection             │
│                                 │
│  Please select at least one     │
│  month to proceed               │
│                                 │
│            [ OK ]               │
└─────────────────────────────────┘
```

---

## 📐 Component Hierarchy

```
PaymentScreen
├── SafeAreaView
│   └── ScrollView
│       ├── ScreenHeader (title="Payments")
│       │
│       ├── Payment Type Toggle
│       │   └── Card (2 TouchableOpacity buttons)
│       │
│       ├── Card Payment View (if paymentType === 'card')
│       │   └── Card
│       │       ├── Summary section
│       │       └── CustomButton (Pay with Card)
│       │
│       └── Physical Payment View (if paymentType === 'physical')
│           ├── Status Header (colored)
│           │
│           ├── Loading Indicator (if loading)
│           │
│           ├── Months List (if !loading && months.length > 0)
│           │   ├── Section Title
│           │   ├── Month Cards (map)
│           │   │   └── TouchableOpacity
│           │   │       └── Card
│           │   │           ├── Month name + year
│           │   │           ├── Status badge
│           │   │           └── Checkbox (if selectable)
│           │   │
│           │   ├── Proceed Button (if selectedMonths.size > 0)
│           │   │   ├── CustomButton
│           │   │   └── Loading indicator (if submitting)
│           │   │
│           │   └── Info Text Card
│           │
│           └── Empty State (if !loading && months.length === 0)
```

---

## 🎨 Typography Usage

```typescript
// Headers
<Typography variant="subhead" weight="semibold">
  Select Months to Pay
</Typography>

// Month names
<Typography variant="subhead" weight="semibold">
  October 2025
</Typography>

// Status badges
<Typography variant="caption-2" className="text-white">
  OVERDUE
</Typography>

// Info text
<Typography variant="caption-1" className="text-gray-700">
  Selected months will be submitted...
</Typography>

// Button text
<CustomButton
  title="Proceed (2 months)"
  size="large"
/>
```

---

## 🔧 Responsive Behavior

### Small Screens
- Full width cards: `className="w-full"`
- Comfortable padding: `px-4`
- Readable font sizes: `variant="body"`

### Large Screens
- Same layout (mobile-first)
- Maintains max width constraints
- Scrollable content

---

## ✨ Animations & Interactions

### Touch Feedback
```typescript
<TouchableOpacity
  activeOpacity={0.7}  // Slight fade on press
  onPress={handlePress}
>
```

### Disabled States
```typescript
disabled={!selectable}
className={`${!selectable && 'opacity-50'}`}
```

### Border Highlight
```typescript
className={`${isSelected ? 'border-2 border-brand-deepNavy' : ''}`}
```

---

## 🎯 Accessibility Features

1. **Clear visual states** - Selected vs unselected
2. **Color-coded status** - Easy to understand at a glance
3. **Descriptive labels** - "Proceed (2 months)"
4. **Disabled states** - Non-selectable months are obviously disabled
5. **Loading feedback** - Spinner with descriptive text
6. **Error messages** - Clear alert dialogs

---

This mockup shows the complete visual design and interaction patterns for the physical payment feature! 🎨✨
