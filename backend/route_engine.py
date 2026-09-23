"""
SIH 26006 Maritime Cargo Intelligence Platform
Module 11 — Maritime Route Calculation Engine

This engine calculates feasible maritime transit corridors between origin and destination
ports using canonical maritime waypoints and choke points, taking into account vessel draft
limitations for major canals (Suez, Panama, Kiel).

NO fake ocean coordinates, NO straight line masquerading as a maritime route.
"""

from datetime import datetime, timezone
import math
from typing import Any, Dict, List, Optional, Tuple


# Canonical maritime choke points and corridors from existing project data
MARITIME_CHOKEPOINTS: List[Dict[str, Any]] = [
    {
        "id": "wp-gibraltar",
        "name": "Strait of Gibraltar",
        "lat": 35.96,
        "lng": -5.60,
        "category": "chokepoint",
        "description": "Natural maritime passage connecting Atlantic Ocean to Mediterranean Sea."
    },
    {
        "id": "wp-dover",
        "name": "Strait of Dover (English Channel)",
        "lat": 51.10,
        "lng": 1.45,
        "category": "chokepoint",
        "description": "Narrowest part of English Channel connecting North Sea and Atlantic."
    },
    {
        "id": "wp-skagen",
        "name": "Skagen (Danish Straits)",
        "lat": 57.75,
        "lng": 10.65,
        "category": "chokepoint",
        "description": "Northern tip of Jutland linking North Sea and Kattegat/Baltic."
    },
    {
        "id": "wp-kiel",
        "name": "Kiel Canal Transit",
        "lat": 54.12,
        "lng": 9.65,
        "category": "canal",
        "max_draft_m": 9.5,
        "description": "98 km artificial canal linking North Sea at Brunsbüttel to Baltic Sea at Kiel."
    },
    {
        "id": "wp-suez-north",
        "name": "Suez Canal (Port Said Entry)",
        "lat": 31.26,
        "lng": 32.31,
        "category": "canal",
        "max_draft_m": 20.1,
        "description": "Northern Mediterranean approach to Suez Canal transit corridor."
    },
    {
        "id": "wp-suez-south",
        "name": "Suez Canal (Suez Exit)",
        "lat": 29.93,
        "lng": 32.55,
        "category": "canal",
        "max_draft_m": 20.1,
        "description": "Southern Red Sea approach to Suez Canal transit corridor."
    },
    {
        "id": "wp-bab",
        "name": "Bab-el-Mandeb Strait",
        "lat": 12.58,
        "lng": 43.33,
        "category": "chokepoint",
        "description": "Strategic maritime strait linking southern Red Sea to Gulf of Aden."
    },
    {
        "id": "wp-hormuz",
        "name": "Strait of Hormuz",
        "lat": 26.56,
        "lng": 56.25,
        "category": "chokepoint",
        "description": "Critical crude oil transit chokepoint linking Persian Gulf to Arabian Sea."
    },
    {
        "id": "wp-malacca",
        "name": "Strait of Malacca",
        "lat": 2.50,
        "lng": 101.50,
        "category": "chokepoint",
        "description": "Primary sea corridor linking Indian Ocean and Pacific Ocean."
    },
    {
        "id": "wp-singapore",
        "name": "Singapore Strait",
        "lat": 1.22,
        "lng": 103.80,
        "category": "chokepoint",
        "description": "Global transshipment bottleneck linking Malacca Strait and South China Sea."
    },
    {
        "id": "wp-cape-good-hope",
        "name": "Cape of Good Hope (South Africa)",
        "lat": -34.35,
        "lng": 18.47,
        "category": "waypoint",
        "description": "Deepwater intercontinental cape route bypassing Suez Canal chokepoints."
    },
    {
        "id": "wp-panama-carib",
        "name": "Panama Canal (Colon / Atlantic)",
        "lat": 9.35,
        "lng": -79.91,
        "category": "canal",
        "max_draft_m": 15.24,
        "description": "Caribbean/Atlantic entrance to Panama Canal locks."
    },
    {
        "id": "wp-panama-pac",
        "name": "Panama Canal (Miraflores / Pacific)",
        "lat": 8.99,
        "lng": -79.59,
        "category": "canal",
        "max_draft_m": 15.24,
        "description": "Pacific entrance to Panama Canal locks."
    },
    {
        "id": "wp-cape-horn",
        "name": "Cape Horn (South America)",
        "lat": -56.00,
        "lng": -67.30,
        "category": "waypoint",
        "description": "Southern oceanic route connecting Atlantic and Pacific around South America."
    },
    {
        "id": "wp-florida-strait",
        "name": "Straits of Florida",
        "lat": 24.30,
        "lng": -81.20,
        "category": "waypoint",
        "description": "Channel separating Florida Keys and Cuba, vital for US Gulf traffic."
    },
    {
        "id": "wp-sunda",
        "name": "Sunda Strait (Indonesia)",
        "lat": -5.90,
        "lng": 105.80,
        "category": "chokepoint",
        "description": "Passage between Java and Sumatra connecting Java Sea to Indian Ocean."
    }
]


class RouteEngine:
    """
    Core functional maritime route calculation engine.
    Computes feasible routes, evaluates physical canal limits, calculates
    nautical distances, and generates valid multi-leg geometric coordinates.
    """

    EARTH_RADIUS_NM: float = 3440.065
    KM_PER_NM: float = 1.852

    @classmethod
    def calculate_haversine_distance(cls, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculates Great Circle distance between two coordinates in Nautical Miles (NM).
        """
        if lat1 == lat2 and lon1 == lon2:
            return 0.0

        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = (
            math.sin(delta_phi / 2.0) ** 2
            + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return cls.EARTH_RADIUS_NM * c

    @classmethod
    def get_chokepoint(cls, point_id: str) -> Optional[Dict[str, Any]]:
        for cp in MARITIME_CHOKEPOINTS:
            if cp["id"] == point_id:
                return cp
        return None

    @classmethod
    def check_canal_restrictions(
        cls,
        canal_name: str,
        vessel_draft_m: Optional[float]
    ) -> Dict[str, Any]:
        """
        Evaluates canal channel draft limits against vessel dimensions.
        """
        limits = {
            "Suez": {"max_draft": 20.1, "name": "Suez Canal"},
            "Panama": {"max_draft": 15.24, "name": "Panama Canal (Neo-Panamax)"},
            "Kiel": {"max_draft": 9.5, "name": "Kiel Canal"}
        }

        info = limits.get(canal_name)
        if not info:
            return {"is_restricted": False, "reason": None}

        if vessel_draft_m is not None and vessel_draft_m > info["max_draft"]:
            return {
                "is_restricted": True,
                "canal": info["name"],
                "max_draft_m": info["max_draft"],
                "vessel_draft_m": vessel_draft_m,
                "reason": (
                    f"Vessel draft of {vessel_draft_m}m exceeds {info['name']} "
                    f"maximum channel draft limit of {info['max_draft']}m."
                )
            }

        return {
            "is_restricted": False,
            "canal": info["name"],
            "max_draft_m": info["max_draft"],
            "vessel_draft_m": vessel_draft_m,
            "reason": None
        }

    @classmethod
    def resolve_corridor_waypoints(
        cls,
        origin_lat: float,
        origin_lng: float,
        dest_lat: float,
        dest_lng: float,
        vessel_draft_m: Optional[float] = None
    ) -> Tuple[List[Dict[str, Any]], List[str], str]:
        """
        Resolves maritime transit waypoints connecting origin and destination
        across recognized global commercial sea lanes without overland straight lines.
        Returns: (waypoints, restrictions, corridor_type)
        """
        restrictions: List[str] = []
        wps: List[Dict[str, Any]] = []

        # Geographic bounding zones
        is_origin_gulf = (15.0 <= origin_lat <= 30.0) and (45.0 <= origin_lng <= 60.0)
        is_dest_gulf = (15.0 <= dest_lat <= 30.0) and (45.0 <= dest_lng <= 60.0)

        is_origin_europe = (35.0 <= origin_lat <= 70.0) and (-15.0 <= origin_lng <= 40.0)
        is_dest_europe = (35.0 <= dest_lat <= 70.0) and (-15.0 <= dest_lng <= 40.0)

        is_origin_east_asia = (-10.0 <= origin_lat <= 45.0) and (95.0 <= origin_lng <= 145.0)
        is_dest_east_asia = (-10.0 <= dest_lat <= 45.0) and (95.0 <= dest_lng <= 145.0)

        is_origin_us_gulf = (15.0 <= origin_lat <= 45.0) and (-100.0 <= origin_lng <= -60.0)
        is_dest_us_gulf = (15.0 <= dest_lat <= 45.0) and (-100.0 <= dest_lng <= -60.0)

        is_origin_india = (5.0 <= origin_lat <= 25.0) and (68.0 <= origin_lng <= 88.0)
        is_dest_india = (5.0 <= dest_lat <= 25.0) and (68.0 <= dest_lng <= 88.0)

        # Check Suez draft restriction
        suez_check = cls.check_canal_restrictions("Suez", vessel_draft_m)
        suez_restricted = suez_check["is_restricted"]
        if suez_restricted:
            restrictions.append(suez_check["reason"])

        # Check Panama draft restriction
        panama_check = cls.check_canal_restrictions("Panama", vessel_draft_m)
        panama_restricted = panama_check["is_restricted"]
        if panama_restricted:
            restrictions.append(panama_check["reason"])

        # Case 1: Persian Gulf <-> Europe / Mediterranean
        if (is_origin_gulf and is_dest_europe) or (is_origin_europe and is_dest_gulf):
            if is_origin_gulf:
                wps.append(cls.get_chokepoint("wp-hormuz"))
                if suez_restricted:
                    restrictions.append("Rerouting via Cape of Good Hope due to draft constraints.")
                    wps.append(cls.get_chokepoint("wp-cape-good-hope"))
                    wps.append(cls.get_chokepoint("wp-gibraltar"))
                    if dest_lat > 48.0:
                        wps.append(cls.get_chokepoint("wp-dover"))
                else:
                    wps.append(cls.get_chokepoint("wp-bab"))
                    wps.append(cls.get_chokepoint("wp-suez-south"))
                    wps.append(cls.get_chokepoint("wp-suez-north"))
                    if dest_lng < 0.0 or dest_lat > 40.0:
                        wps.append(cls.get_chokepoint("wp-gibraltar"))
                        if dest_lat > 48.0:
                            wps.append(cls.get_chokepoint("wp-dover"))
            else:
                if origin_lat > 48.0:
                    wps.append(cls.get_chokepoint("wp-dover"))
                wps.append(cls.get_chokepoint("wp-gibraltar"))
                if suez_restricted:
                    restrictions.append("Rerouting via Cape of Good Hope due to draft constraints.")
                    wps.append(cls.get_chokepoint("wp-cape-good-hope"))
                else:
                    wps.append(cls.get_chokepoint("wp-suez-north"))
                    wps.append(cls.get_chokepoint("wp-suez-south"))
                    wps.append(cls.get_chokepoint("wp-bab"))
                wps.append(cls.get_chokepoint("wp-hormuz"))

            return [w for w in wps if w], restrictions, "intercontinental_corridor"

        # Case 2: Europe <-> East Asia / Southeast Asia
        if (is_origin_europe and is_dest_east_asia) or (is_origin_east_asia and is_dest_europe):
            if is_origin_europe:
                if origin_lat > 48.0:
                    wps.append(cls.get_chokepoint("wp-dover"))
                wps.append(cls.get_chokepoint("wp-gibraltar"))
                if suez_restricted:
                    restrictions.append("Rerouting via Cape of Good Hope due to draft constraints.")
                    wps.append(cls.get_chokepoint("wp-cape-good-hope"))
                else:
                    wps.append(cls.get_chokepoint("wp-suez-north"))
                    wps.append(cls.get_chokepoint("wp-suez-south"))
                    wps.append(cls.get_chokepoint("wp-bab"))
                wps.append(cls.get_chokepoint("wp-malacca"))
                wps.append(cls.get_chokepoint("wp-singapore"))
            else:
                wps.append(cls.get_chokepoint("wp-singapore"))
                wps.append(cls.get_chokepoint("wp-malacca"))
                if suez_restricted:
                    restrictions.append("Rerouting via Cape of Good Hope due to draft constraints.")
                    wps.append(cls.get_chokepoint("wp-cape-good-hope"))
                    wps.append(cls.get_chokepoint("wp-gibraltar"))
                    if dest_lat > 48.0:
                        wps.append(cls.get_chokepoint("wp-dover"))
                else:
                    wps.append(cls.get_chokepoint("wp-bab"))
                    wps.append(cls.get_chokepoint("wp-suez-south"))
                    wps.append(cls.get_chokepoint("wp-suez-north"))
                    if dest_lng < 0.0 or dest_lat > 40.0:
                        wps.append(cls.get_chokepoint("wp-gibraltar"))
                        if dest_lat > 48.0:
                            wps.append(cls.get_chokepoint("wp-dover"))

            return [w for w in wps if w], restrictions, "intercontinental_corridor"

        # Case 3: US Gulf <-> East Asia
        if (is_origin_us_gulf and is_dest_east_asia) or (is_origin_east_asia and is_dest_us_gulf):
            if is_origin_us_gulf:
                if panama_restricted:
                    restrictions.append("Panama Canal draft limit exceeded. Diverting via Cape of Good Hope.")
                    wps.append(cls.get_chokepoint("wp-cape-good-hope"))
                    wps.append(cls.get_chokepoint("wp-sunda"))
                    wps.append(cls.get_chokepoint("wp-singapore"))
                else:
                    wps.append(cls.get_chokepoint("wp-florida-strait"))
                    wps.append(cls.get_chokepoint("wp-panama-carib"))
                    wps.append(cls.get_chokepoint("wp-panama-pac"))
            else:
                if panama_restricted:
                    restrictions.append("Panama Canal draft limit exceeded. Diverting via Cape of Good Hope.")
                    wps.append(cls.get_chokepoint("wp-singapore"))
                    wps.append(cls.get_chokepoint("wp-sunda"))
                    wps.append(cls.get_chokepoint("wp-cape-good-hope"))
                else:
                    wps.append(cls.get_chokepoint("wp-panama-pac"))
                    wps.append(cls.get_chokepoint("wp-panama-carib"))
                    wps.append(cls.get_chokepoint("wp-florida-strait"))

            return [w for w in wps if w], restrictions, "transoceanic_corridor"

        # Case 4: India <-> East Asia
        if (is_origin_india and is_dest_east_asia) or (is_origin_east_asia and is_dest_india):
            wps.append(cls.get_chokepoint("wp-malacca"))
            wps.append(cls.get_chokepoint("wp-singapore"))
            return [w for w in wps if w], restrictions, "regional_corridor"

        # Case 5: India <-> Europe
        if (is_origin_india and is_dest_europe) or (is_origin_europe and is_dest_india):
            if is_origin_india:
                if suez_restricted:
                    restrictions.append("Rerouting via Cape of Good Hope due to draft constraints.")
                    wps.append(cls.get_chokepoint("wp-cape-good-hope"))
                    wps.append(cls.get_chokepoint("wp-gibraltar"))
                    if dest_lat > 48.0:
                        wps.append(cls.get_chokepoint("wp-dover"))
                else:
                    wps.append(cls.get_chokepoint("wp-bab"))
                    wps.append(cls.get_chokepoint("wp-suez-south"))
                    wps.append(cls.get_chokepoint("wp-suez-north"))
                    if dest_lng < 0.0 or dest_lat > 40.0:
                        wps.append(cls.get_chokepoint("wp-gibraltar"))
                        if dest_lat > 48.0:
                            wps.append(cls.get_chokepoint("wp-dover"))
            else:
                if origin_lat > 48.0:
                    wps.append(cls.get_chokepoint("wp-dover"))
                wps.append(cls.get_chokepoint("wp-gibraltar"))
                if suez_restricted:
                    wps.append(cls.get_chokepoint("wp-cape-good-hope"))
                else:
                    wps.append(cls.get_chokepoint("wp-suez-north"))
                    wps.append(cls.get_chokepoint("wp-suez-south"))
                    wps.append(cls.get_chokepoint("wp-bab"))

            return [w for w in wps if w], restrictions, "intercontinental_corridor"

        # Case 6: Local / coastal within same maritime zone
        # When no major choke point is crossed, the route follows coastal / localized navigation
        return [], restrictions, "direct_sea_passage"

    @classmethod
    def calculate_route(
        cls,
        origin_port: Dict[str, Any],
        dest_port: Dict[str, Any],
        vessel: Optional[Dict[str, Any]] = None,
        cargo: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Calculates feasible maritime route between two ports, including:
        - Route ID and status
        - Ordered geometry path [[lat, lng], ...]
        - Distance in nautical miles (NM) and kilometers (KM)
        - Route classification and distance type ("maritime" vs "geodesic")
        - Individual leg breakdown
        - Identified navigational restrictions
        """
        # 1. Validate coordinates
        cls.validate_input(origin_port, dest_port)

        o_lat = float(origin_port["latitude"])
        o_lng = float(origin_port["longitude"])
        d_lat = float(dest_port["latitude"])
        d_lng = float(dest_port["longitude"])

        vessel_draft_m = None
        if vessel and vessel.get("draft_m") is not None:
            try:
                vessel_draft_m = float(vessel["draft_m"])
            except (ValueError, TypeError):
                vessel_draft_m = None

        # 2. Resolve intermediate maritime choke points
        wps, restrictions, corridor_type = cls.resolve_corridor_waypoints(
            o_lat, o_lng, d_lat, d_lng, vessel_draft_m=vessel_draft_m
        )

        # 3. Build sequence of routing points: Origin -> Waypoints -> Destination
        route_nodes: List[Dict[str, Any]] = [
            {
                "id": f"port-{origin_port.get('id', 'origin')}",
                "name": origin_port.get("name", "Origin Port"),
                "lat": o_lat,
                "lng": o_lng,
                "node_type": "origin_port",
                "country": origin_port.get("country")
            }
        ]

        for wp in wps:
            route_nodes.append({
                "id": wp["id"],
                "name": wp["name"],
                "lat": wp["lat"],
                "lng": wp["lng"],
                "node_type": "waypoint",
                "category": wp.get("category", "chokepoint")
            })

        route_nodes.append({
            "id": f"port-{dest_port.get('id', 'dest')}",
            "name": dest_port.get("name", "Destination Port"),
            "lat": d_lat,
            "lng": d_lng,
            "node_type": "destination_port",
            "country": dest_port.get("country")
        })

        # 4. Calculate cumulative multi-leg distances & construct geometry
        geometry: List[Tuple[float, float]] = []
        legs: List[Dict[str, Any]] = []
        total_distance_nm = 0.0

        for i in range(len(route_nodes) - 1):
            n1 = route_nodes[i]
            n2 = route_nodes[i + 1]

            # Great-circle segment distance
            seg_dist = cls.calculate_haversine_distance(n1["lat"], n1["lng"], n2["lat"], n2["lng"])
            total_distance_nm += seg_dist

            legs.append({
                "leg_index": i + 1,
                "from_name": n1["name"],
                "to_name": n2["name"],
                "distance_nm": round(seg_dist, 1),
                "distance_km": round(seg_dist * cls.KM_PER_NM, 1),
                "from_coords": [n1["lat"], n1["lng"]],
                "to_coords": [n2["lat"], n2["lng"]]
            })

        for node in route_nodes:
            geometry.append((node["lat"], node["lng"]))

        # Check whether route contains intermediate maritime nodes
        if len(wps) > 0:
            distance_type = "maritime"
            route_type = corridor_type
        else:
            # When direct without intermediate nodes, accurately denote geodesic
            distance_type = "geodesic"
            route_type = "direct_sea_passage"

        distance_km = total_distance_nm * cls.KM_PER_NM

        now_iso = datetime.now(timezone.utc).isoformat()
        route_slug = f"rt-{origin_port.get('id')}-{dest_port.get('id')}"

        return {
            "route_id": route_slug,
            "origin_port_id": origin_port.get("id"),
            "destination_port_id": dest_port.get("id"),
            "origin_port": {
                "id": origin_port.get("id"),
                "name": origin_port.get("name"),
                "country": origin_port.get("country"),
                "unlocode": origin_port.get("unlocode"),
                "latitude": o_lat,
                "longitude": o_lng
            },
            "destination_port": {
                "id": dest_port.get("id"),
                "name": dest_port.get("name"),
                "country": dest_port.get("country"),
                "unlocode": dest_port.get("unlocode"),
                "latitude": d_lat,
                "longitude": d_lng
            },
            "vessel_id": vessel.get("id") if vessel else None,
            "vessel": {
                "id": vessel.get("id"),
                "name": vessel.get("name"),
                "vessel_type": vessel.get("vessel_type"),
                "draft_m": vessel.get("draft_m"),
                "capacity_tons": vessel.get("capacity_tons")
            } if vessel else None,
            "cargo_id": cargo.get("id") if cargo else None,
            "distance_nm": round(total_distance_nm, 1),
            "distance_km": round(distance_km, 1),
            "distance_type": distance_type,
            "route_type": route_type,
            "geometry": [[lat, lng] for lat, lng in geometry],
            "waypoints": wps,
            "legs": legs,
            "restrictions": restrictions,
            "status": "calculated",
            "created_at": now_iso
        }

    @classmethod
    def validate_input(cls, origin_port: Dict[str, Any], dest_port: Dict[str, Any]) -> None:
        """
        Validates origin and destination presence, inequality, and valid coordinates.
        Raises ValueError with strict messages.
        """
        if not origin_port:
            raise ValueError("Origin port not found.")
        if not dest_port:
            raise ValueError("Destination port not found.")

        if origin_port.get("id") == dest_port.get("id"):
            raise ValueError("Origin port and destination port cannot be the same.")

        o_lat = origin_port.get("latitude")
        o_lng = origin_port.get("longitude")
        d_lat = dest_port.get("latitude")
        d_lng = dest_port.get("longitude")

        if o_lat is None or o_lng is None or d_lat is None or d_lng is None:
            raise ValueError(
                "Route cannot be calculated because geographic coordinates "
                "are unavailable for the selected port."
            )

        try:
            o_lat_f = float(o_lat)
            o_lng_f = float(o_lng)
            d_lat_f = float(d_lat)
            d_lng_f = float(d_lng)
            if math.isnan(o_lat_f) or math.isnan(o_lng_f) or math.isnan(d_lat_f) or math.isnan(d_lng_f):
                raise ValueError()
        except (ValueError, TypeError):
            raise ValueError(
                "Route cannot be calculated because geographic coordinates "
                "are unavailable for the selected port."
            )
