const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// --- НАСТРОЙКИ (ЗАПОЛНИТЕ ЭТИ ДАННЫЕ) ---
const NOCODB_API_URL = 'http://localhost:8080/api/v1'; // URL вашего NocoDB API
const NOCODB_API_TOKEN = 'YOUR_API_TOKEN_HERE'; // Ваш API Token из NocoDB
const TABLE_ID = 'table_id_here'; // ID таблицы синтезаторов в NocoDB
const ATTACHMENT_FIELD_ID = 'field_id_here'; // ID поля типа Attachment (например, IdAttachment)
const BATCH_SIZE = 5; // Количество одновременных загрузок (чтобы не перегружать сервер)

// Путь к файлу с синтами (локальная копия)
const SYNTHS_FILE = path.join(__dirname, '../src/lib/data/synths.ts');

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

// Функция для загрузки файла в NocoDB
async function uploadToNocoDB(synthId, filePath, fieldName) {
    const url = `${NOCODB_API_URL}/tables/${TABLE_ID}/records/${synthId}/attachment`;
    
    const formData = new FormData();
    formData.append('field', fieldName);
    formData.append('files', fs.createReadStream(filePath));

    const config = {
        headers: {
            ...formData.getHeaders(),
            'xc-token': NOCODB_API_TOKEN
        }
    };

    try {
        const response = await axios.post(url, formData, config);
        console.log(`✅ Успешно загружено для ${synthId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Ошибка загрузки для ${synthId}:`, error.response ? error.response.data : error.message);
        return null;
    }
}

// Основная функция
async function main() {
    console.log('🚀 Запуск скрипта загрузки фото...');
    
    const synths = readSynthsFromFile();
    
    for (let i = 0; i < synths.length; i++) {
        const synth = synths[i];
        const firstImageUrl = synth.imageUrls[0]; // Берем первое фото
        
        if (!firstImageUrl) continue;

        console.log(`\n[${i + 1}/${synths.length}] Обработка: ${synth.id}`);
        console.log(`Скачивание: ${firstImageUrl}`);

        const fileExt = path.extname(new URL(firstImageUrl).pathname) || '.jpg';
        const localPath = path.join(TEMP_DIR, `${synth.id}${fileExt}`);

        try {
            // Скачиваем фото
            await downloadFile(firstImageUrl, localPath);
            console.log(`Скачано: ${localPath}`);

            // Загружаем в NocoDB
            await uploadToNocoDB(synth.id, localPath, ATTACHMENT_FIELD_ID);

            // Удаляем временный файл
            fs.unlinkSync(localPath);
            
        } catch (error) {
            console.error(`❌ Ошибка при обработке ${synth.id}:`, error.message);
        }
        
        // Небольшая задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✅ Готово! Все фото обработаны.');
}

// Запуск
main().catch(console.error);
