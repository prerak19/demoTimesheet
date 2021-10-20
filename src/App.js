import React from 'react';
import { exampleData } from './exampleData';
import Header from './Components/Header/Header';
import ProfileDetails from './Components/ProfileDetails/ProfileDetails';
import { minsToTimeStr } from "./utils/time-util";
import './App.scss'
import moment from 'moment';
import { groupBy, map, sortBy, sum, unzip } from 'lodash';

const timeStrToMins = (strTime) => {
  let str = moment(strTime, 'hh:mm A').format('HH:mm');
  return moment.duration(str).asMinutes();
}

let timeout;

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      startDate: '',
      valueList: {},
      calendarDates: [],
      endDate: '',
      totalData: [],
      typeSumArr: [],
      startTimer: false,
      totalHours: 0,
    };
  }

  componentDidMount() {
    this.onChangeOfDate();
  }

  onChangeOfDate = (start = moment().format('YYYY-MM-DD'), end = moment().add(6, 'days').format('YYYY-MM-DD')) => {
    let list = [];
    let valueList = [];
    let now = moment(start).clone(), dates = [];
    while (now.isSameOrBefore(moment(end))) {
      dates.push(now.format('YYYY-MM-DD'));
      now.add(1, 'days');
    }
    Object.entries(exampleData.emp_data).map((x, i) => {
      let val = dates.filter((o1) => {
        return !x[1].some(o2 => {
          return o1 === o2.date;
        });
      })
      val = val.map((exDate) => ({ date: exDate, inTime: null, outTime: null }));
      let nameArr = [...x[1], ...val];
      let nameOfType = x[0];
      let inTimeLength = 0;
      let outTimeLength = 0;
      nameArr.map((y) => {
        if (moment(y.date).isSame(start) || moment(y.date).isSame(end) || moment(y.date).isBetween(start, end)) {
          if ((y.inTime || []).length > inTimeLength) {
            inTimeLength = y.inTime.length;
          }
          if ((y.outTime || []).length > outTimeLength) {
            outTimeLength = y.outTime.length;
          }
        }
      })
      nameArr.map((y, key) => {
        if (moment(y.date).isSame(start) || moment(y.date).isSame(end) || moment(y.date).isBetween(start, end)) {
          if (!Object(y).hasOwnProperty('value') && !Object(y).hasOwnProperty('inOut') && valueList.find((x) => x.date !== y.date)) {
            valueList.push({ nameOfType, date: y.date, ptoOff: null, value: null })
          }
          if (y.value === '' || y.value) {
            valueList.push({ nameOfType, date: y.date, ptoOff: y.ptoOff || null, value: y.value || null });
          } else {
            while ((y.outTime || []).length !== outTimeLength) {
              y.outTime = y.outTime !== null ? [...y.outTime, null] : [null];
            }
            while ((y.inTime || []).length !== inTimeLength) {
              y.inTime = y.inTime !== null ? [...y.inTime, null] : [null];
            }
            let sortArr = [...y.inTime || [], ...y.outTime || []].sort(function (a, b) {
              const assignValue = val => {
                if (val === null || val === 0) {
                  return Infinity;
                }
                else {
                  return val;
                };
              };
              return assignValue(timeStrToMins(a)) - assignValue(timeStrToMins(b));
            });
            sortArr.map((time, index) => {
              list.push((index % 2 === 0) ? { date: y.date, nameOfType, time, index, outPunch: y.outPunch_2, label: 'In' } : { date: y.date, outPunch: y.outPunch_2, nameOfType, time, index, label: 'Out' });
            })
          }
        }
      })
    });
    list = sortBy(list, 'index');
    let mainTimeData = groupBy(list, 'nameOfType');
    let totalOfDates = {};
    mainTimeData && Object.entries(mainTimeData).map((x, i) => {
      x[1].sort((a, b) => new Date(a.date) - new Date(b.date));
      let dateGrp = x[1] && x[1].length ? Object.values(groupBy(x[1], 'date')) : [];
      dateGrp.map((data, k) => {
        const { outValue, InValue } = this.sumOfDate(data);
        let time = outValue - InValue;
        if (totalOfDates[data[0].nameOfType]) {
          totalOfDates[data[0].nameOfType].push(Number(time));
        } else {
          totalOfDates[data[0].nameOfType] = [Number(time)];
        }
      });
    });
    let valueSumArr = valueList.map((va) => timeStrToMins(va.value))
    let typeSumArr = map(unzip(Object.values(totalOfDates)), sum);
    valueSumArr = [...typeSumArr, ...valueSumArr]
    let totalHours = minsToTimeStr(sum(valueSumArr));
    valueList = groupBy(valueList, 'nameOfType');
    this.setState({
      startDate: start, endDate: end, calendarDates: dates, totalData: mainTimeData,
      typeSumArr, valueList, totalHours
    });
  }

  sumOfDate = (dataofDate) => {
    let InValue = 0;
    let outValue = 0;
    dataofDate.map((data, k) => {
      if (data.label === 'In') {
        InValue = InValue + Number(timeStrToMins(data.time));
      } else {
        outValue = outValue + Number(timeStrToMins(data.time));
      }
    });
    return { outValue, InValue };
  }

  startCount = () => {
    this.setState({ startTimer: !this.state.startTimer }, () => {
      if (this.state.startTimer === false) {
        clearInterval(timeout);
        document.getElementById("timer").innerHTML = ""
      } else {
        timeout = setInterval(() => this.displayTimer(), 1000);
      }
    })
  }

  plz = (digit) => {
    var zpad = digit + '';
    if (digit < 10) {
      zpad = "0" + zpad;
    }
    return zpad;
  }

  displayTimer = () => {
    var time_shown = document.getElementById("timer").innerHTML;
    var time_chunks = time_shown.split(":");
    var hour, mins, secs;

    hour = Number(time_chunks[0]);
    mins = Number(time_chunks[1]);
    secs = Number(time_chunks[2]);
    secs++;
    if (secs == 60) {
      secs = 0;
      mins = mins + 1;
    }
    if (mins == 60) {
      mins = 0;
      hour = hour + 1;
    }
    if (hour == 13) {
      hour = 1;
    }
    document.getElementById("timer").innerHTML = hour + ":" + this.plz(mins) + ":" + this.plz(secs);
  }

  render() {
    const { totalData, calendarDates, typeSumArr, startDate, endDate, startTimer, valueList, totalHours } = this.state;
    const emp_Details = [
      { label: 'NAME:', value: exampleData.emp_name },
      { label: 'BRANCH:', value: exampleData.branch },
      { label: 'DEPARTMENT:', value: exampleData.department },
      { label: 'PERIOD:', value: `${moment(startDate).format('MM/DD/YYYY')}${endDate !== 'Invalid date' ? ` - ${moment(endDate).format('MM/DD/YYYY')}` : ''}` },
    ]
    return (
      <div className="App">
        <Header />
        <br />
        <ProfileDetails changeData={(start, end) => this.onChangeOfDate(start, end)} />
        <br />
        <div className="row">
          <div className="col-6">
            <table border="1" cellPadding="0" cellSpacing="0" className="header-table w-100">
              <tbody className="text-center">
                <tr className="bg-blue text-white">
                  <td colSpan="2">Joe Allen's Accumulated Time</td>
                </tr>
                <tr>
                  <td>Week ({moment(startDate).format('LL')}{endDate !== 'Invalid date' ? `- ${moment(endDate).format('LL')}` : null})</td>
                  <td>Pay period(Apr 17, 2021 - Apr 30, 2021)</td>
                </tr>
                <tr className="text-blue font-weight-bold">
                  <td>{totalHours} Hrs</td>
                  <td>76.25 Hrs</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="col-3" />
          <div className="col-3 text-right">
            <div className="row">
              <div className="col-8 px-0">
                <select id="cars" name="carlist" form="empForm" className="height35 w-75">
                  <option value="volvo">OHTA (948)</option>
                </select>
              </div>
              <div className="col-4">
                <button className={`btn ${startTimer ? 'btn-danger' : 'btn-success'} btn-sm height35 w-100`} onClick={() => this.startCount()}> {startTimer ? 'Clock Out' : 'CLock In'}</button>
              </div>
            </div>
            <div className="row mt-2 attendanceRate">
              <div className="col-4" id="timer">
                {this.state.startTimer ? '00:00:00' : ''}
              </div>
              <div className="col-8">
                Start time: {moment().format('h:mm:ss A MMMM DD, YYYY')}
              </div>
            </div>
          </div>
        </div>
        <table border={1} className="w-100 header-table">
          <thead className="text-center">
            <tr className="bg-blue text-white p-2">
              <td colSpan="10" className="text-left pl-2 fs25 font-weight-bold" >WEEKLY TIMESHEET</td>
            </tr>
            {emp_Details.map((x, i) => {
              return <tr key={i}>
                <td className="text-right pr-2 font-weight-bold">{x.label}</td>
                <td colSpan="9" className="text-left pl-2">{x.value}</td>
              </tr>
            })}
            <tr>
              <td colSpan={2}></td>
              {calendarDates.map((x, i) => {
                let day = moment(x).format('ddd');
                let date = moment(x).format('MMMM DD, YYYY');
                return <td key={i} className="text-center text-blue row-background"><span>{day}</span><br />{date}</td>
              })}
              <td className="text-blue row-background">Total Hours</td>
            </tr>
          </thead>
          <tbody className="text-center">
            {Object.entries(totalData).map((x, i) => {
              x[1].sort((a, b) => new Date(a.date) - new Date(b.date));
              let indexGrp = x[1] && x[1].length ? Object.values(groupBy(x[1], 'index')) : [];
              let dateGrp = x[1] && x[1].length ? Object.values(groupBy(x[1], 'date')) : [];
              return indexGrp.map((data, k) => {
                let typeSum = [];
                return <React.Fragment key={k}>
                  <tr>
                    {k === 0 ? <td rowSpan={indexGrp.length} colSpan={1} className="font-weight-bold">{x[0]}</td> : null}
                    <td>{data[0].label}</td>
                    {data.map((timeData, l) =>
                      timeData.time ?
                        <td key={l}>{timeData.time}</td> :
                        <td key={l} />)}
                    <td />
                  </tr>
                  {k + 1 === indexGrp.length &&
                    <tr key={k} className="row-background font-weight-bold">
                      <td colSpan={2}>{x[0]} Hours</td>
                      {dateGrp.map((data, j) => {
                        const { outValue, InValue } = this.sumOfDate(data);
                        typeSum.push(outValue - InValue);
                        return <td ket={j} className="text-blue">{minsToTimeStr(outValue - InValue)}</td>
                      })}
                      <td>{minsToTimeStr(sum(typeSum))}</td>
                    </tr>
                  }
                </React.Fragment>
              })
            })}
            {Object.entries((valueList)).map((val, key) => {
              let sumValArr = val[1].map((sumVal) => Number(sumVal.value));
              return <tr key={key}>
                <td colSpan={2} className="font-weight-bold">{val[0]}</td>
                {val[1].map((catchVal, i) => <td key={i}>{catchVal.ptoOff ? <span className="ptoCircle mr-2"><span className="d-block mt-1">{catchVal.ptoOff}</span></span> : null}{catchVal.value}</td>)}
                <td className="font-weight-bold">{(sum(sumValArr))}</td>
              </tr>
            })}
            {typeSumArr && typeSumArr.length > 0 && <tr>
              <td colSpan={2} className="font-weight-bold">Total Hours</td>
              {typeSumArr.map((x, i) => <td key={i} className="font-weight-bold">{minsToTimeStr(x)}</td>)}
              <td className="font-weight-bold">{totalHours}</td>
            </tr>}
          </tbody>
        </table>
        <table border={1} className="w-100 header-table">
          <thead className="text-center">
            <tr className="bg-blue text-white p-2">
              <td colSpan="10" className="fs25" >Timesheet Changes</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4}> <span className="my-1 ptoCircle text-center mr-2">1</span>Paid Time off (PTO) {moment().format('dddd (ll)')}: PTO Added -- Change made by John Manager on 01:58 PM Apr 29, 2018</td>
            </tr>
            <tr>
              <td colSpan={4}>
                <span className="my-1 ptoCircle text-center mr-2"><span className="d-block mt-1">2</span></span>
                OHTA Out Punch {moment().format('dddd ll')}: Updated Last Punch -- Change made by John Manager on 04:58 PM Apr 29, 2018
              <img src="images/signin.png" className="pl-3 cursor-pointer" alt="sign" width="70px" onClick={() => alert('Changes Has been Done.')} />
              </td>
            </tr>
            <tr style={{ height: '70px' }}>
              <td width="30%">
                <img src="images/signin.png" className="float-right pr-3" alt="sign" />
                <span className="font-weight-bold">Employee Signature:</span>
              </td>
              <td>
                <span className="font-weight-bold">Date :</span>
              </td>
              <td width="30%">
                <span className="font-weight-bold">Approval Signature :</span>
              </td>
              <td>
                <span className="font-weight-bold">Date :</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
