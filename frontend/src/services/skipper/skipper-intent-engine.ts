import type { SkipperParsedIntent, SkipperIntentCategory } from '../../types/skipper';

export class SkipperIntentEngine {
  /**
   * Alias for parse
   */
  public static parseQuery(prompt: string, contextEntities: Record<string, any> = {}): SkipperParsedIntent {
    return this.parse(prompt, contextEntities);
  }

  /**
   * Parses natural-language user prompt and resolves multi-turn context
   */
  public static parse(prompt: string, contextEntities: Record<string, any> = {}): SkipperParsedIntent {
    const q = prompt.trim().toLowerCase();

    const entities: SkipperParsedIntent['entities'] = {
      ...contextEntities, // inherit antecedent context (e.g. active routeCode, vesselName)
    };

    // 1. Check for Route Codes (e.g. TD3C, TD20, TD7, TD25, TC2, TC14, TC5, C3, C5, P2A, LNG1)
    const routeRegex = /\b(td3c|td20|td7|td25|tc2|tc14|tc5|c3|c5|p2a|lng1|lng2)\b/i;
    const routeMatch = q.match(routeRegex);
    if (routeMatch) {
      entities.routeCode = routeMatch[1].toUpperCase();
    }

    // 2. Check for Vessel Names or IMO
    const imoRegex = /\b(9\d{6})\b/;
    const imoMatch = q.match(imoRegex);
    if (imoMatch) {
      entities.imo = imoMatch[1];
    }

    const KNOWN_VESSELS = [
      'apollo glory',
      'ocean titan',
      'nordic empress',
      'aegean horizon',
      'pacific leopard',
      'silver swift',
      'atlantic breeze',
      'gulf explorer',
      'cape mariner',
      'iron phoenix',
      'golden panamax',
      'arctic pioneer',
      'qatar majesty',
    ];

    for (const vessel of KNOWN_VESSELS) {
      if (q.includes(vessel)) {
        entities.vesselName = vessel.toUpperCase();
        break;
      }
    }

    // 3. Check for Vessel Classes
    const vesselClassRegex = /\b(vlcc|suezmax|aframax|capesize|panamax|mr|lng carrier|tanker|bulker)\b/i;
    const classMatch = q.match(vesselClassRegex);
    if (classMatch) {
      const cls = classMatch[1].toUpperCase();
      entities.vesselClass = cls === 'MR' ? 'MR' : cls === 'VLCC' ? 'VLCC' : cls.charAt(0) + cls.slice(1).toLowerCase();
    }

    // 4. Check for Port Names
    const KNOWN_PORTS = [
      'singapore',
      'rotterdam',
      'shanghai',
      'ningbo',
      'houston',
      'ras tanura',
      'fujairah',
      'qingdao',
      'antwerp',
      'busan',
      'los angeles',
      'long beach',
      'santos',
      'tubarao',
      'port hedland',
    ];

    for (const port of KNOWN_PORTS) {
      if (q.includes(port)) {
        entities.portName = port.charAt(0).toUpperCase() + port.slice(1);
        break;
      }
    }

    // 5. Check for Comparison Intent
    if (q.includes('compare') || q.includes('versus') || q.includes('vs') || q.includes('spread') || q.includes('difference')) {
      entities.isComparison = true;
    }

    // 6. Check for Multi-turn anaphoric resolution ("that", "this route", "her", "her destination")
    const isAnaphoric =
      q.includes('that') ||
      q.includes('this') ||
      q.includes('last month') ||
      q.includes('previous') ||
      q.includes('her') ||
      q.includes('it');

    // 7. Intent Classification via Lexical & Semantic Heuristics
    let category: SkipperIntentCategory = 'UNKNOWN_OR_AMBIGUOUS';
    let confidence = 0.5;

    // A. FFA Derivatives
    if (q.includes('ffa') || q.includes('forward curve') || q.includes('derivatives') || q.includes('contango') || q.includes('backwardation')) {
      category = 'FFA_DERIVATIVES';
      confidence = 0.95;
    }
    // B. Port Congestion & Waiting
    else if (
      q.includes('congestion') ||
      q.includes('port wait') ||
      q.includes('waiting time') ||
      q.includes('wait time') ||
      q.includes('anchorage') ||
      q.includes('berth') ||
      q.includes('queue') ||
      (entities.portName && !entities.vesselName)
    ) {
      category = 'PORT_CONGESTION';
      confidence = 0.92;
    }
    // C. Decarbonization & Emissions
    else if (
      q.includes('cii') ||
      q.includes('carbon') ||
      q.includes('co2') ||
      q.includes('emission') ||
      q.includes('eeoi') ||
      q.includes('green') ||
      q.includes('decarbon')
    ) {
      category = 'DECARBONIZATION';
      confidence = 0.9;
    }
    // D. Multi-Year Historical Exploration (2014-2026)
    else if (
      q.includes('2014') ||
      q.includes('2020') ||
      q.includes('supercycle') ||
      q.includes('cyclical') ||
      q.includes('10 year') ||
      q.includes('12 year') ||
      q.includes('since 2014')
    ) {
      category = 'MULTI_YEAR_EXPLORATION';
      confidence = 0.92;
    }
    // E. Fleet Operations & Rosters
    else if (
      q.includes('fleet') ||
      q.includes('operator') ||
      q.includes('owner') ||
      q.includes('roster') ||
      q.includes('dwt capacity') ||
      q.includes('vessel count')
    ) {
      category = 'FLEET_OPERATIONS';
      confidence = 0.88;
    }
    // F. Freight Rates & Spot Market
    else if (
      q.includes('rate') ||
      q.includes('freight') ||
      q.includes('tce') ||
      q.includes('spot') ||
      q.includes('fixture') ||
      q.includes('earnings') ||
      entities.routeCode
    ) {
      category = 'FREIGHT_MARKET';
      confidence = 0.9;
    }
    // G. Vessel Tracking & Position
    else if (
      entities.vesselName ||
      entities.imo ||
      q.includes('where is') ||
      q.includes('position') ||
      q.includes('ais') ||
      q.includes('speed') ||
      q.includes('eta') ||
      q.includes('vessel') ||
      q.includes('ship')
    ) {
      category = 'VESSEL_INTELLIGENCE';
      confidence = 0.9;
    }
    // H. Contextual Fallback for Anaphoric Queries
    else if (isAnaphoric && contextEntities.lastCategory) {
      category = contextEntities.lastCategory;
      confidence = 0.85;
    }

    return {
      category,
      confidence,
      entities,
      originalQuery: prompt,
      timeHorizon: q.includes('12m') || q.includes('1 year') ? '1Y' : q.includes('5y') ? '5Y' : 'ALL',
    };
  }
}
