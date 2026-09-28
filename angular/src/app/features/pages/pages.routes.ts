
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
            { path: 'discharges', loadComponent: () => import('./main-menu/patients/discharges/discharges').then((m) => m.Discharges)},
            { path: 'opd-patients', loadComponent: () => import('./main-menu/patients/opd-patients/opd-patients').then((m) => m.OpdPatients)},
            { path: 'ipd-patients', loadComponent: () => import('./main-menu/patients/ipd-patients/ipd-patients').then((m) => m.IpdPatients)},
            { path: 'patient-visits', loadComponent: () => import('./main-menu/patients/patient-visits/patient-visits').then((m) => m.PatientVisits)},
            { path: 'patient-medical-history', loadComponent: () => import('./main-menu/patients/patient-medical-history/patient-medical-history').then((m) => m.PatientMedicalHistory)},
            { path: 'patient-documents', loadComponent: () => import('./main-menu/patients/patient-documents/patient-documents').then((m) => m.PatientDocuments)},
            { path: 'patient-insurance', loadComponent: () => import('./main-menu/patients/patient-insurance/patient-insurance').then((m) => m.PatientInsurance)},
            { path: 'patient-family-members', loadComponent: () => import('./main-menu/patients/patient-family-members/patient-family-members').then((m) => m.PatientFamilyMembers)},
            { path: 'patient-feedback', loadComponent: () => import('./main-menu/patients/patient-feedback/patient-feedback').then((m) => m.PatientFeedback)},

            // Doctors
            { path: 'doctors', loadComponent: () => import('./main-menu/doctors/doctors/doctors').then((m) => m.Doctors)},
            { path: 'add-doctor', loadComponent: () => import('./main-menu/doctors/add-doctor/add-doctor').then((m) => m.AddDoctor)},
            { path: 'doctor-profile', loadComponent: () => import('./main-menu/doctors/doctor-profile/doctor-profile').then((m) => m.DoctorProfile)},
            { path: 'specializations', loadComponent: () => import('./main-menu/doctors/specializations/specializations').then((m) => m.Specializations)},
            { path: 'doctor-schedule', loadComponent: () => import('./main-menu/doctors/doctor-schedule/doctor-schedule').then((m) => m.DoctorSchedule)},
            { path: 'doctor-availability', loadComponent: () => import('./main-menu/doctors/doctor-availability/doctor-availability').then((m) => m.DoctorAvailability)},
            { path: 'doctor-leave-requests', loadComponent: () => import('./main-menu/doctors/doctor-leave-requests/doctor-leave-requests').then((m) => m.DoctorLeaveRequests)},
            { path: 'consultation-fees', loadComponent: () => import('./main-menu/doctors/consultation-fees/consultation-fees').then((m) => m.ConsultationFees)},

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