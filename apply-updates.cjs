const fs = require('fs');

const dbPath = './school_database.json';
const updatesPath = './public/extracted_updates.json';

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const updates = JSON.parse(fs.readFileSync(updatesPath, 'utf8'));

if (updates.learnerUpdates && db.learners) {
  let updatedCount = 0;
  db.learners = db.learners.map(l => {
    const update = updates.learnerUpdates.find((u) => {
      if (!u.fullName) return false;
      const dbName = l.name.toLowerCase();
      const uName = u.fullName.toLowerCase();
      
      const matchFull = dbName === uName;
      const matchFirst = u.firstName && u.firstName.trim() !== '' && dbName.includes(u.firstName.toLowerCase());
      const matchLast = u.lastName && u.lastName.trim() !== '' && dbName.includes(u.lastName.toLowerCase());
      
      return matchFull || (matchFirst && matchLast);
    });
    
    if (update && update.outstandingBalance) {
      updatedCount++;
      return { ...l, outstandingBalance: update.outstandingBalance };
    }
    return l;
  });
  console.log(`Applied outstanding balance to ${updatedCount} learners.`);
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Successfully updated school_database.json with arrears.');
