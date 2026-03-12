# Статус правок изображений синтезаторов

## ✅ ИСПРАВЛЕНО

| Модель | Статус | Примечания |
|--------|--------|-----------|
| Yamaha PS-11 | ✅ Готово | Добавлен Wikimedia URL |
| Yamaha PSS-F30 | ✅ Готово | Добавлен Wikimedia URL |
| Yamaha PSS-1020 | ✅ Готово | Nurykabe URL |
| Yamaha PSR-60 | ✅ Готово | eBay URL |
| Roland Juno-6 | ✅ Готово | Wikimedia URL |
| Roland D-20 | ✅ Готово | eBay URL |
| Yamaha Reface YC | ✅ Готово | Wikimedia URL |
| Yamaha Reface CP | ✅ Готово | Wikimedia URL |
| Casio SK-210 | ✅ Готово | eBay URL |
| Casio SK-220 | ✅ Готово | eBay URL |
| Casio CZ-3000 | ✅ Готово | Wikimedia URL |
| Casio CZ-5000 | ✅ Готово | Wikimedia URL (дубль CZ-3000) |
| Casio PT-82 | ✅ Готово | eBay URL |
| Casio PT-88 | ✅ Готово | eBay URL |
| Casio MT-200 | ✅ Готово | Wikimedia URL |
| Casio MT-540 | ✅ Готово | Wikimedia URL |
| Casio MT-800 | ✅ Готово | Wikimedia URL |

## 🔴 ТРЕБУЮТ ПРАВОК (Дубликаты)

### Bontempi (неверные изображения)
| ID | Модель | Текущее изображение | Проблема |
|----|--------|---------------------|-----------|
| bontempi-toy-bontempi-b-2 | Bontempi B-2 | Coa_fam_ITA_bontempi_khi.jpg | Неверное (герб) |
| bontempi-toy-bontempi-b-3 | Bontempi B-3 | Coa_fam_ITA_bontempi_khi.jpg | Неверное (герб) |
| bontempi-toy-bontempi-b-4 | Bontempi B-4 | Coa_fam_ITA_bontempi_khi.jpg | Неверное (герб) |
| bontempi-home-bontempi-gt-741 | Bontempi GT-741 | Paride_Violino.jpg | Неверное (скрипка) |
| bontempi-home-bontempi-gt-742 | Bontempi GT-742 | Paride_Violino.jpg | Неверное (скрипка) |
| bontempi-home-bontempi-gt-743 | Bontempi GT-743 | Paride_Violino.jpg | Неверное (скрипка) |

### Casio PT Series (дубликаты)
| ID | Модель | Дублирует |
|----|--------|------------|
| casio-pt-pt-30 | PT-30 | PT-1 |
| casio-pt-pt-50 | PT-50 | PT-1 |
| casio-pt-pt-82 | PT-82 | PT-80 (есть override) |
| casio-pt-pt-88 | PT-88 | PT-87 |

## 🟡 ТРЕБУЮТ ПРОВЕРКИ

| ID | Модель | Статус | Примечания |
|----|--------|--------|-----------|
| yamaha-psr-psr-60 | PSR-60 | ⚠️ YouTube thumbnail | hqdefault.jpg - нужно заменить |

## 📋 ПРИОРИТЕТЫ

### Высокий приоритет
1. Bontempi B-2, B-3, B-4 - найти реальные фото
2. Bontempi GT-741, GT-742, GT-743 - найти реальные фото
3. Casio PT-30, PT-50 - уникальные фото

### Средний приоритет  
1. Yamaha PSR-60 - заменить YouTube thumbnail
2. Casio PT-88 - проверить изображение

## 🔗 Источники для поиска
- https://synthpedia.net (приоритетный)
- https://commons.wikimedia.org
- https://reverb.com
- https://ebay.com (архивные)
- https://fr.yamaha.com/fr/musical-instruments/keyboards/products/archived/
- https://en.audiofanzine.com
- https://soundprogramming.net

## 📝 Нотатки
- Использовать gem-photo-overrides.ts для гемов (isGem: true)
- Использовать photo-overrides.ts для обычных моделей
- Проверять что URL валидные перед добавлением
- Избегать YouTube thumbnail (hqdefault.jpg)
