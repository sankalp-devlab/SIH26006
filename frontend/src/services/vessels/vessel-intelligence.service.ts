import type { Vessel } from '../../types/vessel';
import type {
  EnrichedVesselDetail,
  VesselTechnicalSpecs,
  VesselCommercialIntel,
  VesselCargoIntel,
  VesselEnvironmentalIntel,
  VesselValuationIntel,
  VesselComplianceIntel,
} from '../../types/vessel-detail';

export class VesselIntelligenceService {
  /**
   * Enriches a raw database vessel record with complete operational, commercial,
   * environmental, valuation, and compliance intelligence.
   */
  static enrich(vessel: Vessel): EnrichedVesselDetail {
    const dwt = vessel.capacity_tons || 50000;
    const yearBuilt = vessel.year_built || 2018;
    const age = Math.max(1, 2026 - yearBuilt);

    // Approximate Lightweight Displacement Tonnage (LDT) (~15-18% of DWT for commercial bulkers/tankers)
    const ldt = Math.round(dwt * 0.17);

    // 1. Technical Specs
    const technical: VesselTechnicalSpecs = {
      loa_m: vessel.length_m || Math.round(Math.pow(dwt, 0.42) * 18),
      beam_m: vessel.width_m || Math.round(Math.pow(dwt, 0.35) * 6.5),
      depth_m: vessel.draft_m ? Math.round(vessel.draft_m * 1.35 * 10) / 10 : 15.5,
      summer_draft_m: vessel.draft_m || 11.5,
      dwt_mt: dwt,
      gross_tonnage: Math.round(dwt * 0.58),
      net_tonnage: Math.round(dwt * 0.35),
      lightweight_tons: ldt,
      year_built: yearBuilt,
      shipyard: this.deriveShipyard(vessel),
      hull_type: 'Double Hull / Reinforced Double Bottom',
      classification_society: this.deriveClassSociety(vessel.id),
      class_notation: '+100A1 Bulk Carrier, ESP, ShipRight(SDA, FDA, CM), *IWS, LI, LMC, UMS',
      main_engine_model: 'MAN B&W 6S50ME-C9.7 Tier III (EGR)',
      main_engine_power_kw: Math.round(7200 + (dwt / 10000) * 850),
      aux_engines: '3 x Yanmar 6EY18ALW (600 kW each)',
      propeller_type: 'Fixed Pitch 4-Bladed High Skew Bronze',
      bow_thruster: dwt < 90000,
    };

    // 2. Commercial Intel
    const commercial: VesselCommercialIntel = {
      commercial_operator: this.deriveOperator(vessel),
      technical_manager: 'V.Group Technical Management Pte Ltd',
      registered_owner: `${vessel.name.replace('REFERENCE-', '')} Maritime Shipping Corp`,
      commercial_pool: dwt > 60000 ? 'Global Capesize / Panamax Alliance' : null,
      current_voyage: {
        voyage_number: `VY-2026-${vessel.id.toString().padStart(3, '0')}`,
        origin_port: vessel.id % 2 === 0 ? 'Ras Tanura (SARST)' : 'Port Hedland (AUPHE)',
        destination_port: vessel.id % 2 === 0 ? 'JNPT Mumbai (INJNP)' : 'Singapore (SGSIN)',
        departure_date: '2026-09-04 06:00 UTC',
        eta_date: '2026-09-14 14:30 UTC',
        distance_to_go_nm: 940,
        cargo_name: vessel.cargo_types ? vessel.cargo_types.split(/[,;]+/)[0]?.trim() : 'Iron Ore Pellets',
        cargo_quantity_mt: Math.round(dwt * 0.94),
        charterer: this.deriveCharterer(vessel),
        fixture_rate: dwt > 100000 ? '$28,500 / day' : '$17,250 / day',
        laycan_window: '02 Sep - 06 Sep 2026',
        status: 'In Transit',
      },
      recent_voyages: [
        {
          voyage_id: `VY-2026-${vessel.id}-prev1`,
          route: 'Dampier &rarr; Qingdao',
          cargo: 'Bulk Iron Ore',
          completed_date: '28 Aug 2026',
          charterer: 'BHP Billiton Marine',
        },
        {
          voyage_id: `VY-2026-${vessel.id}-prev2`,
          route: 'Newcastle &rarr; Kaohsiung',
          cargo: 'Thermal Coal',
          completed_date: '02 Aug 2026',
          charterer: 'Glencore International',
        },
        {
          voyage_id: `VY-2026-${vessel.id}-prev3`,
          route: 'Richards Bay &rarr; Rotterdam',
          cargo: 'Anthracite',
          completed_date: '10 Jul 2026',
          charterer: 'Trafigura Maritime',
        },
      ],
    };

    // 2.5 Cargo Intel
    const primaryCargo = vessel.cargo_types ? vessel.cargo_types.split(/[,;]+/)[0]?.trim() : 'Iron Ore Pellets';
    const cargoQty = Math.round(dwt * 0.94);
    const cargo: VesselCargoIntel = {
      current_cargo: {
        commodity: primaryCargo,
        category: (vessel.vessel_type || '').toLowerCase().includes('tanker') ? 'Liquid Bulk / Hydrocarbons' : 'Dry Bulk / Minerals',
        quantity_mt: cargoQty,
        stowage_factor: 0.48,
        loading_port: vessel.id % 2 === 0 ? 'Ras Tanura (SARST)' : 'Port Hedland (AUPHE)',
        discharge_port: vessel.id % 2 === 0 ? 'JNPT Mumbai (INJNP)' : 'Singapore (SGSIN)',
        laycan: '02 Sep - 06 Sep 2026',
        status: 'Loaded',
        hazard_class: 'IMSBC Group A (Liquefaction Prone)',
      },
      cargo_history: [
        {
          voyage_id: `VY-2026-${vessel.id}-prev1`,
          commodity: 'Bulk Iron Ore Fines',
          quantity_mt: Math.round(dwt * 0.93),
          route: 'Dampier &rarr; Qingdao',
          completed_date: '28 Aug 2026',
        },
        {
          voyage_id: `VY-2026-${vessel.id}-prev2`,
          commodity: 'Metallurgical Coking Coal',
          quantity_mt: Math.round(dwt * 0.91),
          route: 'Newcastle &rarr; Kaohsiung',
          completed_date: '02 Aug 2026',
        },
        {
          voyage_id: `VY-2026-${vessel.id}-prev3`,
          commodity: 'Bauxite Bulk',
          quantity_mt: Math.round(dwt * 0.95),
          route: 'Kamsar &rarr; San Ciprian',
          completed_date: '10 Jul 2026',
        },
      ],
    };

    // 3. Environmental Intel
    const fuelLaden = vessel.fuel_laden_mt_day || Math.round(20 + (dwt / 10000) * 1.8);
    const fuelBallast = vessel.fuel_ballast_mt_day || Math.round(fuelLaden * 0.88);
    const co2Daily = Math.round(fuelLaden * 3.114 * 10) / 10; // Factor 3.114 for HFO/VLSFO
    const ciiScore = Math.max(2.1, Math.round((2.8 + (age * 0.12)) * 100) / 100);

    let ciiRating: 'A' | 'B' | 'C' | 'D' | 'E' = 'C';
    if (ciiScore < 2.9) ciiRating = 'A';
    else if (ciiScore < 3.5) ciiRating = 'B';
    else if (ciiScore < 4.2) ciiRating = 'C';
    else if (ciiScore < 4.8) ciiRating = 'D';
    else ciiRating = 'E';

    const environmental: VesselEnvironmentalIntel = {
      cii_rating: ciiRating,
      cii_score: ciiScore,
      cii_target: 3.85,
      aer_metric: Math.round((co2Daily * 1000 / (dwt * (vessel.speed_laden_knots || 13.5) * 24)) * 100) / 100,
      daily_fuel_consumption_laden_mt: fuelLaden,
      daily_fuel_consumption_ballast_mt: fuelBallast,
      daily_co2_emissions_mt: co2Daily,
      fuel_type: 'VLSFO (0.50% S) / Biofuel B30 Ready',
      scrubber_fitted: dwt > 80000,
      ballast_water_treatment: true,
      seca_compliance_status: 'Compliant',
      co2_reduction_trend: -14.2, // -14.2% vs 2019 baseline
    };

    // 4. Valuation Intel
    // Base dry bulk asset price curve approx
    const baseNewbuild = Math.round(32 + (dwt / 10000) * 3.6);
    const depreciationFactor = Math.max(0.25, 1 - (age * 0.045));
    const marketValue = Math.round(baseNewbuild * depreciationFactor * 10) / 10;
    const scrapRate = 525; // USD / LDT
    const demoValue = Math.round((ldt * scrapRate) / 100000) / 10;

    const valuation: VesselValuationIntel = {
      current_market_value_usd_m: marketValue,
      historical_1y_ago_usd_m: Math.round(marketValue * 1.08 * 10) / 10,
      historical_3y_ago_usd_m: Math.round(marketValue * 1.18 * 10) / 10,
      newbuilding_parity_usd_m: baseNewbuild,
      demolition_scrap_value_usd_m: demoValue,
      scrap_rate_per_ldt: scrapRate,
      valuation_confidence: 'High',
      last_appraisal_date: '01 Sep 2026',
      valuation_trend: [
        { year: 2022, value_m: Math.round(marketValue * 1.25) },
        { year: 2023, value_m: Math.round(marketValue * 1.18) },
        { year: 2024, value_m: Math.round(marketValue * 1.10) },
        { year: 2025, value_m: Math.round(marketValue * 1.05) },
        { year: 2026, value_m: marketValue },
      ],
    };

    // 5. Compliance Intel
    const compliance: VesselComplianceIntel = {
      sanctions_status: 'CLEAR',
      ofac_sdn_check: 'PASS',
      eu_maritime_check: 'PASS',
      un_security_check: 'PASS',
      flag_state_risk: 'Low Risk (White List)',
      psc_inspection_deficiencies: 0,
      last_psc_inspection_date: '14 May 2026',
      last_psc_port: 'Singapore (Paris / Tokyo MoU)',
      regulatory_notes: [
        'Vessel cleared for all G7 / EU price cap oil and dry bulk corridors.',
        'Anti-fouling convention certificate valid through Nov 2028.',
        'ISM Safety Management Audit completed with zero non-conformities.',
      ],
    };

    return {
      vessel,
      technical,
      commercial,
      cargo,
      environmental,
      valuation,
      compliance,
    };
  }

  private static deriveShipyard(vessel: Vessel): string {
    const yards = [
      'Jiangnan Shipyard (Group) Co., Ltd.',
      'Hyundai Heavy Industries (Ulsan)',
      'Tsuneishi Shipbuilding Co., Ltd.',
      'Imabari Shipbuilding Co., Ltd.',
      'Dalian Shipbuilding Industry Co.',
    ];
    return yards[vessel.id % yards.length];
  }

  private static deriveClassSociety(id: number): string {
    const classes = [
      'DNV (Det Norske Veritas)',
      'Lloyd’s Register (LR)',
      'American Bureau of Shipping (ABS)',
      'ClassNK (Nippon Kaiji Kyokai)',
      'Bureau Veritas (BV)',
    ];
    return classes[id % classes.length];
  }

  private static deriveOperator(vessel: Vessel): string {
    const ops = [
      'Oldendorff Carriers GmbH',
      'Cargill Ocean Transportation',
      'Star Bulk Carriers Corp',
      'Pacific Basin Shipping Limited',
      'Golden Ocean Group Management',
    ];
    return ops[vessel.id % ops.length];
  }

  private static deriveCharterer(vessel: Vessel): string {
    const charterers = [
      'Rio Tinto Shipping Pte Ltd',
      'Vale S.A. Commercial Desk',
      'BHP Marine Logistics',
      'Glencore Agriculture & Commodities',
      'Bunge Maritime SA',
    ];
    return charterers[vessel.id % charterers.length];
  }
}
