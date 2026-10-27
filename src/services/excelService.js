import * as XLSX from 'xlsx';

/**
 * 1. Export Entire Archive to a Multi-Sheet Professional Excel Workbook
 */
export function exportArchiveToExcel({
  chapters = [],
  binders = [],
  separators = [],
  auditLogs = []
}) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet 1: الفواصل الكرتونية (Separators)
  const separatorsData = separators.map((s, idx) => ({
    "م": idx + 1,
    "كود الفاصل": s.code || '',
    "عنوان الفاصل ومحتواه": s.name || '',
    "المجلد الفيزيائي": s.binderName || '',
    "كود المجلد": s.binderCode || '',
    "الموضوع (الباب)": s.chapterName || '',
    "كود الموضوع": s.chapterCode || '',
    "الخزانة": s.cabinet || 'الخزانة الرئيسية',
    "الرف": s.shelf || 'رف 1',
    "الموقع الميداني": s.location || '',
    "عدد الأوراق المحفوظة": s.papersCount || 20,
    "الجهة / العميل المستفيد": s.client || 'عام',
    "تاريخ الإيداع": s.date || '',
    "حالة التواجد": s.status === 'available' ? 'متاح بالمجلد' : 'مستعار ميدانياً',
    "المستعير الحالي": s.borrower || '—',
    "تاريخ الإعارة": s.borrowDate || '—',
    "تاريخ الاسترداد المتوقع": s.dueDate || '—',
    "الوصف والملاحظات": s.description || '',
    "كود QR المرجعي": s.qrCode || '',
    "الباركود الرقمي": s.barcode || ''
  }));

  const wsSeparators = XLSX.utils.json_to_sheet(separatorsData);
  // Set right-to-left flag for Arabic Excel viewers
  wsSeparators['!views'] = [{ rightToLeft: true }];
  XLSX.utils.book_append_sheet(wb, wsSeparators, "سجل الفواصل الكرتونية");

  // 2. Sheet 2: المجلدات الفيزيائية (Binders)
  const bindersData = binders.map((b, idx) => {
    const sepsInBinder = separators.filter(s => s.binderId === b.id || s.binderCode === b.code);
    const checkedOutCount = sepsInBinder.filter(s => s.status === 'checked_out').length;
    return {
      "م": idx + 1,
      "كود المجلد": b.code || '',
      "اسم المجلد": b.name || '',
      "الموضوع التابع له": b.chapterName || '',
      "كود الموضوع": b.chapterCode || '',
      "الخزانة": b.cabinet || 'الخزانة الرئيسية',
      "الرف الفيزيائي": b.shelf || '',
      "عدد الفواصل الحالية": sepsInBinder.length || b.currentSeparatorsCount || 0,
      "السعة القصوى للفواصل": b.totalCapacity || 10,
      "الفواصل المستعارة": checkedOutCount,
      "حالة المجلد": b.status || 'نشط',
      "الوصف": b.description || '',
      "كود QR": b.qrCode || '',
      "الباركود": b.barcode || ''
    };
  });

  const wsBinders = XLSX.utils.json_to_sheet(bindersData);
  wsBinders['!views'] = [{ rightToLeft: true }];
  XLSX.utils.book_append_sheet(wb, wsBinders, "المجلدات النشطة والأرفف");

  // 3. Sheet 3: الموضوعات والأبواب (Chapters)
  const chaptersData = chapters.map((c, idx) => {
    const bindersInChap = binders.filter(b => b.chapterId === c.id || b.chapterCode === c.code);
    const sepsInChap = separators.filter(s => s.chapterId === c.id || s.chapterCode === c.code);
    return {
      "م": idx + 1,
      "كود الموضوع": c.code || '',
      "اسم الموضوع (الباب التصنيفي)": c.name || '',
      "عدد المجلدات": bindersInChap.length,
      "عدد الفواصل الكرتونية": sepsInChap.length,
      "الوصف": c.description || ''
    };
  });

  const wsChapters = XLSX.utils.json_to_sheet(chaptersData);
  wsChapters['!views'] = [{ rightToLeft: true }];
  XLSX.utils.book_append_sheet(wb, wsChapters, "الموضوعات والأبواب");

  // 4. Sheet 4: سجل حركات التدقيق والرقابة (Audit Logs)
  const logsData = auditLogs.map((l, idx) => ({
    "م": idx + 1,
    "التاريخ والوقت": l.date || '',
    "نوع الحركة": l.actionName || l.action || '',
    "الوثيقة / الفاصل": l.docTitle || '',
    "المستعير / المستفيد": l.borrower || '—',
    "المسؤول المنفذ": l.performedBy || 'أحمد',
    "الملاحظات والغرض": l.reason || ''
  }));

  const wsLogs = XLSX.utils.json_to_sheet(logsData);
  wsLogs['!views'] = [{ rightToLeft: true }];
  XLSX.utils.book_append_sheet(wb, wsLogs, "سجل التدقيق والإعارة");

  // Generate File Name with Date
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `الأرشيف_الذكي_شركة_المستقبل_${dateStr}.xlsx`;

  // Write and trigger browser download
  XLSX.writeFile(wb, fileName);
  return fileName;
}

/**
 * 2. Download Clean Excel Template for Bulk Separator Imports
 */
export function downloadImportTemplate(binders = []) {
  const wb = XLSX.utils.book_new();

  // Template Sample Rows
  const sampleData = [
    {
      "اسم الفاصل ومحتواه *": "عقود التوريد والمناقصات للربع الأول",
      "كود المجلد أو اسمه *": binders[0]?.code || "AMN-01",
      "عدد الأوراق": 35,
      "الجهة / العميل المستفيد": "شركة النيل للمقاولات",
      "تاريخ الإيداع (YYYY/MM/DD)": "2024/02/10",
      "الوصف والملاحظات": "أصول فواتير التوريد وشهادات الفحص والاستلام",
      "لون التبويب (اختياري)": "سماوي"
    },
    {
      "اسم الفاصل ومحتواه *": "كشوفات المستحقات والتأمينات",
      "كود المجلد أو اسمه *": binders[0]?.code || "AMN-01",
      "عدد الأوراق": 18,
      "الجهة / العميل المستفيد": "إدارة الشؤون الإدارية",
      "تاريخ الإيداع (YYYY/MM/DD)": "2024/02/12",
      "الوصف والملاحظات": "مطالبات التأمين الصحي لمنتسبي القطاع",
      "لون التبويب (اختياري)": "زمردي"
    },
    {
      "اسم الفاصل ومحتواه *": "أذونات الصرف ومحاضر التسليم",
      "كود المجلد أو اسمه *": binders[1]?.code || "MED-01",
      "عدد الأوراق": 42,
      "الجهة / العميل المستفيد": "مستشفى الشرطة",
      "تاريخ الإيداع (YYYY/MM/DD)": "2024/02/15",
      "الوصف والملاحظات": "أذونات استلام الأدوية والمستلزمات الطبية",
      "لون التبويب (اختياري)": "كهرماني"
    }
  ];

  const wsTemplate = XLSX.utils.json_to_sheet(sampleData);
  wsTemplate['!views'] = [{ rightToLeft: true }];
  XLSX.utils.book_append_sheet(wb, wsTemplate, "بيانات الفواصل المراد إيداعها");

  // Reference Sheet: List of Active Binders to help users pick codes
  const bindersRef = binders.map(b => ({
    "كود المجلد (استخدمه في العمود أعلاه)": b.code,
    "اسم المجلد": b.name,
    "الموضوع (الباب)": b.chapterName || '',
    "الخزانة والرف": `${b.cabinet || 'الخزانة الرئيسية'} - ${b.shelf || 'رف 1'}`,
    "السعة المتاحة": `${b.currentSeparatorsCount || 0} / ${b.totalCapacity || 10}`
  }));

  const wsRef = XLSX.utils.json_to_sheet(bindersRef);
  wsRef['!views'] = [{ rightToLeft: true }];
  XLSX.utils.book_append_sheet(wb, wsRef, "دليل أكواد المجلدات النشطة");

  XLSX.writeFile(wb, "نموذج_إيداع_فواصل_الأرشيف.xlsx");
}

/**
 * 3. Parse and Validate Uploaded Excel / CSV File
 */
export async function parseExcelImportFile(file, binders = []) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Take first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          throw new Error('الملف فارغ أو لا يحتوي على صفوف بيانات قابلة للقراءة');
        }

        const colorMap = {
          'سماوي': '#38bdf8',
          'زمردي': '#34d399',
          'أخضر': '#10b981',
          'كهرماني': '#fbbf24',
          'أصفر': '#f59e0b',
          'وردي': '#f87171',
          'أحمر': '#ef4444',
          'بنفسجي': '#a855f7',
          'بترولي': '#0d9488'
        };

        const parsedItems = [];
        let validCount = 0;
        let invalidCount = 0;

        rawRows.forEach((row, idx) => {
          // Normalize column names
          const name = (
            row["اسم الفاصل ومحتواه *"] || 
            row["اسم الفاصل"] || 
            row["العنوان"] || 
            row["name"] || 
            row["title"] || 
            ""
          ).toString().trim();

          const binderInput = (
            row["كود المجلد أو اسمه *"] || 
            row["كود المجلد"] || 
            row["المجلد"] || 
            row["binderCode"] || 
            row["binder"] || 
            ""
          ).toString().trim();

          const papersCount = parseInt(
            row["عدد الأوراق"] || 
            row["الأوراق"] || 
            row["papersCount"] || 
            20
          ) || 20;

          const client = (
            row["الجهة / العميل المستفيد"] || 
            row["الجهة"] || 
            row["العميل"] || 
            row["client"] || 
            "عام"
          ).toString().trim();

          const date = (
            row["تاريخ الإيداع (YYYY/MM/DD)"] || 
            row["تاريخ الإيداع"] || 
            row["التاريخ"] || 
            row["date"] || 
            new Date().toISOString().split('T')[0].replace(/-/g, '/')
          ).toString().trim();

          const description = (
            row["الوصف والملاحظات"] || 
            row["الوصف"] || 
            row["الملاحظات"] || 
            row["description"] || 
            ""
          ).toString().trim();

          const colorInput = (
            row["لون التبويب (اختياري)"] || 
            row["لون التبويب"] || 
            row["اللون"] || 
            row["color"] || 
            "سماوي"
          ).toString().trim();

          const tabColor = colorMap[colorInput] || (colorInput.startsWith('#') ? colorInput : '#38bdf8');

          // Match Binder
          let matchedBinder = null;
          if (binderInput) {
            matchedBinder = binders.find(b => 
              b.code?.toLowerCase() === binderInput.toLowerCase() ||
              b.name?.toLowerCase().includes(binderInput.toLowerCase()) ||
              b.id === binderInput
            );
          }
          if (!matchedBinder && binders.length > 0) {
            matchedBinder = binders[0]; // fallback to first binder
          }

          const isValid = !!name;
          if (isValid) validCount++; else invalidCount++;

          parsedItems.push({
            rowNumber: idx + 2, // 1-indexed Excel row
            name: name || `فاصل كرتوني بدون عنوان (صف ${idx + 2})`,
            binderInput,
            matchedBinder,
            papersCount,
            client,
            date,
            description,
            color: tabColor,
            isValid,
            error: !name ? 'اسم الفاصل مطلوب' : (!matchedBinder ? 'لم يتم العثور على المجلد' : null)
          });
        });

        resolve({
          totalRows: parsedItems.length,
          validCount,
          invalidCount,
          items: parsedItems
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.readAsArrayBuffer(file);
  });
}
