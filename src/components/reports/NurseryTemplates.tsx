import React from 'react';
import { TemplateProps, getSubjectIcon } from './templateTypes';

/* ─────────────────────────────────────────────
   NURSERY TEMPLATE 1 — "Playful & Visual"
   Rounded corners, vibrant gradients, large emoji
   icons beside each subject, colorful star-rating
   for psychomotor, soft pastel color scheme.
   ───────────────────────────────────────────── */

export function NurseryTemplate1({
  learner, examSet, report, settings, sectionKey,
  draftMode, isBlankReportMode,
  teacherSignature, headSignature, schoolStamp
}: TemplateProps) {
  return (
    <div className="relative overflow-hidden bg-white border-[3px] border-purple-300 rounded-3xl p-8 w-full max-w-[800px] text-slate-900 shadow-lg font-sans mx-auto mb-8 page-break-after">
      {/* Draft Watermark */}
      {draftMode && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none">
          <span className="text-rose-500/[0.06] text-[100px] font-black uppercase tracking-widest rotate-[-35deg] whitespace-nowrap">DRAFT</span>
        </div>
      )}

      {/* ── School Header ── */}
      <div className="text-center pb-5 mb-5 border-b-2 border-dashed border-purple-200">
        <div className="flex items-center justify-center gap-4 mb-2">
          {settings.logo && (
            <img src={settings.logo} alt="Logo" className="h-20 w-20 object-contain drop-shadow-md" />
          )}
          <div>
            <h2 className="text-2xl font-extrabold text-purple-800 tracking-wide uppercase">{settings.schoolName}</h2>
            <p className="text-xs italic font-bold text-purple-500 mt-1">"{settings.motto}"</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-1">
          {settings.address} &middot; {settings.tel1} {settings.tel2 ? `& ${settings.tel2}` : ''}
        </p>
      </div>

      {/* ── Report Title Banner ── */}
      <div className="bg-gradient-to-r from-purple-100 via-pink-50 to-purple-100 border border-purple-200 text-center py-2.5 text-sm font-black uppercase tracking-widest text-purple-800 mb-5 rounded-2xl">
        ⭐ {examSet.term.toUpperCase()} {examSet.period} PROGRESS REPORT ({settings.year}) ⭐
      </div>

      {/* ── Student Bio ── */}
      <div className="flex items-start gap-6 mb-5 bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
        {(settings.reportCardVisibility?.showStudentPhoto !== false) && (
          <div className="shrink-0">
            <img
              src={learner.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(learner.name)}`}
              alt={learner.name}
              referrerPolicy="no-referrer"
              className="h-20 w-20 rounded-2xl object-cover border-2 border-purple-200 shadow-md bg-white"
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-xs flex-1">
          <div>
            <span className="text-purple-400 font-bold uppercase text-[9px] tracking-wider block">Pupil's Name</span>
            <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-900 block outline-none">{learner.name}</span>
          </div>
          <div>
            <span className="text-purple-400 font-bold uppercase text-[9px] tracking-wider block">Class</span>
            <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-900 block outline-none">{learner.cls}</span>
          </div>
          <div>
            <span className="text-purple-400 font-bold uppercase text-[9px] tracking-wider block">Age</span>
            <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-900 block outline-none">{learner.age || '-'} yrs</span>
          </div>
          <div>
            <span className="text-purple-400 font-bold uppercase text-[9px] tracking-wider block">Gender</span>
            <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-900 block outline-none">{learner.sex === 'Male' ? 'Boy' : 'Girl'}</span>
          </div>
        </div>
      </div>

      {/* ── Subjects Table with Emoji Icons ── */}
      <div className="mb-5">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black uppercase rounded-t-xl">
              <th className="p-2.5 rounded-tl-xl">📚 Learning Area</th>
              <th className="p-2.5 rounded-tr-xl">Teacher's Observation</th>
            </tr>
          </thead>
          <tbody>
            {report.subjectRows.map((row, i) => (
              <tr key={row.name} className={`border-b border-purple-100 ${i % 2 === 0 ? 'bg-purple-50/30' : 'bg-white'}`}>
                <td className="p-2.5 font-extrabold text-slate-800 w-1/3">
                  <span className="text-lg mr-2">{getSubjectIcon(row.name)}</span>
                  {row.name}
                </td>
                <td className="p-2.5 font-semibold text-slate-700 text-[11px] italic">
                  {isBlankReportMode ? '' : (row.marks !== null ? String(row.marks) : <span className="text-slate-300">—</span>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Summary ── */}
      {/* Nursery uses observations, not marks — no totals/averages */}

      {/* ── Psychomotor ── */}
      {(settings.reportCardVisibility?.showPsychomotor !== false) && (
        <div className="mb-5 bg-gradient-to-br from-sky-50 to-indigo-50 p-4 rounded-2xl border border-sky-100">
          <h4 className="text-[11px] font-black text-sky-700 uppercase tracking-wider mb-3">🌟 Skills & Behaviour</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[10px] font-bold">
            {settings.psychomotor.map(sk => {
              const r = report.psychoRec[sk] || 0;
              return (
                <div key={sk} className="flex justify-between items-center border-b border-sky-100/50 pb-1">
                  <span className="text-slate-600">{sk}</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(v => (
                      <span key={v} className={`text-sm ${!isBlankReportMode && r >= v ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Comments & Signatures ── */}
      <div className="space-y-3 text-xs font-semibold relative">
        {schoolStamp && (
          <div className="absolute right-8 bottom-4 w-20 h-20 opacity-80 pointer-events-none mix-blend-multiply rotate-[15deg] z-10 select-none">
            <img src={schoolStamp} alt="Stamp" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
        )}

        {(settings.reportCardVisibility?.showTeacherComments !== false) && !isBlankReportMode && (
          <>
            <div>
              <span className="text-purple-400 uppercase tracking-wider text-[10px] block mb-0.5">Class Teacher's Remarks:</span>
              <div className="p-2.5 border border-purple-100 bg-purple-50/30 rounded-xl text-slate-800 italic min-h-[40px]">
                {report.commentRec.teacher || "A wonderful young learner showing commendable progress. Keep shining!"}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 items-end relative">
                <span>Initials: <b>{report.commentRec.teacherInitials || '-'}</b></span>
                <span className="relative flex flex-col items-center">
                  {teacherSignature && (
                    <div className="absolute bottom-1 right-2 w-28 h-8 pointer-events-none flex items-center justify-center z-10">
                      <img src={teacherSignature} alt="Signature" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <span className="text-slate-300">Signature: __________________________</span>
                </span>
              </div>
            </div>

            <div>
              <span className="text-purple-400 uppercase tracking-wider text-[10px] block mb-0.5">Head Teacher's Comments:</span>
              <div className="p-2.5 border border-purple-100 bg-purple-50/30 rounded-xl text-slate-800 italic min-h-[40px]">
                {report.commentRec.head || "An excellent early childhood foundation. We encourage parents to continue nurturing curiosity at home."}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 items-end relative">
                <span>Initials: <b>{report.commentRec.headInitials || '-'}</b></span>
                <span className="relative flex flex-col items-center">
                  {headSignature && (
                    <div className="absolute bottom-1 right-2 w-28 h-8 pointer-events-none flex items-center justify-center z-10">
                      <img src={headSignature} alt="Signature" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <span className="text-slate-300">Signature: __________________________</span>
                </span>
              </div>
            </div>
          </>
        )}

        <div className="pt-2 border-t border-purple-100 grid grid-cols-2 gap-4 text-[10px] text-slate-500 font-bold uppercase">
          <div>Next Term Begins: <span contentEditable suppressContentEditableWarning className="text-slate-900 border-b border-purple-200 px-2 font-black outline-none">{isBlankReportMode ? '' : (report.commentRec.nextTermBegins || settings.nextTermBegins || '-')}</span></div>
          <div className="text-right">Printed: <span className="text-slate-900 font-mono">{new Date().toLocaleDateString()}</span></div>
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────
   NURSERY TEMPLATE 2 — "Minimalist Watermark"
   Clean white layout, large centered logo watermark
   behind the grades, soft gray lines, lots of
   white space, thin elegant borders.
   ───────────────────────────────────────────── */

export function NurseryTemplate2({
  learner, examSet, report, settings, sectionKey,
  draftMode, isBlankReportMode,
  teacherSignature, headSignature, schoolStamp
}: TemplateProps) {
  return (
    <div className="relative overflow-hidden bg-white border border-slate-200 p-10 w-full max-w-[800px] text-slate-900 shadow-sm font-sans mx-auto mb-8 page-break-after">
      {/* CENTER LOGO WATERMARK */}
      {settings.logo && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none">
          <img src={settings.logo} alt="" className="w-64 h-64 object-contain opacity-[0.04]" />
        </div>
      )}

      {/* Draft Watermark */}
      {draftMode && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none">
          <span className="text-rose-500/[0.05] text-[100px] font-black uppercase tracking-widest rotate-[-35deg] whitespace-nowrap">DRAFT</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="text-center pb-6 mb-6 border-b border-slate-100">
        <div className="flex items-center justify-center gap-3 mb-1">
          {settings.logo && (
            <img src={settings.logo} alt="Logo" className="h-14 w-14 object-contain" />
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider">{settings.schoolName}</h2>
            <p className="text-[10px] italic text-slate-400 mt-0.5">"{settings.motto}"</p>
          </div>
        </div>
        <p className="text-[9px] text-slate-300 uppercase tracking-[0.2em] mt-2">
          {settings.address} &middot; {settings.tel1}
        </p>
      </div>

      {/* ── Title ── */}
      <div className="text-center mb-6">
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-[0.3em]">
          {examSet.term} {examSet.period} — Progress Report {settings.year}
        </h3>
        <div className="w-16 h-px bg-slate-200 mx-auto mt-2"></div>
      </div>

      {/* ── Bio Row ── */}
      <div className="flex items-center gap-6 mb-8">
        {(settings.reportCardVisibility?.showStudentPhoto !== false) && (
          <img
            src={learner.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(learner.name)}`}
            alt={learner.name}
            referrerPolicy="no-referrer"
            className="h-16 w-16 rounded-full object-cover border border-slate-200 bg-slate-50"
          />
        )}
        <div className="grid grid-cols-3 gap-y-3 gap-x-8 text-xs flex-1">
          <div>
            <span className="text-slate-300 uppercase text-[8px] tracking-[0.15em] block">Name</span>
            <span contentEditable suppressContentEditableWarning className="font-bold text-slate-800 block outline-none">{learner.name}</span>
          </div>
          <div>
            <span className="text-slate-300 uppercase text-[8px] tracking-[0.15em] block">Class</span>
            <span contentEditable suppressContentEditableWarning className="font-bold text-slate-800 block outline-none">{learner.cls}</span>
          </div>
          <div>
            <span className="text-slate-300 uppercase text-[8px] tracking-[0.15em] block">Age</span>
            <span contentEditable suppressContentEditableWarning className="font-bold text-slate-800 block outline-none">{learner.age || '-'} yrs</span>
          </div>
        </div>
      </div>

      {/* ── Subjects ── */}
      <div className="mb-6 relative z-[1]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b-2 border-slate-200 text-slate-400 uppercase text-[9px] tracking-wider">
              <th className="pb-2 text-left font-bold">Learning Area</th>
              <th className="pb-2 text-left font-bold">Teacher's Observation</th>
            </tr>
          </thead>
          <tbody>
            {report.subjectRows.map(row => (
              <tr key={row.name} className="border-b border-slate-50">
                <td className="py-2.5 font-semibold text-slate-700 w-1/3">
                  <span className="mr-2 text-base">{getSubjectIcon(row.name)}</span>
                  {row.name}
                </td>
                <td className="py-2.5 text-slate-600 italic text-[11px]">
                  {isBlankReportMode ? '' : (row.marks !== null ? String(row.marks) : '-')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Summary ── */}
      {/* Nursery uses observations, not marks — no totals/averages */}

      {/* ── Psychomotor ── */}
      {(settings.reportCardVisibility?.showPsychomotor !== false) && (
        <div className="mb-6 border-t border-b border-slate-100 py-4">
          <h4 className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-3">Skills & Behaviour</h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[10px]">
            {settings.psychomotor.map(sk => {
              const r = report.psychoRec[sk] || 0;
              return (
                <div key={sk} className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">{sk}</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(v => (
                      <span key={v} className={`inline-block w-4 h-1 rounded-full ${!isBlankReportMode && r >= v ? 'bg-slate-700' : 'bg-slate-100'}`}></span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Comments ── */}
      <div className="space-y-4 text-xs relative z-[1]">
        {schoolStamp && (
          <div className="absolute right-8 bottom-4 w-20 h-20 opacity-80 pointer-events-none mix-blend-multiply rotate-[15deg] z-10 select-none">
            <img src={schoolStamp} alt="Stamp" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
        )}

        {(settings.reportCardVisibility?.showTeacherComments !== false) && !isBlankReportMode && (
          <>
            <div>
              <span className="text-slate-300 uppercase text-[8px] tracking-[0.15em] block mb-1">Class Teacher</span>
              <div className="p-3 border border-slate-100 rounded-lg text-slate-600 italic min-h-[36px]">
                {report.commentRec.teacher || "A wonderful young learner showing commendable progress."}
              </div>
              <div className="flex justify-between text-[10px] text-slate-300 mt-1 items-end relative">
                <span>Initials: <b className="text-slate-500">{report.commentRec.teacherInitials || '-'}</b></span>
                <span className="relative">
                  {teacherSignature && (
                    <div className="absolute bottom-1 right-2 w-24 h-7 pointer-events-none flex items-center justify-center z-10">
                      <img src={teacherSignature} alt="Sig" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <span>Sign: __________________________</span>
                </span>
              </div>
            </div>
            <div>
              <span className="text-slate-300 uppercase text-[8px] tracking-[0.15em] block mb-1">Head Teacher</span>
              <div className="p-3 border border-slate-100 rounded-lg text-slate-600 italic min-h-[36px]">
                {report.commentRec.head || "An excellent early childhood foundation. We encourage parents to nurture curiosity at home."}
              </div>
              <div className="flex justify-between text-[10px] text-slate-300 mt-1 items-end relative">
                <span>Initials: <b className="text-slate-500">{report.commentRec.headInitials || '-'}</b></span>
                <span className="relative">
                  {headSignature && (
                    <div className="absolute bottom-1 right-2 w-24 h-7 pointer-events-none flex items-center justify-center z-10">
                      <img src={headSignature} alt="Sig" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <span>Sign: __________________________</span>
                </span>
              </div>
            </div>
          </>
        )}

        <div className="pt-3 border-t border-slate-50 flex justify-between text-[9px] text-slate-300 font-medium uppercase tracking-wider">
          <span>Next Term: <span contentEditable suppressContentEditableWarning className="text-slate-600 font-bold outline-none">{isBlankReportMode ? '' : (report.commentRec.nextTermBegins || settings.nextTermBegins || '-')}</span></span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   NURSERY TEMPLATE 3 — "Card Layout"
   ───────────────────────────────────────────── */
export function NurseryTemplate3({
  learner, examSet, report, settings, sectionKey,
  draftMode, isBlankReportMode,
  teacherSignature, headSignature, schoolStamp
}: TemplateProps) {
  return (
    <div className="relative overflow-hidden bg-[#fdfbf7] border-4 border-emerald-400 rounded-xl p-8 w-full max-w-[800px] text-slate-800 shadow-md font-sans mx-auto mb-8 page-break-after">
      {draftMode && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none">
          <span className="text-gray-200 text-9xl font-black rotate-[-30deg] tracking-widest opacity-30">DRAFT</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-center mb-6 relative z-10 border-b-4 border-emerald-400 pb-4">
        {settings.reportCardVisibility?.showSchoolLogo && settings.logo && (
          <img src={settings.logo} alt="Logo" className="h-20 w-20 object-contain mb-3" />
        )}
        <h1 className="text-3xl font-black text-emerald-700 text-center uppercase tracking-wider">{settings.schoolName}</h1>
        <p className="text-sm font-semibold mt-1">{settings.address} | Tel: {settings.schoolPhone}</p>
        <p className="text-sm font-semibold">{settings.schoolEmail} | {settings.schoolWebsite}</p>
        <h2 className="mt-4 text-xl font-bold bg-emerald-100 text-emerald-800 px-6 py-2 rounded-full uppercase tracking-widest">
          {examSet.term} Report - {settings.year}
        </h2>
      </div>

      {/* Learner Info Card */}
      <div className="bg-white rounded-xl border-2 border-emerald-200 p-4 mb-6 shadow-sm relative z-10 flex gap-4 items-center">
        {settings.showStudentPhoto && learner.photoUrl ? (
           <img src={learner.photoUrl} alt={learner.name} className="w-20 h-20 object-cover rounded-full border-4 border-emerald-100" />
        ) : (
           <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center">
             <span className="text-emerald-300 text-2xl font-bold">😊</span>
           </div>
        )}
        <div className="flex-1 grid grid-cols-2 gap-4">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Learner Name</p>
             <p className="font-black text-lg">{learner.name}</p>
           </div>
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Class</p>
             <p className="font-bold text-lg text-emerald-600">{learner.cls}</p>
           </div>
        </div>
      </div>

      {/* Subject Cards */}
      <div className="relative z-10 mb-6">
        <h3 className="text-lg font-black text-emerald-800 mb-4 flex items-center gap-2">
          <span>📚</span> Learning Progress
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {report.subjectRows.map((sub, i) => (
            <div key={i} className="bg-white border-2 border-slate-100 rounded-xl p-4 shadow-sm flex items-start gap-3 hover:border-emerald-300 transition-colors">
               <div className="text-3xl p-2 bg-emerald-50 rounded-lg">
                 {getSubjectIcon(sub.name)}
               </div>
               <div className="flex-1">
                   {!isBlankReportMode && sub.marks !== null ? (
                     <div className="mt-2">
                       <p className="text-xs text-slate-600 italic leading-relaxed">{String(sub.marks)}</p>
                     </div>
                   ) : (
                     <div className="mt-3 border-b-2 border-dashed border-slate-300 w-full h-4"></div>
                   )}
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Psychomotor Cards */}
      {settings.showPsychomotor && (
        <div className="relative z-10 mb-8 bg-emerald-50 rounded-xl p-5 border border-emerald-100">
           <h3 className="text-lg font-black text-emerald-800 mb-4 flex items-center gap-2">
             <span>🎨</span> Skills & Behavior
           </h3>
           <div className="grid grid-cols-3 gap-3">
             {Object.entries(report.psychoRec).map(([key, val], i) => (
               <div key={i} className="bg-white rounded-lg p-2 text-center border border-emerald-100 shadow-sm">
                 <p className="text-xs font-bold text-slate-600 mb-1 leading-tight">{key}</p>
                 {!isBlankReportMode && val !== 0 ? (
                   <p className="text-lg font-black text-emerald-600">{val}/5</p>
                 ) : (
                   <p className="text-slate-300">-</p>
                 )}
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Teacher Comments */}
      {settings.reportCardVisibility?.showTeacherComments && (
        <div className="relative z-10 space-y-4">
          <div className="bg-white border-2 border-emerald-100 rounded-xl p-4 shadow-sm">
             <h4 className="text-xs font-black text-emerald-500 uppercase tracking-wider mb-2">Class Teacher's Remark</h4>
             <p className="text-sm font-medium italic text-slate-700 min-h-[3rem]">
               {!isBlankReportMode ? report.commentRec.teacher : ''}
             </p>
             <div className="mt-4 flex justify-between items-end">
               {teacherSignature ? (
                  <img src={teacherSignature} alt="Teacher Sig" className="h-10 object-contain" />
               ) : (
                  <div className="border-b-2 border-dashed border-slate-300 w-32"></div>
               )}
               <span className="text-xs font-bold text-slate-400">Teacher: {report.commentRec.teacherInitials || '________'}</span>
             </div>
          </div>
          
          <div className="bg-white border-2 border-emerald-100 rounded-xl p-4 shadow-sm">
             <h4 className="text-xs font-black text-emerald-500 uppercase tracking-wider mb-2">Head Teacher's Remark</h4>
             <p className="text-sm font-medium italic text-slate-700 min-h-[3rem]">
               {!isBlankReportMode ? report.commentRec.head : ''}
             </p>
             <div className="mt-4 flex justify-between items-end">
               <div className="flex items-end gap-4">
                 {headSignature ? (
                    <img src={headSignature} alt="Head Sig" className="h-12 object-contain" />
                 ) : (
                    <div className="border-b-2 border-dashed border-slate-300 w-32"></div>
                 )}
                 {schoolStamp && <img src={schoolStamp} alt="Stamp" className="h-16 opacity-80" />}
               </div>
               <span className="text-xs font-bold text-slate-400">Head: {report.commentRec.headInitials || '________'}</span>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ─────────────────────────────────────────────
   NURSERY TEMPLATE 4 — "Bright Grid"
   ───────────────────────────────────────────── */
export function NurseryTemplate4({
  learner, examSet, report, settings, sectionKey,
  draftMode, isBlankReportMode,
  teacherSignature, headSignature, schoolStamp
}: TemplateProps) {
  return (
    <div className="relative overflow-hidden bg-white border-8 border-amber-300 p-8 w-full max-w-[800px] text-slate-900 mx-auto mb-8 page-break-after">
      {draftMode && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none">
          <span className="text-gray-200 text-9xl font-black rotate-[-30deg] tracking-widest opacity-30">DRAFT</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center border-b-4 border-amber-300 pb-4 mb-6 relative z-10">
        <div className="flex-1">
          <h1 className="text-2xl font-black text-amber-600 uppercase tracking-widest">{settings.schoolName}</h1>
          <p className="text-xs font-bold text-slate-500">{settings.address} | {settings.schoolPhone}</p>
        </div>
        {settings.reportCardVisibility?.showSchoolLogo && settings.logo && (
          <img src={settings.logo} alt="Logo" className="h-16 w-16 object-contain" />
        )}
      </div>

      <div className="text-center mb-6 relative z-10">
        <h2 className="text-xl font-bold bg-amber-400 text-white inline-block px-8 py-2 rounded-full uppercase shadow-sm">
          {examSet.term} Report / {settings.year}
        </h2>
      </div>

      {/* Learner Info */}
      <div className="grid grid-cols-4 gap-0 border-2 border-slate-300 mb-8 relative z-10 font-bold text-sm bg-slate-50">
        <div className="col-span-1 border-r-2 border-slate-300 p-2 text-slate-500 uppercase text-xs flex items-center justify-center">Name</div>
        <div className="col-span-3 p-2 text-lg text-slate-800">{learner.name}</div>
        
        <div className="col-span-1 border-r-2 border-t-2 border-slate-300 p-2 text-slate-500 uppercase text-xs flex items-center justify-center">Class</div>
        <div className="col-span-1 border-r-2 border-t-2 border-slate-300 p-2 text-slate-800">{learner.cls}</div>
        
        <div className="col-span-1 border-r-2 border-t-2 border-slate-300 p-2 text-slate-500 uppercase text-xs flex items-center justify-center">Gender</div>
        <div className="col-span-1 border-t-2 border-slate-300 p-2 text-slate-800">{learner.gender || '-'}</div>
      </div>

      {/* Subjects */}
      <div className="relative z-10 mb-8">
        <table className="w-full border-collapse border-2 border-slate-300">
          <thead>
            <tr className="bg-amber-100 text-amber-900 uppercase text-xs tracking-wider">
              <th className="border-2 border-slate-300 p-3 text-left">Learning Area</th>
              <th className="border-2 border-slate-300 p-3 text-left">Teacher's Observation</th>
            </tr>
          </thead>
          <tbody>
            {report.subjectRows.map((sub, i) => (
              <tr key={i} className="hover:bg-amber-50 font-bold">
                <td className="border-2 border-slate-300 p-3 flex items-center gap-2">
                  <span className="text-xl">{getSubjectIcon(sub.name)}</span> {sub.name}
                </td>
                <td className="border-2 border-slate-300 p-3 text-sm font-medium italic">{!isBlankReportMode && sub.marks !== null ? String(sub.marks) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Grid for Psychomotor & Comments */}
      <div className="grid grid-cols-2 gap-6 relative z-10">
        {settings.showPsychomotor && (
          <div>
            <h3 className="font-black text-amber-600 uppercase mb-2 border-b-2 border-amber-200 pb-1">Behavior & Skills</h3>
            <table className="w-full border-collapse border-2 border-slate-300 text-sm font-bold">
              <tbody>
                {Object.entries(report.psychoRec).map(([key, val], i) => (
                  <tr key={i}>
                    <td className="border-2 border-slate-300 p-2">{key}</td>
                    <td className="border-2 border-slate-300 p-2 text-center w-16">{!isBlankReportMode && val !== 0 ? val : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {settings.reportCardVisibility?.showTeacherComments && (
          <div className="flex flex-col gap-4">
            <div className="border-2 border-slate-300 p-4 flex-1 flex flex-col">
               <h4 className="text-xs font-black text-slate-500 uppercase mb-1">Teacher's Remark</h4>
               <p className="text-sm font-medium italic flex-1">{!isBlankReportMode ? report.commentRec.teacher : ''}</p>
               <div className="mt-2 flex justify-between items-end border-t border-slate-200 pt-2">
                 {teacherSignature ? <img src={teacherSignature} className="h-8" /> : <span></span>}
                 <span className="text-xs">Tr: {report.commentRec.teacherInitials}</span>
               </div>
            </div>
            <div className="border-2 border-slate-300 p-4 flex-1 flex flex-col">
               <h4 className="text-xs font-black text-slate-500 uppercase mb-1">Head Teacher's Remark</h4>
               <p className="text-sm font-medium italic flex-1">{!isBlankReportMode ? report.commentRec.head : ''}</p>
               <div className="mt-2 flex justify-between items-end border-t border-slate-200 pt-2">
                 <div className="flex gap-2 items-end">
                   {headSignature ? <img src={headSignature} className="h-10" /> : <span></span>}
                   {schoolStamp && <img src={schoolStamp} className="h-12 opacity-80" />}
                 </div>
                 <span className="text-xs">Head: {report.commentRec.headInitials}</span>
               </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────
   NURSERY TEMPLATE 5 — "Storybook Minimal"
   ───────────────────────────────────────────── */
export function NurseryTemplate5({
  learner, examSet, report, settings, sectionKey,
  draftMode, isBlankReportMode,
  teacherSignature, headSignature, schoolStamp
}: TemplateProps) {
  return (
    <div className="relative overflow-hidden bg-white border-2 border-dashed border-rose-300 rounded-3xl p-10 w-full max-w-[800px] text-slate-800 shadow-sm font-sans mx-auto mb-8 page-break-after">
      {draftMode && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none">
          <span className="text-gray-100 text-9xl font-black rotate-[-30deg] tracking-widest opacity-40">DRAFT</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center relative z-10 mb-8">
        {settings.reportCardVisibility?.showSchoolLogo && settings.logo && (
          <img src={settings.logo} alt="Logo" className="h-16 w-16 object-contain mx-auto mb-2" />
        )}
        <h1 className="text-2xl font-black text-rose-500 tracking-wider">{settings.schoolName}</h1>
        <p className="text-sm text-slate-500 italic mt-1">{settings.address}</p>
        <div className="mt-4 inline-block border-b-2 border-rose-200 pb-1 px-8">
          <span className="font-bold text-rose-400 uppercase tracking-widest">{examSet.term} / {settings.year}</span>
        </div>
      </div>

      {/* Learner Info */}
      <div className="flex items-center justify-center gap-8 mb-10 relative z-10">
         <div className="text-right">
           <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Name</p>
           <p className="text-xl font-black">{learner.name}</p>
         </div>
         <div className="w-px h-10 bg-rose-200"></div>
         <div className="text-left">
           <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Class</p>
           <p className="text-xl font-black text-rose-500">{learner.cls}</p>
         </div>
      </div>

      {/* Subjects list as soft pills */}
      <div className="relative z-10 mb-10 space-y-3">
         {report.subjectRows.map((sub, i) => (
           <div key={i} className="flex items-center bg-rose-50 rounded-full px-6 py-3">
              <span className="text-2xl mr-4">{getSubjectIcon(sub.name)}</span>
              <span className="font-bold flex-1 text-lg">{sub.name}</span>
              {!isBlankReportMode && sub.marks !== null ? (
                <span className="italic text-sm text-slate-500 text-right pr-4 flex-1">{String(sub.marks)}</span>
              ) : (
                <div className="flex-1 border-b-2 border-dashed border-rose-200 mx-4 h-4"></div>
              )}
           </div>
         ))}
      </div>

      {settings.reportCardVisibility?.showTeacherComments && (
        <div className="relative z-10 grid grid-cols-2 gap-8 text-center mt-12">
          <div>
            <p className="text-sm italic text-slate-600 min-h-[3rem]">"{!isBlankReportMode ? report.commentRec.teacher : ''}"</p>
            <div className="flex justify-center mt-4 h-12">
               {teacherSignature ? <img src={teacherSignature} className="h-10 object-contain" /> : <div className="border-b border-slate-300 w-32 self-end"></div>}
            </div>
            <p className="text-xs font-bold text-rose-400 uppercase mt-2">Class Teacher</p>
          </div>
          <div>
            <p className="text-sm italic text-slate-600 min-h-[3rem]">"{!isBlankReportMode ? report.commentRec.head : ''}"</p>
            <div className="flex justify-center mt-4 h-12 relative">
               {headSignature ? <img src={headSignature} className="h-12 object-contain" /> : <div className="border-b border-slate-300 w-32 self-end"></div>}
               {schoolStamp && <img src={schoolStamp} className="h-16 absolute -right-4 -bottom-4 opacity-50" />}
            </div>
            <p className="text-xs font-bold text-rose-400 uppercase mt-2">Head Teacher</p>
          </div>
        </div>
      )}

    </div>
  );
}
