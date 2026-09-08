<template>
  <div class="h-screen w-screen flex flex-col bg-white font-sans text-[#1f1f1f] overflow-hidden select-none">
    <!-- 1. Top Header Bar: Corporate Webmail (Clean, Professional, Tony's Branded) -->
    <header class="h-16 px-4 flex items-center justify-between shrink-0 bg-white border-b border-slate-200/80 z-20 shadow-2xs">
      <!-- Left: Hamburger + Tony's Mail Brand Logo + CRM Switcher -->
      <div class="flex items-center gap-3 min-w-[260px]">
        <button
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          title="Recolher / Expandir Menu Lateral"
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
              Central Corporativa & CRM
            </span>
          </div>
        </div>

        <!-- Direct Link Back to Main Dashboard -->
        <NuxtLink
          to="/dashboard"
          class="ml-2 text-xs font-bold text-slate-600 hover:text-[#D7070D] bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
          title="Voltar ao Painel Geral de Leads e Vendas"
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
            placeholder="Pesquisar por remetente, assunto, lead, orçamento ou contrato..."
            class="w-full bg-transparent pl-3 pr-8 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''; fetchEmails()"
            class="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            title="Limpar pesquisa"
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
          title="Abrir Funil de Leads"
        >
          <Users class="w-4 h-4" />
          <span class="hidden md:inline">Leads</span>
        </NuxtLink>

        <NuxtLink
          to="/dashboard/calendar"
          class="p-2 hover:bg-slate-100 text-slate-600 hover:text-[#D7070D] rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
          title="Abrir Agenda de Vistorias"
        >
          <Calendar class="w-4 h-4" />
          <span class="hidden md:inline">Agenda</span>
        </NuxtLink>

        <NuxtLink
          to="/settings"
          class="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
          title="Configurações de E-mail & SES"
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
              <span class="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider" :class="isManager ? 'bg-red-50 text-[#D7070D] border border-red-200' : 'bg-slate-100 text-slate-700'">
                {{ isManager ? '👑 GESTOR GERAL (OWNER)' : '👤 CONSULTOR DE VENDAS' }}
              </span>
            </div>

            <!-- Team RBAC Switcher -->
            <div class="space-y-1">
              <span class="text-[11px] font-bold text-slate-500 uppercase">Alternar Usuário Ativo:</span>
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
              <NuxtLink to="/dashboard" class="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2 rounded-xl font-bold transition-colors">
                Painel CRM
              </NuxtLink>
              <button @click="showProfileMenu = false" class="flex-1 text-center bg-slate-900 hover:bg-black text-white text-xs py-2 rounded-xl font-bold transition-colors">
                Fechar
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
            title="Escrever Novo E-mail"
          >
            <PenSquare class="w-5 h-5 shrink-0 text-white" />
            <span v-if="!sidebarCollapsed" class="tracking-wide">Nova Mensagem</span>
          </button>

          <!-- Core Mailbox Folders -->
          <nav class="space-y-0.5 text-xs font-semibold text-slate-700">
            <span v-if="!sidebarCollapsed" class="block px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Mensagens
            </span>

            <!-- Caixa de Entrada -->
            <button
              @click="setFolder('INBOX')"
              class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left"
              :class="activeFolder === 'INBOX' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
              title="Caixa de Entrada Principal"
            >
              <div class="flex items-center gap-3">
                <Inbox class="w-4 h-4 shrink-0" :class="activeFolder === 'INBOX' ? 'text-white' : 'text-slate-500'" />
                <span v-if="!sidebarCollapsed">Caixa de Entrada</span>
              </div>
              <span
                v-if="!sidebarCollapsed && stats.inboxUnread > 0"
                class="text-[11px] font-bold px-1.5 py-0.2 rounded-full"
                :class="activeFolder === 'INBOX' ? 'bg-white text-[#D7070D]' : 'bg-[#D7070D] text-white'"
              >
                {{ stats.inboxUnread }}
              </span>
            </button>

            <!-- Com Estrela (Prioritários) -->
            <button
              @click="setFolder('STARRED')"
              class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all text-left"
              :class="activeFolder === 'STARRED' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
              title="Mensagens com Estrela"
            >
              <div class="flex items-center gap-3">
                <Star class="w-4 h-4 shrink-0" :class="activeFolder === 'STARRED' ? 'text-white' : 'text-amber-500'" />
                <span v-if="!sidebarCollapsed">Com Estrela</span>
              </div>
              <span v-if="!sidebarCollapsed && stats.starredTotal" class="text-[10px] opacity-80 font-mono">
                {{ stats.starredTotal }}
              </span>
            </button>

            <!-- Enviados -->
            <button
              @click="setFolder('SENT')"
              class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all text-left"
              :class="activeFolder === 'SENT' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
              title="Mensagens Enviadas"
            >
              <div class="flex items-center gap-3">
                <Send class="w-4 h-4 shrink-0" :class="activeFolder === 'SENT' ? 'text-white' : 'text-slate-500'" />
                <span v-if="!sidebarCollapsed">Enviados</span>
              </div>
              <span v-if="!sidebarCollapsed && stats.sentTotal" class="text-[10px] opacity-80 font-mono">
                {{ stats.sentTotal }}
              </span>
            </button>

            <!-- Rascunhos -->
            <button
              @click="setFolder('DRAFTS')"
              class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all text-left"
              :class="activeFolder === 'DRAFTS' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
              title="Rascunhos Salvos"
            >
              <div class="flex items-center gap-3">
                <FileText class="w-4 h-4 shrink-0" :class="activeFolder === 'DRAFTS' ? 'text-white' : 'text-slate-500'" />
                <span v-if="!sidebarCollapsed">Rascunhos</span>
              </div>
              <span v-if="!sidebarCollapsed && stats.draftsTotal" class="text-[10px] opacity-80 font-mono">
                {{ stats.draftsTotal }}
              </span>
            </button>

            <!-- Lixeira -->
            <button
              @click="setFolder('TRASH')"
              class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all text-left"
              :class="activeFolder === 'TRASH' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
              title="Lixeira"
            >
              <div class="flex items-center gap-3">
                <Trash2 class="w-4 h-4 shrink-0" :class="activeFolder === 'TRASH' ? 'text-white' : 'text-slate-500'" />
                <span v-if="!sidebarCollapsed">Lixeira</span>
              </div>
            </button>

            <!-- ---------------- SEÇÃO CRM TONY'S (INTEGRADA E FUNCIONAL) ---------------- -->
            <div class="pt-3">
              <span v-if="!sidebarCollapsed" class="block px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Central de Leads & Vendas
              </span>

              <!-- Leads Ativos -->
              <button
                @click="setFolder('CRM_LEADS')"
                class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all text-left"
                :class="activeFolder === 'CRM_LEADS' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
                title="E-mails associados a Leads do CRM"
              >
                <div class="flex items-center gap-3">
                  <Users class="w-4 h-4 shrink-0" :class="activeFolder === 'CRM_LEADS' ? 'text-white' : 'text-blue-600'" />
                  <span v-if="!sidebarCollapsed">Leads Vinculados</span>
                </div>
                <span
                  v-if="!sidebarCollapsed"
                  class="text-[10px] font-bold px-1.5 py-0.2 rounded-md"
                  :class="activeFolder === 'CRM_LEADS' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'"
                >
                  {{ stats.crmLeadsTotal || 0 }}
                </span>
              </button>

              <!-- Orçamentos & Vistorias -->
              <button
                @click="setFolder('CRM_ESTIMATES')"
                class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all text-left"
                :class="activeFolder === 'CRM_ESTIMATES' ? 'bg-[#D7070D] text-white font-bold shadow-xs' : 'hover:bg-slate-200/70 text-slate-700'"
                title="E-mails sobre Orçamentos e Vistorias"
              >
                <div class="flex items-center gap-3">
                  <ClipboardCheck class="w-4 h-4 shrink-0" :class="activeFolder === 'CRM_ESTIMATES' ? 'text-white' : 'text-emerald-600'" />
                  <span v-if="!sidebarCollapsed">Orçamentos & Vistorias</span>
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
                title="Contratos e Assinaturas Legais"
              >
                <div class="flex items-center gap-3">
                  <Building2 class="w-4 h-4 shrink-0" :class="activeFolder === 'CRM_CONTRACTS' ? 'text-white' : 'text-amber-600'" />
                  <span v-if="!sidebarCollapsed">Contratos HIC</span>
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
                title="Depósitos e Pagamentos Stripe"
              >
                <div class="flex items-center gap-3">
                  <DollarSign class="w-4 h-4 shrink-0" :class="activeFolder === 'CRM_PAYMENTS' ? 'text-white' : 'text-teal-600'" />
                  <span v-if="!sidebarCollapsed">Depósitos Stripe</span>
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
                Atalhos do Sistema
              </span>

              <NuxtLink
                to="/dashboard/leads"
                class="w-full flex items-center gap-3 px-3.5 py-1.5 rounded-xl hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition-colors text-xs"
              >
                <span>🎯</span>
                <span>Kanban de Leads</span>
              </NuxtLink>

              <NuxtLink
                to="/dashboard/calendar"
                class="w-full flex items-center gap-3 px-3.5 py-1.5 rounded-xl hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition-colors text-xs"
              >
                <span>📅</span>
                <span>Agenda de Vistorias</span>
              </NuxtLink>

              <NuxtLink
                to="/dashboard"
                class="w-full flex items-center gap-3 px-3.5 py-1.5 rounded-xl hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition-colors text-xs"
              >
                <span>📊</span>
                <span>Métricas de Tráfego & Ads</span>
              </NuxtLink>
            </div>
          </nav>
        </div>

        <!-- SES Corporate Domain Status Badge -->
        <div v-if="!sidebarCollapsed" class="p-3 bg-white rounded-2xl border border-slate-200 text-[11px] space-y-1 shadow-2xs mt-4">
          <div class="flex items-center justify-between font-bold text-slate-800">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Amazon SES Corporativo</span>
            </span>
            <span class="text-emerald-700 font-bold text-[10px]">Ativo</span>
          </div>
          <p class="text-slate-500 text-[10px] leading-tight">
            Servidor oficial conectado para <strong>@tonyspainting.com</strong>.
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
                title="Voltar para a lista"
              >
                <ArrowLeft class="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <div class="h-5 w-px bg-slate-300 mx-1"></div>

              <button @click="toggleStar(selectedEmail)" class="p-2 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors" :title="selectedEmail.starred ? 'Remover estrela' : 'Marcar com estrela'">
                <Star class="w-4 h-4" :class="selectedEmail.starred ? 'text-amber-500 fill-amber-500' : 'text-slate-400'" />
              </button>

              <button @click="toggleRead(selectedEmail)" class="p-2 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors" :title="selectedEmail.read ? 'Marcar como não lido' : 'Marcar como lido'">
                <Mail class="w-4 h-4" />
              </button>

              <button @click="deleteEmail(selectedEmail.id)" class="p-2 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-lg transition-colors" title="Excluir mensagem">
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
                <span>{{ convertingLead ? 'Convertendo...' : 'Converter em Lead no CRM' }}</span>
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
                    Pasta: {{ selectedEmail.folder || 'Caixa de Entrada' }}
                  </span>
                  <span v-if="selectedEmail.lead" class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <span>🎯 Lead Vinculado:</span>
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
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Cliente CRM:</span>
                  <span class="font-black text-base text-white">{{ selectedEmail.lead.name }}</span>
                  <span class="text-[10px] bg-red-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase">
                    {{ selectedEmail.lead.status }}
                  </span>
                </div>
                <p class="text-xs text-slate-300">
                  <strong>Serviço:</strong> {{ selectedEmail.lead.serviceInterested || 'Pintura Residencial' }} •
                  <strong>Local:</strong> {{ selectedEmail.lead.city || 'Greater Boston' }} •
                  <strong>Valor Estimado:</strong> ${{ selectedEmail.lead.dealValue ? selectedEmail.lead.dealValue.toLocaleString('en-US') : '8,500' }}
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
                  <span>Abrir no Funil</span>
                  <ExternalLink class="w-3.5 h-3.5" />
                </NuxtLink>
                <NuxtLink
                  to="/dashboard/calendar"
                  class="bg-[#D7070D] hover:bg-[#B0050A] text-white px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Agendar Vistoria</span>
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
                <span class="font-bold block text-sm">Este remetente ainda não é um lead cadastrado no CRM.</span>
                <p class="text-amber-800">
                  Transforme esta mensagem em uma oportunidade no funil de vendas com 1 clique para acompanhar propostas e vistorias.
                </p>
              </div>
              <button
                @click="convertEmailToLead(selectedEmail)"
                :disabled="convertingLead"
                class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-xs"
              >
                <UserPlus class="w-4 h-4" />
                <span>{{ convertingLead ? 'Cadastrando Lead...' : '➕ Converter em Lead no CRM' }}</span>
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
                    <span>Para: {{ selectedEmail.to }}</span>
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
                    <span>Copiloto de Vendas Tony's Painting (IA):</span>
                  </span>
                  <span class="text-[10px] text-slate-500 font-normal">Clique para gerar resposta comercial pronta</span>
                </div>

                <div class="flex flex-wrap gap-2">
                  <button
                    @click="generateAIReply('commercial_quote')"
                    :disabled="generatingAI"
                    class="bg-white hover:bg-red-50 text-slate-800 hover:text-[#D7070D] text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>📄 Orçamento de Pintura & Garantia 5 Anos</span>
                  </button>
                  <button
                    @click="generateAIReply('schedule_estimate')"
                    :disabled="generatingAI"
                    class="bg-white hover:bg-red-50 text-slate-800 hover:text-[#D7070D] text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>📅 Confirmar Vistoria no Local (Newton/MA)</span>
                  </button>
                  <button
                    @click="generateAIReply('friendly_followup')"
                    :disabled="generatingAI"
                    class="bg-white hover:bg-red-50 text-slate-800 hover:text-[#D7070D] text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>✍️ Contrato HIC & Depósito 1/3 (Lei MA)</span>
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
                  placeholder="Escreva sua resposta corporativa ou use o Copiloto IA acima..."
                  class="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-y"
                ></textarea>

                <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    @click="sendQuickReply"
                    :disabled="sendingReply || !replyText.trim()"
                    class="bg-[#D7070D] hover:bg-[#B0050A] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
                  >
                    <span>{{ sendingReply ? 'Enviando...' : 'Enviar Resposta' }}</span>
                    <Send class="w-3.5 h-3.5" />
                  </button>

                  <div class="flex items-center gap-2 text-slate-400">
                    <button class="p-1.5 hover:bg-slate-100 rounded-full" @click="replyText = ''" title="Limpar"><Trash2 class="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= MODE 2: EMAIL ROWS TABLE ================= -->
        <div v-else class="flex-1 flex flex-col bg-white overflow-hidden">
          <!-- Action Toolbar Above Emails -->
          <div class="h-12 px-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
            <!-- Left Controls: Checkbox, Refresh, Filter Chips -->
            <div class="flex items-center gap-2">
              <button
                @click="selectAll = !selectAll"
                class="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors flex items-center gap-1"
                title="Selecionar todos"
              >
                <Square v-if="!selectAll" class="w-4 h-4 text-slate-500" />
                <CheckSquare v-else class="w-4 h-4 text-[#D7070D]" />
              </button>

              <button
                @click="fetchEmails"
                :disabled="loading"
                class="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                title="Atualizar mensagens"
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
                  Todas
                </button>
                <button
                  @click="setFolder('CRM_LEADS')"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                  :class="activeFolder === 'CRM_LEADS' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'"
                >
                  🎯 Com Lead CRM
                </button>
                <button
                  @click="setFolder('CRM_ESTIMATES')"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                  :class="activeFolder === 'CRM_ESTIMATES' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'"
                >
                  📋 Orçamentos
                </button>
              </div>
            </div>

            <!-- Right Controls: Pagination & Summary -->
            <div class="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span>{{ emails.length }} mensagens</span>
            </div>
          </div>

          <!-- Email Rows List -->
          <div class="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
            <div v-if="loading" class="p-12 text-center text-sm text-slate-400">
              Sincronizando mensagens do servidor corporativo...
            </div>

            <div v-else-if="emails.length === 0" class="p-16 text-center text-sm text-slate-400 italic">
              Nenhuma mensagem encontrada nesta pasta do CRM.
            </div>

            <!-- Individual Email Row -->
            <div
              v-for="mail in emails"
              :key="mail.id"
              @click="openEmail(mail)"
              class="group relative h-11 px-4 flex items-center gap-3 cursor-pointer transition-colors text-sm"
              :class="[
                !mail.read ? 'bg-white text-slate-900 font-bold' : 'bg-slate-50/60 text-slate-600 font-normal hover:bg-slate-100/80',
                selectedEmail?.id === mail.id ? 'bg-red-50/50' : ''
              ]"
            >
              <!-- Checkbox -->
              <div class="shrink-0" @click.stop>
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded border-slate-300 text-[#D7070D] focus:ring-0 cursor-pointer"
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
                  <button @click="deleteEmail(mail.id)" class="p-1.5 hover:bg-slate-200 rounded-lg" title="Excluir">
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                  <button @click="toggleRead(mail)" class="p-1.5 hover:bg-slate-200 rounded-lg" :title="mail.read ? 'Marcar como não lida' : 'Marcar como lida'">
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
            title="Agenda de Vistorias"
          >
            <Calendar class="w-5 h-5" />
          </NuxtLink>

          <!-- Leads CRM Shortcut -->
          <NuxtLink
            to="/dashboard/leads"
            class="w-10 h-10 rounded-xl hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-700 hover:text-[#D7070D]"
            title="Kanban de Leads"
          >
            <Users class="w-5 h-5" />
          </NuxtLink>

          <!-- Contratos HIC Shortcut -->
          <NuxtLink
            to="/dashboard"
            class="w-10 h-10 rounded-xl hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-700 hover:text-[#D7070D]"
            title="Painel Geral"
          >
            <Building2 class="w-5 h-5" />
          </NuxtLink>
        </div>

        <div class="text-[9px] font-mono text-slate-400 rotate-90 pb-4">
          TONY'S
        </div>
      </aside>
    </div>

    <!-- 3. Floating Compose Window (Corporate Style) -->
    <div
      v-if="showComposeModal"
      class="fixed bottom-0 right-8 z-50 w-[600px] max-w-[95vw] bg-white rounded-t-2xl shadow-2xl border-2 border-slate-300 flex flex-col overflow-hidden"
    >
      <!-- Window Title Bar -->
      <div class="h-11 px-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <PenSquare class="w-4 h-4 text-red-400" />
          <span class="text-xs font-black tracking-wide uppercase">Nova Mensagem Corporativa — Tony's Remodeling</span>
        </div>
        <div class="flex items-center gap-1">
          <button @click="showComposeModal = false" class="p-1 hover:bg-slate-800 rounded text-slate-300 transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Fields: To & Subject -->
      <div class="p-3 space-y-2 border-b border-slate-100 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-slate-400 w-16 font-bold uppercase text-[10px]">Para:</span>
          <input
            v-model="composeForm.to"
            type="email"
            placeholder="cliente@exemplo.com"
            class="flex-1 focus:outline-none text-slate-900 font-semibold"
          />
        </div>
        <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span class="text-slate-400 w-16 font-bold uppercase text-[10px]">Assunto:</span>
          <input
            v-model="composeForm.subject"
            type="text"
            placeholder="Assunto da mensagem corporativa"
            class="flex-1 focus:outline-none text-slate-900 font-bold"
          />
        </div>
      </div>

      <!-- AI Copilot Toolbar Bar inside Compose -->
      <div class="px-3 py-2 bg-red-50/70 border-b border-red-100 flex items-center justify-between text-[11px]">
        <span class="font-bold text-slate-900 flex items-center gap-1.5">
          <Sparkles class="w-3.5 h-3.5 text-[#D7070D]" />
          <span>Copiloto de Vendas (IA):</span>
        </span>
        <div class="flex gap-1.5">
          <button
            @click="aiDraftEmail('quote')"
            :disabled="aiDrafting"
            class="bg-white hover:bg-red-50 text-slate-800 hover:text-[#D7070D] px-2 py-0.5 rounded-md font-bold border border-slate-200 transition-colors"
          >
            Orçamento
          </button>
          <button
            @click="aiDraftEmail('inspection')"
            :disabled="aiDrafting"
            class="bg-white hover:bg-red-50 text-slate-800 hover:text-[#D7070D] px-2 py-0.5 rounded-md font-bold border border-slate-200 transition-colors"
          >
            Vistoria
          </button>
          <button
            @click="aiDraftEmail('hic_contract')"
            :disabled="aiDrafting"
            class="bg-white hover:bg-red-50 text-slate-800 hover:text-[#D7070D] px-2 py-0.5 rounded-md font-bold border border-slate-200 transition-colors"
          >
            Contrato MA
          </button>
        </div>
      </div>

      <!-- Body Area -->
      <textarea
        v-model="composeForm.bodyHtml"
        rows="9"
        placeholder="Escreva a mensagem corporativa da Tony's Painting and Remodeling..."
        class="p-4 text-xs sm:text-sm text-slate-800 focus:outline-none resize-none flex-1"
      ></textarea>

      <!-- Bottom Actions Toolbar -->
      <div class="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <button
          @click="sendEmail"
          :disabled="sending"
          class="bg-[#D7070D] hover:bg-[#B0050A] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 shadow-md shadow-red-950/20"
        >
          <span>{{ sending ? 'Disparando via SES...' : 'Enviar Mensagem' }}</span>
          <Send class="w-3.5 h-3.5" />
        </button>

        <button @click="showComposeModal = false" class="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
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
  ExternalLink
} from 'lucide-vue-next'
import { useWorkspaceAuth } from '~/composables/useWorkspaceAuth'

definePageMeta({
  layout: false
})

const { currentUser, isManager, teamUsers, fetchAuth, switchUser } = useWorkspaceAuth()

const sidebarCollapsed = ref(false)
const showProfileMenu = ref(false)
const selectAll = ref(false)
const activeFilterChip = ref('ALL')

const emails = ref([])
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
    console.error('Erro ao buscar e-mails corporativos:', err)
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
    if (newStatus) {
      stats.value.inboxUnread = Math.max(0, stats.value.inboxUnread - 1)
    }
  } catch (err) {
    console.error('Erro ao atualizar status de leitura:', err)
  }
}

async function deleteEmail(emailId) {
  emails.value = emails.value.filter(e => e.id !== emailId)
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
      alert(`Lead "${res.lead.name}" cadastrado com sucesso no CRM da Tony's!`)
    }
  } catch (err) {
    console.error('Erro ao converter lead:', err)
    alert('Erro ao converter e-mail em lead.')
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
    subject: '',
    bodyHtml: ''
  }
  showComposeModal.value = true
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
    alert('Resposta enviada com sucesso via Amazon SES!')
  } catch (err) {
    console.error('Erro ao enviar resposta:', err)
  } finally {
    sendingReply.value = false
  }
}

async function sendEmail() {
  if (!composeForm.value.to || !composeForm.value.subject) {
    alert('Preencha o destinatário e o assunto da mensagem!')
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
      alert('E-mail corporativo enviado com sucesso via Amazon SES!')
      await fetchEmails()
    }
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err)
  } finally {
    sending.value = false
  }
}
</script>
