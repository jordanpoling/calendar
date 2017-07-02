let curGroup = null

function _fitSegment(seg) {
  let fits = false
  // Try to fit segment within existing group columns
  for (let j = 0; j < curGroup.columnBtms.length; j++) {
    // Segment fits in existing column(s)
    if (seg.top > curGroup.columnBtms[j]) {
      // First column to accommodate
      if (seg.firstCol < 0) seg.firstCol = j
      // Add/continue adding cols to span
      seg.colsSpan++
      // Update bottom boundry of column (and group)
      curGroup.columnBtms[j] = seg.btm
      if (seg.btm > curGroup.groupBtm) curGroup.groupBtm = seg.btm
      fits = true
    }
  }
  return fits
}

export default function tetrisize(segments) {
  const groups = []

  // Create ordered array of segments
  const orderedSegments = Object.values(segments).sort((a, b) => {
    if (a.top < b.top) return -1
    if (a.top > b.top) return 1
    if (a.btm < b.btm) return -1
    if (a.btm > b.btm) return 1
    return 0
  })

  // Fit segments
  for (let i = 0; i < orderedSegments.length; i++) {
    const seg = orderedSegments[i]
    seg.firstCol = -1
    seg.colsSpan = 0

    // Doesn't overlap with current group. Start new one...
    if (i === 0 || seg.top > curGroup.groupBtm) {
      seg.firstCol = 0
      seg.colsSpan = 1
      curGroup = {
        segments: [seg],
        columnBtms: [seg.btm],
        groupBtm: seg.btm
      }
      groups.push(curGroup)

    // Overlaps with current group...
    } else {
      const didFit = _fitSegment(seg)

      if (!didFit) {
        // Didn't fit. Add new column
        seg.firstCol = curGroup.columnBtms.length
        seg.colsSpan = 1
        curGroup.columnBtms.push(seg.btm)
        if (seg.btm > curGroup.groupBtm) curGroup.groupBtm = seg.btm
      }

      curGroup.segments.push(seg)
    }
  }

  // Normalize segment dimensions to max 1
  groups.forEach(({ segments, columnBtms }) => {
    const totalCols = columnBtms.length
    segments.forEach((seg) => {
      seg.left = seg.firstCol / totalCols
      seg.width = seg.colsSpan / totalCols
    })
  })

  return segments
}
