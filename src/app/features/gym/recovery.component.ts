import { Component, inject, signal } from '@angular/core';
import { MembershipPlanApi } from '@/core/services/api/membership-plan.api';
import { SubscriptionApi } from '@/core/services/api/subscription.api';
import { MemberApi } from '@/core/services/api/member.api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-recovery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 max-w-3xl mx-auto bg-white shadow rounded-lg mt-10">
      <h1 class="text-2xl font-bold mb-4 text-slate-800">Advanced Diagnostic Tool</h1>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="space-y-2">
            <h3 class="font-bold">Plans Diagnostics</h3>
            <button (click)="scanRange(1, 100)" class="w-full bg-indigo-600 text-white px-4 py-2 rounded">Scan Range 1-100</button>
            <button (click)="testList()" class="w-full bg-emerald-600 text-white px-4 py-2 rounded">Test Plans List</button>
        </div>
        <div class="space-y-2">
            <h3 class="font-bold">Subscriptions Diagnostics</h3>
            <button (click)="testRealSubscription()" class="w-full bg-orange-600 text-white px-4 py-2 rounded">Test Create (partner_id)</button>
            <button (click)="testMemberIdSubscription()" class="w-full bg-red-600 text-white px-4 py-2 rounded">Test Create (member_id)</button>
            <button (click)="inspectData()" class="w-full bg-slate-600 text-white px-4 py-2 rounded">Inspect First Plan/Member</button>
        </div>
      </div>

      <div class="mb-6 p-4 border rounded bg-slate-50">
        <h2 class="font-semibold mb-2">Manual Action (Force Delete Plan)</h2>
        <div class="flex gap-2">
          <input [(ngModel)]="targetId" type="number" placeholder="ID" class="border p-2 rounded w-24">
          <button (click)="deleteId(targetId)" class="bg-red-600 text-white px-4 py-2 rounded">Delete Plan</button>
        </div>
      </div>

      <div class="mt-4 space-y-2 h-[400px] overflow-auto border-t pt-4">
        <div *ngFor="let log of logs()"
             [class.text-red-600]="log.type === 'error'"
             [class.text-green-600]="log.type === 'success'"
             [class.text-slate-500]="log.type === 'info'"
             class="text-xs font-mono border-b pb-1">
          <span class="font-bold">[{{log.time}}]</span> {{ log.msg }}
        </div>
        <div *ngIf="logs().length === 0" class="text-slate-400 italic">No logs yet.</div>
      </div>
    </div>
  `
})
export class RecoveryComponent {
  private planApi = inject(MembershipPlanApi);
  private subscriptionApi = inject(SubscriptionApi);
  private memberApi = inject(MemberApi);

  logs = signal<{ msg: string, type: 'info' | 'error' | 'success', time: string }[]>([]);
  targetId: number = 0;

  private addLog(msg: string, type: 'info' | 'error' | 'success' = 'info') {
    this.logs.update(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev]);
  }

  inspectData() {
    this.addLog('Fetching first member and plan for inspection...', 'info');
    forkJoin({
      plans: this.planApi.getPlans({ per_page: 1 }),
      members: this.memberApi.getMembers({ per_page: 1 })
    }).subscribe({
      next: (res) => {
        const plan = res.plans.data?.[0];
        const member = res.members.data?.[0];
        this.addLog(`PLAN #1: ID=${plan?.id}, Name=${plan?.name}`, 'success');
        this.addLog(`MEMBER #1: ID=${member?.id}, Name=${member?.name}`, 'success');
      },
      error: (err) => this.addLog(`Inspection FAILED: ${err.status}`, 'error')
    });
  }

  testRealSubscription() {
    this.addLog('Fetching valid IDs for subscription test...', 'info');
    forkJoin({
      plans: this.planApi.getPlans({ per_page: 1 }),
      members: this.memberApi.getMembers({ per_page: 1 })
    }).subscribe({
      next: (res) => {
        const planId = res.plans.data?.[0]?.id;
        const memberId = res.members.data?.[0]?.id;

        if (!planId || !memberId) {
          this.addLog('Could not find valid plan or member to test.', 'error');
          return;
        }

        const data = {
          partner_id: parseInt(memberId.toString(), 10),
          membership_plan_id: parseInt(planId.toString(), 10),
          company_id: 1,
          start_date: new Date().toISOString().split('T')[0],
          amount_paid: 50.0,
          payment_method: 'cash'
        };

        this.addLog(`Creating sub with Plan=${planId}, Member=${memberId}...`, 'info');
        this.subscriptionApi.createSubscription(data).subscribe({
          next: (s) => this.addLog(`SUCCESS: Created Sub ID ${s.data?.id}`, 'success'),
          error: (err) => {
            const msg = err.error?.message || err.message;
            this.addLog(`FAILED: ${err.status} - ${msg}`, 'error');
            if (err.error?.exception) {
              this.addLog(`Exception: ${err.error.exception}`, 'error');
              this.addLog(`File: ${err.error.file}:${err.error.line}`, 'error');
            }
          }
        });
      }
    });
  }

  testMemberIdSubscription() {
    this.addLog('Testing with member_id instead of partner_id...', 'info');
    forkJoin({
      plans: this.planApi.getPlans({ per_page: 1 }),
      members: this.memberApi.getMembers({ per_page: 1 })
    }).subscribe({
      next: (res) => {
        const planId = res.plans.data?.[0]?.id;
        const memberId = res.members.data?.[0]?.id;

        const data = {
          member_id: parseInt(memberId.toString(), 10), // TEST: member_id
          membership_plan_id: parseInt(planId.toString(), 10),
          company_id: 1,
          start_date: new Date().toISOString().split('T')[0],
          amount_paid: 1.0,
          payment_method: 'cash'
        };

        this.subscriptionApi.createSubscription(data).subscribe({
          next: (s) => this.addLog(`SUCCESS with member_id!`, 'success'),
          error: (err) => {
            const msg = err.error?.message || err.message;
            this.addLog(`FAILED with member_id: ${err.status} - ${msg}`, 'error');
          }
        });
      }
    });
  }

  testList() {
    this.planApi.getPlans({ per_page: 5 }).subscribe({
      next: (res) => this.addLog(`Plans List SUCCESS: Found ${res.data?.length}`, 'success'),
      error: (err) => this.addLog(`Plans List FAILED: ${err.status}`, 'error')
    });
  }

  scanRange(start: number, end: number) {
    this.addLog(`Scanning IDs ${start}-${end}...`, 'info');
    for (let i = start; i <= end; i++) {
      this.planApi.getPlan(i).subscribe({
        error: (err) => {
          if (err.status === 500) {
            this.addLog(`ID ${i}: CORRUPTED (500) - Deleting...`, 'error');
            this.deleteId(i);
          }
        }
      });
    }
  }

  deleteId(id: number) {
    if (!id) return;
    this.planApi.deletePlan(id).subscribe({
      next: () => this.addLog(`ID ${id}: Deleted`, 'success'),
      error: (err) => this.addLog(`ID ${id}: Delete FAILED`, 'error')
    });
  }
}
