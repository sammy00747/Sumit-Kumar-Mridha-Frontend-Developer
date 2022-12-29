import { useState, useEffect } from "react";
import axios from 'axios';

import './App.scss';
import loadingGif from './assets/loading.gif';
import noDataLogo from './assets/no-data.jpg'

function App() {
  const total=19;
  const pageSize=10;
  const [page,setPage] = useState(1);
  const statusEnum = ["unknown", "active", "retired", "destroyed"];
  const typeEnum = ["Dragon 1.0", "Dragon 1.1", "Dragon 2.0"];
  const [dashboardClass,setDashboardClass] = useState('dashboard');
  const [status,setStatus] = useState('');
  const [originalLaunch,setOriginalLaunch] = useState('');
  const [type,setType] = useState('');
  const [loading,setLoading] = useState(false);
  const [list,setList] = useState([]);
  const [showPages,setShowPages] = useState(true);

  const capitalizeFirstLetter = (str="") => {
    if(!str || typeof str!="string") return null;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const getCapsules = (pageButtonClicked=false) => {
    setLoading(true);
    if(status || originalLaunch || type) {
      setShowPages(false);
    }
    else {
      setShowPages(true);
      if(!pageButtonClicked && page!==1) {
        setPage(1);
        return;
      }
    }
    axios.get(`https://api.spacexdata.com/v3/capsules?status=${status}&original_launch=${originalLaunch && originalLaunch+':00.000Z'}&type=${type}&limit=${pageSize}${(pageButtonClicked && page>1) ? '&offset='+(page-1)*pageSize : ''}`).then(res => {
      setList(res.data.map(obj => ({
        ...obj,
        status: capitalizeFirstLetter(obj.status)
      })))
      setLoading(false);
    }, err => {
      console.log(err);
      setList([]);
      setLoading(false);
    });
  }

  useEffect(() => {
    getCapsules(true);
  },[page]);

  const showDashboard = () => {
    setDashboardClass(prevState => `${prevState} animate-dashboard`);
    setTimeout(getCapsules,2000);
  }

  const goToFirstPage = () => {
    if(page<=1) return;
    setPage(1);
  }

  const goToPreviousPage = () => {
    if(page<=1) return;
    setPage(prev => prev-1);
  }

  const goToNextPage = () => {
    if(page>=Math.floor((total+pageSize-1)/pageSize)) return;
    setPage(prev => prev+1)
  }

  const goToLastPage = () => {
    if(page>=Math.floor((total+pageSize-1)/pageSize)) return;
    setPage(Math.floor((total+pageSize-1)/pageSize));
  }

  return (
    <div className='main'>
      <h2 className='intro-title'>Welcome to SpaceX Capsules Viewer</h2>
      <div className='intro-description'>
        This module helps you to view different capsules, initiated by SpaceX.
      </div>
      <button className='intro-button' onClick={showDashboard}>Click here to begin.</button>
      <div className={dashboardClass}>
        <div className="filters-container">
          <div className="input-wrapper">
            <label>Status:</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option key='' value=''>Any</option>
              {statusEnum.map(stt => <option key={stt} value={stt}>{capitalizeFirstLetter(stt)}</option>)}
            </select>
          </div>
          <div className="input-wrapper">
            <label>Type:</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option key='' value=''>Any</option>
              {typeEnum.map(stt => <option key={stt} value={stt}>{stt}</option>)}
            </select>
          </div>
          <div className="input-wrapper">
            <label>Launched At:</label>
            <input type="datetime-local" value={originalLaunch} onChange={e => setOriginalLaunch(e.target.value,typeof e.target.value)} />
            <button onClick={() => setOriginalLaunch('')}>Clear</button>
          </div>
          <button className="search-button" onClick={() => getCapsules()}>Search</button>
        </div>
        {loading
        ? <div className="loading-container">
            <img src={loadingGif} alt="Loading..." />
          </div>
        : list.length
          ? <div className="capsules-container" style={{height: `calc(100% - ${!(loading || status || type || originalLaunch) && showPages ? '118.8' : '75.2'}px)`}}>
              {list.map(obj =>
                <div key={obj.capsule_serial} className="capsule-wrapper">
                  <div className="capsule">
                    <div className="capsule-header"><div>{obj.capsule_serial}</div></div>
                    <div className="capsule-info">
                      <div><b>Type: </b>{obj.type}</div>
                      <div><b>Details: </b>{obj.details || <i style={{color:'#aaa'}}>Not Available</i>}</div>
                      <div><b>Launched At: </b>{obj.original_launch ? new Date(obj.original_launch).toUTCString() : <i style={{color:'#aaa'}}>Not Available</i>}</div>
                      <div><b>Status: </b>{obj.status}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            : <div className="loading-container">
                <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <img src={noDataLogo} alt="No Data" style={{height:'70px'}} />
                  <div style={{width:'max-content'}}>No data found with the filters set. You can search with different filters, or try again after some time.</div>
                </div>
              </div>
        }
        {!(loading || status || type || originalLaunch) && showPages ? <div className="pagination-container">
          <div className={page>1 ? "page-button" : "page-button disabled"} onClick={goToFirstPage}>First</div>
          <div className={page>1 ? "page-button" : "page-button disabled"} onClick={goToPreviousPage}>Previous</div>
          <div className="pageNo-display">{page}</div>
          <div className={page<Math.floor((total+pageSize-1)/pageSize) ? "page-button" : "page-button disabled"} onClick={goToNextPage}>Next</div>
          <div className={page<Math.floor((total+pageSize-1)/pageSize) ? "page-button" : "page-button disabled"} onClick={goToLastPage}>Last</div>
        </div> : ''}
      </div>
    </div>
  );
}

export default App;
