import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Priority {
  rank: number;
  wait: number;
}

interface Bed {
  id: string;
  ward: string;
  bay: string;
  sex: string;
  features: string[];
}

interface WaitingPatient {
  id: string;
  name: string;
  ward: string;
  priority: string;
  waited: number;
  sex: string;
  needs: string[];
}

/**
 * Ported from tailwind/src/assets/js/script.js — "BED-ALLOCATION".
 * The hero flag/summary, KPI row, ward capacity gauges and "Today's
 * Allocations" table all ship as static markup. The source's matching
 * engine (WAITING/BEDS pools, matchScore, Auto-Allocate + the
 * alloc-modal/add-modal Preline dialogs it drives) has no corresponding
 * modal markup in this page's ported HTML, so this keeps the same
 * in-memory matching pools and reports the best-fit result via a toast
 * instead of opening a form; adding to the waiting list is confirmed the
 * same way.
 */
@Component({
  imports: [],
  selector: 'app-bed-allocation',
  styleUrl: './bed-allocation.css',
  templateUrl: './bed-allocation.html',
})
export class BedAllocation implements AfterViewInit {
  private readonly PRIORITY: Record<string, Priority> = {
    Emergency: { rank: 0, wait: 15 },
    Urgent: { rank: 1, wait: 120 },
    Routine: { rank: 2, wait: 480 },
  };

  private readonly BEDS: Bed[] = [
    { id: 'MA-04', ward: 'Medical A', bay: 'Bay 2', sex: 'Male', features: ['oxygen', 'monitor'] },
    { id: 'MA-07', ward: 'Medical A', bay: 'Bay 3', sex: 'Any', features: ['bariatric', 'oxygen'] },
    { id: 'MA-09', ward: 'Medical A', bay: 'Side room', sex: 'Any', features: ['isolation', 'oxygen'] },
    { id: 'SB-05', ward: 'Surgical B', bay: 'Bay 1', sex: 'Any', features: ['oxygen', 'monitor'] },
    { id: 'SB-09', ward: 'Surgical B', bay: 'Bay 4', sex: 'Female', features: [] },
    { id: 'MT-02', ward: 'Maternity', bay: 'Delivery 2', sex: 'Female', features: ['oxygen', 'monitor'] },
    { id: 'MT-05', ward: 'Maternity', bay: 'Postnatal 5', sex: 'Female', features: [] },
    { id: 'PD-02', ward: 'Pediatrics', bay: 'Bay 1', sex: 'Any', features: ['oxygen'] },
    { id: 'PD-05', ward: 'Pediatrics', bay: 'Bay 3', sex: 'Any', features: ['oxygen', 'monitor'] },
    { id: 'CA-03', ward: 'Cardiology', bay: 'CCU 3', sex: 'Any', features: ['monitor', 'oxygen'] },
    { id: 'CA-06', ward: 'Cardiology', bay: 'Bay 2', sex: 'Male', features: ['monitor'] },
    { id: 'MA-11', ward: 'Medical A', bay: 'Side room', sex: 'Any', features: ['isolation', 'oxygen', 'monitor'] },
  ];

  private WAITING: WaitingPatient[] = [
    { id: 'W-01', name: 'Harold Nakamura', ward: 'Medical A', priority: 'Urgent', waited: 95, sex: 'Male', needs: ['oxygen', 'monitor'] },
    { id: 'W-02', name: 'Simone Ferraro', ward: 'Surgical B', priority: 'Emergency', waited: 22, sex: 'Female', needs: ['oxygen'] },
    { id: 'W-03', name: 'Marcus Okoro', ward: 'Cardiology', priority: 'Emergency', waited: 40, sex: 'Male', needs: ['monitor', 'oxygen'] },
    { id: 'W-04', name: 'Priscilla Vance', ward: 'Maternity', priority: 'Urgent', waited: 60, sex: 'Female', needs: ['monitor'] },
    { id: 'W-05', name: 'Julian Alvarez', ward: 'Pediatrics', priority: 'Urgent', waited: 75, sex: 'Male', needs: ['oxygen'] },
    { id: 'W-06', name: 'Deshawn Pritchard', ward: 'Medical A', priority: 'Emergency', waited: 30, sex: 'Male', needs: ['isolation', 'oxygen'] },
    { id: 'W-07', name: 'Ophelia Grant', ward: 'Medical A', priority: 'Routine', waited: 210, sex: 'Female', needs: [] },
    { id: 'W-08', name: 'Terrence Bloom', ward: 'Medical A', priority: 'Urgent', waited: 130, sex: 'Male', needs: ['bariatric'] },
  ];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.wireHero();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private toast(message: string, tone: 'success' | 'info' | 'error' = 'info'): void {
    this.toastService.show(message, tone);
  }

  /* ---------------- Matching engine ---------------- */

  private matchScore(patient: WaitingPatient, bed: Bed): number {
    let score = 0;
    const wardMatch = bed.ward === patient.ward;
    if (wardMatch) score += 30;

    if (patient.needs.length) {
      const per = 50 / patient.needs.length;
      patient.needs.forEach((n) => {
        if (bed.features.indexOf(n) !== -1) score += per;
      });
    } else {
      score += 50;
    }

    const sexOk = bed.sex === 'Any' || bed.sex === patient.sex;
    if (sexOk) score += 20;

    return Math.round(score);
  }

  private sortedWaiting(): WaitingPatient[] {
    return this.WAITING.slice().sort(
      (a, b) => this.PRIORITY[a.priority].rank - this.PRIORITY[b.priority].rank || b.waited - a.waited
    );
  }

  private bestCandidate(patient: WaitingPatient): { bed: Bed; score: number } | null {
    const ranked = this.BEDS.map((bed) => ({ bed, score: this.matchScore(patient, bed) })).sort((a, b) => b.score - a.score);
    return ranked[0] || null;
  }

  /* ---------------- Wiring ---------------- */

  private wireHero(): void {
    this.byId('btn-auto')?.addEventListener('click', () => {
      if (!this.WAITING.length) {
        this.toast('Waiting list is already clear.');
        return;
      }
      const p = this.sortedWaiting()[0];
      const best = this.bestCandidate(p);
      if (!best || best.score < 60) {
        this.toast(`No strong match for ${p.name} — review candidates manually.`, 'error');
        return;
      }
      this.WAITING = this.WAITING.filter((w) => w.id !== p.id);
      this.toast(`${p.name} allocated to ${best.bed.id} (${best.score}% fit).`, 'success');
    });

    this.byId('btn-add')?.addEventListener('click', () => {
      this.toast('Add to Waiting List form opened.');
    });
  }
}
