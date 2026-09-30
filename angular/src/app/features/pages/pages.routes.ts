
import { Routes } from '@angular/router';

export const Pages_Routes: Routes = [
        {    
        path: '', loadComponent: () => import('./pages').then((m) => m.Pages),
         children:[
            //Dashboards
            { path: 'index', loadComponent: () => import('./main-menu/dashboards/dashboard/dashboard').then((m) => m.Dashboard)},
            { path: 'executive-dashboard', loadComponent: () => import('./main-menu/dashboards/executive-dashboard/executive-dashboard').then((m) => m.ExecutiveDashboard)},
            { path: 'doctor-dashboard', loadComponent: () => import('./main-menu/dashboards/doctor-dashboard/doctor-dashboard').then((m) => m.DoctorDashboard)},
            { path: 'nurse-dashboard', loadComponent: () => import('./main-menu/dashboards/nurse-dashboard/nurse-dashboard').then((m) => m.NurseDashboard)},
            { path: 'reception-dashboard', loadComponent: () => import('./main-menu/dashboards/reception-dashboard/reception-dashboard').then((m) => m.ReceptionDashboard)},
            { path: 'laboratory-dashboard', loadComponent: () => import('./main-menu/dashboards/laboratory-dashboard/laboratory-dashboard').then((m) => m.LaboratoryDashboard)},
            { path: 'pharmacy-dashboard', loadComponent: () => import('./main-menu/dashboards/pharmacy-dashboard/pharmacy-dashboard').then((m) => m.PharmacyDashboard)},
            { path: 'billing-dashboard', loadComponent: () => import('./main-menu/dashboards/billing-dashboard/billing-dashboard').then((m) => m.BillingDashboard)},


             // Layouts
            // { path: 'layout-mini', loadComponent: () => import('./main/layout-pages/layout-pages').then((m) => m.LayoutPages)},
            // { path: 'layout-hoverview', loadComponent: () => import('./main/layout-pages/layout-pages').then((m) => m.LayoutPages)},
            // { path: 'layout-hidden', loadComponent: () => import('./main/layout-pages/layout-pages').then((m) => m.LayoutPages)},
            // { path: 'layout-fullwidth', loadComponent: () => import('./main/layout-pages/layout-pages').then((m) => m.LayoutPages)},
            // { path: 'layout-two-column', loadComponent: () => import('./main/layout-pages/layout-pages').then((m) => m.LayoutPages)},
            // { path: 'layout-rtl', loadComponent: () => import('./main/layout-pages/layout-pages').then((m) => m.LayoutPages)},

            // Patients
            { path: 'patients', loadComponent: () => import('./main-menu/patients/patients/patients').then((m) => m.Patients)},
            { path: 'add-patient', loadComponent: () => import('./main-menu/patients/add-patient/add-patient').then((m) => m.AddPatient)},
            { path: 'patient-profile', loadComponent: () => import('./main-menu/patients/patient-profile/patient-profile').then((m) => m.PatientProfile)},
            { path: 'admissions', loadComponent: () => import('./main-menu/patients/admissions/admissions').then((m) => m.Admissions)},
            { path: 'admission-detail', loadComponent: () => import('./main-menu/patients/admission-detail/admission-detail').then((m) => m.AdmissionDetail)},
            { path: 'discharges', loadComponent: () => import('./main-menu/patients/discharges/discharges').then((m) => m.Discharges)},
            { path: 'discharge-detail', loadComponent: () => import('./main-menu/patients/discharge-detail/discharge-detail').then((m) => m.DischargeDetail)},
            { path: 'opd-patients', loadComponent: () => import('./main-menu/patients/opd-patients/opd-patients').then((m) => m.OpdPatients)},
            { path: 'opd-patient-detail', loadComponent: () => import('./main-menu/patients/opd-patient-detail/opd-patient-detail').then((m) => m.OpdPatientDetail)},
            { path: 'ipd-patients', loadComponent: () => import('./main-menu/patients/ipd-patients/ipd-patients').then((m) => m.IpdPatients)},
            { path: 'ipd-patient-detail', loadComponent: () => import('./main-menu/patients/ipd-patient-detail/ipd-patient-detail').then((m) => m.IpdPatientDetail)},
            { path: 'patient-visits', loadComponent: () => import('./main-menu/patients/patient-visits/patient-visits').then((m) => m.PatientVisits)},
            { path: 'patient-visit-detail', loadComponent: () => import('./main-menu/patients/patient-visit-detail/patient-visit-detail').then((m) => m.PatientVisitDetail)},
            { path: 'patient-medical-history', loadComponent: () => import('./main-menu/patients/patient-medical-history/patient-medical-history').then((m) => m.PatientMedicalHistory)},
            { path: 'patient-medical-history-detail', loadComponent: () => import('./main-menu/patients/patient-medical-history-detail/patient-medical-history-detail').then((m) => m.PatientMedicalHistoryDetail)},
            { path: 'patient-documents', loadComponent: () => import('./main-menu/patients/patient-documents/patient-documents').then((m) => m.PatientDocuments)},
            { path: 'patient-document-detail', loadComponent: () => import('./main-menu/patients/patient-document-detail/patient-document-detail').then((m) => m.PatientDocumentDetail)},
            { path: 'patient-insurance', loadComponent: () => import('./main-menu/patients/patient-insurance/patient-insurance').then((m) => m.PatientInsurance)},
            { path: 'patient-insurance-detail', loadComponent: () => import('./main-menu/patients/patient-insurance-detail/patient-insurance-detail').then((m) => m.PatientInsuranceDetail)},
            { path: 'patient-family-members', loadComponent: () => import('./main-menu/patients/patient-family-members/patient-family-members').then((m) => m.PatientFamilyMembers)},
            { path: 'patient-feedback', loadComponent: () => import('./main-menu/patients/patient-feedback/patient-feedback').then((m) => m.PatientFeedback)},
            { path: 'patient-feedback-detail', loadComponent: () => import('./main-menu/patients/patient-feedback-detail/patient-feedback-detail').then((m) => m.PatientFeedbackDetail)},

            // Doctors
            { path: 'doctors', loadComponent: () => import('./main-menu/doctors/doctors/doctors').then((m) => m.Doctors)},
            { path: 'add-doctor', loadComponent: () => import('./main-menu/doctors/add-doctor/add-doctor').then((m) => m.AddDoctor)},
            { path: 'doctor-profile', loadComponent: () => import('./main-menu/doctors/doctor-profile/doctor-profile').then((m) => m.DoctorProfile)},
            { path: 'specializations', loadComponent: () => import('./main-menu/doctors/specializations/specializations').then((m) => m.Specializations)},
            { path: 'specialization-detail', loadComponent: () => import('./main-menu/doctors/specialization-detail/specialization-detail').then((m) => m.SpecializationDetail)},
            { path: 'doctor-schedule', loadComponent: () => import('./main-menu/doctors/doctor-schedule/doctor-schedule').then((m) => m.DoctorSchedule)},
            { path: 'doctor-availability', loadComponent: () => import('./main-menu/doctors/doctor-availability/doctor-availability').then((m) => m.DoctorAvailability)},
            { path: 'doctor-availability-detail', loadComponent: () => import('./main-menu/doctors/doctor-availability-detail/doctor-availability-detail').then((m) => m.DoctorAvailabilityDetail)},
            { path: 'doctor-leave-requests', loadComponent: () => import('./main-menu/doctors/doctor-leave-requests/doctor-leave-requests').then((m) => m.DoctorLeaveRequests)},
            { path: 'consultation-fees', loadComponent: () => import('./main-menu/doctors/consultation-fees/consultation-fees').then((m) => m.ConsultationFees)},
            { path: 'consultation-fee-detail', loadComponent: () => import('./main-menu/doctors/consultation-fee-detail/consultation-fee-detail').then((m) => m.ConsultationFeeDetail)},

            // Appointments
            { path: 'appointments', loadComponent: () => import('./main-menu/appointments/appointments/appointments').then((m) => m.Appointments)},
            { path: 'appointment-detail', loadComponent: () => import('./main-menu/appointments/appointment-detail/appointment-detail').then((m) => m.AppointmentDetail)},
            { path: 'appointment-calendar', loadComponent: () => import('./main-menu/appointments/appointment-calendar/appointment-calendar').then((m) => m.AppointmentCalendar)},
            { path: 'book-appointment', loadComponent: () => import('./main-menu/appointments/book-appointment/book-appointment').then((m) => m.BookAppointment)},
            { path: 'queue-management', loadComponent: () => import('./main-menu/appointments/queue-management/queue-management').then((m) => m.QueueManagement)},
            { path: 'queue-token-detail', loadComponent: () => import('./main-menu/appointments/queue-token-detail/queue-token-detail').then((m) => m.QueueTokenDetail)},
            { path: 'walk-in-patients', loadComponent: () => import('./main-menu/appointments/walk-in-patients/walk-in-patients').then((m) => m.WalkInPatients)},
            { path: 'walk-in-patient-detail', loadComponent: () => import('./main-menu/appointments/walk-in-patient-detail/walk-in-patient-detail').then((m) => m.WalkInPatientDetail)},
            { path: 'follow-up-appointments', loadComponent: () => import('./main-menu/appointments/follow-up-appointments/follow-up-appointments').then((m) => m.FollowUpAppointments)},
            { path: 'follow-up-appointment-detail', loadComponent: () => import('./main-menu/appointments/follow-up-appointment-detail/follow-up-appointment-detail').then((m) => m.FollowUpAppointmentDetail)},
            { path: 'appointment-requests', loadComponent: () => import('./main-menu/appointments/appointment-requests/appointment-requests').then((m) => m.AppointmentRequests)},
            { path: 'appointment-request-detail', loadComponent: () => import('./main-menu/appointments/appointment-request-detail/appointment-request-detail').then((m) => m.AppointmentRequestDetail)},
            { path: 'cancelled-appointments', loadComponent: () => import('./main-menu/appointments/cancelled-appointments/cancelled-appointments').then((m) => m.CancelledAppointments)},

            // Clinical - Pharmacy
            { path: 'pharmacy', loadComponent: () => import('./clinical/pharmacy/pharmacy/pharmacy').then((m) => m.Pharmacy)},
            { path: 'medicines', loadComponent: () => import('./clinical/pharmacy/medicines/medicines').then((m) => m.Medicines)},
            { path: 'medicine-detail', loadComponent: () => import('./clinical/pharmacy/medicine-detail/medicine-detail').then((m) => m.MedicineDetail)},
            { path: 'medicine-categories', loadComponent: () => import('./clinical/pharmacy/medicine-categories/medicine-categories').then((m) => m.MedicineCategories)},
            { path: 'medicine-category-detail', loadComponent: () => import('./clinical/pharmacy/medicine-category-detail/medicine-category-detail').then((m) => m.MedicineCategoryDetail)},
            { path: 'pharmacy-suppliers', loadComponent: () => import('./clinical/pharmacy/pharmacy-suppliers/pharmacy-suppliers').then((m) => m.PharmacySuppliers)},
            { path: 'pharmacy-supplier-detail', loadComponent: () => import('./clinical/pharmacy/pharmacy-supplier-detail/pharmacy-supplier-detail').then((m) => m.PharmacySupplierDetail)},
            { path: 'pharmacy-purchase-orders', loadComponent: () => import('./clinical/pharmacy/pharmacy-purchase-orders/pharmacy-purchase-orders').then((m) => m.PharmacyPurchaseOrders)},
            { path: 'pharmacy-purchase-order-detail', loadComponent: () => import('./clinical/pharmacy/pharmacy-purchase-order-detail/pharmacy-purchase-order-detail').then((m) => m.PharmacyPurchaseOrderDetail)},
            { path: 'pharmacy-inventory', loadComponent: () => import('./clinical/pharmacy/pharmacy-inventory/pharmacy-inventory').then((m) => m.PharmacyInventory)},
            { path: 'pharmacy-inventory-detail', loadComponent: () => import('./clinical/pharmacy/pharmacy-inventory-detail/pharmacy-inventory-detail').then((m) => m.PharmacyInventoryDetail)},
            { path: 'prescriptions', loadComponent: () => import('./clinical/pharmacy/prescriptions/prescriptions').then((m) => m.Prescriptions)},
            { path: 'prescription-detail', loadComponent: () => import('./clinical/pharmacy/prescription-detail/prescription-detail').then((m) => m.PrescriptionDetail)},
            { path: 'pharmacy-sales', loadComponent: () => import('./clinical/pharmacy/pharmacy-sales/pharmacy-sales').then((m) => m.PharmacySales)},
            { path: 'pharmacy-sale-detail', loadComponent: () => import('./clinical/pharmacy/pharmacy-sale-detail/pharmacy-sale-detail').then((m) => m.PharmacySaleDetail)},
            { path: 'expiry-tracking', loadComponent: () => import('./clinical/pharmacy/expiry-tracking/expiry-tracking').then((m) => m.ExpiryTracking)},
            { path: 'expiry-item-detail', loadComponent: () => import('./clinical/pharmacy/expiry-item-detail/expiry-item-detail').then((m) => m.ExpiryItemDetail)},
            { path: 'stock-alerts', loadComponent: () => import('./clinical/pharmacy/stock-alerts/stock-alerts').then((m) => m.StockAlerts)},

            // Clinical - Laboratory
            { path: 'laboratory', loadComponent: () => import('./clinical/laboratory/laboratory/laboratory').then((m) => m.Laboratory)},
            { path: 'lab-tests', loadComponent: () => import('./clinical/laboratory/lab-tests/lab-tests').then((m) => m.LabTests)},
            { path: 'lab-test-categories', loadComponent: () => import('./clinical/laboratory/lab-test-categories/lab-test-categories').then((m) => m.LabTestCategories)},
            { path: 'lab-test-requests', loadComponent: () => import('./clinical/laboratory/lab-test-requests/lab-test-requests').then((m) => m.LabTestRequests)},
            { path: 'sample-collection', loadComponent: () => import('./clinical/laboratory/sample-collection/sample-collection').then((m) => m.SampleCollection)},
            { path: 'sample-detail', loadComponent: () => import('./clinical/laboratory/sample-detail/sample-detail').then((m) => m.SampleDetail)},
            { path: 'lab-test-detail', loadComponent: () => import('./clinical/laboratory/lab-test-detail/lab-test-detail').then((m) => m.LabTestDetail)},
            { path: 'lab-test-result-detail', loadComponent: () => import('./clinical/laboratory/lab-test-result-detail/lab-test-result-detail').then((m) => m.LabTestResultDetail)},
            { path: 'sample-tracking', loadComponent: () => import('./clinical/laboratory/sample-tracking/sample-tracking').then((m) => m.SampleTracking)},
            { path: 'lab-test-results', loadComponent: () => import('./clinical/laboratory/lab-test-results/lab-test-results').then((m) => m.LabTestResults)},

            // Clinical - Emergency
            { path: 'emergency-dashboard', loadComponent: () => import('./clinical/emergency/emergency-dashboard/emergency-dashboard').then((m) => m.EmergencyDashboard)},
            { path: 'triage', loadComponent: () => import('./clinical/emergency/triage/triage').then((m) => m.Triage)},
            { path: 'emergency', loadComponent: () => import('./clinical/emergency/emergency/emergency').then((m) => m.Emergency)},
            { path: 'trauma-cases', loadComponent: () => import('./clinical/emergency/trauma-cases/trauma-cases').then((m) => m.TraumaCases)},
            { path: 'critical-care', loadComponent: () => import('./clinical/emergency/critical-care/critical-care').then((m) => m.CriticalCare)},
            { path: 'critical-care-detail', loadComponent: () => import('./clinical/emergency/critical-care-detail/critical-care-detail').then((m) => m.CriticalCareDetail)},
            { path: 'emergency-detail', loadComponent: () => import('./clinical/emergency/emergency-detail/emergency-detail').then((m) => m.EmergencyDetail)},
            { path: 'trauma-case-detail', loadComponent: () => import('./clinical/emergency/trauma-case-detail/trauma-case-detail').then((m) => m.TraumaCaseDetail)},
            { path: 'triage-detail', loadComponent: () => import('./clinical/emergency/triage-detail/triage-detail').then((m) => m.TriageDetail)},

            // Clinical - Wards & Beds
            { path: 'wards', loadComponent: () => import('./clinical/wards-beds/wards/wards').then((m) => m.Wards)},
            { path: 'bed-status', loadComponent: () => import('./clinical/wards-beds/bed-status/bed-status').then((m) => m.BedStatus)},
            { path: 'bed-allocation', loadComponent: () => import('./clinical/wards-beds/bed-allocation/bed-allocation').then((m) => m.BedAllocation)},
            { path: 'bed-transfer', loadComponent: () => import('./clinical/wards-beds/bed-transfer/bed-transfer').then((m) => m.BedTransfer)},
            { path: 'bed-occupancy', loadComponent: () => import('./clinical/wards-beds/bed-occupancy/bed-occupancy').then((m) => m.BedOccupancy)},
            { path: 'bed-detail', loadComponent: () => import('./clinical/wards-beds/bed-detail/bed-detail').then((m) => m.BedDetail)},

            // Clinical - ICU
            { path: 'icu', loadComponent: () => import('./clinical/icu/icu/icu').then((m) => m.Icu)},
            { path: 'icu-patients', loadComponent: () => import('./clinical/icu/icu-patients/icu-patients').then((m) => m.IcuPatients)},
            { path: 'icu-beds', loadComponent: () => import('./clinical/icu/icu-beds/icu-beds').then((m) => m.IcuBeds)},
            { path: 'icu-monitoring', loadComponent: () => import('./clinical/icu/icu-monitoring/icu-monitoring').then((m) => m.IcuMonitoring)},
            { path: 'critical-alerts', loadComponent: () => import('./clinical/icu/critical-alerts/critical-alerts').then((m) => m.CriticalAlerts)},

            // Clinical - Operation Theater
            { path: 'operation-theater', loadComponent: () => import('./clinical/operation-theater/operation-theater/operation-theater').then((m) => m.OperationTheater)},
            { path: 'ot-calendar', loadComponent: () => import('./clinical/operation-theater/ot-calendar/ot-calendar').then((m) => m.OtCalendar)},
            { path: 'surgeons', loadComponent: () => import('./clinical/operation-theater/surgeons/surgeons').then((m) => m.Surgeons)},
            { path: 'surgeon-profile', loadComponent: () => import('./clinical/wards-beds/surgeon-profile/surgeon-profile').then((m) => m.SurgeonProfile)},
            { path: 'ot-booking', loadComponent: () => import('./clinical/operation-theater/ot-booking/ot-booking').then((m) => m.OtBooking)},
            { path: 'ot-booking-detail', loadComponent: () => import('./clinical/wards-beds/ot-booking-detail/ot-booking-detail').then((m) => m.OtBookingDetail)},
            { path: 'operation-reports', loadComponent: () => import('./clinical/operation-theater/operation-reports/operation-reports').then((m) => m.OperationReports)},

            // Clinical - Radiology
            { path: 'radiology', loadComponent: () => import('./clinical/radiology/radiology/radiology').then((m) => m.Radiology)},
            { path: 'radiology-order-detail', loadComponent: () => import('./clinical/radiology/radiology-order-detail/radiology-order-detail').then((m) => m.RadiologyOrderDetail)},
            { path: 'x-ray', loadComponent: () => import('./clinical/radiology/x-ray/x-ray').then((m) => m.XRay)},
            { path: 'mri', loadComponent: () => import('./clinical/radiology/mri/mri').then((m) => m.Mri)},
            { path: 'ct-scan', loadComponent: () => import('./clinical/radiology/ct-scan/ct-scan').then((m) => m.CtScan)},
            { path: 'ultrasound', loadComponent: () => import('./clinical/radiology/ultrasound/ultrasound').then((m) => m.Ultrasound)},
            { path: 'scan-requests', loadComponent: () => import('./clinical/radiology/scan-requests/scan-requests').then((m) => m.ScanRequests)},
            { path: 'scan-request-detail', loadComponent: () => import('./clinical/radiology/scan-request-detail/scan-request-detail').then((m) => m.ScanRequestDetail)},
            { path: 'radiology-reports', loadComponent: () => import('./clinical/radiology/radiology-reports/radiology-reports').then((m) => m.RadiologyReports)},
            { path: 'radiology-report-detail', loadComponent: () => import('./clinical/radiology/radiology-report-detail/radiology-report-detail').then((m) => m.RadiologyReportDetail)},

            // Clinical - Blood Bank
            { path: 'blood-bank', loadComponent: () => import('./clinical/blood-bank/blood-bank/blood-bank').then((m) => m.BloodBank)},
            { path: 'blood-donors', loadComponent: () => import('./clinical/blood-bank/blood-donors/blood-donors').then((m) => m.BloodDonors)},
            { path: 'blood-requests', loadComponent: () => import('./clinical/blood-bank/blood-requests/blood-requests').then((m) => m.BloodRequests)},
            { path: 'blood-request-detail', loadComponent: () => import('./clinical/blood-bank/blood-request-detail/blood-request-detail').then((m) => m.BloodRequestDetail)},
            { path: 'blood-issue', loadComponent: () => import('./clinical/blood-bank/blood-issue/blood-issue').then((m) => m.BloodIssue)},
            { path: 'blood-issue-detail', loadComponent: () => import('./clinical/blood-bank/blood-issue-detail/blood-issue-detail').then((m) => m.BloodIssueDetail)},
            { path: 'blood-camps', loadComponent: () => import('./clinical/blood-bank/blood-camps/blood-camps').then((m) => m.BloodCamps)},

            // Clinical - Nursing
            { path: 'nursing-dashboard', loadComponent: () => import('./clinical/nursing/nursing-dashboard/nursing-dashboard').then((m) => m.NursingDashboard)},
            { path: 'nursing-notes', loadComponent: () => import('./clinical/nursing/nursing-notes/nursing-notes').then((m) => m.NursingNotes)},
            { path: 'vital-signs', loadComponent: () => import('./clinical/nursing/vital-signs/vital-signs').then((m) => m.VitalSigns)},
            { path: 'medication-administration', loadComponent: () => import('./clinical/nursing/medication-administration/medication-administration').then((m) => m.MedicationAdministration)},
            { path: 'care-plans', loadComponent: () => import('./clinical/nursing/care-plans/care-plans').then((m) => m.CarePlans)},
            { path: 'shift-reports', loadComponent: () => import('./clinical/nursing/shift-reports/shift-reports').then((m) => m.ShiftReports)},

            // Patient Care - Medical Records
            { path: 'medical-records', loadComponent: () => import('./patient-care/medical-records/medical-records/medical-records').then((m) => m.MedicalRecords)},
            { path: 'medical-history', loadComponent: () => import('./patient-care/medical-records/medical-history/medical-history').then((m) => m.MedicalHistory)},
            { path: 'diagnoses', loadComponent: () => import('./patient-care/medical-records/diagnoses/diagnoses').then((m) => m.Diagnoses)},
            { path: 'emr-prescriptions', loadComponent: () => import('./patient-care/medical-records/emr-prescriptions/emr-prescriptions').then((m) => m.EmrPrescriptions)},
            { path: 'allergies', loadComponent: () => import('./patient-care/medical-records/allergies/allergies').then((m) => m.Allergies)},
            { path: 'progress-notes', loadComponent: () => import('./patient-care/medical-records/progress-notes/progress-notes').then((m) => m.ProgressNotes)},
            { path: 'emr-documents', loadComponent: () => import('./patient-care/medical-records/emr-documents/emr-documents').then((m) => m.EmrDocuments)},
            { path: 'medical-record-detail', loadComponent: () => import('./patient-care/medical-records/medical-record-detail/medical-record-detail').then((m) => m.MedicalRecordDetail)},

            // Patient Care - Telemedicine
            { path: 'telemedicine', loadComponent: () => import('./patient-care/telemedicine/telemedicine/telemedicine').then((m) => m.Telemedicine)},
            { path: 'consultation-history', loadComponent: () => import('./patient-care/telemedicine/consultation-history/consultation-history').then((m) => m.ConsultationHistory)},
            { path: 'waiting-room', loadComponent: () => import('./patient-care/telemedicine/waiting-room/waiting-room').then((m) => m.WaitingRoom)},
            { path: 'scheduled-sessions', loadComponent: () => import('./patient-care/telemedicine/scheduled-sessions/scheduled-sessions').then((m) => m.ScheduledSessions)},
            { path: 'consultation-detail', loadComponent: () => import('./patient-care/telemedicine/consultation-detail/consultation-detail').then((m) => m.ConsultationDetail)},
            { path: 'telemedicine-session-detail', loadComponent: () => import('./patient-care/telemedicine/telemedicine-session-detail/telemedicine-session-detail').then((m) => m.TelemedicineSessionDetail)},

            // Patient Care - Diet & Nutrition
            { path: 'diet', loadComponent: () => import('./patient-care/diet-nutrition/diet/diet').then((m) => m.Diet)},
            { path: 'meal-planning', loadComponent: () => import('./patient-care/diet-nutrition/meal-planning/meal-planning').then((m) => m.MealPlanning)},
            { path: 'nutrition-assessment', loadComponent: () => import('./patient-care/diet-nutrition/nutrition-assessment/nutrition-assessment').then((m) => m.NutritionAssessment)},
            { path: 'dietician', loadComponent: () => import('./patient-care/diet-nutrition/dietician/dietician').then((m) => m.Dietician)},

            // Management - Billing
            { path: 'billing', loadComponent: () => import('./management/billing/billing/billing').then((m) => m.Billing)},
            { path: 'billing-detail', loadComponent: () => import('./management/billing/billing-detail/billing-detail').then((m) => m.BillingDetail)},
            { path: 'invoices', loadComponent: () => import('./management/billing/invoices/invoices').then((m) => m.Invoices)},
            { path: 'invoice-detail', loadComponent: () => import('./management/billing/invoice-detail/invoice-detail').then((m) => m.InvoiceDetail)},
            { path: 'payments', loadComponent: () => import('./management/billing/payments/payments').then((m) => m.Payments)},
            { path: 'payment-detail', loadComponent: () => import('./management/billing/payment-detail/payment-detail').then((m) => m.PaymentDetail)},
            { path: 'estimates', loadComponent: () => import('./management/billing/estimates/estimates').then((m) => m.Estimates)},
            { path: 'refunds', loadComponent: () => import('./management/billing/refunds/refunds').then((m) => m.Refunds)},
            { path: 'discounts', loadComponent: () => import('./management/billing/discounts/discounts').then((m) => m.Discounts)},
            { path: 'tax-settings', loadComponent: () => import('./management/billing/tax-settings/tax-settings').then((m) => m.TaxSettings)},

            // Management - Insurance
            { path: 'insurance', loadComponent: () => import('./management/insurance/insurance/insurance').then((m) => m.Insurance)},
            { path: 'insurance-detail', loadComponent: () => import('./management/insurance/insurance-detail/insurance-detail').then((m) => m.InsuranceDetail)},
            { path: 'insurance-claims', loadComponent: () => import('./management/insurance/insurance-claims/insurance-claims').then((m) => m.InsuranceClaims)},
            { path: 'insurance-claim-detail', loadComponent: () => import('./management/insurance/insurance-claim-detail/insurance-claim-detail').then((m) => m.InsuranceClaimDetail)},
            { path: 'pre-authorization', loadComponent: () => import('./management/insurance/pre-authorization/pre-authorization').then((m) => m.PreAuthorization)},
            { path: 'pre-authorization-detail', loadComponent: () => import('./management/insurance/pre-authorization-detail/pre-authorization-detail').then((m) => m.PreAuthorizationDetail)},
            { path: 'insurance-approvals', loadComponent: () => import('./management/insurance/insurance-approvals/insurance-approvals').then((m) => m.InsuranceApprovals)},
            { path: 'insurance-approval-detail', loadComponent: () => import('./management/insurance/insurance-approval-detail/insurance-approval-detail').then((m) => m.InsuranceApprovalDetail)},
            { path: 'reimbursements', loadComponent: () => import('./management/insurance/reimbursements/reimbursements').then((m) => m.Reimbursements)},
            { path: 'reimbursement-detail', loadComponent: () => import('./management/insurance/reimbursement-detail/reimbursement-detail').then((m) => m.ReimbursementDetail)},

            // Management - HR & Staff
            { path: 'hr', loadComponent: () => import('./management/hr-staff/hr/hr').then((m) => m.Hr)},
            { path: 'employee-profile', loadComponent: () => import('./management/hr-staff/employee-profile/employee-profile').then((m) => m.EmployeeProfile)},
            { path: 'attendance', loadComponent: () => import('./management/hr-staff/attendance/attendance').then((m) => m.Attendance)},
            { path: 'leave-management', loadComponent: () => import('./management/hr-staff/leave-management/leave-management').then((m) => m.LeaveManagement)},
            { path: 'payroll', loadComponent: () => import('./management/hr-staff/payroll/payroll').then((m) => m.Payroll)},
            { path: 'hr-departments', loadComponent: () => import('./management/hr-staff/hr-departments/hr-departments').then((m) => m.HrDepartments)},
            { path: 'designations', loadComponent: () => import('./management/hr-staff/designations/designations').then((m) => m.Designations)},
            { path: 'shifts', loadComponent: () => import('./management/hr-staff/shifts/shifts').then((m) => m.Shifts)},
            { path: 'recruitment', loadComponent: () => import('./management/hr-staff/recruitment/recruitment').then((m) => m.Recruitment)},
            { path: 'performance', loadComponent: () => import('./management/hr-staff/performance/performance').then((m) => m.Performance)},

            // Management - Inventory
            { path: 'inventory', loadComponent: () => import('./management/inventory/inventory/inventory').then((m) => m.Inventory)},
            { path: 'products', loadComponent: () => import('./management/inventory/products/products').then((m) => m.Products)},
            { path: 'product-detail', loadComponent: () => import('./management/inventory/product-detail/product-detail').then((m) => m.ProductDetail)},
            { path: 'inventory-categories', loadComponent: () => import('./management/inventory/inventory-categories/inventory-categories').then((m) => m.InventoryCategories)},
            { path: 'inventory-suppliers', loadComponent: () => import('./management/inventory/inventory-suppliers/inventory-suppliers').then((m) => m.InventorySuppliers)},
            { path: 'inventory-purchase-orders', loadComponent: () => import('./management/inventory/inventory-purchase-orders/inventory-purchase-orders').then((m) => m.InventoryPurchaseOrders)},
            { path: 'purchase-order-detail', loadComponent: () => import('./management/inventory/purchase-order-detail/purchase-order-detail').then((m) => m.PurchaseOrderDetail)},
            { path: 'stock-in', loadComponent: () => import('./management/inventory/stock-in/stock-in').then((m) => m.StockIn)},
            { path: 'stock-in-detail', loadComponent: () => import('./management/inventory/stock-in-detail/stock-in-detail').then((m) => m.StockInDetail)},
            { path: 'stock-out', loadComponent: () => import('./management/inventory/stock-out/stock-out').then((m) => m.StockOut)},
            { path: 'stock-out-detail', loadComponent: () => import('./management/inventory/stock-out-detail/stock-out-detail').then((m) => m.StockOutDetail)},
            { path: 'stock-transfers', loadComponent: () => import('./management/inventory/stock-transfers/stock-transfers').then((m) => m.StockTransfers)},
            { path: 'asset-tracking', loadComponent: () => import('./management/inventory/stock-tracking/stock-tracking').then((m) => m.StockTracking)},
            { path: 'asset-detail', loadComponent: () => import('./management/inventory/asset-detail/asset-detail').then((m) => m.AssetDetail)},
            { path: 'low-stock', loadComponent: () => import('./management/inventory/low-stock/low-stock').then((m) => m.LowStock)},

            // Management - Ambulance
            { path: 'ambulance', loadComponent: () => import('./management/ambulance/ambulance/ambulance').then((m) => m.Ambulance)},
            { path: 'ambulance-vehicles', loadComponent: () => import('./management/ambulance/ambulance-vehicles/ambulance-vehicles').then((m) => m.AmbulanceVehicles)},
            { path: 'ambulance-drivers', loadComponent: () => import('./management/ambulance/ambulance-drivers/ambulance-drivers').then((m) => m.AmbulanceDrivers)},
            { path: 'emergency-calls', loadComponent: () => import('./management/ambulance/ambulance-calls/ambulance-calls').then((m) => m.AmbulanceCalls)},
            { path: 'ambulance-trips', loadComponent: () => import('./management/ambulance/ambulance-trips/ambulance-trips').then((m) => m.AmbulanceTrips)},
            { path: 'ambulance-maintenance', loadComponent: () => import('./management/ambulance/ambulance-maintenance/ambulance-maintenance').then((m) => m.AmbulanceMaintenance)},

            // Management - Finance
            { path: 'income', loadComponent: () => import('./management/finance/income/income').then((m) => m.Income)},
            { path: 'expenses', loadComponent: () => import('./management/finance/expenses/expenses').then((m) => m.Expenses)},
            { path: 'transactions', loadComponent: () => import('./management/finance/transactions/transactions').then((m) => m.Transactions)},
            { path: 'accounts', loadComponent: () => import('./management/finance/accounts/accounts').then((m) => m.Accounts)},
            { path: 'bank-accounts', loadComponent: () => import('./management/finance/bank-accounts/bank-accounts').then((m) => m.BankAccounts)},
            { path: 'profit-loss', loadComponent: () => import('./management/finance/profit-loss/profit-loss').then((m) => m.ProfitLoss)},

            // Management - Administration
            { path: 'branches', loadComponent: () => import('./management/administration/branches/branches').then((m) => m.Branches)},
            { path: 'admin-departments', loadComponent: () => import('./management/administration/admin-departments/admin-departments').then((m) => m.AdminDepartments)},
            { path: 'notice-board', loadComponent: () => import('./management/administration/notice-board/notice-board').then((m) => m.NoticeBoard)},
            { path: 'announcements', loadComponent: () => import('./management/administration/announcements/announcements').then((m) => m.Announcements)},
            { path: 'visitors', loadComponent: () => import('./management/administration/visitors/visitors').then((m) => m.Visitors)},
            { path: 'complaints', loadComponent: () => import('./management/administration/complaints/complaints').then((m) => m.Complaints)},

            // Management - Assets
            { path: 'equipment', loadComponent: () => import('./management/assets/equipment/equipment').then((m) => m.Equipment)},
            { path: 'asset-maintenance', loadComponent: () => import('./management/assets/asset-maintenance/asset-maintenance').then((m) => m.AssetMaintenance)},
            { path: 'repairs', loadComponent: () => import('./management/assets/repairs/repairs').then((m) => m.Repairs)},
            { path: 'vendors', loadComponent: () => import('./management/assets/vendors/vendors').then((m) => m.Vendors)},
            { path: 'asset-categories', loadComponent: () => import('./management/assets/asset-categories/asset-categories').then((m) => m.AssetCategories)},

            // System - Reports
            { path: 'reports', loadComponent: () => import('./system/reports/reports/reports').then((m) => m.Reports)},
            { path: 'patient-reports', loadComponent: () => import('./system/reports/patient-reports/patient-reports').then((m) => m.PatientReports)},
            { path: 'appointment-reports', loadComponent: () => import('./system/reports/appointment-reports/appointment-reports').then((m) => m.AppointmentReports)},
            { path: 'revenue-reports', loadComponent: () => import('./system/reports/revenue-reports/revenue-reports').then((m) => m.RevenueReports)},
            { path: 'pharmacy-reports', loadComponent: () => import('./system/reports/pharmacy-reports/pharmacy-reports').then((m) => m.PharmacyReports)},
            { path: 'laboratory-reports', loadComponent: () => import('./system/reports/laboratory-reports/laboratory-reports').then((m) => m.LaboratoryReports)},
            { path: 'doctor-performance', loadComponent: () => import('./system/reports/doctor-performance/doctor-performance').then((m) => m.DoctorPerformance)},
            { path: 'bed-occupancy-report', loadComponent: () => import('./system/reports/bed-occupancy-report/bed-occupancy-report').then((m) => m.BedOccupancyReport)},
            { path: 'inventory-reports', loadComponent: () => import('./system/reports/inventory-reports/inventory-reports').then((m) => m.InventoryReports)},
            { path: 'hr-reports', loadComponent: () => import('./system/reports/hr-reports/hr-reports').then((m) => m.HrReports)},

            // System - misc
            { path: 'notifications', loadComponent: () => import('./system/notifications/notifications').then((m) => m.Notifications)},
            { path: 'activity-logs', loadComponent: () => import('./system/activity-logs/activity-logs').then((m) => m.ActivityLogs)},
            { path: 'audit-logs', loadComponent: () => import('./system/audit-logs/audit-logs').then((m) => m.AuditLogs)},
            { path: 'users', loadComponent: () => import('./system/users/users').then((m) => m.Users)},
            { path: 'roles', loadComponent: () => import('./system/roles/roles').then((m) => m.Roles)},
            { path: 'permissions', loadComponent: () => import('./system/permissions/permissions').then((m) => m.Permissions)},
            { path: 'backup-restore', loadComponent: () => import('./system/backup-restore/backup-restore').then((m) => m.BackupRestore)},
            { path: 'email-templates', loadComponent: () => import('./system/email-templates/email-templates').then((m) => m.EmailTemplates)},
            { path: 'sms-templates', loadComponent: () => import('./system/sms-templates/sms-templates').then((m) => m.SmsTemplates)},
            { path: 'settings', loadComponent: () => import('./system/settings/settings').then((m) => m.Settings)},

            // General Pages
            { path: 'profile', loadComponent: () => import('./general-pages/profile/profile').then((m) => m.Profile)},
            { path: 'my-account', loadComponent: () => import('./general-pages/my-account/my-account').then((m) => m.MyAccount)},
            { path: 'activity', loadComponent: () => import('./general-pages/activity/activity').then((m) => m.Activity)},
            { path: 'gallery', loadComponent: () => import('./general-pages/gallery/gallery').then((m) => m.Gallery)},
            { path: 'help-center', loadComponent: () => import('./general-pages/help-center/help-center').then((m) => m.HelpCenter)},
            { path: 'knowledge-base', loadComponent: () => import('./general-pages/knowledge-base/knowledge-base').then((m) => m.KnowledgeBase)},
            { path: 'support-tickets', loadComponent: () => import('./general-pages/support-tickets/support-tickets').then((m) => m.SupportTickets)},
            { path: 'contact-us', loadComponent: () => import('./general-pages/contact-us/contact-us').then((m) => m.ContactUs)},
            { path: 'search-results', loadComponent: () => import('./general-pages/search-results/search-results').then((m) => m.SearchResults)},
            { path: 'pricing', loadComponent: () => import('./general-pages/pricing/pricing').then((m) => m.Pricing)},
            { path: 'faq', loadComponent: () => import('./general-pages/faq/faq').then((m) => m.Faq)},
            { path: 'privacy-policy', loadComponent: () => import('./general-pages/privacy-policy/privacy-policy').then((m) => m.PrivacyPolicy)},
            { path: 'terms-conditions', loadComponent: () => import('./general-pages/terms-conditions/terms-conditions').then((m) => m.TermsConditions)},
            { path: 'starter-page', loadComponent: () => import('./general-pages/starter-page/starter-page').then((m) => m.StarterPage)},

            // Applications
            { path: 'chat', loadComponent: () => import('./main-menu/applications/chat/chat').then((m) => m.Chat)},
            { path: 'voice-call', loadComponent: () => import('./main-menu/applications/calls/voice-call/voice-call').then((m) => m.VoiceCall)},
            { path: 'video-call', loadComponent: () => import('./main-menu/applications/calls/video-call/video-call').then((m) => m.VideoCall)},
            { path: 'calendar', loadComponent: () => import('./main-menu/applications/calendar-page/calendar-page').then((m) => m.CalendarPage)},
            { path: 'email', loadComponent: () => import('./main-menu/applications/email/email').then((m) => m.Email)},
            { path: 'email-compose', loadComponent: () => import('./main-menu/applications/email-compose/email-compose').then((m) => m.EmailCompose)},
            { path: 'file-manager', loadComponent: () => import('./main-menu/applications/file-manager/file-manager').then((m) => m.FileManager)},
            { path: 'notes', loadComponent: () => import('./main-menu/applications/notes/notes').then((m) => m.Notes)},
            { path: 'todo', loadComponent: () => import('./main-menu/applications/todo/todo').then((m) => m.Todo)},
            { path: 'workflow-approvals', loadComponent: () => import('./main-menu/applications/workflow/workflow-approvals/workflow-approvals').then((m) => m.WorkflowApprovals)},
            { path: 'workflow-approval-levels', loadComponent: () => import('./main-menu/applications/workflow/workflow-approval-levels/workflow-approval-levels').then((m) => m.WorkflowApprovalLevels)},
            { path: 'workflow-requests', loadComponent: () => import('./main-menu/applications/workflow/workflow-requests/workflow-requests').then((m) => m.WorkflowRequests)},
            { path: 'workflow-actions', loadComponent: () => import('./main-menu/applications/workflow/workflow-actions/workflow-actions').then((m) => m.WorkflowActions)},

             // Base UI
            { path: 'base-ui', loadComponent: () => import('./ui-interface/base-ui/base-ui').then((m) => m.BaseUi),
                children: [
                    { path: 'accordion', loadComponent: () => import('./ui-interface/base-ui/ui-accordion/ui-accordion').then((m) => m.UiAccordion)},
                    { path: 'alerts', loadComponent: () => import('./ui-interface/base-ui/ui-alerts/ui-alerts').then((m) => m.UiAlerts)},
                    { path: 'avatar', loadComponent: () => import('./ui-interface/base-ui/ui-avatar/ui-avatar').then((m) => m.UiAvatar)},
                    { path: 'badges', loadComponent: () => import('./ui-interface/base-ui/ui-badges/ui-badges').then((m) => m.UiBadges)},
                    { path: 'breadcrumb', loadComponent: () => import('./ui-interface/base-ui/ui-breadcrumb/ui-breadcrumb').then((m) => m.UiBreadcrumb)},
                    { path: 'buttons', loadComponent: () => import('./ui-interface/base-ui/ui-buttons/ui-buttons').then((m) => m.UiButtons)},
                    { path: 'buttons-group', loadComponent: () => import('./ui-interface/base-ui/ui-buttons-group/ui-buttons-group').then((m) => m.UiButtonsGroup)},
                    { path: 'cards', loadComponent: () => import('./ui-interface/base-ui/ui-cards/ui-cards').then((m) => m.UiCards)},
                    { path: 'collapse', loadComponent: () => import('./ui-interface/base-ui/ui-collapse/ui-collapse').then((m) => m.UiCollapse)},
                    { path: 'colors', loadComponent: () => import('./ui-interface/base-ui/ui-colors/ui-colors').then((m) => m.UiColors)},
                    { path: 'dropdowns', loadComponent: () => import('./ui-interface/base-ui/ui-dropdowns/ui-dropdowns').then((m) => m.UiDropdowns)},
                    { path: 'grid', loadComponent: () => import('./ui-interface/base-ui/ui-grid/ui-grid').then((m) => m.UiGrid)},
                    { path: 'images', loadComponent: () => import('./ui-interface/base-ui/ui-images/ui-images').then((m) => m.UiImages)},
                    { path: 'modals', loadComponent: () => import('./ui-interface/base-ui/ui-modals/ui-modals').then((m) => m.UiModals)},
                    { path: 'nav-tabs', loadComponent: () => import('./ui-interface/base-ui/ui-nav-tabs/ui-nav-tabs').then((m) => m.UiNavTabs)},
                    { path: 'offcanvas', loadComponent: () => import('./ui-interface/base-ui/ui-offcanvas/ui-offcanvas').then((m) => m.UiOffcanvas)},
                    { path: 'pagination', loadComponent: () => import('./ui-interface/base-ui/ui-pagination/ui-pagination').then((m) => m.UiPagination)},
                    { path: 'popovers', loadComponent: () => import('./ui-interface/base-ui/ui-popovers/ui-popovers').then((m) => m.UiPopovers)},
                    { path: 'progress', loadComponent: () => import('./ui-interface/base-ui/ui-progress/ui-progress').then((m) => m.UiProgress)},
                    { path: 'toasts', loadComponent: () => import('./ui-interface/base-ui/ui-toasts/ui-toasts').then((m) => m.UiToasts)},
                    { path: 'typography', loadComponent: () => import('./ui-interface/base-ui/ui-typography/ui-typography').then((m) => m.UiTypography)}
                ]
            },
            { path: 'advanced-ui', loadComponent: () => import('./ui-interface/advanced-ui/advanced-ui').then((m) => m.AdvancedUi),
                children: [
                    { path: 'drag-drop', loadComponent: () => import('./ui-interface/advanced-ui/drag-drop/drag-drop').then((m) => m.DragDrop)},
                    { path: 'clipboard', loadComponent: () => import('./ui-interface/advanced-ui/clipboard/clipboard').then((m) => m.Clipboard)},
                    { path: 'range-slider', loadComponent: () => import('./ui-interface/advanced-ui/range-slider/range-slider').then((m) => m.RangeSlider)},
                    { path: 'lightbox', loadComponent: () => import('./ui-interface/advanced-ui/ui-lightbox/ui-lightbox').then((m) => m.UiLightbox)},
                ]
            },
            { path: 'forms', loadComponent: () => import('./ui-interface/forms/forms').then((m) => m.Forms),
                children: [
                    { path: 'form-element', loadComponent: () => import('./ui-interface/forms/form-elements/form-elements').then((m) => m.FormElements)},
                    { path: 'select', loadComponent: () => import('./ui-interface/forms/select/select').then((m) => m.Select)},
                    { path: 'form-picker', loadComponent: () => import('./ui-interface/forms/form-picker/form-picker').then((m) => m.FormPicker)},
                    { path: 'form-editor', loadComponent: () => import('./ui-interface/forms/form-editor/form-editor').then((m) => m.FormEditor)},
                ]
            },
            { path: 'charts', loadComponent: () => import('./ui-interface/charts/charts').then((m) => m.Charts),
                children: [
                    { path: 'apexchart', loadComponent: () => import('./ui-interface/charts/apexchart/apexchart').then((m) => m.Apexchart)},
                    { path: 'chartjs', loadComponent: () => import('./ui-interface/charts/chartjs/chartjs').then((m) => m.Chartjs)},
                ]
            },
            { path: 'tables', loadComponent: () => import('./ui-interface/tables/tables').then((m) => m.Tables),
                children: [
                    { path: 'basic-tables', loadComponent: () => import('./ui-interface/tables/basic-tables/basic-tables').then((m) => m.BasicTables)},
                    { path: 'data-tables', loadComponent: () => import('./ui-interface/tables/data-tables/data-tables').then((m) => m.DataTables)},
                ]
            },
            { path: 'icons', loadComponent: () => import('./ui-interface/icons/icons').then((m) => m.Icons),
                children: [
                    { path: 'fontawesome', loadComponent: () => import('./ui-interface/icons/fontawesome/fontawesome').then((m) => m.Fontawesome)},
                    { path: 'tabler', loadComponent: () => import('./ui-interface/icons/tabler/tabler').then((m) => m.Tabler)},
                    { path: 'lucide', loadComponent: () => import('./ui-interface/icons/lucide/lucide').then((m) => m.Lucide)},
                    { path: 'phosphor', loadComponent: () => import('./ui-interface/icons/phosphor/phosphor').then((m) => m.Phosphor)},
                ]
            },
         ]
        }
    ]