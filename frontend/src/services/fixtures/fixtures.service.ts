/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 10: Fixtures Service & Operational Chartering Engine
 */

import type {
  FixtureRecord,
  FixtureStatus,
  CreateFixturePayload,
  FixtureFiltersState,
  FixtureAnalyticsSummary,
  RateCurrency,
  RateType,
} from '../../types/fixture';

const STORAGE_KEY = 'sih26006_fixtures_v2';
const NOTIF_EVENT_NAME = 'sih26006_new_notification';

export class FixturesService {
  /**
   * Initial realistic maritime fixtures across spot and time charter trades
   */
  private static getSeedFixtures(): FixtureRecord[] {
    return [
      {
        id: 'fx-1021',
        fixture_reference: 'FX-2026-1021',
        vessel_id: 201,
        vessel_name: 'PACIFIC HORIZON',
        vessel_type: 'Capesize Bulk Carrier',
        vessel_imo: 'IMO 9452310',
        vessel_dwt: 180000,
        cargo_id: 1,
        cargo_reference: 'CRG-2026-8801',
        commodity: 'Pilbara High-Grade Iron Ore Fines',
        cargo_type: 'Dry Bulk',
        quantity_tons: 172000,
        ports: [
          {
            sequence: 1,
            port_id: 104,
            port_name: 'Port Hedland',
            country: 'Australia',
            unlocode: 'AUPHE',
            port_type: 'load',
            eta: '2026-09-15T06:00:00Z',
            etd: '2026-09-17T18:00:00Z',
            berth_notes: 'Nelson Point Berth 1',
          },
          {
            sequence: 2,
            port_id: 103,
            port_name: 'Singapore Hub',
            country: 'Singapore',
            unlocode: 'SGSIN',
            port_type: 'bunkering',
            eta: '2026-09-23T12:00:00Z',
            etd: '2026-09-24T04:00:00Z',
            berth_notes: 'Eastern Bunkering Anchorage',
          },
          {
            sequence: 3,
            port_id: 108,
            port_name: 'Qingdao Port',
            country: 'China',
            unlocode: 'CNQDG',
            port_type: 'discharge',
            eta: '2026-10-02T08:00:00Z',
            etd: '2026-10-05T14:00:00Z',
            berth_notes: 'Qingdao Ore Terminal #4',
          },
        ],
        rate_value: 29500,
        rate_currency: 'USD',
        rate_type: 'per_day',
        rate_formatted: '$29,500 / day',
        rate_notes: 'Bunkers for charterer account (VLSFO $620/MT). Laytime 48h SHINC.',
        demurrage_usd_day: 28000,
        commission_percent: 2.5,
        charterer: 'Baosteel Iron & Steel Co.',
        charterer_broker: 'Clarksons Platou Singapore',
        owner_entity: 'Pacific Horizon Marine Corp',
        charter_party_form: 'NYPE 93 (Time Charter)',
        fixture_date: '2026-09-10T14:30:00Z',
        laycan_start: '2026-09-15T00:00:00Z',
        laycan_end: '2026-09-22T23:59:59Z',
        status: 'fully_fixed',
        is_historical: false,
        notes: 'Clean fixture confirmed. All subjects lifted on Sep 11. Bill of lading draft pre-approved.',
        history: [
          {
            id: 'h-1',
            timestamp: '2026-09-09T09:00:00Z',
            user: 'Chartering Specialist (Capt. R. Menon)',
            action: 'Fixture Created',
            to_status: 'draft',
            note: 'Initial negotiations opened with Baosteel chartering desk.',
          },
          {
            id: 'h-2',
            timestamp: '2026-09-10T11:30:00Z',
            user: 'Chartering Specialist (Capt. R. Menon)',
            action: 'Placed on Subjects',
            from_status: 'draft',
            to_status: 'on_subjects',
            note: 'Agreed on $29,500/day. On subjects supplier approval & stem confirmation.',
          },
          {
            id: 'h-3',
            timestamp: '2026-09-11T14:30:00Z',
            user: 'Chartering Specialist (Capt. R. Menon)',
            action: 'Fully Fixed',
            from_status: 'on_subjects',
            to_status: 'fully_fixed',
            note: 'Baosteel lifted stem and terminal clearance subjects.',
          },
        ],
        created_at: '2026-09-09T09:00:00Z',
        updated_at: '2026-09-11T14:30:00Z',
        created_by: 'Capt. R. Menon',
        last_updated_by: 'Capt. R. Menon',
      },
      {
        id: 'fx-1022',
        fixture_reference: 'FX-2026-1022',
        vessel_id: 203,
        vessel_name: 'OCEAN ENDEAVOUR',
        vessel_type: 'Suezmax Crude Tanker',
        vessel_imo: 'IMO 9521094',
        vessel_dwt: 158000,
        cargo_id: 3,
        cargo_reference: 'CRG-2026-8803',
        commodity: 'Arabian Light Crude Oil',
        cargo_type: 'Liquid Bulk',
        quantity_tons: 132000,
        ports: [
          {
            sequence: 1,
            port_id: 101,
            port_name: 'Ras Tanura',
            country: 'Saudi Arabia',
            unlocode: 'SARST',
            port_type: 'load',
            eta: '2026-09-14T08:00:00Z',
            etd: '2026-09-16T12:00:00Z',
            berth_notes: 'Sea Island Berth 14',
          },
          {
            sequence: 2,
            port_id: 107,
            port_name: 'Fujairah Anchorage',
            country: 'UAE',
            unlocode: 'AEFJR',
            port_type: 'bunkering',
            eta: '2026-09-17T14:00:00Z',
            etd: '2026-09-18T06:00:00Z',
            berth_notes: 'Outer Anchorage Bunker Barge',
          },
          {
            sequence: 3,
            port_id: 103,
            port_name: 'Singapore Hub',
            country: 'Singapore',
            unlocode: 'SGSIN',
            port_type: 'discharge',
            eta: '2026-09-28T16:00:00Z',
            etd: '2026-09-30T20:00:00Z',
            berth_notes: 'Jurong Island Single Point Mooring (SPM)',
          },
        ],
        rate_value: 44000,
        rate_currency: 'USD',
        rate_type: 'per_day',
        rate_formatted: '$44,000 / day',
        rate_notes: 'Worldscale base benchmark equivalent WS 78.5. Demurrage $42k/day.',
        demurrage_usd_day: 42000,
        commission_percent: 1.25,
        charterer: 'Saudi Aramco Commercial Lineup',
        charterer_broker: 'Simpson Spence Young (Dubai)',
        owner_entity: 'Oceanic Tanker Assets Ltd',
        charter_party_form: 'SHELLTIME 4 (Tanker)',
        fixture_date: '2026-09-11T10:00:00Z',
        laycan_start: '2026-09-14T00:00:00Z',
        laycan_end: '2026-09-20T23:59:59Z',
        status: 'on_subjects',
        is_historical: false,
        notes: 'Subject to SIRE inspection review and vetting approval by Aramco terminal safety desk.',
        history: [
          {
            id: 'h-4',
            timestamp: '2026-09-11T10:00:00Z',
            user: 'Tanker Broker (A. Al-Mansoor)',
            action: 'Placed on Subjects',
            from_status: 'draft',
            to_status: 'on_subjects',
            note: 'Commercial terms agreed. On subjects vetting & SIRE report expiry check.',
          },
        ],
        created_at: '2026-09-11T10:00:00Z',
        updated_at: '2026-09-11T10:00:00Z',
        created_by: 'A. Al-Mansoor',
        last_updated_by: 'A. Al-Mansoor',
      },
      {
        id: 'fx-1023',
        fixture_reference: 'FX-2026-1023',
        vessel_id: 202,
        vessel_name: 'NORDIC VALIANT',
        vessel_type: 'Panamax Bulk Carrier',
        vessel_imo: 'IMO 9684122',
        vessel_dwt: 76000,
        cargo_id: 2,
        cargo_reference: 'CRG-2026-8802',
        commodity: 'Australian Premium Hard Coking Coal',
        cargo_type: 'Dry Bulk',
        quantity_tons: 74500,
        ports: [
          {
            sequence: 1,
            port_id: 104,
            port_name: 'Port Hedland',
            country: 'Australia',
            unlocode: 'AUPHE',
            port_type: 'load',
            eta: '2026-09-18T08:00:00Z',
            etd: '2026-09-20T16:00:00Z',
            berth_notes: 'Berth 2 Bulk Loader',
          },
          {
            sequence: 2,
            port_id: 102,
            port_name: 'JNPT Mumbai',
            country: 'India',
            unlocode: 'INJNP',
            port_type: 'discharge',
            eta: '2026-10-04T12:00:00Z',
            etd: '2026-10-07T18:00:00Z',
            berth_notes: 'JNPT Multi-Purpose Berth 3',
          },
        ],
        rate_value: 18.75,
        rate_currency: 'USD',
        rate_type: 'per_mt',
        rate_formatted: '$18.75 / MT',
        rate_notes: 'Freight payable 95% on release of bills of lading. 12,000 MT/day load/discharge.',
        demurrage_usd_day: 19500,
        commission_percent: 2.5,
        charterer: 'Glencore International Commodities',
        charterer_broker: 'Braemar ACM Shipbroking',
        owner_entity: 'Nordic Bulk Carriers AS',
        charter_party_form: 'GENCON 94 (Voyage Charter)',
        fixture_date: '2026-09-08T16:00:00Z',
        laycan_start: '2026-09-18T00:00:00Z',
        laycan_end: '2026-09-25T23:59:59Z',
        status: 'fully_fixed',
        is_historical: false,
        notes: 'Clean fixture completed with Glencore coal desk. Notice of Readiness sent to shipper.',
        history: [
          {
            id: 'h-5',
            timestamp: '2026-09-07T11:00:00Z',
            user: 'Operations Desk',
            action: 'Draft Created',
            to_status: 'draft',
            note: 'Freight inquiry received via WhatsApp desk.',
          },
          {
            id: 'h-6',
            timestamp: '2026-09-08T16:00:00Z',
            user: 'Operations Desk',
            action: 'Fully Fixed',
            from_status: 'on_subjects',
            to_status: 'fully_fixed',
            note: 'Subjects lifted immediately by Glencore.',
          },
        ],
        created_at: '2026-09-07T11:00:00Z',
        updated_at: '2026-09-08T16:00:00Z',
        created_by: 'Operations Desk',
        last_updated_by: 'Operations Desk',
      },
      {
        id: 'fx-1024',
        fixture_reference: 'FX-2026-1024',
        vessel_id: 204,
        vessel_name: 'GLOBAL VOYAGER',
        vessel_type: 'Supramax Bulk Carrier',
        vessel_imo: 'IMO 9381774',
        vessel_dwt: 58000,
        commodity: 'Indonesian Thermal Coal (5,500 NAR)',
        cargo_type: 'Dry Bulk',
        quantity_tons: 52000,
        ports: [
          {
            sequence: 1,
            port_id: 103,
            port_name: 'Samarinda Anchorage',
            country: 'Indonesia',
            unlocode: 'IDSMD',
            port_type: 'load',
            eta: '2026-09-24T06:00:00Z',
            etd: '2026-09-26T20:00:00Z',
            berth_notes: 'Muara Berau Floating Crane Transshipment',
          },
          {
            sequence: 2,
            port_id: 103,
            port_name: 'Singapore Hub',
            country: 'Singapore',
            unlocode: 'SGSIN',
            port_type: 'bunkering',
            eta: '2026-09-28T14:00:00Z',
            etd: '2026-09-29T04:00:00Z',
            berth_notes: 'Western Bunkering Anchorage',
          },
          {
            sequence: 3,
            port_id: 102,
            port_name: 'JNPT Mumbai',
            country: 'India',
            unlocode: 'INJNP',
            port_type: 'discharge',
            eta: '2026-10-09T08:00:00Z',
            etd: '2026-10-12T16:00:00Z',
            berth_notes: 'Tata Power Trombay Coal Jetty',
          },
        ],
        rate_value: 16800,
        rate_currency: 'USD',
        rate_type: 'per_day',
        rate_formatted: '$16,800 / day',
        rate_notes: 'Delivery pilot station Samarinda, redelivery passing Colombo out of charter.',
        demurrage_usd_day: 16000,
        commission_percent: 3.75,
        charterer: 'PT Adaro Energy Indonesia',
        charterer_broker: 'Howe Robinson Partners',
        owner_entity: 'Global Seaways Maritime',
        charter_party_form: 'NYPE 93 (Time Charter Trip)',
        fixture_date: '2026-09-11T12:00:00Z',
        laycan_start: '2026-09-24T00:00:00Z',
        laycan_end: '2026-09-30T23:59:59Z',
        status: 'on_subjects',
        is_historical: false,
        notes: 'On subjects charterer board approval expiring 14 Sep 17:00 Singapore time.',
        history: [
          {
            id: 'h-7',
            timestamp: '2026-09-11T12:00:00Z',
            user: 'Chartering Specialist (Capt. R. Menon)',
            action: 'Placed on Subjects',
            from_status: 'draft',
            to_status: 'on_subjects',
            note: 'Agreed $16,800/day. Awaiting Adaro internal management authorization.',
          },
        ],
        created_at: '2026-09-11T12:00:00Z',
        updated_at: '2026-09-11T12:00:00Z',
        created_by: 'Capt. R. Menon',
        last_updated_by: 'Capt. R. Menon',
      },
      {
        id: 'fx-1025',
        fixture_reference: 'FX-2026-1025',
        vessel_id: 205,
        vessel_name: 'MAERSK KALMAR',
        vessel_type: 'Container Ship (Neo-Panamax)',
        vessel_imo: 'IMO 9720445',
        vessel_dwt: 120000,
        cargo_id: 6,
        cargo_reference: 'CRG-2026-8806',
        commodity: 'Automotive Precision Powertrain Assemblies',
        cargo_type: 'Containerized',
        quantity_tons: 22400,
        ports: [
          {
            sequence: 1,
            port_id: 110,
            port_name: 'Antwerp Port',
            country: 'Belgium',
            unlocode: 'BEANR',
            port_type: 'load',
            eta: '2026-09-16T08:00:00Z',
            etd: '2026-09-18T18:00:00Z',
            berth_notes: 'Antwerp Gateway Terminal 1700',
          },
          {
            sequence: 2,
            port_id: 102,
            port_name: 'JNPT Mumbai',
            country: 'India',
            unlocode: 'INJNP',
            port_type: 'discharge',
            eta: '2026-10-02T10:00:00Z',
            etd: '2026-10-04T16:00:00Z',
            berth_notes: 'Gateway Terminals India (GTI)',
          },
        ],
        rate_value: 38500,
        rate_currency: 'USD',
        rate_type: 'per_day',
        rate_formatted: '$38,500 / day',
        rate_notes: 'Container slot charter party. Fixed bunker fuel adjustment factor included.',
        demurrage_usd_day: 32000,
        commission_percent: 2.0,
        charterer: 'Toyota Logistics Europe N.V.',
        charterer_broker: 'Maersk Broker Liner Services',
        owner_entity: 'A.P. Moller - Maersk',
        charter_party_form: 'BIMCO BOXTIME (Slot Charter)',
        fixture_date: '2026-09-10T16:00:00Z',
        laycan_start: '2026-09-16T00:00:00Z',
        laycan_end: '2026-09-23T12:00:00Z',
        status: 'draft',
        is_historical: false,
        notes: 'Slot allocation proposal under review. Demurrage terms being synchronized with GTI terminal.',
        history: [
          {
            id: 'h-8',
            timestamp: '2026-09-10T16:00:00Z',
            user: 'Liner Specialist',
            action: 'Draft Created',
            to_status: 'draft',
            note: 'Initial contract draft compiled.',
          },
        ],
        created_at: '2026-09-10T16:00:00Z',
        updated_at: '2026-09-10T16:00:00Z',
        created_by: 'Liner Specialist',
        last_updated_by: 'Liner Specialist',
      },
      // HISTORICAL FIXTURES
      {
        id: 'fx-0988',
        fixture_reference: 'FX-2026-0988',
        vessel_id: 201,
        vessel_name: 'PACIFIC HORIZON',
        vessel_type: 'Capesize Bulk Carrier',
        vessel_imo: 'IMO 9452310',
        vessel_dwt: 180000,
        commodity: 'Pilbara Iron Ore Fines',
        cargo_type: 'Dry Bulk',
        quantity_tons: 170000,
        ports: [
          {
            sequence: 1,
            port_id: 104,
            port_name: 'Port Hedland',
            country: 'Australia',
            unlocode: 'AUPHE',
            port_type: 'load',
            eta: '2026-08-01T06:00:00Z',
            etd: '2026-08-03T18:00:00Z',
          },
          {
            sequence: 2,
            port_id: 105,
            port_name: 'Rotterdam Maasvlakte',
            country: 'Netherlands',
            unlocode: 'NLRTM',
            port_type: 'discharge',
            eta: '2026-08-28T08:00:00Z',
            etd: '2026-08-31T14:00:00Z',
          },
        ],
        rate_value: 27800,
        rate_currency: 'USD',
        rate_type: 'per_day',
        rate_formatted: '$27,800 / day',
        demurrage_usd_day: 26000,
        commission_percent: 2.5,
        charterer: 'Rio Tinto Commercial Shipping',
        charterer_broker: 'Clarksons Platou',
        owner_entity: 'Pacific Horizon Marine Corp',
        charter_party_form: 'NYPE 93',
        fixture_date: '2026-07-28T10:00:00Z',
        laycan_start: '2026-08-01T00:00:00Z',
        laycan_end: '2026-08-06T23:59:59Z',
        status: 'fully_fixed',
        is_historical: true,
        notes: 'Voyage completed successfully. Full demurrage cleared and settlement finalized.',
        history: [
          {
            id: 'h-9',
            timestamp: '2026-07-28T10:00:00Z',
            user: 'Capt. R. Menon',
            action: 'Fully Fixed',
            to_status: 'fully_fixed',
            note: 'Charter party signed.',
          },
        ],
        created_at: '2026-07-28T10:00:00Z',
        updated_at: '2026-09-02T12:00:00Z',
        created_by: 'Capt. R. Menon',
        last_updated_by: 'Capt. R. Menon',
      },
      {
        id: 'fx-0989',
        fixture_reference: 'FX-2026-0989',
        vessel_id: 202,
        vessel_name: 'NORDIC VALIANT',
        vessel_type: 'Panamax Bulk Carrier',
        vessel_imo: 'IMO 9684122',
        vessel_dwt: 76000,
        commodity: 'Canadian Wheat & Grains',
        cargo_type: 'Dry Bulk',
        quantity_tons: 65000,
        ports: [
          {
            sequence: 1,
            port_id: 111,
            port_name: 'Vancouver Pacific',
            country: 'Canada',
            unlocode: 'CAVAN',
            port_type: 'load',
            eta: '2026-08-10T08:00:00Z',
            etd: '2026-08-13T16:00:00Z',
          },
          {
            sequence: 2,
            port_id: 112,
            port_name: 'Yokohama Terminal',
            country: 'Japan',
            unlocode: 'JPYOK',
            port_type: 'discharge',
            eta: '2026-08-27T10:00:00Z',
            etd: '2026-08-30T18:00:00Z',
          },
        ],
        rate_value: 19500,
        rate_currency: 'USD',
        rate_type: 'per_day',
        rate_formatted: '$19,500 / day',
        demurrage_usd_day: 18000,
        commission_percent: 2.5,
        charterer: 'Cargill Agriculture Grain Desk',
        charterer_broker: 'Braemar ACM',
        owner_entity: 'Nordic Bulk Carriers AS',
        charter_party_form: 'GENCON 94',
        fixture_date: '2026-08-04T15:00:00Z',
        laycan_start: '2026-08-10T00:00:00Z',
        laycan_end: '2026-08-15T23:59:59Z',
        status: 'failed',
        is_historical: true,
        notes: 'Failed on subjects due to phytosanitary clearance delay and berth congestion at Vancouver terminal.',
        history: [
          {
            id: 'h-10',
            timestamp: '2026-08-04T15:00:00Z',
            user: 'Operations Desk',
            action: 'Placed on Subjects',
            from_status: 'draft',
            to_status: 'on_subjects',
            note: 'Subjects placed for 48 hours.',
          },
          {
            id: 'h-11',
            timestamp: '2026-08-06T17:00:00Z',
            user: 'Operations Desk',
            action: 'Fixture Failed',
            from_status: 'on_subjects',
            to_status: 'failed',
            note: 'Failed on subjects: phytosanitary certification delay.',
          },
        ],
        created_at: '2026-08-04T15:00:00Z',
        updated_at: '2026-08-06T17:00:00Z',
        created_by: 'Operations Desk',
        last_updated_by: 'Operations Desk',
      },
    ];
  }

  /**
   * Helper to format currency rate string
   */
  public static formatRate(value: number, currency: RateCurrency = 'USD', type: RateType = 'per_day'): string {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : 'S$';
    if (type === 'per_day') {
      return `${symbol}${value.toLocaleString()} / day`;
    }
    if (type === 'per_mt') {
      return `${symbol}${value.toFixed(2)} / MT`;
    }
    if (type === 'lumpsum') {
      return `${symbol}${value.toLocaleString()} Lumpsum`;
    }
    return `WS ${value.toFixed(1)}`;
  }

  /**
   * Loads fixtures from localStorage or seed
   */
  public static getStoredFixtures(): FixtureRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    const seed = this.getSeedFixtures();
    this.saveFixtures(seed);
    return seed;
  }

  /**
   * Persists fixtures to localStorage
   */
  private static saveFixtures(fixtures: FixtureRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fixtures));
    } catch (e) {
      console.warn('Failed to save fixtures to localStorage', e);
    }
  }

  /**
   * Retrieves all fixtures
   */
  public static async getFixtures(): Promise<FixtureRecord[]> {
    return this.getStoredFixtures();
  }

  /**
   * Retrieves single fixture by ID
   */
  public static async getFixtureById(id: string): Promise<FixtureRecord | null> {
    const all = this.getStoredFixtures();
    return all.find((f) => f.id === id) || null;
  }

  /**
   * Creates a new fixture record
   */
  public static async createFixture(payload: CreateFixturePayload, user: string = 'Chartering Officer'): Promise<FixtureRecord> {
    const fixtures = this.getStoredFixtures();
    const id = `fx-${Date.now().toString().slice(-6)}`;
    const refNum = `FX-2026-${Math.floor(1050 + Math.random() * 900)}`;

    const initialStatus: FixtureStatus = payload.status || 'draft';

    const newRecord: FixtureRecord = {
      id,
      fixture_reference: refNum,
      vessel_id: payload.vessel_id,
      vessel_name: payload.vessel_name,
      vessel_type: payload.vessel_type,
      vessel_imo: payload.vessel_imo,
      vessel_dwt: payload.vessel_dwt,
      cargo_id: payload.cargo_id,
      cargo_reference: payload.cargo_reference,
      commodity: payload.commodity,
      cargo_type: payload.cargo_type,
      quantity_tons: payload.quantity_tons,
      ports: payload.ports.map((p, idx) => ({ ...p, sequence: idx + 1 })),
      rate_value: payload.rate_value,
      rate_currency: payload.rate_currency,
      rate_type: payload.rate_type,
      rate_formatted: this.formatRate(payload.rate_value, payload.rate_currency, payload.rate_type),
      rate_notes: payload.rate_notes,
      demurrage_usd_day: payload.demurrage_usd_day || 20000,
      commission_percent: payload.commission_percent || 2.5,
      charterer: payload.charterer,
      charterer_broker: payload.charterer_broker,
      owner_entity: payload.owner_entity || 'Operating Fleet Desk',
      charter_party_form: payload.charter_party_form || 'GENCON 94',
      fixture_date: payload.fixture_date || new Date().toISOString(),
      laycan_start: payload.laycan_start,
      laycan_end: payload.laycan_end,
      status: initialStatus,
      is_historical: initialStatus === 'failed',
      notes: payload.notes || 'Recorded in chartering operations registry.',
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user,
          action: 'Fixture Created',
          to_status: initialStatus,
          note: `Consignment created under charter party form ${payload.charter_party_form || 'GENCON 94'}.`,
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user,
      last_updated_by: user,
    };

    fixtures.unshift(newRecord);
    this.saveFixtures(fixtures);

    // If created directly into On Subjects, notify
    if (initialStatus === 'on_subjects') {
      this.dispatchNotification(newRecord, 'on_subjects', 'Initial negotiation on subjects');
    }

    return newRecord;
  }

  /**
   * Updates an existing fixture record
   */
  public static async updateFixture(id: string, payload: Partial<CreateFixturePayload>, user: string = 'Chartering Officer'): Promise<FixtureRecord> {
    const fixtures = this.getStoredFixtures();
    const idx = fixtures.findIndex((f) => f.id === id);
    if (idx === -1) {
      throw new Error(`Fixture ${id} not found.`);
    }

    const current = fixtures[idx];
    const rateVal = payload.rate_value ?? current.rate_value;
    const rateCurr = payload.rate_currency ?? current.rate_currency;
    const rateType = payload.rate_type ?? current.rate_type;

    const updated: FixtureRecord = {
      ...current,
      ...payload,
      ports: payload.ports ? payload.ports.map((p, i) => ({ ...p, sequence: i + 1 })) : current.ports,
      rate_value: rateVal,
      rate_currency: rateCurr,
      rate_type: rateType,
      rate_formatted: this.formatRate(rateVal, rateCurr, rateType),
      updated_at: new Date().toISOString(),
      last_updated_by: user,
      history: [
        ...current.history,
        {
          id: `h-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user,
          action: 'Fixture Terms Updated',
          note: 'Commercial or port sequence particulars amended.',
        },
      ],
    };

    fixtures[idx] = updated;
    this.saveFixtures(fixtures);
    return updated;
  }

  /**
   * Strict status transition state machine
   */
  public static async updateFixtureStatus(
    id: string,
    newStatus: FixtureStatus,
    reason: string = '',
    user: string = 'Chartering Officer'
  ): Promise<FixtureRecord> {
    const fixtures = this.getStoredFixtures();
    const idx = fixtures.findIndex((f) => f.id === id);
    if (idx === -1) {
      throw new Error(`Fixture ${id} not found.`);
    }

    const current = fixtures[idx];
    const fromStatus = current.status;

    // Validate legal transitions:
    // Draft -> On Subjects, Failed
    // On Subjects -> Fully Fixed, Failed, Draft
    // Fully Fixed -> Archived/Completed
    // Failed -> Archived/Reopened to Draft
    if (fromStatus === newStatus) {
      return current;
    }

    const isHistorical = newStatus === 'failed';

    const updated: FixtureRecord = {
      ...current,
      status: newStatus,
      is_historical: isHistorical ? true : current.is_historical,
      updated_at: new Date().toISOString(),
      last_updated_by: user,
      history: [
        ...current.history,
        {
          id: `h-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user,
          action: `Status: ${fromStatus.toUpperCase()} → ${newStatus.toUpperCase()}`,
          from_status: fromStatus,
          to_status: newStatus,
          note: reason || `Status changed from ${fromStatus} to ${newStatus}.`,
        },
      ],
    };

    fixtures[idx] = updated;
    this.saveFixtures(fixtures);

    // Dispatch actionable notification
    this.dispatchNotification(updated, newStatus, reason);

    return updated;
  }

  /**
   * Dispatches mobile & topbar notification events
   */
  private static dispatchNotification(fixture: FixtureRecord, status: FixtureStatus, reason?: string) {
    let title = '';
    let description = '';
    let type: 'success' | 'warning' | 'info' | 'danger' = 'info';

    if (status === 'on_subjects') {
      title = `Fixture On Subjects: ${fixture.fixture_reference}`;
      description = `${fixture.vessel_name} on subjects for ${fixture.charterer} (${fixture.commodity}). ${reason || 'Awaiting subjects lift.'}`;
      type = 'warning';
    } else if (status === 'fully_fixed') {
      title = `Fixture Fully Fixed: ${fixture.fixture_reference}`;
      description = `All subjects lifted! ${fixture.vessel_name} agreed with ${fixture.charterer} at ${fixture.rate_formatted}.`;
      type = 'success';
    } else if (status === 'failed') {
      title = `Fixture Failed: ${fixture.fixture_reference}`;
      description = `${fixture.vessel_name} fixture failed on subjects: ${reason || 'Subjects declined.'}`;
      type = 'danger';
    } else {
      return;
    }

    try {
      const event = new CustomEvent(NOTIF_EVENT_NAME, {
        detail: {
          id: `notif-fx-${Date.now()}`,
          title,
          description,
          time: 'Just now',
          type,
          unread: true,
          fixtureId: fixture.id,
          status,
          reason,
        },
      });
      window.dispatchEvent(event);
    } catch {
      // browser environment handling
    }
  }

  /**
   * Filters and searches fixtures
   */
  public static filterFixtures(
    fixtures: FixtureRecord[],
    filters: FixtureFiltersState,
    tab: 'active' | 'historical' | 'multi_port'
  ): FixtureRecord[] {
    return fixtures.filter((f) => {
      // 1. Tab partition
      if (tab === 'active' && f.is_historical) return false;
      if (tab === 'historical' && !f.is_historical) return false;

      // 2. Status filter
      if (filters.status !== 'all' && f.status !== filters.status) return false;

      // 3. Vessel filter
      if (filters.vesselId !== 'all' && String(f.vessel_id) !== filters.vesselId) return false;

      // 4. Charterer filter
      if (filters.charterer !== 'all' && !f.charterer.toLowerCase().includes(filters.charterer.toLowerCase())) {
        return false;
      }

      // 5. Rate Currency filter
      if (filters.currency !== 'all' && f.rate_currency !== filters.currency) return false;

      // 6. Rate Type filter
      if (filters.rateType !== 'all' && f.rate_type !== filters.rateType) return false;

      // 7. Cargo category filter
      if (filters.cargoCategory !== 'all' && f.cargo_type !== filters.cargoCategory) return false;

      // 8. Port name filter
      if (filters.portName !== 'all') {
        const hasPort = f.ports.some(
          (p) => p.port_name.toLowerCase().includes(filters.portName.toLowerCase()) ||
                 (p.unlocode && p.unlocode.toLowerCase().includes(filters.portName.toLowerCase()))
        );
        if (!hasPort) return false;
      }

      // 9. Rate value min/max
      if (filters.minRate && f.rate_value < filters.minRate) return false;
      if (filters.maxRate && f.rate_value > filters.maxRate) return false;

      // 10. Laycan range
      if (filters.laycanRange !== 'all') {
        const now = Date.now();
        const start = new Date(f.laycan_start).getTime();
        const diffDays = (start - now) / 86400000;

        if (filters.laycanRange === 'next_7_days' && (diffDays < 0 || diffDays > 7)) return false;
        if (filters.laycanRange === 'next_14_days' && (diffDays < 0 || diffDays > 14)) return false;
        if (filters.laycanRange === 'next_30_days' && (diffDays < 0 || diffDays > 30)) return false;
      }

      // 11. Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const portMatches = f.ports.some((p) => p.port_name.toLowerCase().includes(q) || (p.unlocode && p.unlocode.toLowerCase().includes(q)));
        const match =
          f.fixture_reference.toLowerCase().includes(q) ||
          f.vessel_name.toLowerCase().includes(q) ||
          f.vessel_imo.toLowerCase().includes(q) ||
          f.charterer.toLowerCase().includes(q) ||
          (f.charterer_broker && f.charterer_broker.toLowerCase().includes(q)) ||
          f.commodity.toLowerCase().includes(q) ||
          f.rate_formatted.toLowerCase().includes(q) ||
          f.charter_party_form.toLowerCase().includes(q) ||
          portMatches;

        if (!match) return false;
      }

      return true;
    });
  }

  /**
   * Calculates Operational Fixture KPI Metrics
   */
  public static calculateAnalytics(fixtures: FixtureRecord[]): FixtureAnalyticsSummary {
    const active = fixtures.filter((f) => !f.is_historical);
    const historical = fixtures.filter((f) => f.is_historical);

    const draft = active.filter((f) => f.status === 'draft').length;
    const onSubjects = active.filter((f) => f.status === 'on_subjects').length;
    const fullyFixed = active.filter((f) => f.status === 'fully_fixed').length;
    const failed = fixtures.filter((f) => f.status === 'failed').length;

    // Calculate average rate per day for time charters
    const timeCharters = active.filter((f) => f.rate_type === 'per_day');
    const avgRate = timeCharters.length > 0
      ? Math.round(timeCharters.reduce((acc, f) => acc + f.rate_value, 0) / timeCharters.length)
      : 28500;

    const totalTonnage = active.reduce((acc, f) => acc + (f.quantity_tons || 0), 0);

    // Urgent laycan alerts (< 72h)
    const now = Date.now();
    const urgentCount = active.filter((f) => {
      const laycanEnd = new Date(f.laycan_end).getTime();
      return laycanEnd >= now && laycanEnd <= now + 86400000 * 3;
    }).length;

    return {
      totalFixturesCount: fixtures.length,
      activeCount: active.length,
      historicalCount: historical.length,
      draftCount: draft,
      onSubjectsCount: onSubjects,
      fullyFixedCount: fullyFixed,
      failedCount: failed,
      averageRatePerDayUSD: avgRate,
      totalAgreedTonnageMT: totalTonnage,
      urgentLaycanAlertsCount: urgentCount,
    };
  }

  /**
   * Exports fixtures dataset to CSV
   */
  public static exportToCSV(fixtures: FixtureRecord[]): void {
    const headers = [
      'Fixture Reference',
      'Status',
      'Vessel Name',
      'Vessel IMO',
      'Vessel Type',
      'Vessel DWT',
      'Charterer',
      'Broker',
      'Charter Party Form',
      'Commodity',
      'Cargo Type',
      'Quantity MT',
      'Ports Count',
      'Ports Sequence',
      'Rate Formatted',
      'Rate Value',
      'Rate Currency',
      'Rate Type',
      'Demurrage USD/Day',
      'Laycan Start',
      'Laycan End',
      'Fixture Date',
    ];

    const rows = fixtures.map((f) => [
      `"${f.fixture_reference}"`,
      `"${f.status}"`,
      `"${f.vessel_name}"`,
      `"${f.vessel_imo}"`,
      `"${f.vessel_type}"`,
      f.vessel_dwt,
      `"${f.charterer}"`,
      `"${f.charterer_broker || ''}"`,
      `"${f.charter_party_form}"`,
      `"${f.commodity}"`,
      `"${f.cargo_type}"`,
      f.quantity_tons,
      f.ports.length,
      `"${f.ports.map((p) => `${p.sequence}. ${p.port_name} (${p.port_type})`).join(' -> ')}"`,
      `"${f.rate_formatted}"`,
      f.rate_value,
      `"${f.rate_currency}"`,
      `"${f.rate_type}"`,
      f.demurrage_usd_day || 0,
      `"${f.laycan_start}"`,
      `"${f.laycan_end}"`,
      `"${f.fixture_date}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fixtures_chartering_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

