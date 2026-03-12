# Добавление фотографий в каталог

## Источники фотографий

### 1. Wikimedia Commons (рекомендуется)
Бесплатные лицензионные фотографии высокого качества:
- https://commons.wikimedia.org
- Поиск по названию модели (например, "Casio VL-1", "Yamaha PSS-470")
- Фильтр по лицензии: CC BY-SA 3.0, CC BY-SA 4.0, Public Domain

### 2. Reverb
Фотографии с объявлений о продаже:
- https://reverb.com
- Поиск по модели
- Можно использовать фотографии с разрешениями продавцов

### 3. eBay
Архивные фотографии:
- https://ebay.com
- Поиск по названию модели
- Фото из завершенных аукционов

### 4. Рекомендованные архивы по Yamaha/Casio
- Yamaha Synth Official Chronology: https://www.yamahasynth.com/synths/yamaha-synth-chronology
- Yamaha Archive (French): https://fr.yamaha.com/fr/musical-instruments/keyboards/products/archived/
- Wikimedia Commons (Yamaha): https://commons.wikimedia.org/wiki/Category:Yamaha_synthesizers
- Wikimedia Commons (Casio): https://commons.wikimedia.org/wiki/Category:Casio_synthesizers
- Vintage Synth Explorer (Casio): http://www.vintagesynth.com/casio.php

### 5. Платные стоки (только при наличии лицензии)
- Shutterstock (Yamaha/Casio)
- Alamy (Casio)

Важно: изображения из Shutterstock/Alamy можно добавлять в проект только если есть подтвержденная лицензия на использование.

## Формат URL в synths.ts

```typescript
{
  id: 'brand-series-model',
  // ...
  images: [
    'https://example.com/photo1.jpg',
    'https://example.com/photo2.jpg'
  ]
}
```

## Примеры реальных URL

### Casio VL-1 (Wikimedia Commons)
```typescript
images: [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Casio_vl_tone.jpg/800px-Casio_vl_tone.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Casio_VL-1_Inv_Nr_81934.jpg/800px-Casio_VL-1_Inv_Nr_81934.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Casio_VL-Tone_VL-1_LCD.jpg/800px-Casio_VL-Tone_VL-1_LCD.jpg'
]
```

### Yamaha PSS-9 (Nurykabe)
```typescript
images: [
  'https://www.nurykabe.com/dump/docs/PSS/images/PSS-9.jpg'
]
```

### Roland TB-303 (Wikimedia Commons)
```typescript
images: [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Roland_TB-303.jpg/800px-Roland_TB-303.jpg'
]
```

## Поиск фотографий

### Использование скрипта
```bash
node src/lib/utils/photoFinder.js "VL-1" "Casio"
```

### Поиск вручную
1. Откройте https://commons.wikimedia.org
2. Введите название модели
3. Проверьте лицензию (должна быть CC BY-SA или Public Domain)
4. Скопируйте URL изображения
5. Добавьте в synths.ts

## Критерии выбора фотографий

- ✅ Высокое качество (минимум 500x500 px)
- ✅ Разные ракурсы (общий вид, панель, клавиатура)
- ✅ Без водяных знаков
- ✅ Соответствующая лицензия
- ❌ Избегайте фото с eBay/Reverb с логотипами сайта

## Обновление synths.ts

1. Откройте `src/lib/data/synths.ts`
2. Найдите модель по ID (например, `id: 'casio-vl-vl-1'`)
3. Замените массив `images` на новые URL
4. Перезапустите сервер: `npm run dev`

## Проверка

После обновления:
1. Откройте http://localhost:5175
2. Найдите модель в каталоге
3. Проверьте, что фото отображаются
4. Перейдите на детальную страницу модели
