import React from 'react';
import './styles/index.css';
import colors from './constants/colors.js'
import WeekView from './WeekView.js'

const ids = new Array(10).fill(1).map(() =>
  ('0000' + ((Math.random() * Math.pow(36, 4)) | 0).toString(36)).slice(-4))

const weekStart = new Date(2017, 5, 18)

const weekSize = 7

const meetings = {
  [ids[0]]: {
    id: ids[0],
    start: new Date(2017, 5, 17, 16, 0),
    end: new Date(2017, 5, 18, 12, 0),
    title: 'Overnight meeting',
    color: colors.amethyst
  },
  [ids[1]]: {
    id: ids[1],
    start: new Date(2017, 5, 19, 8, 30),
    end: new Date(2017, 5, 19, 13, 30),
    title: 'The Penski file',
    color: colors.belizehole
  },
  [ids[2]]: {
    id: ids[2],
    start: new Date(2017, 5, 19, 6, 0),
    end: new Date(2017, 5, 19, 9, 0),
    title: 'Accounting',
    color: colors.carrot
  },
  [ids[3]]: {
    id: ids[3],
    start: new Date(2017, 5, 20, 12, 0),
    end: new Date(2017, 5, 21, 10, 0),
    title: 'Hackathon',
    color: colors.sunflower
  },
  [ids[4]]: {
    id: ids[4],
    start: new Date(2017, 5, 22, 12, 0),
    end: new Date(2017, 5, 22, 14, 15),
    title: 'All hands',
    color: colors.nephritis
  },
  [ids[5]]: {
    id: ids[5],
    start: new Date(2017, 5, 19, 5, 0),
    end: new Date(2017, 5, 19, 6, 30),
    title: 'Morning brief',
    color: colors.concrete
  },
}

const App = () => (
  <div className='App'>
    <WeekView {...{weekStart, weekSize, meetings}}/>
  </div>
)

export default App
