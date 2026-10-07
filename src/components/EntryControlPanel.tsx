import React, { useState, useRef, useEffect } from 'react';
import { AppData, SecurityData, VisitorRecord, GateLogEntry } from '../types';
import { Camera, UserPlus, Phone, CheckCircle2, UserCheck, Search, Users, ShieldCheck, UserX, Loader2 } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";

interface EntryControlPanelProps {
  secState: SecurityData;
  onUpdateSecurity: (newSec: SecurityData) => void;
}

export default function EntryControlPanel({ secState, onUpdateSecurity }: EntryControlPanelProps) {
  const data = useAppStore(state => state.data)!;
  const [entryMode, setEntryMode] = useState<'visitor' | 'learner_pickup' | 'teacher_arrival' | 'learner_arrival' | 'non_teaching_arrival'>('visitor');

  // Visitor State
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorReason, setVisitorReason] = useState('');
  const [visitorHostId, setVisitorHostId] = useState('');
  const [visitorVehiclePlate, setVisitorVehiclePlate] = useState('');
  
  // Mock UI States
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Real Webcam Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [isVerifyingWhatsapp, setIsVerifyingWhatsapp] = useState(false);

  // Fingerprint State
  const [isScanningFingerprint, setIsScanningFingerprint] = useState(false);
  
  // Learner Pickup State
  const [pickupParentName, setPickupParentName] = useState('');
  const [pickupLearnerId, setPickupLearnerId] = useState('');
  const [pickupReason, setPickupReason] = useState('');

  // Arrival State
  const [arrivalPersonId, setArrivalPersonId] = useState('');
  
  // Teachers for Host dropdown
  const hostOptions = data.settings?.teachersList || data.teachers || [];
  const learners = data.learners || data.students || [];
  const nonTeachingStaffList = data.settings?.nonTeachingStaffList || [
    { id: 'nt-1', name: 'James Ouma', department: 'Security' },
    { id: 'nt-2', name: 'Sarah Namukasa', department: 'Cleaning' },
    { id: 'nt-3', name: 'John Doe', department: 'Transport' },
  ];

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this environment");
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
    } catch (err: any) {
      console.error("Error accessing webcam", err);
      alert(`Camera Error: ${err.message || err.name || 'Could not access webcam'}`);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const currentStream = videoRef.current.srcObject as MediaStream;
      currentStream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStream(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);


  // Bind camera stream robustly
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Video play error:", e));
    }
  }, [stream]);

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
      }
      setIsCapturing(false);
    }
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleVerifyWhatsapp = () => {
    setIsVerifyingWhatsapp(true);
    setTimeout(() => {
      setWhatsappVerified(true);
      setIsVerifyingWhatsapp(false);
    }, 2000);
  };

  const handleSubmitVisitor = () => {
    if (!visitorName || !visitorPhone || !visitorHostId) return;

    const host = hostOptions.find(t => t.id === visitorHostId);
    
    const newVisitor: VisitorRecord = {
      id: `vis-${Date.now()}`,
      visitorName,
      phone: visitorPhone,
      whatsappVerified: true,
      nationalId: 'N/A', // Omitted from UI for now
      purpose: visitorReason,
      hostTeacherName: host ? host.name : 'Unknown',
      hostId: visitorHostId,
      vehicleNumberPlate: visitorVehiclePlate || undefined,
      badgeNumber: `V-${Math.floor(Math.random() * 1000)}`,
      qrCode: `qr-${Date.now()}`,
      photoUrl: capturedImage || undefined,
      arrivalTime: new Date().toISOString(),
      expectedDepartureTime: new Date(Date.now() + 2 * 60 * 60000).toISOString(),
      status: 'Inside School',
      approvedByGuard: 'Security Officer (Manual)',
    };

    const newLog: GateLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      personType: 'Visitor',
      personName: visitorName,
      personId: newVisitor.id,
      photoUrl: capturedImage || undefined,
      verificationMethod: 'WhatsApp OTP',
      gateUsed: 'Main Reception',
      direction: 'Entry',
      status: 'Approved',
      notes: `Visiting: ${host?.name}. Reason: ${visitorReason}`
    };

    const updatedSec = {
      ...secState,
      visitors: [newVisitor, ...(secState.visitors || [])],
      gateLogs: [newLog, ...(secState.gateLogs || [])]
    };

    onUpdateSecurity(updatedSec);
    
    // Reset form
    setVisitorName('');
    setVisitorPhone('');
    setVisitorReason('');
    setVisitorHostId('');
    setVisitorVehiclePlate('');
    setCapturedImage(null);
    setWhatsappVerified(false);
  };

  const handlePickupSubmit = () => {
    if (!pickupParentName || !pickupLearnerId) return;
    const student = learners.find(l => l.id === pickupLearnerId);
    
    const newLog: GateLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      personType: 'Parent/Guardian',
      personName: pickupParentName,
      verificationMethod: 'Manual Guard Approval',
      gateUsed: 'Main Gate',
      direction: 'Pickup',
      status: 'Picked_Up',
      pickedUpStudentId: student?.id,
      pickedUpStudentName: student?.name,
      notes: `Picked up by parent. Reason: ${pickupReason}`
    };

    const updatedSec = { ...secState, gateLogs: [newLog, ...(secState.gateLogs || [])] };
    onUpdateSecurity(updatedSec);

    setPickupParentName('');
    setPickupLearnerId('');
    setPickupReason('');
  };

  const handleArrivalSubmit = (type: 'Teacher' | 'Student' | 'Non-Teaching Staff', biometricVerified = false) => {
    if (!arrivalPersonId) return;
    const personList = type === 'Teacher' ? hostOptions : (type === 'Student' ? learners : nonTeachingStaffList);
    const person = personList.find(p => p.id === arrivalPersonId);
    if (!person) return;

    const newLog: GateLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      personType: type,
      personName: person.name,
      personId: person.id,
      verificationMethod: biometricVerified ? 'Fingerprint (ZKTeco)' : 'Manual Guard Approval',
      gateUsed: 'Main Gate',
      direction: 'Entry',
      status: 'Present',
    };

    const updatedSec = { ...secState, gateLogs: [newLog, ...(secState.gateLogs || [])] };
    onUpdateSecurity(updatedSec);
    setArrivalPersonId('');
  };

  const handleFingerprintScan = async (type: 'Teacher' | 'Student' | 'Non-Teaching Staff') => {
    if (!arrivalPersonId) return;
    setIsScanningFingerprint(true);
    try {
      // Mock WebAuthn challenge to trigger local biometric scanner (TouchID / Windows Hello)
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      
      await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: { name: "OTEC School Security", id: window.location.hostname },
          user: {
            id: new Uint8Array(16),
            name: "staff@otec.local",
            displayName: "Staff Member"
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Forces embedded laptop scanner (TouchID)
            userVerification: "required"
          },
          timeout: 60000,
        }
      });
      
      // If it passes without throwing, fingerprint was verified!
      handleArrivalSubmit(type, true); // true = Biometric Verified
    } catch (error) {
      console.error("Biometric scan failed or cancelled", error);
      alert("Fingerprint scan failed. Please try again or use manual fallback.");
    } finally {
      setIsScanningFingerprint(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-4 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setEntryMode('visitor')}
          className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${entryMode === 'visitor' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <UserPlus size={16} /> Visitor Entry
        </button>
        <button
          onClick={() => setEntryMode('learner_pickup')}
          className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${entryMode === 'learner_pickup' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Users size={16} /> Learner Pickup
        </button>
        <button
          onClick={() => setEntryMode('teacher_arrival')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            entryMode === 'teacher_arrival' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck size={16} /> Staff Arrival
        </button>
        <button
          onClick={() => setEntryMode('learner_arrival')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            entryMode === 'learner_arrival' ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <UserCheck size={16} /> Learner Arrival
        </button>
        <button
          onClick={() => setEntryMode('non_teaching_arrival')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            entryMode === 'non_teaching_arrival' ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck size={16} /> Non-Teaching Staff
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        {entryMode === 'visitor' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <UserPlus className="text-blue-600" />
                Register New Visitor
              </h2>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={visitorName}
                  onChange={e => setVisitorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="E.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vehicle Number Plate (Optional)</label>
                <input 
                  type="text" 
                  value={visitorVehiclePlate}
                  onChange={e => setVisitorVehiclePlate(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all uppercase"
                  placeholder="E.g. UAB 123C"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile Phone (WhatsApp)</label>
                <div className="flex gap-2">
                  <input 
                    type="tel" 
                    value={visitorPhone}
                    onChange={e => setVisitorPhone(e.target.value)}
                    disabled={whatsappVerified || isVerifyingWhatsapp}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50"
                    placeholder="+256 700 000000"
                  />
                  {!whatsappVerified ? (
                    <button 
                      type="button"
                      onClick={handleVerifyWhatsapp}
                      disabled={!visitorPhone || isVerifyingWhatsapp}
                      className="px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors"
                    >
                      {isVerifyingWhatsapp ? <Loader2 size={16} className="animate-spin" /> : <Phone size={16} />}
                      Verify
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-2">
                      <CheckCircle2 size={16} /> Verified
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Person to See (Host)</label>
                <select 
                  value={visitorHostId}
                  onChange={e => setVisitorHostId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                >
                  <option value="">-- Select Staff Member --</option>
                  {hostOptions.map(t => (
                    <option key={t.id} value={t.id}>{t.name} {t.specialization ? `(${t.specialization})` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reason for Visit</label>
                <input 
                  type="text" 
                  value={visitorReason}
                  onChange={e => setVisitorReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="Meeting, Delivery, Inquiry..."
                />
              </div>

            </div>

            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Identity Capture</h3>
              
              <div className="aspect-square max-w-sm mx-auto bg-slate-900 rounded-2xl border-2 border-slate-300 flex flex-col items-center justify-center relative overflow-hidden group">
                <canvas ref={canvasRef} className="hidden" />
                {capturedImage ? (
                  <>
                    <img src={capturedImage} alt="Visitor" className="w-full h-full object-cover" />
                    <button 
                      onClick={handleRetakePhoto}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/80 backdrop-blur text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Retake Photo
                    </button>
                  </>
                ) : (
                  <>
                    {stream ? (
                      <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6 text-white absolute">
                        <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Camera size={32} />
                        </div>
                        <p className="text-sm font-semibold mb-1">Webcam Inactive</p>
                        <p className="text-xs text-slate-400 mb-4">Click below to activate camera.</p>
                      </div>
                    )}
                    
                    <button 
                      type="button"
                      onClick={stream ? handleCaptureImage : startCamera}
                      disabled={isCapturing}
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xl transition-all"
                    >
                      {isCapturing ? 'Processing...' : stream ? 'Capture Image' : 'Start Camera'}
                    </button>
                  </>
                )}
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleSubmitVisitor}
                  disabled={!visitorName || !visitorPhone || !visitorHostId || !capturedImage}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 text-white rounded-xl font-black text-sm shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Authorize & Issue Visitor Pass
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">All fields and WhatsApp verification are required.</p>
              </div>
            </div>
          </div>
        )}

        {entryMode === 'learner_pickup' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6">
              <Users className="text-emerald-600" />
              Learner Pickup Registration
            </h2>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Parent / Guardian Name</label>
                <input 
                  type="text" 
                  value={pickupParentName}
                  onChange={e => setPickupParentName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="E.g. Jane Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Learner to Pickup</label>
                <select 
                  value={pickupLearnerId}
                  onChange={e => setPickupLearnerId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="">-- Select Learner --</option>
                  {learners.map(l => (
                    <option key={l.id} value={l.id}>{l.name} - {l.grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reason for Early Pickup (Optional)</label>
                <input 
                  type="text" 
                  value={pickupReason}
                  onChange={e => setPickupReason(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Medical, Emergency, etc."
                />
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handlePickupSubmit}
                  disabled={!pickupParentName || !pickupLearnerId}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
                >
                  Authorize Pickup & Open Gate
                </button>
              </div>
            </div>
          </div>
        )}

        {entryMode === 'teacher_arrival' && (
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <ShieldCheck size={48} className="mx-auto text-purple-600 mb-2" />
            <h2 className="text-2xl font-black text-slate-800">Staff Manual Check-in</h2>
            <p className="text-sm text-slate-500 mb-6">If biometric terminal fails, security can manually check in staff here.</p>
            
            <select 
              value={arrivalPersonId}
              onChange={e => setArrivalPersonId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            >
              <option value="">-- Select Staff Member --</option>
              {hostOptions.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleFingerprintScan('Teacher')}
                disabled={!arrivalPersonId || isScanningFingerprint}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-black text-lg transition-all shadow-lg shadow-indigo-500/20 flex flex-col items-center justify-center gap-2"
              >
                {isScanningFingerprint ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24} />}
                <span>Use Laptop Fingerprint</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleArrivalSubmit('Teacher')}
                disabled={!arrivalPersonId || isScanningFingerprint}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-black text-lg transition-all shadow-lg shadow-purple-500/20 flex flex-col items-center justify-center gap-2"
              >
                <CheckCircle2 size={24} />
                <span>Manual Check-in</span>
              </button>
            </div>
          </div>
        )}

        {entryMode === 'learner_arrival' && (
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <UserCheck size={48} className="mx-auto text-orange-600 mb-2" />
            <h2 className="text-2xl font-black text-slate-800">Learner Manual Check-in</h2>
            <p className="text-sm text-slate-500 mb-6">Manually log a learner arriving at the gate.</p>
            
            <select 
              value={arrivalPersonId}
              onChange={e => setArrivalPersonId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            >
              <option value="">-- Select Learner --</option>
              {learners.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.cls})</option>
              ))}
            </select>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleFingerprintScan('Student')}
                disabled={!arrivalPersonId || isScanningFingerprint}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-black text-lg transition-all shadow-lg shadow-indigo-500/20 flex flex-col items-center justify-center gap-2"
              >
                {isScanningFingerprint ? <Loader2 size={24} className="animate-spin" /> : <UserCheck size={24} />}
                <span>Use Laptop Fingerprint</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleArrivalSubmit('Student')}
                disabled={!arrivalPersonId || isScanningFingerprint}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl font-black text-lg transition-all shadow-lg shadow-orange-500/20 flex flex-col items-center justify-center gap-2"
              >
                <CheckCircle2 size={24} />
                <span>Manual Check-in</span>
              </button>
            </div>
          </div>
        )}
        {entryMode === 'non_teaching_arrival' && (
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <ShieldCheck size={48} className="mx-auto text-amber-600 mb-2" />
            <h2 className="text-2xl font-black text-slate-800">Non-Teaching Staff Check-in</h2>
            <p className="text-sm text-slate-500 mb-6">Verify arrival for security, cleaning, admin, and other staff.</p>
            
            <select 
              value={arrivalPersonId}
              onChange={e => setArrivalPersonId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            >
              <option value="">-- Select Staff Member --</option>
              {nonTeachingStaffList.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
              ))}
            </select>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleFingerprintScan('Non-Teaching Staff')}
                disabled={!arrivalPersonId || isScanningFingerprint}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-black text-lg transition-all shadow-lg shadow-indigo-500/20 flex flex-col items-center justify-center gap-2"
              >
                {isScanningFingerprint ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24} />}
                <span>Use Laptop Fingerprint</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleArrivalSubmit('Non-Teaching Staff')}
                disabled={!arrivalPersonId || isScanningFingerprint}
                className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-black text-lg transition-all shadow-lg shadow-amber-500/20 flex flex-col items-center justify-center gap-2"
              >
                <CheckCircle2 size={24} />
                <span>Manual Check-in</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
