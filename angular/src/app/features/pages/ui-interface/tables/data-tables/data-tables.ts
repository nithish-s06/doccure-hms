
import { Component, effect, signal, ViewChild, WritableSignal } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {pageSelection,PaginationService, tablePageSize} from '../../../../../shared/custom-pagination/pagination.service';
import { CustomPaginationComponent } from '../../../../../shared/custom-pagination/custom-pagination.component';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../../core/services/data/data.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { apiResultFormat, dataTables } from '../../../../../core/model/model';
import { combineLatest } from 'rxjs';
import { CommonSearch } from '../../../../../shared/common-search/common-search';

@Component({
  selector: 'app-data-tables',
  imports: [CustomPaginationComponent,MatSort,FormsModule,CommonSearch],
  templateUrl: './data-tables.html',
  styleUrl: './data-tables.css',
})
export class DataTables {
  AllRoutes = All_Routes;
  dates:string[]=[]
  // Signals for reactive state
   @ViewChild(MatSort) sort!: MatSort;
  tableData = signal<dataTables[]>([]);
  tableDataCopy = signal<dataTables[]>([]);
  allData: WritableSignal<dataTables[]> = signal([]);
  totalData = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);
  pageSelection = signal<pageSelection[]>([]);
  pageNumberArray = signal<number[]>([]);
  serialNumberArray = signal<number[]>([]);
  constructor(private data: DataService,private router:Router,private pagination: PaginationService) {
    // Effect to rebuild page selection when totalData or pageSize changes
    
    effect(() => {
      const total = this.totalData();
      const size = this.pageSize();
    });
  }

  // Fetch JSON and load first page
  loadTableData(): void {
     this.data.getDataTable().subscribe((res: apiResultFormat) => {
    // Add serial numbers
    const tableWithSNo = res.data.map((c:any, i:any) => ({ ...c, sNo: i + 1 }));
    this.tableData.set(tableWithSNo);  // <-- must use .set()
    
    // Update pagination
    this.totalData.set(res.totalData);

   
  });
  }
private getTableData(pageOption: pageSelection): void {
  this.data.getDataTable().subscribe((apiRes: apiResultFormat) => {

    const pagedTable: dataTables[] = [];
    const pagedCopy: dataTables[] = [];
    const serials: number[] = [];

    apiRes.data.forEach((res: dataTables, index: number) => {
      const serialNumber = index + 1;

      if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
        res.sNo = serialNumber;
        pagedTable.push(res);
        pagedCopy.push(res);
        serials.push(serialNumber);
      }
    });

    // ✅ Set signals instead of mutating arrays
    this.tableData.set(pagedTable);
    this.tableDataCopy.set(pagedCopy);
    this.serialNumberArray.set(serials);
    this.totalData.set(apiRes.totalData);

    // Update pagination
    this.pagination.calculatePageSize.next({
      totalData: this.totalData(),
      pageSize: this.pageSize(),
      tableData: this.tableData(),
      serialNumberArray: this.serialNumberArray(),
    });
  });
}
updateTable(event: {
  tableData: any[];
  serialNumberArray: number[];
  totalData: number;
}) {
  this.tableData.set(event.tableData);
  this.serialNumberArray.set(event.serialNumberArray);
  this.totalData.set(event.totalData);

  // Recalculate pagination
  this.pagination.calculatePageSize.next({
    totalData: event.totalData,
    pageSize: this.pageSize(),
    tableData: event.tableData,
    serialNumberArray: event.serialNumberArray,
  });
}
//Table Sorting
 sortData(sort: Sort ) {
  const data = [...this.tableData()]; // read the signal value

  if (!sort.active || sort.direction === '') {
    this.tableData.set(data); // ✅ update signal
  } else {
    const sorted = data.sort((a, b) => {
      const aValue = (a as any)[sort.active];
      const bValue = (b as any)[sort.active];
      return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
    });

    this.tableData.set(sorted); // ✅ update signal
  }
}
ngOnInit() {
  this.loadTableData();
    this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
    if (this.router.url === this.AllRoutes.uidataTables) {
      this.pageSize.set(res.pageSize);
      this.getTableData({ skip: res.skip, limit: res.limit });
    }
  });
}
selectedRowToDelete = signal<any | null>(null);

deleteData(row: any): void {
  this.selectedRowToDelete.set(row);
}

confirmDeleteData(): void {
  const row = this.selectedRowToDelete();
  if (!row) return;

  // 1️⃣ Remove from full data
  const updatedAll = this.tableDataCopy()
    .filter(item => item.id !== row.id);

  this.tableDataCopy.set(updatedAll);

  // 2️⃣ Update total count
  this.totalData.set(updatedAll.length);

  // 3️⃣ Fix current page if last row deleted
  const totalPages = Math.ceil(this.totalData() / this.pageSize());
  if (this.currentPage() > totalPages) {
    this.currentPage.set(totalPages || 1);
  }

  // 4️⃣ Recalculate page slice
  const start = (this.currentPage() - 1) * this.pageSize();
  const end = start + this.pageSize();

  const pageData = updatedAll.slice(start, end).map((item, index) => ({
    ...item,
    sNo: start + index + 1
  }));

  // 5️⃣ Update table
  this.tableData.set(pageData);

  // 6️⃣ Clear selected row
  this.selectedRowToDelete.set(null);
}
codesnippet=`&lt;table matSort (matSortChange)="sortData($event)" class="mat-sort datatable border border-border-color dataTable w-full"&gt;
    &lt;thead class="border border-border-color"&gt;
        &lt;tr&gt;
            &lt;th class="px-4 py-2 bg-[var(--card2)] text-dark text-start" mat-sort-header="Name"&gt;Name&lt;/th&gt;
            &lt;th class="px-4 py-2 bg-[var(--card2)] text-dark text-start" mat-sort-header="position"&gt;Position&lt;/th&gt;
            &lt;th class="px-4 py-2 bg-[var(--card2)] text-dark text-start" mat-sort-header="office"&gt;Office&lt;/th&gt;
            &lt;th class="px-4 py-2 bg-[var(--card2)] text-dark text-start" mat-sort-header="age"&gt;Age&lt;/th&gt;
            &lt;th class="px-4 py-2 bg-[var(--card2)] text-dark text-start" mat-sort-header="date"&gt;Start date&lt;/th&gt;
            &lt;th class="px-4 py-2 bg-[var(--card2)] text-dark text-start" mat-sort-header="salary"&gt;Salary&lt;/th&gt;
        &lt;/tr&gt;
    &lt;/thead&gt;
    &lt;tbody&gt;
        @for (data of tableData; track data) {
            &lt;tr class="border-b border-border-color"&gt;
                &lt;td class="px-4 py-3 text-start"&gt;{{ data.name }}&lt;/td&gt;
                &lt;td class="px-4 py-3 text-start"&gt;{{ data.position }}&lt;/td&gt;
                &lt;td class="px-4 py-3 text-start"&gt;{{ data.office }}&lt;/td&gt;
                &lt;td class="px-4 py-3 text-start"&gt;{{ data.age }}&lt;/td&gt;
                &lt;td class="px-4 py-3 text-start"&gt;{{ data.startDate }}&lt;/td&gt;
                &lt;td class="px-4 py-3 text-start"&gt;{{ data.salary }}&lt;/td&gt;
            &lt;/tr&gt;
        }
    &lt;/tbody&gt;
&lt;/table&gt;`
}
