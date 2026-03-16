<script lang="ts">
  import type { SynthModel } from '$lib/data/synths';
  
  let { synth, onSave, onCancel }: { 
    synth: SynthModel; 
    onSave: () => void;
    onCancel: () => void;
  } = $props();

  interface FieldDef {
    key: keyof SynthModel;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'array' | 'boolean' | 'select' | 'images';
    required?: boolean;
    options?: { value: string; label: string }[];
  }

  const brandOptions = [
    { value: 'Yamaha', label: 'Yamaha' },
    { value: 'Casio', label: 'Casio' },
    { value: 'Korg', label: 'Korg' },
    { value: 'Roland', label: 'Roland' },
    { value: 'Bontempi', label: 'Bontempi' },
    { value: 'Other', label: 'Other' }
  ];

  const formFactorOptions = [
    { value: 'micro', label: 'Micro' },
    { value: 'mini', label: 'Mini' },
    { value: 'compact', label: 'Compact' },
    { value: 'full', label: 'Full' }
  ];

  const fields: FieldDef[] = [
    { key: 'brand', label: 'Бренд', type: 'select', required: true, options: brandOptions },
    { key: 'series', label: 'Серия', type: 'text', required: true },
    { key: 'modelName', label: 'Модель', type: 'text', required: true },
    { key: 'year', label: 'Год выпуска', type: 'number', required: true },
    { key: 'formFactor', label: 'Тип корпуса', type: 'select', required: true, options: formFactorOptions },
    { key: 'keysCount', label: 'Количество клавиш', type: 'number', required: true },
    { key: 'synthEngine', label: 'Звуковой движок', type: 'text' },
    { key: 'description', label: 'Описание', type: 'textarea' },
    { key: 'images', label: 'Изображения (URL)', type: 'images' },
    { key: 'dimensions', label: 'Размеры', type: 'text' },
    { key: 'polyphony', label: 'Полифония', type: 'number' },
    { key: 'midi', label: 'MIDI', type: 'boolean' },
    { key: 'sequencer', label: 'Секвенсер', type: 'boolean' },
    { key: 'autoAccompaniment', label: 'Автоаккомпанемент', type: 'boolean' },
    { key: 'power', label: 'Питание', type: 'text' },
    { key: 'releasePriceUSD', label: 'Цена при выпуске ($)', type: 'number' },
    { key: 'featureTags', label: 'Теги (через запятую)', type: 'array' },
    { key: 'isGem', label: 'ГEM коллекции', type: 'boolean' }
  ];

  let errors = $state<Record<string, string>>({});
  let isActive = $state(synth.isActive !== false);

  function validate(): boolean {
    errors = {};
    
    for (const field of fields) {
      if (field.required) {
        const value = synth[field.key];
        if (value === undefined || value === null || value === '' || 
            (Array.isArray(value) && value.length === 0)) {
          errors[field.key] = 'Обязательное поле';
        }
      }
    }
    
    if (synth.year && (synth.year < 1900 || synth.year > 2030)) {
      errors.year = 'Некорректный год';
    }
    
    if (synth.keysCount && (synth.keysCount < 1 || synth.keysCount > 128)) {
      errors.keysCount = 'Некорректное количество клавиш';
    }

    return Object.keys(errors).length === 0;
  }

  function handleSave() {
    if (!validate()) {
      alert('Пожалуйста, исправьте ошибки');
      return;
    }
    
    // Convert array fields
    if (synth.featureTags && typeof synth.featureTags === 'string') {
      synth.featureTags = (synth.featureTags as string).split(',').map(t => t.trim()).filter(t => t);
    }
    
    // Set isActive
    synth.isActive = isActive;
    
    onSave();
  }

  function handleArrayChange(key: keyof SynthModel, value: string) {
    const arr = value.split('\n').map(v => v.trim()).filter(v => v);
    (synth as any)[key] = arr;
  }

  function getArrayValue(key: keyof SynthModel): string {
    const val = synth[key];
    if (Array.isArray(val)) return val.join('\n');
    return '';
  }

  function handleImagesChange(value: string) {
    // Split by: comma, semicolon, space, tab, or newline
    synth.images = value
      .split(/[,;\s\t\n]+/)
      .map(v => v.trim())
      .filter(v => v && (v.startsWith('http://') || v.startsWith('https://')));
  }

  function getImagesValue(): string {
    return synth.images?.join('\n') || '';
  }
</script>

<div class="modal-overlay" onclick={onCancel}>
  <div class="modal-content" onclick={(e) => e.stopPropagation()}>
    <div class="modal-header">
      <h2>✏️ Редактирование: {synth.brand} {synth.modelName}</h2>
      <button class="close-btn" onclick={onCancel}>✕</button>
    </div>

    <div class="modal-body">
      <div class="form-grid">
        {#each fields as field}
          <div class="form-field" class:error={errors[field.key]}>
            <label for={field.key}>{field.label}</label>
            
            {#if field.type === 'text'}
              <input 
                type="text" 
                id={field.key}
                bind:value={synth[field.key]}
                class:input-error={errors[field.key]}
              />
            {:else if field.type === 'number'}
              <input 
                type="number" 
                id={field.key}
                bind:value={synth[field.key]}
                class:input-error={errors[field.key]}
              />
            {:else if field.type === 'textarea'}
              <textarea 
                id={field.key}
                bind:value={synth[field.key]}
                rows="3"
                class:input-error={errors[field.key]}
              ></textarea>
            {:else if field.type === 'select'}
              <select 
                id={field.key}
                bind:value={synth[field.key]}
                class:input-error={errors[field.key]}
              >
                {#each field.options || [] as opt}
                  <option value={opt.value}>{opt.label}</option>
                {/each}
              </select>
            {:else if field.type === 'boolean'}
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  bind:checked={synth[field.key]}
                />
                <span>Да</span>
              </label>
            {:else if field.type === 'array'}
              <textarea 
                id={field.key}
                value={getArrayValue(field.key)}
                oninput={(e) => handleArrayChange(field.key, e.currentTarget.value)}
                placeholder="Одно значение на строку"
                class:input-error={errors[field.key]}
              ></textarea>
            {:else if field.type === 'images'}
              <textarea 
                id={field.key}
                value={getImagesValue()}
                oninput={(e) => handleImagesChange(e.currentTarget.value)}
                placeholder="Один URL на строку"
                class:input-error={errors[field.key]}
              ></textarea>
            {/if}
            
            {#if errors[field.key]}
              <span class="error-message">{errors[field.key]}</span>
            {/if}
          </div>
        {/each}
      </div>

      <div class="active-toggle">
        <label class="toggle-label">
          <input type="checkbox" bind:checked={isActive} />
          <span class="toggle-switch"></span>
          <span class="toggle-text">
            {isActive ? '✅ Синтезатор отображается в каталоге' : '❌ Синтезатор скрыт из каталога'}
          </span>
        </label>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" onclick={onCancel}>Отмена</button>
      <button class="btn-primary" onclick={handleSave}>💾 Сохранить</button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    z-index: 1000;
    padding: 20px;
    overflow-y: auto;
  }

  .modal-content {
    background: #16213e;
    border-radius: 12px;
    width: 100%;
    max-width: 800px;
    margin: 20px auto;
    border: 1px solid #00d9ff;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .modal-header h2 {
    margin: 0;
    color: #00d9ff;
    font-size: 1.3rem;
  }

  .close-btn {
    background: none;
    border: none;
    color: #888;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .close-btn:hover {
    color: #fff;
  }

  .modal-body {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .form-field {
    display: flex;
    flex-direction: column;
  }

  .form-field.error label {
    color: #ff5459;
  }

  .form-field.full-width {
    grid-column: 1 / -1;
  }

  label {
    color: #888;
    font-size: 12px;
    text-transform: uppercase;
    margin-bottom: 5px;
  }

  input[type="text"],
  input[type="number"],
  textarea,
  select {
    background: #0f3460;
    border: 1px solid #333;
    color: #fff;
    padding: 10px;
    border-radius: 6px;
    font-size: 14px;
  }

  input.input-error,
  textarea.input-error,
  select.input-error {
    border-color: #ff5459;
  }

  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: #00d9ff;
  }

  textarea {
    resize: vertical;
    min-height: 60px;
  }

  select {
    cursor: pointer;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    color: #fff;
    text-transform: none;
    font-size: 14px;
  }

  .checkbox-label input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .error-message {
    color: #ff5459;
    font-size: 12px;
    margin-top: 5px;
  }

  .active-toggle {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 15px;
    cursor: pointer;
  }

  .toggle-label input {
    display: none;
  }

  .toggle-switch {
    width: 50px;
    height: 26px;
    background: #333;
    border-radius: 13px;
    position: relative;
    transition: background 0.3s;
  }

  .toggle-switch::after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    background: #fff;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: transform 0.3s;
  }

  .toggle-label input:checked + .toggle-switch {
    background: #00d9ff;
  }

  .toggle-label input:checked + .toggle-switch::after {
    transform: translateX(24px);
  }

  .toggle-text {
    color: #888;
    font-size: 14px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  button {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #00d9ff;
    color: #000;
  }

  .btn-primary:hover {
    background: #00b8d9;
  }

  .btn-secondary {
    background: #333;
    color: #fff;
  }

  .btn-secondary:hover {
    background: #444;
  }

  @media (max-width: 600px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
