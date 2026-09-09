# pyrefly: ignore [missing-import]

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from supabase import create_client


# --------------------------------------------------
# FASTAPI APP
# --------------------------------------------------

app = FastAPI(
    title="SIH 26006 API",
    description="Backend API for Maritime Intelligence Platform",
    version="1.0.0",
)


# --------------------------------------------------
# SUPABASE CONNECTION
# --------------------------------------------------

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials are missing in .env")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

print("Supabase client created successfully!")


# --------------------------------------------------
# ROOT API
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "SIH 26006 Backend Running",
        "status": "success"
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# --------------------------------------------------
# GET PORTS
# --------------------------------------------------

@app.get("/ports")
def get_ports(limit: int = 50):

    if limit < 1:
        limit = 1

    if limit > 500:
        limit = 500

    response = (
        supabase
        .table("ports")
        .select("*")
        .limit(limit)
        .execute()
    )

    return {
        "count": len(response.data),
        "ports": response.data
    }


# --------------------------------------------------
# SEARCH PORTS
# --------------------------------------------------

@app.get("/ports/search")
def search_ports(name: str):

    response = (
        supabase
        .table("ports")
        .select("*")
        .ilike("name", f"%{name}%")
        .limit(50)
        .execute()
    )

    return {
        "count": len(response.data),
        "ports": response.data
    }


# --------------------------------------------------
# GET SINGLE PORT
# --------------------------------------------------

@app.get("/ports/{port_id}")
def get_port(port_id: int):

    response = (
        supabase
        .table("ports")
        .select("*")
        .eq("id", port_id)
        .execute()
    )

    if not response.data:
        return {
            "error": "Port not found",
            "port_id": port_id
        }

    return response.data[0]

# --------------------------------------------------
# VESSEL APIs
# --------------------------------------------------

@app.get("/vessels")
def get_vessels(limit: int = 50):

    if limit < 1:
        limit = 1

    if limit > 500:
        limit = 500

    response = (
        supabase
        .table("vessels")
        .select("*")
        .limit(limit)
        .execute()
    )

    return {
        "count": len(response.data),
        "vessels": response.data
    }


# --------------------------------------------------
# SEARCH VESSELS
# --------------------------------------------------

@app.get("/vessels/search")
def search_vessels(name: str):

    response = (
        supabase
        .table("vessels")
        .select("*")
        .ilike("name", f"%{name}%")
        .limit(50)
        .execute()
    )

    return {
        "count": len(response.data),
        "vessels": response.data
    }


# --------------------------------------------------
# GET SINGLE VESSEL
# --------------------------------------------------

@app.get("/vessels/{vessel_id}")
def get_vessel(vessel_id: int):

    response = (
        supabase
        .table("vessels")
        .select("*")
        .eq("id", vessel_id)
        .execute()
    )

    if not response.data:
        return {
            "error": "Vessel not found",
            "vessel_id": vessel_id
        }

    return response.data[0]

@app.get("/vessels/{vessel_id}")
def get_vessel(vessel_id: int):

    response = (
        supabase
        .table("vessels")
        .select("*")
        .eq("id", vessel_id)
        .execute()
    )

    if not response.data:
        return {
            "error": "Vessel not found",
            "vessel_id": vessel_id
        }

    return response.data[0]

# --------------------------------------------------
# CARGO APIs
# --------------------------------------------------

@app.get("/cargo")
def get_cargo(limit: int = 50):

    if limit < 1:
        limit = 1

    if limit > 500:
        limit = 500

    response = (
        supabase
        .table("cargo")
        .select("*")
        .limit(limit)
        .execute()
    )

    return {
        "count": len(response.data),
        "cargo": response.data
    }


# --------------------------------------------------
# GET SINGLE CARGO
# --------------------------------------------------

@app.get("/cargo/{cargo_id}")
def get_cargo_by_id(cargo_id: int):

    response = (
        supabase
        .table("cargo")
        .select("*")
        .eq("id", cargo_id)
        .execute()
    )

    if not response.data:
        return {
            "error": "Cargo not found",
            "cargo_id": cargo_id
        }

    return response.data[0]

# --------------------------------------------------
# CREATE CARGO
# --------------------------------------------------

@app.post("/cargo")
def create_cargo(cargo: dict):

    try:
        response = (
            supabase
            .table("cargo")
            .insert(cargo)
            .execute()
        )

        return {
            "message": "Cargo created successfully",
            "cargo": response.data[0] if response.data else None
        }

    except Exception as e:
        return {
            "error": str(e)
        }
    # --------------------------------------------------
# UPDATE CARGO
# --------------------------------------------------

@app.put("/cargo/{cargo_id}")
def update_cargo(cargo_id: int, cargo: dict):

    response = (
        supabase
        .table("cargo")
        .update(cargo)
        .eq("id", cargo_id)
        .execute()
    )

    if not response.data:
        return {
            "error": "Cargo not found",
            "cargo_id": cargo_id
        }

    return {
        "message": "Cargo updated successfully",
        "cargo": response.data[0]
    }

    # --------------------------------------------------
# DELETE CARGO
# --------------------------------------------------

@app.delete("/cargo/{cargo_id}")
def delete_cargo(cargo_id: int):

    response = (
        supabase
        .table("cargo")
        .delete()
        .eq("id", cargo_id)
        .execute()
    )

    if not response.data:
        return {
            "error": "Cargo not found",
            "cargo_id": cargo_id
        }

    return {
        "message": "Cargo deleted successfully",
        "cargo": response.data[0]
    }

    # --------------------------------------------------
# ROUTE APIs
# --------------------------------------------------

# GET ALL ROUTES
@app.get("/routes")
def get_routes(limit: int = 50):

    if limit < 1:
        limit = 1

    if limit > 500:
        limit = 500

    response = (
        supabase
        .table("routes")
        .select("*")
        .limit(limit)
        .execute()
    )

    return {
        "count": len(response.data),
        "routes": response.data
    }


# --------------------------------------------------
# GET SINGLE ROUTE
# --------------------------------------------------

@app.get("/routes/{route_id}")
def get_route(route_id: int):

    response = (
        supabase
        .table("routes")
        .select("*")
        .eq("id", route_id)
        .execute()
    )

    if not response.data:
        return {
            "error": "Route not found",
            "route_id": route_id
        }

    return response.data[0]


# --------------------------------------------------
# CREATE ROUTE
# --------------------------------------------------

@app.post("/routes")
def create_route(route: dict):

    try:
        response = (
            supabase
            .table("routes")
            .insert(route)
            .execute()
        )

        return {
            "message": "Route created successfully",
            "route": response.data[0] if response.data else None
        }

    except Exception as e:
        return {
            "error": str(e)
        }


# --------------------------------------------------
# UPDATE ROUTE
# --------------------------------------------------

@app.put("/routes/{route_id}")
def update_route(route_id: int, route: dict):

    response = (
        supabase
        .table("routes")
        .update(route)
        .eq("id", route_id)
        .execute()
    )

    if not response.data:
        return {
            "error": "Route not found",
            "route_id": route_id
        }

    return {
        "message": "Route updated successfully",
        "route": response.data[0]
    }


# --------------------------------------------------
# DELETE ROUTE
# --------------------------------------------------

@app.delete("/routes/{route_id}")
def delete_route(route_id: int):

    response = (
        supabase
        .table("routes")
        .delete()
        .eq("id", route_id)
        .execute()
    )

    if not response.data:
        return {
            "error": "Route not found",
            "route_id": route_id
        }

    return {
        "message": "Route deleted successfully",
        "route": response.data[0]
    }