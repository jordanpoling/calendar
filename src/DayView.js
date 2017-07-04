import React from 'react'
import cx from 'classnames'
import { dayNamesShort } from './constants'

const getOrderedSegments = (segments) => {
  return Object.values(segments).sort((a, b) => {
    if (a.top < b.top) return -1
    if (a.top > b.top) return 1
    if (a.btm < b.btm) return -1
    if (a.btm > b.btm) return 1
    return 0
  })
}

const DayView = ({
  segments,
  meetings,
  dayWidth,
  hourHeight,
  selectedMeetingId,
  dragging,
  onSelectMeeting,
  dayIdx
}) => {
  const minuteHeight = hourHeight / 60

  const orderedSegments = getOrderedSegments(segments)

  const clashes = []

  if (Object.keys(segments).length && segments[selectedMeetingId]) {

    const selectedSeg = segments[selectedMeetingId]

    for (let i = 0; i < orderedSegments.length; i++) {
      const otherSeg = orderedSegments[i]

      if (otherSeg.meetingId === selectedMeetingId) continue

      if (
        (otherSeg.btm >= selectedSeg.top && otherSeg.top <= selectedSeg.btm) ||
        (otherSeg.btm <= selectedSeg.btm && otherSeg.btm >= selectedSeg.top)
      ) {
        const left = dayWidth * Math.min(otherSeg.left, selectedSeg.left)
        const right = dayWidth * (otherSeg.left > selectedSeg.left ? otherSeg.left + otherSeg.width : selectedSeg.left + selectedSeg.width)

        clashes.push({
          top: minuteHeight * Math.max(selectedSeg.top, otherSeg.top),
          left: left,
          width: right - left,
          height: minuteHeight * (Math.min(selectedSeg.btm, otherSeg.btm) - Math.max(selectedSeg.top, otherSeg.top))
        })
      }

    }
  }

  return (
    <div
      className='DayView'
      style={{height: hourHeight * 24}}
      >

      {orderedSegments.map((segment, idx) => {
        const { meetingId } = segment
        const meeting = meetings[meetingId]
        const selected = selectedMeetingId === meetingId
        const draggingMe = dragging === meetingId
        const isFirst = segment.dayIdx === meeting.daysIdx[0]
        const isLast = segment.dayIdx === meeting.daysIdx[meeting.daysIdx.length - 1]

        // const myWidth = typeof segment.width !== 'undefined' ? segment.width 
        //
        // if (!draggingMe) {
        //   console.log(segment, segment.width, typeof segment === 'undefined', selected);
        // }

        return (
          <div
            className={cx('MeetingSegment', { selected })}
            key={meetingId}
            onMouseDown={onSelectMeeting.bind(null, meeting, segment, 'move')}
            onClick={(e) => e.stopPropagation()}
            style={{
              zIndex: selected ? 2 : 1,
              width: (draggingMe ? 1 : segment.width) * dayWidth,
              height: minuteHeight * (segment.btm - segment.top),
              left: draggingMe ? 0 : segment.left * dayWidth,
              top: minuteHeight * segment.top
            }}
            >
            {isFirst &&
              <div
                className='edge top'
                onMouseDown={onSelectMeeting.bind(null, meeting, segment, 'changeStart')}
              />
            }
            {isLast &&
              <div
                className='edge bottom'
                onMouseDown={onSelectMeeting.bind(null, meeting, segment, 'changeEnd')}
              />
            }
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

      {clashes.map((clash, idx) =>
        <div
          key={idx}
          className='clash'
          style={{
            left: clash.left,
            top: clash.top,
            width: clash.width,
            height: clash.height
          }}
        />
      )}

    </div>
  )
}

export default DayView
