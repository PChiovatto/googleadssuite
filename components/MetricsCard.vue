<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
    <div class="flex items-start justify-between mb-3">
      <div>
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ title }}</span>
        <div class="flex items-baseline gap-1 mt-1">
          <span v-if="prefix" class="text-xl font-bold text-slate-700">{{ prefix }}</span>
          <span class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{{ formattedValue }}</span>
          <span v-if="suffix" class="text-sm font-semibold text-slate-500">{{ suffix }}</span>
        </div>
      </div>
      <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', iconBgClass]">
        <component :is="iconComponent" class="w-5 h-5" :class="iconColorClass" />
      </div>
    </div>

    <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
      <div v-if="trend !== undefined" class="flex items-center gap-1 font-medium" :class="trend >= 0 ? 'text-emerald-600' : 'text-rose-600'">
        <span v-if="trend >= 0">↑</span>
        <span v-else>↓</span>
        <span>{{ Math.abs(trend) }}% vs previous period</span>
      </div>
      <span v-else class="text-slate-400">{{ subtitle || 'Last 30 days' }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  DollarSign,
  TrendingUp,
  MousePointerClick,
  Eye,
  Percent,
  Target,
  Award,
  BarChart3
} from 'lucide-vue-next'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [Number, String], required: true },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  trend: { type: Number, default: undefined },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: 'dollar' },
  color: { type: String, default: 'blue' }
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return props.value
})

const iconComponent = computed(() => {
  switch (props.icon) {
    case 'dollar': return DollarSign
    case 'trending': return TrendingUp
    case 'click': return MousePointerClick
    case 'eye': return Eye
    case 'percent': return Percent
    case 'target': return Target
    case 'award': return Award
    default: return BarChart3
  }
})

const iconBgClass = computed(() => {
  switch (props.color) {
    case 'emerald': return 'bg-emerald-50'
    case 'purple': return 'bg-purple-50'
    case 'amber': return 'bg-amber-50'
    case 'rose': return 'bg-rose-50'
    case 'cyan': return 'bg-cyan-50'
    default: return 'bg-blue-50'
  }
})

const iconColorClass = computed(() => {
  switch (props.color) {
    case 'emerald': return 'text-emerald-600'
    case 'purple': return 'text-purple-600'
    case 'amber': return 'text-amber-600'
    case 'rose': return 'text-rose-600'
    case 'cyan': return 'text-cyan-600'
    default: return 'text-blue-600'
  }
})
</script>
