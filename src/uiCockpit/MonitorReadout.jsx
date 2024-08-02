import { Fragment, useState } from "react";
import ShieldsReadout from "./ShieldsReadout";
import WeaponsReadout from "./WeaponsReadout";

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
      {/*<div className="">{hoveredSection}</div>*/}
      <div className="flex flex-wrap">
        {menuItems.map((item, index) => (
          <Fragment key={item}>
            <div
              onClick={() => handleSectionChange(item)}
              className="pointer-events-auto button-cyber w-[10px] h-10 ml-[1px] mb-1"
            >
              <span
                className={`button-cyber-content rounded-tr-full ${
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
          <>
            <ShieldsReadout isAlwaysDisplay={true} />
            <WeaponsReadout isAlwaysDisplay={true} />
          </>
        )}
        {selectedSection === "system" && (
          <div className="section">
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
        )}

        {selectedSection === "environmental" && (
          <div className="section">
            <h2>Environmental</h2>
            <p className="item">Internal Temperature: 22°C (Optimal)</p>
            <p className="item">Humidity Levels: 45% RH</p>
            <p className="item">Oxygen Levels: 20.95%</p>
            <p className="item">CO2 Levels: 0.04%</p>
            <p className="item">Atmospheric Pressure: 101.3 kPa</p>
            <p className="item">Radiation Shielding: 99.99% Efficiency</p>
            <p className="item">Artificial Gravity: 1.0g</p>
          </div>
        )}

        {selectedSection === "life support" && (
          <div className="section">
            <h2>Life Support</h2>
            <p className="item">Oxygen Generation: 100% Capacity</p>
            <p className="item">Water Filtration: 98% Purity</p>
            <p className="item">Nutrient Synthesis: 94% Efficiency</p>
            <p className="item">Waste Recycling: 87% Efficiency</p>
            <p className="item">Biosphere Health: Stable</p>
          </div>
        )}

        {selectedSection === "propulsion" && (
          <div className="section">
            <h2>Propulsion</h2>
            <p className="item">Primary Engine: Fusion Drive, 100% Output</p>
            <p className="item">Secondary Thrusters: Ion Drive, 90% Output</p>
            <p className="item">Fuel Reserves: 65% Capacity</p>
            <p className="item">FTL Drive: Charging, 75% Complete</p>
          </div>
        )}

        {selectedSection === "defensive" && (
          <div className="section">
            <h2>Defensive</h2>
            <p className="item">Energy Shields: 100% Integrity</p>
            <p className="item">Hull Integrity: 99.7%</p>
            <p className="item">Point Defense Lasers: Online, 100% Charge</p>
            <p className="item">Missile Countermeasures: 5 Active</p>
          </div>
        )}

        {selectedSection === "weapon" && (
          <div className="section">
            <h2>Weapon</h2>
            <p className="item">Laser Cannons: Online, 100% Charge</p>
            <p className="item">Plasma Torpedoes: 12/12 Loaded</p>
            <p className="item">Railguns: Online, 95% Charge</p>
            <p className="item">Ammunition Reserves: 85% Full</p>
          </div>
        )}

        {selectedSection === "communication" && (
          <div className="section">
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
        )}

        {selectedSection === "navigation" && (
          <div className="section">
            <h2>Navigation</h2>
            <p className="item">Star Charts: Updated, 99.9% Accuracy</p>
            <p className="item">Autopilot: Engaged</p>
            <p className="item">Manual Control: Standby</p>
            <p className="item">Sensor Array: Active, 100% Functionality</p>
          </div>
        )}

        {selectedSection === "power" && (
          <div className="section">
            <h2>Power</h2>
            <p className="item">Reactor Output: 120% Overclock</p>
            <p className="item">Battery Reserves: 95% Charged</p>
            <p className="item">Solar Array: 80% Efficiency</p>
            <p className="item">Backup Generators: 100% Ready</p>
          </div>
        )}

        {selectedSection === "maintenance" && (
          <div className="section">
            <h2>Maintenance</h2>
            <p className="item">Scheduled Maintenance: In 10 days</p>
            <p className="item">Last System Check: 2 days ago</p>
            <p className="item">Current Anomalies: None Detected</p>
          </div>
        )}

        {selectedSection === "crew" && (
          <div className="section">
            <h2>Crew</h2>
            <p className="item">Captain: On Bridge</p>
            <p className="item">First Officer: On Bridge</p>
            <p className="item">Engineer: Engine Room</p>
            <p className="item">Medical Officer: Med Bay</p>
            <p className="item">Science Officer: Lab</p>
            <p className="item">Communications Officer: Comm Center</p>
            <p className="item">Security Officer: Patrol</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitorReadout;
