# Dynamic Column Mapping System - User Guide

## Overview

The Dynamic Column Mapping System allows admins to import data from CSV files with complete flexibility. You can map uploaded columns to existing database fields, create new custom columns on-the-fly, apply data transformations, and save mapping templates for reuse.

## Key Features

### 1. **Free Column Mapping**
- No fixed column requirements
- Map any CSV column to any database field
- Create new columns during import
- Support for global columns (available across all forms)

### 2. **On-the-Fly Column Creation**
- Create custom columns without developer intervention
- Choose from multiple data types:
  - Text
  - Number
  - Decimal
  - Date
  - Boolean (Yes/No)
  - Email
  - Phone
  - Dropdown
  - Multi-Select
- Set column properties:
  - Nullable or required
  - Unique values
  - Default values
  - Validation rules

### 3. **Data Transformation Rules**
- **Trim**: Remove leading/trailing spaces
- **Uppercase**: Convert text to uppercase
- **Lowercase**: Convert text to lowercase
- **Date Format**: Standardize date formats
- **Replace**: Find and replace values
- **Ignore**: Skip columns you don't need

### 4. **Mapping Templates**
- Save successful mappings as templates
- Reuse templates for future imports
- Share templates across different imports
- Update existing templates

### 5. **Validation & Error Reporting**
- Pre-import validation
- Row-by-row error detection
- Downloadable error reports
- Partial import support (import valid rows, skip errors)

### 6. **Import Tracking**
- Every import is logged in the database
- Track successful and failed rows
- View import history
- Audit trail for all operations

## How to Use

### Step 1: Access the Import Tool

1. Log in as an **Admin** or **Super Admin**
2. Click **Admin Panel** in the navigation
3. Select **Import Data** from the Data Management ribbon

### Step 2: Select Target Table

Choose which table/form you want to import data into:
- Contacts
- Enquiries
- Appointments
- Admissions
- Fee Payments
- Support Forms
- Student Status

### Step 3: Upload CSV File

1. Click **Choose CSV file**
2. Select your CSV file from your computer
3. Wait for the file to be parsed

The system will automatically:
- Read the CSV headers
- Display sample data
- Attempt to auto-map columns based on matching names

### Step 4: Map Columns

For each uploaded column, you have three options:

#### Option A: Map to Existing Column
1. Use the dropdown to select an existing database field
2. The dropdown shows all available fields for the target table
3. Custom columns are marked with "(Custom)"

#### Option B: Create New Column
1. Click the **+ (Plus)** button next to the dropdown
2. Fill in the column creation form:
   - **Column Name**: Technical name (auto-formatted)
   - **Display Name**: User-friendly name
   - **Data Type**: Select appropriate type
   - **Nullable**: Allow empty values?
   - **Unique**: Require unique values?
   - **Global**: Available in all forms?
3. Click **Create Column**
4. The new column is automatically mapped

#### Option C: Ignore Column
1. Check the **Ignore** box in the Transformations column
2. This column will be skipped during import

### Step 5: Apply Transformations (Optional)

For each mapped column, you can apply transformations:
- **Trim**: Recommended for most text fields
- **Uppercase**: For codes, IDs, etc.
- **Lowercase**: For email addresses
- **Date Format**: For date fields
- **Replace**: Advanced find/replace (configure in code)

### Step 6: Save as Template (Optional)

If you'll import similar files in the future:
1. Check **Save this mapping as a template**
2. Enter a descriptive template name
3. The template will be saved automatically after successful import

### Step 7: Import Data

1. Review your mappings
2. Click **Import Data**
3. Wait for the import to complete

The system will:
- Validate each row
- Apply transformations
- Insert valid rows
- Report errors for invalid rows

### Step 8: Review Results

After import:
- See total rows, successful rows, and failed rows
- Download error report if there are failures
- Check imported data in the respective form

## Creating Custom Columns

### Column Properties Explained

**Column Name**
- Technical database name
- Only letters, numbers, and underscores
- Auto-formatted to lowercase with underscores
- Example: `custom_field_1`, `company_size`

**Display Name**
- Human-readable label shown in forms
- Can include spaces and special characters
- Example: "Company Size", "Annual Revenue"

**Data Type**
- **Text**: Any text, unlimited length
- **Number**: Whole numbers only
- **Decimal**: Numbers with decimal points
- **Date**: Date values (YYYY-MM-DD)
- **Boolean**: Yes/No, True/False
- **Email**: Email addresses (basic validation)
- **Phone**: Phone numbers (stores as text)
- **Dropdown**: Single selection from predefined options
- **Multi-Select**: Multiple selections (stores as array)

**Nullable**
- Checked: Field can be left empty
- Unchecked: Field is required

**Unique**
- Checked: No duplicate values allowed
- Unchecked: Duplicates are allowed

**Global**
- Checked: Column available in all forms
- Unchecked: Column only available in selected table

## Using Mapping Templates

### Creating Templates
1. Complete a successful import
2. Check "Save this mapping as a template"
3. Enter a template name
4. Template is saved after import

### Using Templates
1. Upload your CSV file
2. Select a template from the dropdown
3. Click **Apply**
4. All mappings and transformations are applied
5. Adjust if needed
6. Import

### When to Use Templates
- Regular data imports (weekly, monthly)
- Same data structure from external systems
- Standard CSV formats from partners
- Repetitive import operations

## Error Handling

### Common Errors

**"Missing required fields"**
- Solution: Map all required columns or set default values

**"Data type mismatch"**
- Solution: Check data types, apply transformations, or fix source data

**"Duplicate value in unique column"**
- Solution: Remove duplicates from CSV or uncheck unique constraint

**"Failed to create column"**
- Solution: Check column name, ensure you're super_admin

### Downloading Error Reports
1. After a partial import, click **Download Error Report**
2. CSV file contains:
   - Row number
   - Error description
   - Original data
3. Fix errors in your source file
4. Re-import fixed data

## Best Practices

### Column Creation
- Use descriptive column names
- Choose appropriate data types
- Set nullable=true for optional fields
- Use unique constraint carefully
- Make columns global only when truly needed

### Data Transformation
- Always use **Trim** for text fields
- Use **Date Format** for date fields
- Use **Lowercase** for emails
- Test with small dataset first

### Template Management
- Create templates for recurring imports
- Use descriptive template names
- Update templates when structure changes
- One template per data source/format

### Import Process
1. Start with a small sample file (10-20 rows)
2. Verify mappings and transformations
3. Run test import
4. Check imported data
5. Import full dataset
6. Download and fix errors if any
7. Re-import corrected data

## Security & Permissions

### Who Can Do What

**Super Admin**
- Create new columns
- Modify database schema
- Import data to all tables
- View all import history
- Manage all templates

**Admin**
- Import data to assigned tables
- View own import history
- Use existing templates
- Create templates
- **Cannot** create new columns

**Regular Users**
- No access to import functionality

## Technical Details

### Database Tables

**column_registry**
- Stores all custom column definitions
- Tracks creation date and creator
- Supports soft delete (is_active flag)

**mapping_templates**
- Stores reusable mapping configurations
- Includes transformation rules
- Versioned (updated_at timestamp)

**schema_change_log**
- Audit log for schema modifications
- Tracks success and failures
- Records who made changes

**import_sessions**
- Logs every import operation
- Tracks row counts and errors
- Links to user who imported

### Edge Functions

**dynamic-schema-manager**
- Handles column creation
- Executes ALTER TABLE statements
- Updates column registry
- Logs schema changes

**bulk-import-data**
- Processes CSV data
- Applies transformations
- Validates rows
- Performs bulk inserts
- Tracks import sessions

## Troubleshooting

### Import Not Working
1. Check you're logged in as admin/super_admin
2. Verify CSV file format (UTF-8, comma-separated)
3. Check browser console for errors
4. Try smaller file (< 1000 rows)

### Cannot Create Columns
1. Verify you're super_admin (not just admin)
2. Check column name format (no special chars)
3. Ensure column doesn't already exist
4. Check browser console for errors

### Template Not Saving
1. Ensure "Save as template" is checked
2. Enter template name before import
3. Wait for import to complete
4. Check in dropdown after page refresh

### Data Not Appearing After Import
1. Check import result (successful rows count)
2. Verify you're viewing correct form/table
3. Check filters aren't hiding data
4. Refresh the page

## Examples

### Example 1: Importing Contacts with Custom Field

**Scenario**: Import contacts with a "Company Size" field that doesn't exist

**CSV**:
```
Name,Email,Phone,Company Size
John Doe,john@example.com,1234567890,50-100
Jane Smith,jane@example.com,0987654321,101-500
```

**Steps**:
1. Select target: **Contacts**
2. Upload CSV
3. Map columns:
   - Name → full_name
   - Email → email
   - Phone → phone
   - Company Size → *Create New Column*
4. Create column:
   - Column Name: company_size
   - Display Name: Company Size
   - Data Type: Dropdown
   - Options: 1-50, 51-100, 101-500, 500+
5. Apply transformations:
   - Email: Trim, Lowercase
   - Phone: Trim
6. Save as template: "Contact Import with Company Size"
7. Import

### Example 2: Using Templates for Monthly Enquiries

**Scenario**: Import monthly enquiry reports from external CRM

**Steps**:
1. First time: Create mappings and save as template
2. Subsequent imports:
   - Select target: **Enquiries**
   - Upload monthly CSV
   - Select template: "Monthly CRM Export"
   - Click Apply
   - Click Import

### Example 3: Handling Errors

**Scenario**: Import fails for some rows

**Steps**:
1. Note successful and failed row counts
2. Click **Download Error Report**
3. Open error CSV
4. Fix errors in original CSV
5. Create new CSV with only fixed rows
6. Re-import fixed data

## FAQ

**Q: What's the maximum file size?**
A: Recommended maximum is 5,000 rows. For larger datasets, split into multiple files.

**Q: Can I delete custom columns?**
A: Not through the UI. Contact super admin to remove columns from database.

**Q: Are transformations permanent?**
A: Yes, transformations are applied before saving to database.

**Q: Can regular users see custom columns?**
A: Yes, once created, custom columns appear in all forms like standard fields.

**Q: What happens to old data when I create a column?**
A: Existing rows get NULL value (or default value if specified).

**Q: Can I import without mapping all columns?**
A: Yes, mark unused columns as "Ignore".

**Q: Is there an undo for imports?**
A: No automatic undo. You'll need to manually delete imported records.

**Q: Can I update existing records?**
A: No, this tool only inserts new records. For updates, export, modify, and contact admin.

## Support

For technical support or feature requests:
1. Document the issue with screenshots
2. Include CSV sample (remove sensitive data)
3. Note exact error messages
4. Contact system administrator

---

**Version**: 1.0
**Last Updated**: January 2026
**System**: Mirror ERP-CRM
