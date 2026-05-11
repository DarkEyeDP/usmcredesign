<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title></title>
<link href="https://fonts.googleapis.com/css2?family=Overpass:wght@400;700&amp;display=swap" rel="stylesheet" />
<style type="text/css">/* Base Styles */
#srbp-tool * {
   box-sizing: border-box;
   }
#srbp-tool {
  font-family: 'Overpass', Tahoma, Geneva, Verdana, sans-serif; 
  margin: 0;
  padding: 1rem;
  min-height: 100vh;
  color: #333;
  line-height: 1.4;
}

/* CSS Variables */
#srbp-tool {
  --brand: #2a5298;
  --accent: #c41e3a;
  --ok: #27ae60;
  --muted: #6c757d;
  --chip-bg: #eef2f7;
}
/* Header */
#srbp-tool .header-banner {
  text-align: center;
  background: rgba(255, 255, 255, 0.98);
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

#srbp-tool .usmc-emblem {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

#srbp-tool h1 { 
  color: #c41e3a;
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

#srbp-tool .subtitle {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
  font-weight: 500;
}

/* Layout */
#srbp-tool .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

#srbp-tool .form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

#srbp-tool .form-group {
  display: flex;
  flex-direction: column;
}

#srbp-tool .form-group.full-width {
  grid-column: 1 / -1;
}

/* Form Elements */
#srbp-tool label { 
  display: block; 
  margin-bottom: 0.5rem; 
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

#srbp-tool .required {
  color: #c41e3a;
}

#srbp-tool input,
#srbp-tool select { 
  padding: 0.75rem; 
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #fff;
  font-family: inherit;
}

#srbp-tool input:focus,
#srbp-tool select:focus {
  border-color: #2a5298;
  outline: none;
  box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
}

#srbp-tool input[type=number]::-webkit-outer-spin-button,
#srbp-tool input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

#srbp-tool input[type=number] {
  -moz-appearance: textfield;
}

#srbp-tool .info-text {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
  font-style: italic;
}

/* NMOS Section */
#srbp-tool .nmos-section {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1.5rem 0;
}

#srbp-tool .nmos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

#srbp-tool .checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  transition: all 0.2s ease;
}

#srbp-tool .checkbox-group:hover {
  background: #f8f9fa;
  border-color: #2a5298;
}

#srbp-tool .checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: #2a5298;
}

#srbp-tool .checkbox-group label {
  margin: 0;
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
  flex: 1;
}

/* Buttons */
#srbp-tool .action-buttons {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-top: 2rem;
}

#srbp-tool button { 
  padding: 1rem 1.5rem; 
  border: none; 
  cursor: pointer; 
  font-size: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: inherit;
}

#srbp-tool .btn-calculate {
  background: linear-gradient(45deg, #c41e3a, #a01729);
  color: white;
}

#srbp-tool .btn-calculate:hover { 
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(196, 30, 58, 0.3);
}

#srbp-tool .btn-reset {
  background: #6c757d;
  color: white;
}

#srbp-tool .btn-reset:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

/* Results */
#srbp-tool .result { 
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  margin-top: 2rem; 
  padding: 2rem; 
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-left: 5px solid #2a5298;
  position: relative;
  overflow: hidden;
}

#srbp-tool .result.fade-in { 
  animation: fade 240ms ease-out; 
}

@keyframes fade { 
  from { opacity: 0.001; transform: translateY(8px) } 
  to { opacity: 1; transform: none } 
}

#srbp-tool .result-title {
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  gap: 1rem; 
  margin-bottom: 1rem;
}

#srbp-tool .result-title h3 { 
  margin: 0; 
  font-size: 1.4rem;
  color: #2c3e50;
}

#srbp-tool .badges { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 0.5rem; 
}

#srbp-tool .chip {
  background: var(--chip-bg); 
  color: #233; 
  border: 1px solid #e3e8ef;
  padding: 0.35rem 0.6rem; 
  border-radius: 999px; 
  font-size: 0.8rem; 
  font-weight: 600;
}

#srbp-tool .stats-grid {
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem; 
  margin: 1rem 0 1.25rem;
}

#srbp-tool .stat-card {
  background: #fff; 
  border: 1px solid #e9ecef; 
  border-radius: 10px; 
  padding: 1rem;
  box-shadow: 0 1px 0 rgba(0,0,0,0.02);
}

#srbp-tool .stat-label { 
  font-size: 0.8rem; 
  color: var(--muted); 
  text-transform: uppercase; 
  letter-spacing: 0.06em; 
}

#srbp-tool .stat-value { 
  font-size: 1.6rem; 
  font-weight: 800; 
  margin-top: 0.35rem; 
}

#srbp-tool .kicker-total {
  font-size: 16px; 
  font-weight: 800; 
  color: var(--ok);
}


#srbp-tool .stat-value.ok,
#srbp-tool .bonus-amount {
  color: var(--ok);
  font-weight: 800;
}

#srbp-tool .subnote { 
  font-size: 0.8rem; 
  color: var(--muted); 
  margin-top: 0.25rem; 
}

#srbp-tool .meta-box {
  background: #f8f9fb; 
  border: 1px solid #e9ecef; 
  border-radius: 10px; 
  padding: 1rem;
}

#srbp-tool .tax-card {
  background: #fff; 
  border: 1px solid #e9ecef; 
  border-radius: 10px; 
  padding: 1rem; 
}

#srbp-tool .tax-table { 
  width: 100%; 
  border-collapse: collapse; 
  font-size: 0.95rem; 
}

#srbp-tool .tax-table th, 
#srbp-tool .tax-table td { 
  padding: 0.5rem 0.6rem; 
  border-bottom: 1px solid #eef2f7; 
  text-align: left; 
}

#srbp-tool .tax-table th { 
  font-size: 0.8rem; 
  color: var(--muted); 
  text-transform: uppercase; 
  letter-spacing: 0.06em; 
}

#srbp-tool .tax-table tr:last-child td { 
  border-bottom: 0; 
}

/* Kicker Section */
#srbp-tool .kicker-section {
  background: #e8f4fd;
  border: 1px solid #b8daff;
  padding: 1.25rem;
  border-radius: 8px;
  margin-top: 1rem;
}

#srbp-tool .kicker-option {
  margin: 1rem 0;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #2a5298;
}

#srbp-tool .kicker-grid {
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem; 
  margin-top: 0.75rem;
}

#srbp-tool .kicker-card {
  background: #fff; 
  border: 1px solid #d7e6fb; 
  border-left: 4px solid var(--brand);
  border-radius: 10px; 
  padding: 1rem;
}

#srbp-tool .kicker-name { 
  font-weight: 700; 
  font-size: 18px;
}

#srbp-tool .kicker-extra { 
  font-size: 0.85rem; 
  color: var(--muted); 
  margin: 0.35rem 0 0.6rem; 
}

/* Notice Sections */
#srbp-tool .warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 1.25rem;
  border-radius: 8px;
  margin-top: 1rem;
}

#srbp-tool .zone-info {
  background: #f8f9fa;
  padding: 1.25rem;
  border-radius: 8px;
  margin: 1rem 0;
  border-left: 4px solid #2a5298;
}

#srbp-tool .official-notice {
  background: linear-gradient(135deg, #fff8e1, #fff3c4);
  border: 1px solid #ffcc02;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border-left: 5px solid #ff9800;
}

#srbp-tool .official-notice h4 {
  margin-top: 0;
  color: #e65100;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

#srbp-tool .official-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #2a5298;
  font-weight: 600;
  text-decoration: none;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 6px;
  border: 2px solid #2a5298;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

#srbp-tool .official-link:hover {
  background: #2a5298;
  color: white;
  transform: translateY(-1px);
}

#srbp-tool .details-note {
  background: #fff8e6; 
  border: 1px solid #ffe3a3; 
  border-radius: 10px; 
  padding: 1rem; 
  font-size: 16px;
}

#srbp-tool .details-note summary {
  cursor: pointer; 
  font-weight: 700; 
  color: #7a5b00;
  font-size: 18px;
}

#srbp-tool .small-muted { 
  color: var(--muted); 
  font-size: 0.85rem; 
}

/* Tablet Styles */
@media (max-width: 768px) {
  #srbp-tool .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  #srbp-tool .action-buttons {
    grid-template-columns: 1fr;
  }
  
  #srbp-tool .nmos-grid {
    grid-template-columns: 1fr;
  }
  
  #srbp-tool h1 {
    font-size: 1.4rem;
  }
  
  #srbp-tool .container {
    padding: 1.5rem;
  }
}

/* Mobile Styles - Consolidated */
@media (max-width: 480px) {
  /* Layout adjustments */
  #srbp-tool { 
    padding: 0; 
  }
  
  #srbp-tool .container { 
    padding: 12px; 
    margin: 0 auto; 
  }

  /* Header styling */
  #srbp-tool .header-banner {
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    padding: 14px 12px;
    margin-bottom: 12px;
    border-radius: 10px;
  }
  
  #srbp-tool h1 {
    font-size: 1.25rem;
    margin: 0 0 6px 0;
  }
  
  #srbp-tool .subtitle {
    font-size: 0.85rem;
  }

  /* Form layout */
  #srbp-tool .form-grid { 
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  #srbp-tool .form-group { 
    min-width: 0; 
  }

  /* Form controls - prevent iOS zoom with 16px+ font */
  #srbp-tool input,
  #srbp-tool select,
  #srbp-tool textarea {
    font-size: 16px;
    width: 100%;
    display: block;
    min-height: 48px;
    padding: 10px 12px;
  }

  /* Labels and helper text */
  #srbp-tool label { 
    font-size: 0.9rem; 
    margin-bottom: 6px; 
  }
  
  #srbp-tool .info-text { 
    font-size: 0.78rem; 
  }

  /* NMOS section */
  #srbp-tool .nmos-section { 
    padding: 12px; 
    margin: 12px 0; 
  }
  
  #srbp-tool .nmos-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  #srbp-tool .checkbox-group {
    display: grid;
    grid-template-columns: 24px 1fr;
    align-items: center;
    column-gap: 12px;
    padding: 12px;
    min-height: 56px;
    width: 100%;
    border-radius: 10px;
  }
  
  #srbp-tool .checkbox-group input[type="checkbox"] {
    justify-self: start;
    align-self: center;
    margin: 0;
  }
  
  #srbp-tool .checkbox-group label {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.2;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  /* Buttons */
  #srbp-tool .action-buttons {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-top: 12px;
  }
  
  #srbp-tool button {
    width: 100%;
    min-height: 48px;
    padding: 12px;
  }

  /* Results */
  #srbp-tool .result { 
    padding: 14px; 
    margin-top: 12px; 
    border-left-width: 3px; 
  }
  
  #srbp-tool .result-title { 
    flex-direction: column; 
    align-items: flex-start; 
    gap: 6px; 
  }
  
  #srbp-tool .badges { 
    gap: 6px; 
  }
  
  #srbp-tool .chip { 
    font-size: 0.76rem; 
    padding: 0.3rem 0.5rem; 
  }

  /* Stats and tables */
  #srbp-tool .stats-grid { 
    gap: 10px; 
  }
  
  #srbp-tool .stat-card { 
    padding: 10px; 
  }
  
  #srbp-tool .stat-value { 
    font-size: 1.3rem; 
  }
  
  #srbp-tool .tax-card { 
    padding: 10px; 
  }
  
  #srbp-tool .tax-table th, 
  #srbp-tool .tax-table td { 
    padding: 6px 8px; 
  }
}

/* Ultra-narrow devices */
@media (max-width: 360px) {
  #srbp-tool .container { 
    padding: 8px; 
  }
  
  #srbp-tool .header-banner { 
    padding: 8px; 
  }
}
</style>
<div id="srbp-tool">
<div class="header-banner">
<h1 style="font-family: 'Overpass'; letter-spacing: .06em; margin:.25rem 0; font-weight: bold; color: #2c3e50;">FY27 SRBP Bonus Calculator</h1>

<p class="subtitle">United States Marine Corps &bull; Fiscal Year 2027 Selective Retention Bonus Program</p>
</div>

<div class="container">
<form onsubmit="preventRefresh(event); calculateBonus();">
<div class="form-grid">
<div class="form-group"><label for="pebd">PEBD (Pay Entry Base Date) <span class="required">*</span></label> <input id="pebd" required="" type="date" />
<div class="info-text">Initial entry date into military service</div>
</div>

<div class="form-group"><label for="rank">Current Rank <span class="required">*</span></label> <select id="rank" required=""><option value="">Select Rank</option><option value="E3">E3 - Lance Corporal</option><option value="E4">E4 - Corporal</option><option value="E5">E5 - Sergeant</option><option value="E6">E6 - Staff Sergeant</option><option value="E7">E7 - Gunnery Sergeant</option><option value="E8">E8 - Master Sergeant / First Sergeant</option><option value="E9">E9 - Master Gunnery Sergeant / Sergeant Major</option> </select></div>

<div class="form-group"><label for="mos">Current MOS <span class="required">*</span></label> <input autocomplete="off" enterkeyhint="next" id="mos" inputmode="numeric" maxlength="4" pattern="\d*" placeholder="e.g., 0211, 0321, 6214" required="" type="text" />
<div class="info-text">Primary Military Occupational Specialty</div>
</div>

<div class="form-group"><label for="ecc">Current ECC <span class="required">*</span></label> <input id="ecc" required="" type="date" />
<div class="info-text">Expiration of Current Contract</div>
</div>

<div class="form-group"><label for="reenlistDate">Planned Reenlistment Date <span class="required">*</span></label> <input id="reenlistDate" required="" type="date" />
<div class="info-text">Must be on/after 22 January 2026</div>
</div>

<div class="form-group"><label for="months">Reenlistment Length (months) <span class="required">*</span></label> <input enterkeyhint="done" id="months" inputmode="numeric" max="96" min="36" placeholder="36-96" required="" step="1" type="number" />
<div class="info-text">Min: 36 months for prorated, 48+ for full bonus, 60+ for kickers</div>
</div>

<div class="form-group"><label for="lateralMove">Lateral Move MOS (optional)</label> <input autocomplete="off" enterkeyhint="next" id="lateralMove" inputmode="numeric" maxlength="4" pattern="\d*" placeholder="e.g., 0211" type="text" />
<div class="info-text">Enter MOS you&#39;re lateral moving to</div>
</div>

<div class="form-group"><label for="mcc">Current/Planned MCC (optional)</label> <input id="mcc" placeholder="e.g., 1GT, V13, 036" type="text" />
<div class="info-text">Monitored Command Code for kicker eligibility</div>
</div>

<div class="form-group"><label for="taxFreeZone">Tax Status</label> <select id="taxFreeZone"><option value="false">Subject to Federal Income Tax</option><option value="true">Tax-Free Combat Zone</option> </select>

<div class="info-text">Expected tax status when bonus is paid</div>
</div>
</div>

<div class="nmos-section"><label><strong>NMOS Qualifications</strong> (check all that apply)</label>

<div class="info-text" style="margin-top: 0.5rem;">Additional Marine Corps Occupational Specialties for kicker eligibility</div>

<div class="nmos-grid">
<div class="checkbox-group"><input id="nmos6012" type="checkbox" /> <label for="nmos6012">6012 - SFF Controller</label></div>

<div class="checkbox-group"><input id="nmos6016" type="checkbox" /> <label for="nmos6016">6016 - CDI</label></div>

<div class="checkbox-group"><input id="nmos6017" type="checkbox" /> <label for="nmos6017">6017 - CDQAR</label></div>

<div class="checkbox-group"><input id="nmos6018" type="checkbox" /> <label for="nmos6018">6018 - QAR</label></div>

<div class="checkbox-group"><input id="nmos6033" type="checkbox" /> <label for="nmos6033">6033 - Aircraft NDI Tech</label></div>

<div class="checkbox-group"><input id="nmos6171" type="checkbox" /> <label for="nmos6171">6171 - Night Systems Instructor</label></div>

<div class="checkbox-group"><input id="nmos6177" type="checkbox" /> <label for="nmos6177">6177 - W&amp;T Crew Chief Instructor</label></div>

<div class="checkbox-group"><input id="nmos6242" type="checkbox" /> <label for="nmos6242">6242 - Flight Engineer</label></div>

<div class="checkbox-group"><input id="nmos6516" type="checkbox" /> <label for="nmos6516">6516 - QA/Safety Observer</label></div>

<div class="checkbox-group"><input id="nmos7252" type="checkbox" /> <label for="nmos7252">7252 - ATC Tower</label></div>

<div class="checkbox-group"><input id="nmos7253" type="checkbox" /> <label for="nmos7253">7253 - ATC Radar Arr/Dep</label></div>

<div class="checkbox-group"><input id="nmos7254" type="checkbox" /> <label for="nmos7254">7254 - ATC Radar Approach</label></div>
</div>
</div>

<div class="action-buttons"><button class="btn-calculate" onclick="preventRefresh(event); calculateBonus()" type="submit">Calculate My Bonus</button><button class="btn-reset" onclick="resetForm()" type="button">Reset Form</button></div>
</form>

<div class="result" id="result" style="display: none;">&nbsp;</div>
</div>
</div>
<script>
// ===================================================================
// FY27 SRBP BONUS DATA — MARADMIN 023/26
// ===================================================================

// Complete bonus tables from FY27 MARADMIN
// Zone A: "E5 & Above" mapped to E5, E6, E7
// Zone B: "E6 & Above" mapped to E6, E7
// Zone C: "E7 & Above" mapped to E7, E8, E9
// Zone D: "E7 & Above" mapped to E7, E8, E9
// Zone E: "E8 & Above" mapped to E8, E9
// Zone F: "E8 & Above" mapped to E8, E9
const bonusTable = {
  "A": {
    "0211": { "E4": 49000, "E5": 51000, "E6": 51000, "E7": 51000 },
    "0231": { "E3": 17250, "E4": 19000, "E5": 19750, "E6": 19750, "E7": 19750 },
    "0241": { "E3": 17250, "E4": 19000, "E5": 19750, "E6": 19750, "E7": 19750 },
    "0261": { "E3": 17250, "E4": 19000, "E5": 19750, "E6": 19750, "E7": 19750 },
    "0311": { "E3": 7500, "E4": 8000, "E5": 10000, "E6": 10000, "E7": 10000 },
    "0313": { "E3": 7500, "E4": 8000, "E5": 10000, "E6": 10000, "E7": 10000 },
    "0321": { "E3": 50000, "E4": 64000, "E5": 66500, "E6": 66500, "E7": 66500 },
    "0331": { "E3": 7500, "E4": 8000, "E5": 10000, "E6": 10000, "E7": 10000 },
    "0341": { "E3": 7500, "E4": 8000, "E5": 10000, "E6": 10000, "E7": 10000 },
    "0352": { "E3": 7500, "E4": 8000, "E5": 10000, "E6": 10000, "E7": 10000 },
    "0372": { "E4": 57750, "E5": 60000, "E6": 60000, "E7": 60000 },
    "0627": { "E3": 12000, "E4": 15000, "E5": 15750, "E6": 15750, "E7": 15750 },
    "0631": { "E3": 12000, "E4": 15000, "E5": 15750, "E6": 15750, "E7": 15750 },
    "0671": { "E3": 12000, "E4": 15000, "E5": 15750, "E6": 15750, "E7": 15750 },
    "0842": { "E3": 11000, "E4": 12000, "E5": 12750, "E6": 12750, "E7": 12750 },
    "0844": { "E3": 11000, "E4": 12000, "E5": 12750, "E6": 12750, "E7": 12750 },
    "0861": { "E3": 11000, "E4": 12000, "E5": 12750, "E6": 12750, "E7": 12750 },
    "1721": { "E3": 53500, "E4": 55000, "E5": 57750, "E6": 57750, "E7": 57750 },
    "1751": { "E4": 64000, "E5": 65000, "E6": 65000, "E7": 65000 },
    "1834": { "E3": 12000, "E4": 15000, "E5": 15750, "E6": 15750, "E7": 15750 },
    "2131": { "E3": 12000, "E4": 15000, "E5": 15750, "E6": 15750, "E7": 15750 },
    "2143": { "E3": 12000, "E4": 15000, "E5": 15750, "E6": 15750, "E7": 15750 },
    "2147": { "E3": 12000, "E4": 15000, "E5": 15750, "E6": 15750, "E7": 15750 },
    "2336": { "E4": 55000, "E5": 57750, "E6": 57750, "E7": 57750 },
    "2621": { "E3": 28000, "E4": 31000, "E5": 31750, "E6": 31750, "E7": 31750 },
    "2631": { "E3": 28000, "E4": 31000, "E5": 31750, "E6": 31750, "E7": 31750 },
    "2641": { "E3": 28000, "E4": 31000, "E5": 31750, "E6": 31750, "E7": 31750 },
    "2651": { "E3": 28000, "E4": 31000, "E5": 31750, "E6": 31750, "E7": 31750 },
    "2831": { "E3": 17000, "E4": 18000, "E5": 18630, "E6": 18630, "E7": 18630 },
    "2841": { "E3": 17000, "E4": 18000, "E5": 18630, "E6": 18630, "E7": 18630 },
    "2847": { "E3": 17000, "E4": 18000, "E5": 18630, "E6": 18630, "E7": 18630 },
    "2871": { "E3": 12000, "E4": 15000, "E5": 15750, "E6": 15750, "E7": 15750 },
    "2874": { "E5": 18750, "E6": 18750, "E7": 18750 },
    "2887": { "E3": 12000, "E4": 15000, "E5": 15750, "E6": 15750, "E7": 15750 },
    "3044": { "E4": 33000, "E5": 34000, "E6": 34000, "E7": 34000 },
    "5821": { "E3": 32000, "E4": 33000, "E5": 34000, "E6": 34000, "E7": 34000 },
    "5939": { "E3": 44000, "E4": 45000, "E5": 46000, "E6": 46000, "E7": 46000 },
    "5948": { "E3": 27000, "E4": 28500, "E5": 29070, "E6": 29070, "E7": 29070 },
    "5951": { "E3": 27000, "E4": 28500, "E5": 29070, "E6": 29070, "E7": 29070 },
    "5952": { "E3": 27000, "E4": 28500, "E5": 29070, "E6": 29070, "E7": 29070 },
    "5953": { "E3": 27000, "E4": 28500, "E5": 29070, "E6": 29070, "E7": 29070 },
    "5954": { "E3": 27000, "E4": 28500, "E5": 29070, "E6": 29070, "E7": 29070 },
    "5974": { "E3": 44000, "E4": 45000, "E5": 46000, "E6": 46000, "E7": 46000 },
    "5979": { "E3": 57000, "E4": 58000, "E5": 59000, "E6": 59000, "E7": 59000 },
    "6113": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6114": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6116": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6124": { "E3": 12000, "E4": 15000, "E5": 15750, "E6": 15750, "E7": 15750 },
    "6132": { "E3": 17500, "E4": 19000, "E5": 19500, "E6": 19500, "E7": 19500 },
    "6156": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6173": { "E3": 21500, "E4": 23000, "E5": 23500, "E6": 23500, "E7": 23500 },
    "6174": { "E3": 21500, "E4": 23000, "E5": 23500, "E6": 23500, "E7": 23500 },
    "6176": { "E3": 31500, "E4": 33000, "E5": 33500, "E6": 33500, "E7": 33500 },
    "6214": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6216": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6217": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6218": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6227": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6256": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6257": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6258": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6276": { "E3": 21500, "E4": 23000, "E5": 23500, "E6": 23500, "E7": 23500 },
    "6287": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6288": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6314": { "E3": 9250, "E4": 10500, "E5": 11750, "E6": 11750, "E7": 11750 },
    "6316": { "E3": 9250, "E4": 10500, "E5": 11750, "E6": 11750, "E7": 11750 },
    "6317": { "E3": 9250, "E4": 10500, "E5": 11750, "E6": 11750, "E7": 11750 },
    "6326": { "E3": 9250, "E4": 10500, "E5": 11750, "E6": 11750, "E7": 11750 },
    "6336": { "E3": 9250, "E4": 10500, "E5": 11750, "E6": 11750, "E7": 11750 },
    "6337": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6338": { "E3": 15000, "E4": 16000, "E5": 17500, "E6": 17500, "E7": 17500 },
    "6694": { "E3": 25000, "E4": 28000, "E5": 31000, "E6": 31000, "E7": 31000 },
    "6842": { "E3": 9250, "E4": 10500, "E5": 11750, "E6": 11750, "E7": 11750 },
    "7212": { "E3": 19500, "E4": 20500, "E5": 21500, "E6": 21500, "E7": 21500 },
    "7240": { "E3": 21000, "E4": 24000, "E5": 27000, "E6": 27000, "E7": 27000 },
    "7314": { "E3": 9250, "E4": 10500, "E5": 11750, "E6": 11750, "E7": 11750 },
    "7316": { "E3": 32000, "E4": 33000, "E5": 34000, "E6": 34000, "E7": 34000 }
  },
  "B": {
    "0211": { "E5": 64000, "E6": 65000, "E7": 65000 },
    "0231": { "E5": 21600, "E6": 27000, "E7": 27000 },
    "0241": { "E5": 21600, "E6": 27000, "E7": 27000 },
    "0261": { "E5": 21600, "E6": 27000, "E7": 27000 },
    "0311": { "E5": 18630 },
    "0313": { "E5": 18630 },
    "0321": { "E5": 53000, "E6": 55000, "E7": 55000 },
    "0331": { "E5": 18630 },
    "0341": { "E5": 18630 },
    "0352": { "E5": 18630 },
    "0363": { "E6": 23500, "E7": 23500 },
    "0369": { "E6": 23500, "E7": 23500 },
    "0372": { "E5": 53000, "E6": 55000, "E7": 55000 },
    "0441": { "E5": 15000, "E6": 17000, "E7": 17000 },
    "0451": { "E5": 15000, "E6": 17000, "E7": 17000 },
    "0639": { "E6": 27000, "E7": 27000 },
    "0679": { "E6": 45000, "E7": 45000 },
    "0681": { "E6": 25000, "E7": 25000 },
    "0848": { "E6": 15000, "E7": 15000 },
    "0861": { "E5": 15000 },
    "0871": { "E6": 21000, "E7": 21000 },
    "1721": { "E5": 51000, "E6": 53000, "E7": 53000 },
    "1751": { "E5": 51000, "E6": 53000, "E7": 53000 },
    "1834": { "E5": 15000, "E6": 17000, "E7": 17000 },
    "2143": { "E5": 15000, "E6": 17000, "E7": 17000 },
    "2147": { "E5": 15000, "E6": 17000, "E7": 17000 },
    "2336": { "E5": 48600, "E6": 51300, "E7": 51300 },
    "2621": { "E5": 15000 },
    "2629": { "E6": 17000, "E7": 17000 },
    "2641": { "E5": 15000 },
    "2651": { "E5": 15000, "E6": 17000, "E7": 17000 },
    "2831": { "E5": 15000 },
    "2841": { "E5": 15000 },
    "2847": { "E5": 15000 },
    "2862": { "E6": 23500, "E7": 23500 },
    "2871": { "E5": 15000 },
    "2874": { "E5": 15000, "E6": 17000, "E7": 17000 },
    "2887": { "E5": 12000, "E6": 15000, "E7": 15000 },
    "3044": { "E5": 24300, "E6": 37000, "E7": 37000 },
    "5769": { "E6": 15000, "E7": 15000 },
    "5821": { "E5": 28750, "E6": 30250, "E7": 30250 },
    "5939": { "E5": 45000, "E6": 46000, "E7": 46000 },
    "5948": { "E5": 27000, "E6": 28500, "E7": 28500 },
    "5951": { "E5": 27000, "E6": 28500, "E7": 28500 },
    "5952": { "E5": 27000, "E6": 28500, "E7": 28500 },
    "5953": { "E5": 27000, "E6": 28500, "E7": 28500 },
    "5954": { "E5": 27000, "E6": 28500, "E7": 28500 },
    "5974": { "E5": 45000, "E6": 46000, "E7": 46000 },
    "5979": { "E5": 58000, "E6": 59000, "E7": 59000 },
    "6113": { "E5": 19000, "E6": 19500, "E7": 19500 },
    "6114": { "E5": 19000, "E6": 19500, "E7": 19500 },
    "6116": { "E5": 19000, "E6": 19500, "E7": 19500 },
    "6123": { "E5": 15000, "E6": 17000, "E7": 17000 },
    "6124": { "E5": 15000, "E6": 17000, "E7": 17000 },
    "6132": { "E5": 15000, "E6": 17000, "E7": 17000 },
    "6156": { "E5": 15000, "E6": 17000, "E7": 17000 },
    "6173": { "E5": 23000, "E6": 23500, "E7": 23500 },
    "6174": { "E5": 23000, "E6": 23500, "E7": 23500 },
    "6176": { "E5": 23000, "E6": 23500, "E7": 23500 },
    "6214": { "E5": 19000, "E6": 19500, "E7": 19500 },
    "6216": { "E5": 35700, "E6": 37000, "E7": 37000 },
    "6217": { "E5": 35700, "E6": 37000, "E7": 37000 },
    "6218": { "E5": 35700, "E6": 37000, "E7": 37000 },
    "6227": { "E5": 28000, "E6": 31000, "E7": 31000 },
    "6256": { "E5": 28000, "E6": 31000, "E7": 31000 },
    "6257": { "E5": 35700, "E6": 37000, "E7": 37000 },
    "6258": { "E5": 35700, "E6": 37000, "E7": 37000 },
    "6276": { "E5": 28000, "E6": 31000, "E7": 31000 },
    "6286": { "E5": 28000, "E6": 31000, "E7": 31000 },
    "6287": { "E5": 35700, "E6": 37000, "E7": 37000 },
    "6288": { "E5": 35700, "E6": 37000, "E7": 37000 },
    "6314": { "E5": 15000, "E6": 17000, "E7": 17000 },
    "6316": { "E5": 15000, "E6": 17000, "E7": 17000 },
    "6317": { "E5": 35700, "E6": 37000, "E7": 37000 },
    "6324": { "E5": 28000, "E6": 31000, "E7": 31000 },
    "6326": { "E5": 28000, "E6": 31000, "E7": 31000 },
    "6336": { "E5": 28000, "E6": 31000, "E7": 31000 },
    "6337": { "E5": 35700, "E6": 37000, "E7": 37000 },
    "6338": { "E5": 35700, "E6": 37000, "E7": 37000 },
    "6423": { "E5": 15000, "E6": 17000, "E7": 17000 },
    "6694": { "E5": 47500, "E6": 50000, "E7": 50000 },
    "6842": { "E5": 15000, "E6": 17000, "E7": 17000 },
    "7212": { "E5": 22200, "E6": 23750, "E7": 23750 },
    "7240": { "E5": 22200, "E6": 23750, "E7": 23750 },
    "7257": { "E5": 64300, "E6": 67500, "E7": 67500 },
    "7314": { "E5": 24300, "E6": 27000, "E7": 27000 },
    "7316": { "E5": 33000, "E6": 34000, "E7": 34000 }
  },
  "C": {
    "0211": { "E6": 35000, "E7": 40000, "E8": 40000, "E9": 40000 },
    "0231": { "E6": 19500, "E7": 21000, "E8": 21000, "E9": 21000 },
    "0241": { "E6": 19500, "E7": 21000, "E8": 21000, "E9": 21000 },
    "0321": { "E6": 42500, "E7": 45000, "E8": 45000, "E9": 45000 },
    "0363": { "E6": 23500, "E7": 27000, "E8": 27000, "E9": 27000 },
    "0369": { "E6": 13500, "E7": 17000, "E8": 17000, "E9": 17000 },
    "0372": { "E6": 42500, "E7": 45000, "E8": 45000, "E9": 45000 },
    "0639": { "E6": 32400, "E7": 35400, "E8": 35400, "E9": 35400 },
    "0679": { "E6": 42500, "E7": 45000, "E8": 45000, "E9": 45000 },
    "0681": { "E6": 10000, "E7": 12000, "E8": 12000, "E9": 12000 },
    "0848": { "E6": 15000, "E7": 17000, "E8": 17000, "E9": 17000 },
    "0871": { "E6": 15000, "E7": 17000, "E8": 17000, "E9": 17000 },
    "1721": { "E6": 51300, "E7": 53000, "E8": 53000, "E9": 53000 },
    "1751": { "E6": 51300, "E7": 53000, "E8": 53000, "E9": 53000 },
    "1799": { "E7": 53000, "E8": 53000, "E9": 53000 },
    "1834": { "E6": 17000, "E7": 20000, "E8": 20000, "E9": 20000 },
    "2143": { "E6": 17000, "E7": 20000, "E8": 20000, "E9": 20000 },
    "2336": { "E6": 27500, "E7": 30000, "E8": 30000, "E9": 30000 },
    "2629": { "E6": 27500, "E7": 30000, "E8": 30000, "E9": 30000 },
    "2651": { "E6": 27500, "E7": 30000, "E8": 30000, "E9": 30000 },
    "2862": { "E6": 23500, "E7": 27000, "E8": 27000, "E9": 27000 },
    "2874": { "E6": 15250, "E7": 16750, "E8": 16750, "E9": 16750 },
    "2887": { "E6": 15250, "E7": 16750, "E8": 16750, "E9": 16750 },
    "3044": { "E6": 20000, "E7": 24300, "E8": 24300, "E9": 24300 },
    "5769": { "E6": 12000, "E7": 15000, "E8": 15000, "E9": 15000 },
    "5939": { "E6": 45000, "E7": 46000, "E8": 46000, "E9": 46000 },
    "5974": { "E6": 45000, "E7": 46000, "E8": 46000, "E9": 46000 },
    "5979": { "E6": 58000, "E7": 59000, "E8": 59000, "E9": 59000 },
    "6113": { "E6": 15000, "E7": 17000, "E8": 17000, "E9": 17000 },
    "6114": { "E6": 15000, "E7": 17000, "E8": 17000, "E9": 17000 },
    "6116": { "E6": 15000, "E7": 17000, "E8": 17000, "E9": 17000 },
    "6123": { "E6": 15000, "E7": 17000, "E8": 17000, "E9": 17000 },
    "6132": { "E6": 15000, "E7": 17000, "E8": 17000, "E9": 17000 },
    "6173": { "E6": 28000, "E7": 31000, "E8": 31000, "E9": 31000 },
    "6174": { "E6": 28000, "E7": 31000, "E8": 31000, "E9": 31000 },
    "6176": { "E6": 29160, "E7": 32400, "E8": 32400, "E9": 32400 },
    "6214": { "E6": 28000, "E7": 31000, "E8": 31000, "E9": 31000 },
    "6216": { "E6": 28000, "E7": 31000, "E8": 31000, "E9": 31000 },
    "6217": { "E6": 29160, "E7": 32400, "E8": 32400, "E9": 32400 },
    "6218": { "E6": 29160, "E7": 32400, "E8": 32400, "E9": 32400 },
    "6227": { "E6": 28000, "E7": 31000, "E8": 31000, "E9": 31000 },
    "6256": { "E6": 28000, "E7": 31000, "E8": 31000, "E9": 31000 },
    "6257": { "E6": 28000, "E7": 31000, "E8": 31000, "E9": 31000 },
    "6258": { "E6": 28000, "E7": 31000, "E8": 31000, "E9": 31000 },
    "6276": { "E6": 28000, "E7": 31000, "E8": 31000, "E9": 31000 },
    "6287": { "E6": 29160, "E7": 32400, "E8": 32400, "E9": 32400 },
    "6288": { "E6": 29160, "E7": 32400, "E8": 32400, "E9": 32400 },
    "6314": { "E6": 28000, "E7": 31000, "E8": 31000, "E9": 31000 },
    "6316": { "E6": 28000, "E7": 31000, "E8": 31000, "E9": 31000 },
    "6317": { "E6": 28000, "E7": 31000, "E8": 31000, "E9": 31000 },
    "6324": { "E6": 28000, "E7": 31000, "E8": 31000, "E9": 31000 },
    "6326": { "E6": 28000, "E7": 31000, "E8": 31000, "E9": 31000 },
    "6336": { "E6": 29160, "E7": 32400, "E8": 32400, "E9": 32400 },
    "6337": { "E6": 29160, "E7": 32400, "E8": 32400, "E9": 32400 },
    "6338": { "E6": 29160, "E7": 32400, "E8": 32400, "E9": 32400 },
    "6694": { "E6": 17000, "E7": 20000, "E8": 20000, "E9": 20000 },
    "7212": { "E6": 15000, "E7": 17000, "E8": 17000, "E9": 17000 },
    "7240": { "E6": 15000, "E7": 17000, "E8": 17000, "E9": 17000 },
    "7257": { "E6": 55000 },
    "7291": { "E7": 61000, "E8": 61000, "E9": 61000 },
    "7314": { "E6": 10000, "E7": 11500, "E8": 11500, "E9": 11500 },
    "7316": { "E6": 33000, "E7": 34000, "E8": 34000, "E9": 34000 },
    "8412": { "E6": 25000, "E7": 25000, "E8": 25000, "E9": 25000 }
  },
  "D": {
    "0321": { "E7": 45000, "E8": 45000, "E9": 45000 },
    "0372": { "E7": 45000, "E8": 45000, "E9": 45000 },
    "1795": { "E7": 20000, "E8": 20000, "E9": 20000 },
    "1799": { "E7": 20000, "E8": 20000, "E9": 20000 },
    "2336": { "E7": 35000, "E8": 35000, "E9": 35000 },
    "8412": { "E7": 25000, "E8": 25000, "E9": 25000 }
  },
  "E": {
    "0321": { "E8": 55000, "E9": 55000 },
    "0372": { "E8": 55000, "E9": 55000 },
    "1795": { "E8": 45000, "E9": 45000 },
    "1799": { "E8": 40000, "E9": 40000 },
    "2336": { "E8": 35000, "E9": 35000 },
    "8412": { "E8": 45000, "E9": 45000 }
  },
  "F": {
    "0372": { "E8": 55000, "E9": 55000 },
    "1795": { "E8": 55000, "E9": 55000 },
    "1799": { "E8": 40000, "E9": 40000 },
    "8412": { "E8": 50000, "E9": 50000 }
  }
};

// Lateral Move eligible MOSs by zone (extracted from LM designations)
const lateralMoveEligible = {
  "A": ["0211", "0241", "0313", "0321", "0372", "0861", "1721", "1751", "1834", "2131", "2143", "2336", "2871", "2887", "3044", "5821", "5974", "5979", "6214", "6218", "6258", "6288", "6314", "6338", "7212", "7316"],
  "B": ["0211", "0321", "0372", "0681", "1751", "2143", "5821", "5979", "6214", "6218", "6258", "6288", "6314", "6338"],
  "C": ["0211", "0681", "6214", "8412"],
  "D": ["8412"]
};

// ===================================================================
// KICKER DATA — FY27
// ===================================================================

// Aircraft Maintenance NMOS by zone
const aircraftMaintNMOS = {
  "A": ["6012", "6016", "6017", "6018", "6033", "6171", "6177", "6242", "6516"],
  "B": ["6012", "6017", "6018", "6033", "6171", "6177", "6242", "6516"],
  "C": ["6012", "6017", "6018", "6033", "6171", "6177", "6242", "6516"]
};

// Aircraft Readiness NMOS by zone
const aircraftReadinessNMOS = {
  "A": ["6012", "6016", "6017", "6018", "6171", "6177", "6242", "6516"],
  "B": ["6012", "6017", "6018", "6177", "6242", "6516"],
  "C": ["6012", "6017", "6018", "6177", "6242", "6516"]
};

// All NMOS checkbox IDs
const allNMOSCheckboxes = [
  'nmos6012', 'nmos6016', 'nmos6017', 'nmos6018', 'nmos6033',
  'nmos6171', 'nmos6177', 'nmos6242', 'nmos6516',
  'nmos7252', 'nmos7253', 'nmos7254'
];

// ATC NMOS for ATC kicker
const atcNMOS = ["7252", "7253", "7254"];

// Aircraft Readiness MCC list (FY27 - updated)
const readinessMCCs = [
  "036", "15P", "1HK", "1HL", "1HN", "1HM", "1J4", "1JH",
  "1T3", "1T5", "1T9", "1TC", "1TD", "1TE", "1TG", "1TK", "1TN", "1TQ", "1TS", "1TV",
  "1V1", "1V2", "1V3", "1V4",
  "G87", "G76",
  "S3C", "S3F", "S6C", "S6D", "S6E", "S6F", "S7F", "S7L",
  "UCL",
  "V61", "V63", "V6A", "V6B",
  "V80", "V81", "V82", "V8A", "V8B", "V8E",
  "VF1", "VF2", "VF3", "VF4", "VF5", "VFB", "VFD", "VFE", "VFG",
  "VH1", "VHA", "VHB", "VHC", "VHD", "VHE",
  "VLA", "VLB", "VLC", "VLD",
  "VM1", "VM2", "VM3", "VM4", "VM5", "VM6", "VMA", "VMB", "VMC", "VMD", "VMH", "VMJ",
  "VR1", "VRA"
];

// FMF Infantry MCCs
const fmfInfantry24MCCs = [
  "1GR", "1GS", "1GT", "1R1", "1R2", "1R3", "1R4", "1R5", "1R6",
  "V11", "V12", "V13", "V15", "V16", "V17", "V18",
  "V21", "V22", "V24", "V25", "V26", "V27", "V28",
  "V31", "V32", "V34", "V35", "V36", "V37", "V44"
];
const fmfInfantry36MCCs = [
  "1GT", "1R3", "1R6", "V13", "V17", "V27", "V34", "V37", "V44"
];

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

function preventRefresh(event) {
  event.preventDefault();
  event.stopPropagation();
}

document.addEventListener('DOMContentLoaded', function () {
  const monthsInput = document.getElementById('months');
  monthsInput.addEventListener('wheel', function (e) {
    this.blur();
  });
});

/** Count how many qualifying NMOS the Marine holds for a given list */
function countCheckedNMOS(nmosList) {
  let count = 0;
  nmosList.forEach(nmos => {
    const el = document.getElementById('nmos' + nmos);
    if (el && el.checked) count++;
  });
  return count;
}

/** Aircraft kicker amount based on NMOS count */
function aircraftMaintAmount(nmosCount) {
  if (nmosCount >= 3) return 15000;
  if (nmosCount === 2) return 10000;
  if (nmosCount === 1) return 5000;
  return 0;
}

function aircraftReadinessAmount(nmosCount) {
  if (nmosCount >= 3) return 24000;
  if (nmosCount === 2) return 16000;
  if (nmosCount === 1) return 8000;
  return 0;
}

/** Check if MOS matches aircraft maintenance pattern: 6062, 6092, 61xx, 62xx, 63xx, 6531 */
function isAircraftMaintMOS(mos) {
  if (mos === "6062" || mos === "6092" || mos === "6531") return true;
  const prefix = mos.substring(0, 2);
  if (prefix === "61" || prefix === "62" || prefix === "63") return true;
  return false;
}

/** Check if MOS matches aircraft readiness pattern: 61xx, 62xx, 63xx, 6531 */
function isAircraftReadinessMOS(mos) {
  if (mos === "6531") return true;
  const prefix = mos.substring(0, 2);
  if (prefix === "61" || prefix === "62" || prefix === "63") return true;
  return false;
}

/** Get rank number for comparison */
function rankNum(rank) {
  return parseInt(rank.replace('E', ''));
}

// ===================================================================
// MAIN CALCULATION
// ===================================================================

function calculateBonus() {
  const pebd = new Date(document.getElementById('pebd').value);
  const rank = document.getElementById('rank').value;
  const mos = document.getElementById('mos').value.toUpperCase();
  const ecc = new Date(document.getElementById('ecc').value);
  const reenlistDate = new Date(document.getElementById('reenlistDate').value);
  const months = parseInt(document.getElementById('months').value);
  const lateralMove = document.getElementById('lateralMove').value.toUpperCase();
  const mcc = document.getElementById('mcc').value.toUpperCase();
  const taxFreeZone = document.getElementById('taxFreeZone').value === 'true';

  // Validate inputs
  if (isNaN(pebd.getTime()) || isNaN(ecc.getTime()) || isNaN(reenlistDate.getTime()) || !months || !mos || !rank) {
    showResult('Please fill in all required fields correctly.', 'error');
    return;
  }

  // Check ECC eligibility (1 Oct 2026 to 30 Sep 2027)
  const minECC = new Date('2026-10-01');
  const maxECC = new Date('2027-09-30');
  if (ecc < minECC || ecc > maxECC) {
    showResult('⚠️ Your ECC must be between 1 October 2026 and 30 September 2027 to be eligible for FY27 SRBP.', 'warning');
    return;
  }

  // Check reenlistment date eligibility (on or after 22 Jan 2026 — MARADMIN release)
  const minReenlistDate = new Date('2026-01-22');
  if (reenlistDate < minReenlistDate) {
    showResult('⚠️ Reenlistment must be on or after 22 January 2026 (MARADMIN release date) to be eligible for FY27 SRBP.', 'warning');
    return;
  }

  // Calculate years of service at reenlistment
  const msd = (reenlistDate - pebd) / (1000 * 60 * 60 * 24 * 365.25);
  let zone = '';
  
  if (msd >= 1.42 && msd < 6) zone = 'A';
  else if (msd >= 6 && msd < 10) zone = 'B';
  else if (msd >= 10 && msd < 14) zone = 'C';
  else if (msd >= 14 && msd < 18) zone = 'D';
  else if (msd >= 18 && msd < 20) zone = 'E';
  else if (msd >= 20 && msd < 24) zone = 'F';
  else {
    showResult('❌ Not eligible for SRBP. You must have between 17 months and 24 years of service.', 'error');
    return;
  }

  // Determine effective MOS (lateral move or current)
  const effectiveMOS = lateralMove || mos;
  
  // Get base PMOS bonus
  let bonus = 0;
  if (bonusTable[zone] && bonusTable[zone][effectiveMOS] && bonusTable[zone][effectiveMOS][rank]) {
    bonus = bonusTable[zone][effectiveMOS][rank];
  }

  // Check for lateral move requirement
  let isLateralMove = false;
  if (lateralMove && lateralMove !== mos) {
    isLateralMove = true;
    if (!lateralMoveEligible[zone] || !lateralMoveEligible[zone].includes(lateralMove)) {
      showResult(`⚠️ MOS ${lateralMove} is not eligible for lateral move bonuses in Zone ${zone}.`, 'warning');
      return;
    }
  }

  // ===================================================================
  // KICKER ELIGIBILITY — FY27
  // ===================================================================
  const availableKickers = [];

  // --- 4.a Aircraft Maintenance Kicker ---
  // Zones A, B, C | E7 & below | 6062, 6092, 61xx, 62xx, 63xx, 6531 | 60 months
  if (["A", "B", "C"].includes(zone) && rankNum(rank) <= 7 && isAircraftMaintMOS(effectiveMOS) && months >= 60) {
    const nmosListForZone = aircraftMaintNMOS[zone] || [];
    const nmosCount = countCheckedNMOS(nmosListForZone);
    if (nmosCount > 0) {
      const amt = aircraftMaintAmount(nmosCount);
      availableKickers.push({
        type: 'aircraftMaintenance',
        amount: amt,
        name: 'Aircraft Maintenance Kicker',
        description: `+$${amt.toLocaleString()} for 60-month contract (${nmosCount} qualifying NMOS)`
      });
    }
  }

  // --- 4.b Aircraft Readiness Kicker ---
  // Zones A, B, C | E7 & below | 61xx, 62xx, 63xx, 6531 | 60 months | MCC required
  if (["A", "B", "C"].includes(zone) && rankNum(rank) <= 7 && isAircraftReadinessMOS(effectiveMOS) && months >= 60 && readinessMCCs.includes(mcc)) {
    const nmosListForZone = aircraftReadinessNMOS[zone] || [];
    const nmosCount = countCheckedNMOS(nmosListForZone);
    if (nmosCount > 0) {
      const amt = aircraftReadinessAmount(nmosCount);
      availableKickers.push({
        type: 'aircraftReadiness',
        amount: amt,
        name: 'Aircraft Readiness Kicker',
        description: `+$${amt.toLocaleString()} for 60-month contract with eligible MCC (${nmosCount} qualifying NMOS)`
      });
    }
  }

  // --- 4.c 84-Month LM Kicker ---
  // Zone A | E5 & below | specific PMOSs | 84 months | $50,000
  const lm84MOSs = ["0211", "0321", "0372", "1721", "1751", "2336", "3044", "5821", "5974", "5979", "6214", "6314", "7212", "7257"];
  if (zone === "A" && rankNum(rank) <= 5 && isLateralMove && lm84MOSs.includes(effectiveMOS) && months >= 84) {
    availableKickers.push({
      type: 'lateralMove84',
      amount: 50000,
      name: '84-Month Lateral Move Kicker',
      description: '+$50,000 for 84-month lateral move contracts'
    });
  }

  // --- 4.d 72-Month Mid-Career LM Kicker ---
  // Zone B | E7 & below | specific PMOSs | 72 months | $35,000
  const lmMidCareerMOSs = ["0211", "0372", "1751", "2336", "5821"];
  if (zone === "B" && rankNum(rank) <= 7 && isLateralMove && lmMidCareerMOSs.includes(effectiveMOS) && months >= 72) {
    availableKickers.push({
      type: 'lateralMoveCareer72',
      amount: 35000,
      name: '72-Month Mid-Career LM Kicker',
      description: '+$35,000 for 72-month mid-career lateral move contracts'
    });
  }

  // --- 4.e 24-Month FMF Infantry Kicker ---
  // Zone A | E5 & below | 0311, 0313, 0321, 0331, 0341, 0352 | 60 months | $7,000 | MCC required
  const fmfInfMOSs = ["0311", "0313", "0321", "0331", "0341", "0352"];
  if (zone === "A" && rankNum(rank) <= 5 && fmfInfMOSs.includes(effectiveMOS) && months >= 60 && fmfInfantry24MCCs.includes(mcc)) {
    availableKickers.push({
      type: 'fmfInfantry24',
      amount: 7000,
      name: '24-Month FMF Infantry Kicker',
      description: '+$7,000 for 60-month contract with 24-month MCC commitment'
    });
  }

  // --- 4.f 36-Month FMF Infantry Kicker ---
  // Zone A | E5 & below | 0311, 0313, 0321, 0331, 0341, 0352 | 60 months | $30,000 | MCC required
  if (zone === "A" && rankNum(rank) <= 5 && fmfInfMOSs.includes(effectiveMOS) && months >= 60 && fmfInfantry36MCCs.includes(mcc)) {
    availableKickers.push({
      type: 'fmfInfantry36',
      amount: 30000,
      name: '36-Month FMF Infantry Kicker',
      description: '+$30,000 for 60-month contract with 36-month MCC commitment'
    });
  }

  // --- 4.g Air Traffic Control Kicker ---
  // Zone A | E5 & below | 7257 | 60 months | $40,000 | ATC NMOS required
  if (zone === "A" && rankNum(rank) <= 5 && effectiveMOS === "7257" && months >= 60) {
    const hasATCNMOS = atcNMOS.some(nmos => {
      const el = document.getElementById('nmos' + nmos);
      return el && el.checked;
    });
    if (hasATCNMOS) {
      availableKickers.push({
        type: 'airTrafficControl',
        amount: 40000,
        name: 'Air Traffic Control Kicker',
        description: '+$40,000 for 60-month contract with qualifying ATC NMOS'
      });
    }
  }

  // ===================================================================
  // PRORATION & TAX
  // ===================================================================

  let proratedBonus = bonus;
  let prorationNote = '';

  if (months < 36) {
    proratedBonus = 0;
    prorationNote = 'Minimum 36 months required for any bonus payment.';
  } else if (months < 48 && bonus > 0) {
    proratedBonus = Math.round((months / 48) * bonus);
    prorationNote = `Bonus prorated: ${months}/48 months × $${bonus.toLocaleString()} = $${proratedBonus.toLocaleString()}`;
  }

  // Obligated service calc
  const obligatedMonths = Math.ceil(
    (new Date(ecc.getFullYear() + Math.floor(months/12), ecc.getMonth() + (months%12), ecc.getDate()) - ecc)
    / (1000 * 60 * 60 * 24 * 30.44)
  );

  // Pick best kicker
  const bestKicker = availableKickers.reduce((best, k) => {
    const total = proratedBonus + k.amount;
    return !best || total > best.total ? { ...k, total } : best;
  }, null);

  const amountForTax = bestKicker ? bestKicker.total : proratedBonus;
  const taxData = calculateTaxEstimate(amountForTax, taxFreeZone);

  showResult(formatResults({
    zone,
    msd: msd.toFixed(1),
    effectiveMOS,
    isLateralMove,
    baseBonus: bonus,
    proratedBonus,
    months,
    obligatedMonths,
    availableKickers,
    bestKicker,
    amountForTax,
    prorationNote,
    rank,
    taxFreeZone,
    taxData
  }), 'success');
}

// ===================================================================
// DISPLAY HELPERS
// ===================================================================

function resetForm() {
  document.getElementById('pebd').value = '';
  document.getElementById('rank').value = '';
  document.getElementById('mos').value = '';
  document.getElementById('ecc').value = '';
  document.getElementById('reenlistDate').value = '';
  document.getElementById('months').value = '';
  document.getElementById('lateralMove').value = '';
  document.getElementById('mcc').value = '';
  document.getElementById('taxFreeZone').value = 'false';

  allNMOSCheckboxes.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });

  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';
  resultDiv.style.display = 'none';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function calculateTaxEstimate(bonusAmount, isTaxFree) {
  if (isTaxFree || bonusAmount === 0) {
    return {
      lowTax: 0,
      highTax: 0,
      lowNet: bonusAmount,
      highNet: bonusAmount,
      note: isTaxFree ? 'Tax-free (combat zone)' : 'No bonus amount'
    };
  }
  const lowTaxRate = 0.22, highTaxRate = 0.24;
  const lowTax = Math.round(bonusAmount * lowTaxRate);
  const highTax = Math.round(bonusAmount * highTaxRate);
  return {
    lowTax,
    highTax,
    lowNet: bonusAmount - lowTax,
    highNet: bonusAmount - highTax,
    note: 'Federal income tax estimate (supplemental income rates)'
  };
}

function formatResults(data) {
  const fmt = (n) => `$${(n || 0).toLocaleString()}`;

  const chips = `
  <span class="chip">Zone ${data.zone}</span>
  <span class="chip">MOS ${data.effectiveMOS}${data.isLateralMove ? ' • LM' : ''}</span>
  <span class="chip">Rank ${data.rank}</span>
  <span class="chip">${data.months} mo contract</span>
  <span class="chip">${data.taxFreeZone ? 'Tax‑free (CZTE)' : 'Taxable'}</span>
  `;

  let html = `
  <div class="result-title">
       <h3 style="font-family: 'Overpass'; letter-spacing: .06em; margin:.25rem 0; font-weight: bold; color: #2c3e50;">FY27 SRBP Bonus Estimate</h3>
    <div class="badges">${chips}</div>
  </div>
  `;

  html += `
  <div class="meta-box">
    <div class="small-muted">
      Years of service at reenlistment: <strong>${data.msd}</strong> •
      Obligated service (calc): <strong>${data.obligatedMonths} months</strong>
    </div>
  </div>
  `;

  html += `
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Base PMOS (not prorated)</div>
      <div class="stat-value">${fmt(data.baseBonus)}</div>
      ${data.prorationNote ? `<div class="subnote">${data.prorationNote}</div>` : ''}
    </div>

    <div class="stat-card">
      <div class="stat-label">Estimated Base Payout</div>
      <div class="stat-value ok">${fmt(data.proratedBonus)}</div>
      <div class="subnote">Based on ${data.months} months</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Best Total (with kicker)</div>
      <div class="stat-value ${data.bestKicker ? 'ok' : ''}">
        ${data.bestKicker ? fmt(data.bestKicker.total) : '—'}
      </div>
      <div class="subnote">
        ${data.bestKicker ? `${data.bestKicker.name} (+${fmt(data.bestKicker.amount)})` : 'No eligible kicker'}
      </div>
    </div>
  </div>
  `;

  html += `
  <div class="tax-card" style="margin-top:1rem;">
    <div class="stat-label">Estimated Tax Impact</div>
    <div class="small-muted" style="margin:.25rem 0 .5rem;">
      Tax basis: <strong>${fmt(data.amountForTax)}</strong> ${data.bestKicker ? '(base + best kicker)' : '(base only)'}
    </div>
    <table class="tax-table" aria-label="tax estimate">
      <thead><tr><th>Scenario</th><th>Tax</th><th>Net</th></tr></thead>
      <tbody>
        <tr><td>22% (supplemental)</td><td>-${fmt(data.taxData.lowTax)}</td><td><strong>${fmt(data.taxData.lowNet)}</strong></td></tr>
        <tr><td>24% (supplemental)</td><td>-${fmt(data.taxData.highTax)}</td><td><strong>${fmt(data.taxData.highNet)}</strong></td></tr>
      </tbody>
    </table>
    <div class="small-muted" style="margin-top:.4rem;">${data.taxData.note}. State taxes, FICA, etc. not included.</div>
  </div>
  `;

  if (data.availableKickers.length) {
    html += `
      <div class="kicker-section" style="margin-top:1rem;">
        <h4 style="margin:.25rem 0;">Available Kickers</h4>
        <div class="small-muted" style="margin-bottom:.25rem;">If there are multiple options, you can only select <strong>one</strong>. Choose based on eligibility/commitment.</div>
        <div class="kicker-grid">
          ${data.availableKickers.map(k => {
            const total = data.proratedBonus + k.amount;
            return `
              <div class="kicker-card">
                <div class="kicker-name">${k.name}</div>
                <div class="kicker-extra">${k.description}</div>
                <div class="kicker-total">Total w/ this kicker: ${fmt(total)}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="small-muted" style="margin-top:.75rem;">
        No kickers available with the current inputs. Check NMOS, MCC, or LM options.
      </div>
    `;
  }

  html += `
  <details class="details-note" style="margin-top:1rem;">
    <summary>⚠️ Important Notes</summary>
    <ul style="margin:.6rem 0 0 1.1rem;">
       <li>This is an estimate only - final bonus determination is made by HQMC</li>
       <li>SRB payments are made in the FY of your ECC, not at time of reenlistment</li>
       <li>Lateral move bonuses are paid upon successful completion of PMOS training</li>
       <li>Career SRB payments are capped at $360,000 lifetime</li>
       <li>Marines selected to First Sergeant are not eligible for PMOS bonuses</li>
       <li>Kickers require 60 months of additional obligated service — no proration on kickers</li>
       <li>The BSSRB Program is suspended for FY27</li>
       <li><strong>Tax estimates use supplemental income rates (22%-24%) and exclude state taxes, FICA, and other deductions</strong></li>
       <li>Actual tax liability may vary based on total income, filing status, and other factors</li>
       <li>Consult with your Career Planner for official guidance</li>
    </ul>
    <div style="margin-top:.6rem;">
      <a class="official-link" href="https://www.marines.mil/News/Messages/Messages-Display/Article/4385746/fiscal-year-2027-selective-retention-bonus-program-and-fiscal-year-2027-broken/" target="_blank" rel="noopener noreferrer">Read the official FY27 SRBP MARADMIN</a>
    </div>
  </details>
  `;

  return html;
}

function showResult(content, type) {
  const resultDiv = document.getElementById('result');
  resultDiv.classList.remove('fade-in');
  resultDiv.innerHTML = content;
  resultDiv.style.display = 'block';

  if (type === 'error') {
    resultDiv.style.background = 'linear-gradient(135deg, #fee, #fcc)';
    resultDiv.style.border = '2px solid #e74c3c';
  } else if (type === 'warning') {
    resultDiv.style.background = 'linear-gradient(135deg, #fff3cd, #ffeaa7)';
    resultDiv.style.border = '2px solid #f39c12';
  } else {
    resultDiv.style.background = 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
    resultDiv.style.border = '2px solid #27ae60';
  }

  void resultDiv.offsetWidth;
  resultDiv.classList.add('fade-in');

  resultDiv.scrollIntoView({ behavior: 'smooth' });
}
</script>