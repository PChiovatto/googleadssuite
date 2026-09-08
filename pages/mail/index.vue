<template>
  <div class="h-screen w-screen flex flex-col bg-white font-sans text-[#1f1f1f] overflow-hidden select-none">
    <!-- 1. Top Header Bar: Corporate Webmail (Clean, Professional, Tony's Branded) -->
    <header class="h-16 px-4 flex items-center justify-between shrink-0 bg-white border-b border-slate-200/80 z-20 shadow-2xs">
      <!-- Left: Hamburger + Tony's Mail Brand Logo + CRM Switcher -->
      <div class="flex items-center gap-3 min-w-[260px]">
        <button
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          title="Toggle Sidebar"
        >
          <Menu class="w-5 h-5" />
        </button>

        <!-- Tony's Corporate Webmail Logo & Emblem -->
        <div class="flex items-center gap-2.5 cursor-pointer" @click="setFolder('INBOX')">
          <img
            src="/emblem.png"
            alt="Tony's Remodeling"
            class="w-9 h-9 rounded-full object-contain shadow-xs border border-slate-200"
          />
          <div class="flex flex-col">
            <span class="text-base font-black tracking-tight text-slate-900 leading-none">Tony's Mail</span>
            <span class="text-[9px] font-bold text-[#D7070D] uppercase tracking-wider leading-none mt-0.5">
              Corporate Webmail & CRM
            </span>
          </div>
        </div>

        <!-- Direct Link Back to Main Dashboard -->
        <NuxtLink
          to="/dashboard"
          class="ml-2 text-xs font-bold text-slate-600 hover:text-[#D7070D] bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
          title="Return to CRM Pipeline"
        >
          <span>← CRM</span>
        </NuxtLink>
      </div>

      <!-- Center: Search Bar (Corporate Style) -->
      <div class="flex-1 max-w-2xl px-4">
        <div class="relative flex items-center bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#D7070D]/20 focus-within:shadow-md rounded-full px-4 py-2 transition-all border border-slate-200">
          <Search class="w-4 h-4 text-slate-500 shrink-0" />
          <input
            v-model="searchQuery"
            @input="fetchEmails"
            type="text"
            placeholder="Search by sender, subject, lead, estimate, or contract..."
            class="w-full bg-transparent pl-3 pr-8 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''; fetchEmails()"
            class="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            title="Clear search"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Right: Direct CRM Shortcuts & User Profile -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Quick CRM Links -->
        <NuxtLink
          to="/dashboard/leads"
          class="p-2 hover:bg-slate-100 text-slate-600 hover:text-[#D7070D] rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
          title="Open Leads Pipeline"
        >
          <Users class="w-4 h-4" />
          <span class="hidden md:inline">Leads</span>
        </NuxtLink>

        <NuxtLink
          to="/dashboard/calendar"
          class="p-2 hover:bg-slate-100 text-slate-600 hover:text-[#D7070D] rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
          title="Open Walkthrough Schedule"
        >
          <Calendar class="w-4 h-4" />
          <span class="hidden md:inline">Calendar</span>
        </NuxtLink>

        <NuxtLink
          v-if="canAccessSettings"
          to="/settings"
          class="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
          title="Email & SES Settings"
        >
          <Settings class="w-4 h-4" />
        </NuxtLink>

        <!-- Profile Avatar & RBAC Switcher -->
        <div class="relative ml-1">
          <button
            @click="showProfileMenu = !showProfileMenu"
            class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#D7070D] to-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs border-2 border-white hover:ring-2 hover:ring-red-400 transition-all overflow-hidden"
          >
            <img v-if="currentUser?.avatarUrl" :src="currentUser.avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
            <span v-else>{{ currentUser?.name?.charAt(0) || 'T' }}</span>
          </button>

          <!-- Profile Dropdown Card -->
          <div v-if="showProfileMenu" class="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 space-y-3">
            <div class="text-center pb-3 border-b border-slate-100">
              <div class="w-14 h-14 mx-auto rounded-full bg-[#D7070D] text-white font-bold text-xl flex items-center justify-center mb-2 overflow-hidden shadow-inner">
                <img v-if="currentUser?.avatarUrl" :src="currentUser.avatarUrl" class="w-full h-full object-cover" />
                <span v-else>{{ currentUser?.name?.charAt(0) || 'T' }}</span>
              </div>
              <h4 class="font-bold text-sm text-slate-900">{{ currentUser?.name || 'Tony Silva' }}</h4>
              <p class="text-xs text-slate-500 font-mono">{{ currentUser?.email || 'tony@tonyspainting.com' }}</p>
              <span class="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider" :class="roleBadgeHeader">
                {{ roleIcon }} {{ roleTitle }}
              </span>
            </div>

            <!-- Team RBAC Switcher -->
            <div class="space-y-1">
              <span class="text-[11px] font-bold text-slate-500 uppercase">Switch Active User:</span>
              <div class="space-y-1 max-h-40 overflow-y-auto">
                <button
                  v-for="u in teamUsers"
                  :key="u.id"
                  @click="switchUser(u.id); showProfileMenu = false"
                  class="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 flex items-center justify-between transition-colors"
                  :class="currentUser?.id === u.id ? 'bg-red-50 text-[#D7070D] font-bold border border-red-100' : 'text-slate-700'"
                >
                  <span class="truncate">{{ u.name }}</span>
                  <span class="text-[9px] font-mono text-slate-400 shrink-0">{{ u.role }}</span>
                </button>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-100 flex gap-2">
              <NuxtLink :to="isSales ? '/dashboard/leads' : '/'" class="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2 rounded-xl font-bold transition-colors">
                {{ isSales ? 'Leads Pipeline' : 'Overview' }}
              </NuxtLink>
              <button @click="showProfileMenu = false" class="flex-1 text-center bg-slate-900 hover:bg-black text-white text-xs py-2 rounded-xl font-bold transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 2. Main Body Split: Left Navigation + Center Email View + Right Utility Rail -->
    <div class="flex-1 flex overflow-hidden">
      <!-- A. Left Drawer: Functional CRM & Corporate Mail Navigation -->
      <aside
        class="h-full flex flex-col justify-between shrink-0 transition-all duration-200 overflow-y-auto py-3 px-3 bg-slate-50/50 border-r border-slate-200/80"
        :class="sidebarCollapsed ? 'w-20' : 'w-64'"
      >
        <div class="space-y-4">
          <!-- Primary Compose Button: Tony's Corporate Red -->
          <button
            @click="openComposeModal"
            class="flex items-center gap-3 bg-[#D7070D] hover:bg-[#B0050A] text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-md shadow-red-950/20 active:scale-95"
            :class="sidebarCollapsed ? 'px-3 justify-center' : 'px-5 w-full'"
            title="Compose New Email"
          >
            <PenSquare class="w-5 h-5 shrink-0 text-white" />
            <span v-if="!sidebarCollapsed" class="tracking-wide">Compose</span>
          </button>

          <!-- Core Mailbox Folders -->
          <nav class="space-y-0.5 text-xs font-semibold text-slate-700">
            <span v-if="!sidebarCollapsed" class="block px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Messages
            </span>

            <!-- Inbox -->
            <button
              @click="setFolder('INBOX')"
              class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left"
              :class="activeFolder === 'INBOX' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
              title="Inbox"
            >
              <div class="flex items-center gap-3">
                <Inbox class="w-4 h-4 shrink-0" :class="activeFolder === 'INBOX' ? 'text-white' : 'text-slate-500'" />
                <span v-if="!sidebarCollapsed">Inbox</span>
              </div>
              <span
                v-if="!sidebarCollapsed && stats.inboxUnread > 0"
                class="text-[11px] font-bold px-1.5 py-0.2 rounded-full"
                :class="activeFolder === 'INBOX' ? 'bg-white text-[#D7070D]' : 'bg-[#D7070D] text-white'"
              >
                {{ stats.inboxUnread }}
              </span>
            </button>

            <!-- Starred Messages -->
            <button
              @click="setFolder('STARRED')"
              class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all text-left"
              :class="activeFolder === 'STARRED' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
              title="Starred Messages"
            >
              <div class="flex items-center gap-3">
                <Star class="w-4 h-4 shrink-0" :class="activeFolder === 'STARRED' ? 'text-white' : 'text-amber-500'" />
                <span v-if="!sidebarCollapsed">Starred</span>
              </div>
              <span v-if="!sidebarCollapsed && stats.starredTotal" class="text-[10px] opacity-80 font-mono">
                {{ stats.starredTotal }}
              </span>
            </button>

            <!-- Sent Messages -->
            <button
              @click="setFolder('SENT')"
              class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all text-left"
              :class="activeFolder === 'SENT' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
              title="Sent Messages"
            >
              <div class="flex items-center gap-3">
                <Send class="w-4 h-4 shrink-0" :class="activeFolder === 'SENT' ? 'text-white' : 'text-slate-500'" />
                <span v-if="!sidebarCollapsed">Sent</span>
              </div>
              <span v-if="!sidebarCollapsed && stats.sentTotal" class="text-[10px] opacity-80 font-mono">
                {{ stats.sentTotal }}
              </span>
            </button>

            <!-- Saved Drafts -->
            <button
              @click="setFolder('DRAFTS')"
              class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all text-left"
              :class="activeFolder === 'DRAFTS' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
              title="Saved Drafts"
            >
              <div class="flex items-center gap-3">
                <FileText class="w-4 h-4 shrink-0" :class="activeFolder === 'DRAFTS' ? 'text-white' : 'text-slate-500'" />
                <span v-if="!sidebarCollapsed">Drafts</span>
              </div>
              <span v-if="!sidebarCollapsed && stats.draftsTotal" class="text-[10px] opacity-80 font-mono">
                {{ stats.draftsTotal }}
              </span>
            </button>

            <!-- Trash -->
            <button
              @click="setFolder('TRASH')"
              class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all text-left"
              :class="activeFolder === 'TRASH' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
              title="Trash"
            >
              <div class="flex items-center gap-3">
                <Trash2 class="w-4 h-4 shrink-0" :class="activeFolder === 'TRASH' ? 'text-white' : 'text-slate-500'" />
                <span v-if="!sidebarCollapsed">Trash</span>
              </div>
            </button>

            <!-- ---------------- TONY'S CRM PIPELINE FOLDERS ---------------- -->
            <div class="pt-3">
              <span v-if="!sidebarCollapsed" class="block px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                CRM Leads & Pipeline Folders
              </span>

              <!-- Leads Ativos -->
              <button
                @click="setFolder('CRM_LEADS')"
                class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all text-left"
                :class="activeFolder === 'CRM_LEADS' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
                title="Emails linked to CRM Leads"
              >
                <div class="flex items-center gap-3">
                  <Users class="w-4 h-4 shrink-0" :class="activeFolder === 'CRM_LEADS' ? 'text-white' : 'text-blue-600'" />
                  <span v-if="!sidebarCollapsed">Linked Leads</span>
                </div>
                <span
                  v-if="!sidebarCollapsed"
                  class="text-[10px] font-bold px-1.5 py-0.2 rounded-md"
                  :class="activeFolder === 'CRM_LEADS' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'"
                >
                  {{ stats.crmLeadsTotal || 0 }}
                </span>
              </button>

              <!-- Estimates & Walkthroughs -->
              <button
                @click="setFolder('CRM_ESTIMATES')"
                class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all text-left"
                :class="activeFolder === 'CRM_ESTIMATES' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
                title="Estimates & Walkthroughs"
              >
                <div class="flex items-center gap-3">
                  <ClipboardCheck class="w-4 h-4 shrink-0" :class="activeFolder === 'CRM_ESTIMATES' ? 'text-white' : 'text-emerald-600'" />
                  <span v-if="!sidebarCollapsed">Estimates & Walkthroughs</span>
                </div>
                <span
                  v-if="!sidebarCollapsed && stats.crmEstimatesTotal"
                  class="text-[10px] font-bold px-1.5 py-0.2 rounded-md"
                  :class="activeFolder === 'CRM_ESTIMATES' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'"
                >
                  {{ stats.crmEstimatesTotal }}
                </span>
              </button>

              <!-- Contratos HIC -->
              <button
                @click="setFolder('CRM_CONTRACTS')"
                class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all text-left"
                :class="activeFolder === 'CRM_CONTRACTS' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
                title="HIC Contracts & Legal Signatures"
              >
                <div class="flex items-center gap-3">
                  <Building2 class="w-4 h-4 shrink-0" :class="activeFolder === 'CRM_CONTRACTS' ? 'text-white' : 'text-amber-600'" />
                  <span v-if="!sidebarCollapsed">HIC Contracts</span>
                </div>
                <span
                  v-if="!sidebarCollapsed && stats.crmContractsTotal"
                  class="text-[10px] font-bold px-1.5 py-0.2 rounded-md"
                  :class="activeFolder === 'CRM_CONTRACTS' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'"
                >
                  {{ stats.crmContractsTotal }}
                </span>
              </button>

              <!-- Pagamentos & Sinais -->
              <button
                @click="setFolder('CRM_PAYMENTS')"
                class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all text-left"
                :class="activeFolder === 'CRM_PAYMENTS' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
                title="Stripe Deposits"
              >
                <div class="flex items-center gap-3">
                  <DollarSign class="w-4 h-4 shrink-0" :class="activeFolder === 'CRM_PAYMENTS' ? 'text-white' : 'text-teal-600'" />
                  <span v-if="!sidebarCollapsed">Stripe Deposits</span>
                </div>
                <span
                  v-if="!sidebarCollapsed && stats.crmPaymentsTotal"
                  class="text-[10px] font-bold px-1.5 py-0.2 rounded-md"
                  :class="activeFolder === 'CRM_PAYMENTS' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'"
                >
                  {{ stats.crmPaymentsTotal }}
                </span>
              </button>
            </div>

            <!-- ---------------- ATALHOS EXTERNOS DO SISTEMA ---------------- -->
            <div v-if="!sidebarCollapsed" class="pt-3 border-t border-slate-200">
              <span class="block px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Quick Shortcuts
              </span>

              <NuxtLink
                to="/dashboard/leads"
                class="w-full flex items-center gap-3 px-3.5 py-1.5 rounded-xl hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition-colors text-xs"
              >
                <span>🎯</span>
                <span>Leads Kanban</span>
              </NuxtLink>

              <NuxtLink
                to="/dashboard/calendar"
                class="w-full flex items-center gap-3 px-3.5 py-1.5 rounded-xl hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition-colors text-xs"
              >
                <span>📅</span>
                <span>Walkthrough Calendar</span>
              </NuxtLink>

              <NuxtLink
                to="/dashboard"
                class="w-full flex items-center gap-3 px-3.5 py-1.5 rounded-xl hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition-colors text-xs"
              >
                <span>📊</span>
                <span>Ads & Analytics</span>
              </NuxtLink>
            </div>
          </nav>
        </div>

        <!-- SES Corporate Domain Status Badge -->
        <div v-if="!sidebarCollapsed" class="p-3 bg-white rounded-2xl border border-slate-200 text-[11px] space-y-1 shadow-2xs mt-4">
          <div class="flex items-center justify-between font-bold text-slate-800">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Corporate Amazon SES</span>
            </span>
            <span class="text-emerald-700 font-bold text-[10px]">Active</span>
          </div>
          <p class="text-slate-500 text-[10px] leading-tight">
            Official mail server active for <strong>@tonyspainting.com</strong>.
          </p>
        </div>
      </aside>

      <!-- B. Center Column: Email Table OR Thread Reader View -->
      <main class="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        <!-- ================= MODE 1: EMAIL THREAD READER ================= -->
        <div v-if="selectedEmail" class="flex-1 flex flex-col bg-white overflow-hidden">
          <!-- Reader Top Action Bar -->
          <div class="h-12 px-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
            <div class="flex items-center gap-2">
              <button
                @click="selectedEmail = null"
                class="p-2 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="Back to list"
              >
                <ArrowLeft class="w-4 h-4" />
                <span>Back</span>
              </button>

              <div class="h-5 w-px bg-slate-300 mx-1"></div>

              <button @click="toggleStar(selectedEmail)" class="p-2 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors" :title="selectedEmail.starred ? 'Unstar' : 'Star'">
                <Star class="w-4 h-4" :class="selectedEmail.starred ? 'text-amber-500 fill-amber-500' : 'text-slate-400'" />
              </button>

              <button @click="toggleRead(selectedEmail)" class="p-2 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors" :title="selectedEmail.read ? 'Mark as unread' : 'Mark as read'">
                <Mail class="w-4 h-4" />
              </button>

              <button @click="deleteEmail(selectedEmail.id)" class="p-2 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-lg transition-colors" title="Delete message">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <!-- Quick CRM Action Badge in Reader Top Bar -->
            <div class="flex items-center gap-2">
              <button
                v-if="!selectedEmail.lead"
                @click="convertEmailToLead(selectedEmail)"
                :disabled="convertingLead"
                class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <UserPlus class="w-3.5 h-3.5" />
                <span>{{ convertingLead ? 'Converting...' : 'Convert to CRM Lead' }}</span>
              </button>
              <span class="text-xs text-slate-400 font-mono">
                {{ new Date(selectedEmail.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
              </span>
            </div>
          </div>

          <!-- Reader Scrollable Content -->
          <div class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <!-- Subject Line with Category Badge -->
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <h1 class="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {{ selectedEmail.subject }}
                </h1>
                <div class="flex flex-wrap items-center gap-2 pt-1">
                  <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Folder: {{ selectedEmail.folder || 'Inbox' }}
                  </span>
                  <span v-if="selectedEmail.lead" class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <span>🎯 Linked Lead:</span>
                    <strong>{{ selectedEmail.lead.name }}</strong> ({{ selectedEmail.lead.city || 'MA' }})
                  </span>
                </div>
              </div>
            </div>

            <!-- ================= CRM INTEGRATION CONTEXT BOX ================= -->
            <!-- 1. If Email IS linked to a CRM Lead -->
            <div
              v-if="selectedEmail.lead"
              class="p-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border-2 border-slate-800"
            >
              <div class="space-y-1.5">
                <div class="flex items-center gap-2.5">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-400">CRM Client:</span>
                  <span class="font-black text-base text-white">{{ selectedEmail.lead.name }}</span>
                  <span class="text-[10px] bg-red-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase">
                    {{ selectedEmail.lead.status }}
                  </span>
                </div>
                <p class="text-xs text-slate-300">
                  <strong>Service / Scope:</strong> {{ selectedEmail.lead.serviceInterested || 'Residential Painting' }} •
                  <strong>Location:</strong> {{ selectedEmail.lead.city || 'Greater Boston' }} •
                  <strong>Estimated Value:</strong> ${{ selectedEmail.lead.dealValue ? selectedEmail.lead.dealValue.toLocaleString('en-US') : '8,500' }}
                </p>
                <p v-if="selectedEmail.lead.phone" class="text-xs text-slate-400 font-mono">
                  📞 {{ selectedEmail.lead.phone }}
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <NuxtLink
                  to="/dashboard/leads"
                  class="bg-white hover:bg-slate-100 text-slate-900 px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>View in Pipeline</span>
                  <ExternalLink class="w-3.5 h-3.5" />
                </NuxtLink>
                <NuxtLink
                  to="/dashboard/calendar"
                  class="bg-[#D7070D] hover:bg-[#B0050A] text-white px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Schedule Walkthrough</span>
                  <Calendar class="w-3.5 h-3.5" />
                </NuxtLink>
              </div>
            </div>

            <!-- 2. If Email IS NOT linked to a CRM Lead yet -->
            <div
              v-else
              class="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 text-xs"
            >
              <div class="space-y-0.5">
                <span class="font-bold block text-sm">This sender is not yet registered as a CRM lead.</span>
                <p class="text-amber-800">
                  Convert this message into a pipeline opportunity with 1 click to track walkthroughs and estimates.
                </p>
              </div>
              <button
                @click="convertEmailToLead(selectedEmail)"
                :disabled="convertingLead"
                class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-xs"
              >
                <UserPlus class="w-4 h-4" />
                <span>{{ convertingLead ? 'Registering Lead...' : '➕ Convert to CRM Lead' }}</span>
              </button>
            </div>

            <!-- Sender Header Card -->
            <div class="flex items-start justify-between gap-4 pt-2 border-t border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#D7070D] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {{ selectedEmail.from.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-slate-900">{{ selectedEmail.from }}</span>
                  </div>
                  <div class="text-xs text-slate-500 flex items-center gap-1">
                    <span>To: {{ selectedEmail.to }}</span>
                  </div>
                </div>
              </div>

              <span class="text-xs text-slate-500 font-mono">
                {{ new Date(selectedEmail.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
              </span>
            </div>

            <!-- Email Body Content -->
            <div class="py-4 text-slate-800 text-sm leading-relaxed max-w-4xl prose prose-slate" v-html="selectedEmail.body">
            </div>

            <!-- Quick Reply / Copiloto IA Box -->
            <div class="mt-8 pt-6 border-t border-slate-200 space-y-4 max-w-4xl">
              <!-- AI Quick Copilot Action Pills -->
              <div class="bg-red-50/60 p-4 rounded-2xl border border-red-100 space-y-2.5">
                <div class="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span class="flex items-center gap-1.5 text-[#D7070D]">
                    <Sparkles class="w-4 h-4" />
                    <span>Tony's Sales AI Copilot:</span>
                  </span>
                  <span class="text-[10px] text-slate-500 font-normal">Click to generate one-click commercial responses</span>
                </div>

                <div class="flex flex-wrap gap-2">
                  <button
                    @click="generateAIReply('commercial_quote')"
                    :disabled="generatingAI"
                    class="bg-white hover:bg-red-50 text-slate-800 hover:text-[#D7070D] text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>📄 Painting Estimate & 5-Year Warranty</span>
                  </button>
                  <button
                    @click="generateAIReply('schedule_estimate')"
                    :disabled="generatingAI"
                    class="bg-white hover:bg-red-50 text-slate-800 hover:text-[#D7070D] text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>📅 Confirm On-Site Walkthrough (MA)</span>
                  </button>
                  <button
                    @click="generateAIReply('friendly_followup')"
                    :disabled="generatingAI"
                    class="bg-white hover:bg-red-50 text-slate-800 hover:text-[#D7070D] text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>✍️ HIC Agreement & 1/3 Deposit (MA Law)</span>
                  </button>
                </div>
              </div>

              <!-- Reply Input Box -->
              <div class="border border-slate-300 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                <div class="flex items-center gap-2 text-xs text-slate-500">
                  <Reply class="w-4 h-4 text-slate-600" />
                  <span>Reply to <strong>{{ selectedEmail.from }}</strong></span>
                </div>

                <textarea
                  v-model="replyText"
                  rows="4"
                  placeholder="Write your commercial response or use the Sales AI Copilot above..."
                  class="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-y"
                ></textarea>

                <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    @click="sendQuickReply"
                    :disabled="sendingReply || !replyText.trim()"
                    class="bg-[#D7070D] hover:bg-[#B0050A] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
                  >
                    <span>{{ sendingReply ? 'Sending...' : 'Send Reply' }}</span>
                    <Send class="w-3.5 h-3.5" />
                  </button>

                  <div class="flex items-center gap-2 text-slate-400">
                    <button class="p-1.5 hover:bg-slate-100 rounded-full" @click="replyText = ''" title="Clear"><Trash2 class="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= MODE 2: EMAIL ROWS TABLE ================= -->
        <div v-else class="flex-1 flex flex-col bg-white overflow-hidden">
          <!-- Action Toolbar Above Emails (Normal or Bulk Actions Mode) -->
          <div class="h-12 px-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
            <!-- Mode A: Bulk Actions Bar (Shown when 1 or more emails are checked) -->
            <div v-if="selectedEmailIds.length > 0" class="flex items-center gap-3">
              <button
                @click="toggleSelectAll"
                class="p-2 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors flex items-center gap-1.5"
                title="Deselect all"
              >
                <CheckSquare class="w-4 h-4 text-[#D7070D]" />
                <span class="text-xs font-black text-slate-900">{{ selectedEmailIds.length }} selected</span>
              </button>

              <div class="h-5 w-px bg-slate-300 mx-0.5"></div>

              <!-- GLOBAL TRASH BUTTON (LIXEIRA EM MASSA) -->
              <button
                @click="bulkDeleteSelected"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-[#D7070D] hover:bg-[#B0050A] text-white rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Delete all selected messages"
              >
                <Trash2 class="w-4 h-4 text-white" />
                <span>Delete Selected</span>
              </button>

              <!-- Bulk Mark As Read -->
              <button
                @click="bulkMarkRead(true)"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                title="Mark all selected as read"
              >
                <Mail class="w-3.5 h-3.5 text-slate-600" />
                <span class="hidden sm:inline">Mark as Read</span>
              </button>

              <button
                @click="selectedEmailIds = []"
                class="text-xs text-slate-500 hover:text-slate-800 font-bold px-2 py-1 transition-colors"
              >
                Deselect
              </button>
            </div>

            <!-- Mode B: Normal Toolbar Controls (No emails checked) -->
            <div v-else class="flex items-center gap-2">
              <button
                @click="toggleSelectAll"
                class="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors flex items-center gap-1"
                title="Select all emails"
              >
                <Square class="w-4 h-4 text-slate-500" />
              </button>

              <button
                @click="fetchEmails"
                :disabled="loading"
                class="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                title="Refresh messages"
              >
                <RotateCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
              </button>

              <!-- Quick Filter Pills -->
              <div class="hidden sm:flex items-center gap-1 ml-3 border-l border-slate-300 pl-3">
                <button
                  @click="activeFilterChip = 'ALL'; fetchEmails()"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                  :class="activeFilterChip === 'ALL' ? 'bg-[#D7070D] text-white' : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'"
                >
                  All
                </button>
                <button
                  @click="setFolder('CRM_LEADS')"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                  :class="activeFolder === 'CRM_LEADS' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'"
                >
                  🎯 Linked Leads
                </button>
                <button
                  @click="setFolder('CRM_ESTIMATES')"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                  :class="activeFolder === 'CRM_ESTIMATES' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'"
                >
                  📋 Estimates
                </button>
              </div>
            </div>

            <!-- Right Controls: Pagination & Summary -->
            <div class="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span>{{ emails.length }} messages</span>
            </div>
          </div>

          <!-- Email Rows List -->
          <div class="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
            <div v-if="loading" class="p-12 text-center text-sm text-slate-400">
              Syncing messages from corporate mail server...
            </div>

            <div v-else-if="emails.length === 0" class="p-16 text-center text-sm text-slate-400 italic">
              No messages found in this CRM mailbox.
            </div>

            <!-- Individual Email Row -->
            <div
              v-for="mail in emails"
              :key="mail.id"
              @click="openEmail(mail)"
              class="group relative h-11 px-4 flex items-center gap-3 cursor-pointer transition-colors text-sm"
              :class="[
                !mail.read ? 'bg-white text-slate-900 font-bold' : 'bg-slate-50/60 text-slate-600 font-normal hover:bg-slate-100/80',
                selectedEmailIds.includes(mail.id) ? 'bg-red-50/70 border-l-4 border-[#D7070D]' : '',
                selectedEmail?.id === mail.id ? 'bg-red-50/50' : ''
              ]"
            >
              <!-- Checkbox -->
              <div class="shrink-0" @click.stop>
                <input
                  type="checkbox"
                  :checked="selectedEmailIds.includes(mail.id)"
                  @change="toggleSelectEmail(mail.id)"
                  class="w-4 h-4 rounded border-slate-300 text-[#D7070D] focus:ring-0 cursor-pointer accent-[#D7070D]"
                />
              </div>

              <!-- Star Button -->
              <div class="shrink-0 text-base" @click.stop="toggleStar(mail)">
                <span
                  class="transition-transform active:scale-125 inline-block"
                  :class="mail.starred ? 'text-amber-500' : 'text-slate-300 hover:text-slate-400'"
                >
                  ★
                </span>
              </div>

              <!-- Sender Name -->
              <div class="w-44 sm:w-52 shrink-0 truncate">
                <span :class="!mail.read ? 'font-black text-slate-900' : 'font-normal text-slate-700'">
                  {{ mail.from }}
                </span>
              </div>

              <!-- Subject & Snippet -->
              <div class="flex-1 min-w-0 flex items-center gap-2 truncate">
                <!-- Subject -->
                <span :class="!mail.read ? 'font-black text-slate-900' : 'font-medium text-slate-800'" class="shrink-0">
                  {{ mail.subject }}
                </span>

                <span class="text-slate-300 shrink-0">—</span>

                <!-- Snippet Preview -->
                <span class="text-slate-500 font-normal truncate text-xs">
                  {{ getSnippet(mail.body) }}
                </span>

                <!-- CRM Lead Tag Chip -->
                <span
                  v-if="mail.lead"
                  class="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0"
                >
                  🎯 {{ mail.lead.name }} ({{ mail.lead.city || 'Lead' }})
                </span>
              </div>

              <!-- Right Side: Date or Actions -->
              <div class="shrink-0 flex items-center justify-end text-xs text-slate-500 w-28 text-right">
                <!-- Hover Action Icons -->
                <div class="hidden group-hover:flex items-center gap-1 text-slate-600 -mr-1" @click.stop>
                  <button @click="deleteEmail(mail.id)" class="p-1.5 hover:bg-slate-200 rounded-lg" title="Delete">
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                  <button @click="toggleRead(mail)" class="p-1.5 hover:bg-slate-200 rounded-lg" :title="mail.read ? 'Mark as unread' : 'Mark as read'">
                    <Mail class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Static Date/Time -->
                <span class="group-hover:hidden font-mono" :class="!mail.read ? 'font-bold text-slate-900' : ''">
                  {{ formatEmailDate(mail.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- C. Right Column: CRM Productivity Hub Rail -->
      <aside class="w-14 bg-slate-50 border-l border-slate-200 shrink-0 flex flex-col items-center py-4 justify-between select-none">
        <div class="flex flex-col items-center gap-4">
          <!-- Calendar Shortcut -->
          <NuxtLink
            to="/dashboard/calendar"
            class="w-10 h-10 rounded-xl hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-700 hover:text-[#D7070D]"
            title="Walkthrough Calendar"
          >
            <Calendar class="w-5 h-5" />
          </NuxtLink>

          <!-- Leads CRM Shortcut -->
          <NuxtLink
            to="/dashboard/leads"
            class="w-10 h-10 rounded-xl hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-700 hover:text-[#D7070D]"
            title="Leads Pipeline"
          >
            <Users class="w-5 h-5" />
          </NuxtLink>

          <!-- Contratos HIC Shortcut -->
          <NuxtLink
            to="/dashboard"
            class="w-10 h-10 rounded-xl hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-700 hover:text-[#D7070D]"
            title="CRM Dashboard"
          >
            <Building2 class="w-5 h-5" />
          </NuxtLink>
        </div>

        <div class="text-[9px] font-mono text-slate-400 rotate-90 pb-4">
          TONY'S
        </div>
      </aside>
    </div>

    <!-- 3. Centered Compose Modal with Backdrop Blur -->
    <div
      v-if="showComposeModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
      @click.self="showComposeModal = false"
    >
      <div
        class="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <!-- Modal Title Bar -->
        <div class="h-14 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <img src="/emblem.png" alt="Tony's Remodeling" class="w-8 h-8 rounded-full object-contain border border-slate-700 bg-white" />
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-black tracking-wide uppercase text-white">New Corporate Message</span>
                <span class="text-[10px] bg-red-600/30 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                  Amazon SES
                </span>
              </div>
              <p class="text-[10px] text-slate-400 font-mono">
                From: {{ currentUser?.name || 'Tony Silva' }} &lt;{{ currentUser?.email || 'tony@tonyspainting.com' }}&gt;
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="showComposeModal = false"
              class="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Fields: Recipient, Lead Selector & Subject -->
        <div class="p-4 sm:p-5 space-y-3 border-b border-slate-100 bg-slate-50/50 text-xs">
          <!-- Recipient Row -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <div class="flex items-center gap-2 flex-1">
              <span class="text-slate-400 w-16 font-bold uppercase text-[10px] shrink-0">To:</span>
              <input
                v-model="composeForm.to"
                type="email"
                placeholder="client@example.com or select a CRM lead on the right"
                class="flex-1 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#D7070D] focus:ring-2 focus:ring-[#D7070D]/20 focus:outline-none text-slate-900 font-semibold"
              />
            </div>

            <!-- Quick Lead Selector Dropdown Button -->
            <div class="relative">
              <button
                type="button"
                @click="showLeadDropdown = !showLeadDropdown"
                class="px-3.5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors shadow-2xs shrink-0"
              >
                <Users class="w-4 h-4 text-blue-600" />
                <span>{{ selectedLeadForCompose ? selectedLeadForCompose.name : 'Link CRM Lead' }}</span>
                <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="showLeadDropdown"
                class="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 space-y-1 max-h-60 overflow-y-auto"
              >
                <div class="px-2 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Active CRM Leads:
                </div>
                <button
                  v-for="l in crmLeads"
                  :key="l.id"
                  @click="selectLeadForCompose(l)"
                  class="w-full text-left px-2.5 py-2 rounded-xl hover:bg-red-50 text-xs flex items-center justify-between transition-colors"
                  :class="composeForm.leadId === l.id ? 'bg-red-50 text-[#D7070D] font-bold' : 'text-slate-800'"
                >
                  <div class="truncate mr-2">
                    <span class="font-bold block truncate">{{ l.name }}</span>
                    <span class="text-[10px] text-slate-400 font-mono">{{ l.email || 'No email provided' }}</span>
                  </div>
                  <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 font-mono">
                    {{ l.city || 'MA' }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Subject Row -->
          <div class="flex items-center gap-2">
            <span class="text-slate-400 w-16 font-bold uppercase text-[10px] shrink-0">Subject:</span>
            <input
              v-model="composeForm.subject"
              type="text"
              placeholder="e.g. Formal Painting Estimate & 5-Year Warranty Terms"
              class="flex-1 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#D7070D] focus:ring-2 focus:ring-[#D7070D]/20 focus:outline-none text-slate-900 font-bold"
            />
          </div>
        </div>

        <!-- AI Copilot Toolbar Bar inside Compose -->
        <div class="px-6 py-2.5 bg-red-50/70 border-b border-red-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span class="font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles class="w-4 h-4 text-[#D7070D]" />
            <span>Tony's Sales AI Copilot:</span>
          </span>
          <div class="flex flex-wrap gap-1.5">
            <button
              @click="aiDraftEmail('quote')"
              :disabled="aiDrafting"
              class="bg-white hover:bg-red-50 text-slate-800 hover:text-[#D7070D] px-3 py-1 rounded-lg font-bold border border-slate-200 hover:border-red-200 transition-colors shadow-2xs"
            >
              📄 Estimate & 5-Yr Warranty
            </button>
            <button
              @click="aiDraftEmail('inspection')"
              :disabled="aiDrafting"
              class="bg-white hover:bg-red-50 text-slate-800 hover:text-[#D7070D] px-3 py-1 rounded-lg font-bold border border-slate-200 hover:border-red-200 transition-colors shadow-2xs"
            >
              📅 Confirm On-Site Walkthrough
            </button>
            <button
              @click="aiDraftEmail('hic_contract')"
              :disabled="aiDrafting"
              class="bg-white hover:bg-red-50 text-slate-800 hover:text-[#D7070D] px-3 py-1 rounded-lg font-bold border border-slate-200 hover:border-red-200 transition-colors shadow-2xs"
            >
              ✍️ MA HIC Contract & 1/3 Deposit
            </button>
          </div>
        </div>

        <!-- Body Area: Spacious and Comfortable -->
        <div class="flex-1 p-6 overflow-y-auto flex flex-col bg-white">
          <textarea
            v-model="composeForm.bodyHtml"
            rows="12"
            placeholder="Write your professional message with project details, scope of work, or client instructions..."
            class="w-full flex-1 min-h-[260px] sm:min-h-[340px] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-y leading-relaxed font-sans"
          ></textarea>
        </div>

        <!-- Bottom Actions Toolbar -->
        <div class="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button
              @click="sendEmail"
              :disabled="sending"
              class="w-full sm:w-auto bg-gradient-to-r from-[#D7070D] to-[#B0050A] hover:from-[#B0050A] hover:to-[#900408] text-white text-xs font-black uppercase tracking-wider px-7 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-red-950/25 active:scale-95"
            >
              <span>{{ sending ? 'Dispatching via Amazon SES...' : 'Send Message' }}</span>
              <Send class="w-4 h-4" />
            </button>

            <button
              @click="showComposeModal = false"
              type="button"
              class="px-4 py-3 rounded-xl hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors"
            >
              Discard
            </button>
          </div>

          <div class="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
            <span>🔒 TLS Encryption • DKIM Verified @tonyspainting.com</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Menu,
  Search,
  Settings,
  Sparkles,
  PenSquare,
  Inbox,
  Star,
  Send,
  FileText,
  Mail,
  Trash2,
  Users,
  Calendar,
  ClipboardCheck,
  Building2,
  DollarSign,
  ArrowLeft,
  Reply,
  RotateCw,
  Square,
  CheckSquare,
  X,
  UserPlus,
  ExternalLink,
  ChevronDown
} from 'lucide-vue-next'
import { useWorkspaceAuth } from '~/composables/useWorkspaceAuth'

definePageMeta({
  layout: false
})

const {
  currentUser,
  isMaster,
  isCeo,
  isManager,
  isSales,
  isFieldWorker,
  canAccessSettings,
  teamUsers,
  fetchAuth,
  switchUser
} = useWorkspaceAuth()

const roleTitle = computed(() => {
  if (isMaster.value) return 'MASTER ADMINISTRATOR'
  if (isCeo.value) return 'CEO & GENERAL MANAGER'
  if (isFieldWorker.value) return 'FIELD CREW'
  return 'SALES ESTIMATOR'
})

const roleIcon = computed(() => {
  if (isMaster.value) return '🛡️'
  if (isCeo.value) return '👑'
  if (isFieldWorker.value) return '👷'
  return '👤'
})

const roleBadgeHeader = computed(() => {
  if (isMaster.value) return 'bg-amber-50 text-amber-800 border border-amber-200'
  if (isCeo.value) return 'bg-purple-50 text-purple-800 border border-purple-200'
  if (isFieldWorker.value) return 'bg-blue-50 text-blue-700 border border-blue-200'
  return 'bg-emerald-50 text-emerald-800 border border-emerald-200'
})

const sidebarCollapsed = ref(false)
const showProfileMenu = ref(false)
const selectAll = ref(false)
const selectedEmailIds = ref([])
const activeFilterChip = ref('ALL')

const emails = ref([])
const crmLeads = ref([])
const showLeadDropdown = ref(false)
const selectedLeadForCompose = ref(null)

const stats = ref({
  inboxTotal: 0,
  inboxUnread: 0,
  sentTotal: 0,
  starredTotal: 0,
  draftsTotal: 0,
  crmLeadsTotal: 0,
  crmEstimatesTotal: 0,
  crmContractsTotal: 0,
  crmPaymentsTotal: 0
})

const activeFolder = ref('INBOX')
const searchQuery = ref('')
const loading = ref(false)

const selectedEmail = ref(null)
const replyText = ref('')
const sendingReply = ref(false)
const generatingAI = ref(false)
const convertingLead = ref(false)

const showComposeModal = ref(false)
const sending = ref(false)
const aiDrafting = ref(false)

const composeForm = ref({
  to: '',
  leadId: null,
  subject: '',
  bodyHtml: ''
})

onMounted(async () => {
  await fetchAuth()
  await fetchEmails()
  await fetchCrmLeads()
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
})

function handleKeydown(e) {
  if (e.key === 'Escape' && showComposeModal.value) {
    showComposeModal.value = false
    showLeadDropdown.value = false
  }
}

async function fetchCrmLeads() {
  try {
    const res = await $fetch('/api/leads')
    if (res?.leads) {
      crmLeads.value = res.leads
    }
  } catch (err) {
    console.error('Failed to load leads for selector:', err)
  }
}

async function fetchEmails() {
  loading.value = true
  try {
    const res = await $fetch('/api/mail', {
      params: {
        folder: activeFolder.value,
        search: searchQuery.value
      }
    })
    if (res?.success) {
      emails.value = res.emails || []
      if (res.stats) {
        stats.value = { ...stats.value, ...res.stats }
      }
    }
  } catch (err) {
    console.error('Failed to fetch corporate emails:', err)
  } finally {
    loading.value = false
  }
}

function setFolder(folder) {
  activeFolder.value = folder
  selectedEmail.value = null
  fetchEmails()
}

function openEmail(mail) {
  selectedEmail.value = mail
  if (!mail.read) {
    toggleRead(mail, true)
  }
}

async function toggleStar(mail) {
  mail.starred = !mail.starred
  try {
    await $fetch('/api/mail/mark-read', {
      method: 'POST',
      body: { emailId: mail.id, starred: mail.starred }
    })
    if (mail.starred) {
      stats.value.starredTotal++
    } else {
      stats.value.starredTotal = Math.max(0, stats.value.starredTotal - 1)
    }
  } catch (err) {
    console.error('Failed to star email:', err)
  }
}

async function toggleRead(mail, forceRead = null) {
  const newStatus = forceRead !== null ? forceRead : !mail.read
  mail.read = newStatus
  try {
    await $fetch('/api/mail/mark-read', {
      method: 'POST',
      body: { emailId: mail.id, read: newStatus }
    })
    if (newStatus) {
      stats.value.inboxUnread = Math.max(0, stats.value.inboxUnread - 1)
    }
  } catch (err) {
    console.error('Failed to update read status:', err)
  }
}

function toggleSelectAll() {
  if (selectedEmailIds.value.length === emails.value.length && emails.value.length > 0) {
    selectedEmailIds.value = []
  } else {
    selectedEmailIds.value = emails.value.map(e => e.id)
  }
}

function toggleSelectEmail(id) {
  if (selectedEmailIds.value.includes(id)) {
    selectedEmailIds.value = selectedEmailIds.value.filter(x => x !== id)
  } else {
    selectedEmailIds.value.push(id)
  }
}

async function bulkDeleteSelected() {
  if (selectedEmailIds.value.length === 0) return

  const count = selectedEmailIds.value.length
  const confirmMsg = `Are you sure you want to delete ${count} selected message(s)?`
  if (typeof window !== 'undefined' && !window.confirm(confirmMsg)) {
    return
  }

  const idsToDelete = [...selectedEmailIds.value]
  try {
    const res = await $fetch('/api/mail/bulk-delete', {
      method: 'POST',
      body: {
        emailIds: idsToDelete,
        folder: activeFolder.value
      }
    })

    if (res?.success) {
      emails.value = emails.value.filter(e => !idsToDelete.includes(e.id))
      if (selectedEmail.value && idsToDelete.includes(selectedEmail.value.id)) {
        selectedEmail.value = null
      }
      selectedEmailIds.value = []
      alert(res.message || `${count} message(s) deleted successfully!`)
      await fetchEmails()
    }
  } catch (err) {
    console.error('Failed to bulk delete emails:', err)
    alert('Error deleting selected messages.')
  }
}

async function bulkMarkRead(read = true) {
  if (selectedEmailIds.value.length === 0) return

  for (const id of selectedEmailIds.value) {
    const mail = emails.value.find(e => e.id === id)
    if (mail) {
      mail.read = read
      try {
        await $fetch('/api/mail/mark-read', {
          method: 'POST',
          body: { emailId: id, read }
        })
      } catch (err) {
        console.error(`Failed to mark read for email ${id}:`, err)
      }
    }
  }
  selectedEmailIds.value = []
  await fetchEmails()
}

async function deleteEmail(emailId) {
  try {
    await $fetch('/api/mail/bulk-delete', {
      method: 'POST',
      body: {
        emailIds: [emailId],
        folder: activeFolder.value
      }
    })
  } catch (err) {
    console.error('Failed to delete email on server:', err)
  }

  emails.value = emails.value.filter(e => e.id !== emailId)
  selectedEmailIds.value = selectedEmailIds.value.filter(x => x !== emailId)
  if (selectedEmail.value?.id === emailId) {
    selectedEmail.value = null
  }
}

async function convertEmailToLead(mail) {
  if (!mail) return
  convertingLead.value = true
  try {
    const res = await $fetch('/api/mail/convert-lead', {
      method: 'POST',
      body: { emailId: mail.id }
    })
    if (res?.success && res.lead) {
      mail.lead = res.lead
      mail.leadId = res.lead.id
      stats.value.crmLeadsTotal++
      alert(`Lead "${res.lead.name}" registered successfully in Tony's CRM!`)
    }
  } catch (err) {
    console.error('Failed to convert lead:', err)
    alert('Error converting email to lead.')
  } finally {
    convertingLead.value = false
  }
}

function getSnippet(html) {
  if (!html) return ''
  const text = html.replace(/<[^>]*>?/gm, '')
  return text.trim()
}

function formatEmailDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function openComposeModal() {
  composeForm.value = {
    to: '',
    leadId: null,
    subject: '',
    bodyHtml: ''
  }
  selectedLeadForCompose.value = null
  showLeadDropdown.value = false
  showComposeModal.value = true
}

function selectLeadForCompose(lead) {
  if (!lead) return
  selectedLeadForCompose.value = lead
  composeForm.value.to = lead.email || ''
  composeForm.value.leadId = lead.id
  if (!composeForm.value.subject) {
    composeForm.value.subject = `Tony's Painting: Estimate & Scope - ${lead.name}`
  }
  showLeadDropdown.value = false
}

async function aiDraftEmail(type) {
  aiDrafting.value = true
  try {
    if (type === 'quote') {
      composeForm.value.subject = "Tony's Remodeling: Formal Estimate & 5-Year Warranty"
      composeForm.value.bodyHtml = `<p>Hi there,</p><p>Thank you for contacting Tony's Painting and Remodeling. We have prepared your complete residential painting estimate with full preparation (power washing, scraping, primer) plus 2 finish coats of premium Benjamin Moore paint.</p><p>Best regards,<br>${currentUser.value?.name || 'Tony Silva'}<br>Tony's Painting and Remodeling Corp.</p>`
    } else if (type === 'inspection') {
      composeForm.value.subject = "Tony's Remodeling: Confirming Your Free In-Home Estimate"
      composeForm.value.bodyHtml = `<p>Hello,</p><p>We have an estimator available in your area this week. Would Thursday at 2:00 PM work for a free 15-minute walk-through and instant quote?</p><p>Warmly,<br>${currentUser.value?.name || 'Tony Silva'}</p>`
    } else if (type === 'hic_contract') {
      composeForm.value.subject = "Tony's Remodeling: MA Home Improvement Agreement & Deposit Receipt"
      composeForm.value.bodyHtml = `<p>Hello,</p><p>Attached is your Massachusetts HIC Agreement (M.G.L. c. 142A) with the 1/3 deposit terms and full scope of work. We look forward to transforming your property!</p><p>Tony Silva</p>`
    }
  } finally {
    aiDrafting.value = false
  }
}

async function generateAIReply(type) {
  generatingAI.value = true
  try {
    if (type === 'commercial_quote') {
      replyText.value = `Hi ${selectedEmail.value?.from},\n\nThank you for reaching out to Tony's Painting and Remodeling. Yes, our 5-year written warranty explicitly covers trim adhesion, moisture protection, and peeling in Massachusetts climates.\n\nWe would be delighted to lock in your start date. I will have our office dispatch the formal MA HIC agreement with the 1/3 deposit link.\n\nBest regards,\n${currentUser.value?.name || 'Tony Silva'}`
    } else if (type === 'schedule_estimate') {
      replyText.value = `Hi ${selectedEmail.value?.from},\n\nWe have your address logged in our dispatch calendar for Thursday at 2:00 PM. Our senior estimator will arrive with samples and provide an on-the-spot written quote.\n\nSee you Thursday!\n${currentUser.value?.name || 'Tony Silva'}`
    } else {
      replyText.value = `Hello ${selectedEmail.value?.from},\n\nThank you for the update! All prep work, replacement of rotted boards, and elastomeric caulking are fully accounted for in our Massachusetts HIC Agreement (MA HIC #204891).\n\nWarmly,\n${currentUser.value?.name || 'Tony Silva'}`
    }
  } finally {
    generatingAI.value = false
  }
}

async function sendQuickReply() {
  if (!replyText.value.trim() || !selectedEmail.value) return
  sendingReply.value = true
  try {
    await $fetch('/api/mail/send', {
      method: 'POST',
      body: {
        to: selectedEmail.value.from,
        subject: `Re: ${selectedEmail.value.subject}`,
        bodyHtml: `<p>${replyText.value.replace(/\n/g, '<br>')}</p>`,
        leadId: selectedEmail.value.leadId
      }
    })
    replyText.value = ''
    alert('Reply sent successfully via Amazon SES!')
  } catch (err) {
    console.error('Failed to send reply:', err)
  } finally {
    sendingReply.value = false
  }
}

async function sendEmail() {
  if (!composeForm.value.to || !composeForm.value.subject) {
    alert('Please provide both recipient and subject!')
    return
  }
  sending.value = true
  try {
    const res = await $fetch('/api/mail/send', {
      method: 'POST',
      body: composeForm.value
    })
    if (res?.success) {
      showComposeModal.value = false
      alert('Corporate email sent successfully via Amazon SES!')
      await fetchEmails()
    }
  } catch (err) {
    console.error('Failed to send email:', err)
  } finally {
    sending.value = false
  }
}
</script>
