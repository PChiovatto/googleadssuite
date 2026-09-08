<template>
  <div class="h-screen w-screen flex flex-col bg-white font-sans text-[#1f1f1f] overflow-hidden select-none">
    <!-- 1. Top Header Bar (Authentic Gmail Layout) -->
    <header class="h-16 px-4 flex items-center justify-between shrink-0 bg-white border-b border-transparent z-20">
      <!-- Left: Hamburger + Gmail Logo + Return to CRM -->
      <div class="flex items-center gap-3 min-w-[240px]">
        <button
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="p-2.5 hover:bg-slate-100 rounded-full text-[#444746] transition-colors"
          title="Menu principal"
        >
          <Menu class="w-5 h-5" />
        </button>

        <!-- Gmail Logo (SVG 4 colors) -->
        <div class="flex items-center gap-2 cursor-pointer" @click="setFolder('INBOX')">
          <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none">
            <path d="M1.5 5.5V18.5C1.5 19.6 2.4 20.5 3.5 20.5H6.5V10.5L12 14.5L17.5 10.5V20.5H20.5C21.6 20.5 22.5 19.6 22.5 18.5V5.5C22.5 4.4 21.6 3.5 20.5 3.5H19.5L12 9.5L4.5 3.5H3.5C2.4 3.5 1.5 4.4 1.5 5.5Z" fill="#EA4335"/>
            <path d="M1.5 5.5L12 14.5L22.5 5.5V5C22.5 3.9 21.6 3 20.5 3H3.5C2.4 3 1.5 3.9 1.5 5V5.5Z" fill="#EA4335"/>
            <path d="M1.5 5.5V18.5C1.5 19.6 2.4 20.5 3.5 20.5H6.5V10.5L1.5 6.5V5.5Z" fill="#4285F4"/>
            <path d="M22.5 5.5V18.5C22.5 19.6 21.6 20.5 20.5 20.5H17.5V10.5L22.5 6.5V5.5Z" fill="#34A853"/>
            <path d="M17.5 10.5L12 14.5L6.5 10.5V20.5H17.5V10.5Z" fill="#FBBC04"/>
          </svg>
          <span class="text-[22px] font-medium text-[#5f6368] tracking-tight font-sans">Gmail</span>
        </div>

        <!-- Quick Switcher Back to CRM -->
        <NuxtLink
          to="/dashboard/leads"
          class="ml-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
          title="Alternar para o Kanban de Leads do CRM"
        >
          <span>← CRM Tony's</span>
        </NuxtLink>
      </div>

      <!-- Center: Pill Search Bar ("Ask Gmail") -->
      <div class="flex-1 max-w-2xl px-4">
        <div class="relative flex items-center bg-[#eaf1fb] hover:bg-[#e3ecfa] focus-within:bg-white focus-within:shadow-md rounded-full px-4 py-2.5 transition-all">
          <Search class="w-5 h-5 text-[#444746] shrink-0" />
          <input
            v-model="searchQuery"
            @input="fetchEmails"
            type="text"
            placeholder="Ask Gmail"
            class="w-full bg-transparent pl-3 pr-8 text-sm text-[#1f1f1f] placeholder:text-[#444746] focus:outline-none"
          />
          <button class="absolute right-3 p-1 text-[#444746] hover:bg-slate-200/60 rounded-full transition-colors" title="Opções de pesquisa">
            <SlidersHorizontal class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Right: Action Icons & User Profile Avatar -->
      <div class="flex items-center gap-1.5 shrink-0">
        <button class="p-2 hover:bg-slate-100 text-[#444746] rounded-full transition-colors" title="Ajuda">
          <HelpCircle class="w-5 h-5" />
        </button>
        <button class="p-2 hover:bg-slate-100 text-[#444746] rounded-full transition-colors" title="Configurações">
          <Settings class="w-5 h-5" />
        </button>
        <button @click="openGeminiDrawer = !openGeminiDrawer" class="p-2 hover:bg-slate-100 rounded-full transition-colors" title="Assistente Gemini AI">
          <Sparkles class="w-5 h-5 text-indigo-600 animate-pulse" />
        </button>
        <button class="p-2 hover:bg-slate-100 text-[#444746] rounded-full transition-colors" title="Google Apps">
          <Grid class="w-5 h-5" />
        </button>

        <!-- Profile Avatar & RBAC Switcher -->
        <div class="relative ml-2">
          <button
            @click="showProfileMenu = !showProfileMenu"
            class="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs border-2 border-white hover:ring-2 hover:ring-blue-400 transition-all overflow-hidden"
          >
            <img v-if="currentUser?.avatarUrl" :src="currentUser.avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
            <span v-else>{{ currentUser?.name?.charAt(0) || 'P' }}</span>
          </button>

          <!-- Profile Dropdown Card -->
          <div v-if="showProfileMenu" class="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 space-y-3">
            <div class="text-center pb-3 border-b border-slate-100">
              <div class="w-14 h-14 mx-auto rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center mb-2 overflow-hidden shadow-inner">
                <img v-if="currentUser?.avatarUrl" :src="currentUser.avatarUrl" class="w-full h-full object-cover" />
                <span v-else>{{ currentUser?.name?.charAt(0) || 'P' }}</span>
              </div>
              <h4 class="font-bold text-sm text-slate-900">{{ currentUser?.name || 'Paulo Chiovatto' }}</h4>
              <p class="text-xs text-slate-500 font-mono">{{ currentUser?.email || 'tony@tonyspainting.com' }}</p>
              <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider" :class="isManager ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'">
                {{ isManager ? '👑 GESTOR GERAL' : '👤 CONSULTOR' }}
              </span>
            </div>

            <!-- Team RBAC Switcher -->
            <div class="space-y-1">
              <span class="text-[11px] font-bold text-slate-500 uppercase">Alternar Usuário (RBAC):</span>
              <div class="space-y-1 max-h-40 overflow-y-auto">
                <button
                  v-for="u in teamUsers"
                  :key="u.id"
                  @click="switchUser(u.id); showProfileMenu = false"
                  class="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 flex items-center justify-between transition-colors"
                  :class="currentUser?.id === u.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'"
                >
                  <span class="truncate">{{ u.name }}</span>
                  <span class="text-[9px] font-mono text-slate-400 shrink-0">{{ u.role }}</span>
                </button>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-100 flex gap-2">
              <NuxtLink to="/dashboard" class="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2 rounded-xl font-bold transition-colors">Painel Geral</NuxtLink>
              <button @click="showProfileMenu = false" class="flex-1 text-center bg-black hover:bg-slate-800 text-white text-xs py-2 rounded-xl font-bold transition-colors">Fechar</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 2. Main Body Split: Left Drawer + Center Email View + Right Workspace Rail -->
    <div class="flex-1 flex overflow-hidden">
      <!-- A. Left Gmail Navigation Drawer -->
      <aside
        class="h-full flex flex-col justify-between shrink-0 transition-all duration-200 overflow-y-auto py-2 px-3"
        :class="sidebarCollapsed ? 'w-20' : 'w-64'"
      >
        <div class="space-y-3">
          <!-- Compose Button (Pill Style) -->
          <button
            @click="openComposeModal"
            class="flex items-center gap-3.5 bg-[#c2e7ff] hover:bg-[#b3ddfc] hover:shadow-md text-[#001d35] font-medium text-sm py-4 rounded-2xl transition-all shadow-xs"
            :class="sidebarCollapsed ? 'px-4 justify-center' : 'px-6 w-full'"
            title="Compose"
          >
            <PenSquare class="w-5 h-5 text-[#001d35] shrink-0" />
            <span v-if="!sidebarCollapsed" class="font-semibold tracking-wide">Compose</span>
          </button>

          <!-- Main Mail Folders -->
          <nav class="space-y-0.5 text-sm font-medium text-[#444746]">
            <!-- Inbox -->
            <button
              @click="setFolder('INBOX')"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-full transition-colors text-left"
              :class="activeFolder === 'INBOX' ? 'bg-[#d3e3fd] text-[#001d35] font-bold' : 'hover:bg-[#eaebef] text-[#444746]'"
              title="Inbox"
            >
              <div class="flex items-center gap-4">
                <Inbox class="w-5 h-5 shrink-0" :class="activeFolder === 'INBOX' ? 'text-[#001d35]' : 'text-[#444746]'" />
                <span v-if="!sidebarCollapsed">Inbox</span>
              </div>
              <span v-if="!sidebarCollapsed" class="text-xs font-bold text-[#001d35]">
                {{ stats.inboxUnread || 79 }}
              </span>
            </button>

            <!-- AI Inbox -->
            <button
              @click="setFolder('AI_INBOX')"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-full transition-colors text-left"
              :class="activeFolder === 'AI_INBOX' ? 'bg-[#d3e3fd] text-[#001d35] font-bold' : 'hover:bg-[#eaebef] text-[#444746]'"
              title="AI Inbox"
            >
              <div class="flex items-center gap-4">
                <Sparkles class="w-5 h-5 text-indigo-600 shrink-0" />
                <span v-if="!sidebarCollapsed">AI Inbox</span>
              </div>
            </button>

            <!-- Starred -->
            <button
              @click="setFolder('STARRED')"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-full transition-colors text-left"
              :class="activeFolder === 'STARRED' ? 'bg-[#d3e3fd] text-[#001d35] font-bold' : 'hover:bg-[#eaebef] text-[#444746]'"
              title="Starred"
            >
              <div class="flex items-center gap-4">
                <Star class="w-5 h-5 shrink-0" :class="activeFolder === 'STARRED' ? 'text-[#001d35]' : 'text-[#444746]'" />
                <span v-if="!sidebarCollapsed">Starred</span>
              </div>
            </button>

            <!-- Snoozed -->
            <button
              @click="setFolder('SNOOZED')"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-full transition-colors text-left"
              :class="activeFolder === 'SNOOZED' ? 'bg-[#d3e3fd] text-[#001d35] font-bold' : 'hover:bg-[#eaebef] text-[#444746]'"
              title="Snoozed"
            >
              <div class="flex items-center gap-4">
                <Clock class="w-5 h-5 shrink-0" />
                <span v-if="!sidebarCollapsed">Snoozed</span>
              </div>
            </button>

            <!-- Important -->
            <button
              @click="setFolder('IMPORTANT')"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-full transition-colors text-left"
              :class="activeFolder === 'IMPORTANT' ? 'bg-[#d3e3fd] text-[#001d35] font-bold' : 'hover:bg-[#eaebef] text-[#444746]'"
              title="Important"
            >
              <div class="flex items-center gap-4">
                <Bookmark class="w-5 h-5 shrink-0" />
                <span v-if="!sidebarCollapsed">Important</span>
              </div>
            </button>

            <!-- Sent -->
            <button
              @click="setFolder('SENT')"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-full transition-colors text-left"
              :class="activeFolder === 'SENT' ? 'bg-[#d3e3fd] text-[#001d35] font-bold' : 'hover:bg-[#eaebef] text-[#444746]'"
              title="Sent"
            >
              <div class="flex items-center gap-4">
                <Send class="w-5 h-5 shrink-0" />
                <span v-if="!sidebarCollapsed">Sent</span>
              </div>
              <span v-if="!sidebarCollapsed && stats.sentTotal" class="text-xs text-slate-400 font-mono">
                {{ stats.sentTotal }}
              </span>
            </button>

            <!-- Drafts -->
            <button
              @click="setFolder('DRAFTS')"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-full transition-colors text-left"
              :class="activeFolder === 'DRAFTS' ? 'bg-[#d3e3fd] text-[#001d35] font-bold' : 'hover:bg-[#eaebef] text-[#444746]'"
              title="Drafts"
            >
              <div class="flex items-center gap-4">
                <FileText class="w-5 h-5 shrink-0" />
                <span v-if="!sidebarCollapsed">Drafts</span>
              </div>
            </button>

            <!-- All Mail -->
            <button
              @click="setFolder('ALL')"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-full transition-colors text-left"
              :class="activeFolder === 'ALL' ? 'bg-[#d3e3fd] text-[#001d35] font-bold' : 'hover:bg-[#eaebef] text-[#444746]'"
              title="All Mail"
            >
              <div class="flex items-center gap-4">
                <Mail class="w-5 h-5 shrink-0" />
                <span v-if="!sidebarCollapsed">All Mail</span>
              </div>
            </button>

            <!-- Spam -->
            <button
              @click="setFolder('SPAM')"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-full transition-colors text-left"
              :class="activeFolder === 'SPAM' ? 'bg-[#d3e3fd] text-[#001d35] font-bold' : 'hover:bg-[#eaebef] text-[#444746]'"
              title="Spam"
            >
              <div class="flex items-center gap-4">
                <AlertOctagon class="w-5 h-5 shrink-0" />
                <span v-if="!sidebarCollapsed">Spam</span>
              </div>
              <span v-if="!sidebarCollapsed" class="text-xs font-bold text-slate-500">
                {{ stats.spamTotal || 267 }}
              </span>
            </button>

            <!-- Trash -->
            <button
              @click="setFolder('TRASH')"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-full transition-colors text-left"
              :class="activeFolder === 'TRASH' ? 'bg-[#d3e3fd] text-[#001d35] font-bold' : 'hover:bg-[#eaebef] text-[#444746]'"
              title="Trash"
            >
              <div class="flex items-center gap-4">
                <Trash2 class="w-5 h-5 shrink-0" />
                <span v-if="!sidebarCollapsed">Trash</span>
              </div>
            </button>

            <!-- Categories Section (Matching screenshot!) -->
            <div v-if="!sidebarCollapsed" class="pt-2">
              <button
                @click="setFolder('PURCHASES')"
                class="w-full flex items-center justify-between px-4 py-2 rounded-full transition-colors text-left"
                :class="activeFolder === 'PURCHASES' ? 'bg-[#d3e3fd] text-[#001d35] font-bold' : 'hover:bg-[#eaebef] text-[#444746]'"
              >
                <div class="flex items-center gap-4">
                  <ShoppingBag class="w-4 h-4 shrink-0 text-slate-500" />
                  <span>Purchases</span>
                </div>
                <span class="text-xs text-slate-500 font-bold">6</span>
              </button>

              <button
                @click="setFolder('SOCIAL')"
                class="w-full flex items-center justify-between px-4 py-2 rounded-full transition-colors text-left"
                :class="activeFolder === 'SOCIAL' ? 'bg-[#d3e3fd] text-[#001d35] font-bold' : 'hover:bg-[#eaebef] text-[#444746]'"
              >
                <div class="flex items-center gap-4">
                  <Users class="w-4 h-4 shrink-0 text-slate-500" />
                  <span>Social</span>
                </div>
              </button>

              <button
                @click="setFolder('UPDATES')"
                class="w-full flex items-center justify-between px-4 py-2 rounded-full transition-colors text-left"
                :class="activeFolder === 'UPDATES' ? 'bg-[#d3e3fd] text-[#001d35] font-bold' : 'hover:bg-[#eaebef] text-[#444746]'"
              >
                <div class="flex items-center gap-4">
                  <Bell class="w-4 h-4 shrink-0 text-slate-500" />
                  <span>Updates</span>
                </div>
                <span class="text-xs text-slate-500 font-bold">72</span>
              </button>

              <button
                @click="setFolder('FORUMS')"
                class="w-full flex items-center justify-between px-4 py-2 rounded-full transition-colors text-left"
                :class="activeFolder === 'FORUMS' ? 'bg-[#d3e3fd] text-[#001d35] font-bold' : 'hover:bg-[#eaebef] text-[#444746]'"
              >
                <div class="flex items-center gap-4">
                  <MessageSquare class="w-4 h-4 shrink-0 text-slate-500" />
                  <span>Forums</span>
                </div>
              </button>

              <button
                @click="setFolder('PROMOTIONS')"
                class="w-full flex items-center justify-between px-4 py-2 rounded-full transition-colors text-left"
                :class="activeFolder === 'PROMOTIONS' ? 'bg-[#d3e3fd] text-[#001d35] font-bold' : 'hover:bg-[#eaebef] text-[#444746]'"
              >
                <div class="flex items-center gap-4">
                  <Tag class="w-4 h-4 shrink-0 text-slate-500" />
                  <span>Promotions</span>
                </div>
                <span class="text-xs text-slate-500 font-bold">77</span>
              </button>

              <!-- More toggle -->
              <button
                @click="showMoreFolders = !showMoreFolders"
                class="w-full flex items-center gap-4 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-[#eaebef] rounded-full transition-colors"
              >
                <ChevronDown v-if="!showMoreFolders" class="w-4 h-4" />
                <ChevronUp v-else class="w-4 h-4" />
                <span>{{ showMoreFolders ? 'Less' : 'More' }}</span>
              </button>
            </div>

            <!-- Labels Section (Matching screenshot!) -->
            <div v-if="!sidebarCollapsed" class="pt-4 border-t border-slate-200/80">
              <div class="flex items-center justify-between px-4 mb-1">
                <span class="text-sm font-bold text-slate-800">Labels</span>
                <button class="p-1 hover:bg-slate-200 rounded-full transition-colors" title="Criar novo marcador">
                  <Plus class="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <div class="space-y-0.5">
                <button
                  @click="searchQuery = 'Notes'; fetchEmails()"
                  class="w-full flex items-center gap-4 px-4 py-2 rounded-full hover:bg-[#eaebef] text-sm text-[#444746] transition-colors"
                >
                  <Folder class="w-4 h-4 text-slate-500" />
                  <span>Notes</span>
                </button>
                <button
                  @click="searchQuery = 'Paulo'; fetchEmails()"
                  class="w-full flex items-center gap-4 px-4 py-2 rounded-full hover:bg-[#eaebef] text-sm text-[#444746] transition-colors"
                >
                  <Folder class="w-4 h-4 text-slate-500" />
                  <span>Paulo</span>
                </button>
                <button
                  @click="searchQuery = 'Tony'; fetchEmails()"
                  class="w-full flex items-center gap-4 px-4 py-2 rounded-full hover:bg-[#eaebef] text-sm text-[#444746] transition-colors"
                >
                  <Folder class="w-4 h-4 text-orange-500" />
                  <span>Tony's Painting</span>
                </button>
              </div>
            </div>
          </nav>
        </div>

        <!-- SES Infrastructure Status Badge -->
        <div v-if="!sidebarCollapsed" class="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] space-y-1">
          <div class="flex items-center justify-between font-bold text-slate-800">
            <span>Amazon SES</span>
            <span class="text-emerald-600 flex items-center gap-1 font-semibold text-[10px]">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Conectado
            </span>
          </div>
          <p class="text-slate-500 text-[10px] leading-tight">
            Envio e recebimento oficial via @tonyspainting.com com taxa de entrega 99.8%.
          </p>
        </div>
      </aside>

      <!-- B. Center Column: Full-Width Email Rows Table OR Reader View -->
      <main class="flex-1 flex flex-col min-w-0 bg-[#f6f8fc] rounded-2xl mx-1 my-1 overflow-hidden shadow-xs border border-slate-200/60">
        <!-- MODE 1: Email Thread Reader -->
        <div v-if="selectedEmail" class="flex-1 flex flex-col bg-white overflow-hidden">
          <!-- Reader Top Action Bar -->
          <div class="h-12 px-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
            <div class="flex items-center gap-2">
              <button
                @click="selectedEmail = null"
                class="p-2 hover:bg-slate-100 rounded-full text-slate-700 transition-colors"
                title="Voltar para Caixa de Entrada"
              >
                <ArrowLeft class="w-5 h-5" />
              </button>

              <div class="h-5 w-px bg-slate-200 mx-1"></div>

              <button @click="selectedEmail = null" class="p-2 hover:bg-slate-100 rounded-full text-slate-700 transition-colors" title="Arquivar">
                <Archive class="w-4 h-4" />
              </button>
              <button class="p-2 hover:bg-slate-100 rounded-full text-slate-700 transition-colors" title="Denunciar spam">
                <AlertOctagon class="w-4 h-4" />
              </button>
              <button @click="deleteEmail(selectedEmail.id)" class="p-2 hover:bg-slate-100 rounded-full text-slate-700 transition-colors" title="Excluir">
                <Trash2 class="w-4 h-4" />
              </button>
              <button @click="toggleRead(selectedEmail)" class="p-2 hover:bg-slate-100 rounded-full text-slate-700 transition-colors" title="Marcar como não lida">
                <Mail class="w-4 h-4" />
              </button>
              <button class="p-2 hover:bg-slate-100 rounded-full text-slate-700 transition-colors" title="Adiar">
                <Clock class="w-4 h-4" />
              </button>
            </div>

            <div class="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>{{ new Date(selectedEmail.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
            </div>
          </div>

          <!-- Reader Scrollable Content -->
          <div class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <!-- Subject Line with Category Badge -->
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <h1 class="text-xl sm:text-2xl font-normal text-[#1f1f1f] leading-snug">
                  {{ selectedEmail.subject }}
                </h1>
                <div class="flex flex-wrap items-center gap-2 pt-1">
                  <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">
                    {{ selectedEmail.folder || 'Inbox' }}
                  </span>
                  <span v-if="selectedEmail.lead" class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    Lead CRM: {{ selectedEmail.lead.name }} ({{ selectedEmail.lead.city || 'MA' }})
                  </span>
                </div>
              </div>

              <!-- Quick star in thread -->
              <button
                @click="toggleStar(selectedEmail)"
                class="p-2 hover:bg-slate-100 rounded-full transition-colors text-xl"
                :class="selectedEmail.starred ? 'text-[#fbbc04]' : 'text-slate-300'"
              >
                ★
              </button>
            </div>

            <!-- Linked Lead CRM Context Box -->
            <div
              v-if="selectedEmail.lead"
              class="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-extrabold text-sm">{{ selectedEmail.lead.name }}</span>
                  <span class="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">
                    {{ selectedEmail.lead.status }}
                  </span>
                </div>
                <p class="text-xs text-slate-300">
                  {{ selectedEmail.lead.serviceInterested || 'Pintura Residencial' }} • {{ selectedEmail.lead.city || 'Massachusetts' }} • Estimativa: ${{ selectedEmail.lead.dealValue?.toLocaleString() || '8,500' }}
                </p>
              </div>

              <NuxtLink
                to="/dashboard/leads"
                class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 text-center"
              >
                Abrir no Funil CRM →
              </NuxtLink>
            </div>

            <!-- Sender Header Card -->
            <div class="flex items-start justify-between gap-4 pt-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {{ selectedEmail.from.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-[#1f1f1f]">{{ selectedEmail.from }}</span>
                    <span class="text-xs text-slate-500">&lt;{{ selectedEmail.from.toLowerCase().replace(/\s+/g, '') }}&gt;</span>
                  </div>
                  <div class="text-xs text-slate-500 flex items-center gap-1">
                    <span>para mim</span>
                    <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              <span class="text-xs text-slate-500 font-mono">
                {{ new Date(selectedEmail.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
              </span>
            </div>

            <!-- Email Body Content -->
            <div class="py-4 text-[#1f1f1f] text-sm leading-relaxed max-w-4xl prose prose-slate" v-html="selectedEmail.body">
            </div>

            <!-- Quick Reply / Copiloto IA Box -->
            <div class="mt-8 pt-6 border-t border-slate-200 space-y-4 max-w-4xl">
              <!-- AI Quick Copilot Action Pills -->
              <div class="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 space-y-2">
                <div class="flex items-center justify-between text-xs font-bold text-indigo-900">
                  <span class="flex items-center gap-1.5">
                    <Sparkles class="w-4 h-4 text-indigo-600" />
                    <span>Copiloto de Redação IA (GPT-4o / Claude 3.5):</span>
                  </span>
                  <span class="text-[10px] text-indigo-500 font-normal">Clique para gerar resposta contextual</span>
                </div>

                <div class="flex flex-wrap gap-2">
                  <button
                    @click="generateAIReply('commercial_quote')"
                    :disabled="generatingAI"
                    class="bg-white hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-indigo-200 transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>📄 Orçamento de Pintura & Garantia 5 Anos</span>
                  </button>
                  <button
                    @click="generateAIReply('schedule_estimate')"
                    :disabled="generatingAI"
                    class="bg-white hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-indigo-200 transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>📅 Confirmar Vistoria no Local (Newton/MA)</span>
                  </button>
                  <button
                    @click="generateAIReply('friendly_followup')"
                    :disabled="generatingAI"
                    class="bg-white hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-indigo-200 transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>✨ Follow-up Cortês & Contrato MA HIC</span>
                  </button>
                </div>
              </div>

              <!-- Reply Input Box -->
              <div class="border border-slate-300 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                <div class="flex items-center gap-2 text-xs text-slate-500">
                  <Reply class="w-4 h-4 text-slate-600" />
                  <span>Responder para <strong>{{ selectedEmail.from }}</strong></span>
                </div>

                <textarea
                  v-model="replyText"
                  rows="4"
                  placeholder="Escreva sua resposta aqui ou use o Copiloto IA acima..."
                  class="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-y"
                ></textarea>

                <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    @click="sendQuickReply"
                    :disabled="sendingReply || !replyText.trim()"
                    class="bg-[#0b57d0] hover:bg-[#0842a0] text-white px-5 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <span>{{ sendingReply ? 'Enviando...' : 'Enviar' }}</span>
                    <Send class="w-3.5 h-3.5" />
                  </button>

                  <div class="flex items-center gap-2 text-slate-400">
                    <button class="p-1.5 hover:bg-slate-100 rounded-full"><Paperclip class="w-4 h-4" /></button>
                    <button class="p-1.5 hover:bg-slate-100 rounded-full"><Smile class="w-4 h-4" /></button>
                    <button class="p-1.5 hover:bg-slate-100 rounded-full" @click="replyText = ''"><Trash2 class="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MODE 2: Full-Width Email Rows Table (Identical to Screenshot) -->
        <div v-else class="flex-1 flex flex-col bg-white overflow-hidden">
          <!-- Action Toolbar Above Emails -->
          <div class="h-12 px-4 border-b border-slate-200/80 flex items-center justify-between shrink-0 bg-white">
            <!-- Left Controls: Checkbox, Refresh, More -->
            <div class="flex items-center gap-2">
              <button
                @click="selectAll = !selectAll"
                class="p-2 hover:bg-slate-100 rounded-md text-slate-600 transition-colors flex items-center gap-1"
                title="Selecionar todos"
              >
                <Square v-if="!selectAll" class="w-4 h-4 text-slate-500" />
                <CheckSquare v-else class="w-4 h-4 text-blue-600" />
                <ChevronDown class="w-3 h-3 text-slate-400" />
              </button>

              <button
                @click="fetchEmails"
                :disabled="loading"
                class="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                title="Atualizar"
              >
                <RotateCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
              </button>

              <button class="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors" title="Mais opções">
                <MoreVertical class="w-4 h-4" />
              </button>
            </div>

            <!-- Right Controls: Pagination & Tools -->
            <div class="flex items-center gap-3 text-xs text-slate-500">
              <span class="font-sans">1–{{ emails.length }} of {{ emails.length + 638 }}</span>
              <div class="flex items-center gap-1">
                <button class="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                  <ChevronLeft class="w-4 h-4" />
                </button>
                <button class="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
              <button class="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors" title="Ferramentas de entrada">
                <Keyboard class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Category Banner Matching Screenshot ("Promotions 23 new") -->
          <div
            v-if="activeFolder === 'INBOX'"
            class="px-4 py-2 border-b border-slate-100 bg-slate-50/40 flex items-center gap-3 text-xs"
          >
            <div class="flex items-center gap-2 cursor-pointer" @click="setFolder('PROMOTIONS')">
              <Tag class="w-4 h-4 text-emerald-600" />
              <span class="font-bold text-slate-800">Promotions</span>
              <span class="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">23 new</span>
            </div>
            <span class="text-slate-400 truncate">Leilamie Barredo — Unlock the full potential of your painting proposals...</span>
          </div>

          <!-- Email Rows List (Full Width Table) -->
          <div class="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
            <div v-if="loading" class="p-12 text-center text-sm text-slate-400">
              Carregando mensagens do Workspace...
            </div>

            <div v-else-if="emails.length === 0" class="p-16 text-center text-sm text-slate-400 italic">
              Nenhuma mensagem encontrada nesta pasta.
            </div>

            <!-- Individual Email Row -->
            <div
              v-for="mail in emails"
              :key="mail.id"
              @click="openEmail(mail)"
              class="group relative h-10 px-4 flex items-center gap-3 cursor-pointer transition-colors text-sm"
              :class="[
                !mail.read ? 'bg-white text-[#1f1f1f] font-bold' : 'bg-[#f2f6fc]/70 text-[#444746] font-normal hover:bg-[#f6f8fc]',
                selectedEmail?.id === mail.id ? 'bg-[#c2e7ff]/40' : ''
              ]"
            >
              <!-- Checkbox -->
              <div class="shrink-0" @click.stop>
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </div>

              <!-- Star Button -->
              <div class="shrink-0 text-base" @click.stop="toggleStar(mail)">
                <span
                  class="transition-transform active:scale-125 inline-block"
                  :class="mail.starred ? 'text-[#fbbc04]' : 'text-slate-300 hover:text-slate-400'"
                >
                  ★
                </span>
              </div>

              <!-- Sender Name (Fixed Column Width) -->
              <div class="w-44 sm:w-48 shrink-0 truncate">
                <span :class="!mail.read ? 'font-bold text-[#1f1f1f]' : 'font-normal text-[#444746]'">
                  {{ mail.from }}
                </span>
              </div>

              <!-- Subject & Snippet (Single Row with Truncate) -->
              <div class="flex-1 min-w-0 flex items-center gap-1.5 truncate">
                <!-- Subject -->
                <span :class="!mail.read ? 'font-bold text-[#1f1f1f]' : 'font-normal text-[#1f1f1f]'" class="shrink-0">
                  {{ mail.subject }}
                </span>

                <span class="text-slate-400 shrink-0">-</span>

                <!-- Snippet Preview -->
                <span class="text-[#5f6368] font-normal truncate text-xs sm:text-sm">
                  {{ getSnippet(mail.body) }}
                </span>

                <!-- Lead Tag Chip -->
                <span
                  v-if="mail.lead"
                  class="ml-2 px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-100 text-orange-800 shrink-0"
                >
                  📍 {{ mail.lead.city || 'Lead' }}
                </span>
              </div>

              <!-- Right Side: Date or Hover Action Buttons -->
              <div class="shrink-0 flex items-center justify-end text-xs text-[#5f6368] w-28 text-right">
                <!-- Hover Action Icons (Archive, Delete, Mark Read, Snooze) -->
                <div class="hidden group-hover:flex items-center gap-1 text-[#444746] -mr-1" @click.stop>
                  <button @click="openEmail(mail)" class="p-1.5 hover:bg-slate-200 rounded-full" title="Arquivar">
                    <Archive class="w-4 h-4" />
                  </button>
                  <button @click="deleteEmail(mail.id)" class="p-1.5 hover:bg-slate-200 rounded-full" title="Excluir">
                    <Trash2 class="w-4 h-4" />
                  </button>
                  <button @click="toggleRead(mail)" class="p-1.5 hover:bg-slate-200 rounded-full" :title="mail.read ? 'Marcar como não lida' : 'Marcar como lida'">
                    <Mail class="w-4 h-4" />
                  </button>
                  <button class="p-1.5 hover:bg-slate-200 rounded-full" title="Adiar">
                    <Clock class="w-4 h-4" />
                  </button>
                </div>

                <!-- Static Date/Time (visible when not hovering) -->
                <span class="group-hover:hidden font-mono" :class="!mail.read ? 'font-bold text-[#1f1f1f]' : ''">
                  {{ formatEmailDate(mail.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- C. Right Column: Google Workspace Add-ons Rail (Exact match to screenshot!) -->
      <aside class="w-14 bg-white border-l border-slate-200/80 shrink-0 flex flex-col items-center py-4 justify-between select-none">
        <div class="flex flex-col items-center gap-6">
          <!-- Calendar Icon (Blue 31) -->
          <NuxtLink
            to="/dashboard/calendar"
            class="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors relative"
            title="Google Agenda & Vistorias"
          >
            <div class="w-7 h-7 rounded-md bg-blue-600 text-white flex flex-col items-center justify-center font-bold text-[10px] shadow-2xs">
              <span class="text-[7px] uppercase tracking-tighter opacity-80 leading-none">SEP</span>
              <span class="leading-none text-xs">07</span>
            </div>
          </NuxtLink>

          <!-- Google Keep / Notes Icon (Yellow Bulb) -->
          <button
            @click="activeAddon = activeAddon === 'keep' ? null : 'keep'"
            class="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
            title="Keep / Notas Rápidas"
          >
            <div class="w-6 h-6 rounded bg-amber-400 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              💡
            </div>
          </button>

          <!-- Google Tasks Icon (Blue Checkmark Circle) -->
          <button
            @click="activeAddon = activeAddon === 'tasks' ? null : 'tasks'"
            class="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
            title="Tarefas do CRM"
          >
            <CheckCircle2 class="w-6 h-6 text-blue-600" />
          </button>

          <!-- Contacts Icon -->
          <NuxtLink
            to="/dashboard/leads"
            class="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-blue-600 transition-colors"
            title="Contatos do CRM"
          >
            <Users class="w-5 h-5 text-blue-600" />
          </NuxtLink>

          <!-- Gemini AI Sparkle Icon -->
          <button
            @click="openGeminiDrawer = !openGeminiDrawer"
            class="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
            title="Assistente Gemini 1.5"
          >
            <Sparkles class="w-5 h-5 text-indigo-600 animate-pulse" />
          </button>

          <div class="w-8 h-px bg-slate-200"></div>

          <!-- Plus Button (Add-ons) -->
          <button class="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors" title="Mais extensões">
            <Plus class="w-5 h-5" />
          </button>
        </div>

        <!-- Collapse Rail Button -->
        <button class="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <ChevronRight class="w-4 h-4" />
        </button>
      </aside>
    </div>

    <!-- 3. Floating Compose Window (Bottom-Right, Authentic Gmail Style) -->
    <div
      v-if="showComposeModal"
      class="fixed bottom-0 right-16 z-50 w-[580px] max-w-[95vw] bg-white rounded-t-xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-fade-in"
    >
      <!-- Window Title Bar -->
      <div class="h-10 px-4 bg-[#f2f6fc] flex items-center justify-between border-b border-slate-200 shrink-0">
        <span class="text-xs font-bold text-slate-800">Nova Mensagem</span>
        <div class="flex items-center gap-1">
          <button class="p-1 hover:bg-slate-200 rounded text-slate-600"><Minus class="w-3.5 h-3.5" /></button>
          <button class="p-1 hover:bg-slate-200 rounded text-slate-600"><Maximize2 class="w-3.5 h-3.5" /></button>
          <button @click="showComposeModal = false" class="p-1 hover:bg-slate-200 rounded text-slate-600"><X class="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <!-- Fields: To & Subject -->
      <div class="p-3 space-y-2 border-b border-slate-100 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-slate-400 w-12 font-medium">Para:</span>
          <input
            v-model="composeForm.to"
            type="email"
            placeholder="destinatario@exemplo.com ou selecione um lead"
            class="flex-1 focus:outline-none text-slate-800"
          />
        </div>
        <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span class="text-slate-400 w-12 font-medium">Assunto:</span>
          <input
            v-model="composeForm.subject"
            type="text"
            placeholder="Assunto da mensagem"
            class="flex-1 focus:outline-none text-slate-800 font-semibold"
          />
        </div>
      </div>

      <!-- AI Copilot Toolbar Bar inside Compose -->
      <div class="px-3 py-1.5 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between text-[11px]">
        <span class="font-bold text-indigo-900 flex items-center gap-1.5">
          <Sparkles class="w-3.5 h-3.5 text-indigo-600" />
          <span>Copiloto de Redação IA (GPT-4o):</span>
        </span>
        <div class="flex gap-1.5">
          <button
            @click="aiDraftEmail('quote')"
            :disabled="aiDrafting"
            class="bg-white hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold border border-indigo-200"
          >
            Orçamento
          </button>
          <button
            @click="aiDraftEmail('inspection')"
            :disabled="aiDrafting"
            class="bg-white hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold border border-indigo-200"
          >
            Vistoria
          </button>
          <button
            @click="aiDraftEmail('hic_contract')"
            :disabled="aiDrafting"
            class="bg-white hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold border border-indigo-200"
          >
            Contrato MA
          </button>
        </div>
      </div>

      <!-- Body Area -->
      <textarea
        v-model="composeForm.bodyHtml"
        rows="8"
        placeholder="Escreva sua mensagem profissional..."
        class="p-4 text-xs text-slate-800 focus:outline-none resize-none flex-1"
      ></textarea>

      <!-- Bottom Actions Toolbar -->
      <div class="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <!-- Split Send Button -->
          <div class="inline-flex rounded-full shadow-xs">
            <button
              @click="sendEmail"
              :disabled="sending"
              class="bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-bold px-5 py-2 rounded-l-full transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{{ sending ? 'Enviando...' : 'Enviar' }}</span>
            </button>
            <button
              class="bg-[#0b57d0] hover:bg-[#0842a0] text-white px-2 rounded-r-full border-l border-blue-400/50 transition-colors"
            >
              <ChevronDown class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Formatting Icons -->
          <div class="flex items-center text-slate-500 gap-1 ml-2">
            <button class="p-1.5 hover:bg-slate-100 rounded text-xs font-serif font-bold">A</button>
            <button class="p-1.5 hover:bg-slate-100 rounded"><Paperclip class="w-4 h-4" /></button>
            <button class="p-1.5 hover:bg-slate-100 rounded"><Link2 class="w-4 h-4" /></button>
            <button class="p-1.5 hover:bg-slate-100 rounded"><Smile class="w-4 h-4" /></button>
            <button class="p-1.5 hover:bg-slate-100 rounded"><Image class="w-4 h-4" /></button>
          </div>
        </div>

        <button @click="showComposeModal = false" class="p-1.5 text-slate-400 hover:text-slate-600 rounded">
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Menu,
  Search,
  SlidersHorizontal,
  HelpCircle,
  Settings,
  Sparkles,
  Grid,
  PenSquare,
  Inbox,
  Star,
  Clock,
  Bookmark,
  Send,
  FileText,
  Mail,
  AlertOctagon,
  Trash2,
  ShoppingBag,
  Users,
  Bell,
  MessageSquare,
  Tag,
  ChevronDown,
  ChevronUp,
  Folder,
  Plus,
  ArrowLeft,
  Archive,
  Reply,
  RotateCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Square,
  CheckSquare,
  CheckCircle2,
  Minus,
  Maximize2,
  X,
  Paperclip,
  Link2,
  Smile,
  Image
} from 'lucide-vue-next'
import { useWorkspaceAuth } from '~/composables/useWorkspaceAuth'

definePageMeta({
  layout: false
})

const { currentUser, isManager, teamUsers, fetchAuth, switchUser } = useWorkspaceAuth()

const sidebarCollapsed = ref(false)
const showMoreFolders = ref(false)
const showProfileMenu = ref(false)
const openGeminiDrawer = ref(false)
const activeAddon = ref(null)
const selectAll = ref(false)

const emails = ref([])
const stats = ref({
  inboxTotal: 18,
  inboxUnread: 79,
  sentTotal: 1,
  starredTotal: 3,
  spamTotal: 267,
  updatesTotal: 72,
  promotionsTotal: 77,
  purchasesTotal: 6
})

const activeFolder = ref('INBOX')
const searchQuery = ref('')
const loading = ref(false)

const selectedEmail = ref(null)
const replyText = ref('')
const sendingReply = ref(false)
const generatingAI = ref(false)

const showComposeModal = ref(false)
const sending = ref(false)
const aiDrafting = ref(false)

const composeForm = ref({
  to: '',
  subject: '',
  bodyHtml: ''
})

onMounted(async () => {
  await fetchAuth()
  await fetchEmails()
})

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
    console.error('Erro ao buscar e-mails:', err)
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
  } catch (err) {
    console.error('Erro ao favoritar e-mail:', err)
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
  } catch (err) {
    console.error('Erro ao marcar como lido:', err)
  }
}

async function deleteEmail(emailId) {
  emails.value = emails.value.filter(e => e.id !== emailId)
  if (selectedEmail.value?.id === emailId) {
    selectedEmail.value = null
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
    subject: '',
    bodyHtml: ''
  }
  showComposeModal.value = true
}

async function aiDraftEmail(type) {
  aiDrafting.value = true
  try {
    if (type === 'quote') {
      composeForm.value.subject = "Tony's Painting: Formal Estimate & 5-Year Warranty"
      composeForm.value.bodyHtml = `<p>Hi there,</p><p>Thank you for reaching out to Tony's Painting and Remodeling. We have prepared your complete residential painting estimate with full preparation (power washing, sanding, and primer) plus 2 finish coats of Benjamin Moore paint.</p><p>Best regards,<br>${currentUser.value?.name || 'Tony Silva'}<br>Tony's Painting and Remodeling Corp.</p>`
    } else if (type === 'inspection') {
      composeForm.value.subject = "Tony's Painting: Confirming Your Free In-Home Estimate"
      composeForm.value.bodyHtml = `<p>Hello,</p><p>We have an estimator available in your neighborhood this week. Would Thursday at 2:00 PM work for a free 15-minute walk-through and instant quote?</p><p>Warmly,<br>${currentUser.value?.name || 'Tony Silva'}</p>`
    } else if (type === 'hic_contract') {
      composeForm.value.subject = "Tony's Painting: MA Home Improvement Agreement & Deposit Receipt"
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
      replyText.value = `Hi ${selectedEmail.value?.from},\n\nThank you for reaching out to Tony's Painting and Remodeling. Yes, our 5-year warranty explicitly covers trim adhesion, moisture protection, and peeling in coastal and Greater Boston climates.\n\nWe would be delighted to lock in your start date. I will have our office dispatch the formal MA HIC agreement with the 1/3 deposit link.\n\nBest regards,\n${currentUser.value?.name || 'Tony Silva'}`
    } else if (type === 'schedule_estimate') {
      replyText.value = `Hi ${selectedEmail.value?.from},\n\nWe have your address logged in our dispatch calendar for Thursday at 2:00 PM. Our senior estimator will arrive with samples and provide an on-the-spot written quote.\n\nSee you Thursday!\n${currentUser.value?.name || 'Tony Silva'}`
    } else {
      replyText.value = `Hello ${selectedEmail.value?.from},\n\nThank you for the update! All prep work, replacement of rotted boards, and elastomeric caulking are fully accounted for in our contract.\n\nWarmly,\n${currentUser.value?.name || 'Tony Silva'}`
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
    alert('Resposta enviada com sucesso via Amazon SES!')
  } catch (err) {
    console.error('Erro ao enviar resposta:', err)
  } finally {
    sendingReply.value = false
  }
}

async function sendEmail() {
  if (!composeForm.value.to || !composeForm.value.subject) {
    alert('Preencha o destinatário e assunto!')
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
      alert('E-mail enviado com sucesso via Amazon SES!')
      await fetchEmails()
    }
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err)
  } finally {
    sending.value = false
  }
}
</script>
