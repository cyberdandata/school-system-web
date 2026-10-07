const fs = require('fs');
const xlsx = require('xlsx');

const DB_PATH = './extracted_updates.json';
const updates = {
  finances: [],
  teachers: [],
  nonTeachingStaff: [],
  learnerUpdates: []
};

const generateId = (prefix) => prefix + '-' + Math.random().toString(36).substr(2, 9);
const generateDate = () => new Date().toISOString();

// 1. STAFF LIST
console.log('Extracting STAFF LIST.xlsx...');
try {
  const staffWorkbook = xlsx.readFile('external excel files/STAFF LIST.xlsx');
  const staffSheet = staffWorkbook.Sheets['Sheet1'];
  if (staffSheet) {
    const staffData = xlsx.utils.sheet_to_json(staffSheet);
    staffData.forEach(row => {
      if (!row['NAME']) return;
      const name = row['NAME'];
      const designation = row['DESIGNATION'] || '';
      const phone = row['CONTACT 1'] || row['CONTACT 2'] || '';
      
      if (designation.toLowerCase().includes('teacher') || designation.toLowerCase().includes('master') || designation.toLowerCase().includes('headteacher')) {
        updates.teachers.push({
          id: generateId('tchr'),
          name,
          initials: name.substring(0, 2).toUpperCase(),
          phone: String(phone),
          specialization: designation,
          status: 'Active'
        });
      } else {
        updates.nonTeachingStaff.push({
          id: generateId('ntsf'),
          name,
          department: designation,
          phone: String(phone),
          status: 'Active'
        });
      }
    });
  }
} catch(e) {
  console.error('Error with STAFF LIST.xlsx', e.message);
}

// 2. INCOME 2026
console.log('Extracting income 2026.xlsx...');
try {
  const incomeWorkbook = xlsx.readFile('external excel files/income 2026.xlsx');
  const incomeSheet = incomeWorkbook.Sheets['Sheet1'];
  if (incomeSheet) {
    const incomeData = xlsx.utils.sheet_to_json(incomeSheet);
    incomeData.forEach(row => {
      const item = row['ITEM'];
      const received = row['AMOUNT RECEIVED'];
      const spent = row['AMOUNT SPENT'];
      
      let dateStr = generateDate();
      if (row['DATE']) {
        const d = new Date(row['DATE']);
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString();
        }
      }
      
      if (item) {
        if (received && received > 0) {
          updates.finances.push({
            id: generateId('fin-inc'),
            date: dateStr,
            type: 'income',
            category: 'Other Income',
            amount: parseFloat(received),
            description: `Income: ${item}`,
            recordedBy: 'System Import',
            paymentMethod: 'Cash'
          });
        }
        if (spent && spent > 0) {
          updates.finances.push({
            id: generateId('fin-exp'),
            date: dateStr,
            type: 'expense',
            category: 'Other',
            amount: parseFloat(spent),
            description: `Expense: ${item}`,
            recordedBy: 'System Import',
            paymentMethod: 'Cash'
          });
        }
      }
    });
  }
} catch(e) {
  console.error('Error with income 2026.xlsx', e.message);
}

// 3. SCHOOL FEES (Term Two Fees)
console.log('Extracting SCHOOL FEES.xlsx...');
try {
  const feesWorkbook = xlsx.readFile('external excel files/SCHOOL FEES.xlsx');
  const feesSheet = feesWorkbook.Sheets['term two fees'];
  if (feesSheet) {
    const feesData = xlsx.utils.sheet_to_json(feesSheet);
    feesData.forEach(row => {
      const firstName = row['First Name'] || '';
      const lastName = row['Last Name'] || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const paid = row['amount paid'];
      const balance = row[' balance '];
      const outstanding = row[' outstanding '];
      
      if (fullName) {
        let currentBalance = outstanding || balance || 0;
        
        updates.learnerUpdates.push({
          fullName,
          firstName,
          lastName,
          outstandingBalance: String(currentBalance)
        });
        
        if (paid && paid > 0) {
          updates.finances.push({
            id: generateId('fin-fee'),
            date: generateDate(),
            type: 'income',
            category: 'Tuition Fees',
            amount: parseFloat(paid),
            // studentId will be mapped in the browser where the full db is
            studentNameMatch: fullName, 
            description: `Term Two Fees for ${fullName}`,
            recordedBy: 'System Import',
            paymentMethod: 'Bank Transfer'
          });
        }
      }
    });
  }
} catch (e) {
  console.error('Error with SCHOOL FEES.xlsx', e.message);
}

fs.writeFileSync(DB_PATH, JSON.stringify(updates, null, 2));
console.log('Updates extracted to extracted_updates.json successfully.');
