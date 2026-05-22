import React from 'react';

interface Props {
  code: number;
  isDay: boolean;
}

export const WeatherIcon: React.FC<Props> = ({ code, isDay }) => {
  const getSVG = () => {
    // Sunny / Clear
    if (code === 1000) {
      return isDay ? (
        <div className="wi wi-sunny">
          <div className="sun-core" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="sun-ray" style={{ '--ray': i } as React.CSSProperties} />
          ))}
        </div>
      ) : (
        <div className="wi wi-moon">
          <div className="moon-body" />
          <div className="moon-star s1" />
          <div className="moon-star s2" />
          <div className="moon-star s3" />
        </div>
      );
    }

    // Partly cloudy
    if (code === 1003) {
      return (
        <div className="wi wi-partly-cloudy">
          {isDay && <div className="pc-sun"><div className="sun-core sm" />{[...Array(6)].map((_, i) => <div key={i} className="sun-ray sm" style={{ '--ray': i } as React.CSSProperties} />)}</div>}
          <div className="cloud main" />
        </div>
      );
    }

    // Cloudy / Overcast
    if (code === 1006 || code === 1009) {
      return (
        <div className="wi wi-cloudy">
          <div className="cloud back" />
          <div className="cloud main" />
        </div>
      );
    }

    // Mist / Fog / Haze
    if ([1030, 1135, 1147].includes(code)) {
      return (
        <div className="wi wi-fog">
          <div className="fog-line l1" />
          <div className="fog-line l2" />
          <div className="fog-line l3" />
          <div className="fog-line l4" />
        </div>
      );
    }

    // Rain / Drizzle
    if ([1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(code)) {
      return (
        <div className="wi wi-rain">
          <div className="cloud main rain-cloud" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="raindrop" style={{ '--drop': i } as React.CSSProperties} />
          ))}
        </div>
      );
    }

    // Snow
    if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) {
      return (
        <div className="wi wi-snow">
          <div className="cloud main" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="snowflake" style={{ '--flake': i } as React.CSSProperties}>❄</div>
          ))}
        </div>
      );
    }

    // Thunderstorm
    if ([1087, 1273, 1276, 1279, 1282].includes(code)) {
      return (
        <div className="wi wi-thunder">
          <div className="cloud main storm-cloud" />
          <div className="lightning" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="raindrop heavy" style={{ '--drop': i } as React.CSSProperties} />
          ))}
        </div>
      );
    }

    // Sleet / Ice
    if ([1069, 1072, 1204, 1207, 1249, 1252].includes(code)) {
      return (
        <div className="wi wi-sleet">
          <div className="cloud main" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="sleet-drop" style={{ '--drop': i } as React.CSSProperties} />
          ))}
        </div>
      );
    }

    // Default — show cloud
    return (
      <div className="wi wi-cloudy">
        <div className="cloud back" />
        <div className="cloud main" />
      </div>
    );
  };

  return <div className="weather-icon-wrapper">{getSVG()}</div>;
};
