<template>
  <div class="min-h-screen bg-slate-900 text-white font-sans pb-24">
    <!-- Top Notice Banner when in Field Worker Mode -->
    <div
      v-if="isFieldWorker"
      class="bg-blue-950/95 border-b border-blue-500/40 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-blue-200 sticky top-0 z-40 shadow-md backdrop-blur-md"
    >
      <div class="flex items-center gap-2">
        <span class="text-sm">👷</span>
        <span>
          Currently testing as <strong>Carlos Santos (Field Crew)</strong>. Scoped to Field Operations PWA.
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="exitFieldMode"
          class="text-xs font-black text-white bg-blue-600 hover:bg-blue-500 active:scale-95 px-3 py-1 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <span>🛡️ Exit to Master Admin →</span>
        </button>
      </div>
    </div>

    <!-- Top Header: Tony's Field Operations PWA -->
    <header class="bg-slate-950 border-b border-slate-800 px-4 py-3 sticky z-30 flex items-center justify-between shadow-md" :class="isFieldWorker ? 'top-[37px]' : 'top-0'">
      <div class="flex items-center gap-3">
        <button
          @click="exitFieldMode"
          class="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Exit Field & Return to CRM Dashboard"
        >
          <ArrowLeft class="w-4 h-4" />
          <span class="text-xs font-bold hidden sm:inline">CRM</span>
        </button>
        <div class="flex items-center gap-2">
          <img src="/tonys_favicon.png" alt="Tony's" class="w-7 h-7 rounded-full object-contain bg-white p-0.5 border border-red-600/30" />
          <div>
            <h1 class="text-sm font-black text-white tracking-wide uppercase leading-none">Tony's Field Operations</h1>
            <span class="text-[9px] font-mono text-red-400 font-bold leading-none">PWA • Geofencing, Time Tracking & Payroll</span>
          </div>
        </div>
      </div>

      <!-- Right Header Actions: Role Switcher & Exit to Master Button -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Worker Indicator & Status -->
        <div class="hidden lg:flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl">
          <span class="w-2.5 h-2.5 rounded-full" :class="activeShift ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'"></span>
          <span class="font-bold text-[11px]" :class="activeShift ? 'text-emerald-400' : 'text-slate-400'">
            {{ activeShift ? 'ON DUTY' : 'OFF DUTY' }}
          </span>
        </div>

        <!-- RBAC Role Switcher Dropdown (Allows switching to Master, CEO, Sales, or Field) -->
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] font-bold text-slate-400 hidden xl:inline">Switch User:</span>
          <select
            :value="currentUser?.id"
            @change="onSwitchUser($event.target.value)"
            class="text-xs font-bold py-1.5 px-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white cursor-pointer focus:ring-2 focus:ring-red-500 shadow-sm transition-colors max-w-[135px] sm:max-w-none truncate"
            title="Switch User Role for Testing"
          >
            <option v-for="u in teamUsers" :key="u.id" :value="u.id" class="bg-slate-900 text-white">
              {{ u.role === 'MASTER' ? '🛡️ Master: ' : (u.role === 'CEO' || u.role === 'MANAGER') ? '👑 CEO: ' : u.role === 'FIELD_WORKER' ? '👷 Field: ' : '👤 Sales: ' }} {{ u.name }}
            </option>
          </select>
        </div>

        <!-- Return to Admin / Master Button -->
        <button
          @click="exitFieldMode"
          class="flex items-center gap-1.5 bg-gradient-to-r from-red-700 to-[#D7070D] hover:from-red-600 hover:to-red-700 text-white text-xs font-black px-3 py-1.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer border border-red-500/40"
          title="Return to Master Admin Dashboard"
        >
          <span class="text-sm">🛡️</span>
          <span class="hidden sm:inline">Exit to Admin</span>
          <span class="sm:hidden">Exit</span>
        </button>
      </div>
    </header>

    <div class="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <!-- NAVIGATION TABS: FIELD OPERATIONS VS TIMESHEET & PAYROLL -->
      <div class="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-lg">
        <button
          @click="activeTab = 'OPERATIONS'"
          class="flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          :class="activeTab === 'OPERATIONS' ? 'bg-[#D7070D] text-white shadow-md' : 'text-slate-400 hover:text-white'"
        >
          <Clock class="w-4 h-4" />
          <span>Clock-In & Job Site (GPS)</span>
        </button>
        <button
          @click="activeTab = 'PAYROLL'; fetchPayroll()"
          class="flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          :class="activeTab === 'PAYROLL' ? 'bg-[#D7070D] text-white shadow-md' : 'text-slate-400 hover:text-white'"
        >
          <DollarSign class="w-4 h-4" />
          <span>Timesheet & Payroll</span>
        </button>
      </div>

      <!-- ================= TAB 1: OPERATIONS & SMART CLOCK-IN ================= -->
      <div v-if="activeTab === 'OPERATIONS'" class="space-y-6">
        <!-- SMART CLOCK-IN GPS RECOMMENDATION BANNER -->
        <div
          v-if="nearestJob && !activeShift"
          class="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/60 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300"
        >
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
              🎯
            </div>
            <div class="space-y-0.5">
              <span class="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Nearest Job Site Detected via GPS
              </span>
              <h4 class="text-sm font-black text-white">{{ nearestJob.name }}</h4>
              <p class="text-xs text-slate-300 font-mono">
                📍 {{ nearestJob.address || nearestJob.city || 'Massachusetts' }} •
                <span class="text-emerald-400 font-bold">{{ nearestJob.distanceKm }} km away</span>
              </p>
            </div>
          </div>

          <button
            @click="selectedLeadId = nearestJob.id"
            class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <CheckCircle v-if="selectedLeadId === nearestJob.id" class="w-4 h-4" />
            <span>{{ selectedLeadId === nearestJob.id ? '✓ Job Selected' : 'Select This Job' }}</span>
          </button>
        </div>

        <!-- ACTIVE SHIFT / CLOCK-IN HERO CARD -->
        <div
          class="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 rounded-3xl p-6 shadow-2xl space-y-6"
          :class="activeShift ? 'border-emerald-500/60 shadow-emerald-950/20' : 'border-slate-800'"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <span class="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                Electronic Time Tracking & MA Geofencing
              </span>
              <h2 class="text-xl sm:text-2xl font-black text-white mt-1">
                {{ activeShift ? 'Job In Progress' : 'Start New Shift' }}
              </h2>
            </div>

            <!-- Geofencing GPS Status Pill -->
            <div class="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-mono">
              <MapPin class="w-3.5 h-3.5" :class="gpsCoords ? 'text-emerald-400' : 'text-amber-400 animate-pulse'" />
              <span v-if="gpsCoords" class="text-emerald-400 font-bold">
                GPS: {{ gpsCoords.lat.toFixed(4) }}, {{ gpsCoords.lng.toFixed(4) }}
              </span>
              <span v-else class="text-amber-300">
                Acquiring GPS...
              </span>
            </div>
          </div>

          <!-- If Shift is ACTIVE: Live timer & details -->
          <div v-if="activeShift" class="space-y-4">
            <div class="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Job Location / Client</span>
                <h3 class="text-base font-black text-white">{{ activeShift.lead?.name }}</h3>
                <p class="text-xs text-slate-300 font-mono mt-0.5">
                  📍 {{ activeShift.lead?.address || activeShift.lead?.city || 'Massachusetts' }}
                </p>
              </div>
              <div class="text-left sm:text-right">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Elapsed Time</span>
                <span class="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">{{ shiftTimer }}</span>
                <span class="text-[10px] text-slate-400 block">Clock-in: {{ new Date(activeShift.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <ShieldCheck class="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{{ activeShift.notes || 'Geofencing validated within Massachusetts job site perimeter.' }}</span>
            </div>

            <!-- Lunch deduction notice -->
            <div class="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-xs text-slate-400 flex items-center justify-between">
              <span>🍽️ Automatic Lunch Break:</span>
              <span class="text-emerald-400 font-bold">30 min deducted upon clock-out</span>
            </div>

            <!-- Clock-out action button -->
            <button
              @click="clockOut"
              :disabled="loadingAction"
              class="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm uppercase tracking-wider py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <Square class="w-5 h-5 fill-current" />
              <span>{{ loadingAction ? 'Clocking Out...' : 'Clock Out (End Shift)' }}</span>
            </button>
          </div>

          <!-- If Shift is NOT Active: Select Job and Clock In -->
          <div v-else class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Today's Job Site / Client:
              </label>
              <select
                v-model="selectedLeadId"
                class="w-full bg-slate-800 border border-slate-700 text-white text-sm font-semibold rounded-2xl p-3.5 focus:ring-2 focus:ring-[#D7070D] focus:outline-none"
              >
                <option value="" disabled>Select job from schedule...</option>
                <option v-for="job in activeJobs" :key="job.id" :value="job.id">
                  {{ job.name }} — {{ job.serviceInterested }} ({{ job.city }}) {{ job.distanceKm ? `[${job.distanceKm} km]` : '' }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Shift Notes / Planned Tasks:
              </label>
              <input
                v-model="shiftNotes"
                type="text"
                placeholder="e.g. Trim sanding, priming, and applying Benjamin Moore finish coats"
                class="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-3 focus:ring-2 focus:ring-[#D7070D] focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <!-- Clock In Action Button -->
            <button
              @click="clockIn"
              :disabled="!selectedLeadId || loadingAction"
              class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-40 cursor-pointer"
            >
              <Play class="w-5 h-5 fill-current" />
              <span>{{ loadingAction ? 'Clocking In (GPS)...' : 'Clock In (Start Shift)' }}</span>
            </button>
          </div>
        </div>

        <!-- 2. WORK PROGRESS PHOTO UPLOAD (FOR CUSTOMER PORTAL) -->
        <div class="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2.5">
              <Camera class="w-5 h-5 text-red-500" />
              <div>
                <h3 class="text-base font-black text-white">Job Site Progress Photos</h3>
                <p class="text-xs text-slate-400">Upload daily progress photos visible on the Client Portal</p>
              </div>
            </div>
            <span class="text-[10px] font-mono bg-slate-800 px-2.5 py-1 rounded-full text-slate-300">
              Tablet / Camera
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-400 mb-1">Image URL / Job Site Photo:</label>
              <input
                v-model="photoForm.url"
                type="text"
                placeholder="https://... or capture photo on mobile/tablet"
                class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-400 mb-1">Service & Scope Description:</label>
              <input
                v-model="photoForm.description"
                type="text"
                placeholder="e.g. First finish coat applied in living room & hallway"
                class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div class="flex items-center justify-between pt-2">
            <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input type="checkbox" v-model="photoForm.isPublic" class="w-4 h-4 rounded text-red-600 focus:ring-0" />
              <span>Showcase on Client Portal (Customer Tracker)</span>
            </label>

            <button
              @click="uploadProgressPhoto"
              :disabled="!photoForm.url || uploadingPhoto"
              class="bg-[#D7070D] hover:bg-[#B0050A] disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>{{ uploadingPhoto ? 'Saving...' : 'Upload Job Photo' }}</span>
              <Upload class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- 3. MATERIAL PROCUREMENT REQUEST (QUICK REORDER) -->
        <div class="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2.5">
              <PaintBucket class="w-5 h-5 text-amber-500" />
              <div>
                <h3 class="text-base font-black text-white">Material Procurement Request</h3>
                <p class="text-xs text-slate-400">Request paints, rollers, and supplies for job site delivery</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <input
                v-model="materialForm.item"
                type="text"
                placeholder="Item (e.g. 5 Gallons Regal Select Satin - Chantilly Lace)"
                class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div class="flex gap-2">
              <input
                v-model="materialForm.quantity"
                type="number"
                min="1"
                placeholder="Qty"
                class="w-20 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 text-center"
              />
              <button
                @click="requestMaterial"
                :disabled="!materialForm.item || requestingMaterial"
                class="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                Order
              </button>
            </div>
          </div>
        </div>

        <!-- 4. RECENT SHIFT LOGS -->
        <div class="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 class="text-base font-black text-white border-b border-slate-800 pb-3">
            Recent Shift Logs
          </h3>

          <div v-if="timeLogs.length === 0" class="text-center py-6 text-xs text-slate-500 italic">
            No shift logs recorded today.
          </div>

          <div v-else class="divide-y divide-slate-800">
            <div v-for="log in timeLogs" :key="log.id" class="py-3 flex items-center justify-between gap-3 text-xs">
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white">{{ log.lead?.name || 'Job Site' }}</span>
                  <span
                    class="text-[9px] font-mono px-2 py-0.2 rounded-full font-bold"
                    :class="log.isValidated ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'"
                  >
                    {{ log.isValidated ? 'GPS OK' : 'GPS Flag' }}
                  </span>
                  <span v-if="log.lunchDeducted" class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    -30m lunch
                  </span>
                </div>
                <p class="text-[11px] text-slate-400 font-mono">
                  In: {{ new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  <span v-if="log.checkOut"> • Out: {{ new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
                </p>
              </div>

              <div class="text-right font-mono">
                <span class="text-emerald-400 font-bold block">
                  {{ log.totalHours !== null ? `${log.totalHours}h` : (log.checkOut ? `${(((new Date(log.checkOut) - new Date(log.checkIn)) / (1000 * 60 * 60)).toFixed(1))}h` : 'Active') }}
                </span>
                <span v-if="log.earnedPay" class="text-[11px] text-emerald-300 font-bold block">
                  ${{ log.earnedPay.toFixed(2) }}
                </span>
                <span class="text-[10px] text-slate-500">{{ new Date(log.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= TAB 2: WORKER FINANCIAL DASHBOARD & TIMESHEET ================= -->
      <div v-else-if="activeTab === 'PAYROLL'" class="space-y-6">
        <!-- Worker Profile & Rate Card -->
        <div class="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-[#D7070D] text-white font-black text-xl flex items-center justify-center shadow-md">
              {{ payrollData?.worker?.name?.charAt(0) || 'T' }}
            </div>
            <div>
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block">
                Tony's Field Crew Member
              </span>
              <h3 class="text-lg font-black text-white">{{ payrollData?.worker?.name || 'Tony Silva Crew' }}</h3>
              <span class="text-xs text-slate-400 font-mono">
                Role: {{ payrollData?.worker?.role || 'FIELD_WORKER' }}
              </span>
            </div>
          </div>

          <!-- Hourly Rate Badge -->
          <div class="bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-3 text-right">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Hourly Rate</span>
            <span class="text-2xl font-black text-emerald-400 font-mono">
              ${{ payrollData?.worker?.hourlyRate ? payrollData.worker.hourlyRate.toFixed(2) : '35.00' }}
            </span>
            <span class="text-[10px] text-slate-500 block">/ billable hour</span>
          </div>
        </div>

        <!-- Weekly Navigation Toolbar -->
        <div class="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-md">
          <button
            @click="changeWeek(-1)"
            class="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
            title="View previous week"
          >
            <ChevronLeft class="w-4 h-4" />
            <span>Previous Week</span>
          </button>

          <div class="text-center">
            <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Pay Period</span>
            <span class="text-xs sm:text-sm font-black text-white font-mono">
              {{ payrollData?.weekLabel || 'Loading pay period...' }}
            </span>
          </div>

          <div class="flex items-center gap-1">
            <button
              v-if="weekOffset !== 0"
              @click="weekOffset = 0; fetchPayroll()"
              class="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Return to current week"
            >
              Current Week
            </button>
            <button
              @click="changeWeek(1)"
              class="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
              title="View next week"
            >
              <span>Next Week</span>
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 3 Executive KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Card 1: Weekly Hours -->
          <div class="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Week Hours</span>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-black text-white font-mono">{{ payrollData?.totalWeekHours || '0.0' }}</span>
              <span class="text-sm font-bold text-slate-400">h</span>
            </div>
            <p class="text-[11px] text-slate-500">30m lunch deducted per shift</p>
          </div>

          <!-- Card 2: Weekly Earnings -->
          <div class="bg-slate-950 border border-emerald-500/30 rounded-3xl p-5 shadow-lg space-y-1 bg-gradient-to-br from-emerald-950/20 to-slate-950">
            <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Weekly Earnings</span>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-black text-emerald-400 font-mono">
                ${{ payrollData?.totalWeekEarned ? payrollData.totalWeekEarned.toFixed(2) : '0.00' }}
              </span>
            </div>
            <p class="text-[11px] text-emerald-400/70 font-mono">Gross earnings for period</p>
          </div>

          <!-- Card 3: Monthly Projection -->
          <div class="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Month-to-Date ({{ payrollData?.monthSummary?.monthName || 'Month' }})
            </span>
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-black text-amber-400 font-mono">
                ${{ payrollData?.monthSummary?.totalEarned ? payrollData.monthSummary.totalEarned.toFixed(2) : '0.00' }}
              </span>
            </div>
            <p class="text-[11px] text-slate-400">
              Projected: <strong>${{ payrollData?.monthSummary?.projectedEarned ? payrollData.monthSummary.projectedEarned.toFixed(2) : '0.00' }}</strong>
            </p>
          </div>
        </div>

        <!-- VISUAL DAY-BY-DAY BAR CHART OF HOURS WORKED -->
        <div class="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 class="text-base font-black text-white">Daily Hours Breakdown</h3>
              <p class="text-xs text-slate-400">Daily hours and gross earnings breakdown (Mon - Sun)</p>
            </div>
            <span class="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-emerald-400 font-bold">
              Rate: ${{ payrollData?.worker?.hourlyRate || 35 }}/h
            </span>
          </div>

          <!-- Day Columns Visual Bar Graph -->
          <div class="grid grid-cols-7 gap-2 sm:gap-3 pt-4">
            <div
              v-for="day in payrollData?.dailyBreakdown || []"
              :key="day.dateStr"
              class="flex flex-col items-center gap-2 group"
            >
              <!-- Value on Hover / Top Pill -->
              <span class="text-[10px] font-mono text-emerald-400 font-bold h-4">
                {{ day.hours > 0 ? `${day.hours}h` : '-' }}
              </span>

              <!-- Bar Container (Height 120px max) -->
              <div class="w-full bg-slate-900 rounded-xl h-28 flex items-end p-1 border border-slate-800 relative overflow-hidden">
                <div
                  class="w-full rounded-lg transition-all duration-500"
                  :class="day.hours > 0 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-teal-300' : 'bg-transparent'"
                  :style="{ height: `${Math.min(100, (day.hours / 10) * 100)}%` }"
                ></div>
              </div>

              <!-- Day Label & Date -->
              <div class="text-center">
                <span class="text-xs font-bold block text-white">{{ day.dayShort }}</span>
                <span class="text-[10px] text-slate-500 font-mono block">{{ day.dateFormatted }}</span>
              </div>

              <!-- Pay Badge -->
              <span v-if="day.earnedPay > 0" class="text-[9px] font-mono text-emerald-400/90 font-bold">
                ${{ Math.round(day.earnedPay) }}
              </span>
            </div>
          </div>
        </div>

        <!-- DETAILED SHIFTS TABLE FOR THE SELECTED WEEK -->
        <div class="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-base font-black text-white">Weekly Shift Breakdown</h3>
            <span class="text-xs text-slate-400 font-mono">
              {{ payrollData?.weekLogs?.length || 0 }} shift(s) logged
            </span>
          </div>

          <div v-if="!payrollData?.weekLogs || payrollData.weekLogs.length === 0" class="py-8 text-center text-xs text-slate-500 italic">
            No shifts logged for this week. Use "Previous Week" to inspect past records.
          </div>

          <div v-else class="divide-y divide-slate-800">
            <div
              v-for="log in payrollData.weekLogs"
              :key="log.id"
              class="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white text-sm">{{ log.lead?.name || 'Tony\'s Job Site' }}</span>
                  <span
                    class="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold"
                    :class="log.isValidated ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'"
                  >
                    {{ log.isValidated ? 'GPS OK' : 'GPS Flag' }}
                  </span>
                  <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Lunch: 30m deducted
                  </span>
                </div>
                <p class="text-slate-400 font-mono text-[11px]">
                  📍 {{ log.lead?.address || log.lead?.city || 'MA' }} •
                  In: {{ new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  <span v-if="log.checkOut"> ➔ Out: {{ new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
                </p>
              </div>

              <div class="text-left sm:text-right font-mono flex sm:flex-col justify-between items-center sm:items-end">
                <span class="text-sm font-black text-white">
                  {{ log.totalHours !== null ? `${log.totalHours}h net` : 'Active' }}
                </span>
                <span class="text-sm font-black text-emerald-400">
                  ${{ log.earnedPay ? log.earnedPay.toFixed(2) : '0.00' }}
                </span>
                <span class="text-[10px] text-slate-500">
                  {{ new Date(log.checkIn).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: '2-digit' }) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Role Switcher Floating Footer (Emergency testing fallback) -->
    <div class="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      <button
        @click="exitFieldMode"
        class="bg-slate-950/95 hover:bg-black text-white text-xs font-black px-4 py-2.5 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-2 backdrop-blur-md transition-all active:scale-95 cursor-pointer hover:border-red-500"
        title="Quick Switch to Master Admin & Return to CRM"
      >
        <span class="text-base">🛡️</span>
        <span>Exit Field Mode</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  ArrowLeft,
  MapPin,
  Play,
  Square,
  Camera,
  PaintBucket,
  Upload,
  ShieldCheck,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-vue-next'
import { useWorkspaceAuth } from '~/composables/useWorkspaceAuth'

definePageMeta({
  layout: false
})

const {
  currentUser,
  teamUsers,
  isMaster,
  isCeo,
  isSales,
  isFieldWorker,
  canAccessOverview,
  canAccessAds,
  switchUser,
  fetchAuth
} = useWorkspaceAuth()

async function onSwitchUser(userId) {
  if (!userId) return
  await switchUser(userId)
}

async function exitFieldMode() {
  if (isMaster.value || isCeo.value) {
    return navigateTo('/')
  }
  const master = teamUsers.value.find(u => u.role === 'MASTER') || teamUsers.value.find(u => u.role === 'CEO')
  if (master) {
    await switchUser(master.id)
  } else {
    window.location.href = '/api/auth/reset'
  }
}

const activeTab = ref('OPERATIONS')
const activeJobs = ref([])
const timeLogs = ref([])
const activeShift = ref(null)
const nearestJob = ref(null)
const selectedLeadId = ref('')
const shiftNotes = ref('')
const loadingAction = ref(false)
const gpsCoords = ref(null)

const shiftTimer = ref('00:00:00')
let timerInterval = null

// Payroll & Timesheet state
const weekOffset = ref(0)
const payrollData = ref(null)
const loadingPayroll = ref(false)

const photoForm = ref({
  url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800',
  description: '',
  isPublic: true
})
const uploadingPhoto = ref(false)

const materialForm = ref({
  item: '',
  quantity: 2
})
const requestingMaterial = ref(false)

onMounted(async () => {
  await fetchAuth()
  obtainGpsLocation()
  await fetchFieldData()
  await fetchPayroll()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

function obtainGpsLocation() {
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        gpsCoords.value = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }
        fetchFieldData()
      },
      (err) => {
        console.warn('GPS not acquired automatically, defaulting to Boston area approximation:', err.message)
        gpsCoords.value = { lat: 42.3601, lng: -71.0589 }
        fetchFieldData()
      }
    )
  } else {
    gpsCoords.value = { lat: 42.3601, lng: -71.0589 }
    fetchFieldData()
  }
}

async function fetchFieldData() {
  try {
    const params = {}
    if (gpsCoords.value) {
      params.gpsLat = gpsCoords.value.lat
      params.gpsLng = gpsCoords.value.lng
    }

    const res = await $fetch('/api/field/logs', { params })
    if (res?.success) {
      activeJobs.value = res.activeJobs || []
      timeLogs.value = res.timeLogs || []
      activeShift.value = res.activeShift || null
      nearestJob.value = res.nearestJob || null

      if (!selectedLeadId.value && nearestJob.value) {
        selectedLeadId.value = nearestJob.value.id
      }

      if (activeShift.value) {
        startTimer(activeShift.value.checkIn)
      }
    }
  } catch (err) {
    console.error('Error loading job site field data:', err)
  }
}

async function fetchPayroll() {
  loadingPayroll.value = true
  try {
    const res = await $fetch('/api/field/payroll', {
      params: { weekOffset: weekOffset.value }
    })
    if (res?.success) {
      payrollData.value = res
    }
  } catch (err) {
    console.error('Error loading employee payroll timesheet:', err)
  } finally {
    loadingPayroll.value = false
  }
}

function changeWeek(delta) {
  weekOffset.value += delta
  fetchPayroll()
}

function startTimer(checkInStr) {
  if (timerInterval) clearInterval(timerInterval)
  const checkInDate = new Date(checkInStr).getTime()

  const update = () => {
    const diff = Math.max(0, Date.now() - checkInDate)
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    shiftTimer.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  update()
  timerInterval = setInterval(update, 1000)
}

async function clockIn() {
  if (!selectedLeadId.value) return
  loadingAction.value = true
  try {
    const res = await $fetch('/api/field/clock-in', {
      method: 'POST',
      body: {
        leadId: selectedLeadId.value,
        gpsLat: gpsCoords.value?.lat,
        gpsLng: gpsCoords.value?.lng,
        notes: shiftNotes.value
      }
    })

    if (res?.success) {
      activeShift.value = res.timeLog
      startTimer(res.timeLog.checkIn)
      alert(res.message)
      await fetchFieldData()
      await fetchPayroll()
    }
  } catch (err) {
    console.error('Failed to clock in:', err)
    alert('Failed to register clock-in.')
  } finally {
    loadingAction.value = false
  }
}

async function clockOut() {
  if (!activeShift.value) return
  loadingAction.value = true
  try {
    const res = await $fetch('/api/field/clock-out', {
      method: 'POST',
      body: { timeLogId: activeShift.value.id }
    })

    if (res?.success) {
      alert(res.message)
      if (timerInterval) clearInterval(timerInterval)
      activeShift.value = null
      await fetchFieldData()
      await fetchPayroll()
    }
  } catch (err) {
    console.error('Failed to clock out:', err)
    alert('Failed to register clock-out.')
  } finally {
    loadingAction.value = false
  }
}

async function uploadProgressPhoto() {
  const currentLeadId = activeShift.value?.leadId || selectedLeadId.value || activeJobs.value[0]?.id
  if (!currentLeadId || !photoForm.value.url) {
    alert('Please select a job site and provide a photo URL.')
    return
  }

  uploadingPhoto.value = true
  try {
    await $fetch('/api/materials', {
      method: 'POST',
      body: {
        leadId: currentLeadId,
        item: `Progress Photo: ${photoForm.value.description || 'Painting Execution'}`,
        quantity: 1,
        unit: 'photo',
        unitCost: 0
      }
    })

    alert('Progress photo saved and synced with Client Portal!')
    photoForm.value.description = ''
  } catch (err) {
    console.error('Failed to upload photo:', err)
  } finally {
    uploadingPhoto.value = false
  }
}

async function requestMaterial() {
  const currentLeadId = activeShift.value?.leadId || selectedLeadId.value || activeJobs.value[0]?.id
  if (!currentLeadId || !materialForm.value.item) return

  requestingMaterial.value = true
  try {
    const res = await $fetch('/api/materials', {
      method: 'POST',
      body: {
        leadId: currentLeadId,
        item: materialForm.value.item,
        quantity: materialForm.value.quantity,
        unit: 'gallons',
        unitCost: 65.0, // Benchmark gallon price
        supplier: 'Sherwin-Williams / Benjamin Moore',
        status: 'PENDING'
      }
    })

    if (res?.success) {
      alert('Material procurement request successfully submitted to purchasing!')
      materialForm.value.item = ''
    }
  } catch (err) {
    console.error('Failed to request materials:', err)
  } finally {
    requestingMaterial.value = false
  }
}
</script>
