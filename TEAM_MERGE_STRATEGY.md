# Team Merge Strategy - Schema Changes

## 🎯 Branch Management Strategy

### Current Schema Changes (October 20, 2025)

**Branch**: `main` (or your current feature branch)  
**Impact**: LOW - Only additive changes, no modifications to existing models

---

## 📊 Impact Assessment

### ✅ What's SAFE (Won't cause conflicts):

- **New Models**: VehicleAlert, AuditLog, PaymentRefund
- **New Enums**: VehicleAlertType, AlertSeverity, AlertStatus, RefundType, RefundStatus
- **No changes to**: Existing models, existing enums, existing indexes

### ⚠️ Potential Conflict Areas:

1. **If another branch also adds models** → Migration order conflict
2. **If another branch adds same enum names** → Enum definition conflict
3. **If another branch modifies prisma/schema.prisma** → Merge conflict

---

## 🔀 Merge Scenarios

### Scenario 1: You're merging INTO main branch

**Your changes:** Schema additions (VehicleAlert, etc.)  
**Main branch:** May have other updates

```powershell
# Update your branch first
git checkout your-branch
git pull origin main

# If conflicts in schema.prisma:
# 1. Open schema.prisma
# 2. Keep BOTH sets of changes
# 3. Ensure enums are at the bottom
# 4. Run: npx prisma format
# 5. Run: npx prisma validate

# Regenerate client
npx prisma generate

# Create new migration
npx prisma migrate dev --name merge_schema_changes

# Test thoroughly
npm run start:dev

# Then merge
git add .
git commit -m "Merge main with schema updates"
git push
```

### Scenario 2: Someone else merges their schema changes first

**Their changes:** Got merged to main  
**Your changes:** Need to sync

```powershell
# Pull latest
git checkout main
git pull

# Go back to your branch
git checkout your-branch
git merge main

# If schema conflict:
# ACCEPT BOTH CHANGES (don't overwrite either)

# Then:
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### Scenario 3: Parallel schema development

**Both branches:** Adding different models/enums simultaneously

**Resolution Strategy:**
```powershell
# 1. Coordinate merge order (first-come-first-served)
# 2. First person merges normally
# 3. Second person:

git pull origin main
# Manually merge schema.prisma
# Keep ALL new models from both branches
# Keep ALL new enums from both branches

npx prisma format  # Auto-formats schema
npx prisma validate  # Checks for errors
npx prisma generate
npx prisma migrate dev --create-only

# Manually review migration SQL
# Then apply:
npx prisma migrate dev
```

---

## 🛠️ Manual Merge Example

If you get a conflict in `schema.prisma`:

```prisma
<<<<<<< HEAD
model YourNewModel {
  id Int @id @default(autoincrement())
  // your fields
}
=======
model VehicleAlert {
  id Int @id @default(autoincrement())
  // vehicle alert fields
}
>>>>>>> main
```

**Resolution** - Keep BOTH:

```prisma
model YourNewModel {
  id Int @id @default(autoincrement())
  // your fields
}

model VehicleAlert {
  id Int @id @default(autoincrement())
  // vehicle alert fields
}
```

---

## 📋 Pre-Merge Checklist

Before merging your branch:

- [ ] Pull latest from main/target branch
- [ ] Run `npx prisma validate`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate dev`
- [ ] Test backend starts: `npm run start:dev`
- [ ] Run tests: `npm run test` (if applicable)
- [ ] Check for TypeScript errors
- [ ] Document new models in PR description

---

## 🚦 Migration Conflict Resolution

### If you get: "Migration X conflicts with migration Y"

```powershell
# Option 1: Reset migrations (DEV ONLY)
npx prisma migrate reset

# Option 2: Create a consolidation migration
npx prisma migrate dev --name consolidate_migrations

# Option 3: Manually edit migration files (Advanced)
# Edit files in: prisma/migrations/
# Then: npx prisma migrate resolve --applied <migration_name>
```

---

## 🎓 Best Practices

### DO:
✅ Communicate schema changes in team chat  
✅ Add models at the END of schema file  
✅ Add enums at the VERY END  
✅ Use `npx prisma format` before committing  
✅ Test migrations on dev database first  
✅ Document new models in code comments

### DON'T:
❌ Modify existing models without team discussion  
❌ Delete or rename existing enums  
❌ Change existing field types  
❌ Remove existing indexes  
❌ Force push schema changes  
❌ Skip `npx prisma generate`

---

## 📞 Escalation Path

### Minor Conflicts (Formatting, ordering)
→ Resolve locally with `npx prisma format`

### Major Conflicts (Model definitions clash)
→ Discuss with team, consolidate models

### Migration Conflicts
→ Coordinate with DevOps/Lead, may need database rollback

### Can't Resolve
→ Contact: [Team Lead Name]  
→ Slack: #yathrago-dev-emergency

---

## 🔍 Quick Commands Reference

```powershell
# Validate schema
npx prisma validate

# Format schema
npx prisma format

# Generate client
npx prisma generate

# Create migration
npx prisma migrate dev

# Check migration status
npx prisma migrate status

# Reset database (DEV ONLY)
npx prisma migrate reset

# Open database GUI
npx prisma studio
```

---

## 📅 Migration Timeline

**Production Deployment:**
- Schema changes should be tested in staging first
- Migrations should be reversible
- Always backup production database before migrations
- Coordinate with team for deployment window

**Development:**
- Feel free to experiment
- Use `migrate reset` if needed
- Keep migrations small and focused
