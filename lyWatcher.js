const fs = require('fs');
const { spawn } = require('child_process');
const debounce = require('debounce');

fs.watch('phrases/ly', debounce((eventType, filename) => {
  if (filename.match(/(\d+)\.ly$/)){
    console.log(`Regenerating file: ${filename}`);

    const ly = spawn('./build-ly.sh', [`phrases/ly/${filename}`]);
    ly.stdout.on('data', data => console.log(`${data.toString('utf8').trim()}`));
    ly.stderr.on('data', data => console.error(`${data.toString('utf8').trim()}`));
    ly.on('close', code => console.log(`Lilypond exited with code ${code}`));
  }
}, 250));
