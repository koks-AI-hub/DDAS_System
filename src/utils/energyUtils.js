/**
 * Energy calculation utility
 * Formulas from FRD:
 * Energy = Power * Time
 * Power = server power consumption (watts)
 * Time = process duration (hours)
 * Example: 400W server, 10 min download time.
 * Time = 10/60 = 0.166 hrs
 * Energy Saved = 400 * 0.166 = 66.4 Wh = 0.0664 kWh
 * CO2 Reduction = energy_saved_kwh * 0.82 kg CO2
 */

const SERVER_POWER_WATTS = 400; // Default assumption per FRD
const AVG_DOWNLOAD_SPEED_MBPS = 50; // Assume 50 Mbps average download speed for time estimation

/**
 * Calculate energy and CO2 saved by preventing a download.
 * @param {number} fileSizeInBytes
 * @returns {object} { energySavedKwh, co2ReductionKg, bandwidthSavedMb }
 */
export const calculateSavings = (fileSizeInBytes) => {
  const bandwidthSavedMb = fileSizeInBytes / (1024 * 1024);
  
  // Estimate time taken to download file
  // time in seconds = (size in MB * 8) / Speed in Mbps
  const timeInSeconds = (bandwidthSavedMb * 8) / AVG_DOWNLOAD_SPEED_MBPS;
  const timeInHours = timeInSeconds / 3600;
  
  const energySavedWh = SERVER_POWER_WATTS * timeInHours;
  const energySavedKwh = energySavedWh / 1000;
  
  const co2ReductionKg = energySavedKwh * 0.82;
  
  return {
    energySavedKwh: parseFloat(energySavedKwh.toFixed(5)),
    co2ReductionKg: parseFloat(co2ReductionKg.toFixed(5)),
    bandwidthSavedMb: parseFloat(bandwidthSavedMb.toFixed(2))
  };
};
