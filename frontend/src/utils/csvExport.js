export const exportToCSV = (data, filename = 'export.csv', columns = null) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Get column headers
  const headers = columns || Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        let value = row[header];
        
        // Handle nested objects
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
        
        // Escape commas and quotes
        if (value === null || value === undefined) {
          value = '';
        } else {
          value = String(value);
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
        }
        
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatStudentsForCSV = (students) => {
  return students.map(student => ({
    'Name': student.full_name,
    'Email': student.email,
    'Phone': student.phone,
    'School': student.school_name,
    'Class 10 %': student.class_10_percentage,
    'DOB': student.date_of_birth,
    'Address': student.address,
    'Status': student.verification_status,
    'Sponsored': student.is_sponsored ? 'Yes' : 'No',
    'Registration Date': new Date(student.created_at).toLocaleDateString()
  }));
};

export const formatProgressReportsForCSV = (reports, studentName) => {
  return reports.map(report => ({
    'Student': studentName,
    'Month': report.report_month,
    'Attendance %': report.attendance_percentage,
    'Test Scores': JSON.stringify(report.test_scores),
    'Comments': report.report_text,
    'Date': new Date(report.created_at).toLocaleDateString()
  }));
};
