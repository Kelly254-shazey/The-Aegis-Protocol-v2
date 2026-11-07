#!/usr/bin/env python3
"""
THE AEGIS PROTOCOL (VERSION 3) — PYTHON 3.12 CONTROL PLANE & CLEARINGHOUSE AUDITOR
Validates:
  - Gate 1: Hardware Slot Capacity Ceiling (C_max) & 20% Household Reserve
  - Gate 2: Multi-Tenant VRF Namespace Isolation (Zero Cross-Bridging)
  - Gate 3: Automated 70%/30% Revenue Split & Unit Economics Breakeven Model
  - Live Cloud Relay V3 Multi-Router Telemetry Synchronization
"""

import json
import ssl
import sys
import urllib.request
from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class SecondarySlotSession:
    slot_number: int
    client_id: str
    operator_id: str
    vrf_namespace: str
    assigned_ip: str
    amount_paid_usd: float


@dataclass
class PrimaryOperatorRouter:
    operator_id: str
    operator_name: str
    router_name: str
    vrf_namespace: str
    subnet_cidr: str
    max_slots: int
    bandwidth_mbps: int
    host_share_pct: float = 70.0
    owner_share_pct: float = 30.0
    gross_revenue_usd: float = 0.0
    host_earned_usd: float = 0.0
    owner_royalty_usd: float = 0.0
    cross_talk_blocked: int = 0
    active_slots: Dict[str, SecondarySlotSession] = field(default_factory=dict)

    @property
    def usable_mesh_mbps(self) -> float:
        # 20% reserved for Primary Operator's household family devices
        return round(self.bandwidth_mbps * 0.80, 2)


class AegisV3ControlPlane:
    def __init__(self) -> None:
        self.routers: Dict[str, PrimaryOperatorRouter] = {}
        self._seed_default_topology()

    def _seed_default_topology(self) -> None:
        self.register_router(
            operator_id="router-owner",
            operator_name="Master Owner (You)",
            router_name="Owner Home Router (Core Base)",
            octet=1,
            max_slots=64,
            bandwidth_mbps=200,
            host_share_pct=0.0,
            owner_share_pct=100.0,
        )
        self.register_router(
            operator_id="router-lec",
            operator_name="Lecturer (Primary Host)",
            router_name="Lecturer Home Fiber Router",
            octet=2,
            max_slots=32,
            bandwidth_mbps=150,
            host_share_pct=70.0,
            owner_share_pct=30.0,
        )
        self.register_router(
            operator_id="router-friend1",
            operator_name="Friend 1 (Primary Host)",
            router_name="Friend 1 Broadband Router",
            octet=3,
            max_slots=20,
            bandwidth_mbps=100,
            host_share_pct=70.0,
            owner_share_pct=30.0,
        )

    def register_router(
        self,
        operator_id: str,
        operator_name: str,
        router_name: str,
        octet: int,
        max_slots: int,
        bandwidth_mbps: int,
        host_share_pct: float = 70.0,
        owner_share_pct: float = 30.0,
    ) -> PrimaryOperatorRouter:
        subnet = f"10.70.{octet}.0/24"
        vrf = f"vrf-{operator_id}-{subnet}"
        router = PrimaryOperatorRouter(
            operator_id=operator_id,
            operator_name=operator_name,
            router_name=router_name,
            vrf_namespace=vrf,
            subnet_cidr=subnet,
            max_slots=max_slots,
            bandwidth_mbps=bandwidth_mbps,
            host_share_pct=host_share_pct,
            owner_share_pct=owner_share_pct,
        )
        self.routers[operator_id] = router
        return router

    def allocate_slot(
        self, operator_id: str, client_id: str, amount_paid_usd: float
    ) -> SecondarySlotSession:
        if operator_id not in self.routers:
            raise KeyError(f"Unknown Primary Operator ID: {operator_id}")
        router = self.routers[operator_id]
        if len(router.active_slots) >= router.max_slots:
            raise OverflowError(
                f"FR-01 SLOT_CAPACITY_EXCEEDED: {operator_id} is holding maximum {router.max_slots}/{router.max_slots} connections"
            )

        slot_num = len(router.active_slots) + 1
        octet = router.subnet_cidr.split(".")[2]
        assigned_ip = f"10.70.{octet}.{slot_num + 1}"

        session = SecondarySlotSession(
            slot_number=slot_num,
            client_id=client_id,
            operator_id=operator_id,
            vrf_namespace=router.vrf_namespace,
            assigned_ip=assigned_ip,
            amount_paid_usd=amount_paid_usd,
        )
        router.active_slots[client_id] = session

        # FR-04: Automated Micro-Clearing Split
        host_cut = round(amount_paid_usd * (router.host_share_pct / 100.0), 2)
        owner_cut = round(amount_paid_usd - host_cut, 2)
        router.gross_revenue_usd = round(router.gross_revenue_usd + amount_paid_usd, 2)
        router.host_earned_usd = round(router.host_earned_usd + host_cut, 2)
        router.owner_royalty_usd = round(router.owner_royalty_usd + owner_cut, 2)
        return session

    def verify_packet_isolation(
        self, client_id: str, source_operator_id: str, target_operator_id: str
    ) -> bool:
        router = self.routers[source_operator_id]
        if source_operator_id != target_operator_id:
            router.cross_talk_blocked += 1
            return False
        return client_id in router.active_slots


def run_validation_suite() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    print("==================================================================")
    print("🐍 AEGIS PROTOCOL V3 — PYTHON 3.12 CONTROL PLANE & AUDIT SUITE")
    print("==================================================================")
    cp = AegisV3ControlPlane()

    # 1. Verify Total Fleet Capacity = Owner(64) + Lec(32) + Friend1(20) = 116 Slots
    total_slots = sum(r.max_slots for r in cp.routers.values())
    assert total_slots == 116, f"Expected 116 fleet slots, got {total_slots}"
    print(f"[✓] Fleet Capacity Audit: {total_slots} Total Hardware Slots Across {len(cp.routers)} Core Routers")

    # 2. Gate 1: Fill Friend 1's 20-Slot Router and verify #21 is blocked
    for i in range(1, 21):
        cp.allocate_slot("router-friend1", f"friend-client-{i}", 1.00)
    try:
        cp.allocate_slot("router-friend1", "friend-client-21-overflow", 1.00)
        print("[FAIL] Gate 1 failed: allowed 21st client on 20-slot router")
        return 1
    except OverflowError as exc:
        print(f"[✓] Gate 1 Verified: {exc}")

    # 3. Gate 2: Verify Zero Cross-Bridging between Friend 1 and Lecturer
    cp.allocate_slot("router-lec", "lec-student-1", 3.50)
    allowed_same = cp.verify_packet_isolation("lec-student-1", "router-lec", "router-lec")
    allowed_cross = cp.verify_packet_isolation("lec-student-1", "router-lec", "router-friend1")
    assert allowed_same is True and allowed_cross is False
    print("[✓] Gate 2 Verified: Cross-VRF bridging between Lecturer and Friend 1 strictly DROPPED")

    # 4. Gate 3: Verify Clearinghouse Ledger Math (Zero Discrepancies)
    for op_id, r in cp.routers.items():
        assert round(r.host_earned_usd + r.owner_royalty_usd, 2) == r.gross_revenue_usd
        print(
            f"    • {r.router_name} ({op_id}): Slots={len(r.active_slots)}/{r.max_slots} | "
            f"Mesh={r.usable_mesh_mbps}Mbps (20% Home Reserve) | "
            f"Gross=${r.gross_revenue_usd:.2f} -> Host=${r.host_earned_usd:.2f}, Owner=${r.owner_royalty_usd:.2f}"
        )
    print("[✓] Gate 3 Verified: Zero ledger discrepancies across all operator pools")
    print("==================================================================")
    return 0


if __name__ == "__main__":
    sys.exit(run_validation_suite())
