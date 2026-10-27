import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Printer,
  Barcode,
  Building2,
  Layers,
  FolderArchive,
  FileText,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  MapPin,
  BookOpen,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';

export default function SpineLabelModal({
  isOpen,
  onClose,
  targetItem = null,
  binder = null,
  document = null,
  binders = [],
  separators = [],
  chapters = []
}) {
  if (!isOpen) return null;

  // Resolve the active item being inspected
  const activeItem = targetItem || document || binder || binders[0] || separators[0];

  // Determine whether the active item is a Binder or a Separator
  const isBinderInitial = !!(
    activeItem && (
      activeItem.totalCapacity !== undefined ||
      activeItem.currentSeparatorsCount !== undefined ||
      (!activeItem.papersCount && activeItem.code && !activeItem.code.includes('-S'))
    )
  );

  // Active print mode / tab
  const [printTemplate, setPrintTemplate] = useState(
    isBinderInitial ? 'binder-index' : 'separator-cover'
  );

  // Spine width preference (50mm standard vs 75mm wide)
  const [spineWidth, setSpineWidth] = useState('50mm'); // '50mm' or '75mm'

  // Resolve Binder details
  const currentBinder = isBinderInitial
    ? activeItem
    : (binders.find(b => b.id === activeItem?.binderId || b.code === activeItem?.binderCode) || binders[0] || {
      name: activeItem?.binderName || "الفواتير الضريبية 2024",
      code: activeItem?.binderCode || "FIN-01",
      cabinet: activeItem?.cabinet || "خزانة أ",
      shelf: activeItem?.shelf || "رف 3",
      chapterName: activeItem?.chapterName || "الحسابات والمالية",
      chapterCode: activeItem?.chapterCode || "FIN"
    });

  // Resolve Chapter details
  const currentChapter = chapters.find(
    c => c.id === currentBinder?.chapterId || c.code === currentBinder?.chapterCode
  ) || {
    name: currentBinder?.chapterName || "الحسابات والمالية",
    code: currentBinder?.chapterCode || "FIN"
  };

  // Resolve Separator details
  const currentSeparator = !isBinderInitial
    ? activeItem
    : (separators.find(s => s.binderId === currentBinder.id || s.binderCode === currentBinder.code) || {
      name: "فواتير الموردين - الربع الأول",
      code: `${currentBinder?.code || 'FIN-01'}-S01`,
      papersCount: 25,
      color: "#38bdf8",
      client: "هيئة الزكاة والضريبة والجمارك",
      date: "2024/01/15",
      description: "مستندات وفواتير مشتريات الربع الأول للتدقيق"
    });

  // Separators belonging to this binder for the index table
  const binderSeparators = separators.filter(
    s => s.binderId === currentBinder?.id || s.binderCode === currentBinder?.code
  );

  // Calculated totals for the binder
  const totalPapersInBinder = binderSeparators.reduce(
    (acc, curr) => acc + (parseInt(curr.papersCount) || 20), 0
  );

  const handlePrint = () => {
    window.print();
  };

  const todayDate = new Date().toISOString().split('T')[0].replace(/-/g, '/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">

      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col font-cairo"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ================= MODAL HEADER ================= */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-xs">
              <Printer className="w-5 h-5 text-blue-400 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  مركز الطباعة الأرشيفية الاحترافية
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {isBinderInitial ? currentBinder?.code : currentSeparator?.code}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                طباعة فهرس المجلدات والفواصل الكرتونية الميدانية
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= TEMPLATE SELECTOR TABS ================= */}
        <div className="px-5 pt-3 bg-slate-50 flex flex-wrap items-center gap-2 border-b border-slate-200 shrink-0 text-xs font-bold">

          {/* 1. Binder Index Sheet (A4) */}
          <button
            type="button"
            onClick={() => setPrintTemplate('binder-index')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 cursor-pointer transition-all ${printTemplate === 'binder-index'
              ? 'border-blue-600 text-blue-900 bg-white rounded-t-xl font-extrabold shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>فهرس محتويات المجلد (A4 Index)</span>
          </button>

          {/* 2. Binder Spine Label */}
          <button
            type="button"
            onClick={() => setPrintTemplate('binder-spine')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 cursor-pointer transition-all ${printTemplate === 'binder-spine'
              ? 'border-blue-600 text-blue-900 bg-white rounded-t-xl font-extrabold shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            <FolderArchive className="w-4 h-4 text-blue-600" />
            <span>ملصق كعب المجلد (Spine Label)</span>
          </button>

          {/* 3. Separator Cover Sheet (A4) */}
          <button
            type="button"
            onClick={() => setPrintTemplate('separator-cover')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 cursor-pointer transition-all ${printTemplate === 'separator-cover'
              ? 'border-blue-600 text-blue-900 bg-white rounded-t-xl font-extrabold shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>غلاف الفاصل الكرتوني (Divider Cover A4)</span>
          </button>

          {/* 4. Single Separator Tab Sticker */}
          <button
            type="button"
            onClick={() => setPrintTemplate('separator-tab')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 cursor-pointer transition-all ${printTemplate === 'separator-tab'
              ? 'border-blue-600 text-blue-900 bg-white rounded-t-xl font-extrabold shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            <Scissors className="w-4 h-4 text-amber-600" />
            <span>ملصق لسان التبويب (Tab 3×7cm)</span>
          </button>

          {/* 5. All Tab Stickers Sheet */}
          <button
            type="button"
            onClick={() => setPrintTemplate('all-tabs')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 cursor-pointer transition-all ${printTemplate === 'all-tabs'
              ? 'border-blue-600 text-blue-900 bg-white rounded-t-xl font-extrabold shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>ألسنة جميع فواصل المجلد (Sheet)</span>
          </button>

        </div>

        {/* ================= OPTIONS TOOLBAR ================= */}
        <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              معاينة الورقة قبل الطباعة المادية:
            </span>

            {printTemplate === 'binder-spine' && (
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                <span className="px-2 text-[11px] font-bold text-slate-500">عرض الكعب:</span>
                <button
                  type="button"
                  onClick={() => setSpineWidth('50mm')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${spineWidth === '50mm' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  5 سم (قياسي)
                </button>
                <button
                  type="button"
                  onClick={() => setSpineWidth('75mm')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${spineWidth === '75mm' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  7.5 سم (عريض)
                </button>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            💡 ستطبع الطابعة هذا المحتوى فقط بدون أزرار أو أشرطة النظام
          </div>
        </div>

        {/* ================= MAIN PRINTABLE CANVAS AREA ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/60 flex justify-center items-start">

          <div
            id="printable-content"
            className="w-full bg-white shadow-md border border-slate-300 rounded-lg p-6 sm:p-8 text-slate-900 relative transition-all"
            style={{ maxWidth: printTemplate === 'binder-spine' ? (spineWidth === '75mm' ? '300px' : '230px') : printTemplate === 'separator-tab' ? '380px' : '820px' }}
          >

            {/* ========================================================
                TEMPLATE 1: BINDER CONTENTS MASTER INDEX (A4 TABLE OF CONTENTS)
                ======================================================== */}
            {printTemplate === 'binder-index' && (
              <div className="space-y-6 text-slate-900 font-cairo">

                {/* Official Corporate Header */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-black tracking-wider text-slate-600 uppercase">
                      <Building2 className="w-4 h-4 text-blue-700 inline" />
                      <span> • شركة المستقبل للأعمال</span>
                    </div>
                    <div className="text-xs text-slate-500 font-semibold mt-0.5">
                      الإدارة العامة للأرشيف والوثائق • وحدة التوثيق والحفظ الميداني
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                      فهرس محتويات وسجل المجلد الأرشيفي
                    </h1>
                    <div className="text-xs font-bold text-slate-500 font-mono tracking-widest mt-0.5">
                      BINDER MASTER INVENTORY & TABLE OF CONTENTS
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="p-1.5 bg-white border-2 border-slate-900 rounded-lg inline-block shadow-2xs">
                      <QRCodeSVG
                        value={`ARC-INDEX-${currentBinder.code}`}
                        size={65}
                        level="M"
                      />
                    </div>
                    <div className="font-mono text-[10px] font-black text-slate-600 text-center mt-1">
                      {currentBinder.code}
                    </div>
                  </div>
                </div>

                {/* Binder Metadata Summary Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-300 text-xs">
                  <div>
                    <div className="text-slate-500 font-bold">الموضوع (الباب الرئيسي):</div>
                    <div className="font-black text-slate-900 mt-0.5">
                      {currentChapter.name} ({currentChapter.code})
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-bold">كود المجلد الفيزيائي:</div>
                    <div className="font-mono font-black text-slate-900 text-sm mt-0.5 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                      {currentBinder.code}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-bold">الموقع في الخزائن:</div>
                    <div className="font-extrabold text-slate-900 mt-0.5">
                      {currentBinder.cabinet} • {currentBinder.shelf}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-bold">تاريخ تحرير الفهرس:</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {todayDate}
                    </div>
                  </div>
                </div>

                {/* Binder Title Banner */}
                <div className="p-3 bg-slate-900 text-white rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-blue-300 font-bold">اسم المجلد:</div>
                    <div className="text-base font-black">{currentBinder.name}</div>
                  </div>
                  <div className="text-left text-xs">
                    <div className="text-slate-300">إجمالي الفواصل المودعة:</div>
                    <div className="font-mono font-black text-white text-sm">
                      {binderSeparators.length} فواصل كرتونية
                    </div>
                  </div>
                </div>

                {/* Detailed Table of Cardboard Separators */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      بيان الفواصل الكرتونية المودعة والتبويبات الميدانية:
                    </h3>
                    <span className="text-xs font-bold text-slate-500">
                      مرتبة حسب التسلسل الفيزيائي في المجلد
                    </span>
                  </div>

                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <table className="w-full text-right text-xs border-collapse">
                      <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-extrabold text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3 w-10 text-center border-l border-slate-200">#</th>
                          <th className="py-2.5 px-3 w-16 text-center border-l border-slate-200">التبويب</th>
                          <th className="py-2.5 px-3 border-l border-slate-200">كود الفاصل</th>
                          <th className="py-2.5 px-3 border-l border-slate-200">محتوى وعنوان الفاصل</th>
                          <th className="py-2.5 px-3 border-l border-slate-200">الجهة / العميل</th>
                          <th className="py-2.5 px-3 border-l border-slate-200 text-center">الأوراق</th>
                          <th className="py-2.5 px-3 border-l border-slate-200 text-center">التاريخ</th>
                          <th className="py-2.5 px-3 text-center">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        {binderSeparators.length > 0 ? (
                          binderSeparators.map((sep, idx) => (
                            <tr key={sep.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 text-center font-bold text-slate-500 border-l border-slate-200">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-3 text-center border-l border-slate-200">
                                <span
                                  className="w-4 h-4 rounded-full inline-block shadow-2xs border border-white"
                                  style={{ backgroundColor: sep.color || '#38bdf8' }}
                                />
                              </td>
                              <td className="py-2.5 px-3 font-mono font-black text-slate-900 border-l border-slate-200 whitespace-nowrap">
                                {sep.code}
                              </td>
                              <td className="py-2.5 px-3 border-l border-slate-200">
                                <div className="font-bold text-slate-900">{sep.name}</div>
                                {sep.description && (
                                  <div className="text-[11px] text-slate-500 line-clamp-1">{sep.description}</div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 border-l border-slate-200 text-slate-700 font-semibold whitespace-nowrap">
                                {sep.client || 'عام'}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 border-l border-slate-200 whitespace-nowrap">
                                {sep.papersCount || 20}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono text-slate-600 border-l border-slate-200 whitespace-nowrap">
                                {sep.date}
                              </td>
                              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sep.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                  {sep.status === 'available' ? 'متاح' : 'مستعار'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="py-8 text-center text-slate-500 font-bold">
                              لا توجد فواصل كرتونية مضافة في هذا المجلد بعد
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-800 text-xs">
                        <tr>
                          <td colSpan="5" className="py-2.5 px-4 text-left border-l border-slate-200">
                            الإجمالي العام للأوراق المحفوظة في هذا المجلد:
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-black text-sm text-slate-900 border-l border-slate-200">
                            {totalPapersInBinder} ورقة
                          </td>
                          <td colSpan="2" className="py-2.5 px-3 text-center text-slate-600 font-medium">
                            {binderSeparators.length} فواصل
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Archival Certification & Sign-off Block */}
                <div className="pt-4 border-t-2 border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
                  <div className="border border-slate-300 p-3 rounded-lg bg-slate-50/50">
                    <div className="text-slate-500 font-bold">إعداد أمين الأرشيف المختص</div>
                    <div className="mt-8 pt-2 border-t border-dashed border-slate-300 font-bold text-slate-800">
                      التوقيع: ...........................
                    </div>
                  </div>

                  <div className="border border-slate-300 p-3 rounded-lg bg-slate-50/50">
                    <div className="text-slate-500 font-bold">اعتماد المشرف الإداري</div>
                    <div className="mt-8 pt-2 border-t border-dashed border-slate-300 font-bold text-slate-800">
                      التوقيع: ...........................
                    </div>
                  </div>

                  <div className="border border-slate-300 p-3 rounded-lg bg-slate-50/50 flex flex-col justify-between">
                    <div className="text-slate-500 font-bold">ختم وحدة الأرشيف الرسمي</div>
                    <div className="w-16 h-16 border-2 border-dashed border-slate-400 rounded-full mx-auto my-1 flex items-center justify-center text-[10px] text-slate-400">
                      موضع الختم
                    </div>
                  </div>
                </div>

                {/* Footer Notice */}
                <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                  نظام أرشفة الملفات والوثائق الورقية • يُحفظ هذا الفهرس في مقدمة المجلد خلف الغلاف الأمامي مباشرة
                </div>

              </div>
            )}

            {/* ========================================================
                TEMPLATE 2: BINDER SPINE LABEL (ملصق كعب المجلد الميداني)
                ======================================================== */}
            {printTemplate === 'binder-spine' && (
              <div className="mx-auto flex flex-col items-center">

                {/* Cutting Guide Instructions */}
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1 font-bold no-print">
                  <Scissors className="w-3.5 h-3.5 text-slate-400" />
                  <span>قص على الخطوط المتقطعة وضع الملصق داخل جيب كعب المجلد:</span>
                </div>

                {/* Physical Spine Label Insert */}
                <div
                  className="bg-white border-2 border-dashed border-slate-400 p-4 rounded-lg text-slate-900 flex flex-col items-center text-center space-y-4 shadow-sm relative"
                  style={{ width: spineWidth === '75mm' ? '280px' : '210px', minHeight: '520px' }}
                >
                  {/* Scissors cut-line marks on corners */}
                  <div className="absolute top-1 right-1 text-[10px] text-slate-400 font-mono">✂</div>
                  <div className="absolute top-1 left-1 text-[10px] text-slate-400 font-mono">✂</div>
                  <div className="absolute bottom-1 right-1 text-[10px] text-slate-400 font-mono">✂</div>
                  <div className="absolute bottom-1 left-1 text-[10px] text-slate-400 font-mono">✂</div>

                  {/* Header / Brand */}
                  <div className="w-full border-b-2 border-slate-900 pb-2.5">
                    <div className="text-xs font-black tracking-wider text-slate-900 uppercase flex items-center justify-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-700" />
                      <span>شركة المستقبل</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                      قسم الأرشيف والتوثيق الميداني
                    </div>
                  </div>

                  {/* Chapter Code & Name */}
                  <div className="w-full bg-slate-100 p-2 rounded-lg border border-slate-300">
                    <div className="text-[10px] text-slate-500 font-bold">الموضوع:</div>
                    <div className="text-xs font-black text-slate-900">
                      {currentChapter.name}
                    </div>
                    <div className="font-mono text-xs font-extrabold text-blue-800">
                      {currentChapter.code}
                    </div>
                  </div>

                  {/* GIANT BINDER CODE (Visible from distance) */}
                  <div className="w-full py-2 bg-slate-900 text-white rounded-lg shadow-sm">
                    <div className="text-[10px] text-slate-300 font-bold">كود المجلد</div>
                    <div className="font-mono text-3xl font-black tracking-wider">
                      {currentBinder.code}
                    </div>
                  </div>

                  {/* Binder Title */}
                  <div className="py-1">
                    <div className="text-[10px] text-slate-500 font-bold">اسم المجلد:</div>
                    <div className="text-sm font-black text-slate-900 leading-snug">
                      {currentBinder.name}
                    </div>
                  </div>

                  {/* Coordinates Shelf & Cabinet */}
                  <div className="w-full bg-blue-50/80 p-2 rounded-lg border border-blue-200">
                    <div className="text-[10px] text-blue-800 font-bold flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-600 inline" />
                      إحداثيات الرف:
                    </div>
                    <div className="text-xs font-black text-blue-950 mt-0.5">
                      {currentBinder.cabinet} • {currentBinder.shelf}
                    </div>
                  </div>

                  {/* Separators Count */}
                  <div className="text-[11px] font-bold text-slate-600">
                    السعة: {binderSeparators.length} فواصل كرتونية
                  </div>

                  {/* QR Code */}
                  <div className="p-2 bg-white rounded-lg border-2 border-slate-900 inline-block shadow-2xs">
                    <QRCodeSVG
                      value={`ARC-BINDER-${currentBinder.code}`}
                      size={spineWidth === '75mm' ? 105 : 90}
                      level="H"
                    />
                  </div>
                  <div className="font-mono text-[10px] font-black text-slate-700 -mt-2">
                    ARC-{currentBinder.code}
                  </div>

                  {/* Barcode Footer */}
                  <div className="w-full pt-2 border-t border-slate-300">
                    <div className="flex items-center justify-center text-xs font-mono text-slate-800 gap-1 font-bold">
                      <Barcode className="w-6 h-4 inline" />
                      <span>{currentBinder.barcode || `62810010${currentBinder.code?.replace(/\D/g, '') || '101'}`}</span>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ========================================================
                TEMPLATE 3: SEPARATOR COVER SHEET (A4 DIVIDER HEADER PAGE)
                ======================================================== */}
            {printTemplate === 'separator-cover' && (
              <div className="space-y-6 text-slate-900 font-cairo">

                {/* Physical Color Tab Banner */}
                <div
                  className="w-full h-3 rounded-t-lg"
                  style={{ backgroundColor: currentSeparator.color || '#38bdf8' }}
                />

                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-black tracking-wider text-slate-600 uppercase">
                      <Building2 className="w-4 h-4 text-blue-700 inline" />
                      <span>شركة المستقبل للأعمال • وحدة التوثيق الميداني</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      بطاقة تعريف وتوثيق الفاصل الكرتوني
                    </h1>
                    <div className="text-xs font-bold text-slate-500 font-mono tracking-widest mt-0.5">
                      OFFICIAL CARDBOARD DIVIDER COVER SHEET
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="p-2 bg-white border-2 border-slate-900 rounded-lg inline-block shadow-2xs">
                      <QRCodeSVG
                        value={`ARC-SEP-${currentSeparator.code}`}
                        size={75}
                        level="H"
                      />
                    </div>
                    <div className="font-mono text-[10px] font-black text-slate-700 text-center mt-1">
                      {currentSeparator.code}
                    </div>
                  </div>
                </div>

                {/* Parent Hierarchy Context */}
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold">الموضوع الرئيسي:</span>
                    <span className="font-black text-slate-900">{currentChapter.name} ({currentChapter.code})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold">المجلد التابع له:</span>
                    <span className="font-black text-slate-900 font-mono">{currentBinder.code} - {currentBinder.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold">الموقع:</span>
                    <span className="font-black text-blue-900">{currentBinder.cabinet} • {currentBinder.shelf}</span>
                  </div>
                </div>

                {/* Giant Separator Identity Card */}
                <div className="p-5 rounded-xl border-2 border-slate-900 bg-white shadow-2xs space-y-4">

                  {/* Code & Color Tag */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full shadow-2xs border-2 border-white"
                        style={{ backgroundColor: currentSeparator.color || '#38bdf8' }}
                      />
                      <span className="font-mono text-2xl font-black bg-slate-900 text-white px-3 py-1 rounded-lg">
                        {currentSeparator.code}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                      تاريخ التوثيق: {currentSeparator.date || todayDate}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <div className="text-xs text-slate-500 font-bold mb-1">اسم وعنوان الفاصل الكرتوني:</div>
                    <h2 className="text-xl font-black text-slate-900 leading-snug">
                      {currentSeparator.name}
                    </h2>
                    {currentSeparator.description && (
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        {currentSeparator.description}
                      </p>
                    )}
                  </div>

                  {/* Quantitative Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-center">
                      <div className="text-xs text-blue-800 font-bold">عدد الأوراق المحفوظة</div>
                      <div className="font-mono text-2xl font-black text-blue-950 mt-0.5">
                        {currentSeparator.papersCount || 20} ورقة
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                      <div className="text-xs text-slate-500 font-bold">الجهة / العميل</div>
                      <div className="text-sm font-black text-slate-900 mt-1 truncate">
                        {currentSeparator.client || 'عام'}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center col-span-2 sm:col-span-1">
                      <div className="text-xs text-slate-500 font-bold">حالة التواجد الميداني</div>
                      <div className="text-sm font-black text-emerald-700 mt-1">
                        🟢 متاح داخل المجلد
                      </div>
                    </div>
                  </div>

                </div>

                {/* Regulatory Safeguard Notice */}
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/60 flex items-start gap-3 text-xs">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-amber-950">
                      تنبيه رقابي رسمي بشأن الوثائق الورقية:
                    </h4>
                    <p className="text-amber-900 mt-0.5 leading-relaxed">
                      هذه الوثائق خاضعة للرقابة والتدقيق الأرشيفي الدوري. يمنع منعاً باتاً نزع أو فصل أي ورقة من هذا الفاصل، ولا يجوز إخراج هذا الفاصل خارج الأرشيف إلا بإذن خطي رسمي مسجل برقم إعارة في النظام.
                    </p>
                  </div>
                </div>

                {/* Custody Signature Section */}
                <div className="pt-4 border-t-2 border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
                  <div className="border border-slate-300 p-3 rounded-lg bg-slate-50/50">
                    <div className="text-slate-500 font-bold">أمين الأرشيف والمودع</div>
                    <div className="mt-7 pt-2 border-t border-dashed border-slate-300 font-bold text-slate-800">
                      التوقيع: ...........................
                    </div>
                  </div>

                  <div className="border border-slate-300 p-3 rounded-lg bg-slate-50/50">
                    <div className="text-slate-500 font-bold">المشرف المالي / الرقابي</div>
                    <div className="mt-7 pt-2 border-t border-dashed border-slate-300 font-bold text-slate-800">
                      التوقيع: ...........................
                    </div>
                  </div>

                  <div className="border border-slate-300 p-3 rounded-lg bg-slate-50/50 flex flex-col justify-between">
                    <div className="text-slate-500 font-bold">الختم الأرشيفي المعتمد</div>
                    <div className="w-14 h-14 border-2 border-dashed border-slate-400 rounded-full mx-auto my-1 flex items-center justify-center text-[10px] text-slate-400">
                      ختم الأرشيف
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                  توضع هذه الورقة خلف الفاصل الكرتوني مباشرة قبل حزمة الأوراق التابعة له لتوثيق المحتوى وسرعة المسح
                </div>

              </div>
            )}

            {/* ========================================================
                TEMPLATE 4: SINGLE SEPARATOR TAB STICKER (3×7cm)
                ======================================================== */}
            {printTemplate === 'separator-tab' && (
              <div className="mx-auto flex flex-col items-center">

                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1 font-bold no-print">
                  <Scissors className="w-3.5 h-3.5 text-slate-400" />
                  <span>ملصق مخصص للالتصاق على لسان الفاصل الكرتوني البارز (3 سم × 7 سم):</span>
                </div>

                <div
                  className="w-80 bg-white border-2 border-dashed border-slate-400 p-3 rounded-lg text-slate-900 flex items-center justify-between gap-3 relative overflow-hidden shadow-sm"
                >
                  {/* Colored tab edge */}
                  <div
                    className="absolute top-0 right-0 bottom-0 w-3"
                    style={{ backgroundColor: currentSeparator.color || '#38bdf8' }}
                  />

                  <div className="flex-1 pr-3 text-right">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                        {currentSeparator.code}
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {currentBinder.code}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 leading-tight line-clamp-1">
                      {currentSeparator.name}
                    </h4>

                    <div className="text-[10px] text-slate-500 mt-1 font-medium">
                      {currentBinder.cabinet} • {currentBinder.shelf} • <strong>{currentSeparator.papersCount || 20} ورقة</strong>
                    </div>
                  </div>

                  {/* QR */}
                  <div className="p-1 bg-white rounded border border-slate-900 shrink-0">
                    <QRCodeSVG
                      value={`ARC-SEP-${currentSeparator.code}`}
                      size={54}
                      level="M"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-3 text-center no-print">
                  مقاس الملصق: 3 سم × 7 سم لتثبيته على التبويب البارز للفاصل الكرتوني
                </p>

              </div>
            )}

            {/* ========================================================
                TEMPLATE 5: ALL TAB STICKERS SHEET (ورقة ملصقات تبويبات مجمعة)
                ======================================================== */}
            {printTemplate === 'all-tabs' && (
              <div className="space-y-4 text-slate-900 font-cairo">

                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      ورقة ملصقات تبويبات فواصل مجلد: {currentBinder.name} ({currentBinder.code})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ملصقات جاهزة للقص وتثبيتها على ألسنة الفواصل الكرتونية الفيزيائية (10 فواصل)
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 rounded border border-slate-200">
                    {binderSeparators.length} ملصقات
                  </span>
                </div>

                {/* 2-Column Grid of Tab Stickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {binderSeparators.map((sep) => (
                    <div
                      key={sep.id}
                      className="border-2 border-dashed border-slate-300 p-3 rounded-lg bg-white flex items-center justify-between gap-2.5 relative overflow-hidden"
                    >
                      <div
                        className="absolute top-0 right-0 bottom-0 w-2.5"
                        style={{ backgroundColor: sep.color || '#38bdf8' }}
                      />

                      <div className="flex-1 pr-2.5 text-right">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-[11px] font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                            {sep.code}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {currentBinder.code}
                          </span>
                        </div>

                        <div className="text-xs font-black text-slate-900 line-clamp-1 leading-snug">
                          {sep.name}
                        </div>

                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {currentBinder.cabinet} • {sep.papersCount || 20} ورقة • {sep.client || 'عام'}
                        </div>
                      </div>

                      <div className="p-1 bg-white rounded border border-slate-300 shrink-0">
                        <QRCodeSVG
                          value={`ARC-SEP-${sep.code}`}
                          size={46}
                          level="M"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                  ✂️ قم بالقص على طول الخطوط المتقطعة لتثبيت كل ملصق على لسان الفاصل المقابل له
                </div>

              </div>
            )}

          </div>

        </div>

        {/* ================= MODAL FOOTER ACTIONS ================= */}
        <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="text-xs text-slate-500 font-semibold hidden sm:block">
            <span>الورقة المحددة: </span>
            <strong className="text-slate-800">
              {printTemplate === 'binder-index' ? 'فهرس محتويات المجلد الرسمي (A4 Index)' :
                printTemplate === 'binder-spine' ? `ملصق كعب المجلد (${spineWidth})` :
                  printTemplate === 'separator-cover' ? 'غلاف الفاصل الكرتوني الرسمي (A4 Cover)' :
                    printTemplate === 'separator-tab' ? 'ملصق لسان التبويب (3×7cm)' : 'ورقة ملصقات جميع التبويبات'}
            </strong>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              id="confirm-print-action-btn"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-black shadow-md transition-all cursor-pointer group"
            >
              <Printer className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>طباعة هذه الورقة الآن (Print)</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
