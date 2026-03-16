const axios = require('axios');
const path = require('path');

// Базовый URL приложения (подставьте ваш URL)
const BASE_URL = 'http://localhost:5173'; // Для локальной разработки
// const BASE_URL = 'http://62.171.162.59:3001'; // Для сервера

// Читаем synths.ts чтобы получить список ID
const fs = require('fs');
const synthsFile = path.join(__dirname, '../src/lib/data/synths.ts');
const content = fs.readFileSync(synthsFile, 'utf8');

// Извлекаем ID синтов
const idRegex = /id:\s*'([^']+)'/g;
const ids = [];
let match;
while ((match = idRegex.exec(content)) !== null) {
    ids.push(match[1]);
}

console.log(`Найдено ${ids.length} синтов`);

// Функция для открытия страницы синта (что вызовет кэширование фото)
async function prefetchSynth(synthId) {
    try {
        // Формируем URL как в приложении
        // ID вида 'casio-sk-sk-1' -> /synths/casio/sk/sk-1
        const parts = synthId.split('-');
        const brand = parts[0];
        const series = parts.slice(1, -1).join('-');
        const model = parts[parts.length - 1];
        
        const url = `${BASE_URL}/synths/${brand}/${series}/${model}`;
        
        console.log(`Prefetching: ${synthId} -> ${url}`);
        
        // Открываем страницу (это вызовет загрузку фото и кэширование)
        await axios.get(url, { timeout: 10000 });
        
        return true;
    } catch (error) {
        console.error(`Error prefetching ${synthId}:`, error.message);
        return false;
    }
}

// Основная функция
async function main() {
    console.log('🚀 Запуск предварительного кэширования фото...\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < ids.length; i++) {
        const synthId = ids[i];
        console.log(`\n[${i + 1}/${ids.length}] Обработка: ${synthId}`);
        
        const success = await prefetchSynth(synthId);
        if (success) {
            successCount++;
        } else {
            errorCount++;
        }
        
        // Небольшая задержка чтобы не перегружать сервер
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ Готово! Успешно: ${successCount}, Ошибок: ${errorCount}`);
    console.log('Теперь фото кэшированы на сервере');
}

main().catch(console.error);
