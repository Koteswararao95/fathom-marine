from datetime import date, datetime
import unittest

from maritime_compliance import MaritimeOperationsComplianceSystem


class MaritimeOperationsComplianceSystemTests(unittest.TestCase):
    def setUp(self) -> None:
        self.system = MaritimeOperationsComplianceSystem()
        self.system.register_ship("MV-001")

    def test_ship_status_tracks_overdue_and_completed_items(self) -> None:
        self.system.schedule_maintenance("MV-001", "Engine Inspection", date(2026, 5, 1))
        self.system.schedule_safety_drill("MV-001", "Fire Drill", date(2026, 5, 2))
        self.system.add_compliance_requirement("MV-001", "SOLAS Audit", date(2026, 5, 3))

        self.system.complete_maintenance("MV-001", "Engine Inspection", date(2026, 5, 1))
        self.system.complete_safety_drill("MV-001", "Fire Drill", date(2026, 5, 2))

        status = self.system.ship_status("MV-001", as_of=date(2026, 5, 10))

        self.assertEqual(status["maintenance"]["completed"], 1)
        self.assertEqual(status["drills"]["completed"], 1)
        self.assertEqual(status["compliance"]["overdue"], 1)
        self.assertEqual(status["overdue_total"], 1)

    def test_log_crew_activity_updates_activity_count(self) -> None:
        self.system.log_crew_activity(
            "MV-001",
            crew_member_id="C-21",
            activity_type="Watchkeeping",
            details="Bridge watch shift",
            timestamp=datetime(2026, 5, 10, 8, 30, 0),
        )

        status = self.system.ship_status("MV-001", as_of=date(2026, 5, 10))
        self.assertEqual(status["crew_activity_count"], 1)

    def test_fleet_compliance_score_uses_due_items_only(self) -> None:
        self.system.schedule_maintenance("MV-001", "Hull Check", date(2026, 5, 1))
        self.system.add_compliance_requirement("MV-001", "ISM Review", date(2026, 5, 20))
        self.system.complete_maintenance("MV-001", "Hull Check", date(2026, 5, 2))

        self.assertEqual(self.system.fleet_compliance_score(as_of=date(2026, 5, 10)), 100.0)

    def test_unregistered_ship_raises_error(self) -> None:
        with self.assertRaises(ValueError):
            self.system.ship_status("UNKNOWN", as_of=date(2026, 5, 10))


if __name__ == "__main__":
    unittest.main()
