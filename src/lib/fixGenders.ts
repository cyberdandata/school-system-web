import dataManager from './db';

const maleNames = new Set([
  'john', 'david', 'michael', 'james', 'robert', 'william', 'joseph', 'charles', 'thomas', 'christopher', 'daniel', 'paul', 'mark', 'donald', 'george', 'kenneth', 'steven', 'edward', 'brian', 'ronald', 'anthony', 'kevin', 'jason', 'matthew', 'gary', 'timothy', 'jose', 'larry', 'jeffrey', 'frank', 'scott', 'eric', 'stephen', 'andrew', 'raymond', 'gregory', 'joshua', 'jerry', 'dennis', 'walter', 'patrick', 'peter', 'harold', 'douglas', 'henry', 'carl', 'arthur', 'ryan', 'roger', 'joe', 'juan', 'jack', 'albert', 'jonathan', 'justin', 'terry', 'gerald', 'keith', 'samuel', 'ralph', 'lawrence', 'nicholas', 'roy', 'benjamin', 'bruce', 'brandon', 'adam', 'harry', 'fred', 'wayne', 'billy', 'steve', 'louis', 'jeremy', 'aaron', 'randy', 'howard', 'eugene', 'carlos', 'russell', 'bobby', 'victor', 'martin', 'ernest', 'phillip', 'todd', 'jesse', 'craig', 'alan', 'shawn', 'clarence', 'sean', 'philip', 'chris', 'johnny', 'earl', 'jimmy', 'antonio',
  'isaac', 'lukas', 'luke', 'simon', 'peter', 'matthias', 'andrew', 'philip', 'bartholomew', 'matthew', 'thomas', 'james', 'thaddaeus', 'judas', 'paul', 'silas', 'timothy', 'titus', 'philemon', 'barnabas', 'mark', 'luke', 'stephen', 'philip', 'prochorus', 'nicanor', 'timon', 'parmenas', 'nicolaus', 'agabus', 'judas', 'barsabbas', 'silas', 'aquila', 'apollos', 'tychicus', 'epaphroditus', 'epaphras', 'aristarchus', 'demas', 'crescens', 'carpus', 'trophimus', 'artemas', 'zenas', 'apollo',
  'allan', 'alex', 'alexander', 'arnold', 'amos', 'alfred', 'alvin', 'ben', 'benedict', 'benard', 'brian', 'bruce', 'caleb', 'calvin', 'charles', 'chris', 'christian', 'christopher', 'clifford', 'colin', 'conrad', 'craig', 'dan', 'daniel', 'danny', 'darren', 'david', 'denis', 'dennis', 'derrick', 'davis', 'dickson', 'donald', 'douglas', 'duncan', 'edgar', 'edison', 'edmund', 'edward', 'edwin', 'elias', 'elijah', 'elisha', 'emmanuel', 'enoch', 'eric', 'ernest', 'ethan', 'eugene', 'ezra', 'felix', 'festus', 'frank', 'fred', 'fredrick', 'gabriel', 'george', 'gerald', 'gideon', 'gilbert', 'godfrey', 'gordon', 'gregory', 'hannington', 'harold', 'harry', 'hassan', 'henry', 'herbert', 'hilary', 'hosea', 'howard', 'hugo', 'ian', 'isaac', 'israel', 'ivan', 'jack', 'jackson', 'jacob', 'james', 'jason', 'jeff', 'jeffrey', 'jeremiah', 'jeremy', 'jesse', 'joel', 'john', 'johnson', 'jonah', 'jonathan', 'joseph', 'joshua', 'josiah', 'judas', 'julius', 'justin', 'kenneth', 'kevin', 'lawrence', 'leonard', 'levi', 'lewis', 'livingstone', 'lucas', 'luke', 'mark', 'martin', 'matthew', 'michael', 'morgan', 'morris', 'moses', 'nathan', 'nathaniel', 'nelson', 'nicholas', 'noah', 'norman', 'oliver', 'oscar', 'owen', 'patrick', 'paul', 'peter', 'philemon', 'philip', 'prince', 'raymond', 'richard', 'robert', 'rodney', 'roger', 'roland', 'ronald', 'roy', 'ruben', 'russell', 'ryan', 'sam', 'samson', 'samuel', 'saul', 'scott', 'sean', 'seth', 'shadrach', 'shawn', 'silas', 'simeon', 'simon', 'solomon', 'stanley', 'stephen', 'steven', 'sylvester', 'timothy', 'titus', 'tom', 'tony', 'trevor', 'victor', 'vincent', 'walter', 'warren', 'william', 'winston', 'yusuf', 'zachariah', 'zachary', 'zack', 'zion', 'brave', 'gift', 'blessing'
]);

const femaleNames = new Set([
  'mary', 'patricia', 'linda', 'barbara', 'elizabeth', 'jennifer', 'maria', 'susan', 'margaret', 'dorothy', 'lisa', 'nancy', 'karen', 'betty', 'helen', 'sandra', 'donna', 'carol', 'ruth', 'sharon', 'michelle', 'laura', 'sarah', 'kimberly', 'deborah', 'jessica', 'shirley', 'cynthia', 'angela', 'melissa', 'brenda', 'amy', 'anna', 'rebecca', 'virginia', 'kathleen', 'pamela', 'martha', 'debra', 'amanda', 'stephanie', 'carolyn', 'christine', 'marie', 'janet', 'catherine', 'frances', 'ann', 'joyce', 'diane', 'alice', 'julie', 'heather', 'teresa', 'doris', 'gloria', 'evelyn', 'jean', 'cheryl', 'mildred', 'katherine', 'joan', 'ashley', 'judith', 'rose', 'janice', 'kelly', 'nicole', 'judy', 'christina', 'kathy', 'theresa', 'beverly', 'denise', 'tammy', 'irene', 'jane', 'lori', 'rachel', 'marilyn', 'andrea', 'kathryn', 'louise', 'sara', 'anne', 'jacqueline', 'wanda', 'bonnie', 'julia', 'ruby', 'lois', 'tina', 'phyllis', 'norma', 'paula', 'diana', 'annie', 'lillian', 'emily', 'robin',
  'abigail', 'agatha', 'agnes', 'alice', 'alicia', 'amanda', 'amelia', 'anita', 'ann', 'anna', 'anne', 'annet', 'annette', 'audrey', 'barbara', 'beatrice', 'bella', 'bernadette', 'bernice', 'bertha', 'betty', 'brenda', 'bridget', 'carol', 'caroline', 'catherine', 'charity', 'charlotte', 'chloe', 'christine', 'claire', 'clara', 'cynthia', 'daisy', 'daphne', 'deborah', 'diana', 'diane', 'dina', 'doreen', 'doris', 'dorothy', 'edith', 'edna', 'eleanor', 'elizabeth', 'ella', 'ellen', 'emily', 'emma', 'enid', 'esther', 'eunice', 'eva', 'evelyn', 'faith', 'fiona', 'flavia', 'florence', 'frances', 'freda', 'gloria', 'grace', 'hannah', 'harriet', 'hazel', 'helen', 'hellen', 'hilda', 'hope', 'ida', 'immaculate', 'irene', 'isabel', 'isabella', 'ivy', 'jacqueline', 'jane', 'janet', 'jean', 'jemimah', 'jennifer', 'jessica', 'joan', 'joanita', 'josephine', 'joy', 'joyce', 'judith', 'judy', 'julia', 'juliana', 'juliet', 'justine', 'karen', 'kate', 'katherine', 'kathryn', 'kelly', 'keziah', 'laura', 'leah', 'lilian', 'lillian', 'lilly', 'lily', 'linda', 'lisa', 'lois', 'lucy', 'lydia', 'lynnet', 'lynnette', 'mabel', 'madgalene', 'magdalene', 'margaret', 'maria', 'mariam', 'martha', 'mary', 'maureen', 'mercy', 'mildred', 'miriam', 'monica', 'naomi', 'natalie', 'nelly', 'nicole', 'nina', 'nora', 'norah', 'olivia', 'pamela', 'patricia', 'pauline', 'peace', 'peninah', 'phoebe', 'phyllis', 'priscilla', 'prossy', 'rachel', 'rebecca', 'rhoda', 'rita', 'robina', 'robinah', 'rose', 'rosemary', 'ruth', 'salome', 'samuel', 'sandie', 'sandra', 'sarah', 'sharon', 'sheila', 'shirley', 'silvia', 'sophia', 'sophie', 'stella', 'susan', 'suzanne', 'sylvia', 'tabitha', 'teresa', 'tracy', 'victoria', 'viola', 'virginia', 'vivian', 'winnie', 'winifred', 'yvonne', 'zainab', 'zillah', 'zipporah'
]);

export function fixLearnerGenders() {
  const data = dataManager.getData();
  const learners = data.learners;
  let updatedCount = 0;

  const newLearners = learners.map(learner => {
    // English name is usually the first or last name.
    // We will check all parts of the name. If one matches a male name and no female names, we make it male.
    // If one matches female name, we make it female.
    // If there's a conflict, we skip or use the first matching one.
    
    if (!learner.name) return learner;
    
    const parts = learner.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
    
    let isMale = false;
    let isFemale = false;
    
    for (const part of parts) {
      if (maleNames.has(part)) isMale = true;
      if (femaleNames.has(part)) isFemale = true;
    }
    
    let guessedSex = learner.sex;
    
    if (isMale && !isFemale) {
      guessedSex = 'Male';
    } else if (isFemale && !isMale) {
      guessedSex = 'Female';
    }
    
    if (guessedSex !== learner.sex) {
      updatedCount++;
      return { ...learner, sex: guessedSex };
    }
    
    return learner;
  });

  if (updatedCount > 0) {
    dataManager.setData({ ...dataManager.getData(), learners: newLearners });
    console.log(`Updated genders for ${updatedCount} learners based on English names.`);
    return updatedCount;
  }
  
  return 0;
}
