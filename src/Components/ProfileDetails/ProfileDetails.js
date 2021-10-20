import { useState } from 'react';
import moment from 'moment';
import { DatePicker, Space } from "antd";
import 'antd/dist/antd.css';

const ProfileDetails = (props) => {

  const [startDate, setStartDate] = useState(moment());

  const onChange = (date, dateString) => {
    setStartDate(date);
    props.changeData(dateString, moment(date).add(6, 'days').format('YYYY-MM-DD'));
  };

  return (
    <div className="row profileDetails p-2 mx-0 pl-4 align-items-center">
      <h4 className="font-weight-bold mb-0">Allen, Joe</h4>
      <h3 className="attendanceRate ml-3 mb-0 font-weight-bold">{'98.9%'}</h3>
      <h4 className="ml-3 pt-2 mb-0" style={{ fontSize: '18px' }}>Attendance Rate</h4>
      <h3 className="attendanceRate ml-3 mb-0 font-weight-bold">{'0.67%'}</h3>
      <h4 className="ml-3 pt-2 mb-0" style={{ fontSize: '18px' }}>Computer Idle Time</h4>
      <div className="ml-auto mr-2 d-flex align-items-center">
        <Space direction="vertical">
          <DatePicker
            format="YYYY-MM-DD"
            disabledDate={(current) => moment(current).day() !== 0}
            onChange={onChange}
            value={startDate}
            allowClear={false} 
            suffixIcon={<i className="dateCalendar fa fa-lg font-weight-bold fa-calendar"></i>}
          // showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
          />
        </Space>
      </div>
    </div>
  );
}

export default ProfileDetails;