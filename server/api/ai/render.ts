import { defineEventHandler, readBody } from 'h3'
import { getOpenAIClient, simulateDallERender } from '../../utils/aiClients'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const prompt = body.prompt || `Luxury historic colonial residential home exterior in Boston Massachusetts, freshly painted with crisp navy and white architectural trim, professional landscaping, morning sun, 4k ultra realistic architectural photography`

    const openAI = getOpenAIClient()
    let renderResult: any = null

    if (openAI) {
      try {
        const response = await openAI.images.generate({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        })

        const image = response.data[0]
        renderResult = {
          isSimulation: false,
          modelUsed: 'dall-e-3',
          prompt,
          imageUrl: image.url,
          revisedPrompt: image.revised_prompt
        }
      } catch (err) {
        console.warn('DALL-E 3 fallback triggered:', err)
        renderResult = simulateDallERender(prompt)
      }
    } else {
      renderResult = simulateDallERender(prompt)
    }

    return {
      success: true,
      render: renderResult
    }
  } catch (error: any) {
    console.error('Error in DALL-E render endpoint:', error)
    return {
      success: false,
      error: error.message || 'Falha ao gerar imagem com DALL-E 3'
    }
  }
})
