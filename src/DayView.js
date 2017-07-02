import React from 'react'
import cx from 'classnames'
import { dayNamesShort } from './constants'

const DayView = ({
  segments,
  meetings,
  dayWidth,
  hourHeight,
  selectedMeetingId,
  dragging,
  onSelectMeeting
}) => {
  const minuteHeight = hourHeight / 60

  return (
    <div
      className='DayView'
      style={{height: hourHeight * 24}}
      >
      {Object.entries(segments).map(([meetingId, segment]) => {
        const meeting = meetings[meetingId]
        const selected = selectedMeetingId === meetingId
        const draggingMe = dragging === meetingId

        return (
          <div
            className={cx('MeetingSegment', { selected })}
            key={meetingId}
            onMouseDown={onSelectMeeting.bind(null, meeting, segment)}
            onClick={(e) => e.stopPropagation()}
            style={{
              zIndex: selected ? 2 : 1,
              width: (draggingMe ? 1 : segment.width) * dayWidth,
              height: minuteHeight * (segment.btm - segment.top),
              left: draggingMe ? 0 : segment.left * dayWidth,
              top: minuteHeight * segment.top
            }}
            >
            <div
              className='bg'
              style={{backgroundColor: meeting.color}}
            />
            <div
              className='details'
              style={{
                color: selected ? '#fff' : meeting.color,
                borderLeftColor: meeting.color
              }}
              >
              {segment.btm - segment.top > 60 &&
                <ul>
                  <li className='title'>
                    {meeting.title}
                  </li>
                  <li className='time'>
                    {meeting.start.toLocaleTimeString(navigator.language, {hour:'2-digit', minute:'2-digit'})}
                  </li>
                  {meeting.daysIdx.length > 1 &&
                    <li className='day'>
                      {dayNamesShort[meeting.start.getDay()]}
                    </li>
                  }
                </ul>
              }
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default DayView
