import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PaginationService } from '../custom-pagination/pagination.service';

@Component({
  selector: 'app-common-search',
  standalone: true,
  imports: [],
  templateUrl: './common-search.html',
  styleUrls: ['./common-search.css'],
})
export class CommonSearch  {

  @Input() totalData!: number;
  @Input() pageSize!: number;
  @Input() tableDataCopy!: any[];
  @Input() serialNumberArray!: number[];

  @Output() dataChange = new EventEmitter<{
    tableData: any[];
    serialNumberArray: number[];
    totalData: number;
  }>();

  searchData(value: string): void {
    const search = value.trim().toLowerCase();

    let filteredData = this.tableDataCopy;

    if (search) {
      filteredData = this.tableDataCopy.filter(row =>
        Object.values(row).some(v =>
          String(v).toLowerCase().includes(search)
        )
      );
    }

    this.dataChange.emit({
      tableData: filteredData,
      serialNumberArray: filteredData.map((_, i) => i + 1),
      totalData: filteredData.length,
    });
  }
}