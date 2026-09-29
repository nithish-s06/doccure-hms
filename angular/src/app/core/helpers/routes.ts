export const All_Routes={
    // Authentication
    login:'/login',
    register:'/register',
    forgotPassword:'/forgot-password',
    resetPassword:'/reset-password',
    otpVerification:'/otp-verification',
    termsOfService:'/terms-of-service',
    privacyPolicy:'/privacy-policy',
    

    // error
    error404:'/error-404',
    error500:'/error-500',
    error403:'/error-503',
    comingSoon:'/coming-soon',
    maintenance:'/maintenance',
    notifications:'/notifications',
    help:'/help',


    //Dashboard
    index:'/index',
    executiveDashboard:'/executive-dashboard',
    doctorDashboard:'/doctor-dashboard',
    nurseDashboard:'/nurse-dashboard',
    receptionDashboard:'/reception-dashboard',
    laboratoryDashboard:'/laboratory-dashboard',
    pharmacyDashboard:'/pharmacy-dashboard',
    billingDashboard:'/billing-dashboard',

    // Applications
    chat:'/chat',
    voiceCall:'/voice-call',
    videoCall:'/video-call',
    calendar:'/calendar',
    email:'/email',
    emailCompose:'/email-compose',
    fileManager:'/file-manager',
    notes:'/notes',
    todo:'/todo',
    workflowApprovals:'/workflow-approvals',
    workflowApprovalLevels:'/workflow-approval-levels',
    workflowRequests:'/workflow-requests',
    workflowActions:'/workflow-actions',
    taskAdd:'add-task',
    emailView:'email-view',
    // Layouts
    layoutMini:'/layout-mini',
    layoutHoverview:'/layout-hoverview',
    layoutHidden:'/layout-hidden',
    layoutFullwidth:'/layout-fullwidth',
    layoutTwoColumn:'/layout-two-column',
    layoutRTL:'/layout-rtl',

    // Base UI
    uiaccordion: '/base-ui/accordion',
    uialerts: '/base-ui/alerts',
    uiavatar: '/base-ui/avatar',
    uibadges: '/base-ui/badges',
    uibreadcrumb: '/base-ui/breadcrumb',
    uibuttons: '/base-ui/buttons',
    uibuttonsGroup: '/base-ui/buttons-group',
    uicards: '/base-ui/cards',
    uicollapse: '/base-ui/collapse',
    uicolors: '/base-ui/colors',
    uidropdowns: '/base-ui/dropdowns',
    uigrid: '/base-ui/grid',
    uiimages: '/base-ui/images',
    uimodals: '/base-ui/modals',
    uinavTabs: '/base-ui/nav-tabs',
    uioffcanvas: '/base-ui/offcanvas',
    uipagination: '/base-ui/pagination',
    uipopovers: '/base-ui/popovers',
    uiprogress: '/base-ui/progress',
    uitoasts: '/base-ui/toasts',
    uitypography: '/base-ui/typography',
    //advanced-ui
    uidragDrop:'/advanced-ui/drag-drop',
    uiclipboard:'/advanced-ui/clipboard',
    uilightbox:'/advanced-ui/lightbox',
    uirangeSlider:'/advanced-ui/range-slider',
    //Forms
    uiformElement:'/forms/form-element',
    uiselect:'/forms/select',
    uiformEditor:'/forms/form-editor',
    uiformPicker:'/forms/form-picker',
    //Charts
    uiapexChart:'/charts/apexchart',
    uichartjs:'/charts/chartjs',
    //Tables
    uibasicTables:'/tables/basic-tables',
    uidataTables:'/tables/data-tables',
    //Icons
    uifontawesome:'/icons/fontawesome',
    uitabler:'/icons/tabler',
    uilucide:'/icons/lucide',
    uiphosphor:'/icons/phosphor',


    // Patients
    patients:'/patients',
    addPatient:'/add-patient',
    patientProfile:'/patient-profile',
    admissions:'/admissions',
    admissionDetail:'/admission-detail',
    discharges:'/discharges',
    dischargeDetail:'/discharge-detail',
    opdPatients:'/opd-patients',
    opdPatientDetail:'/opd-patient-detail',
    ipdPatients:'/ipd-patients',
    ipdPatientDetail:'/ipd-patient-detail',
    patientVisits:'/patient-visits',
    patientVisitDetail:'/patient-visit-detail',
    patientMedicalHistory:'/patient-medical-history',
    patientMedicalHistoryDetail:'/patient-medical-history-detail',
    patientDocuments:'/patient-documents',
    patientDocumentDetail:'/patient-document-detail',
    patientInsurance:'/patient-insurance',
    patientInsuranceDetail:'/patient-insurance-detail',
    patientFamilyMembers:'/patient-family-members',
    patientFeedback:'/patient-feedback',
    patientFeedbackDetail:'/patient-feedback-detail',

    // Doctors
    doctors:'/doctors',
    addDoctor:'/add-doctor',
    doctorProfile:'/doctor-profile',
    specializations:'/specializations',
    specializationDetail:'/specialization-detail',
    doctorSchedule:'/doctor-schedule',
    doctorAvailability:'/doctor-availability',
    doctorAvailabilityDetail:'/doctor-availability-detail',
    doctorLeaveRequests:'/doctor-leave-requests',
    consultationFees:'/consultation-fees',
    consultationFeeDetail:'/consultation-fee-detail',

    // Appointments
    appointments:'/appointments',
    appointmentDetail:'/appointment-detail',
    appointmentCalendar:'/appointment-calendar',
    bookAppointment:'/book-appointment',
    queueManagement:'/queue-management',
    queueTokenDetail:'/queue-token-detail',
    walkInPatients:'/walk-in-patients',
    walkInPatientDetail:'/walk-in-patient-detail',
    followUpAppointments:'/follow-up-appointments',
    followUpAppointmentDetail:'/follow-up-appointment-detail',
    appointmentRequests:'/appointment-requests',
    appointmentRequestDetail:'/appointment-request-detail',
    cancelledAppointments:'/cancelled-appointments',

    // Clinical - Pharmacy
    pharmacy:'/pharmacy',
    medicines:'/medicines',
    medicineDetail:'/medicine-detail',
    medicineCategories:'/medicine-categories',
    medicineCategoryDetail:'/medicine-category-detail',
    pharmacySuppliers:'/pharmacy-suppliers',
    pharmacySupplierDetail:'/pharmacy-supplier-detail',
    pharmacyPurchaseOrders:'/pharmacy-purchase-orders',
    pharmacyPurchaseOrderDetail:'/pharmacy-purchase-order-detail',
    pharmacyInventory:'/pharmacy-inventory',
    pharmacyInventoryDetail:'/pharmacy-inventory-detail',
    prescriptions:'/prescriptions',
    prescriptionDetail:'/prescription-detail',
    pharmacySales:'/pharmacy-sales',
    pharmacySaleDetail:'/pharmacy-sale-detail',
    expiryTracking:'/expiry-tracking',
    expiryItemDetail:'/expiry-item-detail',
    stockAlerts:'/stock-alerts',

    // Clinical - Laboratory
    laboratory:'/laboratory',
    labTests:'/lab-tests',
    labTestCategories:'/lab-test-categories',
    labTestRequests:'/lab-test-requests',
    sampleCollection:'/sample-collection',
    sampleTracking:'/sample-tracking',
    labTestResults:'/lab-test-results',
    labTestResultDetail:'/lab-test-result-detail',
    labTestDetail:'/lab-test-detail',
    sampleDetail:'/sample-detail',

    // Clinical - Emergency
    emergencyDashboard:'/emergency-dashboard',
    triage:'/triage',
    emergency:'/emergency',
    traumaCases:'/trauma-cases',
    criticalCare:'/critical-care',

    // Clinical - Wards & Beds
    wards:'/wards',
    bedStatus:'/bed-status',
    bedAllocation:'/bed-allocation',
    bedTransfer:'/bed-transfer',
    bedOccupancy:'/bed-occupancy',

    // Clinical - ICU
    icu:'/icu',
    icuPatients:'/icu-patients',
    icuBeds:'/icu-beds',
    icuMonitoring:'/icu-monitoring',
    criticalAlerts:'/critical-alerts',

    // Clinical - Operation Theater
    operationTheater:'/operation-theater',
    otCalendar:'/ot-calendar',
    surgeons:'/surgeons',
    otBooking:'/ot-booking',
    operationReports:'/operation-reports',

    // Clinical - Radiology
    radiology:'/radiology',
    xRay:'/x-ray',
    mri:'/mri',
    ctScan:'/ct-scan',
    ultrasound:'/ultrasound',
    scanRequests:'/scan-requests',
    radiologyReports:'/radiology-reports',

    // Clinical - Blood Bank
    bloodBank:'/blood-bank',
    bloodDonors:'/blood-donors',
    bloodRequests:'/blood-requests',
    bloodIssue:'/blood-issue',
    bloodCamps:'/blood-camps',

    // Clinical - Nursing
    nursingDashboard:'/nursing-dashboard',
    nursingNotes:'/nursing-notes',
    vitalSigns:'/vital-signs',
    medicationAdministration:'/medication-administration',
    carePlans:'/care-plans',
    shiftReports:'/shift-reports',

    // Patient Care - Medical Records
    medicalRecords:'/medical-records',
    medicalHistory:'/medical-history',
    diagnoses:'/diagnoses',
    emrPrescriptions:'/emr-prescriptions',
    allergies:'/allergies',
    progressNotes:'/progress-notes',
    emrDocuments:'/emr-documents',

    // Patient Care - Telemedicine
    telemedicine:'/telemedicine',
    consultationHistory:'/consultation-history',
    waitingRoom:'/waiting-room',
    scheduledSessions:'/scheduled-sessions',

    // Patient Care - Diet & Nutrition
    diet:'/diet',
    mealPlanning:'/meal-planning',
    nutritionAssessment:'/nutrition-assessment',
    dietician:'/dietician',

    // Management - Billing
    billing:'/billing',
    invoices:'/invoices',
    payments:'/payments',
    estimates:'/estimates',
    refunds:'/refunds',
    discounts:'/discounts',
    taxSettings:'/tax-settings',

    // Management - Insurance
    insurance:'/insurance',
    insuranceClaims:'/insurance-claims',
    preAuthorization:'/pre-authorization',
    insuranceApprovals:'/insurance-approvals',
    reimbursements:'/reimbursements',

    // Management - HR & Staff
    hr:'/hr',
    attendance:'/attendance',
    leaveManagement:'/leave-management',
    payroll:'/payroll',
    hrDepartments:'/hr-departments',
    designations:'/designations',
    shifts:'/shifts',
    recruitment:'/recruitment',
    performance:'/performance',

    // Management - Inventory
    inventory:'/inventory',
    products:'/products',
    inventoryCategories:'/inventory-categories',
    inventorySuppliers:'/inventory-suppliers',
    inventoryPurchaseOrders:'/inventory-purchase-orders',
    stockIn:'/stock-in',
    stockOut:'/stock-out',
    stockTransfers:'/stock-transfers',
    assetTracking:'/asset-tracking',
    lowStock:'/low-stock',

    // Management - Ambulance
    ambulance:'/ambulance',
    ambulanceVehicles:'/ambulance-vehicles',
    ambulanceDrivers:'/ambulance-drivers',
    emergencyCalls:'/emergency-calls',
    ambulanceTrips:'/ambulance-trips',
    ambulanceMaintenance:'/ambulance-maintenance',

    // Management - Finance
    income:'/income',
    expenses:'/expenses',
    transactions:'/transactions',
    accounts:'/accounts',
    bankAccounts:'/bank-accounts',
    profitLoss:'/profit-loss',

    // Management - Administration
    branches:'/branches',
    adminDepartments:'/admin-departments',
    noticeBoard:'/notice-board',
    announcements:'/announcements',
    visitors:'/visitors',
    complaints:'/complaints',

    // Management - Assets
    equipment:'/equipment',
    assetMaintenance:'/asset-maintenance',
    repairs:'/repairs',
    vendors:'/vendors',
    assetCategories:'/asset-categories',

    // System - Reports
    reports:'/reports',
    patientReports:'/patient-reports',
    appointmentReports:'/appointment-reports',
    revenueReports:'/revenue-reports',
    pharmacyReports:'/pharmacy-reports',
    laboratoryReports:'/laboratory-reports',
    doctorPerformance:'/doctor-performance',
    bedOccupancyReport:'/bed-occupancy-report',
    inventoryReports:'/inventory-reports',
    hrReports:'/hr-reports',

    // System - misc
    activityLogs:'/activity-logs',
    auditLogs:'/audit-logs',
    users:'/users',
    roles:'/roles',
    permissions:'/permissions',
    backupRestore:'/backup-restore',
    emailTemplates:'/email-templates',
    smsTemplates:'/sms-templates',
    settings:'/settings',

    // Authentication (additional)
    lockScreen:'/lock-screen',
    twoFactorAuthentication:'/two-factor-authentication',
    sessionExpired:'/session-expired',

    // Error pages (additional)
    error401:'/error-401',
    error403Page:'/error-403',
    error429:'/error-429',
    error503:'/error-503',
    underMaintenance:'/under-maintenance',
    offline:'/offline',

    // General pages
    profile:'/profile',
    myAccount:'/my-account',
    activity:'/activity',
    gallery:'/gallery',
    helpCenter:'/help-center',
    knowledgeBase:'/knowledge-base',
    supportTickets:'/support-tickets',
    contactUs:'/contact-us',
    searchResults:'/search-results',
    pricing:'/pricing',
    faq:'/faq',
    termsConditions:'/terms-conditions',
    starterPage:'/starter-page',

}
