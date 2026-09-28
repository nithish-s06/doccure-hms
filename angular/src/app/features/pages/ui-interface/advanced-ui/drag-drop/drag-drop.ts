import { Component } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-drag-drop',
  imports: [DragDropModule,CdkDrag,CommonModule,FormsModule],
  templateUrl: './drag-drop.html',
  styleUrl: './drag-drop.css',
})
export class DragDrop {
   cards = [
  { bg: 'bg-success', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.', footer: 'Someone famous in <cite title="Source Title">Source Title' },
  { bg: 'bg-primary', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.', footer: 'Someone famous in <cite title="Source Title">Source Title' },
  { bg: 'bg-warning', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.', footer: 'Someone famous in <cite title="Source Title">Source Title' },
  { bg: 'bg-danger', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.', footer: 'Someone famous in <cite title="Source Title">Source Title' },
  { bg: 'bg-info', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.', footer: 'Someone famous in <cite title="Source Title">Source Title' },
  { bg: 'bg-dark', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.', footer: 'Someone famous in <cite title="Source Title">Source Title' },
];
leftItems = [
  {
    name: 'Louis K. Bond',
    role: 'Founder & CEO',
    img: 'assets/img/avatar/avatar-01.jpg'
  },
  {
    name: 'Dennis N. Cloutier',
    role: 'Software Engineer',
    img: 'assets/img/avatar/avatar-02.jpg'
  },
  {
    name: 'Susan J. Sander',
    role: 'Web Designer',
    img: 'assets/img/avatar/avatar-03.jpg'
  }
];

rightItems = [
  {
    name: 'James M. Short',
    role: 'Web Developer',
    img: 'assets/img/avatar/avatar-04.jpg'
  },
  {
    name: 'Gabriel J. Snyder',
    role: 'Business Analyst',
    img: 'assets/img/avatar/avatar-05.jpg'
  },
  {
    name: 'Louie C. Mason',
    role: 'Human Resources',
    img: 'assets/img/avatar/avatar-06.jpg'
  }
];
leftStuffItems = [
  {
    name: 'Louis K. Bond',
    role: 'Founder & CEO',
    img: 'assets/img/avatar/avatar-01.jpg',
    desc: 'Disrupt pork belly poutine...'
  },
  {
    name: 'Dennis N. Cloutier',
    role: 'Software Engineer',
    img: 'assets/img/avatar/avatar-02.jpg',
    desc: 'Disrupt pork belly poutine...'
  },
  {
    name: 'Susan J. Sander',
    role: 'Web Designer',
    img: 'assets/img/avatar/avatar-03.jpg',
    desc: 'Disrupt pork belly poutine...'
  }
];

rightStuffItems = [
  {
    name: 'James M. Short',
    role: 'Web Developer',
    img: 'assets/img/avatar/avatar-04.jpg',
    desc: 'Disrupt pork belly poutine...'
  },
  {
    name: 'Gabriel J. Snyder',
    role: 'Business Analyst',
    img: 'assets/img/avatar/avatar-05.jpg',
    desc: 'Disrupt pork belly poutine...'
  },
  {
    name: 'Louie C. Mason',
    role: 'Human Resources',
    img: 'assets/img/avatar/avatar-06.jpg',
    desc: 'Disrupt pork belly poutine...'
  }
];


drop(event: CdkDragDrop<any[]>) {
  if (event.previousContainer === event.container) {
    // same list reorder
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  } else {
    // move between lists
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
}
codeSnippet = `<div class="preview-content grid grid-cols-1 xl:grid-cols-3 gap-6"
     cdkDropList
     [cdkDropListData]="cards"
     (cdkDropListDropped)="drop($event)">

    @for (card of cards; track card; let i = $index) {
    <div cdkDrag>

        <div class="p-5 rounded-lg text-white" [ngClass]="card.bg">
            <p class="mb-4">{{ card.text }}</p>
            <p [innerHTML]="card.footer"></p>
        </div>

    </div>
}
</div>`;
codeSnippet2=`<div class="preview-content grid grid-cols-1 xl:grid-cols-2 gap-6"
			data-plugin="dragula"
			data-containers='["company-list-left", "company-list-right"]'>
			<div class="col-span-1 p-5 bg-[var(--card2)] rounded-lg">
				<h2 class="text-lg font-bold c-text mb-0">Part 1</h2>
				<div class="flex flex-col gap-4 mt-8" id="company-list-left" cdkDropList
					#leftStuffList="cdkDropList"
					[cdkDropListData]="leftStuffItems"
					[cdkDropListConnectedTo]="[rightStuffList]"
					(cdkDropListDropped)="drop($event)">
					@for (item of leftStuffItems; track item) {
					<div cdkDrag>
						<div
							class="flex sm:flex-row flex-col items-start gap-3 p-4 border border-border-color rounded-lg bg-white">
							<img [src]="item.img"
								class="size-10 rounded-full border border-border-color"
								alt="user-image">
							<div>
								<h5 class="text-[16px] mb-1">{{ item.name }}</h2>
								<p class="text-xs mb-3">{{ item.role }}</p>
								<em class="text-xs">{{ item.desc }}</em>
							</div>
						</div>
					</div>
					}

				</div>
			</div>
			<div class="col-span-1 p-5 bg-[var(--card2)] rounded-lg">
				<h2 class="text-lg font-bold c-text mb-0">Part 2</h2>
				<div class="flex flex-col gap-4 mt-8" id="company-list-right" cdkDropList
					#rightStuffList="cdkDropList"
					[cdkDropListData]="rightStuffItems"
					[cdkDropListConnectedTo]="[leftStuffList]"
					(cdkDropListDropped)="drop($event)">
					@for (item of rightStuffItems; track item) {
					<div cdkDrag>
						<div
							class="flex sm:flex-row flex-col items-start gap-3 p-4 border border-border-color rounded-lg bg-white">
							<img [src]="item.img"
								class="size-10 rounded-full border border-borderColor">
							<div>
								<h5 class="text-[16px] mb-1">{{ item.name }}</h2>
								<p class="text-xs mb-3">{{ item.role }}</p>
								<em class="text-xs">{{ item.desc }}</em>
							</div>
						</div>
					</div>
					}

				</div>
			</div>
		</div>`;
}
