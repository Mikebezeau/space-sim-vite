import React from "react";
import { Fragment, useState } from "react";
import ShieldsReadout from "./ShieldsReadout";
import WeaponsReadout from "./WeaponsReadout";
// @ts-ignore
import screenCityInfo from "/images/sreenWindowImages/screenCityInfo.png";
// @ts-ignore
import screenKeyboard from "/images/sreenWindowImages/screenKeyboard.png";
// @ts-ignore
import screenMenuBlank from "/images/sreenWindowImages/screenMenuBlank.png";
// @ts-ignore
import screenMenuCharacterHead from "/images/sreenWindowImages/screenMenuCharacterHead.png";
// @ts-ignore
import screenMenuCharacterTorso from "/images/sreenWindowImages/screenMenuCharacterTorso.png";
// @ts-ignore
import screenMenuCharacterUpgrades from "/images/sreenWindowImages/screenMenuCharacterUpgrades.png";
// @ts-ignore
import screenMenuDesignMain from "/images/sreenWindowImages/screenMenuDesignMain.png";
// @ts-ignore
import screenMenuEquipAmount from "/images/sreenWindowImages/screenMenuEquipAmount.png";
// @ts-ignore
import screenMenuEquipCircles from "/images/sreenWindowImages/screenMenuEquipCircles.png";
// @ts-ignore
import screenMenuMainSelect from "/images/sreenWindowImages/screenMenuMainSelect.png";
// @ts-ignore
import screenMenuMainSelect2 from "/images/sreenWindowImages/screenMenuMainSelect2.png";
// @ts-ignore
import screenMenuOptions from "/images/sreenWindowImages/screenMenuOptions.png";
// @ts-ignore
import screenMenuSubSelect from "/images/sreenWindowImages/screenMenuSubSelect.png";
// @ts-ignore
import screenMenuSymbols from "/images/sreenWindowImages/screenMenuSymbols.png";
// @ts-ignore
import screenMenuTabletCircles from "/images/sreenWindowImages/screenMenuTabletCircles.png";
// @ts-ignore
import screenMenuTactics from "/images/sreenWindowImages/screenMenuTactics.png";
// @ts-ignore
import screenMenuTactics2 from "/images/sreenWindowImages/screenMenuTactics2.png";
// @ts-ignore
import screenMenuTactics3 from "/images/sreenWindowImages/screenMenuTactics3.png";
// @ts-ignore
import screenMiniGame from "/images/sreenWindowImages/screenMiniGame.png";
// @ts-ignore
import screenMiniGameConnect from "/images/sreenWindowImages/screenMiniGameConnect.png";
// @ts-ignore
import screenStreetView from "/images/sreenWindowImages/screenStreetView.png";
// @ts-ignore
import screenViewScores from "/images/sreenWindowImages/screenViewScores.png";
// @ts-ignore
import screenViewShips from "/images/sreenWindowImages/screenViewShips.png";
// @ts-ignore
import selectShip from "/images/sreenWindowImages/selectShip.png";
// @ts-ignore
import solarMap from "/images/sreenWindowImages/solarMap.png";
// @ts-ignore
import solarMap2 from "/images/sreenWindowImages/solarMap2.png";

const MonitorReadout = () => {
  const [selectedSection, setSelectedSection] = useState("status");

  const handleSectionChange = (section) => {
    setSelectedSection(section);
  };

  const menuItems = [
    "status",
    "system",
    "environmental",
    "life support",
    "propulsion",
    "defensive",
    "weapon",
    "communication",
    "navigation",
    "power",
    "maintenance",
    "crew",
  ];
  return (
    <div className="relative text-xs">
      <div className="flex flex-wrap">
        {menuItems.map((item, index) => (
          <Fragment key={item}>
            <div
              onClick={() => handleSectionChange(item)}
              className="pointer-events-auto icon-button-cyber w-[20px] h-10 ml-[1px] mb-1"
            >
              <span
                className={`icon-button-cyber-content rounded-tr-full ${
                  selectedSection === item && "bg-cyan-400"
                }`}
              />
            </div>
            {index === 3 && <div className="w-full" />}
          </Fragment>
        ))}
      </div>
      <div className="pl-2 pt-1">
        {selectedSection === "status" && (
          <div className="section">
            <img
              src={screenCityInfo}
              className="absolute w-[110px] h-[150px]"
              alt="city info"
            />
            <div className="hidden">
              <h2>Combat</h2>
              <ShieldsReadout isAlwaysDisplay={true} />
              <WeaponsReadout isAlwaysDisplay={true} />
            </div>
          </div>
        )}

        {selectedSection === "system" && (
          <div className="section">
            <img
              src={screenKeyboard}
              className="absolute w-[110px] h-[150px]"
              alt="city info"
            />
            <div className="hidden">
              <h2>System</h2>
              <p className="item">Ship Status: Operational</p>
              <p className="item">Crew Status: 7/7 Active</p>
              <p className="item">
                Mission Time Elapsed: 176 days, 14 hours, 22 minutes
              </p>
              <p className="item">
                Current Location: Sector 7G, Coordinates X: 1145.32, Y: 2547.88,
                Z: -562.17
              </p>
              <p className="item">
                Destination: Proxima Centauri System, ETA: 45 days, 3 hours
              </p>
            </div>
          </div>
        )}

        {selectedSection === "environmental" && (
          <div className="section">
            <img
              src={screenMenuBlank}
              className="absolute w-[110px] h-[150px]"
              alt="city info"
            />
            <div className="hidden">
              <h2>Environmental</h2>
              <p className="item">Internal Temperature: 22°C (Optimal)</p>
              <p className="item">Humidity Levels: 45% RH</p>
              <p className="item">Oxygen Levels: 20.95%</p>
              <p className="item">CO2 Levels: 0.04%</p>
              <p className="item">Atmospheric Pressure: 101.3 kPa</p>
              <p className="item">Radiation Shielding: 99.99% Efficiency</p>
              <p className="item">Artificial Gravity: 1.0g</p>
            </div>
          </div>
        )}

        {selectedSection === "life support" && (
          <div className="section">
            <img
              src={screenMenuCharacterHead}
              className="absolute w-[110px] h-[150px]"
              alt="city info"
            />
            <div className="hidden">
              <h2>Life Support</h2>
              <p className="item">Oxygen Generation: 100% Capacity</p>
              <p className="item">Water Filtration: 98% Purity</p>
              <p className="item">Nutrient Synthesis: 94% Efficiency</p>
              <p className="item">Waste Recycling: 87% Efficiency</p>
              <p className="item">Biosphere Health: Stable</p>
            </div>
          </div>
        )}

        {selectedSection === "propulsion" && (
          <div className="section">
            <img
              src={screenMenuCharacterTorso}
              className="absolute w-[110px] h-[150px]"
              alt="city info"
            />

            <div className="hidden">
              <h2>Propulsion</h2>
              <p className="item">Primary Engine: Fusion Drive, 100% Output</p>
              <p className="item">Secondary Thrusters: Ion Drive, 90% Output</p>
              <p className="item">Fuel Reserves: 65% Capacity</p>
              <p className="item">FTL Drive: Charging, 75% Complete</p>
            </div>
          </div>
        )}

        {selectedSection === "defensive" && (
          <div className="section">
            <img
              src={screenMenuCharacterUpgrades}
              className="absolute w-[110px] h-[150px]"
              alt="city info"
            />
            <div className="hidden">
              <h2>Defensive</h2>
              <p className="item">Energy Shields: 100% Integrity</p>
              <p className="item">Hull Integrity: 99.7%</p>
              <p className="item">Point Defense Lasers: Online, 100% Charge</p>
              <p className="item">Missile Countermeasures: 5 Active</p>
            </div>
          </div>
        )}

        {selectedSection === "weapon" && (
          <div className="section">
            <img
              src={screenMenuDesignMain}
              className="absolute w-[110px] h-[150px]"
              alt="city info"
            />
            <div className="hidden">
              <h2>Weapon</h2>
              <p className="item">Laser Cannons: Online, 100% Charge</p>
              <p className="item">Plasma Torpedoes: 12/12 Loaded</p>
              <p className="item">Railguns: Online, 95% Charge</p>
              <p className="item">Ammunition Reserves: 85% Full</p>
            </div>
          </div>
        )}

        {selectedSection === "communication" && (
          <div className="section">
            <img
              src={screenMenuEquipAmount}
              className="absolute w-[110px] h-[150px]"
              alt="city info"
            />
            <div className="hidden">
              <h2>Communication</h2>
              <p className="item">
                Long-Range Transmission: Online, 100% Signal Strength
              </p>
              <p className="item">
                Short-Range Transmission: Online, 100% Signal Strength
              </p>
              <p className="item">Quantum Entanglement Comm: Secure, Active</p>
              <p className="item">Data Uplink: Stable, 200 TB/s</p>
            </div>
          </div>
        )}

        {selectedSection === "navigation" && (
          <div className="section">
            <img
              src={screenMenuEquipCircles}
              className="absolute w-[110px] h-[150px]"
              alt="city info"
            />
            <div className="hidden">
              <h2>Navigation</h2>
              <p className="item">Star Charts: Updated, 99.9% Accuracy</p>
              <p className="item">Autopilot: Engaged</p>
              <p className="item">Manual Control: Standby</p>
              <p className="item">Sensor Array: Active, 100% Functionality</p>
            </div>
          </div>
        )}

        {selectedSection === "power" && (
          <div className="section">
            <img
              src={screenMenuMainSelect}
              className="absolute w-[110px] h-[150px]"
              alt="city info"
            />
            <div className="hidden">
              <h2>Power</h2>
              <p className="item">Reactor Output: 120% Overclock</p>
              <p className="item">Battery Reserves: 95% Charged</p>
              <p className="item">Solar Array: 80% Efficiency</p>
              <p className="item">Backup Generators: 100% Ready</p>
            </div>
          </div>
        )}

        {selectedSection === "maintenance" && (
          <div className="section">
            <img
              src={screenMenuMainSelect2}
              className="absolute w-[110px] h-[150px]"
              alt="city info"
            />
            <div className="hidden">
              <h2>Maintenance</h2>
              <p className="item">Scheduled Maintenance: In 10 days</p>
              <p className="item">Last System Check: 2 days ago</p>
              <p className="item">Current Anomalies: None Detected</p>
            </div>
          </div>
        )}

        {selectedSection === "crew" && (
          <div className="section">
            <img
              src={screenMenuOptions}
              className="absolute w-[110px] h-[150px]"
              alt="city info"
            />
            <div className="hidden">
              <h2>Crew</h2>
              <p className="item">Captain: On Bridge</p>
              <p className="item">First Officer: On Bridge</p>
              <p className="item">Engineer: Engine Room</p>
              <p className="item">Medical Officer: Med Bay</p>
              <p className="item">Science Officer: Lab</p>
              <p className="item">Communications Officer: Comm Center</p>
              <p className="item">Security Officer: Patrol</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitorReadout;
