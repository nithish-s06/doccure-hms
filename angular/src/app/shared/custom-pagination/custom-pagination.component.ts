import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { pageSelection, pageSize, pageSizeCal, PaginationService } from './pagination.service';
export interface PageChangeEvent {
  pageNumber: number;
  pageSize: number;
}
@Component({
  selector: 'app-custom-pagination',
  templateUrl: './custom-pagination.component.html',
  styleUrl: './custom-pagination.component.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class CustomPaginationComponent {

  /* ========= INPUTS ========= */
  @Input() totalItems = 0;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() initialPageSize = 10;
  @Input() initialPageIndex = 0;

  /* ========= OUTPUT ========= */
  @Output() pageChange = new EventEmitter<PageChangeEvent>();

  /* ========= SIGNAL STATE ========= */
  pageSize = signal(10);
  pages = signal<number[]>([]);
  tableData = signal<string[]>([]);
  allData = signal<string[]>([]);
  lastIndex = signal(0);
  totalData = signal(0);
  skip = signal(0);
  limit = signal(this.pageSize());   // pageSize must be a signal
  pageIndex = signal(0);
  serialNumberArray = signal<number[]>([]);
  currentPage = signal(1);
  pageNumberArray = signal<number[]>([]);
  pageSelection = signal<pageSelection[]>([]);
  totalPages = signal(0);

  constructor(private pagination: PaginationService) {

    const pagedData = this.allData();
    this.tableData.set(pagedData);
    this.pagination.calculatePageSize.subscribe((res: pageSizeCal) => {
      this.calculateTotalPages(
        res.totalData,
        res.pageSize,
        res.tableData,
        res.serialNumberArray
      );
      this.pageSize.set(res.pageSize);
    });
    this.pagination.changePagesize.subscribe((res: pageSize) => {
      this.changePageSize(res.pageSize);
    });
  }
  /* ========= SYNC INPUTS ========= */


  /* ========= LOGIC ========= */
  public calculateTotalPages(
    totalData: number,
    pageSize: number,
    tableData: Array<string>,
    serialNumberArray: Array<number>
  ): void {

    // ✅ update signals (never assign directly)
    this.tableData.set(tableData);
    this.serialNumberArray.set(serialNumberArray);
    this.totalData.set(totalData);

    // Calculate total pages
    const pages = Math.ceil(totalData / pageSize);
    this.totalPages.set(pages);

    // Build page numbers & selections
    const pageNums: number[] = [];
    const selections: pageSelection[] = [];

    for (let i = 1; i <= pages; i++) {
      const limit = pageSize * i;
      const skip = limit - pageSize;

      pageNums.push(i);
      selections.push({ skip, limit });
    }

    // ✅ set arrays in one go
    this.pageNumberArray.set(pageNums);
    this.pageSelection.set(selections);
  }


  public getMoreData(event: string): void {
    if (event === 'next') {
      const nextPage = this.currentPage() + 1;
      this.currentPage.set(nextPage);
      this.pageIndex.set(nextPage - 1);
      this.skip.set(this.pageSize() * (nextPage - 1));
      this.limit.set(this.pageSize() * nextPage);

    } else if (event === 'previous') {
      const prevPage = this.currentPage() - 1;
      this.currentPage.set(prevPage);
      this.pageIndex.set(prevPage - 1);
      this.skip.set(this.pageSize() * (prevPage - 1));
      this.limit.set(this.pageSize() * prevPage);
    }

    // Notify pagination service / table
    this.pagination.tablePageSize.next({
      skip: this.skip(),
      limit: this.limit(),
      pageSize: this.pageSize(),
    });
  }
  public moveToPage(pageNumber: number): void {
    if (pageNumber === this.currentPage()) {
      return;
    }

    // Update current page
    this.currentPage.set(pageNumber);

    // Update skip/limit from pageSelection
    const selection = this.pageSelection()[pageNumber - 1];
    if (!selection) return;

    this.skip.set(selection.skip);
    this.limit.set(selection.limit);

    // Update pageIndex
    if (pageNumber > this.currentPage()) {
      this.pageIndex.set(pageNumber - 1);
    } else if (pageNumber < this.currentPage()) {
      this.pageIndex.set(pageNumber + 1);
    }

    // Notify table/pagination service
    this.pagination.tablePageSize.next({
      skip: this.skip(),
      limit: this.limit(),
      pageSize: this.pageSize(),
    });
  }


  next(): void {
    if (this.pageIndex() < this.totalPages() - 1) {
      this.pageIndex.update(v => v + 1);
      this.emit();
    }
  }

  prev(): void {
    if (this.pageIndex() > 0) {
      this.pageIndex.update(v => v - 1);
      this.emit();
    }
  }

  public changePageSize(pageSize: number): void {

    // Reset pagination state
    this.pageSelection.set([]);
    this.pageNumberArray.set([]);

    this.pageSize.set(pageSize);
    this.limit.set(pageSize);
    this.skip.set(0);
    this.currentPage.set(1);
    this.pageIndex.set(0);

    // Recalculate pages
    this.calculateTotalPages(
      this.totalData(),
      pageSize,
      this.tableData(),
      this.serialNumberArray()
    );

    // Notify table to update
    this.pagination.tablePageSize.next({
      skip: 0,
      limit: pageSize,
      pageSize: pageSize,
    });
  }


  private emit(): void {
    this.pageChange.emit({
      pageNumber: this.pageIndex(),
      pageSize: this.pageSize(),
    });
  }
  get startEntry(): number {
    return this.skip() + 1;
  }

  get endEntry(): number {
    return Math.min(this.skip() + this.pageSize(), this.totalData());
  }

}
