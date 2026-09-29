import { ChangeDetectorRef, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { HSOverlay } from 'preline';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { DatePickerModule } from 'primeng/datepicker';
import {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  Calendar,
} from '@fullcalendar/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { calendarCategories, projectAssignees } from '../../../../../core/json/selectData';
import { Datepicker } from '../../../../../shared/datepicker/datepicker';
import { All_Routes } from '../../../../../core/helpers/routes';
declare var Modal: any;
@Component({
  selector: 'app-calendar-page',
  imports: [CommonModule,FormsModule,FormsModule,RouterLink],
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.css',
})
export class CalendarPage {
  AllRoutes = All_Routes;
  @ViewChild('eventModal') eventModal!: ElementRef;
  showEventDetailsModal = false;
  modalInstance!: typeof Modal;
  eventDetails: any = {};
  date: Date[] | undefined;
  dropdownOpen = false;
  selectedTime: Date = new Date();
  addtime2: Date | undefined;
  addtime: Date | undefined;
  time: Date[] | undefined; 
  time2: Date[] | undefined; 
  bsInlineValue = new Date()
constructor(private router:Router,private ngZone: NgZone,private cdr: ChangeDetectorRef){}
  ngOnInit(): void {}
    // Open the dropdown
    openDropdown() {
      this.dropdownOpen = true;
    }

    // Close the dropdown
    closeDropdown() {
      this.dropdownOpen = false;
    }

    // Update displayed time when selection changes
    onTimeChange() {
      this.closeDropdown(); // Close dropdown after time selection
    }
  private addDays(offset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  }

  ngAfterViewInit(): void {
    // Initialize FullCalendar
    const calendarEl = document.getElementById('calendar');
    const addDays = this.addDays.bind(this);
    const uniqueEvents = [
      {
        title: 'Team Hall YT',
        start: addDays(0), // Today
        backgroundColor: '#EEF2FF',
        borderColor: '#6366F1',
        textColor: '#4338CA'
      },
      {
        title: 'Training Workshop',
        start: `${addDays(1)}`, // Tomorrow
        end: `${addDays(1)}`,
        backgroundColor: '#FCE7F3',
        borderColor: '#EC4899',
        textColor: '#BE185D'
      },
      {
        title: 'Wellness Session',
        start: addDays(2), // +2 days
        backgroundColor: '#ECFEFF',
        borderColor: '#06B6D4',
        textColor: '#0E7490'
      },
      {
        title: 'Team Activity',
        start: addDays(3), // +3 days
        backgroundColor: '#FFF7ED',
        borderColor: '#F97316',
        textColor: '#9A3412'
      },
      {
        title: 'Weekly Sync',
        start: addDays(4),
        allDay: true,
        backgroundColor: '#F0FDF4',
        borderColor: '#22C55E',
        textColor: '#15803D'
      },
      {
        title: 'Project Demo',
        start: addDays(5),
        allDay: true,
        backgroundColor: '#FAF5FF',
        borderColor: '#A855F7',
        textColor: '#7E22CE'
      },
    ];
    const calendar = new Calendar(calendarEl!, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      editable: true,
      droppable: true, // Enable drag and drop
      events: uniqueEvents,
 customButtons: {
  fcToday: {
    text: 'Today',
    click: () => {
      calendar.today(); // use calendar instance directly
    }
  },
  addEvent: {
    text: '+ New Event',
    click: () => {
      this.addEventClick(); // make sure this is arrow-safe
    }
  }
},
      headerToolbar: {
        left: 'prev,title,next',
        end: 'fcToday addEvent',
        center: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      eventClick: (info) => this.handleEventClick(info),
      drop: (info) => {
        console.log('Event dropped:', info.draggedEl.innerText.trim());
      },
      eventReceive: (info) => {
        console.log('Event added:', info.event.title);
      },
    });

    calendar.render();
    const containerEl = document.getElementById('external-events');
    if (containerEl) {
      new Draggable(containerEl, {
        itemSelector: '.fc-event',
        eventData: (eventEl) => {
          const data = eventEl.getAttribute('data-event');
          const cls = eventEl.getAttribute('data-event-classname');
          return {
            ...JSON.parse(data ?? '{}'),
            className: cls ? [cls] : [],
          };
        },
      });
    }

  }
closeEventModal() {
  this.showEventDetailsModal = false;
}
addEventClick() {
  HSOverlay.open('#add-event');
}

private removeEventPopup() {
  document.querySelectorAll('.fc-event-popup').forEach((popup) => popup.remove());
}

handleEventClick(info: any) {
  info.jsEvent.preventDefault();
  this.removeEventPopup();

  const ev = info.event;
  const popup = document.createElement('div');
  popup.className = 'fc-event-popup fixed z-[9999] top-0 left-0 size-full overflow-x-hidden overflow-y-auto flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm flex-wrap';

  popup.innerHTML = `
    <div class="max-w-[400px] min-w-[300px] w-full p-6 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl">
      <div class="flex justify-between items-center mb-5 pb-5 border-b border-[var(--border)]">
        <h4>Event Details</h4>
        <button type="button" class="popup-close size-7 inline-flex justify-center items-center rounded-full border border-[var(--border)] bg-[var(--card)] text-gray-900 text-base hover:bg-danger hover:border-danger hover:text-white dark:hover:text-dark focus:outline-hidden focus:bg-danger cursor-pointer">
          <i class="icon-x"></i>
        </button>
      </div>
      <div class="mb-5 pb-5 border-b border-[var(--border)]">
        <p class="font-semibold text-dark mb-2">${ev.title}</p>
        <p class="mb-4 text-sm text-gray-600">An in company training workshop focused on enhancing employee skills through practical, hands on learning.</p>
        <p class="flex items-center gap-2 mb-3 text-sm">
          <i class="icon-calendar text-dark"></i>
          <span>${ev.start.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </p>
        <p class="flex items-center gap-2 mb-3 text-sm">
          <i class="icon-clock text-dark"></i>
          ${ev.allDay ? 'All Day' : ev.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p class="flex items-center gap-2 text-sm">
          <i class="icon-map-pin text-dark"></i>
          Room 2A
        </p>
      </div>
      <div class="flex justify-between items-center">
        <div class="avatar-list-stacked">
          <img src="assets/img/avatar/avatar-27.jpg" alt="JS" class="w-6 h-6 inline-flex items-center justify-center hover:-translate-y-[0.188rem] hover:z-1 transition-transform duration-150 ease-in-out -me-3.5 rounded-full border border-[var(--border)]">
          <img src="assets/img/avatar/avatar-28.jpg" alt="AR" class="w-6 h-6 inline-flex items-center justify-center hover:-translate-y-[0.188rem] hover:z-1 transition-transform duration-150 ease-in-out -me-3.5 rounded-full border border-[var(--border)]">
          <img src="assets/img/avatar/avatar-29.jpg" alt="KM" class="w-6 h-6 inline-flex items-center justify-center hover:-translate-y-[0.188rem] hover:z-1 transition-transform duration-150 ease-in-out -me-3.5 rounded-full border border-[var(--border)]">
          <span class="w-6 h-6 inline-flex items-center justify-center hover:-translate-y-[0.188rem] text-[12px] bg-light text-dark -me-3.5 rounded-full border border-[var(--border)]"> 1+ </span>
        </div>
        <div class="flex items-center gap-2">
          <button data-hs-overlay="#edit-event" class="size-7 text-sm flex items-center cursor-pointer justify-center bg-[var(--card)] border border-[var(--border)] text-dark hover:text-primary rounded-full">
            <i class="icon-pencil-line"></i>
          </button>
          <a href="#" class="size-7 text-sm flex items-center justify-center bg-[var(--card)] border border-[var(--border)] text-dark hover:text-danger rounded-full">
            <i class="icon-trash-2"></i>
          </a>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  popup.querySelector('.popup-close')!.addEventListener('click', () => this.removeEventPopup());

  setTimeout(() => {
    window.addEventListener('click', function closeOut(e) {
      if (!popup.contains(e.target as Node)) {
        popup.remove();
        window.removeEventListener('click', closeOut);
      }
    }, { capture: true });
  }, 10);
}

  current:number=1
  next(): void {
    if(this.current<6){
    this.current+=1;
    }
  }
  previous():void{
    if(this.current>1){
      this.current-=1
    }
  }
  directPage():void{
    // this.router.navigate/ ([routes.]) 
  }
  handleEventDrop(info: any) {
    console.log('Event moved:', info.event.title, '→', info.event.start);
    // TODO: update backend with new date
  }

  handleExternalDrop(info: any) {
    console.log('External event dropped on:', info.dateStr);
    // TODO: save new event to backend
  }
 // select
categories = calendarCategories;
selectedCategory: string | null = null;
projectAssignees = projectAssignees;
selectedprojectAssignees: string | null = null;
}
