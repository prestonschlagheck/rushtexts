export interface PhoneRecord {
  phone: string;
  name?: string;
}

export function parsePhoneNumbers(input: string): PhoneRecord[] {
  const lines = input.trim().split('\n').filter(line => line.trim());
  
  // Check if it looks like CSV (has commas or quotes)
  const hasCommas = lines.some(line => line.includes(','));
  const hasQuotes = lines.some(line => line.includes('"'));
  
  if (hasCommas || hasQuotes) {
    return parseCSV(input);
  } else {
    // Simple newline-separated format
    return lines.map(line => ({
      phone: normalizePhoneNumber(line.trim()),
    })).filter(record => record.phone);
  }
}

function parseCSV(csvData: string): PhoneRecord[] {
  const lines = csvData.trim().split('\n');
  if (lines.length === 0) return [];
  
  // Simple CSV parser (handles basic cases)
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('number'));
  const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('first'));
  
  if (phoneIndex === -1) {
    // No header, treat first column as phone
    return lines.map(line => {
      const columns = parseCSVLine(line);
      return {
        phone: normalizePhoneNumber(columns[0] || ''),
        name: columns[1] || undefined,
      };
    }).filter(record => record.phone);
  }
  
  return lines.slice(1).map(line => {
    const columns = parseCSVLine(line);
    return {
      phone: normalizePhoneNumber(columns[phoneIndex] || ''),
      name: nameIndex >= 0 ? columns[nameIndex] : undefined,
    };
  }).filter(record => record.phone);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add +1 if it's a 10-digit US number
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // Add + if it's missing but we have 11+ digits
  if (digits.length >= 11 && !phone.startsWith('+')) {
    return `+${digits}`;
  }
  
  // Return as-is if it already has + or if it's invalid
  return phone.startsWith('+') ? phone : (digits.length >= 11 ? `+${digits}` : '');
}

export function isValidPhoneNumber(phone: string): boolean {
  // Basic E.164 validation
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

export function personalizeMessage(template: string, name?: string): string {
  if (!name) return template;
  return template.replace(/\{\{name\}\}/gi, name);
}

export function validatePhoneRecords(records: PhoneRecord[]): {
  valid: PhoneRecord[];
  invalid: Array<{ record: PhoneRecord; reason: string }>;
} {
  const valid: PhoneRecord[] = [];
  const invalid: Array<{ record: PhoneRecord; reason: string }> = [];
  
  for (const record of records) {
    if (!record.phone) {
      invalid.push({ record, reason: 'Empty phone number' });
    } else if (!isValidPhoneNumber(record.phone)) {
      invalid.push({ record, reason: 'Invalid phone number format' });
    } else {
      valid.push(record);
    }
  }
  
  return { valid, invalid };
}
