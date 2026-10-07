import React from 'react';
import { TemplateProps } from './templateTypes';

/* ─────────────────────────────────────────────
   PRIMARY TEMPLATE 1 — "Classic Elegant"
   Traditional tabular layout with double borders,
   formal styling, and a DIAGONAL TEXT WATERMARK
   of the school name behind the grades table.
   ───────────────────────────────────────────── */

export function PrimaryTemplate1({
  learner, examSet, report, settings, sectionKey,
  draftMode, isBlankReportMode,
  teacherSignature, headSignature, schoolStamp
}: TemplateProps) {
  return (
    <div className="relative overflow-hidden bg-white border-[3px] border-double border-slate-800 p-8 w-full max-w-[800px] text-slate-900 shadow-lg font-serif mx-auto mb-8 page-break-after">
      {/* DIAGONAL TEXT WATERMARK — School Name */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none overflow-hidden">
        <span className="text-slate-800/[0.03] text-[72px] font-black uppercase tracking-[0.3em] rotate-[-40deg] whitespace-nowrap">
          {settings.schoolName}
        </span>
      </div>

      {/* Draft Watermark */}
      {draftMode && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none">
          <span className="text-rose-500/[0.06] text-[100px] font-black uppercase tracking-widest rotate-[-35deg] whitespace-nowrap">DRAFT</span>
        </div>
      )}
      {draftMode && (
        <div className="absolute top-3 right-3 bg-rose-50 text-rose-800 border-2 border-rose-300 font-extrabold px-3 py-1 rounded-md text-[9px] uppercase tracking-widest rotate-[12deg] shadow-xs z-10">
          DRAFT COPY
        </div>
      )}

      {/* ── Header ── */}
      <div className="text-center border-b-[3px] border-double border-slate-800 pb-5 mb-5 relative z-[1]">
        <div className="flex items-center justify-center gap-5 mb-2">
          {settings.logo && (settings.reportCardVisibility?.showSchoolLogo !== false) && (
            <img src={settings.logo} alt="Logo" className="h-18 w-18 object-contain" />
          )}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-wider uppercase" style={{fontFamily: 'Georgia, serif'}}>{settings.schoolName}</h2>
            <p className="text-xs italic text-slate-500 mt-1" style={{fontFamily: 'Georgia, serif'}}>"{settings.motto}"</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.2em] mt-1">
          {settings.address} &middot; Tel: {settings.tel1} {settings.tel2 ? `/ ${settings.tel2}` : ''}
        </p>
      </div>

      {/* ── Report Title ── */}
      <div className="relative z-[1] border-2 border-slate-700 text-center py-2 text-sm font-black uppercase tracking-[0.25em] text-slate-800 mb-5 bg-slate-50" style={{fontFamily: 'Georgia, serif'}}>
        {examSet.term.toUpperCase()} {examSet.period} REPORT CARD — YEAR {settings.year}
      </div>

      {/* ── Student Info ── */}
      <div className="relative z-[1] flex flex-col-reverse sm:flex-row justify-between items-start gap-6 border-b-2 border-slate-300 pb-4 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-xs flex-1 font-sans">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Student's Name</span>
            <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-900 block outline-none">{learner.name}</span>
          </div>
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Admission No</span>
            <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-900 font-mono block outline-none">{learner.admNo || '-'}</span>
          </div>
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Class</span>
            <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-900 block outline-none">{learner.cls}</span>
          </div>
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Sex</span>
            <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-900 block outline-none">{learner.sex === 'Male' ? 'Boy' : 'Girl'}</span>
          </div>
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Age</span>
            <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-900 block outline-none">{learner.age || '-'} yrs</span>
          </div>
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">LIN</span>
            <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-900 font-mono block outline-none">{learner.lin || '-'}</span>
          </div>
          {learner.unebNo && (
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">UNEB Index</span>
              <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-amber-700 font-mono block outline-none">{learner.unebNo}</span>
            </div>
          )}
        </div>
        {(settings.reportCardVisibility?.showStudentPhoto !== false) && (
          <div className="shrink-0 border-2 border-slate-300 p-1 bg-white">
            <img
              src={learner.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(learner.name)}`}
              alt={learner.name}
              referrerPolicy="no-referrer"
              className="h-16 w-16 object-cover bg-slate-100"
            />
          </div>
        )}
      </div>

      {/* ── Grades Table ── */}
      <div className="mb-5 relative z-[1]">
        <table className="w-full text-left text-xs border-collapse border-2 border-slate-700">
          <thead>
            <tr className="bg-slate-800 text-white uppercase font-black text-[10px] tracking-wider" style={{fontFamily: 'Georgia, serif'}}>
              <th className="p-2.5 border border-slate-600">Subject</th>
              <th className="p-2.5 border border-slate-600 text-center w-20">Marks</th>
              <th className="p-2.5 border border-slate-600 text-center w-16">Grade</th>
              {(settings.reportCardVisibility?.showRankingTable !== false) && (
                <th className="p-2.5 border border-slate-600 text-center w-16">Rank</th>
              )}
              <th className="p-2.5 border border-slate-600">Teacher Remarks</th>
            </tr>
          </thead>
          <tbody>
            {report.subjectRows.map((row, i) => (
              <tr key={row.name} className={`border-b border-slate-300 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                <td className="p-2 border border-slate-300 font-extrabold text-slate-800 uppercase text-[11px]">{row.name}</td>
                <td className="p-2 border border-slate-300 text-center font-bold text-slate-900 text-sm">
                  {isBlankReportMode ? '' : (row.marks !== null ? row.marks : <span className="text-slate-200">—</span>)}
                </td>
                <td className="p-2 border border-slate-300 text-center font-black text-sm text-slate-950">{isBlankReportMode ? '' : row.grade}</td>
                {(settings.reportCardVisibility?.showRankingTable !== false) && (
                  <td className="p-2 border border-slate-300 text-center font-mono font-bold text-xs text-blue-700">{isBlankReportMode ? '' : (row.rank || '-')}</td>
                )}
                <td className="p-2 border border-slate-300 font-semibold text-slate-500 text-[10px] italic">{isBlankReportMode ? '' : row.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Grading Key ── */}
      {(settings.reportCardVisibility?.showGradingScale !== false) && (
        <div className="relative z-[1] bg-slate-50 border border-slate-200 p-2 text-[8px] text-slate-500 mb-4 font-semibold text-center flex flex-wrap justify-center gap-x-3 gap-y-0.5">
          <span className="font-black uppercase text-slate-700">Key:</span>
          {report.grading.map(g => (
            <span key={g.grade}><b>{g.grade}</b> ({g.min}-{g.max}): {g.remark}</span>
          ))}
        </div>
      )}

      {/* ── Summary ── */}
      {!isBlankReportMode && (
        <div className={`relative z-[1] border-2 border-slate-400 p-4 mb-4 grid gap-4 text-xs font-semibold font-sans ${
          settings.reportCardVisibility?.showRankingTable !== false ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'
        }`}>
          <div><span className="text-slate-400 block text-[9px] uppercase">Total</span><b className="text-slate-900 text-sm">{report.total}</b></div>
          <div><span className="text-slate-400 block text-[9px] uppercase">Average</span><b className="text-slate-900 text-sm">{report.average}%</b></div>
          {(settings.reportCardVisibility?.showRankingTable !== false) && (
            <div><span className="text-slate-400 block text-[9px] uppercase">Position</span><b className="text-slate-900 text-sm">{report.positionText}</b></div>
          )}
          <div><span className="text-slate-400 block text-[9px] uppercase">Grade</span><b className="text-slate-900 text-sm">{report.overallGrade}</b></div>
        </div>
      )}

      {/* ── Psychomotor ── */}
      {(settings.reportCardVisibility?.showPsychomotor !== false) && (
        <div className="relative z-[1] mb-4 border border-slate-300 overflow-hidden">
          <div className="bg-slate-800 px-3 py-1.5 text-[10px] font-black text-white uppercase tracking-wider" style={{fontFamily: 'Georgia, serif'}}>
            Psychomotor Skills & Behavioural Assessment
          </div>
          <div className="p-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[10px] font-bold font-sans">
            {settings.psychomotor.map(sk => {
              const r = report.psychoRec[sk] || 0;
              return (
                <div key={sk} className="flex justify-between items-center border-b border-slate-100 pb-1">
                  <span className="text-slate-600 uppercase tracking-wide">{sk}</span>
                  <div className="flex items-center gap-0.5">
                    {[5,4,3,2,1].map(v => (
                      <span key={v} className={`inline-block px-1 rounded-sm text-[8px] border font-mono ${
                        !isBlankReportMode && r === v ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-200 border-slate-100'
                      }`}>{v}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-slate-50 px-3 py-1 text-[8px] text-slate-400 text-center font-medium border-t border-slate-100">
            5 = Excellent &middot; 4 = Very Good &middot; 3 = Good &middot; 2 = Fair &middot; 1 = Poor
          </div>
        </div>
      )}

      {/* ── Comments ── */}
      <div className="relative z-[1] space-y-3 text-xs font-semibold leading-relaxed font-sans">
        {schoolStamp && (
          <div className="absolute right-10 bottom-6 w-22 h-22 opacity-85 pointer-events-none mix-blend-multiply rotate-[15deg] z-10 select-none">
            <img src={schoolStamp} alt="Stamp" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
        )}

        {(settings.reportCardVisibility?.showTeacherComments !== false) && !isBlankReportMode && (
          <>
            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[9px] block mb-0.5">Class Teacher's Assessment:</span>
              <div className="p-2.5 border border-slate-200 bg-slate-50/50 text-slate-800 italic min-h-[40px]">
                {report.commentRec.teacher || "Shows great potential. Needs to continue keeping up with the standard work pace."}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 items-end relative">
                <span>Initials: <b>{report.commentRec.teacherInitials || '-'}</b></span>
                <span className="relative">
                  {teacherSignature && (
                    <div className="absolute bottom-1 right-2 w-28 h-8 pointer-events-none flex items-center justify-center z-10">
                      <img src={teacherSignature} alt="Sig" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <span className="text-slate-300">Signature: __________________________</span>
                </span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[9px] block mb-0.5">Head Teacher's Recommendation:</span>
              <div className="p-2.5 border border-slate-200 bg-slate-50/50 text-slate-800 italic min-h-[40px]">
                {report.commentRec.head || "An encouraging performance sheet. Work for even higher results next term."}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 items-end relative">
                <span>Initials: <b>{report.commentRec.headInitials || '-'}</b></span>
                <span className="relative">
                  {headSignature && (
                    <div className="absolute bottom-1 right-2 w-28 h-8 pointer-events-none flex items-center justify-center z-10">
                      <img src={headSignature} alt="Sig" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <span className="text-slate-300">Signature: __________________________</span>
                </span>
              </div>
            </div>
          </>
        )}

        <div className="pt-2 border-t-2 border-slate-300 grid grid-cols-2 gap-4 text-[10px] text-slate-500 font-bold uppercase">
          <div>Next Term Begins: <span contentEditable suppressContentEditableWarning className="text-slate-900 border-b border-slate-300 px-2 font-black outline-none">{isBlankReportMode ? '' : (report.commentRec.nextTermBegins || settings.nextTermBegins || '-')}</span></div>
          <div className="text-right">Generated: <span className="text-slate-900 font-mono">{new Date().toLocaleDateString()}</span></div>
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────
   PRIMARY TEMPLATE 2 — "Modern Corporate"
   Sleek, minimal design with subtle gray bgs,
   a large faded SCHOOL LOGO WATERMARK in the
   center, and thin hairline borders.
   ───────────────────────────────────────────── */

export function PrimaryTemplate2({
  learner, examSet, report, settings, sectionKey,
  draftMode, isBlankReportMode,
  teacherSignature, headSignature, schoolStamp
}: TemplateProps) {
  return (
    <div className="relative overflow-hidden bg-white border border-slate-200 p-10 w-full max-w-[800px] text-slate-900 shadow-sm font-sans mx-auto mb-8 page-break-after">
      {/* LARGE LOGO WATERMARK */}
      {settings.logo && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none">
          <img src={settings.logo} alt="" className="w-72 h-72 object-contain opacity-[0.035]" />
        </div>
      )}

      {/* Draft Watermark */}
      {draftMode && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none">
          <span className="text-rose-500/[0.05] text-[100px] font-black uppercase tracking-widest rotate-[-35deg] whitespace-nowrap">DRAFT</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="relative z-[1] text-center pb-6 mb-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          {settings.logo && (settings.reportCardVisibility?.showSchoolLogo !== false) && (
            <img src={settings.logo} alt="Logo" className="h-14 w-14 object-contain" />
          )}
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 uppercase tracking-[0.15em]">{settings.schoolName}</h2>
            <p className="text-[10px] italic text-slate-400 mt-0.5">"{settings.motto}"</p>
          </div>
        </div>
        <p className="text-[9px] text-slate-300 uppercase tracking-[0.2em] mt-2">
          {settings.address} &middot; {settings.tel1} {settings.tel2 ? `/ ${settings.tel2}` : ''}
        </p>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mt-4"></div>
      </div>

      {/* ── Title ── */}
      <div className="relative z-[1] text-center mb-6">
        <div className="inline-block px-8 py-2 bg-slate-800 text-white text-xs font-bold uppercase tracking-[0.25em] rounded-full">
          {examSet.term} {examSet.period} Report — {settings.year}
        </div>
      </div>

      {/* ── Student Profile ── */}
      <div className="relative z-[1] flex items-start gap-6 mb-6 bg-slate-50/80 p-5 rounded-xl border border-slate-100">
        {(settings.reportCardVisibility?.showStudentPhoto !== false) && (
          <div className="shrink-0">
            <img
              src={learner.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(learner.name)}`}
              alt={learner.name}
              referrerPolicy="no-referrer"
              className="h-16 w-16 rounded-xl object-cover border border-slate-200 bg-white shadow-sm"
            />
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-8 text-xs flex-1">
          <div>
            <span className="text-slate-300 uppercase text-[8px] tracking-[0.15em] block">Student Name</span>
            <span contentEditable suppressContentEditableWarning className="font-bold text-slate-800 block outline-none">{learner.name}</span>
          </div>
          <div>
            <span className="text-slate-300 uppercase text-[8px] tracking-[0.15em] block">Adm. No</span>
            <span contentEditable suppressContentEditableWarning className="font-bold text-slate-800 font-mono block outline-none">{learner.admNo || '-'}</span>
          </div>
          <div>
            <span className="text-slate-300 uppercase text-[8px] tracking-[0.15em] block">Class</span>
            <span contentEditable suppressContentEditableWarning className="font-bold text-slate-800 block outline-none">{learner.cls}</span>
          </div>
          <div>
            <span className="text-slate-300 uppercase text-[8px] tracking-[0.15em] block">Sex</span>
            <span contentEditable suppressContentEditableWarning className="font-bold text-slate-800 block outline-none">{learner.sex === 'Male' ? 'Boy' : 'Girl'}</span>
          </div>
          <div>
            <span className="text-slate-300 uppercase text-[8px] tracking-[0.15em] block">Age</span>
            <span contentEditable suppressContentEditableWarning className="font-bold text-slate-800 block outline-none">{learner.age || '-'} yrs</span>
          </div>
          <div>
            <span className="text-slate-300 uppercase text-[8px] tracking-[0.15em] block">LIN</span>
            <span contentEditable suppressContentEditableWarning className="font-bold text-slate-800 font-mono block outline-none">{learner.lin || '-'}</span>
          </div>
          {learner.unebNo && (
            <div>
              <span className="text-slate-300 uppercase text-[8px] tracking-[0.15em] block">UNEB Index</span>
              <span contentEditable suppressContentEditableWarning className="font-bold text-amber-700 font-mono block outline-none">{learner.unebNo}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Grades Table ── */}
      <div className="mb-5 relative z-[1]">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-400 uppercase text-[9px] tracking-wider border-b-2 border-slate-200">
              <th className="pb-2.5 text-left font-bold">Subject</th>
              <th className="pb-2.5 text-center font-bold w-20">Marks</th>
              <th className="pb-2.5 text-center font-bold w-16">Grade</th>
              {(settings.reportCardVisibility?.showRankingTable !== false) && (
                <th className="pb-2.5 text-center font-bold w-16">Rank</th>
              )}
              <th className="pb-2.5 text-left font-bold">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {report.subjectRows.map((row, i) => (
              <tr key={row.name} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="py-2.5 font-bold text-slate-700 uppercase text-[11px]">{row.name}</td>
                <td className="py-2.5 text-center font-bold text-slate-800 text-sm">
                  {isBlankReportMode ? '' : (row.marks !== null ? row.marks : <span className="text-slate-200">—</span>)}
                </td>
                <td className="py-2.5 text-center font-black text-sm text-slate-600">{isBlankReportMode ? '' : row.grade}</td>
                {(settings.reportCardVisibility?.showRankingTable !== false) && (
                  <td className="py-2.5 text-center font-mono font-bold text-xs text-blue-600">{isBlankReportMode ? '' : (row.rank || '-')}</td>
                )}
                <td className="py-2.5 text-slate-400 italic text-[10px]">{isBlankReportMode ? '' : row.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Grading Key ── */}
      {(settings.reportCardVisibility?.showGradingScale !== false) && (
        <div className="relative z-[1] text-[8px] text-slate-400 mb-4 text-center flex flex-wrap justify-center gap-x-3 gap-y-0.5">
          {report.grading.map(g => (
            <span key={g.grade}><b className="text-slate-500">{g.grade}</b> ({g.min}-{g.max}): {g.remark}</span>
          ))}
        </div>
      )}

      {/* ── Summary Cards ── */}
      {!isBlankReportMode && (
        <div className={`relative z-[1] grid gap-3 mb-5 ${
          settings.reportCardVisibility?.showRankingTable !== false ? 'grid-cols-4' : 'grid-cols-3'
        }`}>
          <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
            <span className="text-[8px] text-slate-400 uppercase tracking-wider block">Total</span>
            <b className="text-slate-800 text-base">{report.total}</b>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
            <span className="text-[8px] text-slate-400 uppercase tracking-wider block">Average</span>
            <b className="text-slate-800 text-base">{report.average}%</b>
          </div>
          {(settings.reportCardVisibility?.showRankingTable !== false) && (
            <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
              <span className="text-[8px] text-slate-400 uppercase tracking-wider block">Position</span>
              <b className="text-slate-800 text-base">{report.positionText}</b>
            </div>
          )}
          <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
            <span className="text-[8px] text-slate-400 uppercase tracking-wider block">Performance</span>
            <b className="text-slate-800 text-sm">{report.overallGrade}</b>
          </div>
        </div>
      )}

      {/* ── Psychomotor ── */}
      {(settings.reportCardVisibility?.showPsychomotor !== false) && (
        <div className="relative z-[1] mb-5 py-4 border-t border-b border-slate-100">
          <h4 className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-3">Skills & Behaviour</h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[10px]">
            {settings.psychomotor.map(sk => {
              const r = report.psychoRec[sk] || 0;
              return (
                <div key={sk} className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">{sk}</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(v => (
                      <span key={v} className={`inline-block w-5 h-1.5 rounded-full ${
                        !isBlankReportMode && r >= v ? 'bg-slate-600' : 'bg-slate-100'
                      }`}></span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Comments ── */}
      <div className="relative z-[1] space-y-3.5 text-xs font-semibold">
        {schoolStamp && (
          <div className="absolute right-8 bottom-4 w-20 h-20 opacity-80 pointer-events-none mix-blend-multiply rotate-[15deg] z-10 select-none">
            <img src={schoolStamp} alt="Stamp" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
        )}

        {(settings.reportCardVisibility?.showTeacherComments !== false) && !isBlankReportMode && (
          <>
            <div>
              <span className="text-slate-300 uppercase text-[8px] tracking-[0.15em] block mb-1">Class Teacher's Remarks</span>
              <div className="p-3 border border-slate-100 rounded-lg text-slate-700 italic min-h-[36px]">
                {report.commentRec.teacher || "Shows great potential. Needs to continue keeping up with the standard work pace."}
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
              <span className="text-slate-300 uppercase text-[8px] tracking-[0.15em] block mb-1">Head Teacher's Comments</span>
              <div className="p-3 border border-slate-100 rounded-lg text-slate-700 italic min-h-[36px]">
                {report.commentRec.head || "An encouraging performance sheet. Work for even higher results next term."}
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

        <div className="pt-3 flex justify-between text-[9px] text-slate-300 font-medium uppercase tracking-wider border-t border-slate-50">
          <span>Next Term: <span contentEditable suppressContentEditableWarning className="text-slate-600 font-bold outline-none">{isBlankReportMode ? '' : (report.commentRec.nextTermBegins || settings.nextTermBegins || '-')}</span></span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRIMARY TEMPLATE 3 — "Compact Academic"
   ───────────────────────────────────────────── */
export function PrimaryTemplate3({
  learner, examSet, report, settings, sectionKey,
  draftMode, isBlankReportMode,
  teacherSignature, headSignature, schoolStamp
}: TemplateProps) {
  return (
    <div className="relative bg-white border border-slate-400 p-6 w-full max-w-[800px] text-slate-900 font-sans mx-auto mb-8 page-break-after" style={{ fontSize: '0.85rem' }}>
      {draftMode && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none">
          <span className="text-gray-100 text-8xl font-black rotate-[-30deg] tracking-widest opacity-30">DRAFT</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-4 relative z-10">
        <div className="flex-1">
          <h1 className="text-xl font-black uppercase">{settings.schoolName}</h1>
          <p className="font-bold text-slate-600">{settings.address}</p>
          <p className="text-slate-500">Tel: {settings.schoolPhone} | {settings.schoolEmail}</p>
        </div>
        {settings.reportCardVisibility?.showSchoolLogo && settings.logo && (
          <img src={settings.logo} alt="Logo" className="h-16 w-16 object-contain ml-4" />
        )}
      </div>

      <div className="text-center mb-4 relative z-10">
        <h2 className="text-lg font-bold uppercase underline decoration-2 underline-offset-4">Academic Report Card</h2>
        <p className="font-bold mt-1">{examSet.term} / {settings.year}</p>
      </div>

      {/* Learner Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
         <div className="border border-slate-300 p-2">
           <table className="w-full text-left">
             <tbody>
               <tr><th className="w-24">Name:</th><td className="font-black uppercase">{learner.name}</td></tr>
               <tr><th>Class:</th><td className="font-bold">{learner.cls}</td></tr>
               <tr><th>Gender:</th><td>{learner.gender || '-'}</td></tr>
             </tbody>
           </table>
         </div>
         <div className="border border-slate-300 p-2">
           <table className="w-full text-left">
             <tbody>
               <tr><th className="w-28">Total Score:</th><td className="font-black">{!isBlankReportMode ? report.total : ''}</td></tr>
               <tr><th>Division:</th><td className="font-bold">{!isBlankReportMode ? report.overallGrade : ''}</td></tr>
               <tr><th>Aggregates:</th><td>{!isBlankReportMode ? report.average.toFixed(1) : ''}</td></tr>
             </tbody>
           </table>
         </div>
      </div>

      {/* Main Subjects Table */}
      <div className="relative z-10 mb-4">
        <table className="w-full border-collapse border border-slate-400">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-400 p-1.5 text-left">Subject</th>
              <th className="border border-slate-400 p-1.5 text-center w-16">Marks</th>
              <th className="border border-slate-400 p-1.5 text-center w-16">Agg/Gr</th>
              <th className="border border-slate-400 p-1.5 text-left">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {report.subjectRows.map((sub, i) => (
              <tr key={i}>
                <td className="border border-slate-400 p-1.5 font-bold">{sub.name}</td>
                <td className="border border-slate-400 p-1.5 text-center">{!isBlankReportMode && sub.marks !== null ? sub.marks : ''}</td>
                <td className="border border-slate-400 p-1.5 text-center font-bold">{!isBlankReportMode && sub.marks !== null ? sub.grade : ''}</td>
                <td className="border border-slate-400 p-1.5 italic text-slate-600">{!isBlankReportMode ? sub.remark : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grading Scale */}
      {settings.showGradingScale && (
        <div className="relative z-10 mb-4">
          <p className="font-bold underline mb-1">Grading Scale:</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
             {report.grading.map((g, i) => (
               <span key={i}><strong>{g.grade}</strong>: {g.min}-{g.max}% ({g.remark})</span>
             ))}
          </div>
        </div>
      )}

      {/* Comments */}
      {settings.reportCardVisibility?.showTeacherComments && (
        <div className="relative z-10 border border-slate-300 p-3 space-y-4">
           <div>
             <p className="font-bold underline">Class Teacher's Remark:</p>
             <p className="italic min-h-[2rem] mt-1">{!isBlankReportMode ? report.commentRec.teacher : ''}</p>
             <div className="flex items-end gap-2 mt-2">
               <span>Sign:</span>
               {teacherSignature ? <img src={teacherSignature} className="h-6" /> : <div className="border-b border-black w-24"></div>}
               <span className="ml-4">Tr. {report.commentRec.teacherInitials}</span>
             </div>
           </div>
           
           <div className="border-t border-slate-300 pt-3">
             <p className="font-bold underline">Head Teacher's Remark:</p>
             <p className="italic min-h-[2rem] mt-1">{!isBlankReportMode ? report.commentRec.head : ''}</p>
             <div className="flex items-end gap-2 mt-2 relative">
               <span>Sign:</span>
               {headSignature ? <img src={headSignature} className="h-8" /> : <div className="border-b border-black w-24"></div>}
               <span className="ml-4">H/Tr. {report.commentRec.headInitials}</span>
               {schoolStamp && <img src={schoolStamp} className="h-12 absolute right-4 top-0 opacity-80" />}
             </div>
           </div>
        </div>
      )}

      {report.commentRec.nextTermBegins && (
        <div className="mt-4 text-center font-bold text-slate-700">
           Next Term Begins On: {new Date(report.commentRec.nextTermBegins).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRIMARY TEMPLATE 4 — "Modern Two-Column"
   ───────────────────────────────────────────── */
export function PrimaryTemplate4({
  learner, examSet, report, settings, sectionKey,
  draftMode, isBlankReportMode,
  teacherSignature, headSignature, schoolStamp
}: TemplateProps) {
  return (
    <div className="relative overflow-hidden bg-white border rounded-xl p-8 w-full max-w-[800px] text-slate-800 shadow-md font-sans mx-auto mb-8 page-break-after flex gap-8">
      {draftMode && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none">
          <span className="text-gray-100 text-9xl font-black rotate-[-30deg] tracking-widest opacity-40">DRAFT</span>
        </div>
      )}

      {/* Left Column (Info & Summary) */}
      <div className="w-1/3 flex flex-col relative z-10 border-r-2 border-slate-100 pr-8">
        <div className="text-center mb-6">
          {settings.reportCardVisibility?.showSchoolLogo && settings.logo && (
            <img src={settings.logo} alt="Logo" className="h-20 w-20 object-contain mx-auto mb-4" />
          )}
          <h1 className="text-xl font-black text-indigo-900 leading-tight uppercase">{settings.schoolName}</h1>
          <p className="text-xs text-slate-500 mt-2">{settings.address}</p>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg mb-6">
           <h2 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-2">Student Profile</h2>
           <p className="font-black text-lg leading-tight mb-1">{learner.name}</p>
           <p className="text-sm font-bold text-slate-600">Class: {learner.cls}</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-6 flex-1">
           <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Term Summary</h2>
           <div className="space-y-2 text-sm">
             <div className="flex justify-between border-b border-slate-200 pb-1">
               <span className="text-slate-500">Total Score</span>
               <span className="font-bold">{!isBlankReportMode ? report.total : ''}</span>
             </div>
             <div className="flex justify-between border-b border-slate-200 pb-1">
               <span className="text-slate-500">Aggregates</span>
               <span className="font-bold">{!isBlankReportMode ? report.average.toFixed(1) : ''}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-slate-500">Division</span>
               <span className="font-black text-indigo-600">{!isBlankReportMode ? report.overallGrade : ''}</span>
             </div>
           </div>
        </div>

        <div className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
           {examSet.term} • {settings.year}
        </div>
      </div>

      {/* Right Column (Results) */}
      <div className="w-2/3 relative z-10 flex flex-col">
        <h2 className="text-xl font-black text-slate-800 mb-4 border-b-2 border-indigo-100 pb-2">Academic Performance</h2>
        
        <div className="flex-1">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
                <th className="py-2">Subject</th>
                <th className="py-2 text-center w-16">Mark</th>
                <th className="py-2 text-center w-16">Agg</th>
                <th className="py-2 pl-4">Remark</th>
              </tr>
            </thead>
            <tbody>
              {report.subjectRows.map((sub, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="py-3 font-bold text-slate-700">{sub.name}</td>
                  <td className="py-3 text-center">{!isBlankReportMode && sub.marks !== null ? sub.marks : '-'}</td>
                  <td className="py-3 text-center font-bold text-indigo-600">{!isBlankReportMode && sub.marks !== null ? sub.grade : '-'}</td>
                  <td className="py-3 pl-4 text-xs italic text-slate-500">{!isBlankReportMode ? sub.remark : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Comments Section */}
        {settings.reportCardVisibility?.showTeacherComments && (
          <div className="mt-8 space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Class Teacher</h4>
               <p className="text-sm italic font-medium text-slate-700 min-h-[2rem]">"{!isBlankReportMode ? report.commentRec.teacher : ''}"</p>
               <div className="mt-2 flex items-center justify-between">
                 <span className="text-xs font-bold text-slate-500">{report.commentRec.teacherInitials}</span>
                 {teacherSignature && <img src={teacherSignature} className="h-6 opacity-60" />}
               </div>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg relative">
               <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-2">Head Teacher</h4>
               <p className="text-sm italic font-medium text-indigo-900 min-h-[2rem]">"{!isBlankReportMode ? report.commentRec.head : ''}"</p>
               <div className="mt-2 flex items-center justify-between">
                 <span className="text-xs font-bold text-indigo-700">{report.commentRec.headInitials}</span>
                 {headSignature && <img src={headSignature} className="h-8" />}
               </div>
               {schoolStamp && <img src={schoolStamp} className="h-16 absolute -right-2 top-2 opacity-30" />}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRIMARY TEMPLATE 5 — "Premium Certificate"
   ───────────────────────────────────────────── */
export function PrimaryTemplate5({
  learner, examSet, report, settings, sectionKey,
  draftMode, isBlankReportMode,
  teacherSignature, headSignature, schoolStamp
}: TemplateProps) {
  return (
    <div className="relative overflow-hidden bg-[#fffdf5] border-[12px] border-double border-amber-800 p-8 w-full max-w-[800px] text-amber-950 font-serif mx-auto mb-8 page-break-after">
      {draftMode && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none">
          <span className="text-amber-100 text-9xl font-black rotate-[-30deg] tracking-widest opacity-50">DRAFT</span>
        </div>
      )}

      {/* Watermark Logo */}
      {settings.reportCardVisibility?.showSchoolLogo && settings.logo && (
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none opacity-5">
            <img src={settings.logo} className="w-[500px] h-[500px] object-cover" />
         </div>
      )}

      {/* Header */}
      <div className="text-center relative z-10 mb-8 border-b-2 border-amber-800 pb-6">
        {settings.reportCardVisibility?.showSchoolLogo && settings.logo && (
          <img src={settings.logo} alt="Logo" className="h-24 w-24 object-contain mx-auto mb-4 drop-shadow-md" />
        )}
        <h1 className="text-3xl font-black uppercase tracking-widest text-amber-900">{settings.schoolName}</h1>
        <p className="text-sm uppercase tracking-widest text-amber-700 mt-2 font-bold">{settings.address}</p>
        <div className="mt-6 text-xl font-bold italic">
          Official Report of Academic Performance
        </div>
        <div className="mt-2 text-sm font-bold uppercase tracking-widest">
          {examSet.term} • {settings.year}
        </div>
      </div>

      {/* Learner Info */}
      <div className="flex justify-center items-center gap-12 relative z-10 mb-10 text-lg">
         <div className="text-right">
           <span className="text-amber-700 uppercase text-xs font-bold block tracking-widest">This certifies that</span>
           <span className="font-black text-2xl uppercase border-b border-amber-300 pb-1">{learner.name}</span>
         </div>
         <div className="text-left">
           <span className="text-amber-700 uppercase text-xs font-bold block tracking-widest">of class</span>
           <span className="font-black text-2xl uppercase border-b border-amber-300 pb-1">{learner.cls}</span>
         </div>
      </div>

      {/* Main Subjects Table */}
      <div className="relative z-10 mb-10">
        <table className="w-full border-collapse border-y-2 border-amber-800">
          <thead>
            <tr className="border-b-2 border-amber-800 text-amber-900 uppercase text-xs tracking-widest bg-amber-50">
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-center w-20">Score</th>
              <th className="p-3 text-center w-20">Grade</th>
              <th className="p-3 text-left">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {report.subjectRows.map((sub, i) => (
              <tr key={i} className="border-b border-amber-100 hover:bg-amber-50">
                <td className="p-3 font-bold">{sub.name}</td>
                <td className="p-3 text-center text-lg">{!isBlankReportMode && sub.marks !== null ? sub.marks : '-'}</td>
                <td className="p-3 text-center font-bold text-amber-700">{!isBlankReportMode && sub.marks !== null ? sub.grade : '-'}</td>
                <td className="p-3 text-sm italic text-amber-800">{!isBlankReportMode ? sub.remark : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Box */}
      <div className="relative z-10 bg-amber-50 border border-amber-200 p-4 rounded text-center mb-10 flex justify-around items-center">
         <div>
            <p className="text-xs uppercase tracking-widest text-amber-700 font-bold">Total Score</p>
            <p className="text-2xl font-black">{!isBlankReportMode ? report.total : '-'}</p>
         </div>
         <div className="w-px h-12 bg-amber-200"></div>
         <div>
            <p className="text-xs uppercase tracking-widest text-amber-700 font-bold">Aggregates</p>
            <p className="text-2xl font-black">{!isBlankReportMode ? report.average.toFixed(1) : '-'}</p>
         </div>
         <div className="w-px h-12 bg-amber-200"></div>
         <div>
            <p className="text-xs uppercase tracking-widest text-amber-700 font-bold">Division</p>
            <p className="text-2xl font-black text-amber-600">{!isBlankReportMode ? report.overallGrade : '-'}</p>
         </div>
      </div>

      {/* Signatures */}
      {settings.reportCardVisibility?.showTeacherComments && (
        <div className="relative z-10 grid grid-cols-2 gap-12 text-center mt-12 px-8">
          <div>
            <p className="italic min-h-[3rem] text-sm text-amber-900 border-b border-amber-200 pb-2">"{!isBlankReportMode ? report.commentRec.teacher : ''}"</p>
            <div className="flex justify-center mt-6 h-12">
               {teacherSignature ? <img src={teacherSignature} className="h-10 object-contain mix-blend-multiply" /> : <div className="border-b border-amber-800 w-40 self-end"></div>}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mt-2">Class Teacher</p>
          </div>
          <div>
            <p className="italic min-h-[3rem] text-sm text-amber-900 border-b border-amber-200 pb-2">"{!isBlankReportMode ? report.commentRec.head : ''}"</p>
            <div className="flex justify-center mt-6 h-12 relative">
               {headSignature ? <img src={headSignature} className="h-12 object-contain mix-blend-multiply" /> : <div className="border-b border-amber-800 w-40 self-end"></div>}
               {schoolStamp && <img src={schoolStamp} className="h-20 absolute -right-4 -bottom-4 mix-blend-multiply opacity-70" />}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mt-2">Head Teacher</p>
          </div>
        </div>
      )}

    </div>
  );
}
