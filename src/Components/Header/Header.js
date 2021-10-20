import moment from 'moment';

function Header() {
  return (
    <div className="row header mx-0">
      <img src="images/logo192.png" className=" p-3" width="12%" alt="logo"/>
      <div className="p-3 ml-2 d-flex align-items-center" style={{ backgroundColor: '#7dc24b' }}>
        <h5 className="mb-0 font-weight-bold text-white">My Timesheet</h5>
      </div>
      <div className="ml-auto mr-2 d-flex align-items-center">
        <h5 className="pt-3 mb-0 font-weight-bold text-white">{moment().format('lll')}</h5>
        <img src="images/profileImage.png" className="profileImage" alt="profileImage" width="70px" />
        <i className="pt-3 ml-4 mr-3 fa fa-lg font-weight-bold fa-angle-down"></i>
      </div>
    </div>
  );
}

export default Header;