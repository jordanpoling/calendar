import React, { Component } from 'react'
import PropTypes from 'prop-types'
import clone from 'clone'
import { dayNamesShort, monthNames } from './constants'
import DayView from './DayView.js'
import tetrisize from './tetrisize.js'

const hourHeight = 64 //px,TODO: make responsive
const snapToMinutes = 15

class WeekView extends Component {
  static propTypes = {
    weekStart: PropTypes.any,
    weekSize: PropTypes.number,
    meetings: PropTypes.object
  }

  constructor(props) {
    super(props)

    const { weekStart, weekSize, meetings } = props
    const meetingsClone = _indexDays(clone(meetings, false), weekStart) // Clone so whole App doesn't rerender on updates to meetings
    const segmentsByDay = _segmentMeetingsByDay(meetingsClone, weekSize)


    this.state = {
      meetings: meetingsClone,
      selectedMeetingId: null,
      dragging: false,
      dayWidth: 0,
      meetingSegmentsByDay: _tetrisizeByDay(segmentsByDay),
    }

    this.dayLabels = _makeDayLabels(weekStart, weekSize)
    this.timeLabels = _makeTimeLabels()

    this.selectMeeting = this.selectMeeting.bind(this)
    this.unselectMeeting = this.unselectMeeting.bind(this)
    this.endDragMeeting = this.endDragMeeting.bind(this)
    this.dragMeeting = this.dragMeeting.bind(this)
    this.updateDayWidth= this.updateDayWidth.bind(this)
  }

  componentDidMount() {
    this.updateDayWidth()
    window.addEventListener('resize', this.updateDayWidth)
    window.addEventListener('mouseup', this.endDragMeeting)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDayWidth)
    window.removeEventListener('mouseup', this.endDragMeeting)
  }

  updateDayWidth() {
    this.setState({
      dayWidth: document.querySelector('.DayView').clientWidth + 1
    })
  }

  selectMeeting(meeting, segment, e) {
    this.setState({
      selectedMeetingId: meeting.id,
      dragging: meeting.id,
      origDayIdx: segment.dayIdx,
      origY: e.clientY,
      prevDMins: 0,
      origMeetingStart: meeting.start,
      origMeetingEnd: meeting.end
    })
  }

  unselectMeeting(e) {
    this.setState({
      selectedMeetingId: null,
    })
  }

  dragMeeting(e) {
    if (!this.state.dragging) return

    const { clientX, clientY } = e
    const { origDayIdx, origY, prevDMins, origMeetingStart, origMeetingEnd, dayWidth } = this.state
    const { left: gridX } = this.refs.dayColumns.getBoundingClientRect()
    const vInterval = snapToMinutes * hourHeight / 60
    const dMinsIntra = Math.round((clientY - origY) / vInterval) * snapToMinutes
    const dMinsInter = (Math.floor((clientX - gridX) / dayWidth) - origDayIdx) * 1440
    const dMins = dMinsIntra + dMinsInter

    if (dMins - prevDMins === 0) return

    const { weekStart, weekSize } = this.props
    const { selectedMeetingId, meetings, meetingSegmentsByDay } = this.state

    const meetingId = selectedMeetingId
    const meeting = meetings[meetingId]

    const weekStartTime = weekStart.getTime()
    const newStartTime = origMeetingStart.getTime() + (dMins * 60000)
    const newEndTime = origMeetingEnd.getTime() + (dMins * 60000)

    const newStartDayIdx = Math.floor((newStartTime - weekStartTime) / 86400000)
    const newEndDayIdx = Math.floor((newEndTime - weekStartTime) / 86400000)

    if (newEndDayIdx < 0 || newStartDayIdx > weekSize) return

    const newDaysIdx = []

    for (let i = newStartDayIdx; i < newEndDayIdx + 1; i++) {
      newDaysIdx.push(i)
    }

    meeting.start = new Date(newStartTime)
    meeting.end = new Date(newEndTime)
    meeting.daysIdx = newDaysIdx

    this.setState({
      meetings,
      meetingSegmentsByDay: _segmentMeetingsByDay(meetings, weekSize),
      prevDMins: dMins
    })
  }

  endDragMeeting() {
    const { meetingSegmentsByDay, dragging } = this.state

    if (dragging) {
      this.setState({
        dragging: false,
        meetingSegmentsByDay: _tetrisizeByDay(meetingSegmentsByDay)
      })
    }
  }

  render() {
    const { weekStart } = this.props
    const { meetings, meetingSegmentsByDay, selectedMeetingId, dragging, dayWidth } = this.state
    const monthName = monthNames[weekStart.getMonth()]
    const year = weekStart.getFullYear()

    return (
      <div
        className='WeekView'
        onMouseUp={this.endDragMeeting}
        onClick={this.unselectMeeting}>

        <div className='headerWrapper'>
          <h2>
            {monthName} {year}
          </h2>

          <ul className='dayLabels'>
            {this.dayLabels.map(({name, num}) =>
              <li key={num}>
                <span className='dayName'>{name}</span>
                <span className='dayNum'>{num}</span>
              </li>
            )}
          </ul>
        </div>

        <div
          className='gridWrapper'
          onMouseMove={this.dragMeeting}
          >
          <ul className='timeGrid'>
            {this.timeLabels.map((label, idx) =>
              <li
                key={idx}
                style={{height: hourHeight}}
                >
                <div className='timeLabel'>
                  {idx > 0 && label}
                </div>
              </li>
            )}
          </ul>

          <div className='dayColumnsWrapper' ref='dayColumns'>
            {meetingSegmentsByDay.map((segments, dayIdx) =>
              <DayView
                key={dayIdx}
                segments={segments}
                meetings={meetings}
                dayWidth={dayWidth}
                hourHeight={hourHeight}
                selectedMeetingId={selectedMeetingId}
                dragging={dragging}
                onSelectMeeting={this.selectMeeting}
              />
            )}
          </div>
        </div>

      </div>
    );
  }
}


function _indexDays(meetings, weekStart) {
  const weekStartTime = weekStart.getTime()
  Object.values(meetings).forEach((meeting) => {
    meeting.daysIdx = []
    const iStart = Math.floor((meeting.start.getTime() - weekStartTime) / 86400000)
    const nDays = Math.floor((meeting.end.getTime() - weekStartTime) / 86400000) + 1
    for (let i = iStart; i < nDays; i++) {
      meeting.daysIdx.push(i)
    }
  })
  return meetings
}


function _makeTimeLabels() {
  const labels = []
  for (let i = 0; i < 24; i++) {
    labels.push(
      (i % 12 || 12) + (i < 12 ? ' AM' : ' PM')
    )
  }
  return labels
}


function _makeDayLabels(weekStart, weekSize) {
  const labels = []
  for (let i = 0; i < weekSize; i++) {
    const d = new Date()
    d.setDate(weekStart.getDate() + i)
    labels.push({
      name: dayNamesShort[d.getDay()],
      num: d.getDate(),
    })
  }
  return labels
}

function _segmentMeetingsByDay(meetings, weekSize) {
  const toMinutes = (date) => date.getHours() * 60 + date.getMinutes()
  const meetingSegsByDay = new Array(weekSize).fill(0).map(() => ({}))
  Object.entries(meetings).forEach(([meetingId, meeting]) => {
    const segments = {}
    meeting.daysIdx.forEach((dayIdx, arIdx) => {
      if (dayIdx >= 0 && dayIdx < weekSize) {
        segments[dayIdx] = {
          meetingId,
          dayIdx,
          top: typeof meeting.daysIdx[arIdx - 1] === 'undefined' ? toMinutes(meeting.start) : 0,
          btm: typeof meeting.daysIdx[arIdx + 1] === 'undefined' ? toMinutes(meeting.end) - 1 : 1440
        }
      }
    })
    // Add segment(s) to relevant day(s)
    Object.entries(segments).forEach(([dayIdx, seg]) => {
      meetingSegsByDay[dayIdx][meetingId] = seg
    })
  })

  return meetingSegsByDay
}

function _tetrisizeByDay(meetingSegsByDay) {
  // Add `left` and `width` props (in place) for optimal fit without overlap
  return meetingSegsByDay.map((daySegments) => tetrisize(daySegments))
}

export default WeekView
