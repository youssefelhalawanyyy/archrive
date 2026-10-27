import React, { useState, useEffect } from 'react';
import { 
  X, 
  Layers, 
  Sparkles, 
  MapPin, 
  Calendar, 
  FileText, 
  FolderKanban,
  Building2,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateNextSeparatorCode } from '../services/firebase';

export default function AddSeparationModal({ 
  isOpen, 
  onClose, 
  chapters = [],
  binders = [],
  defaultBinder = null, 
  onAddSeparator 
}) {
  if (!isOpen) return null;

  const [selectedBinderId, setSelectedBinderId] = useState(
    defaultBinder?.id || binders[0]?.id || 'binder-amn-1'
  );

  const currentBinder = binders.find(b => b.id === selectedBinderId) || defaultBinder || binders[0];

  const [name, setName] = useState('');
  const [autoCode, setAutoCode] = useState('');
  const [color, setColor] = useState('#38bdf8');
  const [papersCount, setPapersCount] = useState(25);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0].replace(/-/g, '/'));
  const [client, setClient] = useState('');
  const [status, setStatus] = useState('available');
  const [borrower, setBorrower] = useState('');
  const [description, setDescription] = useState('');

  // Update auto code when binder changes
  useEffect(() => {
    if (currentBinder) {
      const generated = generateNextSeparatorCode(currentBinder);
      setAutoCode(generated.code);
      if (!name) {
        setName(`فاصل ${generated.number} (جديد)`);
      }
    }
  }, [selectedBinderId, currentBinder]);

  const colorPresets = [
    { label: 'سماوي', value: '#38bdf8' },
    { label: 'زمردي', value: '#34d399' },
    { label: 'أصفر كهرماني', value: '#fbbf24' },
    { label: 'وردي أحمر', value: '#f87171' },
    { label: 'بنفسجي', value: '#a855f7' },
    { label: 'بترولي', value: '#0d9488' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("يرجى إدخال اسم أو عنوان الفاصل.");
      return;
    }

    const separatorData = {
      code: autoCode,
      name: name.trim(),
      chapterId: currentBinder?.chapterId,
      chapterName: currentBinder?.chapterName,
      chapterCode: currentBinder?.chapterCode,
      binderId: currentBinder?.id,
      binderName: currentBinder?.name,
      binderCode: currentBinder?.code,
      cabinet: currentBinder?.cabinet || 'خزانة أ',
      shelf: currentBinder?.shelf || 'رف 3',
      location: `${currentBinder?.cabinet || 'خزانة أ'} - ${currentBinder?.shelf || 'رف 3'}`,
      color: color,
      papersCount: parseInt(papersCount) || 1,
      date: date,
      client: client.trim() || 'عام',
      status: status,
      borrower: status === 'checked_out' ? (borrower || 'أحمد (مستعار عند الإيداع)') : null,
      borrowDate: status === 'checked_out' ? date : null,
      dueDate: status === 'checked_out' ? '2024/02/15' : null,
      description: description.trim() || `فاصل ورقي داخل مجلد ${currentBinder?.name}`,
      qrCode: `ARC-${autoCode}`,
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`
    };

    onAddSeparator(separatorData);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-xl max-h-[92vh] overflow-y-auto flex flex-col font-cairo"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 text-white">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500">تقسيم المجلد الفيزيائي</div>
              <h3 className="text-base font-black text-slate-900">إضافة فاصل / تبويب جديد في المجلد</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Target Binder & Auto Code */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المجلد المستهدف (Binder) <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBinderId}
                onChange={(e) => setSelectedBinderId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-900 text-xs outline-hidden"
              >
                {binders.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.name} ({b.cabinet} • {b.shelf})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-600 font-medium">كود الفاصل التلقائي:</span>
              <div className="flex items-center gap-1 font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{autoCode}</span>
              </div>
            </div>
          </div>

          {/* Separator Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم أو عنوان الفاصل (Separator Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: فواتير الربع الأول 2023، عقود المقاولات، مسوغات التعيين..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden text-xs font-bold text-slate-900 transition-all"
            />
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              لون تبويب الفاصل (لتمييزه بالعين في كعب المجلد)
            </label>
            <div className="flex items-center gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    color === c.value ? 'scale-110 border-slate-900 ring-2 ring-blue-500/20' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Date, Papers Count, Client */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تاريخ / فترة الفاصل
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="YYYY/MM/DD"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs text-left font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                عدد الأوراق داخل الفاصل
              </label>
              <input
                type="number"
                min="1"
                value={papersCount}
                onChange={(e) => setPapersCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs text-left font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الجهة / العميل المرتبط
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="مثال: شركة الأفق..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
              />
            </div>
          </div>

          {/* Physical Status: Available or Checked Out */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الحالة الفيزيائية للفاصل
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                status === 'available'
                  ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="available"
                  checked={status === 'available'}
                  onChange={() => { setStatus('available'); setBorrower(''); }}
                  className="sr-only"
                />
                <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 flex items-center justify-center">
                  {status === 'available' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                </span>
                <span className="text-xs font-bold">🟢 متاح في المجلد</span>
              </label>

              <label className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                status === 'checked_out'
                  ? 'border-amber-500 bg-amber-50/70 text-amber-900'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="checked_out"
                  checked={status === 'checked_out'}
                  onChange={() => setStatus('checked_out')}
                  className="sr-only"
                />
                <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-600 flex items-center justify-center">
                  {status === 'checked_out' && <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>}
                </span>
                <span className="text-xs font-bold">🟡 مستعار ميدانياً</span>
              </label>
            </div>

            {status === 'checked_out' && (
              <div className="mt-2.5">
                <label className="block text-[11px] font-bold text-amber-900 mb-1">
                  اسم المستعير / القسم
                </label>
                <input
                  type="text"
                  value={borrower}
                  onChange={(e) => setBorrower(e.target.value)}
                  placeholder="مثال: أحمد الراجحي (قسم المالية)"
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-amber-50/50 text-xs font-bold text-amber-900"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظات ومحتوى الفاصل
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر لمحتويات الأوراق داخل هذا الفاصل..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>إضافة الفاصل للمجلد وتوليد الكود</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
