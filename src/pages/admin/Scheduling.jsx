import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { Calendar, Plus, Edit, Clock } from 'lucide-react'
import { schedulingAPI } from '../../api'

const Scheduling = () => {
  const [selectedWeek, setSelectedWeek] = useState('')
  const [weeks, setWeeks] = useState([])
  const [schedule, setSchedule] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeeks()
  }, [])

  useEffect(() => {
    if (selectedWeek) {
      fetchSchedule(selectedWeek)
    }
  }, [selectedWeek])

  const fetchWeeks = async () => {
    try {
      setLoading(true)
      const response = await schedulingAPI.getAllWeeks()
      setWeeks(response.data)
      if (response.data.length > 0) {
        setSelectedWeek(response.data[0].id)
      }
    } catch (error) {
      console.error('Error fetching weeks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedule = async (weekId) => {
    try {
      const response = await schedulingAPI.getSlotsByWeek(weekId)
      // Transform the slots into a usable format
      const slotsData = {}
      response.data.forEach(slot => {
        const timeKey = `${slot.startTime} - ${slot.endTime}`
        if (!slotsData[timeKey]) {
          slotsData[timeKey] = {}
        }
        slotsData[timeKey][slot.dayOfWeek.toLowerCase()] = slot.module?.name || ''
      })
      setSchedule(slotsData)
    } catch (error) {
      console.error('Error fetching schedule:', error)
      setSchedule({})
    }
  }

  const timeSlots = ['8:00 - 11:00', '11:00 - 14:00', '14:00 - 17:00', '17:00 - 20:00']
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const getSlotColor = (module) => {
    if (!module) return 'bg-gray-50'
    const colors = {
      'React': 'bg-blue-500',
      'Node.js': 'bg-green-500',
      'Python': 'bg-yellow-500',
      'AWS': 'bg-orange-500',
    }
    return colors[module] || 'bg-gray-500'
  }

  const getSlotTextColor = (module) => {
    if (!module) return 'text-gray-400'
    return 'text-white'
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scheduling</h1>
            <p className="text-gray-500 mt-1">Create and manage weekly schedules</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Create Schedule
          </button>
        </div>

        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="text-primary-600" size={24} />
              <h2 className="text-lg font-semibold text-gray-900">Select Week</h2>
            </div>
            <div className="flex items-center gap-2">
              {loading ? (
                <span className="text-gray-500">Loading...</span>
              ) : weeks.length === 0 ? (
                <span className="text-gray-500">No weeks available</span>
              ) : (
                weeks.map((week) => (
                  <button
                    key={week.id}
                    onClick={() => setSelectedWeek(week.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedWeek === week.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {week.name || `Week ${week.weekNumber}`}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-primary-600 to-secondary-600">
                  <th className="py-4 px-4 text-left text-white font-semibold">
                    <div className="flex items-center gap-2">
                      <Clock size={18} />
                      Time
                    </div>
                  </th>
                  {days.map((day) => (
                    <th key={day} className="py-4 px-4 text-center text-white font-semibold">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-gray-600">{timeSlot}</span>
                    </td>
                    {days.map((day) => {
                      const dayKey = day.toLowerCase()
                      const module = schedule[timeSlot]?.[dayKey] || ''
                      return (
                        <td key={day} className="py-2 px-2">
                          <button
                            className={`w-full h-16 rounded-xl ${getSlotColor(module)} ${getSlotTextColor(module)} 
                              flex flex-col items-center justify-center gap-1 transition-all duration-200
                              hover:scale-105 hover:shadow-lg`}
                          >
                            {module && (
                              <>
                                <span className="font-semibold text-sm">{module}</span>
                                <Edit size={12} className="opacity-0 hover:opacity-100 transition-opacity" />
                              </>
                            )}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Scheduling
