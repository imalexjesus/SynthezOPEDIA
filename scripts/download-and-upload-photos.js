const fs = require('fs');
const path = require('path');

// --- НАСТРОЙКИ ---
const IMAGES_DIR = path.join(__dirname, '../static/images');
const SYNTHS_FILE = path.join(__dirname, '../src/lib/data/synths.ts');

console.log('Download Config:');
console.log('  Images directory:', IMAGES_DIR);
console.log('  Synths file:', SYNTHS_FILE);

// Создаем папку для фото, если её нет
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log('✅ Создана папка для фото');
}

// Временная папка для скачанных фото
const TEMP_DIR = path.join(__dirname, 'temp_photos');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Функция для чтения синтов из файла (упрощенный парсинг)
function readSynthsFromFile() {
    const content = fs.readFileSync(SYNTHS_FILE, 'utf8');
    const synths = [];
    
    // Простой парсинг массива объектов (может потребоваться доработка под формат файла)
    // Ищем блоки вида { id: '...', images: [...] }
    const regex = /id:\s*'([^']+)'[\s\S]*?images:\s*\[([^\]]+)\]/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
        const id = match[1];
        const imagesStr = match[2];
        
        // Извлекаем ссылки из строки
        const imageUrls = [];
        const urlRegex = /'([^']+)'/g;
        let urlMatch;
        while ((urlMatch = urlRegex.exec(imagesStr)) !== null) {
            imageUrls.push(urlMatch[1]);
        }
        
        if (imageUrls.length > 0) {
            synths.push({ id, imageUrls });
        }
    }
    
    console.log(`Найдено ${synths.length} синтов с фото`);
    return synths;
}

// Функция для скачивания файла
async function downloadFile(url, filepath) {
    const writer = fs.createWriteStream(filepath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

// Функция для обновления файла synths.ts с локальными путями к фото
function updateSynthsFile(synthId, localImagePath) {
    try {
        let content = fs.readFileSync(SYNTHS_FILE, 'utf8');
        
        // Находим запись синта и обновляем images
        // Ищем блок вида: id: 'synth-id', ... images: ['url1', 'url2']
        const idRegex = new RegExp(`(id:\\s*'${synthId}'[\\s\\S]*?images:\\s*\\[)([^\\]]+)(\\])`, 'm');
        
        if (idRegex.test(content)) {
            // Заменяем старые URL на локальный путь
            content = content.replace(idRegex, (match, before, images, after) => {
                return `${before}'/images/${path.basename(localImagePath)}'${after}`;
            });
            
            fs.writeFileSync(SYNTHS_FILE, content, 'utf8');
            console.log(`✅ Обновлен synths.ts для ${synthId}`);
            return true;
        } else {
            console.warn(`⚠️ Не найдена запись для ${synthId} в synths.ts`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Ошибка обновления synths.ts для ${synthId}:`, error.message);
        return false;
    }
}

// Основная функция
async function main() {
    console.log('🚀 Запуск скрипта загрузки фото...');
    
    const synths = readSynthsFromFile();
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < synths.length; i++) {
        const synth = synths[i];
        const firstImageUrl = synth.imageUrls[0]; // Берем первое фото
        
        if (!firstImageUrl) {
            console.log(`\n[${i + 1}/${synths.length}] Пропуск: ${synth.id} (нет фото)`);
            continue;
        }

        console.log(`\n[${i + 1}/${synths.length}] Обработка: ${synth.id}`);
        console.log(`Скачивание: ${firstImageUrl}`);

        const fileExt = path.extname(new URL(firstImageUrl).pathname) || '.jpg';
        const localPath = path.join(IMAGES_DIR, `${synth.id}${fileExt}`);

        try {
            // Скачиваем фото
            await downloadFile(firstImageUrl, localPath);
            console.log(`✅ Скачано: ${localPath}`);

            // Обновляем synths.ts
            const updated = updateSynthsFile(synth.id, localPath);
            if (updated) {
                successCount++;
            } else {
                errorCount++;
            }
            
        } catch (error) {
            console.error(`❌ Ошибка при обработке ${synth.id}:`, error.message);
            errorCount++;
        }
        
        // Небольшая задержка между запросами (чтобы не перегружать Wikipedia)
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n✅ Готово! Успешно: ${successCount}, Ошибок: ${errorCount}`);
    console.log('⚠️ ВАЖНО: Теперь нужно пересобрать приложение и задеплоить на сервер');
    console.log('   Команды: npm run build && ./deploy.sh --force');
}

// Запуск
main().catch(console.error);
