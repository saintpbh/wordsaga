
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/allLevels.ts');

try {
    const content = fs.readFileSync(filePath, 'utf8');

    const exampleCount = (content.match(/Example sentence using/g) || []).length;
    const wrong1Count = (content.match(/Wrong 1/g) || []).length;
    const translationPendingCount = (content.match(/Translation pending/g) || []).length;
    // Case insensitive TBD for meaning
    const tbdMeaningCount = (content.match(/"meaning":\s*"TBD"/gi) || []).length;
    const emptyMeaningCount = (content.match(/"meaning":\s*""/g) || []).length;

    console.log('--- Data Quality Report ---');
    console.log(`Total "Example sentence using" occurrences: ${exampleCount}`);
    console.log(`Total "Wrong 1" occurrences: ${wrong1Count}`);
    console.log(`Total "Translation pending" occurrences: ${translationPendingCount}`);
    console.log(`Total "meaning": "TBD" occurrences: ${tbdMeaningCount}`);
    console.log(`Total "meaning": "" occurrences: ${emptyMeaningCount}`);

} catch (err) {
    console.error('Error reading file:', err);
}
