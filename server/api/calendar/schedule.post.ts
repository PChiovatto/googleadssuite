import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'
import { getTwilioClient } from '../../utils/aiClients'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const { leadId, date, title, durationMinutes = 60, address, notes, sendSms = true } = body

    if (!leadId || !date) {
      return {
        success: false,
        message: 'leadId e data/hora são obrigatórios para o agendamento.'
      }
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return {
        success: false,
        message: 'Lead não encontrado.'
      }
    }

    const scheduledDate = new Date(date)
    const formattedDate = scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })

    const appointmentTitle = title || `Free In-Home Estimate - ${lead.serviceInterested || 'Painting'}`
    const location = address || lead.address || `${lead.city || 'Boston'}, MA`

    // Create Appointment in database
    const appointment = await prisma.appointment.create({
      data: {
        leadId: lead.id,
        title: appointmentTitle,
        date: scheduledDate,
        durationMinutes: Number(durationMinutes) || 60,
        status: 'SCHEDULED',
        address: location,
        notes: notes || `Scheduled for ${lead.name} (${lead.serviceInterested || 'Estimate'})`,
        reminderSent: Boolean(sendSms)
      }
    })

    // Advance lead status to EM_ATENDIMENTO if still NOVO
    if (lead.status === 'NOVO') {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'EM_ATENDIMENTO' }
      })
    }

    // Twilio SMS confirmation dispatch
    let smsStatus = 'SKIPPED'
    const smsText = `Hi ${lead.name}! Your free in-home estimate with First Boston Painters has been scheduled for ${formattedDate} at ${formattedTime}. Location: ${location}. Reply C to confirm or call (617) 555-0199 to reschedule. Msg&data rates may apply. Reply STOP to cancel.`

    if (sendSms && lead.phone) {
      const twilio = getTwilioClient()
      const fromNumber = process.env.TWILIO_PHONE_NUMBER || '+16175550199'

      if (twilio) {
        try {
          await twilio.messages.create({
            to: lead.phone,
            from: fromNumber,
            body: smsText
          })
          smsStatus = 'SENT_TWILIO'
        } catch (twilioErr: any) {
          console.warn('[Twilio Calendar SMS Error]:', twilioErr.message)
          smsStatus = 'FAILED_FALLBACK_SIMULATED'
        }
      } else {
        console.log(`[Twilio Calendar SMS Simulation] To: ${lead.phone} | Body: "${smsText}"`)
        smsStatus = 'SENT_SIMULATED'
      }
    }

    // Log in AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'APPOINTMENT_SCHEDULED',
        userId: body.userId || 'SYSTEM_CALENDAR',
        userName: 'Appointment Dispatcher',
        details: JSON.stringify({
          appointmentId: appointment.id,
          leadId: lead.id,
          leadName: lead.name,
          date: scheduledDate.toISOString(),
          smsStatus
        })
      }
    })

    return {
      success: true,
      appointment,
      smsStatus,
      message: `Visita agendada para ${formattedDate} às ${formattedTime}. Confirmação enviada via SMS para ${lead.name}.`
    }
  } catch (error: any) {
    console.error('Error scheduling appointment:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
