import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';

function App() {
  // Auth routing: 'login' | 'signup' | 'dashboard'
  const [authPage, setAuthPage] = useState(() => {
    return localStorage.getItem('authToken') ? 'dashboard' : 'login';
  });

  // Navigation Tabs: 'home' | 'meetings' | 'profile'
  const [activeTab, setActiveTab] = useState('home');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Profile data state — seeded from auth storage if available
  const [profile, setProfile] = useState({
    name: localStorage.getItem('userName') || 'User',
    email: localStorage.getItem('userEmail') || '',
    title: 'Meeting Intelligence User',
    department: 'Product & Innovation',
    organization: 'Debrief.io',
    joined: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  });
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  // Meetings and Search state
  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterRange, setFilterRange] = useState('all');

  // Inspector Drawer state
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [extractedItems, setExtractedItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [inspectorTab, setInspectorTab] = useState('transcript'); // 'transcript' | 'decisions' | 'chat'

  // Chat/RAG state for Inspector
  const [chatMessages, setChatMessages] = useState({});
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Upload/Processing state
  const [uploadTitle, setUploadTitle] = useState('');
  const [continuationMeetingId, setContinuationMeetingId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [uploadStatus, setUploadStatus] = useState({
    isProcessing: false,
    currentStep: 0, // 0: none, 1: uploading, 2: transcribing, 3: extracting, 4: vectorizing, 5: done
    stepStates: {
      upload: 'pending',     // 'pending' | 'active' | 'done' | 'error'
      transcribe: 'pending',
      extract: 'pending',
      vector: 'pending'
    },
    progressPercent: 0,
    meetingId: '',
    error: ''
  });

  // Load meetings list on mount and when uploading completes
  const fetchMeetings = async () => {
    setLoadingMeetings(true);
    try {
      const response = await fetch('/api/v1/meetings');
      if (response.ok) {
        const data = await response.json();
        setMeetings(data);
      }
    } catch (err) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoadingMeetings(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Fetch Extracted Items and load Chat when a meeting is inspected
  useEffect(() => {
    if (selectedMeeting) {
      const fetchExtractedItems = async () => {
        setLoadingItems(true);
        try {
          const response = await fetch(`/api/v1/meetings/${selectedMeeting.id}/extracted-items`);
          if (response.ok) {
            const data = await response.json();
            setExtractedItems(data);
          }
        } catch (err) {
          console.error('Failed to load items:', err);
        } finally {
          setLoadingItems(false);
        }
      };
      fetchExtractedItems();
    }
  }, [selectedMeeting]);

  // Handle Profile Update
  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfile({ ...editForm });
    setIsEditingProfile(false);
  };

  // Handle Drag & Drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Simulates progress bar animations for aesthetic upload feedback
  useEffect(() => {
    let interval;
    if (uploadStatus.isProcessing && uploadStatus.progressPercent < 98) {
      interval = setInterval(() => {
        setUploadStatus(prev => {
          let nextVal = prev.progressPercent + Math.random() * 2;
          if (nextVal > 98) nextVal = 98;
          return { ...prev, progressPercent: nextVal };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [uploadStatus.isProcessing]);

  // Handle Audio Upload E2E Processing
  const handleAudioUpload = async (e) => {
    e.preventDefault();
    if (!uploadTitle || !selectedFile) return;

    // Reset processing state
    setUploadStatus({
      isProcessing: true,
      currentStep: 1,
      stepStates: {
        upload: 'active',
        transcribe: 'pending',
        extract: 'pending',
        vector: 'pending'
      },
      progressPercent: 5,
      meetingId: '',
      error: ''
    });

    const formData = new FormData();
    formData.append('audio', selectedFile);
    
    // If it's a continuation, we append the parent context to title or headers
    let finalTitle = uploadTitle;
    if (continuationMeetingId) {
      const parentMeet = meetings.find(m => m.id === continuationMeetingId);
      if (parentMeet) {
        finalTitle = `${parentMeet.title} [Part 2] - ${uploadTitle}`;
      }
    }
    formData.append('title', finalTitle);

    try {
      // Step 1 ➔ Uploading completed and transcribing begins
      setUploadStatus(prev => ({
        ...prev,
        currentStep: 2,
        progressPercent: 25,
        stepStates: { ...prev.stepStates, upload: 'done', transcribe: 'active' }
      }));

      const response = await fetch('/api/v1/meetings/upload-audio', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Server error: ${response.status}`);
      }

      const result = await response.json();

      // Step 2, 3, 4 ➔ Completed successfully
      setUploadStatus(prev => ({
        ...prev,
        currentStep: 5,
        progressPercent: 100,
        meetingId: result.meetingId,
        stepStates: {
          upload: 'done',
          transcribe: 'done',
          extract: 'done',
          vector: 'done'
        }
      }));

      // Refresh meetings list to display new card
      fetchMeetings();

      // Reset form variables
      setUploadTitle('');
      setSelectedFile(null);
      setContinuationMeetingId('');

    } catch (err) {
      console.error('Audio processing failed:', err);
      setUploadStatus(prev => ({
        ...prev,
        isProcessing: false,
        error: err.message,
        stepStates: {
          upload: 'error',
          transcribe: 'error',
          extract: 'error',
          vector: 'error'
        }
      }));
    }
  };

  // Handle RAG Chat messages inside Inspector
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedMeeting) return;

    const userMsg = chatInput.trim();
    setChatInput('');

    // Append user message in specific meeting chat stack
    const meetId = selectedMeeting.id;
    const currentMeetMsgs = chatMessages[meetId] || [];
    const newMsgs = [...currentMeetMsgs, { text: userMsg, sender: 'user' }];
    
    setChatMessages(prev => ({ ...prev, [meetId]: newMsgs }));
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg,
          meetingId: meetId
        })
      });

      if (!response.ok) {
        throw new Error(`Chat HTTP Error: ${response.status}`);
      }

      const result = await response.json();

      setChatMessages(prev => ({
        ...prev,
        [meetId]: [
          ...newMsgs,
          {
            text: result.answer,
            sender: 'assistant',
            sources: result.sources_used
          }
        ]
      }));

    } catch (err) {
      console.error('Chat query failed:', err);
      setChatMessages(prev => ({
        ...prev,
        [meetId]: [
          ...newMsgs,
          { text: `Error: ${err.message}`, sender: 'error' }
        ]
      }));
    } finally {
      setChatLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  // Filter & sort meetings
  const getFilteredMeetings = () => {
    let result = [...meetings];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => m.title.toLowerCase().includes(query));
    }

    // Sort order
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.meetingDate || b.date) - new Date(a.meetingDate || a.date));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.meetingDate || a.date) - new Date(b.meetingDate || b.date));
    }

    return result;
  };

  // Auth gating — show login/signup before the dashboard
  if (authPage === 'login') {
    return (
      <LoginPage
        onLogin={() => {
          setProfile(prev => ({
            ...prev,
            name: localStorage.getItem('userName') || prev.name,
            email: localStorage.getItem('userEmail') || prev.email,
          }));
          setAuthPage('dashboard');
        }}
        onGoToSignUp={() => setAuthPage('signup')}
      />
    );
  }

  if (authPage === 'signup') {
    return (
      <SignUpPage
        onSignUp={(_data, name) => {
          setProfile(prev => ({
            ...prev,
            name: name || localStorage.getItem('userName') || prev.name,
            email: localStorage.getItem('userEmail') || prev.email,
          }));
          setAuthPage('dashboard');
        }}
        onGoToLogin={() => setAuthPage('login')}
      />
    );
  }

  return (
    <div className="flex bg-[#f8f9ff] text-[#0b1c30] min-h-screen">
      
      {/* ========================================== */}
      {/* FIXED LEFT SIDEBAR                         */}
      {/* ========================================== */}
      <aside className="fixed left-0 top-0 h-full w-[260px] bg-[#121212] flex flex-col justify-between py-6 z-50">
        <div>
          {/* Logo Area */}
          <div className="px-6 mb-10 flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[#121212] text-[20px]">insights</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-none">Debrief.io</h1>
              <p className="text-[10px] text-[#c4c7c7] tracking-wider uppercase mt-1">AI Meeting Intelligence</p>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => { setActiveTab('home'); setSelectedMeeting(null); }}
              className={`flex items-center gap-3 px-6 py-3 w-full text-left transition-all duration-200 ${
                activeTab === 'home'
                  ? 'bg-white/10 text-white border-l-[3px] border-[#006d35]'
                  : 'text-[#c4c7c7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined">home</span>
              <span className="text-sm font-semibold">Home</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('meetings'); }}
              className={`flex items-center gap-3 px-6 py-3 w-full text-left transition-all duration-200 ${
                activeTab === 'meetings'
                  ? 'bg-white/10 text-white border-l-[3px] border-[#006d35]'
                  : 'text-[#c4c7c7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined">video_library</span>
              <span className="text-sm font-semibold">All Meetings</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('profile'); setSelectedMeeting(null); }}
              className={`flex items-center gap-3 px-6 py-3 w-full text-left transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-white/10 text-white border-l-[3px] border-[#006d35]'
                  : 'text-[#c4c7c7] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined">person</span>
              <span className="text-sm font-semibold">My Profile</span>
            </button>
          </nav>
        </div>

        {/* Logout Trigger */}
        <div className="px-2">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-[#c4c7c7] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN VIEW CONTROLLER                      */}
      {/* ========================================== */}
      <main className="ml-[260px] flex-1 min-h-screen relative">
        
        {/* Top App Bar */}
        <header className="sticky top-0 bg-white border-b border-[#E2E8F0] h-16 flex items-center justify-between px-10 z-40">
          <div className="text-xs font-semibold text-[#747878] uppercase tracking-wider">
            {activeTab === 'home' && 'Workspace Dashboard'}
            {activeTab === 'meetings' && 'Meeting Library'}
            {activeTab === 'profile' && 'User Settings'}
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-[#eff4ff] rounded-full transition-colors">
              <span className="material-symbols-outlined text-[#444748]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('profile')}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">{profile.name}</p>
                <p className="text-[11px] text-[#747878] mt-1">{profile.title}</p>
              </div>
              <img
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border border-[#E2E8F0]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD__jragv4b3ayclAT79ENsCiqG4s4ybuaoP4kvuqTuiqH-c2huv6Jngye1vfWAxkACVUwUhZZTemri4gCIOOrc8H6SxfmAR9CgPHEYnbx8-aVCu_ayW30NgvFIxnri6g5vQLk7cKjJAa5jsoVI8VEiZhe2TpD9ko6I6uh6I8GWOcj0ODin1ZHcpnmIckT9_sQ6kZOndeZzGs06nYKhVLWUeh3zftKG1fxhqQ45vaTBdHIRywC1GwSRWZTZ59HuInY7dWkOp6TKeHBn"
              />
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-10 max-w-[1440px] mx-auto space-y-8">

          {/* ========================================== */}
          {/* TAB: HOME                                 */}
          {/* ========================================== */}
          {activeTab === 'home' && (
            <>
              {/* Header */}
              <section>
                <h2 className="text-3xl font-semibold text-[#0b1c30] tracking-tight">Welcome back, {profile.name.split(' ')[0]}</h2>
                <p className="text-[#444748] text-sm mt-1">Upload meeting recordings to update your Second Brain knowledge base.</p>
              </section>

              {/* Stats KPI Board */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[#747878] text-xs font-semibold uppercase tracking-wider">Total Meetings</span>
                    <div className="p-2 bg-[#eff4ff] rounded-lg group-hover:bg-[#121212] group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[18px]">event_available</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-[#0b1c30]">{meetings.length}</p>
                  <p className="text-xs text-[#006d35] font-semibold mt-2">▲ 100% locally transcribed</p>
                </div>

                <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[#747878] text-xs font-semibold uppercase tracking-wider">Active Decisions</span>
                    <div className="p-2 bg-[#eff4ff] rounded-lg group-hover:bg-[#121212] group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[18px]">task_alt</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-[#0b1c30]">24</p>
                  <p className="text-xs text-[#6366F1] font-semibold mt-2">Drift tracking activated</p>
                </div>

                <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[#747878] text-xs font-semibold uppercase tracking-wider">Hours Processed</span>
                    <div className="p-2 bg-[#eff4ff] rounded-lg group-hover:bg-[#121212] group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[18px]">timer</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-[#0b1c30]">{(meetings.length * 0.5).toFixed(1)} h</p>
                  <p className="text-xs text-[#747878] font-semibold mt-2">Average 30m per session</p>
                </div>
              </section>

              {/* Bento Grid: Upload Block & Stepper */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Upload Section (2 Columns) */}
                <section className="lg:col-span-2">
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-[#121212]">cloud_upload</span>
                      <h3 className="font-bold text-lg">Process New Recording</h3>
                    </div>

                    <form onSubmit={handleAudioUpload} className="space-y-6 flex-1 flex flex-col justify-between">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[#747878]">MEETING TITLE</label>
                          <input
                            required
                            value={uploadTitle}
                            onChange={(e) => setUploadTitle(e.target.value)}
                            disabled={uploadStatus.isProcessing}
                            className="w-full bg-[#f8f9ff] border border-[#E2E8F0] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#121212] focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Sprint Kickoff Review"
                            type="text"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[#747878]">OR CONTINUE EXISTING THREAD</label>
                          <div className="relative">
                            <select
                              value={continuationMeetingId}
                              onChange={(e) => setContinuationMeetingId(e.target.value)}
                              disabled={uploadStatus.isProcessing}
                              className="w-full bg-[#f8f9ff] border border-[#E2E8F0] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#121212] focus:border-transparent outline-none appearance-none cursor-pointer"
                            >
                              <option value="">Start a fresh context thread...</option>
                              {meetings.map((meet) => (
                                <option key={meet.id} value={meet.id}>
                                  {meet.title}
                                </option>
                              ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#747878]">
                              expand_more
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dropzone */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 mt-6 transition-colors cursor-pointer ${
                          isDragOver ? 'border-[#6366F1] bg-[#eff4ff]' : 'border-[#c4c7c7] bg-white hover:bg-[#eff4ff]/20'
                        }`}
                      >
                        <input
                          type="file"
                          id="file-upload-input"
                          accept="audio/mpeg,audio/wav,audio/mp4,audio/m4a,audio/ogg"
                          onChange={handleFileSelect}
                          disabled={uploadStatus.isProcessing}
                          className="hidden"
                        />
                        <label htmlFor="file-upload-input" className="w-full text-center cursor-pointer">
                          <div className="w-14 h-14 bg-[#f8f9ff] rounded-full flex items-center justify-center shadow-sm mx-auto mb-3">
                            <span className="material-symbols-outlined text-[#444748] text-[28px]">audio_file</span>
                          </div>
                          <p className="font-bold text-sm text-[#0b1c30] mb-1">
                            {selectedFile ? selectedFile.name : 'Click to select or drag & drop recording'}
                          </p>
                          <p className="text-xs text-[#747878]">
                            {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB` : 'MP3, WAV, or M4A supported'}
                          </p>
                        </label>
                      </div>

                      <div className="mt-6 flex justify-end gap-3">
                        {selectedFile && (
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            disabled={uploadStatus.isProcessing}
                            className="px-6 py-2.5 bg-white border border-[#E2E8F0] text-[#0b1c30] rounded-lg text-sm hover:bg-[#f8f9ff] transition-colors"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={!selectedFile || !uploadTitle || uploadStatus.isProcessing}
                          className="px-6 py-2.5 bg-[#121212] text-white rounded-lg text-sm hover:bg-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {uploadStatus.isProcessing ? 'Processing Pipeline...' : 'Transcribe & Index →'}
                        </button>
                      </div>
                    </form>
                  </div>
                </section>

                {/* Status Indicator Sidebar (1 Column) */}
                <section className="lg:col-span-1">
                  <div className="bg-[#121212] text-white rounded-xl p-8 h-full shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full ${uploadStatus.isProcessing ? 'bg-[#6366F1] animate-pulse' : 'bg-[#747878]'}`}></span>
                            <span className="text-[10px] text-[#c4c7c7] uppercase tracking-widest font-semibold">Pipeline Status</span>
                          </div>
                          <h3 className="font-bold text-base truncate max-w-[200px]">
                            {uploadStatus.isProcessing ? uploadTitle : 'Idle'}
                          </h3>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-white/10 h-1 rounded-full mb-8 overflow-hidden">
                        <div
                          className="bg-[#006d35] h-full transition-all duration-500 ease-out"
                          style={{ width: `${uploadStatus.progressPercent}%` }}
                        ></div>
                      </div>

                      {/* Vertical Stepper */}
                      <div className="space-y-6">
                        {/* Step 1: Upload */}
                        <div className={`flex items-center gap-4 ${uploadStatus.currentStep < 1 ? 'opacity-30' : ''}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            uploadStatus.stepStates.upload === 'done' ? 'bg-[#006d35] text-white' :
                            uploadStatus.stepStates.upload === 'active' ? 'border-2 border-[#6366F1] text-[#6366F1]' : 'border-2 border-white/30 text-white/40'
                          }`}>
                            <span className="material-symbols-outlined text-[14px]">
                              {uploadStatus.stepStates.upload === 'done' ? 'check' : 'cloud_upload'}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold">1. Uploading Audio</p>
                            <p className="text-[9px] text-[#c4c7c7] uppercase">
                              {uploadStatus.stepStates.upload === 'done' ? 'Completed' : uploadStatus.stepStates.upload === 'active' ? 'Active' : 'Pending'}
                            </p>
                          </div>
                        </div>

                        {/* Step 2: Transcribe */}
                        <div className={`flex items-center gap-4 ${uploadStatus.currentStep < 2 ? 'opacity-30' : ''}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            uploadStatus.stepStates.transcribe === 'done' ? 'bg-[#006d35] text-white' :
                            uploadStatus.stepStates.transcribe === 'active' ? 'border-2 border-[#6366F1] text-[#6366F1] animate-spin' : 'border-2 border-white/30 text-white/40'
                          }`}>
                            <span className="material-symbols-outlined text-[14px]">
                              {uploadStatus.stepStates.transcribe === 'done' ? 'check' : 'sync'}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold">2. Whisper Transcription</p>
                            <p className="text-[9px] text-[#c4c7c7] uppercase">
                              {uploadStatus.stepStates.transcribe === 'done' ? 'Completed' : uploadStatus.stepStates.transcribe === 'active' ? 'AI Transcribing' : 'Pending'}
                            </p>
                          </div>
                        </div>

                        {/* Step 3: Extract */}
                        <div className={`flex items-center gap-4 ${uploadStatus.currentStep < 3 ? 'opacity-30' : ''}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            uploadStatus.stepStates.extract === 'done' ? 'bg-[#006d35] text-white' :
                            uploadStatus.stepStates.extract === 'active' ? 'border-2 border-[#6366F1] text-[#6366F1]' : 'border-2 border-white/30 text-white/40'
                          }`}>
                            <span className="material-symbols-outlined text-[14px]">
                              {uploadStatus.stepStates.extract === 'done' ? 'check' : 'psychology'}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold">3. Gemini Structured Insights</p>
                            <p className="text-[9px] text-[#c4c7c7] uppercase">
                              {uploadStatus.stepStates.extract === 'done' ? 'Completed' : uploadStatus.stepStates.extract === 'active' ? 'Extracting schema' : 'Pending'}
                            </p>
                          </div>
                        </div>

                        {/* Step 4: Vectorize */}
                        <div className={`flex items-center gap-4 ${uploadStatus.currentStep < 4 ? 'opacity-30' : ''}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            uploadStatus.stepStates.vector === 'done' ? 'bg-[#006d35] text-white' :
                            uploadStatus.stepStates.vector === 'active' ? 'border-2 border-[#6366F1] text-[#6366F1]' : 'border-2 border-white/30 text-white/40'
                          }`}>
                            <span className="material-symbols-outlined text-[14px]">
                              {uploadStatus.stepStates.vector === 'done' ? 'check' : 'database'}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold">4. Vectorizing Knowledge</p>
                            <p className="text-[9px] text-[#c4c7c7] uppercase">
                              {uploadStatus.stepStates.vector === 'done' ? 'Completed' : uploadStatus.stepStates.vector === 'active' ? 'Pinecone Embedding' : 'Pending'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notification Footer */}
                    <div className="mt-8 pt-4 border-t border-white/10 text-xs text-[#c4c7c7]">
                      {uploadStatus.error && (
                        <p className="text-[#ba1a1a] font-semibold">❌ Failure: {uploadStatus.error}</p>
                      )}
                      {!uploadStatus.error && uploadStatus.progressPercent === 100 && (
                        <p className="text-[#006d35] font-semibold">✅ Processing complete! Meeting indexed.</p>
                      )}
                      {!uploadStatus.error && uploadStatus.progressPercent === 0 && (
                        <p className="italic">Waiting for files...</p>
                      )}
                      {uploadStatus.isProcessing && (
                        <p className="animate-pulse">Whisper is running audio decoding...</p>
                      )}
                    </div>
                  </div>
                </section>

              </div>
            </>
          )}

          {/* ========================================== */}
          {/* TAB: ALL MEETINGS                          */}
          {/* ========================================== */}
          {activeTab === 'meetings' && (
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-semibold text-[#0b1c30] tracking-tight">Meeting Archive</h2>
                  <p className="text-[#444748] text-sm mt-1">Access transcripts, AI-extracted structures, and conversational RAG bots.</p>
                </div>
                <button
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#121212] text-white rounded text-sm font-semibold active:scale-95 transition-all hover:bg-black"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Upload New Session
                </button>
              </div>

              {/* Filters Panel */}
              <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-white border border-[#E2E8F0] rounded-xl shadow-sm">
                <div className="flex items-center bg-[#eff4ff] rounded-lg p-1 border border-[#E2E8F0] max-w-sm flex-1">
                  <span className="material-symbols-outlined text-[#747878] pl-2 pr-1">search</span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-xs focus:ring-0 outline-none"
                    placeholder="Search by meeting title..."
                    type="text"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#747878]">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent border-none font-semibold text-[#0b1c30] focus:ring-0 cursor-pointer text-xs"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              {loadingMeetings ? (
                <div className="text-center py-20 text-sm text-[#747878]">Loading meetings from database...</div>
              ) : getFilteredMeetings().length === 0 ? (
                <div className="text-center py-20 text-sm text-[#747878]">No meetings found matching your search.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {getFilteredMeetings().map((meet) => (
                    <div
                      key={meet.id}
                      onClick={() => { setSelectedMeeting(meet); setInspectorTab('transcript'); }}
                      className="group bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-md cursor-pointer transition-all duration-300"
                    >
                      {/* Left Block */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-11 h-11 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#6366F1]">
                          <span className="material-symbols-outlined text-[24px]">groups</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-[#0b1c30] group-hover:text-[#6366F1] transition-colors">
                            {meet.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#747878] mt-1">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                              {formatDate(meet.meetingDate || meet.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              {meet.transcriptRaw ? `${Math.ceil(meet.transcriptRaw.split(' ').length / 150)} min` : 'Duration unknown'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Waveform decoration */}
                      <div className="flex items-center gap-2 px-8 border-x border-[#E2E8F0] h-10 hidden lg:flex">
                        <div className="w-1 h-3 bg-[#6366F1] rounded"></div>
                        <div className="w-1 h-6 bg-[#6366F1] rounded"></div>
                        <div className="w-1 h-8 bg-[#6366F1] rounded"></div>
                        <div className="w-1 h-4 bg-[#6366F1] rounded"></div>
                        <div className="w-1 h-5 bg-[#6366F1] rounded"></div>
                        <div className="w-1 h-2 bg-[#6366F1] rounded"></div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMeeting(meet);
                            setInspectorTab('chat');
                          }}
                          className="px-4 py-2 bg-[#121212] text-white rounded text-xs font-semibold hover:bg-black transition-colors"
                        >
                          Ask RAG AI
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMeeting(meet);
                            setInspectorTab('transcript');
                          }}
                          className="px-4 py-2 bg-[#eff4ff] text-[#0b1c30] border border-[#E2E8F0] rounded text-xs font-semibold hover:bg-[#e5eeff] transition-colors"
                        >
                          Inspect Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ========================================== */}
          {/* TAB: MY PROFILE                            */}
          {/* ========================================== */}
          {activeTab === 'profile' && (
            <>
              {/* Cover Header */}
              <section className="flex flex-col items-center text-center py-6 bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-[#6366F1] to-[#006d35] rounded-full blur opacity-20"></div>
                  <img
                    alt="User Profile avatar"
                    className="relative w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD__jragv4b3ayclAT79ENsCiqG4s4ybuaoP4kvuqTuiqH-c2huv6Jngye1vfWAxkACVUwUhZZTemri4gCIOOrc8H6SxfmAR9CgPHEYnbx8-aVCu_ayW30NgvFIxnri6g5vQLk7cKjJAa5jsoVI8VEiZhe2TpD9ko6I6uh6I8GWOcj0ODin1ZHcpnmIckT9_sQ6kZOndeZzGs06nYKhVLWUeh3zftKG1fxhqQ45vaTBdHIRywC1GwSRWZTZ59HuInY7dWkOp6TKeHBn"
                  />
                  <div className="absolute bottom-1 right-1 bg-[#006d35] text-white p-1 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h2 className="text-2xl font-bold tracking-tight text-[#0b1c30]">{profile.name}</h2>
                  <p className="text-sm text-[#747878] mt-1">{profile.title} • {profile.department}</p>
                </div>
              </section>

              {/* Bento Forms */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Form fields */}
                <div className="md:col-span-8 bg-white border border-[#E2E8F0] p-8 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-base">Profile Configurations</h3>
                    {!isEditingProfile ? (
                      <button
                        onClick={() => { setEditForm({ ...profile }); setIsEditingProfile(true); }}
                        className="text-xs font-semibold text-[#6366F1] hover:underline"
                      >
                        Edit Information
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsEditingProfile(false)}
                          className="text-xs text-[#747878] hover:underline"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleProfileSave}
                          className="text-xs font-semibold text-[#006d35] hover:underline"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleProfileSave} className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <label className="block text-[11px] text-[#747878] font-bold uppercase tracking-wider mb-2">Full Name</label>
                      <input
                        disabled={!isEditingProfile}
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-[#f8f9ff] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-[#121212] outline-none disabled:opacity-70"
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#747878] font-bold uppercase tracking-wider mb-2">Job Title</label>
                      <input
                        disabled={!isEditingProfile}
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-[#f8f9ff] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-[#121212] outline-none disabled:opacity-70"
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#747878] font-bold uppercase tracking-wider mb-2">Email Address</label>
                      <input
                        disabled={!isEditingProfile}
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-[#f8f9ff] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-[#121212] outline-none disabled:opacity-70"
                        type="email"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#747878] font-bold uppercase tracking-wider mb-2">Organization</label>
                      <input
                        disabled={!isEditingProfile}
                        value={editForm.organization}
                        onChange={(e) => setEditForm(prev => ({ ...prev, organization: e.target.value }))}
                        className="w-full bg-[#f8f9ff] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-[#121212] outline-none disabled:opacity-70"
                        type="text"
                      />
                    </div>
                  </form>
                </div>

                {/* API System integration credentials */}
                <div className="md:col-span-4 bg-[#121212] text-white p-8 rounded-xl shadow-md flex flex-col justify-between">
                  <h3 className="font-bold text-base mb-6">Workspace Integration</h3>
                  <div className="space-y-4 text-xs">
                    <div className="border-b border-white/10 pb-3">
                      <p className="text-white/60 mb-1">Embedding Engine</p>
                      <p className="font-semibold text-sm">Google Gemini 2.0</p>
                    </div>
                    <div className="border-b border-white/10 pb-3">
                      <p className="text-white/60 mb-1">Vector Index ID</p>
                      <p className="font-mono text-[10px] break-all">meeting-debrief.pinecone.io</p>
                    </div>
                    <div className="pb-3">
                      <p className="text-white/60 mb-1">Diarization Engine</p>
                      <p className="font-semibold text-sm">Whisper-base locally decoded</p>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}

        </div>

        {/* ========================================== */}
        {/* SLIDE-OUT DRAWER FOR DETAIL INSPECTION    */}
        {/* ========================================== */}
        {selectedMeeting && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-[#0b1c30]/40 backdrop-blur-xs transition-opacity"
              onClick={() => setSelectedMeeting(null)}
            ></div>

            {/* Drawer Container */}
            <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in">
              
              {/* Header */}
              <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#6366F1] font-bold tracking-widest uppercase">Inspect Meeting</span>
                  <h2 className="text-lg font-bold text-[#0b1c30] truncate max-w-md mt-1">{selectedMeeting.title}</h2>
                  <p className="text-xs text-[#747878] mt-1">{formatDate(selectedMeeting.meetingDate || selectedMeeting.date)}</p>
                </div>
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="p-1 rounded-full hover:bg-[#eff4ff] text-[#747878] transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Sub-Tabs inside Inspector */}
              <div className="flex border-b border-[#E2E8F0] text-xs">
                <button
                  onClick={() => setInspectorTab('transcript')}
                  className={`flex-1 py-3 font-semibold text-center ${
                    inspectorTab === 'transcript' ? 'border-b-2 border-[#121212] text-[#0b1c30]' : 'text-[#747878]'
                  }`}
                >
                  Transcript Raw
                </button>
                <button
                  onClick={() => setInspectorTab('decisions')}
                  className={`flex-1 py-3 font-semibold text-center ${
                    inspectorTab === 'decisions' ? 'border-b-2 border-[#121212] text-[#0b1c30]' : 'text-[#747878]'
                  }`}
                >
                  Structured Items
                </button>
                <button
                  onClick={() => setInspectorTab('chat')}
                  className={`flex-1 py-3 font-semibold text-center ${
                    inspectorTab === 'chat' ? 'border-b-2 border-[#121212] text-[#0b1c30]' : 'text-[#747878]'
                  }`}
                >
                  Ask RAG Bot
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#f8f9ff]">
                
                {/* TAB: TRANSCRIPT */}
                {inspectorTab === 'transcript' && (
                  <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm">
                    <p className="text-xs leading-relaxed text-[#444748] whitespace-pre-wrap">
                      {selectedMeeting.transcriptRaw || 'No transcript text stored for this session.'}
                    </p>
                  </div>
                )}

                {/* TAB: STRUCTURED ITEMS */}
                {inspectorTab === 'decisions' && (
                  <div className="space-y-6">
                    {loadingItems ? (
                      <div className="text-center py-10 text-xs text-[#747878]">Loading items from DB...</div>
                    ) : extractedItems.length === 0 ? (
                      <div className="text-center py-10 text-xs text-[#747878]">No structured items extracted.</div>
                    ) : (
                      <>
                        {/* Decisions */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#006d35] mb-3">🟢 Decided Items</h4>
                          <div className="space-y-2">
                            {extractedItems.filter(item => item.type === 'DECISION').map((item, idx) => (
                              <div key={idx} className="bg-white border border-[#E2E8F0] p-4 rounded-lg text-xs leading-relaxed">
                                {item.content}
                              </div>
                            ))}
                            {extractedItems.filter(item => item.type === 'DECISION').length === 0 && (
                              <p className="text-xs italic text-[#747878]">No decisions extracted.</p>
                            )}
                          </div>
                        </div>

                        {/* Action Items */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#d97706] mb-3">🟠 Action Items</h4>
                          <div className="space-y-2">
                            {extractedItems.filter(item => item.type === 'ACTION_ITEM').map((item, idx) => (
                              <div key={idx} className="bg-white border border-[#E2E8F0] p-4 rounded-lg text-xs leading-relaxed flex items-start gap-2">
                                <span className="material-symbols-outlined text-[16px] mt-0.5 text-[#747878]">check_box_outline_blank</span>
                                <span>{item.content}</span>
                              </div>
                            ))}
                            {extractedItems.filter(item => item.type === 'ACTION_ITEM').length === 0 && (
                              <p className="text-xs italic text-[#747878]">No actions items extracted.</p>
                            )}
                          </div>
                        </div>

                        {/* Open Questions */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6366F1] mb-3">🔵 Open Questions</h4>
                          <div className="space-y-2">
                            {extractedItems.filter(item => item.type === 'OPEN_QUESTION').map((item, idx) => (
                              <div key={idx} className="bg-white border border-[#E2E8F0] p-4 rounded-lg text-xs leading-relaxed">
                                ❓ {item.content}
                              </div>
                            ))}
                            {extractedItems.filter(item => item.type === 'OPEN_QUESTION').length === 0 && (
                              <p className="text-xs italic text-[#747878]">No open questions extracted.</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* TAB: CHAT PLAYGROUND */}
                {inspectorTab === 'chat' && (
                  <div className="flex flex-col h-[400px]">
                    <div className="flex-1 bg-white border border-[#E2E8F0] rounded-xl p-4 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
                      {/* Welcome message */}
                      <div className="bg-[#eff4ff] text-[#0b1c30] p-3 rounded-lg text-xs self-start max-w-[85%]">
                        🤖 Ask me anything about the meeting: <strong>"{selectedMeeting.title}"</strong>. 
                        I will scan Pinecone for text chunks and formulate answers.
                      </div>
                      
                      {/* Render message thread */}
                      {(chatMessages[selectedMeeting.id] || []).map((msg, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg text-xs max-w-[85%] ${
                            msg.sender === 'user'
                              ? 'bg-[#0071e3] text-white self-end rounded-br-none'
                              : msg.sender === 'error'
                              ? 'bg-red-50 text-[#ba1a1a] self-start rounded-bl-none border border-red-200'
                              : 'bg-[#e5e5ea] text-[#1d1d1f] self-start rounded-bl-none'
                          }`}
                        >
                          <p>{msg.text}</p>
                          {msg.sources !== undefined && (
                            <span className="block text-[9px] text-[#747878] mt-2 border-t border-[#c4c7c7] pt-1">
                              📚 Context: Sourced from {msg.sources} chunk(s) in Pinecone
                            </span>
                          )}
                        </div>
                      ))}

                      {chatLoading && (
                        <div className="p-3 bg-[#e5e5ea] text-[#747878] rounded-lg text-xs self-start rounded-bl-none animate-pulse">
                          Thinking...
                        </div>
                      )}
                    </div>

                    {/* Chat Input form */}
                    <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        disabled={chatLoading}
                        className="flex-1 bg-white border border-[#E2E8F0] rounded-lg px-4 py-2 text-xs focus:ring-1 focus:ring-[#121212] outline-none"
                        placeholder="Ask a question..."
                        type="text"
                      />
                      <button
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        className="px-4 bg-[#121212] text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors disabled:opacity-40"
                      >
                        Ask
                      </button>
                    </form>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================== */}
      {/* LOGOUT CONFIRMATION MODAL OVERLAY           */}
      {/* ========================================== */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowLogoutModal(false)}></div>
          {/* Modal */}
          <div className="relative bg-white p-8 rounded-2xl max-w-sm w-full mx-4 shadow-2xl z-10 text-center space-y-6">
            <div className="w-12 h-12 bg-red-50 text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined">logout</span>
            </div>
            <div>
              <h3 className="font-bold text-base">Logout Confirmation</h3>
              <p className="text-xs text-[#747878] mt-2">Are you sure you want to end your Second Brain session?</p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold hover:bg-[#f8f9ff] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('userEmail');
                  localStorage.removeItem('userName');
                  setAuthPage('login');
                }}
                className="px-5 py-2 bg-[#ba1a1a] text-white rounded-lg text-xs font-semibold hover:bg-[#93000a] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

}

export default App;
