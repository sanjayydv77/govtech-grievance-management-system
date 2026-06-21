import React, { useState, useRef, useEffect } from 'react';
import './PublicDashboard.css';
import { createTicket, fetchCitizenTickets, trackTicketPublicly } from '../../services/api';

// Translation Dictionary for English and Hindi
const TRANSLATIONS = {
  en: {
    submitGrievance: "Submit Grievance",
    trackingTab: "Grievance Tracking",
    cmNotifications: "CM Notifications",
    loginBtn: "Login",
    submitTitle: "Submit a Grievance",
    step1: "Citizen Details",
    step2: "Grievance Details",
    step3: "Upload Media",
    step4: "Review & Submit",
    fullName: "Full Name",
    emailAddr: "Email Address",
    phoneNo: "Mobile Number",
    phoneHint: "e.g., 9876543210 (Exactly 10 digits)",
    nextStep: "Next Step",
    backBtn: "Back",
    category: "Grievance Category",
    description: "Complaint Description",
    area: "Area/District",
    location: "Incident Location / Landmark (GPS)",
    uploadMain: "Click to Upload Photos or Videos",
    uploadSub: "Accepted formats: JPG, PNG, MP4, MOV. Max size: 50MB",
    removeBtn: "Remove",
    reviewTitle: "Review Your Grievance Details",
    citizenName: "Citizen Name",
    contactInfo: "Contact Info",
    attachments: "Attachments",
    submitComplaint: "SUBMIT COMPLAINT",
    successMsg: "Grievance Submitted Successfully!",
    successSub: "Your ticket reference details have been logged into the CM cell grievance directory.",
    tokenNum: "TOKEN NUMBER",
    tokenHint: "Use this token to track progress on the \"Grievance Tracking\" tab.",
    viewEmail: "View Email Receipt",
    submitAnother: "Submit Another Complaint",
    trackTitle: "Grievance Tracking",
    trackInputPlaceholder: "Enter your token number",
    trackBtn: "Track Status",
    registeredStatus: "REGISTERED",
    assignedStatus: "DEPARTMENT ASSIGNED",
    progressStatus: "IN PROGRESS",
    resolvedStatus: "RESOLVED",
    gpsDetectBtn: "Detect",
    gpsDetecting: "Detecting...",
    catPlaceholder: "Grievance Category",
    catRoad: "Road & Potholes",
    catWater: "Water Supply",
    catWaste: "Waste Management",
    catElectricity: "Electricity & Street Lights",
    catOthers: "Others",
    inputNamePlaceholder: "Enter your full name",
    inputEmailPlaceholder: "e.g., citizen@email.com",
    areaPlaceholder: "Area/District",
    locPlaceholder: "Specific address, GPS coordinates or landmark",
    mediaDescPlaceholder: "Describe the photo/video before selecting file (optional)",
    trackAssignedTo: "Assigned To",
    invalidTokenErr: "Invalid Token Number. Please verify and try again.",
    metaGrievanceDetails: "Grievance Details",
    metaToken: "Token",
    metaTitle: "Title",
    metaArea: "Area",
    metaDate: "Date",
    reviewAnon: "Anonymous / Not Provided",
    emailHeader: "CONFIRMATION OF GRIEVANCE SUBMISSION",
    emailInbox: "Inbox",
    emailSender: "Delhi CM Grievance Cell",
    emailToMe: "to me",
    emailDear: "Dear Citizen,",
    emailBody: "Thank You. Your grievance (Token No: #{token}) has been registered, and process will be sent to the relevant department for action. You can track your grievance and view details using this Token No.",
    emailRegards: "Thanks & Regards,",
    navBrand: "DELHI SAMADHAN PORTAL",
    navSub: "PUBLIC PORTAL",
    lalQila: "Lal Qila",
    delhiLandmark: "Delhi Landmark",
    delhiSamadhan: "Delhi Samadhan",
    officialLeadership: "Official Leadership",
    delhiGovt: "Government of Delhi",
    cmAnnouncements: "CM Office Announcements & Directives",
    cmSubLabel: "Official notifications and guidelines published directly from the Chief Minister's desk.",
    themeLight: "Light Mode",
    themeDark: "Dark Mode"
  },
  hi: {
    submitGrievance: "शिकायत दर्ज करें",
    trackingTab: "शिकायत की स्थिति",
    cmNotifications: "सीएम सूचनाएं",
    loginBtn: "लॉगिन",
    submitTitle: "शिकायत दर्ज करें",
    step1: "नागरिक विवरण",
    step2: "शिकायत का विवरण",
    step3: "मीडिया अपलोड करें",
    step4: "समीक्षा और सबमिट करें",
    fullName: "पूरा नाम",
    emailAddr: "ईमेल पता",
    phoneNo: "मोबाइल नंबर",
    phoneHint: "उदा., 9876543210 (ठीक 10 अंक)",
    nextStep: "अगला कदम",
    backBtn: "पीछे जाएं",
    category: "शिकायत की श्रेणी",
    description: "शिकायत का विवरण",
    area: "क्षेत्र/जिला",
    location: "घटना का स्थान / लैंडमार्क (GPS)",
    uploadMain: "फ़ोटो या वीडियो अपलोड करने के लिए क्लिक करें",
    uploadSub: "स्वीकृत प्रारूप: JPG, PNG, MP4, MOV. अधिकतम आकार: 50MB",
    removeBtn: "हटाएं",
    reviewTitle: "अपनी शिकायत के विवरण की समीक्षा करें",
    citizenName: "नागरिक का नाम",
    contactInfo: "संपर्क जानकारी",
    attachments: "संलग्नक (फ़ाइलें)",
    submitComplaint: "शिकायत सबमिट करें",
    successMsg: "शिकायत सफलतापूर्वक दर्ज की गई!",
    successSub: "आपके टिकट संदर्भ विवरण को सीएम सेल शिकायत निर्देशिका में सुरक्षित कर दिया गया है।",
    tokenNum: "टोकन नंबर",
    tokenHint: "शिकायत की प्रगति देखने के लिए \"शिकायत की स्थिति\" टैब में इस टोकन का उपयोग करें।",
    viewEmail: "ईमेल रसीद देखें",
    submitAnother: "एक और शिकायत दर्ज करें",
    trackTitle: "शिकायत की स्थिति ट्रैकिंग",
    trackInputPlaceholder: "अपना टोकन नंबर दर्ज करें",
    trackBtn: "स्थिति ट्रैक करें",
    registeredStatus: "पंजीकृत",
    assignedStatus: "विभाग आवंटित",
    progressStatus: "प्रगति पर है",
    resolvedStatus: "समाधान हो गया",
    gpsDetectBtn: "खोजें",
    gpsDetecting: "खोज रहा है...",
    catPlaceholder: "शिकायत श्रेणी चुनें",
    catRoad: "सड़क और गड्ढे",
    catWater: "जलापूर्ति",
    catWaste: "कचरा प्रबंधन",
    catElectricity: "बिजली और स्ट्रीट लाइट",
    catOthers: "अन्य",
    inputNamePlaceholder: "अपना पूरा नाम दर्ज करें",
    inputEmailPlaceholder: "उदा., citizen@email.com",
    areaPlaceholder: "क्षेत्र/जिला दर्ज करें",
    locPlaceholder: "विशिष्ट पता, जीपीएस निर्देशांक या लैंडमार्क",
    mediaDescPlaceholder: "फ़ाइल चुनने से पहले फ़ोटो/वीडियो का वर्णन करें (वैकल्पिक)",
    trackAssignedTo: "आवंटित विभाग",
    invalidTokenErr: "अवैध टोकन नंबर। कृपया जांचें और पुनः प्रयास करें।",
    metaGrievanceDetails: "शिकायत का विवरण",
    metaToken: "टोकन",
    metaTitle: "शीर्षक",
    metaArea: "क्षेत्र",
    metaDate: "दिनांक",
    reviewAnon: "अनाम / प्रदान नहीं किया गया",
    emailHeader: "शिकायत जमा करने की पुष्टि",
    emailInbox: "इनबॉक्स",
    emailSender: "दिल्ली सीएम शिकायत प्रकोष्ठ",
    emailToMe: "मेरे लिए",
    emailDear: "प्रिय नागरिक,",
    emailBody: "धन्यवाद। आपकी शिकायत (टोकन नंबर: #{token}) पंजीकृत कर ली गई है, और कार्रवाई के लिए संबंधित विभाग को प्रक्रिया भेजी जाएगी। आप इस टोकन नंबर का उपयोग करके अपनी शिकायत को ट्रैक कर सकते हैं और विवरण देख सकते हैं।",
    emailRegards: "धन्यवाद एवं सादर,",
    navBrand: "दिल्ली समाधान पोर्टल",
    navSub: "सार्वजनिक पोर्टल",
    lalQila: "लाल किला",
    delhiLandmark: "दिल्ली ऐतिहासिक स्थल",
    delhiSamadhan: "दिल्ली समाधान",
    officialLeadership: "आधिकारिक नेतृत्व",
    delhiGovt: "दिल्ली सरकार",
    cmAnnouncements: "मुख्यमंत्री कार्यालय के दिशा-निर्देश व घोषणाएं",
    cmSubLabel: "मुख्यमंत्री कार्यालय (सीएमओ) से सीधे प्रसारित दिशा-निर्देश एवं जनता के लिए आपातकालीन संदेश।",
    themeLight: "लाइट मोड",
    themeDark: "डार्क मोड"
  }
};

// Mock database of tracking numbers for the Tracking tab
const MOCK_TICKETS = {
  'DGP123456': {
    token: 'DGP123456',
    title: 'Waterlogging at Sector 7 road',
    category: 'Road & Potholes',
    status: 'DEPARTMENT_ASSIGNED',
    department: 'PWD',
    area: 'South-West Delhi',
    date: '2026-06-18',
  },
  'DGP789012': {
    token: 'DGP789012',
    title: 'Street light malfunction on Main Avenue',
    category: 'Electricity & Street Lights',
    status: 'IN_PROGRESS',
    department: 'BSES Delhi',
    area: 'North Delhi',
    date: '2026-06-15',
  },
  'DGP345678': {
    token: 'DGP345678',
    title: 'Garbage accumulation near market area',
    category: 'Waste Management',
    status: 'RESOLVED',
    department: 'MCD',
    area: 'Central Delhi',
    date: '2026-06-10',
  }
};

// Mock notifications from Chief Minister's Desk
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    date: '2026-06-19',
    titleEn: 'Monsoon Waterlogging Resolution Drive',
    titleHi: 'मानसून जलभराव निवारण अभियान',
    contentEn: 'All nodal officers are directed to address drainage issues on priority. Report waterlogging in your sector with photo/video proof for action within 24 hours.',
    contentHi: 'सभी नोडल अधिकारियों को ड्रेनेज समस्याओं का प्राथमिकता पर समाधान करने का निर्देश दिया गया है। २४ घंटे में कार्रवाई के लिए फोटो/वीडियो प्रमाण के साथ शिकायत दर्ज करें।',
    urgencyEn: 'High Priority',
    urgencyHi: 'उच्च प्राथमिकता',
    urgencyLevel: 'high'
  },
  {
    id: 2,
    date: '2026-06-15',
    titleEn: 'PWD Road Repairs & Pothole Clearance Campaign',
    titleHi: 'सड़क मरम्मत और गड्ढा मुक्त अभियान',
    contentEn: 'Public Works Department (PWD) teams have been dispatched to repair reported road damages. Citizen uploads are being verified by local nodal officers daily.',
    contentHi: 'जनता द्वारा रिपोर्ट की गई सड़कों की मरम्मत के लिए पीडब्ल्यूडी टीमों को रवाना किया गया है। स्थानीय नोडल अधिकारियों द्वारा रोजाना शिकायतों का सत्यापन किया जा रहा है।',
    urgencyEn: 'Important Update',
    urgencyHi: 'महत्वपूर्ण अपडेट',
    urgencyLevel: 'medium'
  }
];

export default function PublicDashboard() {
  const [language, setLanguage] = useState('en'); // 'en' or 'hi'
  const [activeTab, setActiveTab] = useState('submit'); // 'submit', 'track', or 'notifications'
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'

  // Submission Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [citizenDetails, setCitizenDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const [grievanceDetails, setGrievanceDetails] = useState({
    description: '',
    category: '',
    area: '',
    location: '',
  });

  const [errors, setErrors] = useState({});

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [newFileNote, setNewFileNote] = useState('');
  const fileInputRef = useRef(null);

  // Refs for smooth scrolling to form sections
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);

  // Tracking State
  const [searchToken, setSearchToken] = useState('DGP123456'); // pre-fill DGP123456 as shown in design
  const [searchedTicket, setSearchedTicket] = useState(null);
  const [trackingError, setTrackingError] = useState('');

  // Submit flow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');
  const [showEmailSimulator, setShowEmailSimulator] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Toggle dark/light theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Handle phone input changes strictly restricting to 10 digits
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // strip non-digits
    if (value.length <= 10) {
      setCitizenDetails((prev) => ({ ...prev, phone: value }));
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: '' }));
      }
    }
  };

  // Handle file uploads
  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newFiles = files.map((file, idx) => {
      const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov');
      return {
        id: `upload-${Date.now()}-${idx}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        description: newFileNote || `Uploaded media attachment ${file.name}`,
        type: isVideo ? 'video' : 'image',
        url: URL.createObjectURL(file),
        file: file,
      };
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setNewFileNote('');
  };

  const removeFile = (id) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Step Validation logic
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!citizenDetails.fullName.trim()) {
        newErrors.fullName = language === 'en' ? 'Full Name is required.' : 'पूरा नाम आवश्यक है।';
      }
      if (!citizenDetails.email.trim()) {
        newErrors.email = language === 'en' ? 'Email Address is required.' : 'ईमेल पता आवश्यक है।';
      } else if (!/\S+@\S+\.\S+/.test(citizenDetails.email)) {
        newErrors.email = language === 'en' ? 'Invalid email address format.' : 'ईमेल पते का प्रारूप अमान्य है।';
      }
      if (!citizenDetails.phone) {
        newErrors.phone = language === 'en' ? 'Mobile Number is required.' : 'मोबाइल नंबर आवश्यक है।';
      } else if (citizenDetails.phone.length !== 10) {
        newErrors.phone = language === 'en' ? 'Mobile Number must be exactly 10 digits.' : 'मोबाइल नंबर ठीक 10 अंकों का होना चाहिए।';
      }
    } else if (step === 2) {
      if (!grievanceDetails.description.trim()) {
        newErrors.description = language === 'en' ? 'Complaint Description is required.' : 'शिकायत का विवरण आवश्यक है।';
      }
      if (!grievanceDetails.category) {
        newErrors.category = language === 'en' ? 'Please select a Grievance Category.' : 'कृपया शिकायत श्रेणी चुनें।';
      }
      if (!grievanceDetails.area.trim()) {
        newErrors.area = language === 'en' ? 'Area/District is required.' : 'क्षेत्र/जिला आवश्यक है।';
      }
      if (!grievanceDetails.location.trim()) {
        newErrors.location = language === 'en' ? 'Incident Location/Landmark is required.' : 'घटना का स्थान/लैंडमार्क आवश्यक है।';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStepTransition = (nextStep) => {
    setCurrentStep(nextStep);
    const refs = {
      1: step1Ref,
      2: step2Ref,
      3: step3Ref,
      4: step4Ref
    };
    const targetRef = refs[nextStep];
    if (targetRef && targetRef.current) {
      setTimeout(() => {
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  // GPS Geolocation Detector
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert(language === 'en' ? 'Geolocation is not supported by your browser.' : 'आपके ब्राउज़र द्वारा जियोलोकेशन समर्थित नहीं है।');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          if (response.ok) {
            const data = await response.json();
            const displayName = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setGrievanceDetails((prev) => ({ ...prev, location: displayName }));
          } else {
            setGrievanceDetails((prev) => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          setGrievanceDetails((prev) => ({
            ...prev,
            location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
          }));
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setDetectingLocation(false);
        alert(language === 'en' ? 'Could not retrieve your location. Please type it manually.' : 'स्थान प्राप्त नहीं किया जा सका। कृपया इसे मैन्युअल रूप से दर्ज करें।');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Submit Grievance Submission
  const handleSubmitGrievance = async () => {
    const isStep1Valid = validateStep(1);
    const isStep2Valid = validateStep(2);
    if (!isStep1Valid || !isStep2Valid) {
      if (!isStep1Valid) {
        handleStepTransition(1);
      } else {
        handleStepTransition(2);
      }
      alert(language === 'en' ? 'Please check form details in all steps for missing/invalid information.' : 'कृपया अमान्य या छूटी हुई जानकारी के लिए सभी चरणों में फॉर्म विवरण देखें।');
      return;
    }

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('fullName', citizenDetails.fullName);
    formData.append('email', citizenDetails.email);
    formData.append('phone', citizenDetails.phone);
    const autoTitle = `${grievanceDetails.category || 'General'} Grievance - ${grievanceDetails.description.slice(0, 30)}...`;
    formData.append('title', autoTitle);
    formData.append('description', grievanceDetails.description);
    formData.append('category', grievanceDetails.category);
    formData.append('area', grievanceDetails.area);
    formData.append('location', grievanceDetails.location);

    uploadedFiles.forEach((f, idx) => {
      if (f.file) {
        formData.append('media', f.file);
      } else {
        formData.append(`mock_media_${idx}_name`, f.name);
        formData.append(`mock_media_${idx}_description`, f.description);
      }
    });

    try {
      const response = await createTicket(formData);
      const data = response || {};
      const tokenNo = data.ticket?.ticketId || data.ticketId || data.id || `DGP${Math.floor(100000 + Math.random() * 900000)}`;
      
      setGeneratedToken(tokenNo);
      setSubmitSuccess(true);
      setShowEmailSimulator(true);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert(language === 'en' ? 'Error submitting complaint. Please try again.' : 'शिकायत दर्ज करने में त्रुटि। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    setTrackingError('');
    const tokenClean = searchToken.trim().toUpperCase();
    
    try {
      const found = await trackTicketPublicly(tokenClean);
      
      if (found) {
        setSearchedTicket({
          token: found.ticketId,
          title: found.title,
          category: found.category || found.department || 'General',
          status: found.status,
          department: found.department || (language === 'en' ? 'Nodal Cell' : 'नोडल सेल'),
          area: found.location || found.area || 'Delhi',
          date: found.createdAt ? new Date(found.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        });
      } else if (tokenClean === generatedToken) {
        setSearchedTicket({
          token: generatedToken,
          title: `${grievanceDetails.category || 'General'} Grievance`,
          category: grievanceDetails.category || 'General',
          status: 'REGISTERED',
          department: language === 'en' ? 'Nodal Cell (Grievance Department)' : 'नोडल सेल (शिकायत प्रकोष्ठ)',
          area: grievanceDetails.area || 'Delhi Region',
          date: new Date().toISOString().split('T')[0],
        });
      } else {
        setSearchedTicket(null);
        setTrackingError(TRANSLATIONS[language].invalidTokenErr);
      }
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      if (err.response?.status === 404) {
        setSearchedTicket(null);
        setTrackingError(TRANSLATIONS[language].invalidTokenErr);
      } else {
        setTrackingError("Error connecting to tracking service.");
      }
    }
  };

  const handleResetForm = () => {
    setCitizenDetails({ fullName: '', email: '', phone: '' });
    setGrievanceDetails({ description: '', category: '', area: '', location: '' });
    setUploadedFiles([]);
    setSubmitSuccess(false);
    setCurrentStep(1);
    setShowEmailSimulator(false);
  };

  const getStageClass = (stageName) => {
    if (!searchedTicket) return '';
    const status = searchedTicket.status; // Pending, Assigned, In Progress, Resolved, Closed, Rejected

    if (stageName === 'registered') {
      return 'completed';
    }
    if (stageName === 'assigned') {
      if (status === 'Assigned') return 'active';
      if (['In Progress', 'Resolved', 'Closed', 'Rejected'].includes(status)) return 'completed';
    }
    if (stageName === 'in_progress') {
      if (status === 'In Progress') return 'active';
      if (['Resolved', 'Closed'].includes(status)) return 'completed';
    }
    if (stageName === 'resolved') {
      if (['Resolved', 'Closed'].includes(status)) return 'completed';
    }
    if (stageName === 'rejected') {
      if (status === 'Rejected') return 'rejected';
    }
    return '';
  };

  const t = TRANSLATIONS[language];

  return (
    <div className={`portal-container ${theme}-theme`}>
      {/* Header bar */}
      <header className="gov-header-wrapper">
        {/* Tab Navigation Section */}
        <div className="gov-tab-nav-bar">
          <div className="nav-tabs-left">
            <button 
              className={`gov-nav-tab ${activeTab === 'submit' ? 'active' : ''}`}
              onClick={() => setActiveTab('submit')}
            >
              {t.submitGrievance}
            </button>
            <button 
              className={`gov-nav-tab ${activeTab === 'track' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('track');
                if (searchToken) {
                  setSearchedTicket(MOCK_TICKETS[searchToken]);
                }
              }}
            >
              {t.trackingTab}
            </button>
            <button 
              className={`gov-nav-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{t.cmNotifications}</span>
              <span className="tab-noti-badge">2</span>
            </button>
          </div>

          <div className="nav-actions-right">
            {/* Theme Toggle Button */}
            <button onClick={toggleTheme} className="utility-theme-toggle">
              {theme === 'light' ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <span>{t.themeDark}</span>
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  <span>{t.themeLight}</span>
                </>
              )}
            </button>

            {/* Logout Button */}
            <button className="utility-logout-btn">
              {language === 'en' ? 'Logout' : 'लॉगआउट'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="portal-content">
        {activeTab === 'submit' ? (
          submitSuccess ? (
            <div className="success-screen-wrapper">
              <div className="success-panel animate-fade-in">
                <div className="success-icon-badge">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="12" fill="#10B981" fillOpacity="0.2"/>
                    <path d="M8.5 12.5L11 15L16 9" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2>{t.successMsg}</h2>
                <p>{t.successSub}</p>
                
                <div className="token-display-box">
                  <span className="token-lbl">{t.tokenNum}</span>
                  <span className="token-val">{generatedToken}</span>
                  <span className="token-instructions">{t.tokenHint}</span>
                </div>

                <div className="success-buttons">
                  <button onClick={() => setShowEmailSimulator(true)} className="btn-secondary">
                    {t.viewEmail}
                  </button>
                  <button onClick={handleResetForm} className="btn-primary">
                    {t.submitAnother}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="workspace-layout">
              {/* DESKTOP SIDEBAR STEPS */}
              <aside className="sidebar-steps">
                <div className="sidebar-title">{t.submitTitle}</div>
                
                <ul className="steps-list">
                  <li 
                    className={`step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
                    onClick={() => handleStepTransition(1)}
                  >
                    <span className="step-num">1</span>
                    <span className="step-label">{t.step1}</span>
                  </li>
                  <li 
                    className={`step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
                    onClick={() => handleStepTransition(2)}
                  >
                    <span className="step-num">2</span>
                    <span className="step-label">{t.step2}</span>
                  </li>
                  <li 
                    className={`step-item ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}
                    onClick={() => handleStepTransition(3)}
                  >
                    <span className="step-num">3</span>
                    <span className="step-label">{t.step3}</span>
                  </li>
                  <li 
                    className={`step-item ${currentStep === 4 ? 'active' : ''}`}
                    onClick={() => handleStepTransition(4)}
                  >
                    <span className="step-num">4</span>
                    <span className="step-label">{t.step4}</span>
                  </li>
                </ul>
              </aside>

              {/* MOBILE ACCORDION / MAIN FORM AREA */}
              <div className="form-card-container">

                
                <div className="mobile-only-header">
                  <h2>{t.submitTitle}</h2>
                </div>

                {/* STEP 1 ACCORDION / SECTION */}
                <div ref={step1Ref} className={`accordion-section ${currentStep === 1 ? 'expanded' : 'collapsed'}`}>
                  <button onClick={() => handleStepTransition(1)} className="accordion-toggle">
                    <span>1. {t.step1}</span>
                    <span className="toggle-chevron"></span>
                  </button>
                  <div className="accordion-content">
                    <div className="form-grid">
                      <div className="input-group">
                        <label className="required">{t.fullName}</label>
                        <input 
                          type="text" 
                          placeholder={t.inputNamePlaceholder} 
                          value={citizenDetails.fullName}
                          onChange={(e) => {
                            setCitizenDetails({...citizenDetails, fullName: e.target.value});
                            if (errors.fullName) setErrors({...errors, fullName: ''});
                          }}
                          className={errors.fullName ? 'gov-input-invalid' : ''}
                        />
                        {errors.fullName && <span className="gov-error-lbl">{errors.fullName}</span>}
                      </div>
                      <div className="input-group">
                        <label className="required">{t.emailAddr}</label>
                        <input 
                          type="email" 
                          placeholder={t.inputEmailPlaceholder} 
                          value={citizenDetails.email}
                          onChange={(e) => {
                            setCitizenDetails({...citizenDetails, email: e.target.value});
                            if (errors.email) setErrors({...errors, email: ''});
                          }}
                          className={errors.email ? 'gov-input-invalid' : ''}
                        />
                        {errors.email && <span className="gov-error-lbl">{errors.email}</span>}
                      </div>
                      <div className="input-group">
                        <label className="required">{t.phoneNo}</label>
                        <input 
                          type="tel" 
                          placeholder={t.phoneHint} 
                          value={citizenDetails.phone}
                          onChange={handlePhoneChange}
                          maxLength={10}
                          className={errors.phone ? 'gov-input-invalid' : ''}
                        />
                        <span className="phone-counter-lbl">{citizenDetails.phone.length} / 10 digits</span>
                        {errors.phone && <span className="gov-error-lbl">{errors.phone}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* STEP 2 ACCORDION / SECTION */}
                <div ref={step2Ref} className={`accordion-section ${currentStep === 2 ? 'expanded' : 'collapsed'}`}>
                  <button onClick={() => handleStepTransition(2)} className="accordion-toggle">
                    <span>2. {t.step2}</span>
                    <span className="toggle-chevron"></span>
                  </button>
                  
                  <div className="accordion-content">
                    <div className="form-grid">
                      <div className="form-section-title col-span-2">2. {t.step2}</div>
                      
                      <div className="input-group">
                        <label className="required">{t.category}</label>
                        <select 
                          value={grievanceDetails.category}
                          onChange={(e) => {
                            setGrievanceDetails({...grievanceDetails, category: e.target.value});
                            if (errors.category) setErrors({...errors, category: ''});
                          }}
                          className={errors.category ? 'gov-input-invalid' : ''}
                        >
                          <option value="">{t.catPlaceholder}</option>
                          <option value="Road & Potholes">{t.catRoad}</option>
                          <option value="Water Supply">{t.catWater}</option>
                          <option value="Waste Management">{t.catWaste}</option>
                          <option value="Electricity & Street Lights">{t.catElectricity}</option>
                          <option value="Others">{t.catOthers}</option>
                        </select>
                        {errors.category && <span className="gov-error-lbl">{errors.category}</span>}
                      </div>

                      <div className="input-group">
                        <label className="required">{t.area}</label>
                        <input 
                          type="text" 
                          placeholder={t.areaPlaceholder}
                          value={grievanceDetails.area}
                          onChange={(e) => {
                            setGrievanceDetails({...grievanceDetails, area: e.target.value});
                            if (errors.area) setErrors({...errors, area: ''});
                          }}
                          className={errors.area ? 'gov-input-invalid' : ''}
                        />
                        {errors.area && <span className="gov-error-lbl">{errors.area}</span>}
                      </div>

                      <div className="input-group col-span-2">
                        <label className="required">{t.description}</label>
                        <textarea 
                          rows="4" 
                          name="description"
                          placeholder={t.description}
                          value={grievanceDetails.description}
                          onChange={(e) => {
                            setGrievanceDetails({...grievanceDetails, description: e.target.value});
                            if (errors.description) setErrors({...errors, description: ''});
                          }}
                          className={errors.description ? 'gov-input-invalid' : ''}
                        />
                        {errors.description && <span className="gov-error-lbl">{errors.description}</span>}
                      </div>

                      <div className="input-group col-span-2">
                        <label className="required">{t.location}</label>
                        <div className="location-input-group" style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            placeholder={t.locPlaceholder}
                            value={grievanceDetails.location}
                            onChange={(e) => {
                              setGrievanceDetails({...grievanceDetails, location: e.target.value});
                              if (errors.location) setErrors({...errors, location: ''});
                            }}
                            className={errors.location ? 'gov-input-invalid' : ''}
                            style={{ flexGrow: 1 }}
                          />
                          <button
                            type="button"
                            onClick={detectLocation}
                            disabled={detectingLocation}
                            className="btn-secondary location-detect-btn"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                          >
                            {detectingLocation ? (
                              <span className="spinner-small"></span>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v3M12 20v3M1 12h3M20 12h3"/>
                              </svg>
                            )}
                            <span>{detectingLocation ? t.gpsDetecting : t.gpsDetectBtn}</span>
                          </button>
                        </div>
                        {errors.location && <span className="gov-error-lbl">{errors.location}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* STEP 3 ACCORDION / SECTION */}
                <div ref={step3Ref} className={`accordion-section ${currentStep === 3 ? 'expanded' : 'collapsed'}`}>
                  <button onClick={() => handleStepTransition(3)} className="accordion-toggle">
                    <span>3. {t.step3}</span>
                    <span className="toggle-chevron"></span>
                  </button>
                  <div className="accordion-content">
                    
                    <div className="dashed-upload-box" onClick={handleFileUploadClick}>
                      <div className="upload-icon-circle">
                        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                      <span className="upload-main-text">{t.uploadMain}</span>
                      <span className="upload-sub-text">{t.uploadSub}</span>
                    </div>

                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      multiple 
                      accept="image/*,video/*"
                      style={{ display: 'none' }}
                    />

                    <div className="media-note-field mt-2" style={{ marginBottom: '1.25rem' }}>
                      <input 
                        type="text" 
                        placeholder={t.mediaDescPlaceholder}
                        value={newFileNote}
                        onChange={(e) => setNewFileNote(e.target.value)}
                        className="sub-note-input"
                      />
                    </div>

                    <div className="media-preview-list">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="media-preview-card">
                          <div className="media-thumbnail-placeholder">
                            {file.type === 'image' ? (
                              <img src={file.url} alt="thumbnail" className="thumb-img" />
                            ) : (
                              <div className="video-thumb-overlay">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                  <polygon points="5 3 19 12 5 21" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="media-card-details">
                            <span className="media-card-name">{file.name} ({file.size}):</span>
                            <span className="media-card-desc">{file.description}</span>
                          </div>
                          <button onClick={() => removeFile(file.id)} className="remove-media-btn">&times;</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* STEP 4 ACCORDION / SECTION */}
                <div ref={step4Ref} className={`accordion-section ${currentStep === 4 ? 'expanded' : 'collapsed'}`}>
                  <button onClick={() => handleStepTransition(4)} className="accordion-toggle">
                    <span>4. {t.step4}</span>
                    <span className="toggle-chevron"></span>
                  </button>
                  <div className="accordion-content">
                    <div className="review-block">
                      <h3>{t.reviewTitle}</h3>
                      
                      <table className="review-table">
                        <tbody>
                          <tr>
                            <th>{t.citizenName}:</th>
                            <td>{citizenDetails.fullName || t.reviewAnon}</td>
                          </tr>
                          <tr>
                            <th>{t.contactInfo}:</th>
                            <td>{citizenDetails.email} / {citizenDetails.phone}</td>
                          </tr>
                          <tr>
                            <th>{t.category}:</th>
                            <td>{grievanceDetails.category === 'Road & Potholes' ? t.catRoad : 
                                 grievanceDetails.category === 'Water Supply' ? t.catWater :
                                 grievanceDetails.category === 'Waste Management' ? t.catWaste :
                                 grievanceDetails.category === 'Electricity & Street Lights' ? t.catElectricity : t.catOthers}</td>
                          </tr>
                          <tr>
                            <th>{t.area}:</th>
                            <td>{grievanceDetails.area}</td>
                          </tr>
                          <tr>
                            <th>{t.location}:</th>
                            <td>{grievanceDetails.location}</td>
                          </tr>
                          <tr>
                            <th>{t.description}:</th>
                            <td>{grievanceDetails.description}</td>
                          </tr>
                          <tr>
                            <th>{t.attachments}:</th>
                            <td>{uploadedFiles.length} {language === 'en' ? 'file(s) attached' : 'फ़ाइल संलग्न'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="submit-action-banner">
                      <button 
                        onClick={handleSubmitGrievance} 
                        disabled={isSubmitting} 
                        className="btn-success submit-complaint-btn"
                      >
                        {isSubmitting ? (language === 'en' ? 'Submitting Grievance...' : 'शिकायत दर्ज की जा रही है...') : t.submitComplaint}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )
        ) : activeTab === 'track' ? (
          /* Grievance Tracking tab */
          <div className="tracking-workspace">
            <div className="tracking-card">
              <div className="tracking-header">
                <h2>{t.trackTitle}</h2>
              </div>
              <form onSubmit={handleTrackSearch} className="tracking-search-bar">
                <input 
                  type="text" 
                  placeholder={t.trackInputPlaceholder} 
                  value={searchToken}
                  onChange={(e) => setSearchToken(e.target.value)}
                  className="token-search-input"
                />
                <button type="submit" className="btn-primary search-btn">{t.trackBtn}</button>
              </form>

              {trackingError && (
                <div className="track-error-msg animate-fade-in">{trackingError}</div>
              )}

              {searchedTicket && (
                <div className="tracking-results-box animate-fade-in">
                  <div className="ticket-meta-info">
                    <h3>{t.metaGrievanceDetails}</h3>
                    <div className="meta-grid">
                      <div><strong>{t.metaToken}:</strong> #{searchedTicket.token}</div>
                      <div><strong>{t.metaTitle}:</strong> {searchedTicket.title}</div>
                      <div><strong>{t.category}:</strong> {searchedTicket.category === 'Road & Potholes' ? t.catRoad : 
                                   searchedTicket.category === 'Water Supply' ? t.catWater :
                                   searchedTicket.category === 'Waste Management' ? t.catWaste :
                                   searchedTicket.category === 'Electricity & Street Lights' ? t.catElectricity : t.catOthers}</div>
                      <div><strong>{t.metaArea}:</strong> {searchedTicket.area}</div>
                      <div><strong>{t.trackAssignedTo}:</strong> {searchedTicket.department}</div>
                    </div>
                  </div>

                  {/* Visual Timeline */}
                  <div className="timeline-container">
                    <div className="timeline-line"></div>
                    
                    <div className="timeline-stages">
                      <div className={`stage-node ${getStageClass('registered')}`}>
                        <div className="node-marker checkmark-circle">✓</div>
                        <span className="node-label">{t.registeredStatus}</span>
                      </div>

                      <div className={`stage-node ${getStageClass('assigned')}`}>
                        <div className="node-marker diamond-marker">⬥</div>
                        <span className="node-label">
                          {t.assignedStatus} <br />
                          <small>({searchedTicket.department})</small>
                        </span>
                      </div>

                      <div className={`stage-node ${getStageClass('in_progress')}`}>
                        <div className="node-marker circle-marker"></div>
                        <span className="node-label">{t.progressStatus}</span>
                      </div>

                      <div className={`stage-node ${getStageClass('resolved')}`}>
                        <div className="node-marker checkmark-circle">✓</div>
                        <span className="node-label">
                          {searchedTicket.status === 'Closed' 
                            ? (language === 'en' ? 'RESOLVED & CLOSED' : 'समाधान एवं बंद')
                            : t.resolvedStatus}
                        </span>
                      </div>

                      <div className={`stage-node ${getStageClass('rejected')}`}>
                        <div className="node-marker cross-marker">✗</div>
                        <span className="node-label">
                          {language === 'en' ? 'REJECTED' : 'अस्वीकृत'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* CM Notifications Tab View */
          <div className="notifications-workspace animate-fade-in">
            <div className="notifications-card">
              <div className="notifications-header">
                <h2>{t.cmAnnouncements}</h2>
                <p>{t.cmSubLabel}</p>
              </div>

              <div className="noti-list">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="noti-item animate-fade-in">
                    <div className="noti-meta">
                      <span className={`noti-badge ${n.urgencyLevel}`}>
                        {language === 'en' ? n.urgencyEn : n.urgencyHi}
                      </span>
                      <span className="noti-date">{n.date}</span>
                    </div>
                    <h3 className="noti-title">
                      {language === 'en' ? n.titleEn : n.titleHi}
                    </h3>
                    <p className="noti-body">
                      {language === 'en' ? n.contentEn : n.contentHi}
                    </p>
                    <div className="noti-footer">
                      <strong>{t.emailSender}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Email Mockup Simulator Modal */}
      {showEmailSimulator && (
        <div className="email-simulator-overlay animate-fade-in">
          <div className="email-card">
            <div className="email-header">
              <span className="email-subject">{language === 'en' ? t.emailHeader : 'शिकायत दर्ज होने की पुष्टि'}</span>
              <span className="email-tag">{t.emailInbox}</span>
              <button className="close-email-btn" onClick={() => setShowEmailSimulator(false)}>&times;</button>
            </div>
            
            <div className="email-body">
              <div className="email-sender-row">
                <div className="sender-avatar">D</div>
                <div className="sender-info">
                  <strong>{t.emailSender}</strong>
                  <span className="sender-mail">{t.emailToMe} ▾</span>
                </div>
              </div>

              <div className="email-content">
                <p>{t.emailDear}</p>
                <p>
                  {language === 'en' 
                    ? t.emailBody.replace('#{token}', generatedToken)
                    : t.emailBody.replace('#{token}', generatedToken)}
                </p>
                <p>
                  {t.emailRegards}<br />
                  <strong>{t.emailSender}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
