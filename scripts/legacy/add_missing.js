const fs = require('fs');

// Read synths.ts
let content = fs.readFileSync('src/lib/data/synths.ts', 'utf8');

// Find the position to insert new models
const lastCloseBrace = content.lastIndexOf('},');
const insertPos = content.indexOf('];', lastCloseBrace);

// Complete list of missing models
const newModels = [
  // VSS Series
  {id: 'yamaha-vss-vss-100', brand: 'Yamaha', series: 'VSS (Sampling Synthesizer)', modelName: 'VSS-100', year: 1989, formFactor: 'mini', keysCount: 32, synthEngine: 'семплер', description: 'Расширенная версия VSS-30.', isGem: false, images: ['https://example.com/vss-100-1.jpg']},
  {id: 'yamaha-vss-vss-200', brand: 'Yamaha', series: 'VSS (Sampling Synthesizer)', modelName: 'VSS-200', year: 1990, formFactor: 'mini', keysCount: 32, synthEngine: 'семплер', description: 'Компактный семплер.', isGem: false, images: ['https://example.com/vss-200-1.jpg']},
  {id: 'yamaha-vss-vss-300', brand: 'Yamaha', series: 'VSS (Sampling Synthesizer)', modelName: 'VSS-300', year: 1991, formFactor: 'mini', keysCount: 32, synthEngine: 'семплер', description: 'Семплер с улучшенным качеством.', isGem: false, images: ['https://example.com/vss-300-1.jpg']},
  {id: 'yamaha-vss-vss-400', brand: 'Yamaha', series: 'VSS (Sampling Synthesizer)', modelName: 'VSS-400', year: 1992, formFactor: 'mini', keysCount: 32, synthEngine: 'семплер', description: 'Продвинутый семплер.', isGem: false, images: ['https://example.com/vss-400-1.jpg']},
  {id: 'yamaha-vss-vss-450', brand: 'Yamaha', series: 'VSS (Sampling Synthesizer)', modelName: 'VSS-450', year: 1993, formFactor: 'mini', keysCount: 32, synthEngine: 'семплер', description: 'Топовая модель VSS series.', isGem: false, images: ['https://example.com/vss-450-1.jpg']},
  
  // SU Series
  {id: 'yamaha-su-su-200', brand: 'Yamaha', series: 'SU (Sampling Unit)', modelName: 'SU-200', year: 1992, formFactor: 'mini', keysCount: 25, synthEngine: 'семплер', description: 'Сэмплер с расширенными функциями.', isGem: false, images: ['https://example.com/su-200-1.jpg']},
  {id: 'yamaha-su-su-700', brand: 'Yamaha', series: 'SU (Sampling Unit)', modelName: 'SU-700', year: 1995, formFactor: 'mini', keysCount: 25, synthEngine: 'семплер', description: 'Продвинутый сэмплер.', isGem: true, images: ['https://example.com/su-700-1.jpg']},
  
  // SHS Series
  {id: 'yamaha-shs-shs-200', brand: 'Yamaha', series: 'SHS (Headset Synthesizer)', modelName: 'SHS-200', year: 1988, formFactor: 'mini', keysCount: 25, synthEngine: 'FM (2-операторный)', description: 'Улучшенная версия SHS-10.', isGem: false, images: ['https://example.com/shs-200-1.jpg']},
  {id: 'yamaha-shs-shs-300', brand: 'Yamaha', series: 'SHS (Headset Synthesizer)', modelName: 'SHS-300', year: 1989, formFactor: 'mini', keysCount: 25, synthEngine: 'FM (2-операторный)', description: 'Компактный наушный синтезатор.', isGem: false, images: ['https://example.com/shs-300-1.jpg']},
  {id: 'yamaha-shs-shs-500', brand: 'Yamaha', series: 'SHS (Headset Synthesizer)', modelName: 'SHS-500', year: 1990, formFactor: 'mini', keysCount: 25, synthEngine: 'FM (2-операторный)', description: 'Топовая модель SHS series.', isGem: false, images: ['https://example.com/shs-500-1.jpg']},
  
  // Reface Series
  {id: 'yamaha-reface-reface-cs', brand: 'Yamaha', series: 'Reface', modelName: 'Reface CS', year: 2015, formFactor: 'mini', keysCount: 37, synthEngine: 'аналоговый', description: 'Компактный синтезатор с аналоговым звуком.', isGem: true, images: ['https://example.com/reface-cs-1.jpg']},
  {id: 'yamaha-reface-reface-dx', brand: 'Yamaha', series: 'Reface', modelName: 'Reface DX', year: 2015, formFactor: 'mini', keysCount: 37, synthEngine: 'FM (4-операторный)', description: 'Компактный FM-синтезатор.', isGem: true, images: ['https://example.com/reface-dx-1.jpg']},
  {id: 'yamaha-reface-reface-yc', brand: 'Yamaha', series: 'Reface', modelName: 'Reface YC', year: 2015, formFactor: 'mini', keysCount: 37, synthEngine: 'орган', description: 'Компактный орган.', isGem: false, images: ['https://example.com/reface-yc-1.jpg']},
  {id: 'yamaha-reface-reface-cp', brand: 'Yamaha', series: 'Reface', modelName: 'Reface CP', year: 2015, formFactor: 'mini', keysCount: 37, synthEngine: 'электропиано', description: 'Компактное электропиано.', isGem: false, images: ['https://example.com/reface-cp-1.jpg']},
  
  // Drum Machines
  {id: 'yamaha-drum-mr-10', brand: 'Yamaha', series: 'Drum Machines', modelName: 'MR-10', year: 1983, formFactor: 'mini', keysCount: 16, synthEngine: 'аналоговый ударные', description: 'Ранний драм-машин Yamaha.', isGem: false, images: ['https://example.com/mr-10-1.jpg']},
  {id: 'yamaha-drum-rx-11', brand: 'Yamaha', series: 'Drum Machines', modelName: 'RX-11', year: 1984, formFactor: 'mini', keysCount: 16, synthEngine: 'цифровой ударные', description: 'Цифровой драм-машин.', isGem: false, images: ['https://example.com/rx-11-1.jpg']},
  {id: 'yamaha-drum-rx-15', brand: 'Yamaha', series: 'Drum Machines', modelName: 'RX-15', year: 1985, formFactor: 'mini', keysCount: 16, synthEngine: 'цифровой ударные', description: 'Драм-машин с расширенными ритмами.', isGem: false, images: ['https://example.com/rx-15-1.jpg']},
  {id: 'yamaha-drum-rx-17', brand: 'Yamaha', series: 'Drum Machines', modelName: 'RX-17', year: 1986, formFactor: 'mini', keysCount: 16, synthEngine: 'цифровой ударные', description: 'Улучшенная версия RX-15.', isGem: false, images: ['https://example.com/rx-17-1.jpg']},
  {id: 'yamaha-drum-rx-21', brand: 'Yamaha', series: 'Drum Machines', modelName: 'RX-21', year: 1986, formFactor: 'mini', keysCount: 16, synthEngine: 'цифровой ударные', description: 'Профессиональный драм-машин.', isGem: false, images: ['https://example.com/rx-21-1.jpg']},
  {id: 'yamaha-drum-rx-5', brand: 'Yamaha', series: 'Drum Machines', modelName: 'RX-5', year: 1986, formFactor: 'mini', keysCount: 16, synthEngine: 'цифровой ударные', description: 'Популярная драм-машин.', isGem: true, images: ['https://example.com/rx-5-1.jpg']},
  {id: 'yamaha-drum-ry-8', brand: 'Yamaha', series: 'Drum Machines', modelName: 'RY-8', year: 1988, formFactor: 'mini', keysCount: 16, synthEngine: 'цифровой ударные', description: 'Драм-машин с улучшенным интерфейсом.', isGem: false, images: ['https://example.com/ry-8-1.jpg']},
  
  // QY Series
  {id: 'yamaha-qy-qy-10', brand: 'Yamaha', series: 'QY (Sequencer)', modelName: 'QY-10', year: 1990, formFactor: 'mini', keysCount: 25, synthEngine: 'PCM', description: 'Компактный секвенсор.', isGem: false, images: ['https://example.com/qy-10-1.jpg']},
  {id: 'yamaha-qy-qy-20', brand: 'Yamaha', series: 'QY (Sequencer)', modelName: 'QY-20', year: 1991, formFactor: 'mini', keysCount: 25, synthEngine: 'PCM', description: 'Улучшенная версия QY-10.', isGem: false, images: ['https://example.com/qy-20-1.jpg']},
  {id: 'yamaha-qy-qy-22', brand: 'Yamaha', series: 'QY (Sequencer)', modelName: 'QY-22', year: 1992, formFactor: 'mini', keysCount: 25, synthEngine: 'PCM', description: 'Секвенсор с улучшенным качеством.', isGem: false, images: ['https://example.com/qy-22-1.jpg']},
  {id: 'yamaha-qy-qy-70', brand: 'Yamaha', series: 'QY (Sequencer)', modelName: 'QY-70', year: 1995, formFactor: 'mini', keysCount: 25, synthEngine: 'PCM', description: 'Продвинутый секвенсор.', isGem: false, images: ['https://example.com/qy-70-1.jpg']},
  {id: 'yamaha-qy-qy-100', brand: 'Yamaha', series: 'QY (Sequencer)', modelName: 'QY-100', year: 1998, formFactor: 'mini', keysCount: 25, synthEngine: 'PCM', description: 'Топовая модель QY series.', isGem: false, images: ['https://example.com/qy-100-1.jpg']}
];

// Generate model strings
const modelStrings = newModels.map(m => `  {
    id: '${m.id}',
    brand: '${m.brand}',
    series: '${m.series}',
    modelName: '${m.modelName}',
    year: ${m.year},
    formFactor: '${m.formFactor}',
    keysCount: ${m.keysCount},
    synthEngine: '${m.synthEngine}',
    description: '${m.description}',
    isGem: ${m.isGem},
    images: ['${m.images[0]}'],
  },`).join('\n');

// Insert before the closing bracket
content = content.substring(0, insertPos) + '\n' + modelStrings + '\n' + content.substring(insertPos);

// Write updated content
fs.writeFileSync('src/lib/data/synths.ts', content);
console.log(`Added ${newModels.length} new models to synths.ts`);