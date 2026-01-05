# Quick Import Guide - Mirror ERP-CRM

## 🚀 Quick Start (5 Steps)

### 1. Access Import Tool
**Admin Panel → Import Data**

### 2. Select Target & Upload
- Choose target table (Contacts, Enquiries, etc.)
- Upload CSV file

### 3. Map Columns
- Use dropdown to map to existing fields
- Click **+ (Plus)** to create new fields
- Check **Ignore** to skip columns

### 4. Apply Transformations
- ✅ **Trim** - Always recommended
- 📧 **Lowercase** - For emails
- 🔤 **Uppercase** - For codes
- 📅 **Date Format** - For dates

### 5. Import
Click **Import Data** and wait for results

---

## 🎯 Common Use Cases

### Import Contacts from External CRM
```
Map:
- Full Name → full_name
- Email Address → email
- Mobile → phone
- City → city
Transform:
- Email: Trim + Lowercase
- Phone: Trim
```

### Import Enquiries with Custom Fields
```
1. Map standard fields
2. For new fields, click + button
3. Create custom column:
   - Name: source_campaign
   - Type: Dropdown
   - Options: Facebook, Google, LinkedIn, Email
4. Save as template for future use
```

### Import Appointments from Excel
```
1. Save Excel as CSV
2. Upload to system
3. Map date columns (use Date Format transformation)
4. Map contact reference fields
5. Import
```

---

## ✅ Pre-Import Checklist

- [ ] CSV file is in UTF-8 format
- [ ] Headers are in first row
- [ ] No merged cells or formulas
- [ ] Date format is consistent
- [ ] Email addresses are valid
- [ ] Required fields are present
- [ ] Test with 5-10 rows first

---

## ⚡ Quick Tips

### Creating Columns
- ✅ DO: Use descriptive names
- ✅ DO: Choose correct data type
- ❌ DON'T: Make everything unique
- ❌ DON'T: Use special characters in names

### Using Templates
- Save templates for recurring imports
- Name templates descriptively: "Weekly CRM Export", "Monthly Leads"
- One template per data source

### Handling Errors
- Start with small test file (10-20 rows)
- Download error report
- Fix errors in original CSV
- Re-import only failed rows

---

## 🆘 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Cannot create column | Must be **Super Admin** |
| Data type mismatch | Check sample data, adjust transformations |
| Missing required fields | Map all required columns or set defaults |
| Duplicate in unique field | Remove duplicates or uncheck unique |
| Import timeout | Reduce file size to < 1000 rows |

---

## 🔒 Permissions

| Action | Admin | Super Admin |
|--------|-------|-------------|
| Import data | ✅ | ✅ |
| Create columns | ❌ | ✅ |
| View all imports | ❌ | ✅ |
| Use templates | ✅ | ✅ |
| Create templates | ✅ | ✅ |

---

## 📋 Column Data Types Guide

| Type | Use For | Example |
|------|---------|---------|
| Text | Names, descriptions | "John Doe", "Senior Manager" |
| Number | Counts, quantities | 25, 100, 1500 |
| Decimal | Money, percentages | 99.99, 15.5 |
| Date | Dates | 2026-01-15 |
| Boolean | Yes/No questions | Yes, True, 1 |
| Email | Email addresses | john@example.com |
| Phone | Phone numbers | +1234567890 |
| Dropdown | Single choice | Small, Medium, Large |
| Multi-Select | Multiple choices | [Red, Blue, Green] |

---

## 🔄 Standard Import Workflow

```
1. Prepare CSV file
   ↓
2. Test with sample (10 rows)
   ↓
3. Create/select mapping
   ↓
4. Apply transformations
   ↓
5. Save as template (if reusable)
   ↓
6. Import test data
   ↓
7. Verify in system
   ↓
8. Import full dataset
   ↓
9. Handle errors if any
   ↓
10. Done ✅
```

---

## 💡 Pro Tips

1. **Always use Trim transformation** for text fields
2. **Test with 10-20 rows** before full import
3. **Save successful mappings** as templates
4. **Document custom columns** for team reference
5. **Regular imports?** Use templates for consistency
6. **Large files?** Split into batches of 500-1000 rows
7. **Date issues?** Standardize format in CSV first
8. **Keep error reports** for troubleshooting patterns

---

## 📞 Need Help?

1. Check error message in the UI
2. Download error report
3. Review this guide
4. Check full documentation: `DYNAMIC_COLUMN_MAPPING_GUIDE.md`
5. Contact system administrator with:
   - Screenshot of error
   - Sample CSV (remove sensitive data)
   - Description of what you're trying to do

---

**Remember**: Start small, test first, save templates, handle errors!
