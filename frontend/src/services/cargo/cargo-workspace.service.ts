/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 9: Cargo Workspace Data & Intelligence Service
 */

import { cargoService } from '../api/cargo.service';
import type { Port } from '../../types/port';
import type { Vessel } from '../../types/vessel';
import type {
  CargoRecord,
  CargoFiltersState,
  CargoAnalyticsSummary,
  ValidationIssue,
  ValidationStatus,
  VesselMatchInfo,
  CargoZone,
  PortRef,
} from '../../types/cargo';
import { provenanceService } from '../provenance/provenance.service';
import { DataSourceOrigin } from '../../types/provenance';

const STORAGE_KEY = 'sih26006_cargo_workspace_v2';

export class CargoWorkspaceService {
  /**
   * Fallback representative global hub ports for geographic routing
   */
  private static readonly REFERENCE_PORTS: PortRef[] = [
    { id: 101, name: 'Ras Tanura', country: 'Saudi Arabia', unlocode: 'SARST', latitude: 26.65, longitude: 50.16 },
    { id: 102, name: 'JNPT Mumbai', country: 'India', unlocode: 'INJNP', latitude: 18.948, longitude: 72.951 },
    { id: 103, name: 'Singapore Hub', country: 'Singapore', unlocode: 'SGSIN', latitude: 1.268, longitude: 103.682 },
    { id: 104, name: 'Port Hedland', country: 'Australia', unlocode: 'AUPHE', latitude: -20.31, longitude: 118.57 },
    { id: 105, name: 'Rotterdam Maasvlakte', country: 'Netherlands', unlocode: 'NLRTM', latitude: 51.96, longitude: 4.02 },
    { id: 106, name: 'Shanghai Yangshan', country: 'China', unlocode: 'CNSHA', latitude: 30.62, longitude: 122.07 },
    { id: 107, name: 'Fujairah Anchorage', country: 'UAE', unlocode: 'AEFJR', latitude: 25.12, longitude: 56.34 },
    { id: 108, name: 'Qingdao Port', country: 'China', unlocode: 'CNQDG', latitude: 36.06, longitude: 120.31 },
    { id: 109, name: 'Port Kamsar', country: 'Guinea', unlocode: 'GNKMS', latitude: 10.66, longitude: -14.61 },
    { id: 110, name: 'Antwerp Port', country: 'Belgium', unlocode: 'BEANR', latitude: 51.27, longitude: 4.34 },
    { id: 111, name: 'Vancouver Pacific', country: 'Canada', unlocode: 'CAVAN', latitude: 49.28, longitude: -123.11 },
    { id: 112, name: 'Yokohama Terminal', country: 'Japan', unlocode: 'JPYOK', latitude: 35.44, longitude: 139.64 },
    { id: 113, name: 'Ponta da Madeira', country: 'Brazil', unlocode: 'BRPDM', latitude: -2.56, longitude: -44.37 },
    { id: 114, name: 'Paradip Port', country: 'India', unlocode: 'INPRT', latitude: 20.26, longitude: 86.67 },
  ];

  /**
   * Reference Fleet Vessels for Matching
   */
  private static readonly REFERENCE_VESSELS: VesselMatchInfo[] = [
    {
      vessel_id: 201,
      vessel_name: 'PACIFIC HORIZON',
      imo_number: 'IMO 9452310',
      vessel_type: 'Capesize Bulk Carrier',
      capacity_dwt: 180000,
      match_score: 95,
      capacity_match_percent: 96,
      route_match_percent: 94,
      timing_match_percent: 95,
      eta: '2026-09-18T12:00:00Z',
      status: 'confirmed',
    },
    {
      vessel_id: 202,
      vessel_name: 'NORDIC VALIANT',
      imo_number: 'IMO 9684122',
      vessel_type: 'Panamax Bulk Carrier',
      capacity_dwt: 76000,
      match_score: 92,
      capacity_match_percent: 94,
      route_match_percent: 90,
      timing_match_percent: 92,
      eta: '2026-09-20T06:00:00Z',
      status: 'confirmed',
    },
    {
      vessel_id: 203,
      vessel_name: 'OCEAN ENDEAVOUR',
      imo_number: 'IMO 9521094',
      vessel_type: 'Suezmax Crude Tanker',
      capacity_dwt: 158000,
      match_score: 96,
      capacity_match_percent: 98,
      route_match_percent: 95,
      timing_match_percent: 95,
      eta: '2026-09-17T16:00:00Z',
      status: 'confirmed',
    },
    {
      vessel_id: 204,
      vessel_name: 'GLOBAL VOYAGER',
      imo_number: 'IMO 9381774',
      vessel_type: 'Supramax Bulk Carrier',
      capacity_dwt: 58000,
      match_score: 89,
      capacity_match_percent: 91,
      route_match_percent: 88,
      timing_match_percent: 88,
      eta: '2026-09-22T10:00:00Z',
      status: 'suggested',
    },
    {
      vessel_id: 205,
      vessel_name: 'MAERSK KALMAR',
      imo_number: 'IMO 9720445',
      vessel_type: 'Container Ship (Neo-Panamax)',
      capacity_dwt: 120000,
      match_score: 94,
      capacity_match_percent: 93,
      route_match_percent: 95,
      timing_match_percent: 94,
      eta: '2026-09-19T14:00:00Z',
      status: 'confirmed',
    },
    {
      vessel_id: 206,
      vessel_name: 'STAR SEAS',
      imo_number: 'IMO 9611234',
      vessel_type: 'Handymax Bulk Carrier',
      capacity_dwt: 45000,
      match_score: 86,
      capacity_match_percent: 88,
      route_match_percent: 85,
      timing_match_percent: 85,
      eta: '2026-09-24T08:00:00Z',
      status: 'suggested',
    },
  ];

  /**
   * Seed realistic maritime consignments representing multi-channel ingestion
   */
  private static getSeedCargoConsignments(): CargoRecord[] {
    const base: Array<Partial<CargoRecord> & { id: number; weight_tons: number }> = [
      {
        id: 1,
        reference_number: 'CRG-2026-8801',
        source: 'email',
        source_message_id: 'MSG-EML-BHP-20260909-0012',
        source_sender: 'chartering@bhp.com',
        shipper: 'BHP Billiton Marine Logistics',
        consignee: 'Baosteel Iron & Steel Co.',
        commodity: 'Pilbara High-Grade Iron Ore Fines',
        cargo_type: 'Dry Bulk',
        quantity: 1,
        unit: 'MT',
        weight_tons: 172000,
        volume_m3: 65000,
        origin_port: CargoWorkspaceService.REFERENCE_PORTS[3], // Port Hedland
        destination_port: CargoWorkspaceService.REFERENCE_PORTS[7], // Qingdao
        pickup_location: 'Nelson Point Berth 1',
        delivery_location: 'Qingdao Ore Terminal #4',
        ready_date: '2026-09-15T00:00:00Z',
        deadline: '2026-09-22T23:59:59Z',
        status: 'matched',
        priority: 'high',
        zone: 'Zone C - Far East',
        is_private: false,
        matched_vessel: CargoWorkspaceService.REFERENCE_VESSELS[0],
        confidence_score: 98,
        validation_status: 'valid',
        validation_issues: [],
      },
      {
        id: 2,
        reference_number: 'CRG-2026-8802',
        source: 'whatsapp',
        source_message_id: 'WA-MSG-GLEN-99214',
        source_sender: 'Dubai Freight Desk (+971 50 882 1928)',
        shipper: 'Glencore International Commodities',
        consignee: 'Tata Steel Jamshedpur',
        commodity: 'Australian Premium Hard Coking Coal',
        cargo_type: 'Dry Bulk',
        quantity: 1,
        unit: 'MT',
        weight_tons: 74500,
        volume_m3: 92000,
        origin_port: CargoWorkspaceService.REFERENCE_PORTS[3], // Port Hedland
        destination_port: CargoWorkspaceService.REFERENCE_PORTS[1], // JNPT
        pickup_location: 'Berth 2 Bulk Loader',
        delivery_location: 'JNPT Multi-Purpose Berth 3',
        ready_date: '2026-09-18T00:00:00Z',
        deadline: '2026-09-25T23:59:59Z',
        status: 'matched',
        priority: 'urgent',
        zone: 'Zone B - Bay of Bengal',
        is_private: true,
        matched_vessel: CargoWorkspaceService.REFERENCE_VESSELS[1],
        confidence_score: 95,
        validation_status: 'valid',
        validation_issues: [],
      },
      {
        id: 3,
        reference_number: 'CRG-2026-8803',
        source: 'email',
        source_message_id: 'MSG-EML-ARAMCO-4109',
        source_sender: 'shipping@aramco.com.sa',
        shipper: 'Saudi Aramco Commercial Lineup',
        consignee: 'Singapore Refining Company (SRC)',
        commodity: 'Arabian Light Crude Oil',
        cargo_type: 'Liquid Bulk',
        quantity: 950000,
        unit: 'Barrels',
        weight_tons: 132000,
        volume_m3: 151000,
        origin_port: CargoWorkspaceService.REFERENCE_PORTS[0], // Ras Tanura
        destination_port: CargoWorkspaceService.REFERENCE_PORTS[2], // Singapore
        pickup_location: 'Ras Tanura Sea Island Berth 14',
        delivery_location: 'Jurong Island Single Point Mooring',
        ready_date: '2026-09-14T08:00:00Z',
        deadline: '2026-09-20T18:00:00Z',
        status: 'in_transit',
        priority: 'high',
        zone: 'Zone A - Arabian Gulf',
        is_private: true,
        matched_vessel: CargoWorkspaceService.REFERENCE_VESSELS[2],
        confidence_score: 99,
        validation_status: 'valid',
        validation_issues: [],
      },
      {
        id: 4,
        reference_number: 'CRG-2026-8804',
        source: 'slack',
        source_message_id: 'SLACK-MSG-TRAF-CHAN-721',
        source_sender: '#asia-chartering (Alex Vance, Trafigura)',
        shipper: 'Trafigura Maritime Pte Ltd',
        consignee: 'Shandong Weiqiao Aluminum Group',
        commodity: 'Bauxite Bulk Ore (Moisture 12%)',
        cargo_type: 'Dry Bulk',
        quantity: 1,
        unit: 'MT',
        weight_tons: 55000,
        volume_m3: 42000,
        origin_port: CargoWorkspaceService.REFERENCE_PORTS[8], // Kamsar
        destination_port: CargoWorkspaceService.REFERENCE_PORTS[7], // Qingdao
        pickup_location: 'Kamsar Bauxite Conveyor Pier',
        delivery_location: 'Qingdao Qianwan Bulk Dock',
        ready_date: '2026-09-22T00:00:00Z',
        deadline: '2026-09-29T23:59:59Z',
        status: 'validated',
        priority: 'standard',
        zone: 'Zone E - Atlantic & Americas',
        is_private: false,
        matched_vessel: null,
        confidence_score: 91,
        duplicate_group_id: 'CLUSTER-BX-2026-01',
        validation_status: 'valid',
        validation_issues: [],
      },
      {
        id: 5,
        reference_number: 'CRG-2026-8805',
        source: 'whatsapp',
        source_message_id: 'WA-MSG-BROKER-KAMSAR-8812',
        source_sender: 'Singapore Brokerage Desk (+65 9182 3341)',
        shipper: 'Trafigura Group (Singapore Hub)',
        consignee: 'Shandong Weiqiao Aluminum Group',
        commodity: 'Bauxite Ore Grade A (55kt inquiry)',
        cargo_type: 'Dry Bulk',
        quantity: 1,
        unit: 'MT',
        weight_tons: 55500,
        volume_m3: 42500,
        origin_port: CargoWorkspaceService.REFERENCE_PORTS[8], // Kamsar
        destination_port: CargoWorkspaceService.REFERENCE_PORTS[7], // Qingdao
        pickup_location: 'Port Kamsar Offshore Anchorage',
        delivery_location: 'Qingdao Port Terminal',
        ready_date: '2026-09-23T00:00:00Z',
        deadline: '2026-09-30T23:59:59Z',
        status: 'draft',
        priority: 'standard',
        zone: 'Zone E - Atlantic & Americas',
        is_private: false,
        matched_vessel: null,
        confidence_score: 87,
        duplicate_group_id: 'CLUSTER-BX-2026-01',
        validation_status: 'warning',
        validation_issues: [
          {
            id: 'v-dup-1',
            field: 'duplicate_cluster',
            severity: 'warning',
            message: 'Near-duplicate inquiry detected: Matches CRG-2026-8804 (94% similarity).',
            suggestion: 'Review and merge duplicate quotes before chartering.',
          },
        ],
      },
      {
        id: 6,
        reference_number: 'CRG-2026-8806',
        source: 'edi',
        source_message_id: 'EDIFACT-IFTMIN-098234',
        source_sender: 'MSC Mediterranean Shipping EDI Gateway',
        shipper: 'Toyota Logistics Europe N.V.',
        consignee: 'Maruti Suzuki India Limited',
        commodity: 'Automotive Precision Powertrain Assemblies',
        cargo_type: 'Containerized',
        quantity: 1850,
        unit: 'TEU',
        weight_tons: 22400,
        volume_m3: 55000,
        origin_port: CargoWorkspaceService.REFERENCE_PORTS[9], // Antwerp
        destination_port: CargoWorkspaceService.REFERENCE_PORTS[1], // JNPT
        pickup_location: 'Antwerp Gateway Terminal 1700',
        delivery_location: 'JNPT Gateway Terminals India (GTI)',
        ready_date: '2026-09-16T00:00:00Z',
        deadline: '2026-09-23T12:00:00Z',
        status: 'matched',
        priority: 'urgent',
        zone: 'Zone D - Med & Europe',
        is_private: true,
        matched_vessel: CargoWorkspaceService.REFERENCE_VESSELS[4],
        confidence_score: 99,
        validation_status: 'valid',
        validation_issues: [],
      },
      {
        id: 7,
        reference_number: 'CRG-2026-8807',
        source: 'email',
        source_message_id: 'MSG-CARGILL-WHEAT-2026',
        source_sender: 'grain-fixtures@cargill.com',
        shipper: 'Cargill Agriculture Grain Desk',
        consignee: 'Nisshin Flour Milling Inc.',
        commodity: 'Western Canadian Hard Red Spring Wheat',
        cargo_type: 'Dry Bulk',
        quantity: 1,
        unit: 'MT',
        weight_tons: 48000,
        volume_m3: 62000,
        origin_port: CargoWorkspaceService.REFERENCE_PORTS[10], // Vancouver
        destination_port: CargoWorkspaceService.REFERENCE_PORTS[11], // Yokohama
        pickup_location: 'Cargill Grain Terminal North Shore',
        delivery_location: 'Yokohama Daikoku Grain Pier',
        ready_date: '2026-09-25T00:00:00Z',
        deadline: '2026-10-02T23:59:59Z',
        status: 'validated',
        priority: 'standard',
        zone: 'Zone C - Far East',
        is_private: false,
        matched_vessel: null,
        confidence_score: 94,
        validation_status: 'valid',
        validation_issues: [],
      },
      {
        id: 8,
        reference_number: 'CRG-2026-8808',
        source: 'manual',
        source_message_id: 'MANUAL-ENTRY-OP-DESK-44',
        source_sender: 'Operator Desk (Local Manual Registry)',
        shipper: 'ArcelorMittal Nippon Steel',
        consignee: 'Thyssenkrupp AG Duisburg',
        commodity: 'Hot Rolled Heavy Steel Coils & Slabs',
        cargo_type: 'Breakbulk',
        quantity: 420,
        unit: 'Coils',
        weight_tons: 34500,
        volume_m3: 16000,
        origin_port: CargoWorkspaceService.REFERENCE_PORTS[13], // Paradip
        destination_port: CargoWorkspaceService.REFERENCE_PORTS[4], // Rotterdam
        pickup_location: 'Paradip Multi-Purpose Berth',
        delivery_location: 'Rotterdam Uniport Terminal',
        ready_date: '2026-09-28T00:00:00Z',
        deadline: '2026-10-08T23:59:59Z',
        status: 'validated',
        priority: 'high',
        zone: 'Zone B - Bay of Bengal',
        is_private: false,
        matched_vessel: CargoWorkspaceService.REFERENCE_VESSELS[5],
        confidence_score: 96,
        validation_status: 'valid',
        validation_issues: [],
      },
      {
        id: 9,
        reference_number: 'CRG-2026-8809',
        source: 'whatsapp',
        source_message_id: 'WA-MSG-BUNKER-FUJ-1182',
        source_sender: 'Gulf Bunkering & Tankers Desk (+971 4 332 9901)',
        shipper: 'Vitol Marine Fuels Desk',
        consignee: 'Bunker Oil Singapore Depot',
        commodity: 'Very Low Sulphur Fuel Oil (VLSFO 0.5%)',
        cargo_type: 'Liquid Bulk',
        quantity: 1,
        unit: 'MT',
        weight_tons: 84000,
        volume_m3: 93500,
        origin_port: CargoWorkspaceService.REFERENCE_PORTS[6], // Fujairah
        destination_port: CargoWorkspaceService.REFERENCE_PORTS[2], // Singapore
        pickup_location: 'VOPAK Horizon Fujairah Jetty 2',
        delivery_location: 'Universal Terminal Jurong SPM',
        ready_date: '2026-09-17T00:00:00Z',
        deadline: '2026-09-24T23:59:59Z',
        status: 'matched',
        priority: 'high',
        zone: 'Zone A - Arabian Gulf',
        is_private: true,
        matched_vessel: CargoWorkspaceService.REFERENCE_VESSELS[3],
        confidence_score: 97,
        validation_status: 'valid',
        validation_issues: [],
      },
      {
        id: 10,
        reference_number: 'CRG-2026-8810',
        source: 'email',
        source_message_id: 'MSG-INCOMPLETE-EXP-900',
        source_sender: 'unknown_broker@broker-net.asia',
        shipper: 'Unspecified Trading Entity Pte',
        consignee: 'Pending Customs Broker Confirmation',
        commodity: 'General Industrial Mineral Sands',
        cargo_type: 'Dry Bulk',
        quantity: 1,
        unit: 'MT',
        weight_tons: 28000,
        volume_m3: 19000,
        origin_port: CargoWorkspaceService.REFERENCE_PORTS[1], // JNPT
        destination_port: CargoWorkspaceService.REFERENCE_PORTS[6], // Fujairah
        pickup_location: 'Pending Berth Confirmation',
        delivery_location: 'Anchorage Laycan Awaiting',
        ready_date: '2026-09-30T00:00:00Z',
        deadline: '2026-09-28T00:00:00Z', // Deliberate invalid date for validation check
        status: 'draft',
        priority: 'low',
        zone: 'Zone B - Bay of Bengal',
        is_private: false,
        matched_vessel: null,
        confidence_score: 54,
        validation_status: 'incomplete',
        validation_issues: [
          {
            id: 'v-err-date',
            field: 'deadline',
            severity: 'error',
            message: 'Laycan deadline date precedes ready date (Ready: Sep 30, Deadline: Sep 28).',
            suggestion: 'Verify and extend laycan cancelation date.',
          },
          {
            id: 'v-warn-shipper',
            field: 'shipper',
            severity: 'warning',
            message: 'Unverified commercial counterparty. Missing corporate Tax/IMO registration.',
            suggestion: 'Complete KYC verification on shipper entity.',
          },
        ],
      },
    ];

    return base.map((item) => {
      const now = new Date().toISOString();
      const origin =
        item.source === 'email'
          ? DataSourceOrigin.EMAIL_PARSER
          : item.source === 'whatsapp'
          ? DataSourceOrigin.WHATSAPP_CONNECTOR
          : item.source === 'slack'
          ? DataSourceOrigin.SLACK_CONNECTOR
          : item.source === 'edi'
          ? DataSourceOrigin.PORT_LINEUP_SCRAPER
          : DataSourceOrigin.MANUAL_USER_INPUT;

      const refNo = item.reference_number || `CRG-2026-${(8800 + item.id).toString()}`;
      const provenance = item.is_private
        ? provenanceService.createPrivateWorkspaceProvenance({
            origin,
            sourceName: item.source_sender || `${(item.source || 'private').toUpperCase()} Lineup Feed`,
            workspaceId: 'ws-chartering-default',
            workspaceName: 'Global Commercial Chartering',
            entityId: refNo,
            timestamp: now,
          })
        : provenanceService.createProvenance({
            origin,
            sourceName: item.source_sender || `${(item.source || 'market').toUpperCase()} Feed`,
            timestamp: now,
            entityId: refNo,
            confidenceScore: item.confidence_score,
          });

      return {
        id: item.id,
        reference_number: refNo,
        provenance,
        source: item.source || 'email',
        source_message_id: item.source_message_id,
        source_sender: item.source_sender,
        shipper: item.shipper || 'Standard Commercial Freight Sender',
        consignee: item.consignee || 'Standard Maritime Receiver',
        commodity: item.commodity || 'Standard Freight Consignment',
        cargo_type: item.cargo_type || 'Dry Bulk',
        quantity: item.quantity || 1,
        unit: item.unit || 'MT',
        weight_tons: item.weight_tons,
        volume_m3: item.volume_m3 || item.weight_tons * 1.3,
        description: item.commodity || 'Maritime consignment',
        origin_port_id: item.origin_port?.id ?? null,
        destination_port_id: item.destination_port?.id ?? null,
        origin_port: item.origin_port || CargoWorkspaceService.REFERENCE_PORTS[0],
        destination_port: item.destination_port || CargoWorkspaceService.REFERENCE_PORTS[1],
        pickup_location: item.pickup_location || 'Commercial Marine Berth',
        delivery_location: item.delivery_location || 'Discharge Marine Berth',
        ready_date: item.ready_date || '2026-09-18T00:00:00Z',
        deadline: item.deadline || '2026-09-25T23:59:59Z',
        status: item.status || 'draft',
        priority: item.priority || 'standard',
        zone: item.zone || 'Zone A - Arabian Gulf',
        is_private: !!item.is_private,
        matched_vessel: item.matched_vessel || null,
        confidence_score: item.confidence_score || 85,
        duplicate_group_id: item.duplicate_group_id || null,
        duplicate_cluster: item.duplicate_group_id
          ? {
              cluster_id: item.duplicate_group_id,
              similarity_score: 94,
              primary_id: 4,
              candidate_ids: [4, 5],
              matching_signals: ['Origin: Port Kamsar', 'Dest: Qingdao', 'Commodity: Bauxite', 'Tonnage: ±0.9%'],
              reason: 'Multiple broker quotes submitted across Email & WhatsApp for same Kamsar bauxite parcel',
            }
          : null,
        validation_status: item.validation_status || 'valid',
        validation_issues: item.validation_issues || [],
        lifecycle_stages: [
          {
            stage: 'created',
            label: 'Ingested & Normalized',
            status: 'completed',
            timestamp: '2026-09-10T14:30:00Z',
            location: item.source ? `Channel: ${item.source.toUpperCase()}` : 'Channel Ingestion',
            description: `Ingested from ${item.source_sender || item.source || 'automated pipeline'}. Raw message ID recorded.`,
          },
          {
            stage: 'validated',
            label: 'Commercial & Technical Validation',
            status: item.validation_status === 'valid' ? 'completed' : 'current',
            timestamp: item.validation_status === 'valid' ? '2026-09-10T15:10:00Z' : undefined,
            location: 'Platform Operations Desk',
            description: item.validation_status === 'valid' ? 'Draft limits, laycan dates, and tonnage verified against port master.' : 'Pending resolution of validation warnings.',
          },
          {
            stage: 'matched',
            label: 'Vessel Allocation Match',
            status: item.matched_vessel ? 'completed' : 'pending',
            timestamp: item.matched_vessel ? '2026-09-11T09:15:00Z' : undefined,
            location: item.matched_vessel ? item.matched_vessel.vessel_name : 'Fleet Allocation Pool',
            description: item.matched_vessel ? `Matched to ${item.matched_vessel.vessel_name} (${item.matched_vessel.imo_number}) with ${item.matched_vessel.match_score}% compatibility score.` : 'Awaiting charterer fleet match.',
          },
          {
            stage: 'planned',
            label: 'Corridor & Voyage Scheduling',
            status: item.status === 'in_transit' || item.status === 'delivered' ? 'completed' : (item.matched_vessel ? 'current' : 'pending'),
            timestamp: item.status === 'in_transit' ? '2026-09-11T12:00:00Z' : undefined,
            location: 'Nautical Routing Network',
            description: 'Seaway navigation corridor and waypoint fuel consumption plan finalized.',
          },
          {
            stage: 'in_transit',
            label: 'Maritime Passage / In Transit',
            status: item.status === 'in_transit' ? 'current' : (item.status === 'delivered' ? 'completed' : 'pending'),
            timestamp: item.status === 'in_transit' ? '2026-09-12T04:00:00Z' : undefined,
            location: 'International Waters Passage',
            description: 'Vessel underway laden with live AIS tracking active.',
          },
          {
            stage: 'delivered',
            label: 'Port Discharge & Final Delivery',
            status: item.status === 'delivered' ? 'completed' : 'pending',
            location: item.destination_port?.name || 'Destination Port',
            description: 'Cargo discharged and commercial bills of lading completed.',
          },
        ],
        activity_log: [
          {
            id: 'act-1',
            timestamp: '2026-09-10T14:30:00Z',
            user: 'System Ingestion Parser',
            action: 'Record Ingested',
            note: `Successfully parsed consignment from channel ${item.source}.`,
          },
          ...(item.matched_vessel
            ? [
                {
                  id: 'act-2',
                  timestamp: '2026-09-11T09:15:00Z',
                  user: 'Chartering Specialist (Capt. R. Menon)',
                  action: 'Vessel Matched',
                  note: `Assigned vessel ${item.matched_vessel.vessel_name} (${item.matched_vessel.imo_number}).`,
                },
              ]
            : []),
        ],
        created_at: now,
        updated_at: now,
      } as CargoRecord;
    });
  }

  /**
   * Loads saved modifications from local storage
   */
  private static getStoredOverrides(): Record<number, Partial<CargoRecord>> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  /**
   * Persists record modifications to local storage
   */
  private static saveOverride(cargoId: number, changes: Partial<CargoRecord>) {
    try {
      const current = this.getStoredOverrides();
      current[cargoId] = {
        ...(current[cargoId] || {}),
        ...changes,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn('Failed to persist cargo override to localStorage', e);
    }
  }

  /**
   * Primary method: Combines backend /cargo records with enriched operational data
   */
  public static async getCargoRecords(ports: Port[] = [], _vessels: Vessel[] = []): Promise<CargoRecord[]> {
    const seedRecords = this.getSeedCargoConsignments();
    const overrides = this.getStoredOverrides();

    // Map ports by ID for lookup
    const portMap = new Map<number, Port>();
    ports.forEach((p) => portMap.set(p.id, p));

    try {
      // Fetch live records from backend API
      const response = await cargoService.getCargo(100);
      const backendCargos = response.cargo || [];

      // Combine backend items: if backend has items not in seed, normalize them
      backendCargos.forEach((dbItem) => {
        const existingIdx = seedRecords.findIndex((s) => s.id === dbItem.id);
        if (existingIdx >= 0) {
          // Update seed with actual database weight/ports if available
          seedRecords[existingIdx].weight_tons = dbItem.weight_tons;
          seedRecords[existingIdx].cargo_type = dbItem.cargo_type || seedRecords[existingIdx].cargo_type;
          seedRecords[existingIdx].description = dbItem.description || seedRecords[existingIdx].description;
        } else {
          // Normalize new database record into rich operational model
          const originPort = dbItem.origin_port_id && portMap.has(dbItem.origin_port_id)
            ? this.toPortRef(portMap.get(dbItem.origin_port_id)!)
            : this.REFERENCE_PORTS[dbItem.id % this.REFERENCE_PORTS.length];

          const destPort = dbItem.destination_port_id && portMap.has(dbItem.destination_port_id)
            ? this.toPortRef(portMap.get(dbItem.destination_port_id)!)
            : this.REFERENCE_PORTS[(dbItem.id + 3) % this.REFERENCE_PORTS.length];

          const newRecord: CargoRecord = {
            id: dbItem.id,
            reference_number: `CRG-2026-${(8800 + dbItem.id).toString()}`,
            source: 'manual',
            shipper: 'Registered Enterprise Shipper',
            consignee: 'Receiving Maritime Consignee',
            commodity: dbItem.description || `${dbItem.cargo_type} Standard Consignment`,
            cargo_type: dbItem.cargo_type || 'Dry Bulk',
            quantity: 1,
            unit: 'MT',
            weight_tons: dbItem.weight_tons || 35000,
            volume_m3: dbItem.volume_m3 || (dbItem.weight_tons ? dbItem.weight_tons * 1.25 : 40000),
            origin_port_id: dbItem.origin_port_id,
            destination_port_id: dbItem.destination_port_id,
            origin_port: originPort,
            destination_port: destPort,
            pickup_location: `${originPort.name} Berth 1`,
            delivery_location: `${destPort.name} Discharge Pier`,
            ready_date: new Date(Date.now() + 86400000 * 3).toISOString(),
            deadline: new Date(Date.now() + 86400000 * 10).toISOString(),
            status: 'draft',
            priority: 'standard',
            zone: this.deriveZoneFromPort(destPort),
            is_private: false,
            confidence_score: 90,
            validation_status: 'valid',
            validation_issues: [],
            lifecycle_stages: [
              { stage: 'created', label: 'Ingested & Normalized', status: 'completed', timestamp: new Date().toISOString(), description: 'Registered in database' },
              { stage: 'validated', label: 'Validation', status: 'pending', description: 'Pending technical check' },
              { stage: 'matched', label: 'Vessel Match', status: 'pending', description: 'No vessel assigned' },
              { stage: 'planned', label: 'Route Planning', status: 'pending', description: 'Corridor pending' },
              { stage: 'in_transit', label: 'In Transit', status: 'pending', description: 'Passage pending' },
              { stage: 'delivered', label: 'Delivered', status: 'pending', description: 'Discharge pending' },
            ],
            activity_log: [
              { id: 'act-init', timestamp: new Date().toISOString(), user: 'Operator Desk', action: 'Created', note: 'Created via platform' },
            ],
            description: dbItem.description,
            created_at: dbItem.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          seedRecords.push(newRecord);
        }
      });
    } catch {
      // Backend offline or running in mock development mode — proceed cleanly with seed records
    }

    // Apply stored overrides (e.g. validated status, vessel matched, archived, merged)
    return seedRecords.map((item) => {
      if (overrides[item.id]) {
        return {
          ...item,
          ...overrides[item.id],
        };
      }
      return item;
    });
  }

  /**
   * Helper to convert Port model into lightweight PortRef
   */
  private static toPortRef(port: Port): PortRef {
    return {
      id: port.id,
      name: port.name,
      country: port.country || 'International',
      unlocode: port.unlocode || undefined,
      latitude: port.latitude || 0,
      longitude: port.longitude || 0,
    };
  }

  /**
   * Derives operational zone based on destination port coordinates
   */
  private static deriveZoneFromPort(port: PortRef): CargoZone {
    if (port.longitude >= 40 && port.longitude <= 60 && port.latitude >= 12 && port.latitude <= 32) {
      return 'Zone A - Arabian Gulf';
    }
    if (port.longitude >= 68 && port.longitude <= 95 && port.latitude >= 5 && port.latitude <= 25) {
      return 'Zone B - Bay of Bengal';
    }
    if (port.longitude >= 95 && port.longitude <= 150) {
      return 'Zone C - Far East';
    }
    if (port.longitude >= -10 && port.longitude <= 40 && port.latitude >= 30) {
      return 'Zone D - Med & Europe';
    }
    return 'Zone E - Atlantic & Americas';
  }

  /**
   * Validation Engine: Checks cargo for missing or contradictory parameters
   */
  public static validateCargo(cargo: CargoRecord): { status: ValidationStatus; issues: ValidationIssue[] } {
    const issues: ValidationIssue[] = [];

    // 1. Check origin and destination
    if (!cargo.origin_port || !cargo.origin_port.name) {
      issues.push({
        id: 'val-orig',
        field: 'origin_port',
        severity: 'error',
        message: 'Origin loading port is unassigned.',
        suggestion: 'Specify verified origin seaport with UN/LOCODE.',
      });
    }

    if (!cargo.destination_port || !cargo.destination_port.name) {
      issues.push({
        id: 'val-dest',
        field: 'destination_port',
        severity: 'error',
        message: 'Destination discharge port is unassigned.',
        suggestion: 'Specify verified discharge seaport.',
      });
    }

    // 2. Check origin != destination
    if (cargo.origin_port?.id === cargo.destination_port?.id) {
      issues.push({
        id: 'val-same-port',
        field: 'destination_port',
        severity: 'error',
        message: 'Origin and destination ports cannot be identical.',
        suggestion: 'Verify discharge terminal destination.',
      });
    }

    // 3. Check weight
    if (!cargo.weight_tons || cargo.weight_tons <= 0) {
      issues.push({
        id: 'val-weight',
        field: 'weight_tons',
        severity: 'error',
        message: 'Cargo weight must be greater than zero metric tons.',
        suggestion: 'Specify deadweight bill of lading tonnage.',
      });
    }

    // 4. Check Laycan dates
    if (cargo.ready_date && cargo.deadline) {
      const ready = new Date(cargo.ready_date).getTime();
      const dead = new Date(cargo.deadline).getTime();
      if (dead <= ready) {
        issues.push({
          id: 'val-dates',
          field: 'deadline',
          severity: 'error',
          message: 'Laycan deadline date must occur strictly after ready date.',
          suggestion: 'Adjust cancelation laycan window.',
        });
      }
    }

    // 5. Check commercial counterparties
    if (!cargo.shipper || cargo.shipper.toLowerCase().includes('unspecified')) {
      issues.push({
        id: 'val-shipper',
        field: 'shipper',
        severity: 'warning',
        message: 'Unverified commercial counterparty/shipper.',
        suggestion: 'Verify KYC profile of the chartering entity.',
      });
    }

    // 6. Duplicate check
    if (cargo.duplicate_group_id && cargo.status !== 'archived') {
      issues.push({
        id: 'val-dup',
        field: 'duplicate_cluster',
        severity: 'warning',
        message: 'Record flagged in a near-duplicate inquiry cluster.',
        suggestion: 'Perform review and merge with primary record.',
      });
    }

    // Determine overall status
    const hasError = issues.some((i) => i.severity === 'error');
    const hasWarning = issues.some((i) => i.severity === 'warning');

    let status: ValidationStatus = 'valid';
    if (hasError) status = 'incomplete';
    else if (hasWarning) status = 'warning';

    return { status, issues };
  }

  /**
   * Mark cargo as validated (manual override)
   */
  public static markAsValidated(cargoId: number, _operatorName: string = 'Operations Specialist'): void {
    const changes: Partial<CargoRecord> = {
      validation_status: 'valid',
      validation_issues: [],
      status: 'validated',
    };
    this.saveOverride(cargoId, changes);
  }

  /**
   * Vessel Matching: Computes top matching vessels for a given cargo
   */
  public static getMatchingVesselsForCargo(
    cargo: CargoRecord,
    availableFleet: Vessel[] = []
  ): VesselMatchInfo[] {
    const pool = availableFleet.length > 0
      ? availableFleet.map((v) => {
          const dwt = v.capacity_tons || 60000;
          const isCapacityOk = dwt >= cargo.weight_tons && dwt <= cargo.weight_tons * 1.5;
          const score = isCapacityOk ? 92 : 75;
          return {
            vessel_id: v.id,
            vessel_name: v.name,
            imo_number: v.imo_number || `IMO ${9300000 + v.id * 133}`,
            vessel_type: v.vessel_type || 'Bulk Carrier',
            capacity_dwt: dwt,
            match_score: score,
            capacity_match_percent: isCapacityOk ? 95 : 70,
            route_match_percent: 90,
            timing_match_percent: 88,
            eta: new Date(Date.now() + 86400000 * 4).toISOString(),
            status: 'suggested' as const,
          };
        })
      : this.REFERENCE_VESSELS;

    // Sort by match score descending
    return [...pool].sort((a, b) => b.match_score - a.match_score);
  }

  /**
   * Assign vessel match to cargo
   */
  public static assignVesselMatch(cargoId: number, vesselMatch: VesselMatchInfo): void {
    this.saveOverride(cargoId, {
      matched_vessel: {
        ...vesselMatch,
        status: 'confirmed',
      },
      status: 'matched',
    });
  }

  /**
   * Unmatch vessel
   */
  public static unmatchVessel(cargoId: number): void {
    this.saveOverride(cargoId, {
      matched_vessel: null,
      status: 'validated',
    });
  }

  /**
   * Archive cargo record
   */
  public static archiveCargo(cargoId: number): void {
    this.saveOverride(cargoId, {
      status: 'archived',
    });
  }

  /**
   * Restore archived cargo record
   */
  public static restoreCargo(cargoId: number): void {
    this.saveOverride(cargoId, {
      status: 'validated',
    });
  }

  /**
   * Execute intelligent merge between Primary cargo and Duplicate cargo
   */
  public static mergeCargoes(
    primaryId: number,
    duplicateId: number,
    mergedFields: Partial<CargoRecord>
  ): void {
    // 1. Update primary record with merged choices
    this.saveOverride(primaryId, {
      ...mergedFields,
      duplicate_group_id: null,
      duplicate_cluster: null,
      validation_status: 'valid',
      validation_issues: [],
    });

    // 2. Mark duplicate as archived with merge note
    this.saveOverride(duplicateId, {
      status: 'archived',
      duplicate_group_id: null,
      duplicate_cluster: null,
    });
  }

  /**
   * Ingest new simulated or parsed cargo inquiry
   */
  public static ingestCargo(payload: Partial<CargoRecord>): CargoRecord {
    const id = Date.now();
    const newRecord: CargoRecord = {
      id,
      reference_number: payload.reference_number || `CRG-2026-${Math.floor(8900 + Math.random() * 1000)}`,
      source: payload.source || 'email',
      source_message_id: payload.source_message_id || `INGEST-${Date.now()}`,
      source_sender: payload.source_sender || 'inbound-feed@platform.maritime',
      shipper: payload.shipper || 'Enterprise Charterer Desk',
      consignee: payload.consignee || 'Discharge Industrial Receiver',
      commodity: payload.commodity || 'Industrial Freight',
      cargo_type: payload.cargo_type || 'Dry Bulk',
      quantity: payload.quantity || 1,
      unit: payload.unit || 'MT',
      weight_tons: payload.weight_tons || 45000,
      volume_m3: payload.volume_m3 || (payload.weight_tons ? payload.weight_tons * 1.3 : 58000),
      origin_port_id: payload.origin_port?.id ?? null,
      destination_port_id: payload.destination_port?.id ?? null,
      origin_port: payload.origin_port || this.REFERENCE_PORTS[0],
      destination_port: payload.destination_port || this.REFERENCE_PORTS[1],
      pickup_location: payload.pickup_location || 'Designated Loading Terminal',
      delivery_location: payload.delivery_location || 'Designated Discharge Terminal',
      ready_date: payload.ready_date || new Date(Date.now() + 86400000 * 2).toISOString(),
      deadline: payload.deadline || new Date(Date.now() + 86400000 * 9).toISOString(),
      status: 'draft',
      priority: payload.priority || 'standard',
      zone: payload.zone || this.deriveZoneFromPort(payload.destination_port || this.REFERENCE_PORTS[1]),
      is_private: !!payload.is_private,
      confidence_score: payload.confidence_score || 92,
      validation_status: 'valid',
      validation_issues: [],
      lifecycle_stages: [
        { stage: 'created', label: 'Ingested & Normalized', status: 'completed', timestamp: new Date().toISOString(), description: `Ingested via ${payload.source || 'channel'}` },
        { stage: 'validated', label: 'Validation Check', status: 'current', description: 'Pending technical clearance' },
        { stage: 'matched', label: 'Vessel Match', status: 'pending', description: 'Awaiting vessel allocation' },
        { stage: 'planned', label: 'Corridor Scheduling', status: 'pending', description: 'Awaiting nautical route' },
        { stage: 'in_transit', label: 'In Transit', status: 'pending', description: 'Underway' },
        { stage: 'delivered', label: 'Discharged', status: 'pending', description: 'Completed' },
      ],
      activity_log: [
        { id: `act-${Date.now()}`, timestamp: new Date().toISOString(), user: 'Multi-Channel Parser', action: 'Ingested', note: `Parsed from inbound ${payload.source || 'stream'}` },
      ],
      description: (payload.description || payload.commodity) ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.saveOverride(id, newRecord);
    return newRecord;
  }

  /**
   * Filter and search engine for Cargo Workspace
   */
  public static filterCargos(cargos: CargoRecord[], filters: CargoFiltersState): CargoRecord[] {
    return cargos.filter((c) => {
      // 1. Show archived filter
      if (!filters.showArchived && c.status === 'archived') return false;
      if (filters.showArchived && filters.status !== 'archived' && c.status === 'archived') {
        // if showArchived is on but status is not explicitly 'archived', include active and archived
      }

      // 2. Status filter
      if (filters.status !== 'all' && c.status !== filters.status) return false;

      // 3. Source filter
      if (filters.source !== 'all' && c.source !== filters.source) return false;

      // 4. Priority filter
      if (filters.priority !== 'all' && c.priority !== filters.priority) return false;

      // 5. Zone filter
      if (filters.zone !== 'all' && c.zone !== filters.zone) return false;

      // 6. Cargo Type filter
      if (filters.cargoType !== 'all' && c.cargo_type !== filters.cargoType) return false;

      // 7. Validation status filter
      if (filters.validationStatus !== 'all' && c.validation_status !== filters.validationStatus) return false;

      // 8. Vessel match status filter
      if (filters.vesselMatchStatus === 'matched' && !c.matched_vessel) return false;
      if (filters.vesselMatchStatus === 'unmatched' && c.matched_vessel) return false;

      // 9. Scope filter (public vs private)
      if (filters.scope === 'public' && c.is_private) return false;
      if (filters.scope === 'private' && !c.is_private) return false;

      // 10. Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matches =
          c.reference_number.toLowerCase().includes(q) ||
          c.shipper.toLowerCase().includes(q) ||
          c.consignee.toLowerCase().includes(q) ||
          c.commodity.toLowerCase().includes(q) ||
          c.origin_port.name.toLowerCase().includes(q) ||
          c.origin_port.country.toLowerCase().includes(q) ||
          c.destination_port.name.toLowerCase().includes(q) ||
          c.destination_port.country.toLowerCase().includes(q) ||
          (c.origin_port.unlocode && c.origin_port.unlocode.toLowerCase().includes(q)) ||
          (c.destination_port.unlocode && c.destination_port.unlocode.toLowerCase().includes(q)) ||
          (c.matched_vessel && c.matched_vessel.vessel_name.toLowerCase().includes(q)) ||
          (c.source_sender && c.source_sender.toLowerCase().includes(q));

        if (!matches) return false;
      }

      return true;
    });
  }

  /**
   * Derives Operational Analytics Summary
   */
  public static calculateAnalytics(cargos: CargoRecord[]): CargoAnalyticsSummary {
    const active = cargos.filter((c) => c.status !== 'archived');
    const archived = cargos.filter((c) => c.status === 'archived');
    const totalWeight = active.reduce((acc, c) => acc + (c.weight_tons || 0), 0);
    const validated = active.filter((c) => c.validation_status === 'valid').length;
    const needsValidation = active.filter((c) => c.validation_status !== 'valid').length;
    const matched = active.filter((c) => !!c.matched_vessel).length;
    const unmatched = active.filter((c) => !c.matched_vessel).length;
    const matchRate = active.length > 0 ? Math.round((matched / active.length) * 100) : 0;
    const privateCount = active.filter((c) => c.is_private).length;

    // Detect duplicate clusters count
    const clusterIds = new Set(
      active.filter((c) => c.duplicate_group_id).map((c) => c.duplicate_group_id)
    );

    // Urgent laycans (ready within 72 hours)
    const now = Date.now();
    const urgentCount = active.filter((c) => {
      const ready = new Date(c.ready_date).getTime();
      return ready >= now - 86400000 && ready <= now + 86400000 * 3;
    }).length;

    return {
      totalCount: cargos.length,
      activeCount: active.length,
      archivedCount: archived.length,
      totalWeightMT: totalWeight,
      validatedCount: validated,
      needsValidationCount: needsValidation,
      matchedCount: matched,
      unmatchedCount: unmatched,
      matchRatePercent: matchRate,
      duplicateClustersCount: clusterIds.size,
      urgentLaycanCount: urgentCount,
      privateCount,
    };
  }
}
