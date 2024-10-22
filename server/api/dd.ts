const startAt = Date.now()
const formattedDate = new Date(startAt).toLocaleString()

let is_run_daka_status = false

export default defineEventHandler((event) => {
  const query = getQuery(event)

  is_run_daka_status = Boolean(query.status === 'true')
  return {
    status: 'success', 
    is_run_daka_status, 
    time: formattedDate,
  }
})
