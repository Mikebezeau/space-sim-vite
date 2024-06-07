import { memo, useState } from "react";
import "../../css/cockpitView/dashboardReadout.css";

const PreDashboardReadout = () => {
  console.log("DashboardReadout rendered");

  const [time, setTime] = useState("00 : 00");
  const [date, setDate] = useState("00 / 00 / 0000");
  /*
  function updateTime() {
    let currentTime = new Date();
    let hours = currentTime.getHours();
    let minutes = currentTime.getMinutes();
    hours = (hours < 10 ? "0" : "") + hours;
    minutes = (minutes < 10 ? "0" : "") + minutes;
    let timeString = hours + " : " + minutes;
    setTime(timeString);
  }

  function updateDate() {
    let currentDate = new Date();
    let day = currentDate.getDate();
    let month = currentDate.getMonth() + 1;
    let year = currentDate.getFullYear();
    month = (month < 10 ? "0" : "") + month;
    let dateString = day + " / " + month + " / " + year;
    setDate(dateString);
  }

  useEffect(() => {
    const dashboardUpdateInterval = setInterval(() => {
      //updateTime();
      //updateDate();
    }, 1000);
    return () => {
      console.log("clearing dashboard interval");
      clearInterval(dashboardUpdateInterval);
    };
  }, []);
*/
  return (
    <div
      className="container"
      style={{ position: "absolute", top: "0", left: "0" }}
    >
      <div className="part1">
        <div className="time-div">
          <span>
            <i className="fa-solid fa-clock"></i>
          </span>
          <span className="time">{time} </span>
        </div>
        <div className="date-div">
          <span>
            <i className="fa-solid fa-calendar-days"></i>
          </span>
          <span className="date">{date}</span>
        </div>
        <div className="temperature-div">
          <span>
            <i className="fa-solid fa-temperature-low"></i>
          </span>
          <span>21° C</span>
        </div>
        <div className="location-div">
          <span>
            <i className="fa-solid fa-location-dot"></i>
          </span>
          <span>New York</span>
        </div>
        <div className="phone-icons-div">
          <div className="satellite-div">
            <span>
              <i className="fa-solid fa-satellite"></i>
            </span>
          </div>
          <div className="gsm-signal-div">
            <span>
              <i className="fa-solid fa-signal"></i>
            </span>
          </div>
          <div className="battery-phone-div">
            <span>
              <i className="fa-solid fa-battery-full"></i>
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>
      <div className="part2">
        <div className="signal-left">
          <i className="fa-solid fa-circle-arrow-left"></i>
        </div>
        <div className="direction">
          <div className="div1">
            <span className="span1">
              <i className="fa-solid fa-diamond-turn-right"></i>
            </span>
            <br />
            <span className="span2">204 m</span>
          </div>
          <div className="div2">
            <span className="span1">Turn left</span>
            <hr />
            <span className="span2">Castleton Ave</span>
          </div>
        </div>
        <div className="signal-right">
          <i className="fa-solid fa-circle-arrow-right"></i>
        </div>
      </div>
      <div className="part3">
        <div className="tachometer">
          <div className="tachometer-numbers">
            <div className="tachometer-item first">0</div>
            <div className="tachometer-item second">01</div>
            <div className="tachometer-item third">02</div>
            <div className="tachometer-item fourh">03</div>
            <div className="tachometer-item fifth">04</div>
            <div className="tachometer-item sixth">05</div>
            <div className="tachometer-item seventh">06</div>
            <div className="tachometer-item eighth">07</div>
            <div className="tachometer-item ninth">08</div>
            <div className="tachometer-item red tenth">09</div>
            <div className="tachometer-item red eleventh">10</div>
          </div>
          <div className="tachometer-pointer">
            <div className="tachometer-pointer-border"></div>
            <div className="tachometer-pointer-box"></div>
          </div>
          <div className="tachometer-icons">
            <span className="oil-icon">
              <i className="fa-solid fa-oil-can"></i>
            </span>
            <span className="door-icon">
              <i className="fa-solid fa-door-open"></i>
            </span>
            <span className="triangle-icon">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </span>
            <span className="key-icon">
              <i className="fa-solid fa-key"></i>
            </span>
          </div>
        </div>
        <div className="middle">
          <div>
            <div className="middle-top">
              <span className="number">269</span> <br />
              <span className="km-h">Km/h</span>
            </div>
            <div className="middle-bottom">
              <div className="left-line"></div>
              <div>
                <div className="gas-div">
                  <div>
                    <span className="gas-icon">
                      <i className="fa-solid fa-gas-pump"></i>
                    </span>
                  </div>
                  <div>
                    <span>9 L</span> <br />
                    <span>12%</span>
                  </div>
                </div>
              </div>
              <div className="center-line">
                <div>
                  <span style={{ color: "rgba(255, 255, 255, 0.055)" }}>|</span>
                </div>
                <div>
                  <span style={{ color: "rgba(255, 255, 255, 0.151)" }}>|</span>
                </div>
                <div>
                  <span style={{ color: "rgba(255, 255, 255, 0.452)" }}>|</span>
                </div>
                <div>
                  <span className="vehicle-icon">
                    <i className="fa-solid fa-car-rear"></i>
                  </span>
                </div>
                <div>
                  <span style={{ color: "rgba(255, 255, 255, 0.733)" }}>|</span>
                </div>
                <div>
                  <span style={{ color: "white" }}>|</span>
                </div>
              </div>
              <div>
                <div className="battery-div">
                  <span className="battery-icon">
                    <i className="fa-solid fa-car-battery"></i>
                  </span>
                  <div>
                    <span>12.8 V</span> <br />
                    <span>100%</span>
                  </div>
                </div>
              </div>
              <div className="right-line"></div>
            </div>
          </div>
        </div>
        <div className="speedometer">
          <div className="speedometer-numbers">
            <div className="speedometer-item first">0</div>
            <div className="speedometer-item second">30</div>
            <div className="speedometer-item third">60</div>
            <div className="speedometer-item fourh">90</div>
            <div className="speedometer-item fifth">120</div>
            <div className="speedometer-item sixth">150</div>
            <div className="speedometer-item seventh">180</div>
            <div className="speedometer-item eighth">210</div>
            <div className="speedometer-item ninth">240</div>
            <div className="speedometer-item red tenth">270</div>
            <div className="speedometer-item red eleventh">300</div>
          </div>
          <div className="speedometer-pointer">
            <div className="speedometer-pointer-border"></div>
            <div className="speedometer-pointer-box"></div>
          </div>
          <div className="speedometer-klm">
            <span>Km/h</span>
          </div>
        </div>
      </div>
      <div className="part4">
        <div className="hover-div">
          <div>
            <span>
              <i className="fa-solid fa-flag"></i>
            </span>
            <span>87269 Km</span>
          </div>
          <div>
            <span className="tooltip-text">Tolal KM</span>
          </div>
        </div>
        <div className="hover-div">
          <div>
            <span>
              <i className="fa-solid fa-flag"></i>
            </span>
            <span>79 Km</span>
          </div>
          <div>
            <span className="tooltip-text">KM Today</span>
          </div>
        </div>
        <div className="hover-div">
          <div>
            <span>
              <i className="fa-solid fa-stopwatch"></i>
            </span>
            <span>01 h 03 m</span>
          </div>
          <div>
            <span className="tooltip-text">Driving Time</span>
          </div>
        </div>
        <div className="hover-div">
          <div>
            <span>
              <i className="fa-solid fa-stopwatch"></i>
            </span>
            <span>00 h : 02 m</span>
          </div>
          <div>
            <span className="tooltip-text">Idle Time</span>
          </div>
        </div>
        <div className="hover-div">
          <div>
            <span>
              <i className="fa-solid fa-stopwatch"></i>
            </span>
            <span>00 h : 19 m</span>
          </div>
          <div>
            <span className="tooltip-text">Stopping Time</span>
          </div>
        </div>
        <div className="hover-div">
          <div>
            <span>
              <i className="fa-solid fa-stopwatch"></i>
            </span>
            <span>00 h : 30 m</span>
          </div>
          <div>
            <span className="tooltip-text">Current Status</span>
          </div>
        </div>
        <div className="hover-div">
          <div>
            <span>
              <i className="fa-solid fa-clock"></i>
            </span>
            <span>17 : 55</span>
          </div>
          <div>
            <span className="tooltip-text">Started Driving</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardReadout = memo(PreDashboardReadout);
export default DashboardReadout;
